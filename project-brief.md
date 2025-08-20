You are a Staff Engineer. Scaffold a brand-new production-grade web app using modern best practices, with strong security, reusable code, and persistent project memory (docs & generators). IMPORTANT: 
- Use a single shared app layout under /app/dashboard/layout.tsx for all authenticated pages.

Read and follow CURSOR_RULES.txt (image-based style policy, shadcn opt-in, security, a11y, DRY).

# 0) Target stack
- Next.js (App Router, RSC), TypeScript strict
- Tailwind CSS (custom UI first), Radix primitives when needed, Sonner (toasts)
- shadcn/ui ONLY if explicitly approved (Dialog, Dropdown, Tooltip, Sheet, Command, Tabs) — ASK before adding
- React Hook Form + Zod; TanStack Query for server state; Context + hooks for app state
- Data: Firestore + Supabase **compatible with existing Flowlancer schema**; server-only access through a repository layer
- Auth: Auth.js (NextAuth) or Firebase Auth — choose ONE; prefer Auth.js for this scaffold
- Validation: Zod shared client/server
- API: Next.js Route Handlers (BFF). No direct DB from browser
- Payments: Stripe placeholders (Checkout + Webhooks)
- Telemetry: Sentry (server+client), logger (pino)
- Infra: GitHub Actions CI, ESLint/Prettier, Husky + lint-staged, commitlint
- Tests: Vitest (unit), Playwright (e2e happy path)
- Security: security headers, CSP nonce, rate limit (Upstash), input validation, RBAC

# 1) Repository layout (specific to this project)
# Authenticated app uses a single shared layout at /app/dashboard/layout.tsx
- /app/page.tsx                        (marketing or redirect to /dashboard if logged-in)
- /app/(public)/{home,about,pricing}/page.tsx   (optional marketing)
- /app/dashboard/layout.tsx            (Shared layout: Sidebar + Header + Providers)
- /app/dashboard/page.tsx              (Dashboard home)
- /app/dashboard/profile/page.tsx
- /app/dashboard/projects/page.tsx
- /app/dashboard/invoices/page.tsx
- /app/dashboard/feed/page.tsx
- /app/dashboard/settings/page.tsx
- /app/api/**                          (Route Handlers only)
- /components/{ui,layout,brand,forms,charts,common}/**
- /components/{dashboard,profile,projects,invoices,feed}/**
- /lib/{auth,db,logger,env,rate-limit,errors,utils,cn}.ts
- /server/modules/{users,projects,invoices,feed}/repo.ts   (Repository pattern)
- /server/compat/flowlancer.ts         (🔥 DB compatibility adapters to EXISTING schema)
- /hooks/**  (useIsClient, useDebounce, useKeyboardNav, etc.)
- /contexts/** (ThemeContext, OnboardingContext, SessionContext)
- /styles/{globals.css,theme.css}
- /scripts/**  (codegen, seeds)
- /docs/{ARCHITECTURE.md,SECURITY.md,DECISIONS.md,API.md,STYLEGUIDE.md,MEMORY.md}
- /tests/{unit,e2e}/**

# 2) Environment & config (12-factor)
Create /lib/env.ts with Zod validation and .env.example (document in /docs/SECURITY.md).
Required:
- NEXTAUTH_SECRET= / NEXTAUTH_URL=
- FIREBASE_… (only if you choose Firebase Auth; otherwise omit)
- NEXT_PUBLIC_SUPABASE_URL=  (if using Supabase)
- SUPABASE_SERVICE_ROLE_KEY=  (server-only)
- STRIPE_SECRET_KEY= / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
- SENTRY_DSN=
- UPSTASH_REDIS_REST_URL= / UPSTASH_REDIS_REST_TOKEN=
- APP_URL= / NEXT_PUBLIC_APP_URL=

# 3) Security defaults
- Middleware: strict headers (CSP with nonce, X-Frame-Options DENY, Referrer-Policy, minimal Permissions-Policy), origin allowlist
- /lib/rate-limit.ts (Upstash sliding window) → apply to login, AI, webhooks, portal
- /lib/errors.ts → AppError safe messages
- RBAC: /server/modules/users/roles.ts; guard helpers
- Zod validation on every API route; 400 on parse error
- No secrets in client bundles

# 4) Auth & session
- Configure Auth.js with email/password + Google/GitHub (or confirm Firebase Auth; pick ONE)
- JWT session with minimal claims { userId, role }
- Helpers:
  - requireUser(req): verifies session → { userId, role }
  - requireRole(role)
- Client: <SessionProvider> + typed useSession()

# 5) Database access layer (Repository + Compatibility)
- /server/db.ts sets Firestore Admin + Supabase Admin (server-only)
- /server/compat/flowlancer.ts:
  - Map existing Flowlancer collections/tables to typed interfaces (without changing schema)
  - E.g., Firestore paths: customers/{uid}/…; Supabase tables: projects, tasks, invoices, milestones, time_entries
  - Provide adapters to read/write exactly as current Flowlancer expects
- /server/modules/{users,projects,invoices,feed}/repo.ts use ONLY the compat adapters
- All functions accept userId (ownership guarded server-side)

# 6) API patterns (BFF)
- /app/api/_helpers/route.ts: withAuth(handler, roles?), withRateLimit(keyFn), handleError
- Endpoints (names compatible with Flowlancer flows):
  - POST /api/projects                  → create project (owner=userId)
  - GET  /api/projects                  → list projects for user
  - POST /api/projects/[id]/tasks       → add task (status, estimate)
  - POST /api/invoices/from-project     → draft invoice from project
  - POST /api/feed/posts                → create post (text + optional media)
  - POST /api/stripe/webhook            → verify signature; idempotent
- Responses: { ok, data? , error? } with Zod DTOs for request/response

# 7) UI kit (custom first; shadcn opt-in)
- /components/ui: Button, Card, Input, Textarea, Select, Checkbox, Toggle, Avatar, Badge, Tooltip, Dialog, Dropdown, Tabs, Skeleton, StatTile, Stepper
- Use Tailwind + Radix; use shadcn **only after asking for approval** per component (file header: /* APPROVED-SHADCN: Dialog */)
- A11y: aria, keyboard nav, visible focus

# 8) Brand & theme
- /components/brand/Logo.tsx → infinity “∞” forming lowercase “f”; gradient only on “f”; rest white; export mark+full
- /styles/theme.css → CSS variables (colors, radii, shadows, spacing). Dark by default, light parity
- Utilities: .brand-gradient, .brand-ring

# 9) Page shells (under /app/dashboard with shared layout)
- /app/dashboard/layout.tsx → Sidebar + Header + Providers (QueryClient, Sonner, Theme)
- /app/dashboard/page.tsx → 4 KPIs, recent activity, mini “Daily Pulse”
- /app/dashboard/profile/page.tsx → owner edit vs public view preview; sections: avatar, bio, role, experience, skills, projects (read-only from PM), socials, hourly-rate AI card, client feedback; visibility toggles
- /app/dashboard/projects/page.tsx → board lists (Backlog/In Progress/Review/Done), task cards, timer chip, client share link; “Generate Proposal” dialog (contextual)
- /app/dashboard/invoices/page.tsx → list, status, preview; “Create from project”
- /app/dashboard/feed/page.tsx → composer + list (rate-limited)
- /app/dashboard/settings/page.tsx → account, privacy (profile section visibility), notifications, billing (Stripe)
**All must respect current Flowlancer data contracts via /server/compat/flowlancer.ts.**

# 10) Onboarding flow (shared layout)
- Persist onboardingProgress (0..5) server-side (compatible with Flowlancer), fallback local
- Steps: Intro (dashboard) → Profile → Hourly Rate (AI) → Public Profile SEO → Projects tour → Invoices tour → Finish
- Components: <OnboardingCoachmark />, <OnboardingStepper />, route guards under /app/dashboard/*

# 11) Utilities & hooks
- hooks: useIsClient, useDebounce, useLocalStorage, useClipboard, useKeyboardNav, useMediaQuery
- utils: slugify, formatCurrency (locale-aware), cn, safeParse (zod)
- logger: /lib/logger.ts (pino), include requestId

# 12) Testing & CI
- Vitest: unit for repo functions + utils
- Playwright: e2e happy path (login → create project → add task → create invoice)
- GitHub Actions: lint + typecheck + test + build on PR
- Husky pre-commit: lint-staged + typecheck + unit tests

# 13) Project MEMORY (reuse)
- /docs/MEMORY.md records:
  - components/hooks/utils created for reuse
  - API contracts & Zod schemas
  - decisions & conventions
- scripts/generate-module.ts (or plop) scaffolds:
  - repo.ts, routes, zod schemas, tests, UI shell
- MEMORY checklist: “what to reuse” step before new code

# 14) Example feature end-to-end (Projects)
- Zod DTOs: ProjectCreate, TaskCreate
- Repo functions (via compat): createProject(userId, data), listProjects(userId), addTask(userId, projectId, data)
- API routes use withAuth + withRateLimit + handleError
- UI (under /app/dashboard/projects) uses TanStack Query; RHF+Zod forms; optimistic updates
- Unit tests for repo; e2e covers the flow

# 15) Acceptance criteria
- App boots with `pnpm dev`; lint/typecheck/test/build all pass
- Shared layout works: all authenticated pages under /app/dashboard/* inherit /app/dashboard/layout.tsx
- ENV validation fails fast if missing; security headers set; CSP nonce present; rate limit wired
- No secrets in client bundle; only server uses keys
- Pages render with mock/minimal data; compat layer mirrors current Flowlancer schema (NO schema changes)
- MEMORY.md created; generator scaffolds a module
- Lighthouse on /dashboard: A11y ≥95, Best Practices ≥95; no console errors

# 16) Nice-to-have (todo comments)
- next-seo, sitemap/robots, feature flags, signed uploads, i18n skeleton, Connect Wallet placeholder

Now scaffold the repository, create the exact file/folder structure above (with /app/dashboard/layout.tsx as the shared layout), baseline configs, core providers, UI kit (custom-first), security middleware, env validation, MEMORY.md, generator script, the compat layer for current Flowlancer DB, and complete the Projects feature as the exemplar. Keep PRs small and document in /docs. Ask for approval before using any shadcn component.
