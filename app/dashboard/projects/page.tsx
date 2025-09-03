"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/contexts/SessionContext";
import { useDashboardData } from "@/lib/dashboard-context";
import { toast } from "sonner";

import { Plus, Folder, Calendar, ChevronRight, X, DollarSign, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { OnboardingCoachmark } from "@/components/onboarding/OnboardingCoachmark";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Project = { 
	id: string; 
	name: string; 
	description?: string;
	price_type?: 'hourly' | 'fixed';
	price?: number;
	deadline?: string;
	status?: 'planning' | 'in-progress' | 'completed';
	created_at?: string;
	user_email?: string;
};

type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: { message?: string } };
type ApiEnvelope<T> = Ok<T> | Err;

async function api<T>(url: string, init?: RequestInit, user?: { getIdToken: () => Promise<string> }): Promise<T> {
	const headers: Record<string, string> = { "Content-Type": "application/json" };
	if (init?.headers) {
		Object.assign(headers, init.headers);
	}
	
	// Add Firebase auth token if user is available
	if (user) {
		try {
			const token = await user.getIdToken();
			headers["Authorization"] = `Bearer ${token}`;
		} catch (err) {
			console.error("Failed to get Firebase token:", err);
		}
	}
	
	const res = await fetch(url, { ...init, headers });
	const json = (await res.json()) as ApiEnvelope<T>;
	if (!("ok" in json) || json.ok === false) {
		const msg = json && "error" in json ? json.error?.message : undefined;
		throw new Error(msg || "Request failed");
	}
	return json.data;
}

export default function ProjectsPage() {
	const { user } = useSession();
	const { } = useOnboarding();
	const qc = useQueryClient();
	// Use optimized dashboard context
	const { data: dashboardData, isLoading: loadingProjects } = useDashboardData();
	const projects = dashboardData?.projects || [];
	
	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price_type: "hourly" as "hourly" | "fixed",
		price: "",
		deadline: "",
	});

	// Generate Proposal modal states
	const [openProposal, setOpenProposal] = useState(false);
	const [generatingProposal, setGeneratingProposal] = useState(false);
	const [generatedProposal, setGeneratedProposal] = useState<string>("");
	const [proposalData, setProposalData] = useState({
		projectName: "",
		clientName: "",
		projectBrief: "",
		priceType: "hourly" as "hourly" | "fixed",
		price: "",
		includeTimeline: true,
		tone: "professional" as "professional" | "friendly" | "technical"
	});

	const { mutate: createProject, isPending: isCreating } = useMutation({
		mutationFn: (data: typeof formData) => api<{ project: Project }>("/api/projects", { 
			method: "POST", 
			body: JSON.stringify({
				...data,
				price: parseFloat(data.price),
				deadline: data.deadline || null,
			}) 
		}, user || undefined).then((d) => d.project),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["projects", "current-user"] });
			qc.invalidateQueries({ queryKey: ["dashboard", "summary"] }); // Also invalidate dashboard summary
			setFormData({ name: "", description: "", price_type: "hourly", price: "", deadline: "" });
			setIsModalOpen(false);
			toast.success("Project created successfully");
		},
		onError: (e: unknown) => toast.error((e as Error).message || "Failed to create project"),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name.trim() || !formData.price.trim()) {
			toast.error("Name and price are required");
			return;
		}
		createProject(formData);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'planning': return 'bg-blue-100 text-blue-700';
			case 'in-progress': return 'bg-yellow-100 text-yellow-700';
			case 'completed': return 'bg-green-100 text-green-700';
			default: return 'bg-slate-100 text-slate-700';
		}
	};

	return (
		<>
			<div className="min-h-screen bg-white">
				{/* Header Section - Consistent with app */}
				<div className="border-b border-slate-100 bg-white">
					<div className="py-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-semibold text-slate-900">Projects</h1>
								<p className="text-slate-600 mt-1">Manage your projects and track their progress</p>
							</div>
							<button
								onClick={() => setOpenProposal(true)}
								className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
							>
								<FileText className="h-4 w-4" />
								Generate Proposal
							</button>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="py-8">

					{loadingProjects ? (
						<div className="text-center py-12">
							<div className="text-slate-500">Loading projects…</div>
						</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{/* Add New Project Card - First */}
							<OnboardingCoachmark
								step={4}
								title="Create Your First Project"
								description="Projects help you organize tasks, track time, and manage client work. Start by creating your first project to see how everything works together."
								actionText="Continue"
								trigger={
																	<div 
									onClick={() => setIsModalOpen(true)}
									className="border-2 border-dashed border-slate-200 p-8 rounded-lg bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-center"
								>
										<div className="text-center">
											<div className="bg-slate-900 text-white p-4 rounded-xl mx-auto mb-4 w-fit group-hover:bg-slate-800 transition-colors">
												<Plus className="h-6 w-6" />
											</div>
											<h3 className="text-lg font-medium text-slate-900 mb-2">New Project</h3>
											<p className="text-slate-600 text-sm">Start a new project to organize your work</p>
										</div>
									</div>
								}
							/>



							{/* Project Cards - Simple and elegant */}
							{projects.map((project: Record<string, unknown>) => (
								<Link key={String(project.id)} href={`/dashboard/projects/${String(project.id)}`} className="group">
									<div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg hover:border-slate-300 transition-all duration-200">
										<div className="flex items-start justify-between mb-4">
											<div className="bg-slate-100 p-2 rounded-lg">
												<Folder className="h-5 w-5 text-slate-600" />
											</div>
											<span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(String(project.status || 'planning'))}`}>
												{String(project.status || 'planning').replace('-', ' ')}
											</span>
										</div>
										
										<h3 className="font-semibold text-lg text-slate-900 mb-2 group-hover:text-slate-700 transition-colors line-clamp-1">
											{String(project.name)}
										</h3>
										
										{Boolean(project.description) && (
											<p className="text-slate-600 text-sm mb-4 line-clamp-1">
												{String(project.description)}
											</p>
										)}
										
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<div className="flex items-center text-sm text-slate-500">
													<DollarSign className="h-4 w-4 mr-2" />
													<span>Rate</span>
												</div>
												<span className="text-sm font-semibold text-slate-900">
													${Number(project.price || 0)}{(project.price_type || 'hourly') === 'hourly' ? '/hr' : ''}
												</span>
											</div>
											
											{Boolean(project.deadline) && (
												<div className="flex items-center justify-between">
													<div className="flex items-center text-sm text-slate-500">
														<Calendar className="h-4 w-4 mr-2" />
														<span>Deadline</span>
													</div>
													<span className="text-sm font-medium text-slate-700">
														{new Date(String(project.deadline)).toLocaleDateString()}
													</span>
												</div>
											)}
											
											<div className="flex items-center justify-between">
												<div className="flex items-center text-sm text-slate-500">
													<Clock className="h-4 w-4 mr-2" />
													<span>Created</span>
												</div>
												<span className="text-sm text-slate-500">
													{project.created_at ? new Date(String(project.created_at)).toLocaleDateString() : 'Recently'}
												</span>
											</div>
										</div>
										
										<div className="mt-4 pt-4 border-t border-slate-100">
											<div className="flex items-center justify-between">
												<span className="text-xs text-slate-500">Click to view details</span>
												<ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
											</div>
										</div>
									</div>
								</Link>
							))}
							
							{projects.length === 0 && (
								<div className="col-span-full text-center py-16">
									<div className="text-slate-400 mb-4">
										<Folder className="h-12 w-12 mx-auto" />
									</div>
									<h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
									<p className="text-slate-500 text-sm mb-6">Create your first project to get started</p>
									<Button 
										onClick={() => setIsModalOpen(true)}
										className="bg-slate-900 text-white hover:bg-slate-800 transition-colors"
									>
										<Plus className="h-4 w-4 mr-2" />
										Create Project
									</Button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
					<div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
								<button 
									onClick={() => setIsModalOpen(false)}
									className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
								>
									<X className="h-5 w-5 text-slate-500" />
								</button>
							</div>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Project Name *
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
										placeholder="Enter project name"
										className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
										required
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Description
									</label>
									<textarea
										value={formData.description}
										onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
										placeholder="Describe your project (optional)"
										rows={3}
										className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-900 mb-2">
											Price Type *
										</label>
										<select
											value={formData.price_type}
											onChange={(e) => setFormData(prev => ({ ...prev, price_type: e.target.value as "hourly" | "fixed" }))}
											className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
											required
										>
											<option value="hourly">Hourly</option>
											<option value="fixed">Fixed</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-slate-900 mb-2">
											Price * (${formData.price_type === 'hourly' ? 'per hour' : 'total'})
										</label>
										<input
											type="number"
											step="0.01"
											min="0"
											value={formData.price}
											onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
											placeholder="0.00"
											className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-900 mb-2">
										Deadline (Optional)
									</label>
									<input
										type="date"
										value={formData.deadline}
										onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
										className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
									/>
								</div>

								<div className="flex gap-3 pt-4">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
									>
										Cancel
									</button>
																	<button
									type="submit"
									disabled={isCreating || !formData.name.trim() || !formData.price.trim()}
									className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
										{isCreating ? "Creating..." : "Create Project"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Generate Proposal Modal - Using Dialog */}
			<Dialog open={openProposal} onOpenChange={(open) => {
				setOpenProposal(open);
				if (!open) {
					setGeneratedProposal("");
					setProposalData({
						projectName: "",
						clientName: "",
						projectBrief: "",
						priceType: "hourly",
						price: "",
						includeTimeline: true,
						tone: "professional"
					});
				}
			}}>
				<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
					{!generatedProposal ? (
						<>
							<DialogHeader>
								<DialogTitle>Generate Proposal</DialogTitle>
								<p className="text-slate-600 text-sm">Create a professional proposal for your client</p>
							</DialogHeader>

								{/* Form Content */}
								<div className="overflow-y-auto max-h-[calc(90vh-160px)]">
									<div className="grid md:grid-cols-2 gap-6">
										{/* Left Column - Project Details */}
										<div className="space-y-4">
											<div>
												<h3 className="text-lg font-medium text-slate-900 mb-4">Project Details</h3>
												
												<div className="space-y-4">
													<div>
														<label className="block text-sm font-medium text-slate-700 mb-2">
															Project Name *
														</label>
														<input
															type="text"
															value={proposalData.projectName}
															onChange={(e) => setProposalData({...proposalData, projectName: e.target.value})}
															placeholder="e.g. E-commerce Website Development"
															className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
														/>
													</div>
													
													<div>
														<label className="block text-sm font-medium text-slate-700 mb-2">
															Client Name *
														</label>
														<input
															type="text"
															value={proposalData.clientName}
															onChange={(e) => setProposalData({...proposalData, clientName: e.target.value})}
															placeholder="e.g. ABC Company"
															className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
														/>
													</div>
													
													<div>
														<label className="block text-sm font-medium text-slate-700 mb-2">
															Project Brief *
														</label>
														<textarea
															value={proposalData.projectBrief}
															onChange={(e) => setProposalData({...proposalData, projectBrief: e.target.value})}
															placeholder="Describe the project scope, objectives, and key requirements..."
															rows={6}
															className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
														/>
													</div>
												</div>
											</div>
										</div>

										{/* Right Column - Pricing & Options */}
										<div className="space-y-4">
											<div>
												<h3 className="text-lg font-medium text-slate-900 mb-4">Pricing & Options</h3>
												
												<div className="space-y-4">
													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className="block text-sm font-medium text-slate-700 mb-2">
																Price Type *
															</label>
															<select
																value={proposalData.priceType}
																onChange={(e) => setProposalData({...proposalData, priceType: e.target.value as "hourly" | "fixed"})}
																className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
															>
																<option value="hourly">Hourly Rate</option>
																<option value="fixed">Fixed Price</option>
															</select>
														</div>
														
														<div>
															<label className="block text-sm font-medium text-slate-700 mb-2">
																Price * (${proposalData.priceType === 'hourly' ? 'per hour' : 'total'})
															</label>
															<input
																type="number"
																step="0.01"
																min="0"
																value={proposalData.price}
																onChange={(e) => setProposalData({...proposalData, price: e.target.value})}
																placeholder="0.00"
																className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
															/>
														</div>
													</div>
													
													<div className="border border-slate-100 rounded-lg p-4 bg-slate-50">
														<h4 className="font-medium text-slate-900 mb-3">Options</h4>
														<div className="space-y-3">
															<div className="flex items-center gap-3">
																<input
																	type="checkbox"
																	id="includeTimeline"
																	checked={proposalData.includeTimeline}
																	onChange={(e) => setProposalData({...proposalData, includeTimeline: e.target.checked})}
																	className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
																/>
																<label htmlFor="includeTimeline" className="text-sm text-slate-700">
																	Include timeline estimates
																</label>
															</div>
														</div>
													</div>
													
													<div>
														<label className="block text-sm font-medium text-slate-700 mb-2">
															Tone
														</label>
														<select
															value={proposalData.tone}
															onChange={(e) => setProposalData({...proposalData, tone: e.target.value as "professional" | "friendly" | "technical"})}
															className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
														>
															<option value="professional">Professional</option>
															<option value="friendly">Friendly</option>
															<option value="technical">Technical</option>
														</select>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Footer */}
								<div className="border-t border-slate-100 pt-4 flex gap-3">
									<button
										onClick={() => {
											setOpenProposal(false);
											setGeneratedProposal("");
											setProposalData({
												projectName: "",
												clientName: "",
												projectBrief: "",
												priceType: "hourly",
												price: "",
												includeTimeline: true,
												tone: "professional"
											});
										}}
										className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={async () => {
											if (!proposalData.projectName.trim() || !proposalData.clientName.trim() || !proposalData.projectBrief.trim() || !proposalData.price) {
												toast.error("Please fill in all required fields");
												return;
											}
											
											try {
												setGeneratingProposal(true);
												
												// Generate proposal content directly on frontend for better formatting
												const generatedContent = generateProposalContent(proposalData);
												setGeneratedProposal(generatedContent);
												toast.success("Proposal generated successfully!");
											} catch {
												toast.error("Failed to generate proposal");
											} finally {
												setGeneratingProposal(false);
											}
										}}
										disabled={generatingProposal || !proposalData.projectName.trim() || !proposalData.clientName.trim() || !proposalData.projectBrief.trim() || !proposalData.price}
										className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{generatingProposal ? (
											<span className="inline-flex items-center gap-2">
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
												Generating...
											</span>
										) : (
											"Generate Proposal"
										)}
									</button>
								</div>
							</>
						) : (
							<>
								<DialogHeader>
									<DialogTitle>Generated Proposal</DialogTitle>
									<p className="text-slate-600 text-sm">Ready to send to {proposalData.clientName}</p>
								</DialogHeader>
								
								<div className="overflow-y-auto max-h-[calc(90vh-160px)]">
									<div className="bg-slate-50 border border-slate-100 rounded-lg p-6">
										<div 
											className="prose prose-slate max-w-none text-sm leading-relaxed"
											dangerouslySetInnerHTML={{ __html: formatProposalContent(generatedProposal) }}
										/>
									</div>
								</div>

								<div className="border-t border-slate-100 pt-4 flex gap-3">
									<button
										onClick={() => setGeneratedProposal("")}
										className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
									>
										Edit
									</button>
									<button
										onClick={() => {
											navigator.clipboard.writeText(generatedProposal);
											toast.success("Proposal copied to clipboard!");
										}}
										className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
									>
										Copy
									</button>
									<button
										onClick={() => {
											navigator.clipboard.writeText(generatedProposal);
											toast.success("Proposal copied to clipboard!");
											setOpenProposal(false);
										}}
										className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
									>
										Copy & Close
									</button>
								</div>
							</>
						)}
				</DialogContent>
			</Dialog>
		</>
	);
}

// Generate proposal content function
function generateProposalContent(data: {
	projectName: string;
	clientName: string;
	projectBrief: string;
	priceType: "hourly" | "fixed";
	price: string;
	includeTimeline: boolean;
	tone: "professional" | "friendly" | "technical";
}) {
	const { projectName, clientName, projectBrief, priceType, price, includeTimeline, tone } = data;
	
	// Tone-based greetings
	const greetings = {
		professional: `Dear ${clientName} Team,`,
		friendly: `Hello ${clientName}!`,
		technical: `${clientName} Project Stakeholders,`
	};

	const closings = {
		professional: "We look forward to the opportunity to work with you on this exciting project.\n\nBest regards,",
		friendly: "I'm excited about the possibility of working together on this project!\n\nBest wishes,",
		technical: "Please review the specifications outlined above and let me know if you have any questions.\n\nRegards,"
	};

	let content = `${greetings[tone]}\n\n`;
	
	content += `## Project Proposal: ${projectName}\n\n`;
	
	content += `### Project Overview\n\n`;
	content += `${projectBrief}\n\n`;
	
	content += `### What You'll Get\n\n`;
	content += `• **Professional Development**: High-quality code following industry best practices\n`;
	content += `• **Regular Updates**: Consistent communication throughout the development process\n`;
	content += `• **Responsive Design**: Your project will work perfectly on all devices\n`;
	content += `• **Clean Code**: Well-documented, maintainable codebase\n`;
	content += `• **Testing**: Thorough testing to ensure everything works flawlessly\n`;
	content += `• **Support**: Post-launch support to address any questions or issues\n\n`;

	if (includeTimeline) {
		content += `### Timeline\n\n`;
		content += `• **Project Kickoff**: Within 1-2 business days of agreement\n`;
		content += `• **Development Phase**: 2-4 weeks depending on project complexity\n`;
		content += `• **Review & Revisions**: 1 week for feedback and refinements\n`;
		content += `• **Final Delivery**: Complete project with documentation\n\n`;
	}

	content += `### Investment\n\n`;
	if (priceType === "hourly") {
		content += `• **Hourly Rate**: $${price}/hour\n`;
		content += `• **Estimated Time**: 40-80 hours (depending on requirements)\n`;
		content += `• **Estimated Total**: $${(Number(price) * 60).toFixed(0)} - $${(Number(price) * 80).toFixed(0)}\n`;
	} else {
		content += `• **Fixed Price**: $${price}\n`;
		content += `• **Payment Schedule**: 50% upfront, 50% on completion\n`;
	}
	content += `• **No Hidden Fees**: The quoted price includes everything mentioned above\n\n`;

	content += `### Why Choose Me\n\n`;
	content += `• **Experience**: Proven track record in delivering successful projects\n`;
	content += `• **Communication**: Regular updates and transparent communication\n`;
	content += `• **Quality Focus**: Attention to detail and commitment to excellence\n`;
	content += `• **Reliability**: On-time delivery and professional service\n\n`;

	content += `### Next Steps\n\n`;
	content += `1. **Review this proposal** and let me know if you have any questions\n`;
	content += `2. **Schedule a brief call** to discuss any specific requirements\n`;
	content += `3. **Sign the agreement** and we can get started immediately\n\n`;

	content += closings[tone];

	return content;
}

// Format proposal content for display
function formatProposalContent(content: string) {
	return content
		.replace(/\n\n/g, '</p><p>')
		.replace(/\n/g, '<br/>')
		.replace(/^/, '<p>')
		.replace(/$/, '</p>')
		.replace(/## (.*?)<br\/>/g, '<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">$1</h2>')
		.replace(/### (.*?)<br\/>/g, '<h3 class="text-xl font-semibold text-slate-900 mt-6 mb-3">$1</h3>')
		.replace(/• (.*?)<br\/>/g, '<li class="ml-4">$1</li>')
		.replace(/(<li.*?<\/li>)/g, '<ul class="space-y-2 mb-4 list-disc list-inside">$1</ul>')
		.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
}
