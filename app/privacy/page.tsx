import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy - Flowlancer",
  description: "Learn how Flowlancer protects your privacy and handles your personal information.",
  openGraph: {
    title: "Privacy Policy - Flowlancer",
    description: "Learn how Flowlancer protects your privacy and handles your personal information.",
  }
};

export default function PrivacyPage() {
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
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600">Last updated: December 2024</p>
        </div>

        <div className="space-y-12">
          <div className="bg-slate-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              At Flowlancer, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our freelance management platform.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">2. Information We Collect</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                <p className="text-slate-600 mb-4">We may collect the following personal information:</p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    Name and contact information (email address, phone number)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    Professional information (skills, experience, portfolio)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    Payment information (processed securely through third-party providers)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    Profile information and preferences
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Usage Information</h3>
                <p className="text-slate-600 mb-4">We automatically collect information about how you use our platform:</p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    Log data (IP address, browser type, pages visited)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    Device information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    Usage patterns and preferences
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                    Performance and analytics data
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">3. How We Use Your Information</h2>
            <p className="text-lg text-slate-700 mb-6">We use your information to:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span className="text-slate-700">Provide and maintain our services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span className="text-slate-700">Process transactions and payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span className="text-slate-700">Communicate with you about your account and our services</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <span className="text-slate-700">Improve our platform and develop new features</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                  <span className="text-slate-700">Ensure security and prevent fraud</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">6</span>
                  <span className="text-slate-700">Comply with legal obligations</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">4. Information Sharing</h2>
            <p className="text-lg text-slate-700 mb-6">We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:</p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <span className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-700">With your explicit consent</span>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <span className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-700">With service providers who assist us in operating our platform</span>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <span className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-700">When required by law or to protect our rights</span>
              </div>
              <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <span className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-700">In connection with a business transfer or merger</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">5. Data Security</h2>
            <p className="text-lg text-slate-700 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">🔒</span>
                <span className="text-slate-700">Encryption of data in transit and at rest</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">🔍</span>
                <span className="text-slate-700">Regular security audits and monitoring</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">🛡️</span>
                <span className="text-slate-700">Access controls and authentication</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">💳</span>
                <span className="text-slate-700">Secure payment processing through trusted providers</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">6. Your Rights</h2>
            <p className="text-lg text-slate-700 mb-6">Depending on your location, you may have the following rights:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">Access to your personal information</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">Correction of inaccurate information</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">Deletion of your personal information</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">Portability of your data</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">Objection to processing</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-700">Restriction of processing</span>
                </div>
              </div>
            </div>
          </div>

          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience on our platform. You can control cookie preferences through your browser settings.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>
            Our platform may integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </p>

          <h2>9. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your personal information within a reasonable timeframe.
          </p>

          <h2>10. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers.
          </p>

          <h2>11. Children&apos;s Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website and updating the &quot;Last updated&quot; date.
          </p>

          <div className="bg-slate-900 text-white rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Have Questions About Your Privacy?</h2>
            <p className="text-slate-300 mb-6">
              If you have any questions about this Privacy Policy or our privacy practices, we&apos;re here to help.
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
