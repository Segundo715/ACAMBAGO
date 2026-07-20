# Sesiones de trabajo — AcambaGo (marca "Acom-Di")

> Registro de sesiones de desarrollo, con resumen de lo hecho cada día.

---

## 2026-07-14 — Martes — Resumen de sesión

### Conexión de servicios reales y sistema de pedidos

**Auth y base de datos:**
- Conectada la app a Clerk real (`app_3GH844MigxfbHGROdDjQqMKQ6DY`, llaves de desarrollo `pk_test_`/`sk_test_`), sustituyendo el flujo previo de Supabase Auth.
- Conectado un proyecto real de Supabase (`fdgcodeimqfwzctrjlds`) y aplicado el esquema completo: `schema.sql` → `clerk-migration.sql` (IDs UUID a TEXT de Clerk, RLS deshabilitado en todas las tablas a propósito) → `orders-schema.sql` → `orders-rpc.sql` → `products-gallery-and-bank.sql`.
- La autorización quedó a cargo del código (rutas de API con `auth()` de Clerk y consultas filtradas por dueño), no de políticas RLS.

**Sistema de pedidos:**
- El checkout (`(public)/checkout/page.tsx`), que antes era 100% simulado, ahora guarda pedidos reales.
- Nueva función de Postgres `create_order_with_items`: inserta un pedido y todos sus productos en una sola transacción, para no dejar pedidos huérfanos si algo falla a la mitad.
- Antes de llamar al RPC, el checkout valida que los productos del carrito tengan IDs con formato UUID real; si detecta un producto demo (ids tipo `"p1"`), avisa al comprador con un toast en vez de tronar.
- Si el carrito tiene productos de varias tiendas, se agrupa por negocio y se llama al RPC una vez por cada uno.
- El teléfono de contacto ahora se captura siempre en el Paso 1 del checkout, no solo cuando se elige envío a domicilio.

**Panel del vendedor — pedidos en vivo:**
- `dashboard/business/orders/page.tsx` ahora lee pedidos reales de Supabase y se suscribe a **Supabase Realtime** sobre la tabla `orders`.
- En cuanto entra un pedido nuevo: suena un beep corto generado con **Web Audio API** (oscilador seno, sin ningún archivo de audio) y aparece un toast con el nombre del cliente y el total, sin recargar la página.

**Aprobación de negocios:**
- Nuevo componente `dashboard/PendingApprovalGate.tsx`: bloquea todo el panel de vendedor excepto Configuración mientras el negocio no exista o `is_approved` sea `false`. Antes, cualquier cuenta con rol `business` veía el panel completo sin que un admin hubiera aprobado nada.
- El admin sigue aprobando/suspendiendo negocios desde `/admin?tab=negocios`.

**Galería de productos:**
- Nueva columna `products.image_urls TEXT[]` (hasta 6 fotos por producto); `image_url` se mantiene como portada (primer elemento) para no romper vistas que solo esperaban una imagen.
- `dashboard/business/products/page.tsx` permite subir varias fotos por producto.
- Nuevo componente `MiniCarousel.tsx`: carrusel de fotos con avance automático cada 2.5s, flechas siempre visibles (para uso táctil) y puntos indicadores; se usa en las páginas de tiendas demo (`DemoBusinessPage.tsx`).
- `ProductGallery.tsx` (página de producto) muestra la galería completa con miniaturas.

**Transferencia bancaria real:**
- Nuevas columnas en `businesses`: `bank_name`, `bank_holder`, `bank_clabe`.
- Los vendedores pueden capturar su cuenta real en Configuración.
- El checkout ahora solo ofrece "Transferencia" como método de pago si el negocio del carrito tiene `bank_clabe` configurado; antes mostraba datos bancarios inventados siempre.

**Geolocalización de negocios:**
- `dashboard/business/settings/page.tsx` agrega un botón "Usar mi ubicación actual" que pide permiso de geolocalización al navegador y llena `latitude`/`longitude` directamente. Se dejó una opción manual escondida en un `<details>` por si se prefiere escribir coordenadas a mano.

**Carruseles de productos:**
- `ProductsReel.tsx`: carrusel horizontal de auto-scroll (animación CSS `animate-reel`, definida en `tailwind.config.ts`, 40 segundos en bucle continuo, se pausa al pasar el mouse). Se usa en "Productos Destacados" del home y en la sección "Productos" de cada perfil de negocio real (reemplazando una cuadrícula estática).
- `FEATURED_ROPA`, exportado en `demo-data.ts`, quedó sin uso tras estos cambios pero se dejó disponible por si se necesita después.

**Limpieza de datos demo:**
- Auditoría de `src/lib/demo-data.ts`: confirmado que las ~29 tiendas demo y sus productos no incluyen categoría de comida ni restaurantes, siguiendo la convención del proyecto (`BUSINESS_CATEGORIES` no las contempla).
- Revisión de imágenes de productos y negocios demo.

**Publicación:**
- Repositorio subido a GitHub (`https://github.com/Segundo715/ACAMBAGO`, privado).
- Desplegado a Vercel en producción (`https://acambago-kappa.vercel.app`, proyecto `jesus-proyectos/acambago`) con las credenciales reales de Clerk y Supabase configuradas.
- Nota importante: los últimos despliegues se hicieron directo con `vercel --prod` desde la CLI, no a través de git; el repositorio de GitHub puede estar detrás de lo que está vivo en producción. Pendiente sincronizar en una próxima sesión.

**Documentación:**
- Creada la carpeta `Documentacion/` completa (índice, documentación técnica navegable, snapshot completo, manual técnico, manuales de vendedor y comprador, este registro de sesiones, y el esquema SQL consolidado), generada con Claude Opus mediante exploración exhaustiva del código fuente real, siguiendo la misma estructura y estándar que la documentación de otro proyecto del autor.

---

## 2026-07-14 — Martes (tarde) — Pagos con tarjeta: Mercado Pago y Stripe Connect por tienda

### Requisito de negocio que motivó el diseño

El dueño del producto puso una condición estricta y explícita: **el dinero de cada venta debe llegar directo a la cuenta de la tienda vendedora, nunca concentrarse en una cuenta central de AcambaGo**. La plataforma no debe ser intermediaria del dinero. Ese requisito descartó el enfoque de "una sola cuenta de pasarela global" y obligó a que cada negocio conecte sus propias credenciales, y a que cada cobro se haga con la cuenta del vendedor dueño de ese pedido. Se implementaron dos pasarelas con ese mismo principio, para que cada tienda use la que prefiera (o ambas).

### Mercado Pago por negocio (Checkout Pro)

- **SQL** (`supabase/payments-per-business.sql` y `supabase/payments-gateway.sql`): se agregaron a `businesses` las columnas `mp_public_key` y `mp_access_token` (credenciales propias de cada tienda); a `orders` las columnas `payment_status` (`pendiente`/`pagado`/`fallido`, separado de `status` de entrega), `mp_preference_id` y `mp_payment_id`; y se amplió el CHECK de `orders.payment_method` para incluir `'mercadopago'`.
- **Ajustes del vendedor** (`dashboard/business/settings/page.tsx`): nueva sección "Mercado Pago (opcional)" donde cada vendedor pega su propia Public Key y Access Token (los saca de su panel de desarrollador de Mercado Pago).
- **Crear preferencia** (`api/mercadopago/create-preference/route.ts`): al confirmar un pedido, busca el `mp_access_token` **del negocio dueño del pedido** (no un token global) y con ese token crea la preferencia de Checkout Pro. Así el cobro sale a nombre del vendedor y el dinero cae en su cuenta. En la `notification_url` embebe `?business_id=<id>` para que el webhook sepa qué token usar.
- **Webhook** (`api/mercadopago/webhook/route.ts`): Mercado Pago llama server-to-server; la ruta lee `business_id` del query, recupera el token de ESE negocio, vuelve a consultar el pago con la API (no confía en el body) y actualiza `orders.payment_status`/`mp_payment_id`.
- **Checkout** (`(public)/checkout/page.tsx`): "Mercado Pago" solo aparece como método de pago si **todas** las tiendas del carrito tienen `mp_public_key` configurado. Si se elige con productos de más de una tienda, se bloquea con un toast pidiendo hacer pedidos separados (una preferencia solo puede cobrar a nombre de un vendedor).

### Stripe Connect por negocio (destination charges)

Mismo principio, pero con onboarding real de identidad y banco de Stripe, no solo un token que se copia y pega.

- **SQL** (`supabase/stripe-connect.sql`): se agregaron a `businesses` las columnas `stripe_account_id` y `stripe_charges_enabled`; a `orders` la columna `stripe_payment_intent_id`; y se amplió otra vez el CHECK de `orders.payment_method` para incluir `'stripe'`.
- **Cliente de Stripe** (`src/lib/stripe/server.ts`): instancia perezosa del SDK con `STRIPE_SECRET_KEY` (la cuenta de AcambaGo actúa como **plataforma**, no como destino del dinero).
- **Conectar cuenta** (`api/stripe/connect/route.ts`): `POST` crea (si no existe) una cuenta conectada **Express** para el negocio del vendedor (`stripe.accounts.create`, país MX, capacidades `card_payments` + `transfers`) y genera un Account Link de onboarding hospedado por Stripe (`refresh_url`/`return_url` de vuelta a Ajustes). `GET` consulta el estado real (`charges_enabled`) y sincroniza `businesses.stripe_charges_enabled`.
- **Ajustes del vendedor**: nueva sección "Stripe (opcional)" con un botón "Conectar con Stripe" que redirige al onboarding de Stripe (identidad + cuenta bancaria real, cualquier banco, incluido BBVA). Al volver (`?stripe_return=1`) se re-consulta el estado; muestra "Stripe conectado y listo para recibir pagos" cuando `stripe_charges_enabled` es true.
- **Crear sesión de pago** (`api/stripe/create-checkout-session/route.ts`): crea una Stripe Checkout Session en modo `payment` con `payment_intent_data.transfer_data.destination = <stripe_account_id del negocio dueño del pedido>`. Esto es un **destination charge**: el dinero se transfiere automáticamente a la cuenta del vendedor, no se queda en la de la plataforma. Guarda `order_id` en la metadata del PaymentIntent.
- **Webhook** (`api/stripe/webhook/route.ts`): verifica la firma con `STRIPE_WEBHOOK_SECRET`, escucha `payment_intent.succeeded`/`payment_intent.payment_failed`, lee `order_id` de la metadata y actualiza `orders.payment_status`/`stripe_payment_intent_id`.
- **Checkout**: "Tarjeta (Stripe)" solo aparece si **todas** las tiendas del carrito tienen `stripe_charges_enabled = true`, con la misma regla de una sola tienda por pedido que Mercado Pago.

### Flujo de confirmación del pedido

En `handleConfirm`, el pedido se **guarda primero** con el RPC `create_order_with_items` (igual que siempre, `payment_status` queda en `pendiente`); recién después se llama a la ruta de la pasarela y se redirige al usuario (`init_point` de Mercado Pago o `url` de Stripe Checkout). Si la creación de la preferencia/sesión falla, el pedido ya quedó guardado y se avisa al comprador que contacte a la tienda. El webhook confirma el cobro de forma asíncrona.

### Otros cambios

- Se **eliminó la tarjeta de pago simulada** ("Modo Demo: no se procesará ningún cargo real") del checkout en modo real. En **modo demo** (sin credenciales) esa tarjeta simulada se conserva igual, porque el modo demo nunca toca la base de datos.
- **Variables de entorno nuevas** en `.env.local` y en Vercel producción (`jesus-proyectos/acambago`): `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Se **eliminaron** de ambos lugares las viejas `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`/`MERCADOPAGO_ACCESS_TOKEN` (eran de una cuenta global, enfoque descartado); esas credenciales de prueba de Mercado Pago se migraron a la fila del negocio real "RopaSecond" en Supabase (`businesses.mp_public_key`/`mp_access_token`).
- **Webhook de Stripe** registrado en el dashboard apuntando a `https://acambago-kappa.vercel.app/api/stripe/webhook`, con ámbito "Tu cuenta" (no "Cuentas conectadas", porque el PaymentIntent se crea desde la cuenta de la plataforma aunque el dinero se transfiera después a la conectada), eventos `payment_intent.succeeded` + `payment_intent.payment_failed`.
- **Nota operativa de Stripe:** al configurar la cuenta de la plataforma hubo que activar manualmente "Accounts v1 support" en el dashboard (Configuración → Funciones de la cuenta), porque Stripe ya no permite por defecto crear cuentas Express con la API v1 en cuentas nuevas. El código usa la API v1 (Express accounts + Account Links), que sigue siendo válida con esa compatibilidad activada.

**Publicación:** todo desplegado en producción (Vercel + GitHub, commits hechos) y verificado funcionando, incluida la creación de cuentas Stripe Express tras habilitar el soporte v1.

---

## 2026-07-15 — Miércoles — RLS reactivado por accidente y galería de fotos con deslizamiento

### Incidente: Row Level Security se había vuelto a activar

Se detectó que la llave anónima de Supabase (la que usa el navegador) dejó de poder leer **cualquier fila** de **todas** las tablas (`profiles`, `businesses`, `products`, `coupons`, `coupon_redemptions`, `reviews`, `orders`, `order_items`): las consultas devolvían `200 OK` pero con arreglo vacío `[]`, sin ningún error visible. La causa: RLS se había vuelto a **activar** en esas tablas, cuando el diseño del proyecto depende de tenerlo **deshabilitado** (la seguridad se valida con Clerk en el código, no con políticas de Postgres, y sin políticas escritas, RLS activado bloquea todo en vez de filtrar por dueño). Probablemente ocurrió al aceptar una sugerencia del "Security Advisor" de Supabase sin saber que rompería el diseño de autenticación de este proyecto.

- **Síntoma con el que se detectó:** al iniciar sesión con la cuenta dueña de RopaSecond (`pepitosegundo65@gmail.com`, Clerk user `user_3GHQ4XHukokWJQ58NZJDwVQGFQF`, nombre real "Fernando Segundo"), la barra lateral mostraba "Fernando Segundo · Client" en vez de la tienda, porque `UserInfo.tsx` no lograba leer su fila de `profiles` (rol real: `business`) y caía al valor por defecto `"client"`.
- **Fix:** `supabase/fix-rls-disabled.sql` (nuevo archivo), que vuelve a correr `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` en las 8 tablas. Verificado con `curl` usando la llave anon antes y después: antes devolvía `[]` en las 8; después, datos reales.
- **Nota para el futuro:** si el sitio empieza a mostrar solo datos demo, o un vendedor deja de ver su propio negocio, sospechar primero de RLS reactivado antes que de un problema de cuenta o de código.

### Aclaración: cuentas de Clerk distintas para el mismo negocio

Se confirmó (vía API de Clerk) que el proyecto tiene 3 usuarios reales, cada uno con su propio email de Google: `pepitosegundo65@gmail.com` (dueño de RopaSecond), `19.jesus.segundo@gmail.com` y `jesussegundo6487@gmail.com`. Iniciar sesión con un correo distinto al dueño de un negocio hace que el dashboard trate al usuario como si no tuviera negocio registrado (no es un bug, es el comportamiento esperado de `owner_id`).

### Galería de fotos del producto: limpieza y deslizamiento automático

- Se quitaron 5 fotos de stock (Unsplash, genéricas) que habían quedado mezcladas con la foto real del producto "Ropa deportiva" de RopaSecond — no eran la prenda real. Después, a pedido explícito y temporal, se volvieron a poner 3 fotos de stock **marcadas como prueba**, solo para demostrar el funcionamiento del carrusel mientras se consiguen fotos reales de cada prenda.
- `ProductGallery.tsx` (galería de la página de un producto) se modificó tres veces en esta sesión, terminando en:
  1. Avance automático cada 2.5s (antes solo cambiaba con clics manuales), igual que `MiniCarousel.tsx` en las tarjetas de tienda.
  2. Se quitaron los botones de flecha izquierda/derecha, dejando solo los puntos indicadores y las miniaturas como navegación.
  3. Se cambió de un cambio de imagen "de golpe" (swap de `src`) a un **deslizamiento continuo** con `transform: translateX(...)` y `transition`, para que se sienta como el movimiento del carrusel de "Productos" (`ProductsReel.tsx`) en vez de un corte abrupto.
- Aclaración importante que surgió durante la verificación: una captura de pantalla nunca puede demostrar si una animación ocurre o no, al ser una imagen fija en el tiempo; hay que observar la página unos segundos para confirmar el movimiento.

**Publicación:** los 3 commits de la galería (`8bc2258`, `3a11ad9`, `3691f71`) y el fix de RLS quedaron desplegados en Vercel y subidos a GitHub; verificado con el usuario que el deslizamiento sí se aprecia en vivo.

---

## 2026-07-20 — Lunes — Pagos reales, pedidos del comprador, y tres paneles del vendedor que en realidad seguían simulados

### Punto de partida: "¿qué le falta a AcambaGo para ser un éxito?"

El usuario preguntó qué faltaba para un lanzamiento exitoso. La investigación mostró un hallazgo clave: **Mercado Pago y Stripe ya estaban conectados** desde la sesión del 14 de julio (tarde), pese a que `DOCUMENTACION.md` seguía diciendo que "requerirían una cuenta nueva". El trabajo real no era conectar pagos desde cero, sino cerrar huecos de configuración/documentación, y construir lo que sí faltaba de verdad: que el comprador viera el estado real de sus pedidos (tanto `/perfil` como `/checkout/tracking` eran 100% demo, nunca leían Supabase).

### Documentación y variables de entorno

- `.env.local.example` incompleto: le faltaban las 6 variables de Clerk, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, aunque el código ya las usaba. Se agregaron todas.
- `SETUP.md` solo mencionaba correr `schema.sql`; se actualizó para listar las 8 migraciones en orden real (confirmado con `git log` sobre los archivos SQL): `schema.sql` → `clerk-migration.sql` → `orders-schema.sql` → `orders-rpc.sql` → `products-gallery-and-bank.sql` → `payments-gateway.sql` → `payments-per-business.sql` → `stripe-connect.sql`.
- `DOCUMENTACION.md` y `CLAUDE.md` corregidos para reflejar que los pagos ya están implementados (multi-tenant: cada negocio guarda su propio `mp_access_token`/`mp_public_key`, cobra a su propia cuenta).

### Mercado Pago: cerrar huecos reales

- `dashboard/business/settings/page.tsx`: antes se podía guardar `mp_public_key` sin `mp_access_token` (o viceversa) sin ningún aviso. Ahora el submit exige que se llenen los dos juntos.
- Se agregó un texto de ayuda aclarando que deben ser credenciales de **producción** (`APP_USR-...`), no de prueba (`TEST-...`), porque no existe ningún indicador visual de modo sandbox/live en la UI.
- No se tocaron `create-preference/route.ts` ni `webhook/route.ts`: ya revalidan el pago directo contra la API de Mercado Pago con el token del negocio, en vez de confiar en el payload del webhook.

### Notificaciones de pedido dentro de la app (comprador)

- Nuevo componente compartido `src/components/ui/OrderStatusBadge.tsx`, extraído del `STATUS_CONFIG` que antes vivía duplicado (y desincronizado: la versión de `/perfil` solo cubría 3 de los 4 estados reales) entre `dashboard/business/orders/page.tsx` y `(public)/perfil/page.tsx`.
- `(public)/perfil/page.tsx`: la sección "Mis pedidos" (antes `DEMO_MY_ORDERS` fijo con badge "Demo" permanente) ahora consulta `orders` real filtrado por `user_id` de Clerk cuando no es modo demo, con conteo real para el stat "Pedidos". Se agregó una suscripción a Supabase Realtime (`UPDATE` en `orders` filtrado por `user_id`) que dispara un toast cuando cambia el estado de cualquier pedido propio. Se corrigió el link roto "Ver todos los pedidos", que apuntaba a `/coupons`.
- Nueva página `(public)/perfil/pedidos/page.tsx`: historial completo de pedidos reales del comprador.
- `(public)/checkout/tracking/page.tsx`: antes simulaba el avance con un `setInterval` (`DEMO_INTERVAL`) sin leer nunca el pedido real. Ahora, cuando el `order` del query string es un UUID real, consulta el pedido en Supabase, deriva el paso del timeline directo del `status` real (colapsado a 3 pasos: `pendiente`/`en_camino`/`entregado`, ya que el enum real no tiene los 5 pasos ficticios de antes) y se suscribe a Realtime filtrado por `id` del pedido para avanzar solo cuando el vendedor cambia el estado. `cancelado` se muestra como un banner rojo aparte, fuera del timeline de progreso. El modo demo se conserva intacto.

### Clerk a producción: quedó pausado por falta de dominio

- `src/proxy.ts`: el bypass de la cookie `demo_mode` ya solo funciona si Supabase no está configurado (modo demo real); antes funcionaba siempre, lo que hubiera permitido saltarse el login de Clerk incluso en producción.
- Se guió al usuario paso a paso en el Clerk Dashboard: cambiar de instancia Development a Production, clonando la configuración de auth existente ("Instancia de desarrollo clon"). Al llegar al paso de "Dominio de aplicación", se confirmó que el proyecto en Vercel no tiene ningún dominio propio conectado (`vercel domains ls` → 0 dominios) y que el usuario **todavía no ha comprado uno**. Queda pendiente: comprar dominio → conectarlo en Vercel (Settings → Domains) → verificarlo en Clerk → copiar las llaves `pk_live_`/`sk_live_` → actualizar `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`/`CLERK_SECRET_KEY` en Vercel (ya están seteadas ahí, pero con las de desarrollo) → redeploy.

### Reparación de `npm run lint`

- `next lint` ya no existe en Next.js 16 (`npm run lint` tronaba con "Invalid project directory"). Se reemplazó `.eslintrc.json` por `eslint.config.mjs` (flat config, usando el export nativo de `eslint-config-next` en vez de `FlatCompat`, que producía un `TypeError: Converting circular structure to JSON` con los plugins de React).
- Se bajó `eslint` de `^10.5.0` a `^9.39.5`: `eslint-plugin-react` (dependencia de `eslint-config-next@16.2.9`) usa la API `context.getFilename()`, que ESLint 10 eliminó; con ESLint 9 (que sigue siendo flat-config nativo) todo corre limpio.
- El lint real encontró 23 problemas preexistentes en el resto del código (sobre todo el patrón `setState` síncrono dentro de `useEffect`, regla nueva `react-hooks/set-state-in-effect`), que se dejaron documentados pero sin tocar por estar fuera del pedido del usuario.

### Estadísticas, Reseñas y Resumen del vendedor: los tres seguían 100% simulados

El usuario reportó con capturas de pantalla que, entrando como el vendedor real "RopaSecond" (`pepitosegundo65@gmail.com`), tres pantallas del panel mostraban datos que no le correspondían:

- **`dashboard/business/analytics/page.tsx` (Estadísticas):** toda la página era constantes fijas (`MONTHLY_DATA`, `WEEKLY_DATA`, `TOP_PRODUCTS`, los 4 KPIs) sin ninguna consulta a Supabase, sin importar el negocio logueado. Se reescribió para calcular todo desde los pedidos reales del negocio (excluyendo `cancelado`): ingresos/pedidos/clientes nuevos por mes y por día (bucketing por rango de fechas calculado en el cliente, comparando siempre contra el período inmediatamente anterior dentro del mismo histórico ya cargado), "clientes nuevos" definido como la primera compra histórica de ese `user_id` cayendo dentro del período, productos más vendidos agregando `order_items` real, y la calificación real (`rating_avg`/`rating_count` de `businesses`, ya mantenida por un trigger de Postgres desde la sesión original). Se agregó un estado vacío para negocios sin pedidos todavía.
- **`dashboard/business/reviews/page.tsx` (Reseñas):** usaba siempre `DEMO_ALL_REVIEWS.slice(0, 40)` (25-40 reseñas fijas, con nombres como "Roberto Mendoza"), lo que producía un **4.8 ★ / 25 reseñas** que no coincidía con el **0.0 ★ / 0 reseñas** real que ya se veía en Resumen — la contradicción entre ambas pantallas fue justo la pista de que Reseñas estaba desconectada. Se corrigió para leer `reviews` real filtrado por el negocio del vendedor logueado.
- **`dashboard/business/page.tsx` (Resumen):** aunque los contadores de productos/cupones/reseñas/calificación ya eran reales desde la sesión original, "Ingresos hoy", "Pedidos pendientes", la gráfica "Ingresos — últimos 7 días" y "Pedidos recientes" seguían siendo constantes fijas (`CHART_DATA`, `RECENT_ORDERS`) idénticas a los viejos datos de Estadísticas. Se conectaron a los pedidos reales del negocio (ingresos de hoy, conteo de pendientes, gráfica de los últimos 7 días agrupada por día, y los 4 pedidos más recientes), reusando `OrderStatusBadge` para el estado de cada uno.

**Publicación:** 6 commits subidos a GitHub y desplegados en Vercel: `8ab5ca1` (pedidos reales del comprador), `209d8e0` (validación de Mercado Pago + gateo de demo_mode), `409e124` (documentación), `928ae0e` (fix de ESLint), `86b2203` (Estadísticas real), `0983f69` (Resumen y Reseñas reales). `npm run build` verificado sin errores antes de cada subida. Clerk a producción quedó como pendiente explícito para una próxima sesión, bloqueado únicamente por la compra del dominio propio.

---
