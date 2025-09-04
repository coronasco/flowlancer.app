import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Users, 
  Clock, 
  FileText, 
  BarChart3,
  Shield,
  Zap
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Flowlancer - The Complete Freelance Management Platform | Project Management, Time Tracking & Invoicing",
  description: "Transform your freelance business with Flowlancer's all-in-one platform. Manage projects with Kanban boards, track time automatically, create professional invoices, and collaborate with clients. Used by 10,000+ freelancers worldwide.",
  keywords: [
    "freelance management platform", "project management for freelancers", "time tracking software", 
    "invoicing for freelancers", "client management tools", "freelance workflow automation",
    "kanban boards freelance", "professional invoicing", "client collaboration platform",
    "freelance business management", "time tracking invoicing", "project tracking freelance"
  ],
  authors: [{ name: "Flowlancer Team" }],
  creator: "Flowlancer",
  publisher: "Flowlancer",
  openGraph: {
    title: "Flowlancer - The Complete Freelance Management Platform",
    description: "Transform your freelance business with project management, time tracking, invoicing, and client collaboration. Trusted by 10,000+ professionals worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "Flowlancer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flowlancer - Complete Freelance Management Platform",
    description: "Project management, time tracking, invoicing & client collaboration for modern freelancers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

const features = [
  {
    icon: BarChart3,
    title: "Project Management",
    description: "Organize your work with beautiful Kanban boards, task tracking, and milestone management.",
  },
  {
    icon: Clock,
    title: "Time Tracking", 
    description: "Track time with precision, generate detailed reports, and improve your productivity insights.",
  },
  {
    icon: FileText,
    title: "Smart Invoicing",
    description: "Create professional invoices automatically from tracked time and completed tasks.",
  },
  {
    icon: Users,
    title: "Client Collaboration",
    description: "Share project progress with clients through secure portals and real-time updates.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Enterprise-grade security with data encryption and privacy controls built-in.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Automate repetitive tasks and focus on what matters most - your creative work.",
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={32} height={32} priority />
              <span className="text-xl font-semibold text-slate-900">Flowlancer</span>
            </div>
            
            <nav className="flex items-center gap-8">
              <Link href="/pricing" className="hidden md:inline-block text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
              <Link href="/docs" className="hidden md:inline-block text-slate-600 hover:text-slate-900 transition-colors">Docs</Link>
              <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Professional freelance
              <span className="block">management platform</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Streamline your freelance workflow with project management, time tracking, 
              professional invoicing, and client collaboration tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                View Pricing
              </Link>
            </div>
            
            <div className="text-sm text-slate-500">
              Free to start • No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Professional tools to manage your freelance business efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white border border-slate-200 rounded-lg">
                <feature.icon className="h-8 w-8 text-slate-700 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of freelancers managing their business with Flowlancer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
