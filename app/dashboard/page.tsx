"use client";

import { Button } from "@/components/ui/Button";
import { useSession } from "@/contexts/SessionContext";
import { useDashboardData } from "@/lib/dashboard-context";
import { useState, useEffect } from "react";
import { perf } from "@/lib/performance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Clock,
  Star,
  ChevronRight,
  Folder,
  FileText,
  Activity,
  Timer,
  Target,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { OnboardingCoachmark } from "@/components/onboarding/OnboardingCoachmark";





// Pro tips array - rotated randomly on each page load
const PRO_TIPS = [
	{
		title: "Time Tracking",
		content: "Track your time consistently to better estimate future projects and optimize your hourly rate."
	},
	{
		title: "Project Planning",
		content: "Break large projects into smaller tasks. This makes progress visible and helps with accurate billing."
	},
	{
		title: "Client Communication",
		content: "Send regular project updates to clients. Good communication prevents scope creep and builds trust."
	},
	{
		title: "Invoice Management",
		content: "Send invoices immediately after completing milestones. Faster invoicing leads to faster payments."
	},
	{
		title: "Rate Strategy",
		content: "Review and adjust your hourly rate quarterly based on your skill growth and market demand."
	},
	{
		title: "Task Organization",
		content: "Use the Kanban board to visualize your workflow. Move tasks through Todo, In Progress, and Done columns."
	},
	{
		title: "Client Portal",
		content: "Share project progress with clients using the portal feature. Transparency increases client satisfaction."
	},
	{
		title: "Deadline Management",
		content: "Set realistic deadlines and add buffer time for revisions. Under-promise and over-deliver."
	},
	{
		title: "Skill Development",
		content: "Continuously update your skills list in your profile. New skills justify higher rates."
	},
	{
		title: "Work-Life Balance",
		content: "Set clear working hours and stick to them. Boundaries prevent burnout and maintain quality work."
	},
	{
		title: "Portfolio Building",
		content: "Document your best work in project descriptions. A strong portfolio attracts premium clients."
	},
	{
		title: "Payment Terms",
		content: "Establish clear payment terms upfront. Consider requiring deposits for larger projects."
	}
];

export default function DashboardHome() {
	const { user } = useSession();
	const { data: dashboardData } = useDashboardData();
	
	useEffect(() => {
		perf.markFirstPaint('dashboard');
	}, []);
	
	const [avatarUrl, setAvatarUrl] = useState<string>("");
	const [name, setName] = useState("");
	
	// Get random pro tip on component mount
	const [currentTip] = useState(() => {
		return PRO_TIPS[Math.floor(Math.random() * PRO_TIPS.length)];
	});

	// Extract data from context
	const projects = dashboardData?.projects || [];
	const invoices = dashboardData?.invoices || [];
	const stats = dashboardData?.stats;

	// Load user profile data from Firestore
	useEffect(() => {
		if (!user) return;
		const loadProfile = async () => {
			try {
				const { getFirestore, doc, getDoc } = await import("firebase/firestore");
				const db = getFirestore();
				const docSnap = await getDoc(doc(db, "customers", user.uid));
				if (docSnap.exists()) {
					const data = docSnap.data();
					setName(data.name || "");
					setAvatarUrl(data.avatarUrl || user.photoURL || "");
				}
			} catch (error) {
				console.error("Error loading profile:", error);
			}
		};
		loadProfile();
	}, [user]);

	// Use pre-calculated stats from context
	const activeProjects = stats?.activeProjects || 0;
	const completedProjects = stats?.completedProjects || 0;
	const totalEarnings = stats?.totalEarnings || 0;
	const totalHours = stats?.totalHours || 0;

	return (
		<div className="min-h-screen bg-white">
			{/* Header Section - Full Width */}
			<div className="border-b border-slate-100 bg-white">
				<div className="py-6">
					{/* Hidden Onboarding Stepper - Progress shown in modals only */}

					<div className="flex items-center justify-between">
						<OnboardingCoachmark
							step={0}
							title="Welcome to Flowlancer!"
							description="Let's get you set up with everything you need to manage your freelance business. We'll walk you through setting up your profile, configuring your rates, and creating your first project."
							actionText="Get Started"
							trigger={
								<div className="flex items-center gap-4">
									<Avatar className="h-24 w-24">
										{avatarUrl && <AvatarImage src={avatarUrl} alt={name || "User"} />}
										<AvatarFallback className="bg-slate-100 text-slate-600">
											{name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
										</AvatarFallback>
									</Avatar>
									<div>
										<h1 className="text-3xl font-semibold text-slate-900">
											Welcome back{name ? `, ${name.split(' ')[0]}` : ''}!
										</h1>
										<p className="text-slate-600 mt-1">Here&apos;s your freelance overview</p>
									</div>
								</div>
							}
						/>
						
						<Link href="/dashboard/projects">
							<Button className="bg-slate-50 flex flex-col items-center justify-center border-slate-200 text-dark p-12 rounded-lg hover:bg-emerald-200 hover:text-emerald-700 transition-colors">
								<Plus className="h-12 w-12" />
								<span className="text-xs">New Project</span>
							</Button>
						</Link>
						
					</div>
				</div>
			</div>

			{/* Main Dashboard Content */}
			<div className="py-8">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Active Projects</p>
								<p className="text-2xl font-semibold text-slate-900">{activeProjects}</p>
							</div>
							<div className="p-3 bg-blue-100 rounded-lg">
								<Folder className="h-6 w-6 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Completed</p>
								<p className="text-2xl font-semibold text-slate-900">{completedProjects}</p>
							</div>
							<div className="p-3 bg-green-100 rounded-lg">
								<Star className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Total Earnings</p>
								<p className="text-2xl font-semibold text-slate-900">${totalEarnings.toFixed(2)}</p>
							</div>
							<div className="p-3 bg-green-100 rounded-lg">
								<DollarSign className="h-6 w-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-lg p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-600">Hours Tracked</p>
								<p className="text-2xl font-semibold text-slate-900">
									{totalHours >= 1 
										? `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`.replace(' 0m', '')
										: totalHours >= (1/60)
										? `${Math.round(totalHours * 60)}m`
										: totalHours > 0
										? `${Math.round(totalHours * 3600)}s`
										: '0h'
									}
								</p>
							</div>
							<div className="p-3 bg-purple-100 rounded-lg">
								<Clock className="h-6 w-6 text-purple-600" />
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions & Recent Activity */}
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Left Column - Quick Actions */}
					<div className="lg:col-span-2 space-y-6">
						{/* Quick Actions */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Quick Actions
							</h3>
							<div className="grid md:grid-cols-2 gap-4">
								<Link href="/dashboard/projects" className="group">
									<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group-hover:border-slate-300">
										<div className="flex items-center gap-3 mb-2">
											<div className="p-2 bg-blue-100 rounded-lg">
												<Plus className="h-5 w-5 text-blue-600" />
											</div>
											<h4 className="font-medium text-slate-900">Create Project</h4>
										</div>
										<p className="text-sm text-slate-600">Start a new project and organize your tasks</p>
									</div>
								</Link>

								<Link href="/dashboard/profile" className="group">
									<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group-hover:border-slate-300">
										<div className="flex items-center gap-3 mb-2">
											<div className="p-2 bg-purple-100 rounded-lg">
												<Users className="h-5 w-5 text-purple-600" />
											</div>
											<h4 className="font-medium text-slate-900">Update Profile</h4>
										</div>
										<p className="text-sm text-slate-600">Manage your skills and hourly rate</p>
									</div>
								</Link>

								<Link href="/dashboard/feed" className="group">
									<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group-hover:border-slate-300">
										<div className="flex items-center gap-3 mb-2">
											<div className="p-2 bg-green-100 rounded-lg">
												<Activity className="h-5 w-5 text-green-600" />
											</div>
											<h4 className="font-medium text-slate-900">Share Update</h4>
										</div>
										<p className="text-sm text-slate-600">Connect with the freelancer community</p>
									</div>
								</Link>

								<Link href="/dashboard/invoices" className="group">
									<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 group-hover:border-slate-300">
										<div className="flex items-center gap-3 mb-2">
											<div className="p-2 bg-amber-100 rounded-lg">
												<FileText className="h-5 w-5 text-amber-600" />
											</div>
											<h4 className="font-medium text-slate-900">Create Invoice</h4>
										</div>
										<p className="text-sm text-slate-600">Generate professional invoices</p>
									</div>
								</Link>
							</div>
						</div>

						{/* Recent Projects */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-slate-900 flex items-center gap-2">
									<Folder className="h-5 w-5" />
									Recent Projects
								</h3>
								<Link href="/dashboard/projects" className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
									View all
								</Link>
							</div>
							{projects.length === 0 ? (
								<div className="text-center py-8">
									<div className="text-slate-400 mb-2">
										<Folder className="h-8 w-8 mx-auto" />
									</div>
									<p className="text-sm text-slate-500">No projects yet</p>
									<Link href="/dashboard/projects">
										<Button className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
											Create your first project
										</Button>
									</Link>
								</div>
							) : (
								<div className="space-y-6">
									{projects.slice(0, 3).map((project) => (
										<div key={project.id} className="mb-6 last:mb-0">
											<Link href={`/dashboard/projects/${project.id}`} className="group block">
												<div className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200">
												<div className="flex items-start justify-between">
													<div className="flex-1">
														<div className="flex items-center gap-3 mb-2">
															<div className={`w-3 h-3 rounded-full ${
																project.status === 'completed' ? 'bg-green-500' : 
																project.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'
															}`} />
															<h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
																{project.name}
															</h4>
														</div>
														
														<div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
															<div className="flex items-center gap-1">
																<Target className="h-3 w-3" />
																<span className="capitalize">
																	{project.status === 'completed' ? 'Completed' : 
																	 project.status === 'in-progress' ? 'In Progress' : 'Planning'}
																</span>
															</div>
															{project.price && (
																<div className="flex items-center gap-1">
																	<DollarSign className="h-3 w-3" />
																	<span>
																		${project.price}{project.price_type === 'hourly' ? '/hr' : ''}
																	</span>
																</div>
															)}
															{project.deadline && (
																<div className="flex items-center gap-1">
																	<Calendar className="h-3 w-3" />
																	<span>{new Date(project.deadline).toLocaleDateString()}</span>
																</div>
															)}
														</div>

														{project.description && (
															<p className="text-sm text-slate-600 line-clamp-2 mb-3">
																{project.description}
															</p>
														)}

														<div className="flex items-center justify-between">
															<div className="flex items-center gap-4 text-xs">
																{project.tasks_count !== undefined && (
																	<div className="flex items-center gap-1 text-slate-500">
																		<CheckCircle2 className="h-3 w-3" />
																		<span>{project.completed_tasks || 0}/{project.tasks_count} tasks</span>
																	</div>
																)}
																{project.total_hours !== undefined && project.total_hours > 0 && (
																	<div className="flex items-center gap-1 text-slate-500">
																		<Timer className="h-3 w-3" />
																		<span>
																			{project.total_hours >= 1 
																				? `${Math.floor(project.total_hours)}h ${Math.round((project.total_hours % 1) * 60)}m`.replace(' 0m', '')
																				: project.total_hours >= (1/60)
																				? `${Math.round(project.total_hours * 60)}m`
																				: `${Math.round(project.total_hours * 3600)}s`
																			}
																		</span>
																	</div>
																)}
															</div>
															<ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
														</div>
													</div>
												</div>
												</div>
											</Link>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Right Column - Activity Feed */}
					<div className="space-y-6">
						{/* This Week */}
						<div className="bg-white border border-slate-100 rounded-lg p-6">
							<h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								This Week
							</h3>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm text-slate-600">Projects worked on</span>
									<span className="font-medium text-slate-900">{activeProjects}</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-slate-600">Hours logged</span>
									<span className="font-medium text-slate-900">
										{totalHours >= 1 
											? `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`.replace(' 0m', '')
											: totalHours >= (1/60)
											? `${Math.round(totalHours * 60)}m`
											: totalHours > 0
											? `${Math.round(totalHours * 3600)}s`
											: '0h'
										}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm text-slate-600">Invoices sent</span>
									<span className="font-medium text-slate-900">{invoices.length}</span>
								</div>
							</div>
						</div>

						{/* Pro Tip */}
						<div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6">
							<div className="flex items-start gap-3">
								<div className="p-2 bg-blue-100 rounded-lg">
									<TrendingUp className="h-5 w-5 text-blue-600" />
								</div>
								<div>
									<h4 className="font-medium text-slate-900 mb-2">Pro Tip: {currentTip.title}</h4>
									<p className="text-sm text-slate-700">
										{currentTip.content}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}