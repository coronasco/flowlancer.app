# MEMORY

- Reusable components: `components/layout/{Header,Sidebar,Providers,Footer}`, `components/ui/*` (Button, Card, Input, Avatar, etc.)
- Utilities: CSS tokens in `styles/theme.css`; `lib/utils.ts` with utilities for text, currency, validation, etc.
- Patterns: Shared dashboard layout under `app/dashboard/layout.tsx` for all authenticated pages.

## Utilities (`lib/utils.ts`):
- `cn()` - Tailwind class merging
- `slugify()` - URL-friendly slugs
- `formatCurrency()` - Locale-aware currency formatting  
- `safeParse()` - Safe Zod parsing with error handling
- `generateId()` - Random ID generation
- `truncate()` - Text truncation with ellipsis
- `formatRelativeTime()` - Relative time formatting ("2 hours ago")
- `debounce()` - Function debouncing
- `formatFileSize()` - Human-readable file sizes
- `isValidEmail()` - Email validation
- `getInitials()` - Name initials extraction

## Features Implemented:
- **Settings Page**: Account, Privacy toggles, Notifications, Billing placeholder
- **Time Tracking API**: Start/stop timers for tasks (`/api/time-entries`)
- **Invoice from Project**: Auto-generate invoices from done tasks + time tracking with full modal UI
- **Project Proposals**: AI-powered proposal generation with customizable tone and options (`/api/projects/[id]/proposal`)
- **Modern UI**: Full-width layouts, consistent design across all pages
- **Real Data Integration**: All pages display real data from Supabase/Firestore
- **Complete Onboarding Flow**: 6-step guided setup with OnboardingCoachmark and OnboardingStepper components
- **Admin Dashboard**: Complete admin functionality with user management, analytics, and activity monitoring (using Firebase `isAdmin` field) - **REAL DATA** from Firebase & Supabase
  - **Analytics Page**: Comprehensive KPIs, user engagement, revenue breakdown, project success metrics
  - **Activity Monitor**: Real-time user actions with filtering by time/action, detailed event logging
  - **Users Management**: Complete user overview with search, filtering, and detailed metrics
- **Modern Sidebar**: Redesigned with admin section, user info, and improved navigation
- **Project Management Fixes**: Delete confirmations, auto-completion when all tasks are done, fixed modal z-index issues
- **Client Portal System**: Complete client collaboration platform with secure share tokens, real-time project progress tracking, task-specific commenting, feedback/rating system for completed projects, rate limiting, portal link management (generate/revoke/copy), SQL schemas for client_comments and client_feedback tables
- **Feed Enhancements**: Full comments and likes system with avatar display, SQL schema for feed_comments and feed_likes tables, optimized performance with single JOIN queries, real-time likes with optimistic updates, paginated comments with infinite scroll (5 per page), consistent card design matching dashboard style, real user avatars and names from Firestore for posts and comments, owner dropdown menus (edit/delete), clean inline comments UI, advanced auto-link detection for URLs (with/without protocol), clickable links opening in new tabs, removed unnecessary Save button, real-time comment updates, English language throughout, trending hashtags extraction from real posts, community statistics (total posts/users/likes/comments), freelancer-specific tips sidebar

## Contexts & State:
- `contexts/OnboardingContext.tsx` — persists `onboardingStep` per user in Firestore (`customers/{uid}.onboardingStep`) with localStorage fallback for guests. Intended reuse: gating small coachmarks/first-run hints. Do not store PII in this context.
- `contexts/SessionContext.tsx` — Firebase Auth session management

## UI Components:
- `components/common/Coachmark.tsx` — lightweight tip bubble. Reuse for onboarding hints across dashboard pages.
- `components/layout/Footer.tsx` — Professional footer component with 4-column layout, social links, and comprehensive navigation. Used on all public pages.
- `components/onboarding/OnboardingCoachmark.tsx` — Interactive coaching tooltips with step progression. Used for guiding users through setup.
- `components/onboarding/OnboardingStepper.tsx` — Progress indicator showing 6 onboarding steps with visual completion states.
- `components/ui/*` — Custom UI components (Button, Card, Input, Avatar, Dialog, etc.)

## API Patterns:
- All API routes use `withAuth()` for authentication
- Zod validation on all inputs
- Consistent error handling with `handleError()`
- Rate limiting on sensitive endpoints
- Admin API routes with role-based access control (`/api/admin/*`)

Constraints:
- Mobile-first, A11y by default, Security by default (no secrets client-side)
- Use custom UI first, shadcn only when approved
- All data fetching through compatibility layer (`server/compat/flowlancer.ts`)
