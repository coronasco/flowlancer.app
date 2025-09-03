import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service - Flowlancer",
  description: "Read our Terms of Service to understand the rules and guidelines for using Flowlancer.",
  openGraph: {
    title: "Terms of Service - Flowlancer",
    description: "Read our Terms of Service to understand the rules and guidelines for using Flowlancer.",
  }
};

export default function TermsPage() {
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
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About</Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
              <Link href="/login" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-slate-600">Last updated: December 2024</p>
        </div>

        <div className="space-y-12">
          <div className="bg-slate-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              By accessing and using Flowlancer (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Flowlancer is a web-based platform that provides freelance management tools including project management, time tracking, invoicing, and client collaboration features.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">3. User Accounts</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Registration</h3>
                <p className="text-slate-600 mb-4">To use our Service, you must:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-slate-700">Be at least 16 years of age</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-slate-700">Provide accurate and complete information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-slate-700">Maintain the security of your account credentials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">✓</span>
                    <span className="text-slate-700">Accept responsibility for all activities under your account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Responsibilities</h3>
                <p className="text-slate-600 mb-4">You are responsible for:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                    <span className="text-slate-700">Maintaining the confidentiality of your account information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                    <span className="text-slate-700">All activities that occur under your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                    <span className="text-slate-700">Notifying us immediately of any unauthorized use</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                    <span className="text-slate-700">Ensuring your account information remains current and accurate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <h2>4. Acceptable Use</h2>
          
          <h3>Permitted Uses</h3>
          <p>You may use our Service to:</p>
          <ul>
            <li>Manage your freelance projects and workflows</li>
            <li>Track time and create invoices</li>
            <li>Collaborate with clients and team members</li>
            <li>Store and organize project-related information</li>
          </ul>

          <h3>Prohibited Uses</h3>
          <p>You may not use our Service to:</p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload malicious software or spam</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Harass, abuse, or harm other users</li>
          </ul>

          <h2>5. Content and Data</h2>
          
          <h3>Your Content</h3>
          <p>
            You retain ownership of all content you upload to our Service. By uploading content, you grant us a license to use, store, and display your content as necessary to provide the Service.
          </p>

          <h3>Data Backup</h3>
          <p>
            While we maintain regular backups, you are responsible for maintaining your own backups of important data. We are not liable for any loss of data.
          </p>

          <h2>6. Privacy and Security</h2>
          <p>
            Your privacy is important to us. Please review our <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link> to understand how we collect, use, and protect your information.
          </p>

          <h2>7. Payment and Billing</h2>
          
          <h3>Fees</h3>
          <p>
            Use of certain features may require payment of fees. All fees are non-refundable unless otherwise stated.
          </p>

          <h3>Payment Processing</h3>
          <p>
            Payments are processed by third-party providers. You agree to their terms of service when making payments.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Flowlancer and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>9. Termination</h2>
          
          <h3>Termination by You</h3>
          <p>
            You may terminate your account at any time by contacting us or using the account deletion feature.
          </p>

          <h3>Termination by Us</h3>
          <p>
            We may terminate or suspend your account if you violate these terms or engage in behavior that we deem harmful to the Service or other users.
          </p>

          <h2>10. Disclaimers and Limitations</h2>
          
          <h3>Service Availability</h3>
          <p>
            We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may perform maintenance that temporarily affects availability.
          </p>

          <h3>Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, Flowlancer shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business interruption.
          </p>

          <h2>11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Flowlancer from any claims, damages, or expenses arising from your use of the Service or violation of these terms.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Flowlancer operates, without regard to conflict of law principles.
          </p>

          <h2>14. Dispute Resolution</h2>
          <p>
            Any disputes arising under these terms will be resolved through binding arbitration in accordance with the rules of the relevant arbitration association.
          </p>

          <h2>15. Severability</h2>
          <p>
            If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
          </p>

          <div className="bg-slate-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-slate-300 mb-6">
              If you have any questions about these Terms of Service, we&apos;re here to help clarify anything you need.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
