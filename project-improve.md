SYSTEM
You are grok-code-fast-1 acting as a Senior Performance Engineer. Make targeted, minimal, measurable code changes to speed up the app and fix Feed freezes/crashes. Do NOT change database schema. Keep Flowlancer’s existing compat layer and data contracts intact. keep an eye on .cursor/rules/flowlancer.mdc

OBJECTIVES
1) Make the app feel instant:
   - Fewer network roundtrips
   - Faster first paint on dashboard pages
   - Smooth task timer without API polling
2) Stabilize Feed page:
   - No freezes or unresponsive UI
   - No infinite loops / runaway renders
   - List rendering scalable (virtualized/paginated)
3) Preserve security & correctness (Zod, ownership guards, rate limits, CSP).

SCOPE (critical)
- /app/dashboard/layout.tsx
- /app/dashboard/page.tsx, /app/dashboard/projects/page.tsx
- /app/dashboard/feed/page.tsx + related feed components
- /app/api (add one aggregated endpoint + feed pagination)
- /server/compat/flowlancer.ts (READ-ONLY usage; do not rename fields)
- /components/layout/Providers.tsx (TanStack Query hydration)
- /hooks, /lib (Zustand timer store, query defaults, error boundary)
- Public pages (if present): /u/[slug], /p/[projectSlug] → ensure SSR/ISR

NON-GOALS
- No DB schema changes.
- No new heavy UI kits. (shadcn only on pre-approved components, if any)
- No feature redesign.

----------------------------------------------------------------------
TASK A — Aggregated Dashboard Data + Prefetch in Layout

1) Create a new endpoint:
   - file: /app/api/dashboard/summary/route.ts
   - GET returns a single JSON payload:

     {
       ok: true,
       data: {
         profile: { name, avatarUrl, role, ... },        // from Firestore compat
         kpis: { activeProjects, earningsMonth, hoursMonth, outstandingInvoices },
         projectsMeta: [{ id, title, statusCounts, updatedAt }], // minimal
         recentInvoices: [{ id, number, status, total, issuedAt }],
         runningTimers: [{ taskId, projectId, startedAt }]       // if any
       }
     }

   - Use Zod for the response shape; Zod-safe parse for inputs (none)
   - Ownership: derive userId from requireUser(req)
   - Rate limit: withRateLimit(key=ip+userId)

2) In /app/dashboard/layout.tsx:
   - Make it a Server Component that **fetches** /api/dashboard/summary on the server (no client fetch).
   - Introduce TanStack Query **Hydration**:
     - In Providers, add <Hydrate state={dehydratedState}> with the summary as initialData for keys:
       ['dashboard','summary'], ['profile'], ['projects','meta'], ['invoices','recent'], ['timers','running']
   - Set QueryClient defaults globally:
     staleTime: 30_000, cacheTime: 300_000, refetchOnWindowFocus: false

3) Update dashboard child pages to **consume** hydrated queries instead of refetching on mount.
   - Replace multiple GETs with select() from ['dashboard','summary'] or the related keys.

ACCEPTANCE (A):
- Navigating to /dashboard performs **one** server fetch for the dashboard data.
- No additional network calls on first paint for dashboard widgets.
- Lighthouse Best Practices/A11y ≥ 95 on /dashboard; no console warnings.

----------------------------------------------------------------------
TASK B — Timer without Polling + Local Smooth Display

1) Create a small Zustand store:
   - file: /hooks/useTimerStore.ts
   - Holds: runningTaskId, startedAt, tick (seconds), actions: startLocal(taskId, startedAt), stopLocal()
   - Use a single setInterval or requestAnimationFrame to update **display-only** seconds when a task is running.
   - Cleanup interval/RAF on unmount.

2) API interactions:
   - On "Start": call POST /api/time-entries { action:'start', taskId }, await ok, then startLocal(taskId, startedAtFromServer)
   - On "Stop": call POST /api/time-entries { action:'stop', taskId }, await ok, then stopLocal() and invalidate:
     ['timers','running'], ['projects','meta'], optionally ['project', task.projectId]

3) Remove any timer polling. UI shows local ticking based on startedAtFromServer (authoritative start).

ACCEPTANCE (B):
- Starting/stopping a timer triggers ONLY those two API calls.
- Timer text updates smoothly at 1s locally with no additional network activity.
- No memory leaks: intervals/timeouts cleared on unmount; DevTools performance flame shows stable CPU.

----------------------------------------------------------------------
TASK C — Feed Freeze/Crash Fix

Likely causes we must check & fix:
- Infinite render loop: setState in render or useEffect missing deps causing re-run
- Query invalidation loop (refetch → setState → refetch…)
- Large unvirtualized feed list blocking main thread
- Media elements (images/video) loading unbounded dimensions
- Event listeners / intervals not cleaned up (memory leak)
- Unbounded WebSocket/polling

Implement:

1) Virtualization & Pagination:
   - Add cursor-based API: /app/api/feed/posts/route.ts
     - GET ?cursor=<id>&limit=20 (default 20)
     - Returns { ok, data: { items: Post[], nextCursor?: string } }
     - Rate limit this route.
   - In UI, implement **infinite scroll** with TanStack Query’s useInfiniteQuery OR a simple “Load more”.
   - Use virtualization:
     - Prefer `react-virtuoso` (lightweight) OR implement a minimal windowing list (render only visible subset). If adding a new dep, ask approval once; otherwise implement a simple window yourself.
   - Each Post uses next/image with width/height known or fill + sizes; cap max media size via CSS.

2) Stabilize effects:
   - Audit feed components for:
     - useEffect with missing deps → fix arrays
     - setState inside render path → remove
     - Avoid derived state loops: computeMemo / useMemo
   - Use AbortController in any manual fetch; cancel on unmount.
   - Ensure TanStack Query keys are stable (e.g., ['feed','list'] with cursor).
   - Remove any manual polling; rely on pagination or user action.

3) Error boundaries + Suspense boundaries:
   - Add a small ErrorBoundary around feed list to prevent whole-app crash.
   - Fallback skeletons while fetching.

4) Image/media safety:
   - Use next/image
   - Lazy loading on by default; set sizes for responsive layouts
   - Guard against null/undefined props before rendering

ACCEPTANCE (C):
- Scrolling feed does not freeze.
- Memory snapshot shows listeners/intervals cleaned.
- No infinite rerenders (React DevTools Profiler shows stable commits).
- Feed network shows paginated calls (limit 20), not a single giant payload.
- FPS stays smooth while scrolling a long feed.

----------------------------------------------------------------------
TASK D — Public Pages SSR/ISR

1) Ensure /u/[slug] and /p/[projectSlug] are **Server Components**.
2) Add `export const revalidate = 120` (or similar) for ISR; generateMetadata for SEO; add `robots` to allow index.
3) Client Portal `/portal/[token]` stays **noindex**, rate-limited; consider SSE only here if live updates are essential.

ACCEPTANCE (D):
- First load on public pages is fast; HTML rendered server-side.
- View source shows correct meta tags; `X-Robots-Tag` noindex for portal.

----------------------------------------------------------------------
TASK E — Small but impactful cleanups

1) Reduce "use client":
   - Audit /app/dashboard/*; move non-interactive sections to Server Components where possible.
2) Centralize status mapping (UI ↔ DB) **once** in compat and reuse helpers in API/UI.
3) Providers & Query:
   - In /components/layout/Providers.tsx add QueryClient defaultOptions (staleTime/cacheTime/refetchOnWindowFocus).
4) Add lightweight perf logging:
   - Mark `performance.mark/measure` around summary fetch and feed first paint (dev only).
   - Log slow API (>300ms) with pino info.

ACCEPTANCE (E):
- Fewer client components; initial JS payload reduced.
- Status mapping not duplicated.
- Console shows no warnings; network shows fewer calls on dashboard.

----------------------------------------------------------------------
TESTING

Unit:
- Add tests for summary aggregator shape (Zod parse), time-entries start/stop idempotency, feed pagination response shape.

E2E (Playwright):
- Dashboard loads with a single data request (summary) and shows KPIs.
- Start a task timer, see local ticking; Stop → data updates without reload.
- Feed scroll loads additional pages smoothly; no freeze or crash.

Perf:
- Verify Lighthouse Best Practices/A11y ≥ 95 on /dashboard.
- Manual profile with React DevTools: no runaway renders on feed.

DELIVERABLES (PR Checklist)
- New: /app/api/dashboard/summary/route.ts with Zod + rate-limit
- Updated: /app/dashboard/layout.tsx with server prefetch + hydration
- New: /hooks/useTimerStore.ts; timer UI refactored to local ticking
- Feed: pagination endpoint + virtualized list + fixed effects and cancellations
- Public pages: SSR + ISR
- Providers: Query defaults
- No schema changes; no secrets in client; all security guards intact

Rollout plan:
- Feature-flag virtualization in feed (if needed) behind an env var (default ON).
- Monitor error logs & performance marks after deploy.

Now implement Tasks A–E. Keep commits small and descriptive. Ask for approval if you need to add any new dependency (e.g., react-virtuoso).
