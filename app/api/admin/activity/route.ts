import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/api/_helpers/route";
import { handleError } from "@/lib/errors";
import { adminSdk } from "@/lib/auth/firebase-admin";

async function handler(req: NextRequest, { uid }: { userId: string; role: string; uid: string }) {
	try {
		// Check if user is admin from Firebase profile
		const userDoc = await adminSdk.firestore().collection("customers").doc(uid).get();
		
		if (!userDoc.exists) {
			return NextResponse.json({ ok: false, error: { message: "User profile not found" } }, { status: 404 });
		}
		
		const userData = userDoc.data();
		if (!userData?.isAdmin) {
			return NextResponse.json({ ok: false, error: { message: "Unauthorized: Admin access required" } }, { status: 403 });
		}

		// Get real activity data from Firebase and Supabase
		// Real data would be fetched here
		
		// Get all users from Firebase to map UIDs to emails
		const usersSnapshot = await adminSdk.firestore().collection("customers").get();
		const userMap = new Map();
		usersSnapshot.forEach((doc) => {
			const data = doc.data();
			if (data.email) {
				userMap.set(doc.id, data.email);
			}
		});
		
		// Get time filter from query params
		const url = new URL(req.url);
		const timeFilter = url.searchParams.get("timeFilter") || "24h";
		
		// Calculate time window based on filter
		let timeAgo: Date;
		switch (timeFilter) {
			case "1h":
				timeAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
				break;
			case "7d":
				timeAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "30d":
				timeAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
				break;
			default: // "24h"
				timeAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		}
		
		const timeAgoISO = timeAgo.toISOString();
		// Use admin access for Supabase
		const { createClient } = await import("@supabase/supabase-js");
		const supabaseAdmin = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		);
		
		const [projectsResult, invoicesResult] = await Promise.all([
			supabaseAdmin.from("projects")
				.select("id, name, user_email, created_at, status")
				.gte("created_at", timeAgoISO)
				.order("created_at", { ascending: false })
				.limit(50),
			supabaseAdmin.from("invoices")
				.select("id, invoice_number, user_email, generated_at, total_amount, status")
				.gte("generated_at", timeAgoISO)
				.order("generated_at", { ascending: false })
				.limit(50),
		]);
		
		const activities = [];
		let activityId = 1;
		
		// Add project activities
		if (projectsResult.data) {
			for (const project of projectsResult.data) {
				activities.push({
					id: activityId++,
					userId: "unknown", // We don't have user ID mapping from email in Supabase
					userEmail: project.user_email,
					action: "project_created",
					actionLabel: "Created project",
					target: project.name,
					targetId: project.id,
					timestamp: project.created_at,
					metadata: {
						status: project.status
					}
				});
			}
		}
		
		// Add invoice activities
		if (invoicesResult.data) {
			for (const invoice of invoicesResult.data) {
				activities.push({
					id: activityId++,
					userId: "unknown",
					userEmail: invoice.user_email,
					action: invoice.status === "paid" ? "payment_received" : "invoice_generated",
					actionLabel: invoice.status === "paid" ? "Payment received" : "Generated invoice",
					target: invoice.invoice_number,
					targetId: invoice.id,
					timestamp: invoice.generated_at,
					metadata: {
						amount: parseFloat(invoice.total_amount || "0"),
						status: invoice.status
					}
				});
			}
		}
		
		// Add user registration activities from Firebase (recent users)
		usersSnapshot.forEach((doc) => {
			const data = doc.data();
			if (data.createdAt) {
				const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
				
				if (createdAt > timeAgo) {
					activities.push({
						id: activityId++,
						userId: doc.id,
						userEmail: data.email || "unknown",
						action: "user_registered",
						actionLabel: "Registered account",
						target: "New user signup",
						targetId: doc.id,
						timestamp: createdAt.toISOString(),
						metadata: {
							onboardingStep: data.onboardingStep || 0,
							plan: data.plan || "free"
						}
					});
				}
			}
		});
		
		// Sort by timestamp (most recent first)
		activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
		
		// Limit to 100 most recent activities
		const recentActivities = activities.slice(0, 100);

		// Return just the data - withAuth will wrap it
		return recentActivities;

	} catch (error) {
		return handleError(error);
	}
}

export const GET = withAuth(handler as (req: Request, session: Record<string, unknown>) => Promise<Response>);
