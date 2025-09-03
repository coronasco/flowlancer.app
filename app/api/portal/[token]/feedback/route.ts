import { NextRequest, NextResponse } from "next/server";
import { getRateLimiter } from "@/lib/rate-limit";
import { toPublicError } from "@/lib/errors";
import { compat } from "@/server/compat/flowlancer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const FeedbackSchema = z.object({
	projectId: z.string().min(1),
	clientName: z.string().min(1).max(100),
	clientEmail: z.string().email().optional(),
	rating: z.number().int().min(1).max(5),
	comment: z.string().max(1000).optional(),
});

// POST /api/portal/[token]/feedback - Add client feedback for completed project
export async function POST(
	request: NextRequest,
	context: { params: Promise<{ token: string }> }
) {
	try {
		// Rate limiting for feedback
		const rateLimiter = getRateLimiter();
		if (rateLimiter) {
			const identifier = request.headers.get("x-forwarded-for") || 
							  request.headers.get("x-real-ip") || 
							  "anonymous";
			const { success } = await rateLimiter.limit(`portal-feedback:${identifier}`);
			
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
		const { projectId, clientName, clientEmail, rating, comment } = FeedbackSchema.parse(body);

		// Check if project is completed
		const project = await compat.getProjectByToken(token);
		if (project.status !== 'completed') {
			return NextResponse.json(
				{ ok: false, error: { code: "PROJECT_NOT_COMPLETED", message: "Feedback can only be submitted for completed projects" } },
				{ status: 400 }
			);
		}

		// Add feedback
		const feedback = await compat.addClientFeedback(
			token,
			projectId,
			clientName,
			clientEmail || null,
			rating,
			comment || null
		);

		return NextResponse.json({
			ok: true,
			data: { feedback }
		});

	} catch (error) {
		console.error("Error adding client feedback:", error);
		
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ ok: false, error: { code: "VALIDATION_ERROR", message: "Invalid input data" } },
				{ status: 400 }
			);
		}
		
		if ((error as Error).message === "Feedback already submitted for this project") {
			return NextResponse.json(
				{ ok: false, error: { code: "FEEDBACK_EXISTS", message: "Feedback has already been submitted for this project" } },
				{ status: 409 }
			);
		}
		
		return NextResponse.json(
			toPublicError(error),
			{ status: 500 }
		);
	}
}
