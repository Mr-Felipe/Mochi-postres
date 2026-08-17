# 🍡 Mochi. Boutique Artesanal — Guía Contextual de Diseño & Arquitectura

Este documento sirve como manual de referencia y reglas obligatorias para cualquier Agente de IA o desarrollador que trabaje, mantenga o expanda el proyecto **Mochi. — Postres Japoneses Artesanales (La Dorada, Caldas)**.

---

## 1. 📂 Estructura General del Proyecto

La aplicación está desarrollada en **Angular (v21+ Zoneless con Signals y Control Flow Nativo)** y estilizada con **Tailwind CSS**.

```text
/
├── desing.md                       # Manual de diseño y guía contextual para IAs
├── tailwind.config.js              # Configuración formal de tokens y paleta de diseño
├── package.json                    # Dependencias del proyecto
├── src/
│   ├── index.html                  # Shell HTML con Google Fonts (Playfair Display, Plus Jakarta Sans)
│   ├── styles.css                  # Directivas de Tailwind CSS, variables base y animaciones
│   ├── server.ts                   # Servidor Express SSR / Endpoints API
│   └── app/
│       ├── models/
│       │   └── mochi.models.ts     # Interfaces TypeScript (Producto, Pedido, Carrito, Usuario, Categoría)
│       ├── services/
│       │   ├── cart.service.ts     # Estado reactivo del carrito de compras (Signals)
│       │   ├── mochi-data.service.ts # Catálogo, inventario y mutaciones de productos
│       │   ├── payment.service.ts  # Lógica de pasarela de pago (PSE, Nequi, Tarjetas, Contraentrega)
│       │   └── supabase.service.ts # Conexión a base de datos Supabase / RLS
│       ├── components/
│       │   ├── navbar/             # Barra de navegación con logo, links y badge de carrito
│       │   ├── footer/             # Pie de página artesanal y enlaces de contacto
│       │   └── cart-drawer/        # Drawer lateral deslizable para el carrito de compras
│       └── pages/
│           ├── home/               # Portada, Hero, Carrusel de Destacados, Historia y CTA
│           ├── catalog/            # Catálogo con filtros por categoría, búsqueda y orden
│           ├── product-detail/     # Ficha de producto, selector de cantidad y productos relacionados
│           ├── cart/               # Vista de carrito completa con cálculo de envío a La Dorada
│           ├── simulator/          # Cotizador interactivo en tiempo real
│           ├── checkout/           # Checkout integrado con pasarela de pago y confirmación
│           ├── orders/             # Rastreador de pedidos por ID con estado en vivo
│           ├── about/              # Historia de la marca y proceso artesanal japonés
│           ├── contact/            # Formulario de contacto, WhatsApp y mapa de ubicación
│           ├── blog/               # Artículos culturales sobre gastronomía japonesa
│           ├── customer/           # Portal del cliente (historial de compras, direcciones)
│           ├── admin/              # Panel de administración (inventario, pedidos, reportes)
│           ├── pos-employee/       # Terminal Punto de Venta (POS) para dependientes
│           └── auth/
│               ├── login/          # Inicio de sesión con cuentas demo rápidas
│               └── register/       # Registro de nuevos clientes
```

---

## 2. 🎨 Paleta de Colores Oficial (Artistic Japanese Flair)

La identidad visual combina la serenidad de una pastelería tradicional de Kioto con la calidez y dinamismo de tonos pasteles potentes de alta saturación.

| Token | Hex | Uso y Significado |
| :--- | :--- | :--- |
| **`bg-canvas` / `canvas`** | `#F4EFE6` | Fondo general de la página (beige cálido, no blanco puro ni pálido). |
| **`canvas-card`** | `#FFFFFF` | Fondo blanco limpio de tarjetas, modales y paneles principales. |
| **`canvas-faint`** | `#F4EFE6` / `#ECE4D8` | Fondo de inputs, listados secundarios y chips. |
| **`primary`** | `#382A20` | Títulos principales, textos de alto contraste y botones oscuros primarios. |
| **`primary-hover`** | `#1F1611` | Estado hover en botones oscuros. |
| **`accent` / `mochi-pink`** | `#FF758F` | **Color de acento estrella**: Botones de compra CTA, badges destacados, links activos y precios. |
| **`accent-hover`** | `#FF5277` | Estado hover de botones de compra destacados. |
| **`accent-light`** | `#FFA0B4` | Fondos de selección activos con transparencia, bordes de acento. |
| **`accent-subtle`** | `#FFE4E6` | Píldoras de aviso, banners de descuento, selecciones suaves. |
| **`border` / `border-soft`** | `#DECFC0` | Bordes estándar en tarjetas, inputs y divisores. |
| **`matcha`** | `#80CBC4` / `#065F46` | Toques botánicos / Envíos gratis y confirmaciones exitosas (`#D1FAE5`). |

---

## 3. ✍️ Tipografía & Jerarquía

1. **Titulares, Logotipo y Precios (`font-serif`):**
   - Fuente: `'Playfair Display', Georgia, serif`
   - Clases habituales: `font-serif italic font-bold text-[#382A20]`
   - Estilo: Refinado, con cursiva ligera (*italic*) para evocar caligrafía y pastelería de autor.

2. **Cuerpo de Texto y Formularios (`font-sans`):**
   - Fuente: `'Plus Jakarta Sans', system-ui, sans-serif`
   - Clases habituales: `text-[#382A20] font-medium text-xs sm:text-sm leading-relaxed`

3. **Monospace para Datos Técnicos / Códigos (`font-mono`):**
   - Clases: `font-mono text-xs font-bold text-[#382A20]`

---

## 4. 🧩 Clases Base de Tailwind para Componentes

### 🔘 A. Botones Principales

* **Botón de Acción Primaria / Compra (Rosa Vibrante):**
  ```html
  <button class="w-full py-4 px-6 rounded-full bg-[#FF758F] hover:bg-[#FF5277] active:scale-95 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer">
    <span>Comprar Ahora</span>
  </button>
  ```

* **Botón Secundario / Oscuro Espresso:**
  ```html
  <button class="py-3.5 px-6 rounded-full bg-[#382A20] hover:bg-[#1F1611] active:scale-95 text-[#F4EFE6] font-bold text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer">
    <span>Ver Catálogo</span>
  </button>
  ```

* **Botón Neutro / Píldora de Selección:**
  ```html
  <button class="px-4 py-2 rounded-full border border-[#DECFC0] bg-[#F4EFE6] hover:border-[#FF758F] text-[#382A20] text-xs font-bold transition-all cursor-pointer">
    <span>Filtrar</span>
  </button>
  ```

---

### 📦 B. Tarjetas de Contenido (Cards)

* **Tarjeta de Producto o Sección:**
  ```html
  <div class="bg-white rounded-[32px] sm:rounded-[40px] border border-[#DECFC0] p-6 sm:p-8 shadow-xs space-y-4 transition-all">
    <!-- Contenido -->
  </div>
  ```

* **Contenedor Interno / Ítem de Lista Secundaria:**
  ```html
  <div class="p-4 rounded-[24px] bg-[#F4EFE6] border border-[#DECFC0] text-xs space-y-2">
    <!-- Contenido secundario -->
  </div>
  ```

---

### 🏷️ C. Badges & Píldoras Informativas

* **Badge Rosa de Acento:**
  ```html
  <span class="px-3 py-1 rounded-full bg-[#FF758F] text-white text-[10px] font-bold font-serif uppercase tracking-widest shadow-xs">
    Nuevo Sabor
  </span>
  ```

* **Badge Verde de Éxito / Envío Gratis:**
  ```html
  <span class="px-3 py-1 rounded-full bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-bold uppercase tracking-wider">
    Envío Gratis
  </span>
  ```

---

### 📝 D. Campos de Formulario (Inputs, Selects, Textareas)

* **Input de Texto Píldora:**
  ```html
  <input 
    type="text" 
    placeholder="Ej. Juan Pérez" 
    class="w-full px-4 py-3 rounded-full bg-[#F4EFE6] border border-[#DECFC0] text-[#382A20] text-xs font-medium focus:outline-none focus:border-[#FF758F] transition-colors" 
  />
  ```

* **Textarea:**
  ```html
  <textarea 
    rows="3"
    placeholder="Instrucciones especiales..." 
    class="w-full p-3.5 rounded-[20px] bg-[#F4EFE6] border border-[#DECFC0] text-[#382A20] text-xs font-medium focus:outline-none focus:border-[#FF758F] transition-colors">
  </textarea>
  ```

---

## 5. 📐 Reglas de Diseño y Layout

1. **Contenedor Principal:** Todos los layouts deben estar contenidos dentro de `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
2. **Radio de Bordes Generoso:** Mantener curvas suaves y orgánicas:
   - Contenedores grandes: `rounded-[32px]` o `rounded-[40px]`.
   - Elementos medianos: `rounded-[20px]` o `rounded-[24px]`.
   - Botones e inputs: `rounded-full`.
3. **Micro-interacciones:** Los botones interactivos deben contar con `hover:scale-[1.02]` o `active:scale-95` y `transition-all`.
4. **Legibilidad Obligatoria:** Nunca colocar texto gris claro sobre fondos beige o rosados. Siempre usar `#382A20` con al menos 80% de opacidad para garantizar alto contraste WCAG AA.
5. **No Clichés de IA:** No utilizar gradientes azules-púrpura genéricos, ni sombras gigantes difusas, ni tarjetas con esquinas puntiagudas estándar sin padding suficiente.

---

## 6. ⚡ Pautas para Angular v21+

- Utilizar **Signals** (`signal()`, `computed()`, `input()`, `output()`) para toda gestión de estado.
- Usar el flujo de control nativo `@if`, `@else`, `@for (item of items(); track item.id)`.
- Todos los componentes son **Standalone** por defecto con `changeDetection: ChangeDetectionStrategy.OnPush`.
- Enrutamiento mediante `RouterLink` y servicios inyectados con `inject()`.
