import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Clock,
  FileText,
  Shield,
  Zap
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { DashboardTabs } from "@/components/landing/DashboardTabs";

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

// Features array removed as it's not used in the current design

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
                    <Link href="/contact" className="hidden md:inline-block text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
                    <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium">
                      Get Started
                    </Link>
                  </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-green-100/40 to-blue-100/40 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 mb-8 leading-tight">
              The Complete
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Freelance Platform
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Transform your freelance business with professional project management, 
              intelligent time tracking, automated invoicing, and seamless client collaboration.
            </p>
            
                              <div className="flex justify-center mb-12">
                    <Link
                      href="/login"
                      className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Start Free Today
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Setup in 2 minutes
              </div>
            </div>
          </div>
          
          {/* Interactive Dashboard Demo */}
          <div className="relative max-w-7xl mx-auto">
            <DashboardTabs />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                succeed as a freelancer
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From project inception to final payment, Flowlancer provides all the professional 
              tools you need to run a successful freelance business.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Project Management */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Project Management
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Organize your work with intuitive Kanban boards, track progress, and manage deadlines with ease.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Drag & drop Kanban boards
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    AI-powered task generation
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Client collaboration portal
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Progress tracking & reporting
                  </li>
                </ul>
              </div>
            </div>

            {/* Time Tracking */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Smart Time Tracking
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Track time effortlessly with one-click timers, visual indicators, and automatic calculations.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    One-click start/stop timers
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Visual REC recording indicator
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Automatic earnings calculation
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Detailed time analytics
                  </li>
                </ul>
              </div>
            </div>

            {/* Professional Invoicing */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white p-8 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Professional Invoicing
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  Generate beautiful, professional invoices automatically from your tracked time and projects.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Auto-generate from projects
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Professional templates
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Payment status tracking
                  </li>
                  <li className="flex items-center gap-3 text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Export to PDF instantly
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why choose Flowlancer?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Built specifically for modern freelancers who want to focus on their craft
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Secure & Reliable</h3>
              <p className="text-slate-300 leading-relaxed">
                Enterprise-grade security with 99.9% uptime guarantee. Your data is always safe and accessible.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Simple & Powerful</h3>
              <p className="text-slate-300 leading-relaxed">
                No learning curve required. Start managing your freelance business professionally in minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Built for Freelancers</h3>
              <p className="text-slate-300 leading-relaxed">
                Every feature is designed with freelancers in mind. From time tracking to client collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Get started in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 3 simple steps</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              No learning curve, no complexity. Start managing your freelance business professionally in minutes.
            </p>
          </div>
          
                        <div className="relative">
                {/* Connection lines - positioned at icon level */}
                <div className="hidden lg:block absolute top-[50px] left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

                <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 relative">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Setup Your Profile</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create your professional profile with skills, experience, and let our AI suggest optimal hourly rates based on market data.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-10 w-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-purple-600">2</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Create Projects</h3>
                <p className="text-slate-600 leading-relaxed">
                  Add your projects, let AI generate tasks, track time with visual indicators, and share progress with clients through the portal.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-10 w-10 text-white" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-green-600">3</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Get Paid Fast</h3>
                <p className="text-slate-600 leading-relaxed">
                  Generate professional invoices automatically, track payments, and watch your earnings grow with our comprehensive dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-medium mb-8">
            <Zap className="h-4 w-4" />
            Start your freelance transformation today
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to transform your
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              freelance business?
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Streamline your workflow, increase your earnings, and build stronger client relationships 
            with our comprehensive freelance management platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link 
              href="/login"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-all duration-200 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
            >
              Start Free Today
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl hover:border-white/50 hover:bg-white/10 transition-all duration-200 font-semibold text-lg backdrop-blur-sm"
            >
              View Pricing Plans
            </Link>
          </div>
          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="group">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                        <Shield className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white font-bold text-lg mb-2">Secure & Private</div>
                      <div className="text-slate-300 text-sm leading-relaxed">Enterprise-grade security with end-to-end encryption</div>
                    </div>
                  </div>
                  <div className="group">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white font-bold text-lg mb-2">Always Available</div>
                      <div className="text-slate-300 text-sm leading-relaxed">99.9% uptime guarantee with global infrastructure</div>
                    </div>
                  </div>
                  <div className="group">
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-white font-bold text-lg mb-2">Expert Support</div>
                      <div className="text-slate-300 text-sm leading-relaxed">Dedicated customer success team available 24/7</div>
                    </div>
                  </div>
                </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
