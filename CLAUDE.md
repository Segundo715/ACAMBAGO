# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint
```

## Next.js 16 Breaking Changes

- **Middleware renamed**: `src/middleware.ts` is deprecated. Use `src/proxy.ts` and export `proxy` (not `middleware`).
- **`ssr: false` in dynamic()**: Only allowed inside Client Components (`"use client"`). Server components must delegate to a client wrapper — see `src/components/map/MapWrapper.tsx`.
- **`useSearchParams()`**: Must be wrapped in `<Suspense>` — see `src/app/(auth)/register/page.tsx`.

## Architecture

### Route Groups

```
src/app/
  (public)/        ← Navbar + Footer layout; public pages
    page.tsx       ← Home / marketplace
    business/[id]/ ← Real business profiles (Supabase)
    business/demo* ← 4 hardcoded demo pages (no Supabase)
    map/           ← Leaflet map
  (auth)/          ← Centered card layout
    login/
    register/
  (dashboard)/     ← Sidebar + bottom nav layout
    business/      ← Owner dashboard (products, coupons, settings)
  admin/           ← Admin approval panel
  api/             ← Route handlers (coupons/validate, businesses, reviews, auth/callback)
```

### Demo Mode

All demo data lives in `src/lib/demo-data.ts`. The 4 demo businesses have fixed IDs (`demo`, `demo-lavado`, `demo-cerrajero`, `demo-pintor`) and their own routes under `(public)/business/`. `BusinessCard` maps these IDs to their routes via a `demoSlugs` lookup. The home page merges demo businesses with Supabase results, filtering out any Supabase business whose ID starts with `demo`.

No Supabase credentials are needed to run the app in demo mode — `.env.local` has placeholder values so the build succeeds; real queries are wrapped in `try/catch` that return `[]` on failure.

### Supabase Clients

- `src/lib/supabase/client.ts` — browser client (Client Components)
- `src/lib/supabase/server.ts` — server client (Server Components, Route Handlers)
- `src/lib/supabase/middleware.ts` — session refresh only (no route protection; demo mode)

### QR Coupon Flow

1. Business creates coupon → `generateCouponCode()` produces `ACAM-XXXXXX`
2. QR payload: `JSON.stringify({ coupon_code, business_id })`
3. Client scans with `html5-qrcode` in `QRScanner.tsx`
4. POST to `/api/coupons/validate` → verifies ownership + validity, records redemption

### Key Patterns

- **CSS**: `@import url(...)` for Google Fonts must come before `@tailwind base;` in `globals.css`, or the build fails.
- **Images**: `next/image` is used everywhere; `product-images` and `business-images` are Supabase Storage buckets.
- **Categories**: `BUSINESS_CATEGORIES` in `src/types/index.ts` — no food/restaurants; only services and physical products.
- **Prices**: Always formatted with `formatPrice()` from `src/lib/utils.ts` (es-MX locale, MXN currency).

## Environment Variables

Copy `.env.local` and fill in real Supabase credentials to enable auth and database features:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Database schema is at `supabase/schema.sql`.
