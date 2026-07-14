# Documentación de AcambaGo

Este archivo explica en qué quedó el proyecto después de conectar Clerk, Supabase, el sistema de pedidos y el despliegue a producción. Es el punto de partida para entender qué existe hoy, más allá del código.

## Qué es

AcambaGo (marca visual "Acom-Di") es un marketplace local para negocios de Acámbaro, Guanajuato. Compradores navegan tiendas y productos; los dueños de negocio administran su tienda desde un panel; un admin aprueba negocios nuevos antes de que sean públicos.

## Estado actual

| Pieza | Estado |
|---|---|
| Auth (Clerk) | Conectado a una app real (`app_3GH844MigxfbHGROdDjQqMKQ6DY`), llaves de **desarrollo** (`pk_test_`/`sk_test_`) |
| Base de datos (Supabase) | Proyecto real (`fdgcodeimqfwzctrjlds`), esquema completo aplicado |
| Repo | `https://github.com/Segundo715/ACAMBAGO` (privado) |
| Producción | `https://acambago-kappa.vercel.app` (Vercel, proyecto `jesus-proyectos/acambago`) |
| Pagos reales | No conectados (checkout con tarjeta es simulado a propósito, ver abajo) |

## Base de datos: qué SQL correr y en qué orden

Todos estos archivos viven en `supabase/` y ya fueron aplicados al proyecto de Supabase real. Si alguna vez se recrea la base desde cero, correr en este orden en el SQL Editor:

1. `schema.sql` — tablas base: `profiles`, `businesses`, `products`, `coupons`, `coupon_redemptions`, `reviews`, buckets de Storage.
2. `clerk-migration.sql` — migra de Supabase Auth a Clerk (IDs de `uuid` a `text`, quita RLS). El proyecto **usa Clerk para autenticación, no Supabase Auth** — RLS está deshabilitado en todas las tablas a propósito; la seguridad se valida en las rutas de la API, no en Postgres.
3. `orders-schema.sql` — tablas `orders` y `order_items`, más la publicación de Realtime.
4. `orders-rpc.sql` — función `create_order_with_items`, que guarda un pedido y sus productos en una sola transacción (ver "Sistema de pedidos" abajo).
5. `products-gallery-and-bank.sql` — columna `image_urls TEXT[]` en `products` (galería de fotos) y columnas `bank_name`/`bank_holder`/`bank_clabe` en `businesses` (transferencia real).

## Sistema de pedidos

El checkout (`(public)/checkout/page.tsx`) antes era 100% simulado (nunca tocaba la base de datos). Ahora:

- Al confirmar, agrupa el carrito por negocio y llama al RPC `create_order_with_items` una vez por negocio — pedido y productos se guardan atómicamente, o no se guarda nada.
- Antes de llamar al RPC, valida que los productos del carrito tengan IDs con formato UUID real; si el carrito tiene un producto demo (ids como `"p1"`, `"demo"`), avisa al usuario en vez de tronar.
- El panel `dashboard/business/orders` lee pedidos reales vía Supabase y usa **Realtime** para sonar (Web Audio API, sin archivo de audio) y mostrar un toast en cuanto entra un pedido nuevo, sin recargar la página.
- El teléfono de contacto del comprador se captura siempre en el Paso 1 del checkout (antes solo se pedía si elegía envío a domicilio).
- "Transferencia" como método de pago solo aparece si el negocio tiene `bank_clabe` configurado en Ajustes; si no, no se ofrece esa opción (antes mostraba datos bancarios inventados).

## Aprobación de negocios

`dashboard/PendingApprovalGate.tsx` bloquea todo el panel de vendedor (excepto Configuración) mientras el negocio no exista o `is_approved = false`. El admin aprueba desde `/admin?tab=negocios`. Esto es nuevo: antes cualquier vendedor con `role = business` veía el panel completo aunque nadie hubiera aprobado su negocio.

## Galería de productos

`products.image_urls` (arreglo) guarda hasta 6 fotos por producto; `image_url` sigue existiendo como portada (primer elemento) para no romper vistas que solo esperan una imagen. `dashboard/business/products/page.tsx` permite subir varias fotos; `ProductGallery.tsx` (página de producto) y `MiniCarousel.tsx` (tarjetas dentro de la tienda) las muestran con flechas, puntos y avance automático cada 2.5s.

## Ubicación de negocios

`dashboard/business/settings/page.tsx` tiene un botón "Usar mi ubicación actual" que pide permiso de geolocalización al navegador y llena `latitude`/`longitude` directo — ya no hay que escribir coordenadas a mano (queda una opción manual escondida por si acaso).

## Modo demo vs datos reales

Sigue existiendo tal cual describía el CLAUDE.md original: sin credenciales de Supabase configuradas, el sitio corre en modo demo con datos de `src/lib/demo-data.ts`. La diferencia ahora es que **si** hay credenciales reales (como en este proyecto), todo lo de arriba (pedidos, aprobación, galería, ubicación, transferencia) aplica de verdad. Los ~29 negocios y sus productos en `demo-data.ts` siguen siendo hardcodeados y nunca tocan la base de datos, se muestran mezclados con los negocios reales en el home.

## Reels de productos

`components/ui/ProductsReel.tsx` es un carrusel horizontal con animación automática (`animate-reel`, definida en `tailwind.config.ts`, 40s en bucle, se pausa al pasar el mouse). Se usa en:
- Home: "Productos Destacados" (`FEATURED` en `(public)/page.tsx`).
- Dentro de cada negocio: sección "Productos", con los productos reales de esa tienda (reemplazó una cuadrícula estática).

`FEATURED_ROPA` existe en `demo-data.ts` (ropa/calzado de varias tiendas demo) pero ya no se usa en ningún lado tras los últimos cambios; se dejó exportado por si se vuelve a necesitar.

## Pendiente / no incluido

- **Pagos reales**: tarjeta y transferencia (cuando no hay `bank_clabe`) son simulados a propósito. Conectar Mercado Pago o Stripe requeriría una cuenta nueva, igual que se hizo con Clerk/Supabase.
- **Notificaciones por WhatsApp/email** al comprador cuando cambia el estado de su pedido: no existen todavía, solo la notificación en vivo al vendedor.
- **Instancia de producción de Clerk**: sigue en modo desarrollo (banner "Development mode", límites de uso). Pasar a producción requiere dominio propio verificado en Clerk.
