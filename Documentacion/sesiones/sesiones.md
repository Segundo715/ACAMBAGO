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

## 2026-07-21 — Martes — Registro simplificado, varias tiendas por cuenta, carruseles arrastrables y circuito de cupones

Sesión larga, mayormente guiada por el usuario probando la app real en su celular y reportando bugs con capturas de pantalla, más una lista de pendientes en un archivo de notas ("Errores Como tienda.md").

### Buscador del home: autocompletado en vivo y búsqueda por categoría

- El buscador del home solo comparaba contra el nombre del negocio; una búsqueda como "ferretería" no encontraba nada si esa palabra no estaba en el nombre. Se corrigió para que también compare contra `category`.
- Nuevo componente `SearchBar.tsx`: sugerencias en vivo mientras se escribe (autocompletado), reemplazando el input suelto que antes solo filtraba al enviar el formulario.

### Categorías: arrastre con mouse, categoría nueva, imágenes, y carrusel

- Nuevo componente `DragScroll.tsx`: permite arrastrar con el dedo o el mouse las filas de categorías en pastilla (antes solo se podían deslizar con touch nativo, sin soporte de arrastre con mouse en escritorio).
- Se agregó la categoría **"Accesorios"** a `BUSINESS_CATEGORIES` (`src/types/index.ts`), verificando primero que el proyecto no contempla comida/restaurantes (siguiendo la convención ya documentada).
- Se agregó `CATEGORY_ICONS` (mapa de emoji por categoría) y se buscaron/verificaron imágenes reales (Unsplash, descargadas y revisadas una por una antes de usarlas) para 9 categorías más de "Explorar por Categoría" en el home, más el emoji 2D correspondiente en las listas de negocios del panel de admin (antes usaban un ícono genérico de tienda para todas).
- "Explorar por Categoría" pasó de ser una cuadrícula estática a un **carrusel** (`CategoriesReel.tsx`), con el mismo patrón que ya tenía "Productos Destacados": auto-scroll con `requestAnimationFrame`, arrastre con mouse vía Pointer Events, scroll táctil nativo, pausa al interactuar y reanudación al soltar. `CategoryCard` se cambió de un `<Link>` envolvente a un `<div>` con un `<Link>` invisible superpuesto (mismo patrón de fix que el bug de clic en productos, ver más abajo).

### Registro simplificado, botón "Crear tienda" y varias tiendas por cuenta

Pedido explícito del usuario: que el registro sea una sola vez (sin elegir "comprador" o "vendedor" antes de crear la cuenta), que exista un botón "Crear tienda" que convierta la cuenta en vendedor, y poder llevar más de una tienda con la misma cuenta. Se confirmó con el usuario que la cuenta se convierte **por completo** a modo vendedor (no quedan ambos modos a la vez) y que, con varias tiendas, se elige cuál gestionar con un **selector arriba en el panel** (como cambiar de cuenta en Gmail), no con una pantalla aparte al entrar.

- `(auth)/register/page.tsx`: se quitó la pantalla de elegir rol antes de crear la cuenta; ahora es un simple "Crear cuenta" hacia `/signup`. `onboarding/page.tsx` ya no lee ningún rol pendiente de `localStorage`; todo usuario nuevo entra como `"client"`.
- Nueva ruta `(public)/perfil/crear-tienda/page.tsx`: formulario de alta de tienda (nombre, descripción, categoría, dirección, WhatsApp, foto, ubicación con "Usar mi ubicación actual"), que llama a `POST /api/businesses` (ruta que ya existía pero no se usaba desde ningún lado) y sube el rol de la cuenta a `"business"`. Sirve tanto para el primer negocio como para agregar una tienda adicional.
- Nuevo `src/lib/current-business.ts`: cookie `current_business_id` (mismo patrón que la cookie `demo_mode` ya existente) para recordar qué tienda está activa, con `loadOwnedBusinesses()` para traer todas las tiendas de un dueño y resolver cuál es la activa.
- Se detectó que `businesses.owner_id` nunca tuvo una restricción UNIQUE en SQL, pero casi toda la app asumía una sola tienda por dueño con `.eq("owner_id", ...).single()`, repetido en 8+ archivos del dashboard más `api/stripe/connect/route.ts`. Se hizo un refactor mecánico en todos para resolver la tienda **activa** (por la cookie) en vez de asumir una sola. De paso se corrigió un bug real: `settings/page.tsx` guardaba cambios con `.update(payload).eq("owner_id", ...)`, lo que con varias tiendas hubiera sobrescrito **todas** las tiendas del dueño con los mismos datos; ahora es `.eq("id", business.id)`.
- `UserInfo.tsx` (barra lateral): si el dueño tiene más de una tienda, muestra un selector desplegable con el nombre de la tienda activa y las demás, más "+ Agregar otra tienda"; si solo tiene una, se ve igual que antes (sin selector).

### Carrusel de Productos Destacados arrastrable y bug de clic en la foto del producto

- `ProductsReel.tsx` se reescribió de la animación CSS `animate-reel` a `overflow-x-auto` + auto-scroll con `requestAnimationFrame`, con arrastre de mouse (Pointer Events) y scroll táctil nativo, pausa al interactuar y reanudación al soltar.
- Bug reportado: en las tiendas demo, hacer clic en la foto de un producto no navegaba a la página del producto (aunque el resto de la tarjeta sí). Causa raíz: el `<div>` de la imagen tenía `position: relative` sin `z-index` explícito, y por las reglas de contexto de apilamiento de CSS eso lo pintaba por encima del `<Link>` invisible (`z-0`) que cubre toda la tarjeta, pese a no tener ningún manejador de clic propio. Se corrigió con `pointer-events-none` en el `<div>` de la imagen y `pointer-events-auto` en los botones de flecha de `MiniCarousel` (que sí deben seguir siendo clicables). Mismo patrón de fix aplicado después en `CategoryCard`.

### Verificación de teléfono por SMS, foto de perfil y foto del producto en el carrito

- `(public)/perfil/page.tsx`: al cambiar el teléfono, ahora se pide un código SMS de verificación (Clerk `createPhoneNumber` + `prepareVerification`/`attemptVerification`), explícitamente **solo** en esta pantalla de edición de perfil, no en el registro inicial (así lo pidió el usuario). Hubo que envolver la llamada con el hook `useReverification` de Clerk (las cuentas piden "reverificación" para cambios sensibles) y manejar el caso de cancelación del usuario.
- Habilitar teléfono como identificador en Clerk resultó requerir el plan **Clerk Pro** de pago (el usuario lo contrató) y agregar México al listado de países permitidos para SMS en la configuración de Clerk.
- Se agregó también subida de foto de perfil, con conversión de HEIC a JPEG en el navegador (`heic-convert/browser`) para las fotos que llegan directo de iPhone, subida al nuevo bucket de Storage `profile-images` (`supabase/profile-avatars.sql`, corrido manualmente por el usuario).
- La foto del producto ahora se ve en el carrito (`CartDrawer.tsx`), antes solo mostraba nombre y precio.

### La sesión demo ya no se mezcla con una sesión real de Clerk

- Bug reportado: un vendedor real logueado veía en el header el nombre y negocio de la demo ("Ferretería Acámbaro / Ana García"), porque `UserInfo.tsx`, `DemoBanner.tsx`, `use-auth-user.ts` y el gate de `dashboard/layout.tsx` leían la cookie `demo_mode` sin fijarse si ya había una sesión real de Clerk activa. Se corrigió esperando a que Clerk termine de cargar y solo honrando el modo demo cuando no hay usuario real; además se agregó `DemoModeGuard.tsx`, montado en el layout raíz, que limpia la cookie apenas detecta una sesión real en cualquier parte de la app.

### Selector de tiendas: previsualizar y compartir, y "pedidos pendientes" fijo en tiendas nuevas

- El icono de tienda en la barra lateral ahora abre el perfil público del negocio tal como lo ven los clientes (antes no hacía nada); se agregó un botón "Compartir mi tienda" junto al selector, reusando y generalizando `ShareButton.tsx` (ahora acepta `url`/`label`/`className`).
- Se corrigió un texto fijo "3 pendientes" en las acciones rápidas del Resumen del vendedor que ignoraba el conteo real de pedidos pendientes ya calculado en la misma página; una tienda nueva sin pedidos mostraba "3" en vez de "0".

### Circuito de cupones, enlace de Mercado Pago y productos en dos columnas en celular

A pedido del usuario, se revisó todo el circuito de cupones (a dónde dirigen, dónde se guardan, cómo se escanean) y se agrandaron los códigos QR.

- Bug real encontrado: `/api/coupons/validate` ya validaba duplicados por `user_id`, pero el QR nunca traía la identidad del comprador y la pantalla de escaneo nunca la mandaba, así que esa validación nunca se disparaba y un mismo cliente podía canjear un cupón varias veces hasta el límite global. Se corrigió embebiendo el `user_id` del comprador en el QR (solo cuando lo ve un comprador logueado, no en la vista del propio vendedor) y hacer que la pantalla de escaneo lo extraiga y lo mande al validar.
- Los QR se agrandaron de 80px/120px a 150px, tanto en la vista del comprador como en la vista previa al crear un cupón. Se decidió explícitamente **no** agregar QR a la página general `/coupons` (listado), solo dejarla como está.
- Se corrigió un enlace roto (404) a las credenciales de Mercado Pago en Ajustes: la URL vieja (`developers/panel/credentials`) quedó obsoleta tras una reestructuración del portal de desarrolladores; se verificó la URL vigente con búsqueda web y `curl` antes de reemplazarla.
- Último pedido del día: que los productos se vieran "bien centrados, alineados o de dos productos" en celular. La cuadrícula de productos (tanto en la página pública de la tienda como en el panel del vendedor) estaba en una sola columna en pantallas angostas (`grid-cols-1 sm:grid-cols-2`). Se cambió a dos columnas desde el primer breakpoint, con imagen, textos y botón "Agregar al carrito" más compactos (el botón se acorta a "Agregar" en celular) para que quepan bien en columnas angostas.

**Publicación:** 14 commits subidos a GitHub y desplegados en Vercel: `26998b0` (buscador con autocompletado), `e63a3a2` (arrastre de categorías en pastilla), `3126e10`/`943b834`/`0981520` (categoría Accesorios e imágenes), `43254fd` (carrusel de categorías), `cb4f20f` (registro simplificado y varias tiendas), `6f9590b`/`e070053` (carrusel de productos arrastrable y fix de clic), `be8a954`/`95b448c`/`484e332` (verificación SMS, foto de perfil, foto en el carrito), `6be3ced` (aislar sesión demo), `8da6c35`/`edfa4f2` (previsualizar/compartir tienda, fix de pendientes), `249ac85`/`549cc93`/`d892577`/`449366b` (carrusel de categorías arrastrable, circuito de cupones, enlace de Mercado Pago, productos en dos columnas). `npm run build` y `eslint` verificados sin errores antes de cada subida.

---

## 2026-07-22 — Miércoles — Favoritos de tienda, menú móvil, y varias pantallas que seguían mostrando datos simulados o rotos

Sesión de puros bugs reales encontrados y corregidos, casi todos reportados por el usuario probando la app en vivo desde el celular con capturas de pantalla.

### "Tiendas favoritas" en el perfil seguía siendo 100% demo

- La sección nunca se conectó a datos reales: usaba `DEMO_BUYER_FAVORITES` fijo con una etiqueta "Demo" permanente sin importar la sesión. Primero se corrigió derivándolo de `product_favorites` (las tiendas de los productos que el comprador ya había marcado con el corazón); más tarde en la misma sesión se reemplazó por una solución más directa (ver más abajo).

### Menú móvil (hamburguesa): perfil clicable, cierre al tocar fuera, y selector de tiendas estilo Facebook

- La tarjeta de usuario ("Jesus / Client") no llevaba a ningún lado; ahora abre `/perfil`.
- El menú no se cerraba al tocar fuera; se agregó el mismo detector de clic-afuera que ya usa el selector de tiendas del panel de escritorio (`UserInfo.tsx`).
- Nuevo selector "Mis tiendas" para vendedores con varias tiendas: cada una con su foto de perfil (o ícono de tienda si no tiene), la tienda activa marcada con una palomita, y tocar otra cambia al instante (cookie `current_business_id` + recarga), imitando lo rápido que es cambiar de perfil en Facebook.

### Íconos emoji en la barra inferior del panel no eran 2D

- La barra inferior móvil del panel de vendedor (`dashboard/layout.tsx`) usaba emoji nativos (📊📦🛒🎟️⚙️), que se ven con sombreado 3D según el teclado/dispositivo (notorio en "Productos" y "Cupones" comparado con el resto). Se reemplazaron por los mismos íconos planos de `lucide-react` que ya usa el sidebar de escritorio (`DashboardNav.tsx`).

### Se quitan los botones de demo del login, y corazón real para tiendas favoritas

- "Demo Comprador"/"Demo Tienda" no debían seguir ofreciéndose junto al login real en producción; se eliminó `DemoLoginButtons.tsx` (sin más usos) y `startDemoMode()`, que se quedó sin quien lo llamara.
- Se agregó de verdad la posibilidad de marcar una tienda como favorita: nueva tabla `business_favorites` (`supabase/business-favorites.sql`, corrida manualmente por el usuario) y `BusinessFavoriteButton.tsx` (corazón igual al que ya existía para productos), visible en las tarjetas de tienda del home y de categoría (no en las tiendas demo, que no existen en la base de datos). "Tiendas favoritas" en `/perfil` se simplificó para leer directo de esta tabla en vez de derivarlo de los productos favoritos.

### El pie de la tarjeta de login se veía suelto

- Clerk dibuja el link "Regístrese" y el aviso "Development mode" en un bloque aparte, debajo de la tarjeta principal, con fondo transparente; contra el fondo de la página se veía como una pieza desalineada. Se le dio el mismo fondo oscuro, borde y esquinas redondeadas que la tarjeta de arriba (`clerk-appearance.ts`) para que se vea como una sola pieza continua. (Nota: antes de esto se probó oscurecer el fondo de toda la página de login, pero el usuario aclaró que el color estaba bien y que el problema real era este acomodo del pie de tarjeta; ese cambio de fondo se revirtió.)

### Letras invisibles en el carrito en modo oscuro

- Bug encontrado con evidencia directa en el CSS compilado: el fondo del carrito (`CartDrawer.tsx`) usaba `dark:bg-[#060e18]/97`. Tailwind solo genera clases de opacidad en pasos de 5 sin corchetes (90, 95, etc.); `/97` no es un paso válido, así que esa clase **nunca se generaba**, y el fondo se quedaba blanco en modo oscuro mientras el texto sí cambiaba a blanco: letras blancas sobre fondo blanco. Se cambió a `/95` (mismo valor que ya usan otros paneles con este color) y se confirmó revisando directamente el CSS compilado (`.next/static/chunks/*.css`) antes y después del fix.

### Productos de una tienda con pocos productos en una sola columna en celular

- Ya se había arreglado esto para las tiendas demo, pero las tiendas **reales** usan un componente distinto (`ProductsReel.tsx`) para su sección "Productos". Con menos de 5 productos (`MIN_ITEMS_FOR_LOOP`), ese componente cae a un modo sin auto-scroll (`flex-wrap`) con tarjetas de ancho fijo (224px), que en un celular angosto solo cabían una por fila. Se cambió ese modo a una cuadrícula real (2 columnas en celular, 3 en tablet, 4 en escritorio).

### Circuito de cupones: contador de usos, tamaño, y la página general que nunca mostraba cupones reales

- El contador de "cuánta gente usó este cupón" solo se mostraba si el cupón tenía un límite de usos configurado; con límite ilimitado nunca se veía el conteo, aunque `coupons.used_count` sí lo lleva. Se corrigió para mostrarlo siempre.
- Se agrandó la insignia de descuento y el QR (150px → 180px) en la vista del cupón y en la vista previa al crearlo.
- **Bug real más importante de la sesión:** la página pública `/coupons` (listado general) nunca consultaba Supabase — solo renderizaba los arreglos `DEMO_COUPONS*` de `demo-data.ts`. Un cupón real creado por cualquier vendedor **no podía aparecer ahí nunca**, sin importar qué. Se corrigió para traer los cupones reales activos (de negocios aprobados y activos, no vencidos) vía una consulta con join (`businesses!inner`) y mezclarlos con los de demo.
- A pedido del usuario, se hizo clicable toda la tarjeta del cupón en `/coupons` (antes solo el textito con el nombre de la tienda lo era), llevando al perfil público de la tienda que lo creó.

**Publicación:** 11 commits subidos a GitHub y desplegados en Vercel: `eef529d` (favoritos derivados de productos), `3aea188` (menú móvil: perfil/cierre/selector estilo Facebook), `29f4ee2` (íconos 2D en barra inferior), `8b915ff`/`c9eb1fe` (quitar botones demo + corazón real de tiendas), `60d44e1` (pie de tarjeta de login), `e164761` (letras invisibles en carrito oscuro), `4d1e755` (productos en dos columnas para tiendas con pocos productos), `0cd2f5b` (contador de usos + tamaño de cupones), `6d3f51d` (cupones reales en `/coupons`), `50cb094` (tarjeta de cupón clicable). `npm run build` y `eslint` verificados sin errores antes de cada subida; el bug del carrito se verificó además inspeccionando directamente el CSS compilado.

---

## 2026-07-23 — Jueves — Home estilo Mercado Libre, vistos recientemente, y menú lateral colapsable

> Entrada reconstruida a partir de los commits reales de este día (no hubo registro en su momento); el detalle de cada cambio sale de los mensajes de commit y el diff, no de memoria de la sesión.

### Home: carrusel de banner y fila de accesos rápidos

- **`HeroCarousel.tsx`:** el banner principal pasó de una imagen estática a un carrusel de 4 diapositivas (Compra local, Publica tu tienda, Cupones con QR, Mapa) con flechas, puntos y auto-avance cada 5.5s, pausado al pasar el mouse; el buscador queda fijo sin importar la diapositiva.
- La fila de accesos rápidos creció a 11 tarjetas (cupones, negocios verificados, mapa, categorías, productos destacados, publicar tienda, vistos recientemente, menos de $500, más vendidos, entrega a domicilio, pago seguro), cada una totalmente clicable en vez de solo el botón. Después se extrajo a `QuickAccessRow.tsx` (client component) para que las 11 tarjetas se deslicen horizontalmente con flechas a los lados en vez de partirse en dos filas, igual que el resto de carruseles de la app.

### Vistos recientemente, más vendidos y menos de $500: de accesos decorativos a páginas reales

- Nuevo `src/lib/recently-viewed.ts` (localStorage, sin backend) y `TrackRecentlyViewed.tsx`, montado en la página de producto, para registrar cada visita.
- Tres páginas nuevas: `/vistos-recientemente` (lee el historial local del navegador), `/mas-vendidos` (ordena por ventas reales, misma RPC que Productos Destacados), `/menos-de-500` (filtra productos reales con precio ≤ $500).
- La tarjeta "Vistos recientemente" de accesos rápidos pasó de un ícono genérico a mostrar la foto, nombre y precio reales del último producto visto, como Mercado Libre.

### Ajustes de navegación en escritorio

- **`DesktopShell.tsx`:** botón con flecha pegado al borde del sidebar que lo desliza fuera de pantalla y expande el contenido a todo el ancho; recuerda la preferencia en `localStorage` entre visitas.
- Se quitó el ícono de carrito duplicado de la barra superior móvil (`Navbar.tsx`): ya existe siempre visible en la barra inferior, y tenerlo en ambas barras era redundante.

### Página "Más" para compradores y notificaciones con sonido

- Nueva `/mas`, estilo Mercado Libre con los colores de AcambaGo: cabecera con el perfil, y secciones Mi actividad (pedidos, vistos recientemente, favoritos, cupones), Descubre (categorías, más vendidos, menos de $500, mapa, cupones) y Vender/Cuenta, todo apuntando a páginas reales ya existentes. La pestaña inferior que antes decía "Perfil" ahora dice "Más" y lleva ahí para compradores; vendedores y admin siguen yendo directo a su panel. En escritorio, "Mi panel" solo era alcanzable desde la barra inferior móvil — se corrigió para que el sidebar de escritorio también diga "Más" y lleve a `/mas` para compradores.
- El beep (Web Audio API) que ya usaba el panel del vendedor para pedido nuevo se extrajo a `lib/notification-sound.ts` compartido, y se conectó también del lado del comprador: en `/perfil` (cambio de estado de cualquier pedido) y en `/checkout/tracking` (avance en vivo del pedido que se está siguiendo). Antes solo el vendedor escuchaba algo; el comprador solo veía el toast si tenía la pantalla abierta.

**Publicación:** 9 commits — `c1c3492` (banner carrusel + accesos rápidos), `dc21779` (registro de vistos recientemente), `1fa9394` (páginas reales de vistos/más vendidos/menos de 500), `6f424e0` (accesos rápidos deslizable + vistos recientemente real), `2e78e02` (flecha para ocultar sidebar), `85e91c3` (fix ícono de carrito duplicado), `4ec2c73` (página "Más"), `60f31a4` (sonido también para el comprador), `7698abe` (fix "Más" inalcanzable desde escritorio).

---

## 2026-07-24 — Viernes — Modo Mi cuenta/Mi tienda, direcciones guardadas, inventario, preguntas, y un crash que solo pasaba con sesión iniciada

Día largo con dos sesiones de trabajo separadas: una en la mañana (funcionalidad nueva) y otra en la tarde (bugs reales encontrados por el usuario probando en su celular y en escritorio).

### Mañana: selector de modo, direcciones, inventario y preguntas

- **`AccountModeSwitcher.tsx`:** control para cambiar entre el lado comprador y el panel de vendedor sin que sean cuentas separadas (reemplaza el botón "Mi Tienda"/"Ir a comprar", que quedaron redundantes), visible en el sidebar público y en el panel del vendedor.
- **Direcciones guardadas del comprador:** nueva tabla `addresses` y página `/perfil/direcciones` (alta, edición, borrado, marcar predeterminada). En el checkout, si ya hay direcciones guardadas aparecen como tarjetas para elegir con un toque; si se escribe una nueva, se puede marcar "Guardar esta dirección para la próxima vez".
- **Perfil del comprador reorganizado:** nuevo `/perfil/layout.tsx` con sidebar (Resumen, Mis compras, Favoritos, Direcciones, Preguntas, Notificaciones, Configuración), igual que ya tenía el panel del vendedor. `/perfil` pasó de estar todo apilado en una sola página a un Resumen compacto con vistas previas; el formulario de editar perfil se movió a `/perfil/configuracion` y las tiendas favoritas a `/perfil/favoritos`, sin quitar funcionalidad.
- **Inventario real por producto:** `products.stock_quantity` opcional (`NULL` sigue funcionando igual que antes, sin control de cantidad). Al confirmarse un pedido, el stock se descuenta solo. Insignia "Agotado"/"Últimas X"/"X en stock" tanto en el panel del vendedor como en la página del producto, con pestaña "Agotados" y el botón "Agregar al carrito" desactivado en 0.
- **Preguntas al vendedor y notificaciones persistentes:** nuevas tablas `product_questions` y `notifications`. Un comprador pregunta sobre un producto real, el vendedor responde desde `/dashboard/business/preguntas` y la respuesta queda pública para cualquiera (como Mercado Libre). Se agregó una notificación persistente (no solo el toast del momento) en los 4 puntos donde antes solo había aviso en vivo: pedido nuevo para el vendedor, cambio de estado para el comprador, pregunta nueva para el vendedor, respuesta para el comprador.

### Vercel: protección de despliegue bloqueaba el sitio en producción

El usuario reportó "This page couldn't load" al abrir `acambago-kappa.vercel.app` desde su celular. Antes de encontrar la causa real (ver más abajo), se detectó y desactivó una protección de despliegue de Vercel (SSO) que podía estar bloqueando el acceso público al sitio; se confirmó por separado que el servidor respondía bien (HTTP 200, deployment `Ready`, alias apuntando al deployment correcto).

### El crash real: dos campanas de notificaciones peleando por el mismo canal

Con sesión iniciada, la app tronaba con la pantalla genérica de Next.js "This page couldn't load", tanto en celular como en escritorio (reproducido en vivo con la consola de Edge abierta). El error real: `Uncaught Error: cannot add postgres_changes callbacks for realtime:notifications-user_... after subscribe()`.

Causa raíz: `Navbar` (móvil) y `DesktopSidebar` (escritorio) montan **ambos** `NotificationBell` en cada página pública, uno oculto por CSS según el ancho de pantalla, no por render condicional — o sea, los dos existen en el DOM al mismo tiempo. Los dos abrían un canal de Supabase Realtime con el mismo nombre (`notifications-${user.id}`); como `createClient()` reutiliza el mismo cliente de Supabase entre instancias, la segunda copia obtenía el canal ya suscrito de la primera y tronaba al llamar `.on()` después del `.subscribe()`. Pasaba siempre que había sesión activa, sin importar red, navegador o dispositivo — por eso ninguna prueba de WiFi/datos móviles/DNS cambiaba el resultado. Se corrigió dándole a cada instancia un nombre de canal único (`notifications-${user.id}-${instanceId}`, generado dentro del propio efecto).

### El popup del `<select>` de categoría se veía blanco en modo oscuro

Reportado con captura: al abrir el selector de categoría en Configuración, el listado de opciones aparecía en una caja blanca gigante y descuadrada, sin nada que ver con el tema oscuro del resto de la página. Primer intento (declarar `color-scheme: dark` en `html.dark`) no fue suficiente: Edge sigue dibujando el popup de un `<select>` nativo con su propio estilo, ignorando el CSS de la página. Se reemplazó el `<select>` nativo por `CategorySelect.tsx`, un botón + lista desplegable propios (mismo patrón de detector de clic-afuera que ya usa el selector de tiendas de `Navbar.tsx`), usado en Configuración y en Crear tienda.

### Otros ajustes de la tarde

- El placeholder de "Notas para la tienda" en el checkout decía "Ej: Sin picante, empaque especial..." — un ejemplo de restaurante que no aplica a ningún negocio real de la plataforma (AcambaGo no vende comida). Se cambió a "Ej: talla, color, empaque especial, instrucciones de entrega...".
- **Pausar un producto sin eliminarlo:** `products.is_available` ya existía en la base de datos y el storefront ya filtraba por él (`get_featured_products`, `business/[id]`, `menos-de-500`), pero no había forma de apagarlo desde el panel — solo editar o borrar. Se agregó un botón de pausar/activar por producto; mientras está pausado se ve atenuado con un badge "Pausado" y desaparece de la tienda pública sin perder sus datos.
- **Aviso de pedido nuevo en todo el panel:** el sonido + toast de "pedido nuevo" solo se disparaba si el vendedor tenía abierta justo `/dashboard/business/orders`; en cualquier otra página del panel solo subía el contador de la campana en silencio. Nuevo `OrderAlertListener.tsx`, montado una vez en `dashboard/layout.tsx`, que escucha los pedidos de la tienda activa desde cualquier pantalla del panel; `orders/page.tsx` ya no duplica el sonido, solo mantiene su propia lista al día.

**Publicación:** mañana — `9eb5561` (selector Mi cuenta/Mi tienda + campana), `af57775` (direcciones guardadas), `3358c9c` (perfil reorganizado en panel), `b28cc49` (inventario real), `2b1d309` (preguntas + notificaciones persistentes). Tarde — `c4b1191` (fix crash de la campana de notificaciones), `0d2ff1e` (intento con `color-scheme`), `3d718c0` (`CategorySelect` propio), `94f55d6` (placeholder del checkout), `5fa2aa3` (pausar producto), `41a27d5` (aviso de pedido en todo el panel). `npm run build` y `eslint` verificados sin errores antes de cada subida de la tarde.

---

## 2026-07-27 — Lunes — Métodos de entrega configurables, información de pedidos incompleta en el panel, y buzón de mensajería privada

### Configuración de métodos de entrega por negocio

Pedido explícito del usuario: que cada tienda pueda activar/desactivar de forma independiente Recoger en tienda, Punto de reunión y Entrega a domicilio, y que el checkout solo le muestre al cliente los métodos que el negocio tenga activados (algunas tiendas no hacen domicilio, otras no usan punto de reunión).

- Nueva migración `supabase/delivery-methods.sql`: columnas `pickup_enabled`, `meeting_enabled`, `home_enabled` en `businesses`, todas `true` por defecto para no romper negocios ya existentes.
- Nueva sección "Configuración de entregas" en `dashboard/business/settings/page.tsx`, con un switch por método; bloquea el guardado si se desactivan los tres a la vez.
- `(public)/checkout/page.tsx`: el `select` a `businesses` ahora trae las tres columnas nuevas; el selector de método del paso 2 se filtra por **intersección** de los negocios presentes en el carrito (mismo patrón que ya se usaba para solo ofrecer Mercado Pago/Stripe cuando todas las tiendas del carrito los soportan). Si el método ya elegido deja de estar disponible, se cambia automáticamente al primero disponible.
- Verificado contra la base real (con autorización explícita del usuario): se crearon pedidos de prueba llamando al mismo RPC que usa el checkout para confirmar el filtrado, y se borraron al terminar.

### El panel de pedidos no mostraba toda la información que el cliente capturó al comprar

- Bug real encontrado: cuando el cliente elegía "Punto de reunión" en el checkout, se mandaba `p_address: null` al RPC — el punto elegido (nombre y dirección) **nunca llegaba a guardarse**, se perdía por completo tras confirmar el pedido.
- Además, `orderToRow()` en `dashboard/business/orders/page.tsx` reducía cada pedido a un resumen pobre: de la dirección completa (JSONB) solo tomaba `street` (ignorando colonia, CP, ciudad y referencias), y **nunca leía `note`** aunque sí estuviera guardada en la base de datos. El teléfono tampoco se mostraba como texto, solo se usaba para armar el link de WhatsApp.
- Fix: el checkout ahora arma `deliveryDetails` según el método (domicilio → dirección completa; punto de reunión → `{ meeting_point_name, meeting_point_address }`; recoger → `null`, no aplica). El detalle expandible de cada pedido en el panel ahora muestra: cliente, teléfono, fecha y hora, método de pago, método de entrega con su dirección o punto completo, referencias, notas del cliente, productos con cantidad y precio, y desglose subtotal + envío + total.
- Verificado con un script temporal contra la base real: se creó un pedido de cada tipo de entrega (mismo RPC que el checkout), se confirmó que toda la información se guarda y se lee correctamente simulando la función real `orderToRow()`, y se borraron los pedidos de prueba al terminar.

### Buzón de mensajería privada cliente-vendedor

El usuario preguntó si existía alguna forma de contactar a una tienda sin usar WhatsApp (ej. preguntar tallas antes de comprar). Ya existía "Preguntas y respuestas" por producto, pero es **pública** (la ve cualquiera que entre al producto) y de una sola pregunta-respuesta, no una conversación privada de varios mensajes.

- Nuevas tablas `conversations` (una por negocio + cliente, con nombre del cliente y producto de contexto guardados como snapshot, igual que `orders.customer_name`) y `messages` (`supabase/messages.sql`), con Supabase Realtime habilitado sobre `messages`.
- Botón "Enviar mensaje" junto al de WhatsApp en la página de producto y en la de la tienda (`MessageSellerButton.tsx`, redirige a login si no hay sesión).
- Bandejas nuevas: comprador en `/perfil/mensajes`, vendedor en `/dashboard/business/mensajes`, ambas usando el mismo componente de hilo compartido (`ChatThread.tsx`) que se actualiza en vivo vía Realtime (mensajes propios se agregan de forma optimista con la respuesta del insert, los del otro lado llegan por la suscripción — sin duplicados). Cada mensaje nuevo dispara una notificación (tipo `new_message`) al otro lado.
- Verificado de punta a punta contra la base real: creación de conversación, mensajes en ambos sentidos, actualización de marcas de lectura y último mensaje, notificaciones con el link correcto, y confirmación explícita de que el evento de Realtime sí llega (suscripción de prueba + insert desde otro cliente, con respuesta en menos de un segundo). Todo el rastro de prueba se borró al terminar.

**Publicación:** 3 commits — `15ac069` (métodos de entrega configurables por negocio), `4627434` (información completa de pedidos en el panel), `4e739dc` (buzón de mensajería privada). `npm run build` y `tsc --noEmit` verificados sin errores antes de cada subida.

---

## 2026-07-28 — Martes — Línea suelta en el panel móvil, cupones vencidos sin forma de renovarse, y otro `<select>` nativo ilegible en modo oscuro

### Línea flotante bajo el menú de cuenta en el panel móvil

- Reportado con captura desde el celular: una línea suelta, cortada a la mitad de la pantalla (no llegaba al borde izquierdo), justo debajo del selector de tienda/menú de cuenta en la barra superior del panel de vendedor.
- Causa raíz: `UserInfo.tsx` lleva un `border-b` pensado para cuando ocupa el ancho completo de la barra lateral de escritorio (donde separa esa sección de la navegación de abajo). En la barra superior **móvil**, el mismo componente vive apretado como un elemento más de una fila `flex` junto a la campana de notificaciones, así que ese borde solo alcanzaba a dibujarse en el ancho de su propia columna angosta, no en el ancho completo de la pantalla — de ahí la línea "flotando" a la mitad.
- Antes de tocar código, se reprodujo el bug de verdad: se instaló Playwright de forma temporal (`npm install --no-save`, sin tocar `package.json`), se levantó un servidor en modo demo en un puerto aparte (sin tocar `.env.local` ni la base real) y se tomó una captura en viewport de celular con modo oscuro forzado, confirmando visualmente la misma línea que reportó el usuario.
- Fix: nueva prop `variant` en `UserInfo` (`"sidebar"` por defecto, `"topbar"` para el uso móvil) que omite el borde ahí. Se volvió a capturar la misma pantalla para confirmar que ya no aparece. Playwright y el servidor de prueba se removieron por completo al terminar, sin dejar rastro en `package.json`/`package-lock.json`.

### Cupones vencidos no se podían volver a habilitar de verdad

- El botón "Desactivar/Activar" del panel de cupones solo cambiaba `is_active`, pero la validez real de un cupón (`isCouponValid()` en `src/lib/utils.ts`, usada también por el endpoint de canje por QR) depende **también** de `expires_at`. Un cupón vencido se quedaba inválido para siempre aunque se reactivara con ese botón, sin ningún mensaje que lo explicara.
- Se agregó "Renovar cupón" en `dashboard/business/coupons/page.tsx`: aparece en vez de "Desactivar" cuando el cupón está vencido, abre un selector de fecha (se puede dejar en blanco para "sin vencimiento") y al confirmar actualiza `expires_at` + `is_active: true` de una vez, dejándolo válido de inmediato tanto para mostrarse al cliente como para canjearse por QR en tienda.

### El popup del `<select>` de "Tipo de descuento" se veía sin texto legible en modo oscuro

- Mismo patrón de bug que ya se había visto antes con el `<select>` de categoría (sesión del 24 de julio, ver arriba): el navegador no puede pintar con transparencia el popup nativo de un `<select>`, así que el fondo translúcido de `.input` (`dark:bg-white/10`) cae a blanco por defecto mientras el texto de las opciones hereda blanco también — texto invisible salvo en la opción resaltada por el propio navegador.
- Se confirmó por grep que es el **único** `<select>` nativo que queda en toda la app (el de categoría ya se había reemplazado por `CategorySelect.tsx` propio en la sesión del 24 de julio, justo por este mismo problema). Se le dio color explícito a cada `<option>` (`bg-white dark:bg-slate-800 text-slate-900 dark:text-white`).
- **Nota pendiente para el futuro:** la sesión del 24 de julio dejó registrado que en Edge poner solo `color-scheme: dark` no bastó para el popup del `<select>` de categoría — el navegador lo ignoraba por completo, y por eso se terminó reemplazando por un componente propio en vez de solo darle color a las opciones. Este fix de hoy sí le puso color directo a cada `<option>` (un paso más que aquel intento fallido), pero no se verificó específicamente en Edge. Si el problema vuelve a aparecer ahí, la solución ya probada y confiable es reemplazar este `<select>` también por un componente propio, como se hizo con `CategorySelect.tsx`.

### Cambio de rol temporal (no fue un commit, cambio directo en Supabase)

A pedido del usuario, se cambió el rol de la cuenta de prueba "Luis D Mal" (`ldmh93@gmail.com`, un usuario de prueba de Clerk) de `business` a `admin` directamente en `profiles` para que viera el panel de administración; más tarde en la misma sesión se revirtió a `business` a pedido del usuario, antes de subir el resto de los cambios del día.

**Publicación:** 2 commits — `1d31028` (fix de la línea flotante en el panel móvil), `e5a1f2b` (renovar cupones vencidos + contraste del select de tipo de descuento). `tsc --noEmit` y `npm run lint` verificados sin errores antes de cada subida.

---

## 2026-07-29 — Miércoles — Desborde horizontal en celular, editar cupones, saldo de cupones del admin, íconos 2D, y el canje de cupones QR reescrito de raíz

### El panel seguía sin caber completo en el celular

- El usuario reportó (con foto real del celular) que la pantalla de "Pedidos" se veía cortada a la mitad, con el menú de cuenta empujado fuera de la pantalla. Se midió directamente con Playwright en modo demo (`document.documentElement.scrollWidth` vs `innerWidth`): la página medía 641px en un viewport de 390px.
- Causa raíz encontrada por bisección (ocultando secciones una por una hasta aislarla): la fila de pestañas de Pedidos (`overflow-x-auto`) no tenía ningún ancestro con `min-w-0`, así que el navegador agrandaba toda la página para que cupieran las 5 pestañas en vez de activar el scroll interno — típico "gotcha" de flexbox donde falta `min-width: 0` en algún punto de la cadena de contenedores.
- Fix: `min-w-0` en el contenedor principal de `dashboard/layout.tsx`. De paso, "Mi cuenta"/"Compartir mi tienda" (que ya contribuían al desborde por ocupar espacio fijo) se movieron al menú desplegable de `UserInfo.tsx`, en vez de mostrarse siempre en línea.

### El vendedor no podía editar un cupón ya creado

- Antes, para cambiar cualquier dato de un cupón (título, valor, límite, fecha) había que crear uno nuevo desde cero. Se extrajo el formulario a `CouponForm.tsx` (compartido entre crear y editar) y se agregó `/dashboard/business/coupons/[id]/edit`, que actualiza el cupón existente sin tocar su código ni su QR (para no invalidar uno ya compartido/impreso).

### Nuevo módulo: "Gestión de Cupones para Tiendas" — saldo de cupones asignado por el admin

El usuario pidió este módulo con una especificación pensada para Next.js + MySQL; se adaptó a la base real del proyecto (Supabase/Postgres) tras confirmar dos puntos por pregunta directa: los cupones siguen siendo genéricos (cualquier cliente los puede canjear, no uno por cliente específico), y quien escanea sigue siendo la cuenta del negocio (no se agregó un rol de "empleado" separado).

- `supabase/coupon-credits.sql`: columna `businesses.coupon_credits` (saldo, default 0), tabla `coupon_credit_grants` (historial: tienda, cantidad, admin, fecha), función `grant_coupon_credits()` (suma el saldo + registra historial en una transacción), y un **trigger** `BEFORE INSERT ON coupons` que descuenta 1 del saldo por cada cupón nuevo creado, bloqueando la creación con un mensaje claro si el saldo es 0.
- Nueva API `/api/admin/coupon-credits` (valida sesión + `role = admin` en el servidor, no solo en el cliente) y botón "Asignar 10 cupones" en `/admin?tab=negocios`, con diálogo de confirmación y el nuevo total en el toast de éxito.
- El panel del vendedor (`/dashboard/business/coupons`) muestra el saldo disponible, y `coupons/new` bloquea el formulario en 0 con un aviso en vez de un error crudo de Postgres.
- **Aviso de rollout importante:** el trigger deja el saldo en 0 para las tiendas ya existentes, así que hubo que asignarles saldo manualmente desde el panel de admin para que pudieran seguir creando cupones nuevos.

### Íconos con sombreado 3D en el panel de administración

- El usuario reportó con foto que los íconos de categoría de negocio (bolso, edificio, oso) se veían "glossy"/3D en su Android — mismo problema que ya se había resuelto antes para la barra inferior del panel de vendedor (sesión del 22 de julio), pero esta vez en `CATEGORY_ICONS` (`src/types/index.ts`), usado en el panel de admin, "Tiendas favoritas" y el encabezado de negocio. Se reemplazó el mapa de emoji por componentes de `lucide-react` y se creó `CategoryIcon.tsx` para reutilizar la lógica. Las páginas de tiendas *demo* (emoji hardcodeado, independiente de este mapa) se dejaron fuera a propósito.
- Búsqueda más a fondo: el sidebar de escritorio (`AdminNav.tsx`), las pestañas superiores (`admin/page.tsx`) y la barra inferior móvil (`admin/layout.tsx`) del panel de admin **también** tenían emoji propios (📊🏪👥🌐) para Resumen/Negocios/Usuarios/Ver sitio, sin relación con `CATEGORY_ICONS`. Se corrigieron los tres con `LayoutDashboard`/`Store`/`Users`/`Globe` de lucide-react.

### El canje de cupones por QR se reescribió de raíz: atómico, con confirmación y auditoría completa

El usuario pidió un flujo completo de escaneo/canje "seguro, que evite fraudes y funcione en tiempo real", otra vez con una especificación pensada para MySQL. Antes de tocar código se investigó qué de eso ya existía (bastante: generación de QR, validación de dueño/vigencia/límite, registro de canjes) para no reconstruir de cero, y se identificaron los huecos reales:

- **Condición de carrera real**: el canje se hacía con un `insert` + `update` separados desde el cliente de Supabase, lanzados con `Promise.all` sin transacción, con `used_count` calculado en JavaScript (no en SQL). Dos escaneos simultáneos del mismo cupón podían perder un incremento o dejar pasar más canjes que el límite configurado.
- **Sin auditoría de intentos fallidos**: `coupon_redemptions` solo guardaba los canjes exitosos, sin registro de por qué se rechazaba un intento (vencido, ya usado, tienda incorrecta, código inválido).
- **Sin paso de confirmación**: escanear el QR canjeaba de inmediato, sin mostrar antes los datos del cliente/cupón.

Se construyó `supabase/coupon-scan-audit.sql`: tabla `coupon_scan_log` (registra CADA intento, exitoso o no, con fase `scan`/`confirm`), un índice único anti-duplicado en `coupon_redemptions`, y la función `redeem_coupon()` — un RPC que hace TODA la validación y el canje en una sola transacción con row lock (`FOR UPDATE`), llamada dos veces desde la UI: una vez al escanear (`p_confirm=false`, solo valida) y otra al tocar "Confirmar canje" (`p_confirm=true`, marca como usado de verdad). `/api/coupons/validate` quedó como un wrapper delgado sobre este RPC. La pantalla de escaneo se rediseñó con el paso de confirmación (muestra cliente + cupón antes de canjear), pantallas verde/roja con el mensaje específico de cada error, sonido de confirmación (reutilizando `playNotificationSound`, ya existente), y se agregaron estadísticas (disponibles/utilizados/pendientes + gráfica de 7 días) al panel de cupones.

**Depuración en vivo de un bug real en la función SQL**, encontrado por la propia batería de pruebas contra la base real (9 casos, incluida concurrencia real con 5 escaneos simultáneos): la primera versión de `redeem_coupon()` usaba variables `RECORD` genéricas sin tipo fijo, que Postgres trata como "no asignadas" si nunca se les hace un `SELECT INTO` en esa ruta de ejecución (el caso "cupón de otra tienda" nunca llega a buscar el cupón, así que accedía a un campo de una variable jamás tocada). Cambiarlas a `%ROWTYPE` no bastó por sí solo; hizo falta además una asignación explícita `:= NULL` al inicio de la función para cubrir todas las rutas sin ambigüedad. Durante el diagnóstico, una pista falsa: la pestaña del SQL Editor de Supabase tenía la traducción automática del navegador activada, y mostraba el código con palabras clave traducidas al español (`COMIENZO`/`FIN`/`v_coupon.Valor`) — resultó ser solo un artefacto visual del navegador, no la causa real, pero vale la pena recordar apagar la traducción en esa pestaña para evitar confusión. El bug real se confirmó pidiéndole al usuario que corriera consultas de introspección directas (`SELECT prosrc FROM pg_proc WHERE proname = ...`) para ver exactamente qué versión de la función tenía guardada Postgres, en vez de confiar en lo que mostraba la pantalla.

Verificado con 9 casos contra la base real (con datos de prueba borrados al final): escaneo + confirmación con cliente real, duplicado (mismo cliente, mismo cupón), otro cliente sí puede usar el mismo cupón genérico, vencido, límite agotado, inactivo, tienda incorrecta, código inexistente, y 5 escaneos concurrentes del mismo cupón con límite 3 (resultado exacto: 3 canjeados, 2 rechazados, `used_count` final en 3, sin perder ni duplicar ningún conteo).

**Publicación:** 6 commits — `3df8490` (fix del desborde horizontal en celular), `8ec1d9f` (editar cupones existentes), `642e546` (saldo de cupones asignado por el admin), `20035f2` (íconos de categoría a lucide-react), `b1e7f44` (íconos de navegación del admin a lucide-react), `2e80958` (canje de cupones QR atómico y auditable). `tsc --noEmit`, `npm run lint` y `npm run build` verificados sin errores antes de cada subida.

---

## 2026-07-31 — Viernes — Espacio muerto en escritorio, página de categorías con productos, y favoritos que se perdían

### El diseño responsive ya estaba bien para celular, pero desperdiciaba espacio en monitores grandes

El usuario mostró una captura de `/mas` en un monitor ancho: el contenido quedaba en una columna fija de 512px (`max-w-lg`), dejando un vacío enorme junto al sidebar de escritorio. Es el problema contrario al de las sesiones anteriores (que ya habían dejado la app libre de desbordes en celular) — aquí el bug era subutilización del ancho, no overflow.

- **`(public)/mas/page.tsx`:** las secciones ("Mi actividad", "Descubre", "Vender", "Cuenta") pasaron a una cuadrícula de 2 columnas desde `lg:` (contenedor `max-w-lg lg:max-w-5xl`), sin tocar ningún link, ítem ni la lógica del componente `Section`. En celular el layout no cambió.
- **`(public)/checkout/page.tsx` y `checkout/tracking/page.tsx`:** incluidos en el mismo pase por tener el mismo patrón (`max-w-lg` fijo en la barra de progreso, el header sticky y el contenido). Se preguntó explícitamente al usuario si ensanchar el checkout o dejarlo angosto a propósito (patrón común en flujos de pago reales, para no distraer al comprador); eligió ensanchar manteniendo el mismo flujo lineal de pasos: `max-w-lg lg:max-w-2xl xl:max-w-3xl` en las 7 apariciones de ambos archivos.
- Verificado con Playwright en modo demo (servidor temporal, sin tocar `.env.local` ni la base real) en 1920px/1440px/1024px/768px/390px: cero overflow horizontal en ningún ancho, y capturas confirmando el aprovechamiento del espacio antes de subir.

### Nueva página `/categorias`: todas las categorías con sus productos

El botón "Ver categorías" de accesos rápidos del home solo bajaba a una sección que, al elegir una categoría, filtraba **negocios** — nunca mostraba productos. El usuario pidió explícitamente ver "todas las categorías con sus productos" en una sola pantalla, sin tener que entrar a cada categoría por separado.

- Nueva `(public)/categorias/page.tsx`: agrupa los productos reales (RPC `get_featured_products` ya existente, con límite alto) por `business_category`, y renderiza un `ProductsReel` (carrusel/cuadrícula, componente ya existente) por cada categoría con productos, con un link "Ver tiendas" hacia `/category/[nombre]`. En modo demo arma el mismo agrupamiento a partir de `DEMO_ALL_PRODUCTS` + `DEMO_ALL_BUSINESSES_LIST`.
- `QuickAccessRow.tsx`: la tarjeta "Categorías" ahora enlaza a `/categorias` en vez de `#categorias`.
- Verificado en modo demo: 16 categorías con productos reales, links a `/product/[id]` y `/category/[nombre]` correctos, sin overflow en desktop ni celular.

### Se quitan las menciones de "Negocios verificados"

A pedido del usuario, se buscó y quitó de todo el sitio (no solo de un lugar): la tarjeta de accesos rápidos "Negocios verificados", el beneficio correspondiente en la sección "¿Por qué comprar en Acom-Di?" del home, el sello "Negocio verificado" en la página de producto (quedó solo "Producto en tienda", ajustando su grid de 2 columnas a 1 ya que solo quedaba un elemento), y la palabra "verificadas" en el texto del carrusel del hero. Se dejó a propósito "Admin verificado" del panel de administración, por ser un badge de identidad del admin sin relación con negocios.

### Clic en una categoría mandaba al usuario hasta arriba de la página

El usuario reportó (con capturas) que al hacer clic en una categoría desde "Explorar por Categoría", la navegación a `/?category=X` lo dejaba viendo el hero carrusel hasta arriba, teniendo que bajar manualmente para ver los resultados filtrados — el hero y los accesos rápidos seguían renderizando siempre, sin importar si había un filtro activo.

- `(public)/page.tsx`: cuando el filtro activo es **solo** de categoría (sin búsqueda de texto), el hero y los accesos rápidos ya no se renderizan, así que los resultados aparecen directo arriba. Si hay una búsqueda de texto (`?q=`), se conservan, porque ahí vive la barra de búsqueda que el usuario podría querer editar.

### Los productos favoritos (corazón en Productos Destacados) nunca aparecían en ningún lado

El usuario señaló la inconsistencia entre el corazón de "Productos Destacados" y la pantalla de favoritos. Investigando el código se confirmó que son dos sistemas separados: `FavoriteButton.tsx` (tarjetas de producto) guarda en `product_favorites`, `BusinessFavoriteButton` (tarjetas de negocio) guarda en `business_favorites`, pero `(public)/perfil/favoritos/page.tsx` **solo leía `business_favorites`** — un producto marcado con el corazón no tenía ninguna pantalla donde verse.

- Se preguntó al usuario cómo prefería mostrar ambos tipos; eligió pestañas. `favoritos/page.tsx` ahora tiene pestañas "Productos"/"Tiendas", consulta ambas tablas (join a `products`/`businesses` para la de productos) y reusa `ProductsReel` en modo cuadrícula para la pestaña nueva. Se agregó `DEMO_BUYER_PRODUCT_FAVORITES` en `demo-mode.ts` para poder probar la pestaña sin base real. El link "Tiendas favoritas" de `/mas` se generalizó a "Favoritos".

### El sidebar de escritorio se ocultaba por completo al colapsarlo, en vez de dejar solo los íconos

El usuario pidió que la flecha de colapsar el menú lateral (`DesktopShell.tsx`) deje una franja de solo íconos en vez de esconder todo el sidebar.

- `DesktopSidebar.tsx` pasó de una prop `hidden` (que aplicaba `translate-x-full`) a `collapsed` (que anima el `width` entre `w-64` y `w-20`). Colapsado, cada elemento oculta su texto y centra el ícono con un `title` para tooltip: logo reducido, ítems de navegación, carrito (con el contador reposicionado como insignia sobre el ícono), tarjeta de usuario (solo avatar), y el selector "Mi cuenta/Mi tienda" del vendedor (que en expandido es un componente de 2 columnas) se reemplazó, solo en este modo, por dos íconos apilados con el mismo resaltado de activo.
- Verificado con Playwright en los tres roles del modo demo (invitado, comprador, vendedor): colapsa y expande sin overflow, y el selector de cuenta/tienda del vendedor se ve y funciona bien en la franja angosta.

**Publicación:** 6 commits — `5d752d5` (aprovecha el ancho en escritorio en /mas y checkout), `6a09bf8` (página de categorías con productos), `1123516` (quita menciones de "negocios verificados"), `ee45703` (filtro de categoría sin tener que bajar), `a35bd59` (pestaña de productos favoritos), `6448c1b` (sidebar colapsa a solo íconos). `tsc --noEmit`, `npm run lint` y verificación visual con Playwright en modo demo (instalado y desinstalado como dependencia temporal en cada verificación, sin dejar rastro en `package.json`/`package-lock.json`) antes de cada subida.

---
