import { NextRequest, NextResponse } from "next/server";
import { getRateLimiter } from "@/lib/rate-limit";
import { toPublicError } from "@/lib/errors";
import { compat } from "@/server/compat/flowlancer";

export async function GET(request: NextRequest) {
	try {
		// Rate limiting (optional)
		const rateLimiter = getRateLimiter();
		if (rateLimiter) {
			const identifier = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "anonymous";
			const { success } = await rateLimiter.limit(identifier);
			
			if (!success) {
				return NextResponse.json(
					{ ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
					{ status: 429 }
				);
			}
		}

		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email) {
			return NextResponse.json(
				{ ok: false, error: { code: "MISSING_EMAIL", message: "Email parameter is required" } },
				{ status: 400 }
			);
		}

		// Fetch feedback from compatibility layer
		const feedback = await compat.getClientFeedback(email);

		return NextResponse.json({
			ok: true,
			data: { feedback }
		});

	} catch (error) {
		console.error("Error fetching public feedback:", error);
		return NextResponse.json(
			toPublicError(error),
			{ status: 500 }
		);
	}
}
