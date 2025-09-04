import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";
import "@/styles/theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowlancer",
  description: "Freelance flow, accelerated.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get the nonce from the middleware
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set nonce for Next.js runtime scripts */}
        <Script
          id="nextjs-nonce-setup"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              window.__CSP_NONCE__ = '${nonce}';
              if (typeof window !== 'undefined') {
                const originalAppendChild = Element.prototype.appendChild;
                Element.prototype.appendChild = function(child) {
                  if (child.tagName === 'SCRIPT' && !child.nonce && !child.src) {
                    child.nonce = window.__CSP_NONCE__;
                  }
                  return originalAppendChild.call(this, child);
                };
              }
            `
          }}
        />
        
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4B3HZDC4N8"
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4B3HZDC4N8', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
