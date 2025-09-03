# Security Defaults

- Strict CSP via `middleware.ts` (dev relaxed, prod with nonce)
- Auth required for `/dashboard/*` via `RequireAuth`
- Server-side ownership checks: all repo funcs accept `userId`
- Input validation: Zod schemas in API (DTOs) and `/lib/env.ts`
- Rate limiting: Upstash optional via `withRateLimit`
- Headers: X-Frame-Options, Referrer-Policy, minimal Permissions-Policy
- No secrets in client bundles; server-only keys in `/server/*`

## Environment
See `/lib/env.ts`. Provide `.env.example` mirroring required/optional keys.

## Webhooks
Stripe webhook placeholder validates presence; enable signature verification when `STRIPE_SECRET_KEY` is set.
