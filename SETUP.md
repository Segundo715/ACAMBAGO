# AcambaGo — Guía de instalación

## Requisitos previos

1. **Node.js 18+** → https://nodejs.org
2. **Cuenta Supabase** → https://supabase.com (gratis)

---

## Paso 1 — Configurar Supabase

1. Crea un proyecto en supabase.com
2. Ve a **SQL Editor** y pega todo el contenido de `supabase/schema.sql`
3. Ejecuta el SQL → crea tablas, funciones, triggers y buckets

---

## Paso 2 — Variables de entorno

Copia `.env.local.example` a `.env.local` y llena los valores:

```bash
cp .env.local.example .env.local
```

Valores que necesitas (están en Supabase → Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Paso 3 — Instalar y ejecutar

```bash
cd acambago
npm install
npm run dev
```

Abre http://localhost:3000

---

## Paso 4 — Crear el primer admin

1. Regístrate normalmente en la app
2. En Supabase → Table Editor → profiles → busca tu registro
3. Cambia el campo `role` de `client` a `admin`
4. Ve a `/admin` en el navegador

---

## Estructura del proyecto

```
src/
├── app/
│   ├── (public)/          → Páginas públicas (home, negocio, mapa)
│   ├── (auth)/            → Login / Registro
│   ├── (dashboard)/       → Panel del negocio
│   ├── admin/             → Panel administrador
│   └── api/               → API Routes (validar cupones, etc.)
├── components/
│   ├── ui/                → Navbar, Footer
│   ├── business/          → BusinessCard, StarRating
│   ├── coupons/           → CouponCard, QRScanner
│   └── map/               → BusinessMap (Leaflet)
├── lib/
│   └── supabase/          → client, server, middleware
├── types/                 → Tipos TypeScript
supabase/
└── schema.sql             → Esquema completo de BD
```

---

## Flujo completo de cupones

1. Negocio crea cupón → se genera código `ACAM-XXXXXX` y datos QR
2. Cliente ve cupón en el perfil del negocio → muestra QR
3. Negocio abre `/dashboard/business/coupons/scan`
4. Presiona "Iniciar cámara" → escanea el QR del cliente
5. Sistema valida: existencia, expiración, límite de usos, duplicados
6. Resultado en pantalla: ✅ válido o ❌ rechazado

---

## Deploy en Vercel

```bash
npm i -g vercel
vercel --prod
```

Agrega las variables de entorno en el dashboard de Vercel.
