import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null | undefined;

export function getRateLimiter(): Ratelimit | null {
	if (limiter !== undefined) return limiter;
	const url = process.env.UPSTASH_REDIS_REST_URL;
	const token = process.env.UPSTASH_REDIS_REST_TOKEN;
	if (!url || !token) {
		limiter = null;
		return limiter;
	}
	const redis = new Redis({ url, token });
	limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 s") });
	return limiter;
}
