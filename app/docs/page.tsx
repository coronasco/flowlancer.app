import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, User, FolderKanban, Receipt, Clock, DollarSign, Users, BarChart3, Zap, Shield, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
	title: "Documentation - Flowlancer",
	description: "Learn how to use Flowlancer to manage your freelancing business effectively.",
};

export default function DocsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				{/* Header */}
				<div className="mb-8 sm:mb-10 lg:mb-12">
					<Link 
						href="/dashboard" 
						className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="hidden sm:inline">Back to Dashboard</span>
						<span className="sm:hidden">Back</span>
					</Link>
					<div className="text-center">
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 px-2">
							Flowlancer <span className="brand-gradient">Documentation</span>
						</h1>
						<p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-4">
							Everything you need to know about managing your freelancing business with Flowlancer.
						</p>
					</div>
				</div>

				{/* Quick Start */}
				<section className="mb-12 sm:mb-16">
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center sm:text-left">🚀 Quick Start Guide</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
						<Card className="p-4 sm:p-6">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
								<User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">1. Complete Your Profile</h3>
							<p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
								Set up your professional profile with skills, experience, and hourly rates.
							</p>
							<Link href="/dashboard/profile" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
								Go to Profile →
							</Link>
						</Card>

						<Card className="p-4 sm:p-6">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
								<FolderKanban className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">2. Create Your First Project</h3>
							<p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
								Add a new project with tasks, deadlines, and client information.
							</p>
							<Link href="/dashboard/projects" className="text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium">
								Create Project →
							</Link>
						</Card>

						<Card className="p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
							<div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
								<Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
							</div>
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">3. Generate Invoices</h3>
							<p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4">
								Create professional invoices from your completed projects.
							</p>
							<Link href="/dashboard/invoices" className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium">
								View Invoices →
							</Link>
						</Card>
					</div>
				</section>

				{/* Core Features */}
				<section className="mb-12 sm:mb-16">
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 sm:mb-8 text-center sm:text-left">🎯 Core Features</h2>
					
					<div className="space-y-8 sm:space-y-12">
						{/* Dashboard */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
							<div className="order-2 lg:order-1">
								<div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 justify-center lg:justify-start">
									<Home className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
									<h3 className="text-lg sm:text-xl font-semibold text-slate-900">Dashboard Overview</h3>
								</div>
								<p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base text-center lg:text-left px-4 lg:px-0">
									Your central hub showing earnings, active projects, recent activity, and helpful tips for growing your freelance business.
								</p>
								<ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto lg:mx-0">
									<li className="flex items-center gap-2 justify-center lg:justify-start">
										<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
										Total earnings and hours tracked
									</li>
									<li className="flex items-center gap-2 justify-center lg:justify-start">
										<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
										Recent projects with progress
									</li>
									<li className="flex items-center gap-2 justify-center lg:justify-start">
										<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
										Pro tips for freelancers
									</li>
								</ul>
							</div>
							<Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 order-1 lg:order-2">
								<div className="text-center">
									<Home className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-blue-600 mx-auto mb-2 sm:mb-3" />
									<h4 className="font-semibold text-slate-900 mb-1 sm:mb-2 text-sm sm:text-base">Dashboard</h4>
									<p className="text-xs sm:text-sm text-slate-600">Your business overview</p>
								</div>
							</Card>
						</div>

						{/* Project Management */}
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<Card className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 order-2 md:order-1">
								<div className="text-center">
									<FolderKanban className="h-12 w-12 text-green-600 mx-auto mb-3" />
									<h4 className="font-semibold text-slate-900 mb-2">Projects</h4>
									<p className="text-sm text-slate-600">Organize & track work</p>
								</div>
							</Card>
							<div className="order-1 md:order-2">
								<div className="flex items-center gap-3 mb-4">
									<FolderKanban className="h-6 w-6 text-green-600" />
									<h3 className="text-xl font-semibold text-slate-900">Project Management</h3>
								</div>
								<p className="text-slate-600 mb-4">
									Create and manage projects with tasks, time tracking, client communication, and progress monitoring.
								</p>
								<ul className="space-y-2 text-sm text-slate-600">
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Kanban board with drag & drop
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Built-in time tracking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Client portal sharing
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										AI task generation <Badge className="ml-1 text-xs">Pro</Badge>
									</li>
								</ul>
							</div>
						</div>

						{/* Time Tracking */}
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<div>
								<div className="flex items-center gap-3 mb-4">
									<Clock className="h-6 w-6 text-orange-600" />
									<h3 className="text-xl font-semibold text-slate-900">Time Tracking</h3>
								</div>
								<p className="text-slate-600 mb-4">
									Track time spent on tasks and projects with an intuitive timer system and detailed reporting.
								</p>
								<ul className="space-y-2 text-sm text-slate-600">
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										One-click timer start/stop
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Visual REC indicator
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Automatic time calculations
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Export time reports <Badge className="ml-1 text-xs">Pro</Badge>
									</li>
								</ul>
							</div>
							<Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50">
								<div className="text-center">
									<Clock className="h-12 w-12 text-orange-600 mx-auto mb-3" />
									<h4 className="font-semibold text-slate-900 mb-2">Time Tracking</h4>
									<p className="text-sm text-slate-600">Precise time management</p>
								</div>
							</Card>
						</div>

						{/* Invoicing */}
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 order-2 md:order-1">
								<div className="text-center">
									<Receipt className="h-12 w-12 text-purple-600 mx-auto mb-3" />
									<h4 className="font-semibold text-slate-900 mb-2">Invoicing</h4>
									<p className="text-sm text-slate-600">Professional billing</p>
								</div>
							</Card>
							<div className="order-1 md:order-2">
								<div className="flex items-center gap-3 mb-4">
									<Receipt className="h-6 w-6 text-purple-600" />
									<h3 className="text-xl font-semibold text-slate-900">Professional Invoicing</h3>
								</div>
								<p className="text-slate-600 mb-4">
									Generate professional invoices from your projects with automatic calculations and client management.
								</p>
								<ul className="space-y-2 text-sm text-slate-600">
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Auto-generate from projects
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Professional templates
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Payment status tracking
									</li>
									<li className="flex items-center gap-2">
										<CheckCircle className="h-4 w-4 text-green-500" />
										Custom branding <Badge className="ml-1 text-xs">Pro</Badge>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Pro Features */}
				<section className="mb-12 sm:mb-16">
					<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
						<div className="text-center mb-6 sm:mb-8">
							<Zap className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4" />
							<h2 className="text-xl sm:text-2xl font-bold mb-2">🚀 Pro Features</h2>
							<p className="text-blue-100 text-sm sm:text-base px-4">
								Unlock advanced features to supercharge your freelancing business
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							<div className="text-center">
								<Zap className="h-8 w-8 mx-auto mb-3 text-yellow-300" />
								<h3 className="font-semibold mb-2">AI Task Generation</h3>
								<p className="text-sm text-blue-100">
									Let AI suggest and create tasks based on your project requirements
								</p>
							</div>
							<div className="text-center">
								<DollarSign className="h-8 w-8 mx-auto mb-3 text-green-300" />
								<h3 className="font-semibold mb-2">AI Rate Suggestions</h3>
								<p className="text-sm text-blue-100">
									Get AI-powered hourly rate recommendations based on your skills
								</p>
							</div>
							<div className="text-center">
								<BarChart3 className="h-8 w-8 mx-auto mb-3 text-pink-300" />
								<h3 className="font-semibold mb-2">Advanced Analytics</h3>
								<p className="text-sm text-blue-100">
									Detailed insights into your business performance and trends
								</p>
							</div>
							<div className="text-center">
								<Users className="h-8 w-8 mx-auto mb-3 text-orange-300" />
								<h3 className="font-semibold mb-2">Team Collaboration</h3>
								<p className="text-sm text-blue-100">
									Work with team members and manage collaborative projects
								</p>
							</div>
							<div className="text-center">
								<Shield className="h-8 w-8 mx-auto mb-3 text-cyan-300" />
								<h3 className="font-semibold mb-2">Priority Support</h3>
								<p className="text-sm text-blue-100">
									Get priority email support and direct access to our team
								</p>
							</div>
							<div className="text-center">
								<Receipt className="h-8 w-8 mx-auto mb-3 text-purple-300" />
								<h3 className="font-semibold mb-2">Custom Branding</h3>
								<p className="text-sm text-blue-100">
									Add your logo and branding to invoices and client portals
								</p>
							</div>
						</div>

						<div className="text-center mt-6 sm:mt-8">
							<Link 
								href="/dashboard/upgrade" 
								className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-sm sm:text-base"
							>
								<Zap className="h-3 w-3 sm:h-4 sm:w-4" />
								<span className="hidden sm:inline">Upgrade to Pro - €12/month</span>
								<span className="sm:hidden">Upgrade - €12/month</span>
							</Link>
						</div>
					</div>
				</section>

				{/* Getting Help */}
				<section className="mb-12 sm:mb-16">
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6 text-center sm:text-left">💬 Getting Help</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						<Card className="p-4 sm:p-6">
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Need Support?</h3>
							<p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">
								Have questions or need help getting started? We&apos;re here to help!
							</p>
							<Link 
								href="/contact" 
								className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
							>
								Contact Support →
							</Link>
						</Card>

						<Card className="p-4 sm:p-6">
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3">Feature Requests</h3>
							<p className="text-slate-600 mb-3 sm:mb-4 text-sm sm:text-base">
								Have an idea for a new feature? We&apos;d love to hear from you!
							</p>
							<Link 
								href="/dashboard/feed" 
								className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm sm:text-base"
							>
								Share Feedback →
							</Link>
						</Card>
					</div>
				</section>

				{/* Footer */}
				<div className="text-center py-6 sm:py-8 border-t border-slate-200">
					<p className="text-slate-600 text-sm sm:text-base px-4">
						Ready to get started? 
						<Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
							Go to Dashboard →
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
