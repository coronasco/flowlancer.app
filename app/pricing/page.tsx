import { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pricing - Flowlancer",
  description: "Simple, transparent pricing for freelancers. Start free, upgrade when you need more features.",
};

const freeFeatures = [
  "3 Active Projects",
  "Basic Task Management", 
  "Time Tracking",
  "Basic Invoicing",
  "Client Portal",
  "Email Support"
];

const proFeatures = [
  "Unlimited Projects",
  "Advanced Task Management",
  "AI-Powered Task Generation", 
  "AI Hourly Rate Suggestions",
  "Advanced Time Analytics",
  "Professional Invoicing",
  "Custom Invoice Branding",
  "Team Collaboration",
  "Advanced Client Portal",
  "Priority Support",
  "Advanced Analytics Dashboard",
  "Export & Reporting"
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={32} height={32} />
              <span className="text-xl font-semibold text-slate-900">Flowlancer</span>
            </Link>
            
            <nav className="flex items-center gap-8">
              <Link href="/docs" className="hidden md:inline-block text-slate-600 hover:text-slate-900 transition-colors">Docs</Link>
              <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Start free and upgrade when you need more features. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="border-2 border-slate-200 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Free</h3>
              <div className="text-5xl font-bold text-slate-900 mb-2">
                €0<span className="text-xl font-normal text-slate-600">/month</span>
              </div>
              <p className="text-slate-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/login"
              className="block w-full text-center px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-slate-900 rounded-2xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Pro</h3>
              <div className="text-5xl font-bold text-slate-900 mb-2">
                €12<span className="text-xl font-normal text-slate-600">/month</span>
              </div>
              <p className="text-slate-600">For serious freelancers</p>
            </div>

            <ul className="space-y-4 mb-8">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link 
              href="/login"
              className="block w-full text-center px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Start Pro Trial
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600">
                Yes, you can cancel your Pro subscription at any time. You&apos;ll continue to have access to Pro features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-slate-600">
                Your data is always safe. If you downgrade, you&apos;ll keep access to all your projects and data, but some Pro features will be limited.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Do you offer refunds?
              </h3>
              <p className="text-slate-600">
                We offer a 30-day money-back guarantee. If you&apos;re not satisfied within the first 30 days, we&apos;ll refund your payment.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Is there a free trial for Pro?
              </h3>
              <p className="text-slate-600">
                Yes, you get a 14-day free trial of Pro features when you upgrade. No credit card required to start.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-slate-600 mb-8">
            Join thousands of freelancers managing their business with Flowlancer.
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
