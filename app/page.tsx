import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  Users, 
  Shield, 
  Clock, 
  FileText, 
  BarChart3,
  Star,
  Play
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
      <header className="border-b border-slate-100 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={28} height={28} className="sm:w-8 sm:h-8" priority />
              <span className="text-lg sm:text-xl font-semibold text-slate-900">Flowlancer</span>
            </div>
            
            <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8">
              <a href="#features" className="hidden sm:inline-block text-sm lg:text-base text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#how-it-works" className="hidden md:inline-block text-sm lg:text-base text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
              <Link href="/docs" className="hidden lg:inline-block text-sm lg:text-base text-slate-600 hover:text-slate-900 transition-colors">Docs</Link>
              <Link href="/login" className="px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm sm:text-base font-medium">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-50 to-blue-50 rounded-full blur-3xl opacity-70"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-6">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                Trusted by 10,000+ freelancers worldwide
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 mb-4 sm:mb-6">
                The Complete
                <span className="block text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text">
                  Freelance Platform
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Transform your freelance business with project management, time tracking, professional invoicing, 
                and client collaboration. Everything you need in one beautiful platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center lg:justify-start">
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium text-sm sm:text-base shadow-lg hover:shadow-xl"
                >
                  Start Free Today
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm sm:text-base">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  Setup in 2 minutes
                </div>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              {/* Dashboard Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl lg:rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent"></div>
                <div className="relative p-4 sm:p-6 lg:p-8 h-full flex flex-col">
                  {/* Mock Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-300 rounded-lg"></div>
                      <div className="w-20 h-4 bg-slate-300 rounded"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-300 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-16 bg-blue-100 rounded-lg"></div>
                      <div className="h-16 bg-green-100 rounded-lg"></div>
                      <div className="h-16 bg-purple-100 rounded-lg"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  
                  <div className="text-center text-xs text-slate-400 mt-4">
                    Live Dashboard Preview
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl shadow-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
              How Flowlancer Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto px-4">
              Get your freelance business running smoothly in three simple steps. No learning curve, no complexity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-lg sm:text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">Quick Setup</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Sign up with Google or GitHub, complete your profile, and you&apos;re ready to start. Takes less than 2 minutes.
              </p>
              
              {/* Connector Line */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-green-200 -translate-x-1/2"></div>
            </div>
            
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-lg sm:text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">Manage Projects</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Create projects, add tasks with our Kanban boards, track time automatically, and collaborate with clients.
              </p>
              
              {/* Connector Line */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-200 to-purple-200 -translate-x-1/2"></div>
            </div>
            
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-200">
                <span className="text-lg sm:text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2 sm:mb-3">Get Paid</h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Generate professional invoices from tracked time, share with clients, and get paid faster with our streamlined process.
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12 sm:mt-16">
            <Link 
              href="/login"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm sm:text-base shadow-lg"
            >
              Try It Free Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From project inception to final invoice, Flowlancer provides all the tools 
              you need to run a professional freelance business.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-shadow">
                <div className="inline-flex p-3 bg-slate-100 rounded-xl mb-4">
                  <feature.icon className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trusted by freelancers worldwide
            </h2>
            <p className="text-xl text-slate-600">
              See what our community has to say about their Flowlancer experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                &ldquo;Flowlancer made managing my design projects so much easier. The interface is clean and intuitive.&rdquo;
              </p>
              <div>
                <div className="font-semibold text-slate-900">Sarah Chen</div>
                <div className="text-slate-600 text-sm">UI/UX Designer</div>
              </div>
            </div>
            
            <div className="p-8 bg-white border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                &ldquo;Simple setup, powerful features. Exactly what I needed to organize my development work.&rdquo;
              </p>
              <div>
                <div className="font-semibold text-slate-900">Marcus Rodriguez</div>
                <div className="text-slate-600 text-sm">Full-Stack Developer</div>
              </div>
            </div>
            
            <div className="p-8 bg-white border border-slate-100 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">
                &ldquo;The time tracking and invoicing features save me hours every week. Highly recommended!&rdquo;
              </p>
              <div>
                <div className="font-semibold text-slate-900">Emily Thompson</div>
                <div className="text-slate-600 text-sm">Marketing Consultant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Flowlancer Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Why choose Flowlancer?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">No learning curve</h3>
                    <p className="text-slate-600">
                      Start using Flowlancer immediately. Our intuitive interface means you can focus on your work, not learning software.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Your data is safe</h3>
                    <p className="text-slate-600">
                      Enterprise-grade security ensures your projects and client information are always protected.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Save time every day</h3>
                    <p className="text-slate-600">
                      Automate invoicing, streamline project management, and focus on what you do best.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-100 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">Simple</div>
                  <p className="text-slate-600">Easy to use interface</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">Fast</div>
                  <p className="text-slate-600">Quick setup and workflow</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-900 mb-2">Professional</div>
                  <p className="text-slate-600">Impress your clients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to streamline your workflow?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join professionals who have simplified their freelance business with Flowlancer.
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium text-lg"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-sm text-slate-400 mt-4">
            Simple setup • Professional results • Start immediately
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
