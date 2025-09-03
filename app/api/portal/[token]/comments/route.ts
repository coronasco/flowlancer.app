import { NextRequest, NextResponse } from "next/server";
import { getRateLimiter } from "@/lib/rate-limit";
import { toPublicError } from "@/lib/errors";
import { compat } from "@/server/compat/flowlancer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CommentSchema = z.object({
	projectId: z.string().min(1),
	taskId: z.string().nullable().optional(),
	clientName: z.string().min(1).max(100),
	clientEmail: z.string().email().optional(),
	comment: z.string().min(1).max(1000),
});

// POST /api/portal/[token]/comments - Add client comment
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ token: string }> }
) {
	try {
		// Rate limiting for comments
		const rateLimiter = getRateLimiter();
		if (rateLimiter) {
			const identifier = request.headers.get("x-forwarded-for") || 
							  request.headers.get("x-real-ip") || 
							  "anonymous";
			const { success } = await rateLimiter.limit(`portal-comment:${identifier}`);
			
			if (!success) {
				return NextResponse.json(
					{ ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
					{ status: 429 }
				);
			}
		}

		const { token } = await context.params;

		// Validate token
		const tokenValidation = await compat.validatePortalToken(token);
		if (!tokenValidation) {
			return NextResponse.json(
				{ ok: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired portal token" } },
				{ status: 404 }
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const { projectId, taskId, clientName, clientEmail, comment } = CommentSchema.parse(body);

		// Add comment
		const newComment = await compat.addClientComment(
			token,
			projectId,
			taskId || null,
			clientName,
			clientEmail || null,
			comment
		);

		return NextResponse.json({
			ok: true,
			data: { comment: newComment }
		});

	} catch (error) {
		console.error("Error adding client comment:", error);
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid input data" } },
				{ status: 400 }
			);
		}
		
		return NextResponse.json(
			toPublicError(error),
			{ status: 500 }
		);
	}
}

// GET /api/portal/[token]/comments?taskId=... - Get comments for task or project
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ token: string }> }
) {
	try {
		const { token } = await context.params;
		const { searchParams } = new URL(request.url);
		const taskId = searchParams.get("taskId");
		const projectId = searchParams.get("projectId");

		if (!projectId) {
			return NextResponse.json(
				{ ok: false, error: { code: "MISSING_PROJECT_ID", message: "Project ID is required" } },
				{ status: 400 }
			);
		}

		// Validate token
		const tokenValidation = await compat.validatePortalToken(token);
		if (!tokenValidation) {
			return NextResponse.json(
				{ ok: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired portal token" } },
				{ status: 404 }
			);
		}

		// Get comments
		const comments = await compat.getClientComments(token, projectId, taskId || undefined);

		return NextResponse.json({
			ok: true,
			data: { comments }
		});

	} catch (error) {
		console.error("Error fetching client comments:", error);
		return NextResponse.json(
			toPublicError(error),
			{ status: 500 }
		);
	}
}
