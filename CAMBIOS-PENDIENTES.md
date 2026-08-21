# Cambios Pendientes — Mochi Postres Japoneses

---

## 🔴 PRIORIDAD ALTA (Equipo aprobó)

### 1. Cup Builder / Personalizador de Postre
**Fuente:** mochiArtesanal
- Constructor interactivo de 3 pasos
- Paso 1: Seleccionar base (Mochi, Mini Mochi, Set 3 piezas)
- Paso 2: Elegir sabor (Matcha, Fresa, Chocolate, etc.)
- Paso 3: Toppings extra (Salsa chocolate, Crema batida, Frutas)
- Preview visual en tiempo real del postre armado
- Cálculo dinámico de precio y calorías
- Botón "Agregar al carrito" con el postre personalizado

### 2. Testimonios con Carrusel
**Fuente:** Actúa-Como-Un + mochiArtesanal
- Estructura por testimonio:
  - Estrellas (1-5) en color dorado
  - Texto del testimonio
  - Foto pequeña del cliente (circular)
  - Nombre del cliente
  - Postre al que se refiere la reseña
- Carrusel auto-avance cada 5s
- Navegación con dots + flechas izquierda/derecha
- Pausa al hacer hover

### 3. FAQ Acordeón
**Fuente:** mochiArtesanal + Actúa
- Preguntas frecuentes expandibles
- Animación suave de apertura/cierre (max-height transition)
- Icono + que rota al expandir
- Preguntas sugeridas:
  - ¿Cuánto tarda el envío?
  - ¿Tienen opciones veganas/sin gluten?
  - ¿Cómo conservo los postres?
  - ¿Hacen envíos nacionales?
  - ¿Puedo hacer pedidos para eventos?

### 4. Zonas de Delivery
**Fuente:** Actúa-Como-Un
- Tarjetas por zona de cobertura:
  - **Zona 1 — La Dorada:** Envío gratis pedidos +$50.000, Tiempo: 30-45 min
  - **Zona 2 — Municipios cercanos:** Costo $5.000, Tiempo: 45-60 min (Victoria, Honda, Marquetalia, Puerto Boyacá)
  - **Zona 3 — Nacional:** Costo variable, Tiempo: 1-3 días hábiles
- Iconos de ubicación por zona
- Badges de estado (Disponible / Próximamente)

### 5. Sección "Lo más pedidos de Mochi"
**Fuente:** mochi (solo mochi)
- Sección exclusiva con los productos más populares
- Grid de 3-4 productos top
- Badge "Más pedido" o "Favorito"
- Rating con estrellas
- Botón de agregar al carrito rápido

---

## 🟡 PRIORIDAD MEDIA (Aprobado por equipo)

### 6. Eliminar Categorías → Reemplazar por "Por qué sabe diferente"
**Fuente:** mochiArtesanal
- **ELIMINAR** la sección de categorías actual del home
- **REEMPLAZAR** por 4 pilares de calidad:
  - 🥛 Leche de Pasto
  - 🍡 Ingredientes Artesanales
  - 🌿 Opciones Inclusivas (vegano/sin gluten)
  - ⏰ Producción Diaria
- Grid de 4 columnas con ícono + título + descripción corta

### 7. Paleta de Colores Actualizada (Vino predominante)
**Fuente:** mochiArtesanal + Actúa mochi-japanese
- Cambiar color primario de `#FF758F` a `#D95578` (rosa más profundo)
- Cambiar color secundario de `#4A3F35` a `#590E2A` (vino/borgoña)
- **El vino `#590E2A` debe ser más predominante:**
  - Navbar: fondo vino con texto claro
  - Hero: fondo vino con patrones/olos
  - Footer: fondo vino
  - Secciones oscuras: fondo vino
- Mantener fondo crema `#FDF5F0` para secciones claras
- Actualizar todos los componentes

### 8. Navbar Transparente → Solido al Scroll
**Fuente:** Actúa-Como-Un (mochi-japanese)
- Al abrir la web: navbar transparente, se integra con el hero
- Al scrollear: aparece división, navbar se vuelve sólido (backdrop-blur)
- Efecto de transición suave
- Logo y links siempre visibles

### 9. Hero con Patrones y Formas
**Fuente:** Actúa-Como-Un (mochi-japanese)
- El hero NO es solo color de fondo
- Agregar formas decorativas:
  - Olas SVG en la parte inferior
  - Círculos flotantes tipo sakura
  - Patrones de puntos sutiles
- Colores: vino + rosa + crema
- Formas con opacidad baja para no distraer

### 10. Navbar — Línea al hover en rutas
**Fuente:** Actúa-Como-Un (mochi-japanese)
- Al pasar mouse sobre cada ruta del nav
- Aparece una línea debajo del texto
- Color de acento (rosa o vino)
- Transición suave de aparición

### 11. Catálogo — Buscador + Ordenar por
**Fuente:** mochiArtesanal
- Barra de búsqueda por nombre de producto
- Filtro "Ordenar por":
  - Menor precio
  - Mayor precio
  - Mejor valorados
  - Más comprados
- Grid responsivo de productos

### 12. Página Nosotros / Historia
**Fuente:** mochiArtesanal
- Diseño tipo editorial/revista
- Layout split 2 columnas (texto + imagen)
- Sección de filosofía con tarjetas (Misión, Visión, Valores)
- Estadísticas de la marca (años, clientes, sabores)
- Estilo premium con tipografía serif

### 13. Formulario de Contacto Mejorado
**Fuente:** mochiArtesanal + Actúa
- Labels con opciones de tipo de consulta:
  - 🗣️ Hablar con asesor
  - 📦 Cotizar pedido nacional
  - 🎉 Pedido para evento nacional
  - 💍 Pedido para evento especial
  - 💡 Sugerencia de sabores
  - 📝 Otro
- Campos: nombre, email, teléfono, mensaje
- Select con las opciones de consulta
- Botón de enviar con estado de carga
- Mensaje de éxito al enviar

### 14. Footer Rediseñado
**Fuente:** mochiArtesanal
- Grid de 4 columnas:
  - **Columna 1:** Logo + descripción + newsletter (email input + botón)
  - **Columna 2:** Menú (links rápidos)
  - **Columna 3:** Empresa (Sobre nosotros, Blog, Franquicias)
  - **Columna 4:** Soporte (Contacto, FAQ, Privacidad)
- Iconos de redes sociales (Instagram, WhatsApp, Facebook)
- Links de Legal (Privacidad, Términos, Nutrición)
- Copyright 2026

### 15. Checkout Rediseñado
**Fuente:** mochi (solo mochi)
- **Paso 1: Método de entrega**
  - Opción: Domicilio (con dirección)
  - Opción: Retiro en local (con selección de sucursal)
- **Paso 2: Datos del destinatario**
  - Se obtienen automáticamente de la sesión
  - Nombre, email, teléfono, dirección
  - Editar si es necesario
- **Paso 3: Método de pago**
  - Tarjeta de crédito/débito
  - PSE
  - Nequi / Daviplata
  - Contra entrega
- **Panel lateral:** Resumen del pedido
  - Lista de productos con imagen, nombre, cantidad, precio
  - Subtotal, envío, descuento, total
  - Botón "Finalizar compra"

### 16. Ticket / Resumen post-compra
**Fuente:** mochi (solo mochi)
- Al finalizar compra, mostrar:
  - Número de pedido
  - Fecha y hora
  - Lista de productos
  - Total pagado
  - Método de pago
  - Dirección de entrega
  - Tiempo estimado
  - Botón "Descargar ticket" (PDF o imagen)
  - Botón "Seguir comprando"

---

## 🟢 PRIORIDAD BAJA (Opcionales)

### 17. Sección "Proceso cuidado"
**Fuente:** mochiArtesanal
- 3 pasos del proceso artesanal:
  1. Selecciona tu postre
  2. Lo preparamos artesanalmente
  3. Disfruta en minutos
- Diseño: íconos circulares con línea conectora

### 18. Métricas / Banner de estadísticas
**Fuente:** mochiArtesanal + Actúa
- Banner oscuro (fondo vino) con:
  - +500 postres vendidos
  - 15 sabores disponibles
  - 100% Ingredientes naturales
  - 4.8 ⭐ Calificación promedio

### 19. Galería de imágenes
**Fuente:** Actúa-Como-Un
- Grid asimétrico de imágenes
- Hover zoom en cada imagen
- Filtros por categoría (Helados, Decoración, Tienda)

### 20. Beneficios
**Fuente:** Actúa-Como-Un
- Grid de 5-6 columnas
- Ícono + título por beneficio
- Ejemplos: Envío gratis, Pago seguro, Ingredientes naturales, etc.

---

## 🎨 ANIMACIONES Y EFECTOS (Actúa-Como-Un)

### 21. Animaciones al Scroll (Scroll Reveal)
**Fuente:** Actúa-Como-Un (mochi-japanese)
- Elementos aparecen al hacer scroll
- Efecto fade-up (desplazamiento hacia arriba + opacidad)
- Delay escalonado para grupos de elementos
- Usar IntersectionObserver
- Clases: `reveal`, `reveal-delay-1`, `reveal-delay-2`, `reveal-delay-3`

### 22. Línea al hover en rutas del Navbar
**Fuente:** Actúa-Como-Un
- Al pasar mouse sobre cada link del nav
- Aparece una línea debajo (underline)
- Color de acento
- Transición suave

---

## 🔔 TOAST MEJORADOS

### 23. Toast con iconos, colores y barra de tiempo
**Fuente:** mochiArtesanal
- **Tipos de toast:**
  - ✅ Éxito: fondo rosa claro, icono check
  - ❌ Error: fondo rojo claro, icono X
  - ℹ️ Info: fondo vino claro, icono i
- **Barra de progreso:**
  - Línea horizontal que se reduce mostrando el tiempo restante
  - Duración total: 3.5 segundos
  - Color de barra matching el tipo de toast
- **Posición:** Esquina inferior derecha
- **Animación:** Slide-in desde la derecha

---

## 📁 Archivos a Modificar/Crear

### Modificar:
| Archivo | Cambios |
|---------|---------|
| `src/styles.css` | Nueva paleta (vino + rosa), variables CSS globales |
| `src/app/components/navbar/navbar.ts` | Transparente → sólido, línea hover, colores |
| `src/app/pages/home/home.ts` | Eliminar categorías, agregar: Lo más pedidos, Por qué sabe diferente, Testimonios, FAQ, Zonas Delivery |
| `src/app/pages/catalog/catalog.ts` | Buscador + ordenar por |
| `src/app/pages/about/about.ts` | Rediseño estilo mochiArtesanal |
| `src/app/pages/contact/contact.ts` | Formulario con tipo de consulta |
| `src/app/components/cart-drawer/cart-drawer.ts` | Colores actualizados |
| `src/app/components/toast/toast.ts` | Iconos, colores, barra de tiempo |
| `src/app/pages/checkout/checkout.ts` | Rediseño: domicilio/retiro, datos auto, resumen lateral |
| `src/app/components/footer/footer.ts` | Rediseño 4 columnas, newsletter, redes |
| `src/styles.css` | Animaciones scroll reveal |

### Crear (NUEVOS):
| Archivo | Componente |
|---------|------------|
| `src/app/components/cup-builder/cup-builder.ts` | Constructor interactivo |
| `src/app/components/testimonials/testimonials.ts` | Carrusel de testimonios |
| `src/app/components/faq-accordion/faq-accordion.ts` | Acordeón FAQ |
| `src/app/components/delivery-zones/delivery-zones.ts` | Zonas de envío |
| `src/app/components/order-summary/order-summary.ts` | Ticket post-compra |
| `src/app/pages/checkout/checkout.ts` | Checkout rediseñado |
| `src/app/pages/order-confirmation/order-confirmation.ts` | Página de confirmación |

---

## 📋 Resumen por Fuente

| Fuente | Cambios a adoptar |
|--------|-------------------|
| **mochiArtesanal** | Paleta vino, Cup Builder, "Por qué sabe diferente", Nosotros, Footer, Catálogo buscador+ordenar, Testimonios estructura, FAQ, Métricas, Proceso |
| **Actúa-Como-Un** | Navbar transparente, Hero con patrones, Línea hover nav, Scroll animations, Zonas delivery, Testimonios carrusel, Galería, Beneficios |
| **mochi (solo mochi)** | Lo más pedidos, Checkout (domicilio/retiro, datos auto, pago, resumen), Ticket post-compra |
| **mochi-japanese** | Paleta vino predominante, Hero con olas/círculos, Navbar vino |
