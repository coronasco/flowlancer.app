import { NextResponse } from "next/server";
import { getRateLimiter } from "@/lib/rate-limit";
import { toPublicError, AppError } from "@/lib/errors";
import { ensurePermissions, type Permission, type UserRole } from "@/server/modules/users/roles";
import { getFirebaseAdminApp } from "@/lib/auth/firebase-admin";
import { getAuth } from "firebase-admin/auth";

export type Handler<T> = (req: Request, ctx: { userId: string; role: UserRole; uid: string }) => Promise<T>;

async function getSession(req: Request): Promise<{ userId: string; role: UserRole; uid: string } | null> {
	try {
		// Get Firebase ID token from Authorization header
		const authHeader = req.headers.get("authorization");
		if (!authHeader?.startsWith("Bearer ")) {
			return null;
		}
		
		const token = authHeader.substring(7);
		const adminApp = getFirebaseAdminApp();
		const auth = getAuth(adminApp);
		
		const decodedToken = await auth.verifyIdToken(token);
		return { 
			userId: decodedToken.email?.toLowerCase() || decodedToken.uid, 
			role: "owner",
			uid: decodedToken.uid // Add uid separately for Firebase Firestore
		};
	} catch (error) {
		console.error("Auth error:", error);
		return null;
	}
}

export function withAuth<T>(handler: Handler<T>, requiredPermissions?: Permission[]) {
	return async (req: Request) => {
		const session = await getSession(req);
		if (!session) {
			return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }, { status: 401 });
		}
		
		// Check permissions if required
		if (requiredPermissions && requiredPermissions.length > 0) {
			try {
				ensurePermissions(session.role, requiredPermissions);
			} catch {
				return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } }, { status: 403 });
			}
		}
		
		return handler(req, session)
			.then((data) => NextResponse.json({ ok: true, data }))
			.catch(handleError);
	};
}

export function withRateLimit<T>(key: string, handler: () => Promise<T>) {
	return async () => {
		const rl = getRateLimiter();
		if (!rl) {
			// No rate limiter configured, just return the data
			return await handler();
		}
		const { success } = await rl.limit(key);
		if (!success) {
			// Rate limited - throw error to be handled by withAuth
			throw new AppError("Rate limit exceeded. Please try again later.", "RATE_LIMITED", 429);
		}
		// Return just the data, let withAuth handle the wrapping
		return await handler();
	};
}

export function handleError(error: unknown) {
	const pub = toPublicError(error);
	const status = error instanceof AppError ? error.httpStatus : 500;
	return NextResponse.json({ ok: false, error: pub }, { status });
}
