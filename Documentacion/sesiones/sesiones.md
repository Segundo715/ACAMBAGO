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
