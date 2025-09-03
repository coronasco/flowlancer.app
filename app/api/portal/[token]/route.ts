import { NextRequest, NextResponse } from "next/server";
import { getRateLimiter } from "@/lib/rate-limit";
import { toPublicError } from "@/lib/errors";
import { compat } from "@/server/compat/flowlancer";

export const dynamic = "force-dynamic";

// GET /api/portal/[token] - Get project data for client portal
export async function GET(
	request: NextRequest,
	context: { params: Promise<{ token: string }> }
) {
	try {
		// Rate limiting for portal access
		const rateLimiter = getRateLimiter();
		if (rateLimiter) {
			const identifier = request.headers.get("x-forwarded-for") || 
							  request.headers.get("x-real-ip") || 
							  "anonymous";
			const { success } = await rateLimiter.limit(`portal:${identifier}`);
			
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

		// Get project data
		const project = await compat.getProjectByToken(token);
		
		// Get project comments
		const comments = await compat.getClientComments(token, project.id);
		
		// Get client feedback if project is completed
		let feedback = null;
		if (project.status === 'completed') {
			feedback = await compat.getPortalClientFeedback(token, project.id);
		}

		// Calculate project progress and real time tracked
		const tasks = project.tasks || [];
		const completedTasks = tasks.filter(task => task.status === 'done').length;
		const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

		// Get user ID from email to fetch time entries
		let freelancerUserId = project.freelancer_email; // fallback to email
		try {
			// Try to get Firebase user by email to get the actual userId
			const { getAuth } = await import("firebase-admin/auth");
			const auth = getAuth();
			const userRecord = await auth.getUserByEmail(project.freelancer_email);
			freelancerUserId = userRecord.uid;
		} catch (error) {
			console.error("Could not get Firebase user:", error);
			// fallback to just using email as userId - might not work but won't crash
		}

		// Get REAL project time summary EXACTLY like project page
		const projectTimeSummary = await compat.summarizeProjectTime(freelancerUserId, project.id);
		const projectTotalHours = Math.round((projectTimeSummary.totalSeconds / 3600) * 100) / 100;


		// Calculate actual hours from time_entries for each task EXACTLY like project page
		const tasksWithRealHours = await Promise.all(
			tasks.map(async (task) => {
				try {
					// Get the actual time tracked from time_entries EXACTLY like TaskTimer
					const timeSummary = await compat.summarizeTaskTime(freelancerUserId, task.id);
					const taskTotalHours = Math.round((timeSummary.totalSeconds / 3600) * 100) / 100;

					return {
						...task,
						actual_hours: taskTotalHours,
						totalSeconds: timeSummary.totalSeconds
					};
				} catch (error) {
					console.error(`Error getting time for task ${task.id}:`, error);
					return {
						...task,
						actual_hours: 0,
						totalSeconds: 0
					};
				}
			})
		);

		return NextResponse.json({
			ok: true,
			data: {
				project: {
					...project,
					tasks: tasksWithRealHours,
					progress: progressPercentage,
					totalHours: projectTotalHours, // REAL total hours from time_entries
					tasksCompleted: completedTasks,
					totalTasks: tasksWithRealHours.length,
					totalSeconds: projectTimeSummary.totalSeconds // Raw seconds for precise calculation
				},
				comments,
				feedback,
				canLeaveFeedback: project.status === 'completed' && !feedback
			}
		});

	} catch (error) {
		console.error("Error fetching portal data:", error);
		return NextResponse.json(
			toPublicError(error),
			{ status: 500 }
		);
	}
}
