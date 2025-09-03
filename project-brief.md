You are a Staff Engineer. Scaffold a brand-new production-grade web app using modern best practices, with strong security, reusable code, and persistent project memory (docs & generators).

IMPORTANT:
- Use a single shared app layout under /app/dashboard/layout.tsx for ALL authenticated pages.

Read and obey CURSOR_RULES.txt (image-based style policy, shadcn opt-in, security, a11y, DRY).

# 0) Target stack
- Next.js (App Router, RSC), TypeScript strict
- Tailwind CSS (custom UI first), Radix when needed, Sonner (toasts)
- shadcn/ui ONLY if explicitly approved (Dialog/Dropdown/Tooltip/Sheet/Command/Tabs) — ASK before adding
- React Hook Form + Zod; TanStack Query for server state; Context + hooks for app state
- Data: Firestore + Supabase (server-only) via a repository + compat layer
- Auth: Auth.js (NextAuth) OR Firebase Auth — choose ONE for scaffold (prefer Auth.js)
- Validation: Zod shared client/server
- API: Next.js Route Handlers (BFF). No direct DB from browser.
- Payments: Stripe placeholders (Checkout + Webhooks)
- Telemetry: Sentry (server+client), logger (pino)
- Infra: GitHub Actions CI, ESLint/Prettier, Husky + lint-staged, commitlint
- Tests: Vitest (unit), Playwright (e2e)
- Security: headers (CSP nonce), rate limit (Upstash), strict input validation, RBAC

# 1) Repository layout
- /app/page.tsx                        (marketing or redirect to /dashboard if logged-in)
- /app/(public)/{home,about,pricing}/page.tsx   (optional)
- /app/dashboard/layout.tsx            (Sidebar + Header + Providers)
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
- /server/modules/{users,projects,invoices,feed}/repo.ts
- /server/compat/flowlancer.ts         (🔥 adapters to EXISTING Flowlancer schema)
- /hooks/**  (useIsClient, useDebounce, useKeyboardNav, etc.)
- /contexts/** (ThemeContext, OnboardingContext, SessionContext)
- /styles/{globals.css,theme.css}
- /scripts/**  (codegen)
- /docs/{ARCHITECTURE.md,SECURITY.md,DECISIONS.md,API.md,STYLEGUIDE.md,MEMORY.md}
- /tests/{unit,e2e}/**

# 2) Environment & config (12-factor)
- /lib/env.ts with Zod validation and .env.example (document in /docs/SECURITY.md).
Required:
  NEXTAUTH_SECRET / NEXTAUTH_URL
  (If Firebase Auth is chosen: FIREBASE_* keys; otherwise omit)
  NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (server-only)
  STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  SENTRY_DSN
  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
  APP_URL / NEXT_PUBLIC_APP_URL

# 3) Security defaults
- Middleware: CSP nonce, X-Frame-Options DENY, Referrer-Policy strict, minimal Permissions-Policy, origin allowlist
- /lib/rate-limit.ts (Upstash sliding window) → apply to login, AI, webhooks, portal, public POSTs
- /lib/errors.ts → AppError safe messages (never leak stack to user)
- RBAC: /server/modules/users/roles.ts; guard helpers
- ALL API routes: Zod validation; 400 on parse error
- NEVER ship secrets to client

# 4) Auth & session
- Configure Auth.js (email/pass + Google/GitHub) OR Firebase Auth (choose one; default Auth.js).
- JWT sessions with minimal claims { userId, role }.
- Helpers:
  requireUser(req): verifies session ⇒ { userId, role }
  requireRole(role)
- Client: <SessionProvider> + typed useSession()

# 5) DB access layer (Repository + COMPATIBILITY)
- /server/db.ts sets Firestore Admin + Supabase Admin (server-only).
- /server/compat/flowlancer.ts MUST map EXACT existing entities:
  Firestore:
    customers/{uid}/info, profileLinks, projects, proposals, transactions, checkout_sessions, subscriptions, payments, logs, simulations, profileAudit (legacy), feedback, userActivity, timeEntries, invoices, dailyTasks, etc.
  Supabase:
    projects, tasks, milestones, time_entries, invoices, invoice_items, (any existing tables)
- Provide read/write adapters that conform to current field names (e.g., task.status values: 'todo'|'in_progress'|'review'|'done'; time_entries fields: user_id, task_id, started_at, stopped_at, minutes, etc.). Do NOT rename or reshape DB fields.

# 6) USER FLOW & FEATURES (explicit requirements)

A) PROFILE (owner editable + public SEO version)
- Fields: avatar (upload), name, role/title, location, bio/description (markdown safe), experience (simple list), skills (tags), projects (showcase – sourced from PM “Done”/Case Study), socials (GitHub/LinkedIn/Site/X/Dribbble/Behance), hourly rate (AI-assisted), client feedback (from existing feedback links), visibility toggles per section.
- Avatar Upload: server-signed upload (use existing storage provider as in Flowlancer; DO NOT change buckets/paths).
- Hourly Rate Card (AI): “Generate with AI” uses role + skills + experience + location → returns { basic, standard, rush, rationale }. User saves one; store where current app stores rate (KEEP SAME location/fields).
- Public Profile Route: `/p/[slug]` (SSR). SEO indexable (next-seo), OpenGraph image, schema.org/Person, canonical, included in sitemap. Owner chooses what sections are public via visibility toggles (persist exactly where current app stores them). If profile_public=false ⇒ 404 soft + robots noindex.

B) PROJECTS (Project Manager) with LIVE TIME TRACKING on tasks
- Board with columns: To Do / In Progress / Review / Done (use EXACT status values used in DB).
- Task cards with timer chip (Start/Stop). Start/Stop must call server routes; server sets timestamps & computes minutes (DO NOT trust client time). Prevent double-start; provide idempotency. Persist time entries in the exact existing table/collection.
- Brainstorm/notes as per current app (read/write through compat).
- Client Share:
  - **TWO assets**:
    (1) Public Project Page (Showcase/Case Study) at `/p/[projectSlug]` — SEO indexable; shows scope/summary, images, timeline, public tasks snapshot (read-only), results/links; controlled by project.visibility flags.
    (2) Client Live Portal at `/portal/[token]` — LIVE progress/time/milestones; **NOINDEX** + tokenized; rate-limited; mirrors current Flowlancer portal semantics. Keep security model intact.
- “Generate Proposal” action in project header (contextual AI) → draft proposal (summary, milestones, timeline, price) using project data + rate; export/copy (DO NOT change schema; this is a UI/doc artifact).

C) INVOICES
- “Create from project”: build draft invoice from:
  - tasks in **Done** + related time entries (match current business rules),
  - compute subtotal/tax/total exactly as current Flowlancer.
- Invoice list + status; PDF preview/export.
- Payments Stripe milestones already scaffolded (placeholders); keep metadata compatible.

D) FEED (optional shell, rate-limited)
- Composer (text + optional media URL), Post list. Sanitize HTML. Use existing collections/tables if present; otherwise leave shell.

E) SETTINGS
- Account, Privacy (profile section visibility toggles), Notifications, Billing (Stripe), Delete Account (moved here, must call existing delete flow; DO NOT break current behavior).

F) SEO
- Public pages indexable: `/u/[slug]`, `/p/[projectSlug]` (add to sitemap).
- Client Portal: `noindex, nofollow`, no sitemap, strong CORS & rate limit.
- OG images for profile/project (generate dynamic if possible; else static fallback).

# 7) API patterns (BFF)
- /app/api/_helpers/route.ts: withAuth(handler, roles?), withRateLimit(keyFn), handleError
- Endpoints (compatible names):
  - POST /api/projects
  - GET  /api/projects
  - POST /api/projects/[id]/tasks
  - PATCH /api/tasks/[taskId]                 (status/title/estimate/order)
  - POST /api/time-entries                    ({ action:'start'|'stop', taskId }) – server stamps time, computes minutes
  - POST /api/invoices/from-project           ({ projectId }) – build draft from Done + time entries
  - POST /api/profile/ai/hourly-rate          ({ role, skills[], experienceYears, location })
  - POST /api/feed/posts
  - POST /api/stripe/webhook
- All inputs via Zod; responses `{ ok, data? , error? }`. Ownership guard on EVERY query (user_id).

# 8) UI kit (custom-first; shadcn opt-in)
- /components/ui: Button, Card, Input, Textarea, Select, Checkbox, Toggle, Avatar, Badge, Tooltip, Dialog, Dropdown, Tabs, Skeleton, StatTile, Stepper
- A11y: aria, keyboard, focus ring visible
- Ask before shadcn usage; add `/* APPROVED-SHADCN: X */` in file header if approved

# 9) Brand & theme
- /components/brand/Logo.tsx: infinity “∞” forming lowercase “f”; gradient ONLY on “f”, rest white; export mark+full
- /styles/theme.css: CSS vars (colors, radii, shadows, spacing). Dark default; light parity
- Utilities: .brand-gradient, .brand-ring

# 10) Onboarding flow (shared layout)
- Persist onboardingProgress (0..5) in the SAME place current app uses (or Firestore fallback), else local storage fallback.
- Steps: Intro (dashboard) → Profile → Hourly Rate (AI) → Public Profile SEO → Project Manager tour (board, timer, client share) → Invoices tour → Finish.
- Components: <OnboardingCoachmark />, <OnboardingStepper />, route guards under /app/dashboard/*

# 11) Uploads & storage (must match current app)
- Reuse existing storage provider (Firebase Storage or Supabase Storage as used today).
- Provide a server route to create signed upload URLs; DO NOT expose service keys to client.
- Keep file pathing compatible with current conventions.

# 12) Utilities & hooks
- hooks: useIsClient, useDebounce, useLocalStorage, useClipboard, useKeyboardNav, useMediaQuery
- utils: slugify, formatCurrency (locale-aware), cn, safeParse (zod)
- logger: /lib/logger.ts (pino), include requestId

# 13) Testing & CI
- Vitest: unit tests for repo functions (projects/time-entries/invoices) + utils
- Playwright e2e: login → create project → add task → start/stop timer → move to Done → create invoice draft
- GitHub Actions: lint + typecheck + test + build on PR
- Husky pre-commit: lint-staged + typecheck + unit tests

# 14) Project MEMORY (reuse)
- /docs/MEMORY.md must record:
  - reusable components/hooks/utils created,
  - API contracts & Zod schemas,
  - design tokens & variants,
  - decisions & conventions.
- scripts/generate-module.ts scaffolds: repo.ts, routes, zod schemas, tests, UI shell.
- Before new code, search MEMORY.md and existing components to avoid duplication.

# 15) Acceptance criteria (feature-level)
PROFILE:
  - Owner can edit avatar/name/role/bio/experience/skills/socials/hourly-rate; visibility toggles persist in the existing place.
  - Public profile `/u/[slug]` is SSR, indexable, SEO meta + schema.org; only public sections visible; 404 soft if profile_public=false.

PROJECTS:
  - Board with exact status names; drag & drop updates status via API.
  - Timer per task: server-side start/stop (prevents double start), minutes computed server-side.
  - Client Share: SEO indexable `/p/[projectSlug]` (showcase) + separate tokenized `/portal/[token]` (live, noindex).

INVOICES:
  - Draft invoice from Done + time entries; totals computed as current app.

GLOBAL:
  - No schema changes; compat layer mirrors current Flowlancer collections/tables.
  - ENV validation & security headers present; rate limit wired.
  - Lighthouse on `/dashboard`: A11y ≥95, Best Practices ≥95; no console errors.

# 16) Nice-to-have (todo comments)
- next-seo, sitemap/robots, dynamic OG images
- feature flags, signed uploads, i18n skeleton
- Connect Wallet placeholder (future crypto escrow)

Now scaffold the repository, create the file/folder structure, baseline configs, core providers, UI kit (custom-first), security middleware, env validation, MEMORY.md, generator script, the compat layer for current Flowlancer DB, and complete the Projects feature as the exemplar (with live per-task time tracking and invoice-from-Done). Keep PRs small and document in /docs. Ask for approval before using any shadcn component.
