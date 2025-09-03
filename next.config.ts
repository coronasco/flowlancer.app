import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
			{ protocol: "https", hostname: "avatars*.githubusercontent.com", pathname: "/**" },
			{ protocol: "https", hostname: "secure.gravatar.com", pathname: "/**" },
		],
	},
	// Sentry (optional)
	experimental: {
    },
};

export default nextConfig;
