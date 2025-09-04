/**
 * Professional Footer Component
 * 
 * Usage:
 * ```tsx
 * import { Footer } from "@/components/layout/Footer";
 * 
 * <Footer />
 * ```
 */

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <Image src="/flowlancer_logo_light.svg" alt="Flowlancer" width={28} height={28} className="sm:w-8 sm:h-8" />
                <span className="text-lg sm:text-xl font-semibold">Flowlancer</span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed text-sm sm:text-base max-w-md">
                The complete freelance management platform. Streamline projects, track time, create invoices, and collaborate with clients.
              </p>
              
              {/* Quick Links for Mobile */}
              <div className="md:hidden mb-6">
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">Features</Link>
                  <Link href="/docs" className="text-slate-300 hover:text-white transition-colors">Docs</Link>
                  <Link href="/dashboard/upgrade" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
                  <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
                </div>
              </div>
            </div>

            {/* Quick Links - Desktop */}
            <div className="hidden md:block">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Product</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link href="/#features" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Features</Link></li>
                <li><Link href="/docs" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Documentation</Link></li>
                <li><Link href="/dashboard/upgrade" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Pricing</Link></li>
                <li><Link href="/login" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Get Started</Link></li>
              </ul>
            </div>

            {/* Support - Desktop */}
            <div className="hidden lg:block">
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">Contact</Link></li>
                <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base">About</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <span className="hidden sm:inline">•</span>
              <span className="text-slate-500">Made for freelancers, by freelancers</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-400">
              © 2024 Flowlancer
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
