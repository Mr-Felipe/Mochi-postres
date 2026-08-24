# GUIÓN — Video: Mochi. Postres Japoneses

## ESTRUCTURA DEL VIDEO (~8-10 min)

---

### [0:00 - 0:45] INTRODUCCIÓN

**Pantalla:** Logo de Mochi + homepage completa

> "Hola, este es el proyecto **Mochi. Postres Japoneses**, una plataforma web completa para la gestión y venta de postres artesanales japoneses. Desarrollada con **Angular 21**, **Supabase** como backend, y desplegada con SSR. Permite a los clientes comprar online, a los empleados gestionar pedidos y punto de venta, y al administrador controlar todo el negocio desde un solo panel."

---

### [0:45 - 2:00] STACK TECNOLÓGICO

**Pantalla:** Diagrama del stack

> "**Frontend:** Angular 21 con TypeScript, Tailwind CSS 4, rendering SSR con Angular Universal.
> **Backend:** Supabase — base de datos PostgreSQL, autenticación con JWT, almacenamiento de imágenes, y Realtime para sincronización en vivo.
> **Hosting:** Node.js con Express para el servidor SSR."

**Mostrar:** `package.json` brevemente, luego Supabase dashboard

> "La app usa **signals** de Angular para estado reactivo, **lazy loading** en todas las rutas para optimizar carga, y **guards** de autenticación para proteger las rutas según el rol del usuario."

---

### [2:00 - 3:00] ARQUITECTURA Y RUTAS

**Pantalla:** Diagrama de arquitectura o `app.routes.ts`

> "El proyecto tiene **tres niveles de acceso**:"

1. **Rutas Públicas** — `/`, `/productos`, `/carrito`, `/login`, `/registro`, `/blog`, `/contacto`
   > "Cualquier visitante puede navegar el catálogo, agregar al carrito y ver el blog."

2. **Rutas de Cliente** — `/checkout`, `/pedidos`, `/cliente/dashboard`
   > "Requieren autenticación. El cliente puede comprar, ver su historial y gestionar su perfil."

3. **Dashboard Admin/Empleado** — `/admin/*`, `/empleado/*`
   > "Usan un **layout con sidebar** separado. El admin tiene acceso total: dashboard, productos, pedidos, ventas, usuarios. El empleado tiene punto de venta y gestión de pedidos online."

**Mostrar:** Navegar por las rutas, mostrar el sidebar colapsable

> "El sidebar es **colapsable en desktop** — pasa de mostrar iconos con texto a solo iconos con tooltips. En mobile se oculta con menú hamburguesa."

---

### [3:00 - 4:00] BASE DE DATOS (Supabase)

**Pantalla:** Supabase dashboard mostrando tablas

> "La base de datos tiene **12 tablas** principales:"

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios con roles (admin, empleado, cliente) |
| `categorias` | Categorías de productos |
| `productos` | Catálogo con stock, precios, imágenes |
| `direcciones` | Direcciones de envío por usuario |
| `pedidos` | Pedidos online con estado y跟踪 |
| `detalle_pedido` | Items de cada pedido (online + POS) |
| `pagos` | Registros de pago |
| `favoritos` | Productos favoritos por usuario |
| `resenas` | Reseñas y calificaciones |
| `blog` | Artículos del blog |
| `cupones_descuento` | Cupones activos |
| `carrito_compras` | Carrito persistente |

> "Las tablas tienen **RLS habilitado** — Row Level Security de Supabase — para que cada usuario solo vea y modifique sus propios datos. Los admin y empleados tienen permisos ampliados para gestionar pedidos y usuarios."

**Mostrar:** Política RLS de `pedidos` (admin/empleado pueden UPDATE)

---

### [4:00 - 5:00] SISTEMA DE ROLES Y AUTENTICACIÓN

**Pantalla:** Login → diferentes paneles según rol

> "Hay **tres roles**:"

1. **Admin** (`admin@mochishop.co`)
   > "Control total. Dashboard con métricas, gestión de productos (CRUD + subida de imágenes a Supabase Storage), pedidos en tiempo real, historial de ventas, gestión de usuarios con edición de roles y direcciones."

2. **Empleado** (`neider@mochishop.co`)
   > "Punto de venta presencial (POS) y gestión de pedidos online. Puede avanzar el estado de los pedidos: Pendiente → En Cocina → En Camino → Entregado."

3. **Cliente** (`cliente@ejemplo.com`)
   > "Navega el catálogo, agrega al carrito, compra con diferentes métodos de pago, ve su historial de pedidos y gestiona favoritos."

**Mostrar:** Login con cada credencial, mostrar las diferencias

> "Los guards verifican el rol en cada ruta. Si un cliente intenta acceder a `/admin`, es redirigido. La sesión se mantiene con JWT de Supabase."

---

### [5:00 - 6:00] FUNCIONALIDADES CLAVE DEL CLIENTE

**Pantalla:** Flujo de compra completo

> "El cliente puede:"

1. **Explorar el catálogo** — Filtrado por categoría, búsqueda, productos destacados
   > "Cada producto tiene nombre en japonés y español, ingredientes, precio, y imágenes."

2. **Agregar al carrito** — Funciona **sin login**, se guarda en localStorage
   > "Al iniciar sesión, el carrito se sincroniza con Supabase."

3. **Favoritos** — Se sincronizan con la base de datos al autenticarse

4. **Checkout** — Selección de dirección, método de pago (PSE, Nequi, Daviplata, tarjeta, contraentrega)
   > "Se valida el stock antes de crear el pedido con una función RPC de Supabase."

5. **Seguimiento** — El cliente ve el estado de su pedido en tiempo real

**Mostrar:** Flujo completo: producto → carrito → checkout → pedido creado

---

### [6:00 - 7:00] PANEL ADMIN — GESTIÓN

**Pantalla:** Dashboard admin con tabs

> "El admin tiene un **panel de control completo** con 6 secciones:"

1. **Dashboard** — Métricas de ventas online y POS, pedidos recientes
2. **Productos** — CRUD completo, subida de imágenes a Supabase Storage, control de stock (mínimo/máximo)
3. **Pedidos** — Vista de tarjetas con filtros por estado, botones para avanzar estado, real-time
4. **Ventas** — Historial unificado de ventas online y POS, top productos, métricas de ingresos
5. **Usuarios** — Edición de roles, visualización de direcciones
6. **Configuración Visual** — Editor de textos del hero, banner, WhatsApp

**Mostrar:** Navegar por cada tab, mostrar edición de producto, cambio de estado de pedido

---

### [7:00 - 7:45] EMPLEADO — PUNTO DE VENTA Y PEDIDOS

**Pantalla:** POS y pedidos del empleado

> "El empleado tiene dos módulos:"

1. **Punto de Venta (POS)** — Venta presencial
   > "Selecciona productos, cantidades, método de pago (efectivo, tarjeta, Nequi, Daviplata). La venta se registra directamente en Supabase con estado 'entregado'."

2. **Pedidos Online** — Gestión de pedidos recibidos
   > "Misma vista que el admin: tarjetas con filtros, botones para avanzar estado. Los cambios se reflejan **en tiempo real** gracias a Supabase Realtime."

**Mostrar:** Hacer una venta POS, luego cambiar estado de un pedido online

> "Cuando el empleado cambia un estado, el admin lo ve al instante — no hay que recargar la página."

---

### [7:45 - 8:30] TIEMPO REAL Y NOTIFICACIONES

**Pantalla:** Dos ventanas — admin y empleado — haciendo cambios simultáneos

> "La sincronización en tiempo real usa **Supabase Realtime**:"

1. **Canal de PostgreSQL** — Escucha eventos INSERT y UPDATE en la tabla `pedidos`
2. **Polling de respaldo** — Cada 30 segundos recarga los pedidos por si Realtime falla
3. **Toasts** — Notificaciones emergentes cuando cambia un estado
4. **Campana de notificaciones** — Badge con contador de no leídas, dropdown con historial
5. **Click en notificación** — Hace scroll y resalta el pedido correspondiente

**Mostrar:** Cambiar estado en una ventana, ver la notificación en la otra

> "Todo funciona sin recargar. Los signals de Angular actualizan la UI inmediatamente."

---

### [8:30 - 9:00] DETALLES TÉCNICOS

**Pantalla:** Código relevante

> "Algunos detalles técnicos importantes:"

- **SSR con hidratación** — Las páginas públicas se pre-renderizan en el servidor para SEO. Las rutas de dashboard usan `RenderMode.Client` para evitar problemas de hidratación.
- **Bundle ~605 KB** — Optimizado con lazy loading por ruta.
- **Sidebar colapsable** — Estado persistente via `SidebarStateService` (service singleton), funciona con `input()` signals.
- **Carrito persistente** — localStorage + sincronización con Supabase al login.
- **Imágenes** — Subidas a Supabase Storage bucket `product-images`, URLs públicas.
- **Fuentes** — Cormorant Garamond (serif) + Inter (sans-serif).
- **Paleta** — Vino (#590E2A, #D95578, #3A0A1C, #FDF8F4).

---

### [9:00 - 9:30] CIERRE

**Pantalla:** Vista completa de la app

> "En resumen, **Mochi.** es una plataforma full-stack que demuestra: arquitectura limpia con Angular 21, autenticación y bases de datos con Supabase, tiempo real para gestión de pedidos, diseño responsive con Tailwind CSS, y un sistema de roles completo para administrar un negocio de postres artesanales."

> "Gracias por ver."

---

## NOTAS PARA GRABACIÓN

- **Resolución:** 1920x1080
- **Navegador:** Chrome en modo escritorio (1280px mínimo para desktop)
- **Credenciales:** Tener login listo con las 3 cuentas
- **Datos:** Asegurar que haya al menos 1-2 pedidos en la BD para mostrar
- **Split screen:** Para demostrar real-time, usar 2 ventanas del navegador
- **Zoom:** Hacer zoom en detalles importantes (cards, badges, botones)
