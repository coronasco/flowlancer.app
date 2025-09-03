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
  title: "Flowlancer - Professional Freelance Management Platform",
  description: "Streamline your freelance workflow with project management, time tracking, invoicing, and client collaboration tools. Built for modern freelancers and agencies.",
  keywords: ["freelance management", "project management", "time tracking", "invoicing", "client management"],
  openGraph: {
    title: "Flowlancer - Professional Freelance Management Platform",
    description: "Streamline your freelance workflow with project management, time tracking, invoicing, and client collaboration tools.",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  }
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={32} height={32} priority />
              <span className="text-xl font-semibold text-slate-900">Flowlancer</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
              <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
                Streamline your
                <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  freelance workflow
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Manage projects, track time, create invoices, and collaborate with clients 
                all in one beautiful, professional platform designed for modern freelancers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
                >
                  Get Started Now
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Quick setup
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Easy to use
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Professional results
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-300 rounded-xl mx-auto mb-4"></div>
                  <p className="text-slate-500">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Simple. Powerful. Professional.
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Flowlancer is designed for simplicity without sacrificing power. Get started in minutes, not hours.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Setup in minutes</h3>
              <p className="text-slate-600">
                Create your account, set up your profile, and start managing projects immediately. No complex configuration needed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Organize your work</h3>
              <p className="text-slate-600">
                Use our intuitive Kanban boards to organize tasks, track progress, and collaborate with clients seamlessly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Get paid faster</h3>
              <p className="text-slate-600">
                Generate professional invoices automatically from your time tracking and completed tasks. Simple and efficient.
              </p>
            </div>
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
