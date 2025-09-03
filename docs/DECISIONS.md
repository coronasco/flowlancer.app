# Architectural Decisions

- Auth: Firebase Auth (Google/GitHub) chosen for simplicity and CSP constraints
- DB: Supabase compat via `/server/compat/flowlancer.ts` with in-memory fallback
- API: Route Handlers using helpers (`withAuth`, `withRateLimit`, `handleError`)
- UI: Custom Tailwind components; shadcn opt-in only if approved
- Tests: Vitest unit + Playwright e2e baseline
