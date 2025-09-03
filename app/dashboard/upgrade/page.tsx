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
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8">
					<Link 
						href="/dashboard" 
						className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Link>
					<div className="text-center">
						<h1 className="text-4xl font-bold text-slate-900 mb-4">
							Upgrade to <span className="brand-gradient">Flowlancer Pro</span>
						</h1>
						<p className="text-xl text-slate-600 max-w-2xl mx-auto">
							Unlock the full potential of your freelancing business with advanced features and AI-powered tools.
						</p>
					</div>
				</div>

				{/* Billing Toggle */}
				<div className="flex justify-center mb-12">
					<div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
						<button
							onClick={() => setIsAnnual(false)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
								!isAnnual 
									? "bg-white text-slate-900 shadow-sm" 
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							Monthly
						</button>
						<button
							onClick={() => setIsAnnual(true)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
								isAnnual 
									? "bg-white text-slate-900 shadow-sm" 
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							Annual
							<Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5">
								Save 17%
							</Badge>
						</button>
					</div>
				</div>

				{/* Plans Comparison */}
				<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
					{/* Free Plan */}
					<Card className="p-8 border-2 border-slate-200 relative">
						<div className="text-center mb-6">
							<h3 className="text-2xl font-bold text-slate-900 mb-2">Free Plan</h3>
							<div className="text-4xl font-bold text-slate-900 mb-2">
								€0<span className="text-lg font-normal text-slate-600">/month</span>
							</div>
							<p className="text-slate-600">Perfect for getting started</p>
							<Badge className="mt-3 bg-slate-100 text-slate-700">Current Plan</Badge>
						</div>

						<ul className="space-y-3 mb-8">
							{freePlanFeatures.map((feature, index) => (
								<li key={index} className="flex items-center gap-3">
									{feature.included ? (
										<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
									) : (
										<X className="h-5 w-5 text-slate-300 flex-shrink-0" />
									)}
									<span className={feature.included ? "text-slate-900" : "text-slate-400"}>
										{feature.name}
									</span>
								</li>
							))}
						</ul>

						<Button variant="outline" className="w-full" disabled>
							Current Plan
						</Button>
					</Card>

					{/* Pro Plan */}
					<Card className="p-8 border-2 border-blue-500 relative shadow-xl">
						<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
							<Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
								<Sparkles className="h-4 w-4 mr-1" />
								Most Popular
							</Badge>
						</div>

						<div className="text-center mb-6">
							<h3 className="text-2xl font-bold text-slate-900 mb-2">Pro Plan</h3>
							<div className="text-4xl font-bold text-slate-900 mb-2">
								€{isAnnual ? "10" : "12"}
								<span className="text-lg font-normal text-slate-600">/{isAnnual ? "month" : "month"}</span>
							</div>
							{isAnnual && (
								<p className="text-sm text-green-600 font-medium">Billed annually (€120/year)</p>
							)}
							<p className="text-slate-600 mt-2">For serious freelancers</p>
						</div>

						<ul className="space-y-3 mb-8">
							{proPlanFeatures.map((feature, index) => (
								<li key={index} className="flex items-center gap-3">
									<Check className="h-5 w-5 text-green-500 flex-shrink-0" />
									<span className="text-slate-900">{feature.name}</span>
								</li>
							))}
						</ul>

						<Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
							<Zap className="h-4 w-4 mr-2" />
							Upgrade to Pro - €{currentPrice}/{billingPeriod}
						</Button>
					</Card>
				</div>

				{/* Additional Benefits */}
				<div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
					<div className="text-center">
						<div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
							<Zap className="h-8 w-8 text-blue-600" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Powered Efficiency</h3>
						<p className="text-slate-600">
							Let AI generate tasks, suggest hourly rates, and optimize your workflow automatically.
						</p>
					</div>

					<div className="text-center">
						<div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
							<Shield className="h-8 w-8 text-green-600" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900 mb-2">Professional Tools</h3>
						<p className="text-slate-600">
							Advanced analytics, custom branding, and professional invoicing to grow your business.
						</p>
					</div>

					<div className="text-center">
						<div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
							<Headphones className="h-8 w-8 text-purple-600" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900 mb-2">Priority Support</h3>
						<p className="text-slate-600">
							Get priority email support and direct access to our team when you need help.
						</p>
					</div>
				</div>

				{/* FAQ */}
				<div className="mt-16 max-w-3xl mx-auto">
					<h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
						Frequently Asked Questions
					</h2>
					<div className="space-y-6">
						<div className="bg-white rounded-lg p-6 border border-slate-200">
							<h3 className="text-lg font-semibold text-slate-900 mb-2">
								Can I cancel anytime?
							</h3>
							<p className="text-slate-600">
								Yes, you can cancel your Pro subscription at any time. You&apos;ll continue to have access to Pro features until the end of your billing period.
							</p>
						</div>
						<div className="bg-white rounded-lg p-6 border border-slate-200">
							<h3 className="text-lg font-semibold text-slate-900 mb-2">
								What happens to my data if I downgrade?
							</h3>
							<p className="text-slate-600">
								Your data is always safe. If you downgrade, you&apos;ll keep access to all your projects and data, but some Pro features will be limited.
							</p>
						</div>
						<div className="bg-white rounded-lg p-6 border border-slate-200">
							<h3 className="text-lg font-semibold text-slate-900 mb-2">
								Do you offer refunds?
							</h3>
							<p className="text-slate-600">
								We offer a 30-day money-back guarantee. If you&apos;re not satisfied within the first 30 days, we&apos;ll refund your payment.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
