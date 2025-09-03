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

		// Get real data from Firebase and Supabase
		// Real data would be fetched here
		
		// Get all users from Firebase
		const usersSnapshot = await adminSdk.firestore().collection("customers").get();
		
		// Get projects and invoices count per user from Supabase using admin access
		const { createClient } = await import("@supabase/supabase-js");
		const supabaseAdmin = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		);
		
		const [projectsResult, invoicesResult] = await Promise.all([
			supabaseAdmin.from("projects").select("user_email, status"),
			supabaseAdmin.from("invoices").select("user_email, total_amount, status"),
		]);
		
		// Create maps for quick lookup
		const projectsPerUser = new Map();
		const invoicesPerUser = new Map();
		const revenuePerUser = new Map();
		
		// Count projects per user
		if (projectsResult.data) {
			projectsResult.data.forEach((project: Record<string, unknown>) => {
				const email = project.user_email;
				if (!projectsPerUser.has(email)) {
					projectsPerUser.set(email, 0);
				}
				projectsPerUser.set(email, projectsPerUser.get(email) + 1);
			});
		}
		
		// Count invoices and revenue per user
		if (invoicesResult.data) {
			invoicesResult.data.forEach((invoice: Record<string, unknown>) => {
				const email = invoice.user_email;
				
				// Count invoices
				if (!invoicesPerUser.has(email)) {
					invoicesPerUser.set(email, 0);
				}
				invoicesPerUser.set(email, invoicesPerUser.get(email) + 1);
				
				// Calculate revenue (only paid invoices)
				if (invoice.status === "paid") {
					if (!revenuePerUser.has(email)) {
						revenuePerUser.set(email, 0);
					}
					revenuePerUser.set(email, revenuePerUser.get(email) + parseFloat(String(invoice.total_amount) || "0"));
				}
			});
		}
		
		// Build users array from Firebase data
		const users: Record<string, unknown>[] = [];
		usersSnapshot.forEach((doc) => {
			const userData = doc.data();
			const email = userData.email || "unknown";
			
			// Determine status based on recent activity
			const lastLoginAt = userData.lastLoginAt;
			const oneDayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
			let status = "active";
			
			if (lastLoginAt) {
				const lastLogin = lastLoginAt.toDate ? lastLoginAt.toDate() : new Date(lastLoginAt);
				status = lastLogin > oneDayAgo ? "active" : "inactive";
			} else {
				status = userData.onboardingStep > 0 ? "active" : "inactive";
			}
			
			// Get created date
			const createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt || Date.now());
			const lastActive = lastLoginAt?.toDate ? lastLoginAt.toDate() : createdAt;
			
			users.push({
				id: doc.id,
				email: email,
				name: userData.name || userData.displayName || "Unknown User",
				role: userData.bio || userData.title || "Freelancer",
				plan: userData.plan || "free",
				createdAt: createdAt.toISOString(),
				lastActive: lastActive.toISOString(),
				projects: projectsPerUser.get(email) || 0,
				invoices: invoicesPerUser.get(email) || 0,
				totalRevenue: revenuePerUser.get(email) || 0,
				status: status,
				location: userData.location || "Unknown",
				skills: userData.skills || [],
				onboardingStep: userData.onboardingStep || 0,
				isAdmin: userData.isAdmin || false,
			});
		});

		// Calculate summary stats
		const summary = {
			total: users.length,
			active: users.filter(u => u.status === "active").length,
			inactive: users.filter(u => u.status === "inactive").length,
			proUsers: users.filter(u => u.plan === "pro").length,
			freeUsers: users.filter(u => u.plan === "free").length,
			totalRevenue: users.reduce((sum, u) => sum + Number(u.totalRevenue), 0),
			averageRevenue: users.reduce((sum, u) => sum + Number(u.totalRevenue), 0) / users.length,
			newThisMonth: users.filter(u => new Date(String(u.createdAt)) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length
		};

		// Return just the data - withAuth will wrap it
		return { 
			users,
			summary
		};

	} catch (error) {
		return handleError(error);
	}
}

export const GET = withAuth(handler as (req: Request, session: Record<string, unknown>) => Promise<Response>);
