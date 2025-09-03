import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  CheckCircle, 
  ArrowRight, 
  Users, 
  Target, 
  Heart,
  Lightbulb
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About Us - Flowlancer",
  description: "Learn about Flowlancer's mission to simplify freelance workflow management and help professionals focus on what they do best.",
  openGraph: {
    title: "About Us - Flowlancer",
    description: "Learn about Flowlancer's mission to simplify freelance workflow management and help professionals focus on what they do best.",
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/flowlancer_logo_dark.svg" alt="Flowlancer" width={32} height={32} priority />
              <span className="text-xl font-semibold text-slate-900">Flowlancer</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
              <Link href="/about" className="text-slate-900 font-medium">About</Link>
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
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            Simplifying freelance
            <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
              workflow management
            </span>
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            We believe freelancers should focus on their craft, not on managing complex tools. 
            That&apos;s why we built Flowlancer to be simple, powerful, and professional.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                To empower freelancers and independent professionals with tools that streamline their workflow, 
                eliminate administrative overhead, and help them deliver exceptional work to their clients.
              </p>
              <p className="text-lg text-slate-600">
                We understand the challenges of running a freelance business because we&apos;ve been there. 
                Flowlancer was born from the need for a simple, yet powerful platform that handles the business side 
                so you can focus on the creative side.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border border-slate-200">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-blue-100 rounded-xl mb-4 inline-flex">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Focus</h3>
                  <p className="text-sm text-slate-600">Help you focus on your craft</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-green-100 rounded-xl mb-4 inline-flex">
                    <Lightbulb className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Simplicity</h3>
                  <p className="text-sm text-slate-600">Easy to use, powerful results</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-purple-100 rounded-xl mb-4 inline-flex">
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Community</h3>
                  <p className="text-sm text-slate-600">Built for freelancers, by freelancers</p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-orange-100 rounded-xl mb-4 inline-flex">
                    <Heart className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">Passion</h3>
                  <p className="text-sm text-slate-600">We care about your success</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Our Story
            </h2>
            <p className="text-xl text-slate-600">
              How Flowlancer came to be
            </p>
          </div>
          
          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              Flowlancer started as a solution to a problem we experienced firsthand. As freelancers ourselves, 
              we were frustrated with the complexity of existing project management tools. They were either too simple 
              and lacked essential features, or too complex and required days of setup.
            </p>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              We wanted something different: a platform that would be powerful enough to handle complex projects, 
              yet simple enough to start using immediately. Something that would look professional when sharing 
              with clients, but wouldn&apos;t require a manual to understand.
            </p>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              Today, Flowlancer serves thousands of freelancers worldwide, from designers and developers to 
              consultants and agencies. We&apos;re proud to be part of their journey and help them focus on what 
              they do best: delivering exceptional work.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              What We Believe
            </h2>
            <p className="text-xl text-slate-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Simplicity First</h3>
              <p className="text-slate-600 leading-relaxed">
                Complex problems don&apos;t always need complex solutions. We believe in making things as simple as possible, but not simpler.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">User-Centric Design</h3>
              <p className="text-slate-600 leading-relaxed">
                Every feature we build starts with a real user need. We listen to our community and evolve based on feedback.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-6">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Passion for Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                We&apos;re not just building software; we&apos;re crafting tools that professionals rely on every day. Quality matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Join Our Community
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Be part of a growing community of professionals who have streamlined their workflow with Flowlancer.
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-lg"
          >
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
