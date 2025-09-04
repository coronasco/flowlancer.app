import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, User, FolderKanban, Receipt, CheckCircle, DollarSign, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
	title: "Documentation - Flowlancer",
	description: "Learn how to use Flowlancer to manage your freelancing business effectively.",
};

export default function DocsPage() {
	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="mb-16">
					<Link 
						href="/dashboard" 
						className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors group"
					>
						<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
						Back to Dashboard
					</Link>
					<div className="text-center">
						<h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
							Documentation
						</h1>
						<p className="text-xl text-slate-600 max-w-3xl mx-auto">
							Learn how to use Flowlancer to manage your freelancing business effectively.
						</p>
					</div>
				</div>

				{/* Dashboard Overview */}
				<section className="mb-20">
					<div className="mb-12">
						<h2 className="text-3xl font-bold text-slate-900 mb-4">Dashboard Overview</h2>
						<p className="text-slate-600">Your central hub for managing your freelance business</p>
					</div>
					
					<Card className="p-8 mb-8">
						<Home className="h-8 w-8 text-slate-700 mb-4" />
													<h3 className="text-2xl font-semibold text-slate-900 mb-4">What you&apos;ll see on your Dashboard</h3>
						<div className="space-y-4">
							<div>
								<h4 className="font-semibold text-slate-900 mb-2">📊 Statistics Overview</h4>
								<ul className="space-y-2 text-slate-600 ml-4">
									<li><strong>Total Earnings:</strong> Calculated from all invoices marked as &ldquo;paid&rdquo;</li>
									<li><strong>Hours Tracked:</strong> Sum of all time tracked across your projects</li>
									<li><strong>Active Projects:</strong> Projects with status &ldquo;planning&rdquo; or &ldquo;in-progress&rdquo;</li>
									<li><strong>Completed Projects:</strong> Projects marked as &ldquo;completed&rdquo;</li>
								</ul>
							</div>
							<div>
								<h4 className="font-semibold text-slate-900 mb-2">📋 Recent Projects</h4>
								<p className="text-slate-600 ml-4">Shows your 5 most recent projects with progress indicators and quick access links</p>
							</div>
							<div>
								<h4 className="font-semibold text-slate-900 mb-2">💡 Pro Tips</h4>
								<p className="text-slate-600 ml-4">Randomly rotated tips to help you improve your freelancing business</p>
							</div>
						</div>
					</Card>
				</section>

				{/* Profile Page */}
				<section className="mb-20">
					<div className="mb-12">
						<h2 className="text-3xl font-bold text-slate-900 mb-4">Profile Management</h2>
						<p className="text-slate-600">Build your professional presence and optimize your rates</p>
					</div>
					
					<div className="grid lg:grid-cols-2 gap-8">
						<Card className="p-6">
							<User className="h-8 w-8 text-slate-700 mb-4" />
							<h3 className="text-xl font-semibold text-slate-900 mb-4">Professional Profile Setup</h3>
							<div className="space-y-3 text-slate-600">
								<p><strong>Basic Info:</strong> Name, role, location, bio</p>
								<p><strong>Skills:</strong> Add relevant skills to showcase expertise</p>
								<p><strong>Experience:</strong> List your professional experience</p>
								<p><strong>Avatar:</strong> Upload a professional profile photo</p>
								<p><strong>Social Links:</strong> Connect GitHub, LinkedIn, website, etc.</p>
							</div>
						</Card>

						<Card className="p-6">
							<DollarSign className="h-8 w-8 text-slate-700 mb-4" />
							<h3 className="text-xl font-semibold text-slate-900 mb-4">AI-Powered Rate Optimization</h3>
							<div className="space-y-3 text-slate-600">
								<p><strong>AI Rate Suggestion:</strong> Get intelligent hourly rate recommendations based on your skills, experience, and market data</p>
								<p><strong>Manual Override:</strong> Set your own rate if you prefer</p>
								<p><strong>Rate History:</strong> Track your rate changes over time</p>
								<p><strong>Why AI Helps:</strong> Ensures you&apos;re charging competitively and not undervaluing your work</p>
							</div>
						</Card>

						<Card className="p-6">
							<CheckCircle className="h-8 w-8 text-slate-700 mb-4" />
							<h3 className="text-xl font-semibold text-slate-900 mb-4">Public Profile & Client Feedback</h3>
							<div className="space-y-3 text-slate-600">
								<p><strong>Public Profile:</strong> Toggle to make your profile publicly accessible via a unique URL</p>
								<p><strong>Client Feedback Display:</strong> Showcase testimonials from satisfied clients</p>
								<p><strong>How to Get Feedback:</strong> Clients can leave feedback when projects are completed through the client portal</p>
								<p><strong>Professional Showcase:</strong> Use your public profile to attract new clients</p>
							</div>
						</Card>

						<Card className="p-6">
							<Star className="h-8 w-8 text-slate-700 mb-4" />
							<h3 className="text-xl font-semibold text-slate-900 mb-4">Building an Excellent Public Profile</h3>
							<div className="space-y-3 text-slate-600">
								<p><strong>Complete All Sections:</strong> Fill out bio, skills, experience, and social links</p>
								<p><strong>Professional Photo:</strong> Use a high-quality, professional headshot</p>
								<p><strong>Compelling Bio:</strong> Write a clear, concise description of your expertise</p>
								<p><strong>Showcase Skills:</strong> Add relevant skills that clients are looking for</p>
								<p><strong>Collect Feedback:</strong> Encourage satisfied clients to leave testimonials</p>
							</div>
						</Card>
					</div>
				</section>

				{/* Projects Management */}
				<section className="mb-20">
					<div className="mb-12">
						<h2 className="text-3xl font-bold text-slate-900 mb-4">Projects Management</h2>
						<p className="text-slate-600">Complete project lifecycle from creation to completion</p>
					</div>
					
					<div className="space-y-8">
						<Card className="p-8">
							<FolderKanban className="h-8 w-8 text-slate-700 mb-4" />
							<h3 className="text-2xl font-semibold text-slate-900 mb-4">Creating and Managing Projects</h3>
							<div className="grid lg:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">🎯 Project Creation</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Project Name:</strong> Clear, descriptive title</li>
										<li><strong>Description:</strong> Detailed project overview</li>
										<li><strong>Pricing Type:</strong> Hourly or Fixed price</li>
										<li><strong>Rate/Price:</strong> Your hourly rate or fixed project price</li>
										<li><strong>Deadline:</strong> Optional project deadline</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">📋 Project Status</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Planning:</strong> Initial project setup phase</li>
										<li><strong>In Progress:</strong> Actively working on tasks</li>
										<li><strong>Completed:</strong> Project finished and ready for invoicing</li>
									</ul>
								</div>
							</div>
						</Card>

						<Card className="p-8">
							<h3 className="text-2xl font-semibold text-slate-900 mb-4">Individual Project Page Features</h3>
							<div className="grid lg:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">📝 Task Management</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Kanban Board:</strong> Backlog → In Progress → Done</li>
										<li><strong>Drag & Drop:</strong> Move tasks between columns</li>
										<li><strong>Task Details:</strong> Add descriptions and time estimates</li>
										<li><strong>AI Task Generation:</strong> Let AI suggest tasks based on project description</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">⏱️ Time Tracking</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Timer per Task:</strong> Start/stop timer for individual tasks</li>
										<li><strong>Visual REC Indicator:</strong> See when timer is running</li>
										<li><strong>Automatic Calculations:</strong> Track total project time</li>
										<li><strong>Earnings Display:</strong> Real-time earnings based on hourly rate</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">💰 Project Invoicing</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Generate Invoice:</strong> Create invoice from tracked time</li>
										<li><strong>Automatic Calculations:</strong> Hours × rate = total</li>
										<li><strong>Professional Format:</strong> Business-ready invoice template</li>
										<li><strong>Client Information:</strong> Includes client and business details</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">📄 Generate Proposal</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>AI-Powered:</strong> Generate professional project proposals</li>
										<li><strong>Customizable:</strong> Choose tone (professional, friendly, technical)</li>
										<li><strong>Complete Details:</strong> Include timeline, pricing, and scope</li>
										<li><strong>Client-Ready:</strong> Professional format ready to send</li>
									</ul>
								</div>
							</div>
						</Card>

						<Card className="p-8">
							<h3 className="text-2xl font-semibold text-slate-900 mb-4">Client Portal Integration</h3>
							<div className="space-y-4">
								<h4 className="font-semibold text-slate-900 mb-3">🔗 How Client Portal Works</h4>
								<div className="grid lg:grid-cols-2 gap-6">
									<div>
										<h5 className="font-medium text-slate-900 mb-2">For You (Freelancer):</h5>
										<ul className="space-y-2 text-slate-600">
											<li><strong>Generate Link:</strong> Create secure portal link for each project</li>
											<li><strong>Share with Client:</strong> Send link via email or messaging</li>
											<li><strong>Real-time Updates:</strong> Client sees live project progress</li>
											<li><strong>Professional Image:</strong> Showcase organized, transparent work</li>
										</ul>
									</div>
									<div>
										<h5 className="font-medium text-slate-900 mb-2">For Your Client:</h5>
										<ul className="space-y-2 text-slate-600">
											<li><strong>Project Overview:</strong> See project details and timeline</li>
											<li><strong>Task Progress:</strong> View all tasks and their status</li>
											<li><strong>Time & Earnings:</strong> See hours worked and current earnings</li>
											<li><strong>Comment on Tasks:</strong> Leave feedback on individual tasks</li>
											<li><strong>Project Feedback:</strong> Rate and review completed projects</li>
										</ul>
									</div>
								</div>
							</div>
						</Card>
					</div>
				</section>

				{/* Invoicing System */}
				<section className="mb-20">
					<div className="mb-12">
						<h2 className="text-3xl font-bold text-slate-900 mb-4">Professional Invoicing</h2>
						<p className="text-slate-600">Get paid faster with automated, professional invoicing</p>
					</div>
					
					<div className="space-y-8">
						<Card className="p-8">
							<Receipt className="h-8 w-8 text-slate-700 mb-4" />
							<h3 className="text-2xl font-semibold text-slate-900 mb-4">Invoice Management</h3>
							<div className="grid lg:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">📊 Invoices Page Overview</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Grouped by Project:</strong> Invoices organized by project</li>
										<li><strong>Status Tracking:</strong> Pending, Paid, Overdue, Cancelled</li>
										<li><strong>Quick Actions:</strong> View details, mark as paid, export PDF</li>
										<li><strong>Professional Layout:</strong> Clean, business-ready presentation</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">💳 Invoice Status & Earnings</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Total Earnings Calculation:</strong> Only invoices marked as &ldquo;Paid&rdquo; count toward earnings</li>
										<li><strong>Status Updates:</strong> Mark invoices as paid when client pays</li>
										<li><strong>Dashboard Sync:</strong> Earnings automatically update on dashboard</li>
										<li><strong>Payment Tracking:</strong> Clear visibility of payment status</li>
									</ul>
								</div>
							</div>
						</Card>

						<Card className="p-8">
							<h3 className="text-2xl font-semibold text-slate-900 mb-4">Individual Invoice Features</h3>
							<div className="grid lg:grid-cols-2 gap-6">
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">📋 Invoice Details</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Business Information:</strong> Your business details and branding</li>
										<li><strong>Client Information:</strong> Client name, email, and address</li>
										<li><strong>Task Breakdown:</strong> Detailed list of completed tasks</li>
										<li><strong>Time & Rate:</strong> Hours worked and hourly rate for each task</li>
										<li><strong>Professional Format:</strong> Clean, printable invoice layout</li>
									</ul>
								</div>
								<div>
									<h4 className="font-semibold text-slate-900 mb-3">⚡ Invoice Actions</h4>
									<ul className="space-y-2 text-slate-600">
										<li><strong>Mark as Paid:</strong> Update status when payment received</li>
										<li><strong>Export PDF:</strong> Generate PDF for printing or emailing</li>
										<li><strong>Status Management:</strong> Change between Pending, Paid, Cancelled</li>
										<li><strong>Print Ready:</strong> Optimized for professional printing</li>
									</ul>
								</div>
							</div>
						</Card>
					</div>
				</section>

				{/* Feed & Settings */}
				<section className="mb-20">
					<div className="mb-12">
						<h2 className="text-3xl font-bold text-slate-900 mb-4">Community & Settings</h2>
						<p className="text-slate-600">Connect with other freelancers and configure your workspace</p>
					</div>
					
					<div className="grid lg:grid-cols-2 gap-8">
						<Card className="p-6">
							<h3 className="text-xl font-semibold text-slate-900 mb-4">💬 Community Feed</h3>
							<div className="space-y-3 text-slate-600">
								<p><strong>Share Updates:</strong> Post about your projects, wins, and challenges</p>
								<p><strong>Get Inspired:</strong> See what other freelancers are working on</p>
								<p><strong>Ask Questions:</strong> Get help and advice from the community</p>
								<p><strong>Share Resources:</strong> Tips, tools, and resources for freelancers</p>
								<p><strong>Network:</strong> Connect with other professionals in your field</p>
							</div>
						</Card>

						<Card className="p-6">
							<h3 className="text-xl font-semibold text-slate-900 mb-4">⚙️ Settings & Preferences</h3>
							<div className="space-y-3 text-slate-600">
								<p><strong>Account Settings:</strong> Update your account information</p>
								<p><strong>Notification Preferences:</strong> Choose what notifications you receive</p>
								<p><strong>Privacy Settings:</strong> Control your profile visibility</p>
								<p><strong>Integration Settings:</strong> Connect third-party tools</p>
								<p><strong>Billing Preferences:</strong> Manage your subscription and payments</p>
							</div>
						</Card>
					</div>
				</section>

				{/* Getting Help */}
				<section className="mb-20">
					<div className="mb-12">
						<h2 className="text-3xl font-bold text-slate-900 mb-4">Getting Help</h2>
						<p className="text-slate-600">Need assistance or have questions?</p>
					</div>
					<div className="grid md:grid-cols-2 gap-8">
						<Card className="p-6">
							<h3 className="text-xl font-semibold text-slate-900 mb-3">Need Support?</h3>
							<p className="text-slate-600 mb-4">
								Have questions or need help getting started? We&apos;re here to help!
							</p>
							<Link 
								href="/contact" 
								className="text-slate-900 hover:text-slate-700 font-medium"
							>
								Contact Support →
							</Link>
						</Card>

						<Card className="p-6">
							<h3 className="text-xl font-semibold text-slate-900 mb-3">Feature Requests</h3>
							<p className="text-slate-600 mb-4">
								Have an idea for a new feature? We&apos;d love to hear from you!
							</p>
							<Link 
								href="/dashboard/feed" 
								className="text-slate-900 hover:text-slate-700 font-medium"
							>
								Share Feedback →
							</Link>
						</Card>
					</div>
				</section>

				{/* CTA */}
				<div className="text-center py-12 border-t border-slate-200">
					<h3 className="text-2xl font-bold text-slate-900 mb-4">
						Ready to get started?
					</h3>
					<p className="text-slate-600 mb-8">
						Go to your dashboard to start managing your freelance business.
					</p>
					<Link 
						href="/dashboard" 
						className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
					>
						Go to Dashboard
						<ArrowLeft className="h-4 w-4 rotate-180" />
					</Link>
				</div>
			</div>
		</div>
	);
}
