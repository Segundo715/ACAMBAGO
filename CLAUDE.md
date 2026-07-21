# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instrucciones generales

- Siempre responde en español.
- Escribe con la voz de marca de AcambaGo: cercana, directa y orientada a la comunidad local de Acámbaro.
- Nunca uses guiones largos (—). Usa coma, punto y coma o punto según corresponda.
- Si el proyecto no existe aun como paquete Next.js, crealo con `npx create-next-app@latest`.

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

> Para contexto de negocio (qué se conectó, en qué orden correr el SQL, qué quedó pendiente), ver `DOCUMENTACION.md`.

### Route Groups

```
src/app/
  (public)/        ← Navbar + Footer layout; public pages
    page.tsx       ← Home / marketplace
    business/[id]/ ← Real business profiles (Supabase)
    business/demo* ← hardcoded demo pages (no Supabase)
    checkout/      ← Real checkout, writes orders/order_items via RPC
    map/           ← Leaflet map
  (auth)/          ← Centered card layout
    login/
    register/
  dashboard/       ← Sidebar + bottom nav layout (seller panel)
    business/      ← products, orders, coupons, reviews, analytics, settings
    PendingApprovalGate.tsx ← blocks the panel until admin approves the business
  admin/           ← Admin approval panel
  api/             ← Route handlers (coupons/validate, businesses, reviews, auth/callback)
```

### Auth (Clerk)

This project uses **Clerk**, not Supabase Auth. `src/proxy.ts` protects `/dashboard`, `/admin`, `/perfil`. Sign-in/sign-up pages are custom (`(auth)/login`, `(auth)/register`), not Clerk's default `/sign-in`/`/sign-up` routes — the `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`SIGN_UP_URL` env vars point to them. Because of Clerk, all Supabase tables have RLS **disabled** (see `supabase/clerk-migration.sql`) — authorization is enforced in API routes and client code, not Postgres policies.

### Demo Mode

All demo data lives in `src/lib/demo-data.ts`. Demo businesses have fixed IDs (`demo`, `demo-lavado`, etc.) and their own routes under `(public)/business/`. `BusinessCard` maps these IDs to their routes via a `demoSlugs` lookup. The home page merges demo businesses with Supabase results, filtering out any Supabase business whose ID starts with `demo`. Demo data never touches the database — it's a fallback for running the app without any credentials configured.

When Supabase credentials **are** configured (as in this deployment), real businesses/products/orders exist alongside the demo ones. `IS_DEMO` (checked via `NEXT_PUBLIC_SUPABASE_URL`) gates whether a given page reads real data or falls back to demo data.

### Supabase Clients

- `src/lib/supabase/client.ts` — browser client (Client Components)
- `src/lib/supabase/server.ts` — server client (Server Components, Route Handlers)
- `src/lib/supabase/middleware.ts` — session refresh only (no route protection; that's Clerk's `proxy.ts`)

### Orders

Checkout groups cart items by `business_id` and calls the `create_order_with_items` Postgres RPC (see `supabase/orders-rpc.sql`) once per business — order + items are inserted in a single transaction, so a failed item insert can't leave an order with zero products. The seller's `dashboard/business/orders` page subscribes to Supabase Realtime on `orders` INSERT and plays a beep (Web Audio API, no audio file) + shows a toast when a new order arrives.

### QR Coupon Flow

1. Business creates coupon → `generateCouponCode()` produces `ACAM-XXXXXX`
2. QR payload: `JSON.stringify({ coupon_code, business_id })`
3. Client scans with `html5-qrcode` in `QRScanner.tsx`
4. POST to `/api/coupons/validate` → verifies ownership + validity, records redemption

### Key Patterns

- **CSS**: `@import url(...)` for Google Fonts must come before `@tailwind base;` in `globals.css`, or the build fails.
- **Images**: `next/image` is used everywhere; `product-images` and `business-images` are Supabase Storage buckets. Products can have multiple photos (`products.image_urls TEXT[]`, first item = cover/`image_url`), shown via `ProductGallery.tsx` (product page) and `MiniCarousel.tsx` (store cards, auto-advances every 2.5s).
- **Product reels**: `components/ui/ProductsReel.tsx` is the auto-scrolling horizontal carousel (`animate-reel` in `tailwind.config.ts`, pauses on hover) used for "Productos Destacados" on the home page and for each business's own "Productos" section.
- **Categories**: `BUSINESS_CATEGORIES` in `src/types/index.ts` — no food/restaurants; only services and physical products.
- **Prices**: Always formatted with `formatPrice()` from `src/lib/utils.ts` (es-MX locale, MXN currency).

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in real credentials to enable auth and database features:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
NEXT_PUBLIC_APP_URL=
```

Database schema lives in `supabase/*.sql` — run them in the order listed in `DOCUMENTACION.md` (`schema.sql` → `clerk-migration.sql` → `orders-schema.sql` → `orders-rpc.sql` → `products-gallery-and-bank.sql` → `payments-gateway.sql` → `payments-per-business.sql` → `stripe-connect.sql` → `profile-avatars.sql`).

## Deployment

Production runs on Vercel (`jesus-proyectos/acambago`), connected to the GitHub repo. Env vars are set directly in the Vercel project (not via `vercel.json`). Clerk currently uses **development** keys even in production — see `DOCUMENTACION.md` for what that means and what's needed to switch to a production Clerk instance.
