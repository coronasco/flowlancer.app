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
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Image src="/flowlancer_logo_light.svg" alt="Flowlancer" width={32} height={32} />
                <span className="text-xl font-semibold">Flowlancer</span>
              </div>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Professional freelance management platform built for modern workflows. Streamline projects, track time, and grow your business.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <span className="text-sm">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <span className="text-sm">in</span>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors">
                  <span className="text-sm">yt</span>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-4">
                <li><Link href="/#features" className="text-slate-300 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/login" className="text-slate-300 hover:text-white transition-colors">Get Started</Link></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Roadmap</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Templates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-slate-300 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-slate-300 hover:text-white transition-colors">Contact</Link></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Press Kit</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
            <div className="text-sm text-slate-400">
              © 2024 Flowlancer. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
