"use client";

import { useState } from "react";
import { Check, X, Sparkles, Zap, Shield, Headphones, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function UpgradePage() {
	const [isAnnual, setIsAnnual] = useState(false);

	const freePlanFeatures = [
		{ name: "3 Active Projects", included: true },
		{ name: "Basic Task Management", included: true },
		{ name: "Time Tracking", included: true },
		{ name: "Basic Invoicing", included: true },
		{ name: "Client Portal", included: true },
		{ name: "Email Support", included: true },
		{ name: "Unlimited Projects", included: false },
		{ name: "AI-Powered Features", included: false },
		{ name: "Advanced Analytics", included: false },
		{ name: "Priority Support", included: false },
		{ name: "Custom Branding", included: false },
		{ name: "Team Collaboration", included: false },
	];

	const proPlanFeatures = [
		{ name: "Unlimited Projects", included: true },
		{ name: "Advanced Task Management", included: true },
		{ name: "AI-Powered Task Generation", included: true },
		{ name: "AI Hourly Rate Suggestions", included: true },
		{ name: "Advanced Time Analytics", included: true },
		{ name: "Professional Invoicing", included: true },
		{ name: "Custom Invoice Branding", included: true },
		{ name: "Team Collaboration", included: true },
		{ name: "Advanced Client Portal", included: true },
		{ name: "Priority Support", included: true },
		{ name: "Advanced Analytics Dashboard", included: true },
		{ name: "Export & Reporting", included: true },
	];

	const monthlyPrice = 12;
	const annualPrice = 120; // 10€/month when billed annually
	const currentPrice = isAnnual ? annualPrice : monthlyPrice;
	const billingPeriod = isAnnual ? "year" : "month";

	return (
		<div className="min-h-screen ">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
				{/* Header */}
				<div className="mb-6 sm:mb-8 lg:mb-12">
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
							Upgrade to <span className="brand-gradient">Flowlancer Pro</span>
						</h1>
						<p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">
							Unlock the full potential of your freelancing business with advanced features and AI-powered tools.
						</p>
					</div>
				</div>

				{/* Billing Toggle */}
				<div className="flex justify-center mb-8 sm:mb-10 lg:mb-12">
					<div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
						<button
							onClick={() => setIsAnnual(false)}
							className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
								!isAnnual 
									? "bg-white text-slate-900 shadow-sm" 
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							Monthly
						</button>
						<button
							onClick={() => setIsAnnual(true)}
							className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
								isAnnual 
									? "bg-white text-slate-900 shadow-sm" 
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							Annual
							<Badge className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-green-500 text-white text-xs px-1 sm:px-1.5 py-0.5">
								<span className="hidden sm:inline">Save 17%</span>
								<span className="sm:hidden">-17%</span>
							</Badge>
						</button>
					</div>
				</div>

				{/* Plans Comparison */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
					{/* Free Plan */}
					<Card className="p-4 sm:p-6 lg:p-8 border-2 border-slate-200 relative">
						<div className="text-center mb-4 sm:mb-6">
							<h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Free Plan</h3>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
								€0<span className="text-sm sm:text-base lg:text-lg font-normal text-slate-600">/month</span>
							</div>
							<p className="text-sm sm:text-base text-slate-600">Perfect for getting started</p>
							<Badge className="mt-2 sm:mt-3 bg-slate-100 text-slate-700 text-xs sm:text-sm">Current Plan</Badge>
						</div>

						<ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
							{freePlanFeatures.map((feature, index) => (
								<li key={index} className="flex items-center gap-2 sm:gap-3">
									{feature.included ? (
										<Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
									) : (
										<X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 flex-shrink-0" />
									)}
									<span className={`text-sm sm:text-base ${feature.included ? "text-slate-900" : "text-slate-400"}`}>
										{feature.name}
									</span>
								</li>
							))}
						</ul>

						<Button variant="outline" className="w-full text-sm sm:text-base" disabled>
							Current Plan
						</Button>
					</Card>

					{/* Pro Plan */}
					<Card className="p-4 sm:p-6 lg:p-8 border-2 border-blue-500 relative shadow-xl">
						<div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
							<Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 sm:px-4 py-1 text-xs sm:text-sm">
								<Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
								<span className="hidden sm:inline">Most Popular</span>
								<span className="sm:hidden">Popular</span>
							</Badge>
						</div>

						<div className="text-center mb-4 sm:mb-6 mt-2 sm:mt-0">
							<h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Pro Plan</h3>
							<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
								€{isAnnual ? "10" : "12"}
								<span className="text-sm sm:text-base lg:text-lg font-normal text-slate-600">/{isAnnual ? "month" : "month"}</span>
							</div>
							{isAnnual && (
								<p className="text-xs sm:text-sm text-green-600 font-medium">Billed annually (€120/year)</p>
							)}
							<p className="text-sm sm:text-base text-slate-600 mt-2">For serious freelancers</p>
						</div>

						<ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
							{proPlanFeatures.map((feature, index) => (
								<li key={index} className="flex items-center gap-2 sm:gap-3">
									<Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
									<span className="text-sm sm:text-base text-slate-900">{feature.name}</span>
								</li>
							))}
						</ul>

						<Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-sm sm:text-base py-2 sm:py-3">
							<Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
							<span className="hidden sm:inline">Upgrade to Pro - €{currentPrice}/{billingPeriod}</span>
							<span className="sm:hidden">Upgrade - €{currentPrice}/{billingPeriod}</span>
						</Button>
					</Card>
				</div>

				{/* Additional Benefits */}
				<div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
					<div className="text-center">
						<div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
							<Zap className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">AI-Powered Efficiency</h3>
						<p className="text-sm sm:text-base text-slate-600 px-2">
							Let AI generate tasks, suggest hourly rates, and optimize your workflow automatically.
						</p>
					</div>

					<div className="text-center">
						<div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
							<Shield className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Professional Tools</h3>
						<p className="text-sm sm:text-base text-slate-600 px-2">
							Advanced analytics, custom branding, and professional invoicing to grow your business.
						</p>
					</div>

					<div className="text-center sm:col-span-2 lg:col-span-1">
						<div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
							<Headphones className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Priority Support</h3>
						<p className="text-sm sm:text-base text-slate-600 px-2">
							Get priority email support and direct access to our team when you need help.
						</p>
					</div>
				</div>

				{/* FAQ */}
				<div className="mt-12 sm:mt-16 max-w-3xl mx-auto px-4">
					<h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6 sm:mb-8">
						Frequently Asked Questions
					</h2>
					<div className="space-y-4 sm:space-y-6">
						<div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200">
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
								Can I cancel anytime?
							</h3>
							<p className="text-sm sm:text-base text-slate-600">
								Yes, you can cancel your Pro subscription at any time. You&apos;ll continue to have access to Pro features until the end of your billing period.
							</p>
						</div>
						<div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200">
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
								What happens to my data if I downgrade?
							</h3>
							<p className="text-sm sm:text-base text-slate-600">
								Your data is always safe. If you downgrade, you&apos;ll keep access to all your projects and data, but some Pro features will be limited.
							</p>
						</div>
						<div className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200">
							<h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
								Do you offer refunds?
							</h3>
							<p className="text-sm sm:text-base text-slate-600">
								We offer a 30-day money-back guarantee. If you&apos;re not satisfied within the first 30 days, we&apos;ll refund your payment.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
