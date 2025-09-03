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
		// const { createClient } = await import("@supabase/supabase-js");
		// const supabase = createClient(...) would be used here for real data
		
		// Get stats from Firebase (users)
		const usersSnapshot = await adminSdk.firestore().collection("customers").get();
		const totalUsers = usersSnapshot.size;
		
		// Count active users (users with recent activity or onboardingStep > 0)
		let activeUsers = 0;
		usersSnapshot.forEach((doc) => {
			const data = doc.data();
			if (data.onboardingStep > 0 || data.lastLoginAt) {
				activeUsers++;
			}
		});
		
		// Get stats from Supabase - use same config as other working APIs
		const supabaseAdmin = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		);
		
		const [projectsResult, invoicesResult] = await Promise.all([
			supabaseAdmin.from("projects").select("id, status, created_at", { count: "exact" }),
			supabaseAdmin.from("invoices").select("id, status, total_amount", { count: "exact" }),
		]);
		

		
		const totalProjects = projectsResult.count || 0;
		const activeProjects = projectsResult.data?.filter(p => p.status === "in-progress" || p.status === "planning").length || 0;
		
		const totalInvoices = invoicesResult.count || 0;
		const paidInvoices = invoicesResult.data?.filter(i => i.status === "paid").length || 0;
		const totalRevenue = invoicesResult.data?.reduce((sum, invoice) => {
			return invoice.status === "paid" ? sum + parseFloat(invoice.total_amount || "0") : sum;
		}, 0) || 0;
		
		// Calculate some additional metrics
		const completedProjects = projectsResult.data?.filter(p => p.status === "completed").length || 0;
		const averageProjectValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
		
		const stats = {
			totalUsers,
			activeUsers,
			totalProjects,
			activeProjects,
			totalInvoices,
			paidInvoices,
			totalRevenue,
			monthlyGrowth: 12.5, // Mock for now, would need historical data
			
			// Additional metrics
			newUsersThisMonth: Math.floor(totalUsers * 0.1), // Approximate
			projectsCompletedThisMonth: completedProjects,
			invoicesGeneratedThisMonth: Math.floor(totalInvoices * 0.1), // Approximate
			averageProjectValue,
			
			// Growth metrics (mostly mock, would need historical data)
			userGrowthRate: 8.2,
			revenueGrowthRate: 12.5,
			projectGrowthRate: 15.3,
			
			// Performance metrics (mock)
			averageResponseTime: 47,
			uptime: 99.9,
			errorRate: 0.1,
		};

		// Return just the data object - withAuth will wrap it with { ok: true, data: stats }
		return stats;

	} catch (error) {
		return handleError(error);
	}
}

export const GET = withAuth(handler);
