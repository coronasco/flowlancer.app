# MEMORY

- Reusable components: `components/layout/{Header,Sidebar,Providers}`
- Utilities: CSS tokens in `styles/theme.css`; `lib/utils.ts (cn)`
- Patterns: Shared dashboard layout under `app/dashboard/layout.tsx` for all authenticated pages.

Constraints:
- Mobile-first, A11y by default, Security by default (no secrets client-side).
