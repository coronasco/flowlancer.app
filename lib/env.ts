import { z } from "zod";

const EnvSchema = z.object({
	APP_URL: z.string().url().default("http://localhost:3000"),
	NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
	NEXTAUTH_URL: z.string().url().optional(),
	NEXTAUTH_SECRET: z.string().min(1).optional(),
	SENTRY_DSN: z.string().url().optional(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	STRIPE_SECRET_KEY: z.string().optional(),
	UPSTASH_REDIS_REST_URL: z.string().url().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
	NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
	SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

	// Firebase (required for auth)
	NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
	NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
	NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
	NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
	NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
	NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
	NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
});

const parsed = EnvSchema.safeParse({
	APP_URL: process.env.APP_URL,
	NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
	NEXTAUTH_URL: process.env.NEXTAUTH_URL,
	NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
	SENTRY_DSN: process.env.SENTRY_DSN,
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
	UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

	NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
});

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
	throw new Error("Environment validation failed. Check your .env");
}

export const env = parsed.data;
