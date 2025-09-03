import { withAuth } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { perf } from "@/lib/performance";

export const dynamic = "force-dynamic";

export const GET = withAuth(async (_req, { userId }) => {
	try {
		const startTime = Date.now();
		perf.mark('dashboard-summary');
		
		// Fetch core dashboard data in parallel (posts loaded separately for performance)
		const [projects, invoices, profile, clientFeedback] = await Promise.all([
			compat.listProjects(userId),
			compat.listInvoices(userId),
			compat.getUserProfile(userId),
			compat.getAllClientFeedback(userId)
		]);
		
		const duration = Date.now() - startTime;
		perf.logSlowAPI('/api/dashboard/summary', duration);
		perf.measure('dashboard-summary');

		// Calculate KPIs
		const activeProjects = projects.filter(p => p.status !== 'completed').length;
		const completedProjects = projects.filter(p => p.status === 'completed').length;
		
		// Calculate total hours from actual time entries across all projects
		let totalSeconds = 0;
		for (const project of projects) {
			try {
				const projectTimeSummary = await compat.summarizeProjectTime(userId, project.id);
				totalSeconds += projectTimeSummary.totalSeconds || 0;
			} catch (error) {
				console.error(`Error getting time for project ${project.id}:`, error);
			}
		}
		const totalHours = totalSeconds / 3600; // Convert seconds to hours
		
		// Calculate earnings from paid invoices
		const totalEarnings = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => {
			const amount = (inv as { total_amount?: number }).total_amount || 0;
			return sum + Number(amount);
		}, 0);
		const outstandingInvoices = invoices.filter(inv => inv.status === 'pending').length;

		const summary = {
			// Core dashboard data
			projects,
			invoices,
			profile,
			clientFeedback,
			
			// Calculated KPIs
			stats: {
				activeProjects,
				completedProjects,
				totalEarnings,
				totalHours,
				outstandingInvoices,
				averageRating: clientFeedback.length > 0 
					? clientFeedback.reduce((sum, f) => sum + f.rating, 0) / clientFeedback.length 
					: 0
			}
		};

		return summary;
	} catch (error) {
		console.error("Error fetching dashboard summary:", error);
		throw error;
	}
}, ["projects:read", "invoices:read"]);
