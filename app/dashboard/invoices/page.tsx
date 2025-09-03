"use client";

import { useSession } from "@/contexts/SessionContext";
import { useDashboardData } from "@/lib/dashboard-context";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { OnboardingCoachmark } from "@/components/onboarding/OnboardingCoachmark";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Folder, FileText, DollarSign } from "lucide-react";

type Invoice = { 
  id: string; 
  project_id: string; 
  user_email: string; 
  invoice_number: string; 
  client_name: string; 
  total_amount: number; 
  status: "pending" | "paid" | "overdue" | "cancelled"; 
  generated_at: string; 
};

type Project = {
  id: string;
  name: string;
  description?: string;
  status?: string;
};

export default function InvoicesPage() {
  const { } = useSession();
  const { } = useOnboarding();
	
	// Use optimized dashboard context
	const { data: dashboardData, isLoading } = useDashboardData();
	const invoices = dashboardData?.invoices || [];
	const projects = dashboardData?.projects || [];

	// Group invoices by project
	const groupedInvoices = invoices.reduce((acc, invoice) => {
		const project = projects.find(p => p.id === invoice.project_id);
		const projectKey = project?.id || 'unknown';
		
		if (!acc[projectKey]) {
			acc[projectKey] = {
				project,
				invoices: []
			};
		}
		acc[projectKey].invoices.push(invoice);
		return acc;
	}, {} as Record<string, { project?: Project; invoices: Invoice[] }>);

	// Sort projects by most recent invoice
	const sortedProjectGroups = Object.entries(groupedInvoices).sort(([, a], [, b]) => {
		const aLatest = Math.max(...a.invoices.map(i => new Date(i.generated_at).getTime()));
		const bLatest = Math.max(...b.invoices.map(i => new Date(i.generated_at).getTime()));
		return bLatest - aLatest;
	});

	return (
		<div className="min-h-screen bg-white">
			{/* Header Section - Full Width */}
			<div className="border-b border-slate-100 bg-white">
				<div className="py-6">
					<div className="flex items-center justify-between">
						<OnboardingCoachmark
							step={5}
							title="Professional Invoicing"
							description="Create professional invoices from your projects with time tracking and automated calculations. This helps you get paid faster and maintain professional relationships with clients."
							actionText="Complete Setup!"
							trigger={
								<div>
									<h1 className="text-3xl font-semibold text-slate-900">Invoices</h1>
									<p className="text-slate-600 mt-1">Manage and track your project invoices</p>
								</div>
							}
						/>
						<div className="text-sm text-slate-500">
							{isLoading ? "Loading…" : `${invoices.length} total invoices`}
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="py-8">
				{isLoading && (
					<div className="space-y-8">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="space-y-4">
								<div className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded-lg" />
									<Skeleton className="h-6 w-32" />
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-11">
									{Array.from({ length: 2 }).map((_, j) => (
										<div key={j} className="border border-slate-100 p-4 rounded-lg bg-slate-50/30">
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<Skeleton className="h-4 w-16" />
													<Skeleton className="h-5 w-14 rounded" />
												</div>
												<Skeleton className="h-4 w-24" />
												<Skeleton className="h-3 w-20" />
											</div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}

				{!isLoading && sortedProjectGroups.length > 0 && (
					<div className="space-y-8">
						{sortedProjectGroups.map(([projectId, { project, invoices: projectInvoices }]) => {
							const totalAmount = projectInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
							const paidAmount = projectInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0);
							const pendingCount = projectInvoices.filter(inv => inv.status === 'pending').length;

							return (
								<div key={projectId} className="space-y-4">
									{/* Project Header */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="bg-slate-100 p-2 rounded-lg">
												<Folder className="h-4 w-4 text-slate-600" />
											</div>
											<div>
												<h2 className="text-lg font-semibold text-slate-900">
													{project?.name || 'Unknown Project'}
												</h2>
												<div className="flex items-center gap-4 text-sm text-slate-500">
													<span>{projectInvoices.length} invoice{projectInvoices.length !== 1 ? 's' : ''}</span>
													<span>•</span>
													<span className="flex items-center gap-1">
														<DollarSign className="h-3 w-3" />
														${totalAmount.toFixed(2)} total
													</span>
													{paidAmount > 0 && (
														<>
															<span>•</span>
															<span className="text-green-600">${paidAmount.toFixed(2)} paid</span>
														</>
													)}
													{pendingCount > 0 && (
														<>
															<span>•</span>
															<span className="text-blue-600">{pendingCount} pending</span>
														</>
													)}
												</div>
											</div>
										</div>
										{project && (
											<Link 
												href={`/dashboard/projects/${project.id}`}
												className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
											>
												View Project →
											</Link>
										)}
									</div>

									{/* Project Invoices Grid */}
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ml-11">
										{projectInvoices.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()).map((inv) => (
											<Link key={inv.id} href={`/dashboard/invoices/${inv.id}`} className="group">
												<div className="border border-slate-100 p-4 rounded-lg bg-white hover:shadow-md transition-all duration-200">
													<div className="flex items-start justify-between mb-3">
														<div className="bg-slate-100 p-1.5 rounded">
															<FileText className="h-3 w-3 text-slate-600" />
														</div>
														<span className={`px-2 py-1 rounded text-xs font-medium ${
															inv.status === 'paid' ? 'bg-green-100 text-green-700' :
															inv.status === 'pending' ? 'bg-blue-100 text-blue-700' :
															inv.status === 'cancelled' ? 'bg-slate-100 text-slate-700' :
															'bg-red-100 text-red-700'
														}`}>
															{inv.status}
														</span>
													</div>
													
													<h3 className="font-medium text-slate-900 mb-2 text-sm">
														#{inv.invoice_number}
													</h3>
													
													<div className="space-y-1">
														<div className="flex items-center justify-between text-xs">
															<span className="text-slate-500">Client</span>
															<span className="font-medium text-slate-900 truncate ml-2">{inv.client_name}</span>
														</div>
														<div className="flex items-center justify-between text-xs">
															<span className="text-slate-500">Amount</span>
															<span className="font-semibold text-slate-900">${inv.total_amount.toFixed(2)}</span>
														</div>
														<div className="flex items-center justify-between text-xs">
															<span className="text-slate-500">Date</span>
															<span className="text-slate-600">{new Date(inv.generated_at).toLocaleDateString()}</span>
														</div>
													</div>
													
													<div className="mt-3 pt-3 border-t border-slate-100">
														<div className="flex items-center justify-between">
															<span className="text-xs text-slate-400">View details</span>
															<div className="text-slate-400 group-hover:text-slate-600 transition-colors text-xs">
																→
															</div>
														</div>
													</div>
												</div>
											</Link>
										))}
									</div>
								</div>
							);
						})}
					</div>
				)}
				
				{!isLoading && invoices.length === 0 && (
					<div className="text-center py-16">
						<div className="text-slate-400 mb-4">
							<div className="h-12 w-12 mx-auto bg-slate-100 rounded-lg flex items-center justify-center">
								<FileText className="h-6 w-6" />
							</div>
						</div>
						<h3 className="text-lg font-medium text-slate-900 mb-2">No invoices yet</h3>
						<p className="text-slate-500 text-sm mb-6">Create your first invoice from a project to get started.</p>
						<Link 
							href="/dashboard/projects"
							className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
						>
							<Folder className="h-4 w-4" />
							View Projects
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
