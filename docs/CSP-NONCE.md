# CSP Nonce Implementation

## Overview

This document describes the implementation of dynamic nonce-based Content Security Policy (CSP) for the Flowlancer Next.js application deployed on Vercel.

## Problem Solved

- **Issue**: Inline scripts (Next.js runtime, GA/GTM snippets) were blocked by static CSP nonce
- **Solution**: Generate unique nonce per request with Next.js-compatible CSP policies
- **Security**: Maintains strict CSP in production with `'strict-dynamic'` for Next.js compatibility

## Implementation

### 1. Middleware (`middleware.ts`)

```typescript
function generateNonce() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString("base64");
}

export function middleware() {
  const nonce = generateNonce();
  res.headers.set("x-nonce", nonce);
  
  // CSP with dynamic nonce
  const csp = `script-src 'self' 'nonce-${nonce}' https://trusted-domains.com`;
}
```

**Features:**
- Generates cryptographically secure random nonce per request
- Passes nonce via `x-nonce` header to layout
- Development: Uses `'unsafe-inline'` for Next.js HMR compatibility
- Production: Uses `'strict-dynamic'` for Next.js runtime script loading
- Includes all required domains in `connect-src`
- Strict headers: `X-Frame-Options=DENY`, `Referrer-Policy`, minimal `Permissions-Policy`

### 2. Root Layout (`app/layout.tsx`)

```typescript
export default async function RootLayout({ children }) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';
  
  return (
    <html>
      <head>
        <Script nonce={nonce} src="external-script.js" />
        <Script nonce={nonce} dangerouslySetInnerHTML={{ __html: "inline code" }} />
      </head>
    </html>
  );
}
```

**Features:**
- Reads nonce from middleware header
- Applies nonce to all `<Script>` tags
- Injects nonce setup script for Next.js runtime compatibility
- Supports both external (`src`) and inline (`dangerouslySetInnerHTML`) scripts
- Conditional rendering for GA/GTM based on environment variables

### 3. Environment Variables

Added to `lib/env.ts`:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_GTM_ID` (optional)

### 4. Allowed Domains

**connect-src includes:**
- `*.googleapis.com` - Firebase, Google APIs
- `*.gstatic.com` - Google static resources
- `identitytoolkit.googleapis.com` - Firebase Auth
- `securetoken.googleapis.com` - Firebase tokens
- `*.google-analytics.com` - Google Analytics
- `*.googletagmanager.com` - Google Tag Manager
- `*.supabase.co` - Supabase API
- `*.firebaseio.com` - Firebase Realtime DB
- `firestore.googleapis.com` - Firestore
- `ingest.sentry.io` - Sentry error reporting
- `vercel-insights.com` - Vercel Analytics

## Testing

### Development
```bash
npm run dev
# Check browser console for CSP violations
# Verify nonce appears in both CSP header and script tags
```

### Production Build
```bash
npm run build
npm start
# Test with production CSP settings
```

### Browser DevTools
1. Open Network tab → Response Headers
2. Check `Content-Security-Policy` header contains `nonce-XXXXX`
3. Inspect script tags in Elements tab
4. Verify `nonce="XXXXX"` attribute matches CSP header
5. Console should show no "Refused to execute inline script" errors

## Security Benefits

✅ **Development**: `'unsafe-inline'` only in dev for Next.js HMR
✅ **Production**: `'strict-dynamic'` allows nonce-loaded scripts to load others
✅ **Dynamic nonce** - Unique per request, prevents replay attacks  
✅ **Strict CSP** - Only trusted domains allowed
✅ **Frame protection** - `X-Frame-Options: DENY`
✅ **Referrer control** - Strict referrer policy
✅ **Minimal permissions** - Limited browser APIs

## Rollback Plan

If issues occur:
1. Check nonce generation in middleware
2. Verify nonce propagation to layout
3. Confirm script tags have correct nonce attribute
4. Test with browser CSP reporting
5. Temporarily add `'unsafe-inline'` for debugging (remove after fix)

## Maintenance

- Monitor CSP violation reports
- Update allowed domains when adding new services
- Test nonce implementation after Next.js updates
- Validate environment variables in CI/CD

## References

- [CSP Level 3 Specification](https://w3c.github.io/webappsec-csp/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Deployment Security](https://vercel.com/docs/security)
