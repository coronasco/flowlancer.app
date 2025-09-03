import { NextResponse } from "next/server";

function nonce() {
	return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
}

export function middleware() {
	const res = NextResponse.next();

	const env = process.env.NODE_ENV;
	if (env !== "production") {
		// Dev: CSP relaxat pentru a permite hidratarea, HMR și OAuth
		const cspDev = [
			"default-src 'self' data: blob:",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: blob: https:",
			"font-src 'self' data:",
			"connect-src 'self' ws: wss: https://*.googleapis.com https://*.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
			"frame-src 'self' https://accounts.google.com https://github.com https://*.github.com https://*.firebaseapp.com",
		].join("; ");
		res.headers.set("Content-Security-Policy", cspDev);
		res.headers.set("X-Frame-Options", "SAMEORIGIN");
		res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
		return res;
	}

	// Prod: CSP strictă dar compatibilă cu Next + Firebase OAuth
	const cspNonce = nonce();
	res.headers.set("x-csp-nonce", cspNonce);
	const csp = [
		"default-src 'self'",
		"base-uri 'self'",
		`script-src 'self' 'nonce-${cspNonce}' https://www.gstatic.com https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data:",
		"connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
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
