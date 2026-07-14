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
