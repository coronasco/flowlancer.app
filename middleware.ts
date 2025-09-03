import { NextResponse } from "next/server";

function generateNonce() {
	return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
}

export function middleware() {
	const res = NextResponse.next();
	
	// Generate a unique nonce for each request
	const nonce = generateNonce();

	// Pass nonce to the response for use in layout
	res.headers.set("x-nonce", nonce);
	
	const env = process.env.NODE_ENV;
	if (env !== "production") {
		// Dev: Use nonce even in development for consistency
		const cspDev = [
			"default-src 'self' data: blob:",
			`script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`,
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob: https:",
			"font-src 'self' data:",
			"connect-src 'self' ws: wss: https://*.googleapis.com https://*.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.supabase.co https://*.firebaseio.com https://firestore.googleapis.com https://ingest.sentry.io https://vercel-insights.com",
			"frame-src 'self' https://accounts.google.com https://github.com https://*.github.com https://*.firebaseapp.com",
		].join("; ");
		res.headers.set("Content-Security-Policy", cspDev);
		res.headers.set("X-Frame-Options", "SAMEORIGIN");
		res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
		return res;
	}

	// Production: Strict CSP with dynamic nonce
	const csp = [
		"default-src 'self'",
		"base-uri 'self'",
		`script-src 'self' 'nonce-${nonce}' https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data:",
		"connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://*.supabase.co https://*.firebaseio.com https://firestore.googleapis.com https://ingest.sentry.io https://vercel-insights.com",
		"frame-src 'self' https://accounts.google.com https://github.com https://*.github.com https://*.firebaseapp.com",
		"frame-ancestors 'none'",
	].join("; ");
	res.headers.set("Content-Security-Policy", csp);
	res.headers.set("X-Frame-Options", "DENY");
	res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
	return res;
}

export const config = {
	matcher: "/:path*",
};
