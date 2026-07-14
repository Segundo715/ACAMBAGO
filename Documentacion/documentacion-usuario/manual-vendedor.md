# Manual de Uso — Panel de Vendedor (AcambaGo / Acom-Di)

> **Versión:** 2026-07-14
> **Dirigido a:** Dueños de negocio que quieren vender en Acom-Di
> **Lenguaje:** Sin tecnicismos, paso a paso

---

## 1. ¿Qué puedes hacer desde tu panel?

Al registrar tu tienda en Acom-Di, tienes un panel propio en `/dashboard/business` donde puedes:

- Registrar y editar los datos de tu negocio.
- Subir productos con varias fotos cada uno.
- Crear cupones de descuento con código QR y escanearlos cuando un cliente los presente.
- Ver y dar seguimiento a tus pedidos, con aviso sonoro en cuanto entra uno nuevo.
- Configurar tu cuenta bancaria para recibir transferencias reales.
- Compartir tu ubicación exacta con un solo botón.
- Revisar tus reseñas y tus estadísticas.

---

## 2. Registrar tu negocio

1. Crea tu cuenta en Acom-Di eligiendo la opción **"Tengo una Tienda"** en el registro.
2. Al entrar por primera vez a tu panel, verás el formulario de **"Registrar negocio"** en la sección de Configuración (`/dashboard/business/settings`).
3. Llena:
   - **Nombre del negocio** (obligatorio).
   - **Descripción** (para que los clientes sepan qué ofreces).
   - **Categoría** (obligatorio; elige la que más se parezca a tu giro, por ejemplo Ferretería, Tienda de ropa, Farmacia, etc. Acom-Di no incluye categoría de comida ni restaurantes).
   - **Dirección** (obligatorio).
   - **WhatsApp** (sin el 52 del país, solo tu número a 10 dígitos).
   - **Foto del negocio** (opcional, pero ayuda a que tu tienda se vea más profesional).
4. Presiona **"Registrar negocio"**.

### ¿Qué pasa después de registrar tu negocio?

Tu negocio queda **pendiente de aprobación**. Mientras un administrador de Acom-Di no lo revise y lo apruebe:

- Verás un aviso: *"Tu negocio está pendiente de aprobación. Un administrador está revisando la información de tu negocio."*
- **No podrás usar el resto del panel** (productos, pedidos, cupones, reseñas, analíticas) hasta que te aprueben.
- La **única sección que sí puedes usar mientras esperas es Configuración**, para poder revisar o corregir los datos de tu negocio si algo quedó mal.
- En cuanto un administrador apruebe tu negocio, todo el panel se desbloquea automáticamente, sin que tengas que hacer nada más.

---

## 3. Agregar productos con fotos

Ve a **Productos** en el menú del panel.

1. Presiona **"Agregar producto"**.
2. Sube **hasta 6 fotos** de tu producto. La primera foto que subas queda marcada como **"Portada"**: es la que se ve primero en las tarjetas y en el listado de tu tienda.
3. Puedes quitar cualquier foto antes de guardar con el botón de la equis en la esquina.
4. Llena:
   - **Nombre del producto** (obligatorio).
   - **Descripción** (opcional, breve).
   - **Precio en pesos mexicanos** (obligatorio).
5. Presiona **Guardar**.

Formatos aceptados: JPG y PNG, hasta 5 MB por foto.

Para **editar** un producto ya existente, presiona **Editar** en su tarjeta; para **eliminarlo**, presiona **Eliminar** (te pedirá confirmación).

Si tu tienda tiene más de una foto por producto, en tu perfil público los clientes verán un pequeño carrusel que avanza solo cada pocos segundos, con flechas para moverse manualmente.

---

## 4. Cupones de descuento con código QR

### Crear un cupón
1. Ve a **Cupones → Crear cupón**.
2. Define el título, si el descuento es un porcentaje o un monto fijo, el valor, si tiene fecha de vencimiento y si quieres poner un límite de usos.
3. Al guardarlo, Acom-Di genera automáticamente un **código único** (con el formato `ACAM-XXXXXX`) y un **código QR** que el cliente puede mostrar en tu tienda.

### Escanear un cupón de un cliente
1. Ve a **Cupones → Escanear cupón**.
2. Presiona **"Iniciar cámara"** y apunta al código QR que te muestre el cliente en su celular.
3. El sistema valida automáticamente:
   - Que el cupón sea de **tu** negocio (no puedes canjear cupones de otras tiendas).
   - Que el código exista y esté activo.
   - Que no haya vencido.
   - Que no se haya alcanzado el límite de usos.
   - Que ese mismo cliente no lo haya usado antes.
4. Si todo es válido, verás una pantalla verde con el detalle del descuento; si algo falla, verás el motivo exacto en una pantalla roja (por ejemplo "Cupón expirado" o "Este usuario ya canjeó este cupón").

---

## 5. Ver y atender tus pedidos

Ve a **Pedidos** en el menú del panel.

### Cuando entra un pedido nuevo
En cuanto un cliente confirma un pedido de tu tienda, tu panel lo detecta **al instante, sin que tengas que recargar la página**: suena un aviso corto (dos tonos) y aparece una notificación arriba de tu lista de pedidos con el nombre del cliente y el total.

### Revisar un pedido
Cada pedido muestra cliente, productos, total y estado (Pendiente, En camino, Entregado o Cancelado). Al abrirlo puedes ver:
- Fecha y hora exacta.
- Dirección de entrega (si el cliente eligió envío a domicilio).
- Lista completa de productos.
- Un botón para **contactar al cliente por WhatsApp** directamente.

### Actualizar el estado
- Si el pedido está **Pendiente**, puedes marcarlo como **"Enviado"** (pasa a En camino).
- Si está **En camino**, puedes marcarlo como **"Entregado"**.

Puedes filtrar por pestañas (Todos, Pendientes, En camino, Entregados, Cancelados) y buscar por nombre de cliente o número de pedido.

> Nota: por ahora el cliente no recibe un aviso automático cuando cambias el estado de su pedido; si quieres avisarle, usa el botón de WhatsApp.

---

## 6. Configurar tu cuenta bancaria (transferencias)

En **Configuración**, en la sección "Datos bancarios (opcional)", puedes llenar:

- **Banco.**
- **Titular de la cuenta.**
- **CLABE interbancaria** (18 dígitos).

Si llenas estos tres datos, tus clientes verán **"Transferencia"** como opción de pago al hacer checkout, con tu cuenta real (banco, titular y CLABE, con un botón para copiarla). Si no los llenas, esa opción de pago simplemente no aparece para tus clientes; no se muestran datos inventados.

---

## 7. Ubicar tu negocio en el mapa

En **Configuración**, en "Ubicación en el mapa":

1. Párate físicamente en tu negocio con tu celular o computadora.
2. Presiona **"Usar mi ubicación actual"**.
3. Tu navegador te pedirá permiso para compartir tu ubicación; acéptalo.
4. Tus coordenadas se guardan automáticamente. Verás un mensaje de confirmación con la ubicación detectada.

Si prefieres escribir las coordenadas a mano, hay una opción "¿Prefieres poner las coordenadas a mano?" que despliega dos campos (latitud y longitud), pero lo normal es usar el botón de ubicación automática.

---

## 8. Reseñas y estadísticas

- **Reseñas:** en la sección Reseñas puedes ver las calificaciones y comentarios que tus clientes han dejado en tu perfil público. Tu calificación promedio se recalcula automáticamente cada vez que entra una reseña nueva.
- **Analíticas:** en la sección Analytics, y también en la pantalla de Inicio del panel, encuentras tus KPIs principales: productos publicados, cupones activos y canjeados, calificación y reseñas totales, además de una gráfica de ingresos de los últimos 7 días y tus pedidos recientes.

---

## 9. Preguntas frecuentes

**¿Por qué no puedo agregar productos apenas me registro?**
Porque tu negocio todavía no ha sido aprobado por un administrador. Mientras esperas, solo puedes usar Configuración.

**¿Cuánto tarda la aprobación?**
Depende de cuándo un administrador de Acom-Di revise tu registro; no hay un tiempo fijo.

**¿Puedo vender sin cuenta bancaria?**
Sí. Sin CLABE registrada, tus clientes solo verán las demás opciones de pago (efectivo, tarjeta simulada, contra entrega).

**¿El pago con tarjeta es real?**
No todavía. Es una simulación a propósito; Acom-Di lo indica claramente al cliente durante el checkout. No se procesa ningún cargo real.

**¿Cuántas fotos puedo subir por producto?**
Hasta 6. La primera que subas es la que se usa como portada en las tarjetas de tu tienda.
