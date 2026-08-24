# Plan de Reestructuración: Sistema de Capas + Ingredientes

## Resumen Ejecutivo

Reestructurar la base de datos y el frontend para soportar:
- **Ingredientes reutilizables** (no más texto plano)
- **Componentes de vaso** (capas con stock y precio propio)
- **Constructor de postres** en el admin (define la composición capa por capa)
- **Vasos personalizados** con precios seguros (calculados desde la BD)
- **Control de stock** a nivel de ingrediente con cascade automático

---

## 1. Modelo de Datos Actual vs Propuesto

### Estado Actual

```
productos
├── id_producto (PK)
├── id_categoria (FK)
├── nombre_japones, nombre_espanol
├── descripcion_corta, descripcion_completa
├── ingredientes TEXT          ← texto plano, no reutilizable
├── precio NUMERIC             ← precio fijo, no calculado
├── precio_oferta NUMERIC
├── imagen_principal
├── galeria_imagenes JSONB
├── stock, stock_minimo, stock_maximo
├── disponible, destacado
├── calificacion, num_resenas
└── created_at, updated_at
```

### Modelo Propuesto

```
ingredientes                    (materia prima reutilizable)
├── id_ingrediente       SERIAL PK
├── nombre               VARCHAR NOT NULL UNIQUE
├── tipo                 ENUM('base','crema','relleno','topping','general')
├── unidad_medida        VARCHAR NOT NULL (ml, g, unidades, porciones)
├── costo_unitario       NUMERIC NOT NULL (costo por 1 unidad de medida)
├── stock_disponible     INTEGER NOT NULL DEFAULT 0
├── stock_minimo         INTEGER NOT NULL DEFAULT 10
├── activo               BOOLEAN NOT NULL DEFAULT true
├── created_at           TIMESTAMPTZ DEFAULT now()
└── updated_at           TIMESTAMPTZ DEFAULT now()

componentes_vaso                (las capas del vaso - opciones disponibles)
├── id_componente        SERIAL PK
├── tipo                 ENUM('base','crema','relleno','topping') NOT NULL
├── nombre               VARCHAR NOT NULL
├── descripcion          TEXT
├── precio_venta         NUMERIC NOT NULL (precio que paga el cliente)
├── costo_produccion     NUMERIC NOT NULL (suma de costos de ingredientes)
├── imagen               VARCHAR (URL foto de la capa)
├── stock_disponible     INTEGER NOT NULL DEFAULT 9999
├── stock_minimo         INTEGER NOT NULL DEFAULT 10
├── activo               BOOLEAN NOT NULL DEFAULT true
├── created_at           TIMESTAMPTZ DEFAULT now()
└── updated_at           TIMESTAMPTZ DEFAULT now()

componente_ingrediente          (qué ingredientes lleva cada capa)
├── id_componente        FK → componentes_vaso (composite PK)
├── id_ingrediente       FK → ingredientes (composite PK)
├── cantidad_necesaria   NUMERIC NOT NULL (cuánto ingrediente usa esta capa)
└── PRIMARY KEY (id_componente, id_ingrediente)

producto_capas                 (cómo se compone cada postre - orden de capas)
├── id_producto          FK → productos (composite PK)
├── posicion             INTEGER NOT NULL CHECK(1-7) (composite PK)
├── id_componente        FK → componentes_vaso NOT NULL
└── PRIMARY KEY (id_producto, posicion)

productos MODIFICADO
├── SE ELIMINA: ingredientes (texto)
├── SE ELIMINA: precio (calculado desde capas)
├── SE ELIMINA: precio_oferta (calculado desde capas)
├── SE AGREGA: precio_calculado NUMERIC (suma de precio_venta de sus capas)
├── SE AGREGA: precio_venta NUMERIC NULL (precio final del admin, NULL = usar calculado)
├── SE AGREGA: margen_ganancia NUMERIC (calculado: precio_venta - precio_calculado)
├── SE MANTIENE: stock (unidades completas del postre)
├── Se mantiene: todo lo demás

detalle_pedido MODIFICADO
├── SE AGREGA: configuracion_capas JSONB NULL
│   Formato: {
│     "base": {"id": 1, "nombre": "Galletas Ducales", "precio": 4000},
│     "crema": {"id": 3, "nombre": "Vainilla", "precio": 4000},
│     "relleno": {"id": 5, "nombre": "Mora", "precio": 4500},
│     "topping": {"id": 2, "nombre": "Masmelos Choc", "precio": 3500}
│   }

carrito_compras NO CAMBIA
├── Sigue con FK → productos
├── Los vasos custom usan id_producto del producto genérico "Vaso Personalizado"
├── La config de capas se guarda en 'notas' del carrito
```

---

## 2. Datos Iniciales a Migrar

### 2.1 Ingredientes Base

| # | nombre | tipo | unidad_medida | costo_unitario | stock |
|---|--------|------|---------------|----------------|-------|
| 1 | Galletas Ducales | base | g | $20 | 5000 |
| 2 | Ponqué de Vainilla | base | g | $25 | 5000 |
| 3 | Crema de Vainilla | crema | ml | $15 | 10000 |
| 4 | Crema de Limón | crema | ml | $18 | 5000 |
| 5 | Crema Tres Leches | crema | ml | $20 | 5000 |
| 6 | Crema Oreo | crema | ml | $18 | 5000 |
| 7 | Crema de Coco | crema | ml | $19 | 5000 |
| 8 | Mora Fresca | relleno | g | $30 | 5000 |
| 9 | Coco Rallado | relleno | g | $15 | 5000 |
| 10 | Galleta Oreo | relleno | g | $25 | 5000 |
| 11 | Pulpa de Maracuyá | relleno | ml | $22 | 5000 |
| 12 | Arequipe | relleno | g | $12 | 5000 |
| 13 | Kiwi | relleno | g | $40 | 3000 |
| 14 | Cereza | relleno | g | $35 | 3000 |
| 15 | Durazno | relleno | g | $25 | 5000 |
| 16 | Masmelos Choc. Blanco | topping | unidades | $15 | 3000 |
| 17 | Masmelos Choc. Negro | topping | unidades | $15 | 3000 |
| 18 | Barrichillos de Arequipe | topping | unidades | $10 | 3000 |
| 19 | Mini Masmelos | topping | unidades | $8 | 3000 |
| 20 | Barrita Galleta Choc. Negro | topping | unidades | $12 | 3000 |
| 21 | Cereza Candiada | topping | unidades | $18 | 3000 |
| 22 | Chips Choc. Negro | topping | g | $20 | 3000 |

### 2.2 Componentes Vaso (Capas Disponibles)

| # | tipo | nombre | precio_venta | costo_produccion |
|---|------|--------|-------------|------------------|
| 1 | base | Galletas Ducales | $4000 | $2000 |
| 2 | base | Ponqué de Vainilla | $4800 | $2500 |
| 3 | crema | Crema de Vainilla | $4000 | $1800 |
| 4 | crema | Crema de Limón | $4500 | $2200 |
| 5 | crema | Crema Tres Leches | $5000 | $2400 |
| 6 | crema | Crema Oreo | $4500 | $2100 |
| 7 | crema | Crema de Coco | $4600 | $2300 |
| 8 | relleno | Mora | $4500 | $2800 |
| 9 | relleno | Coco | $4500 | $1500 |
| 10 | relleno | Oreo | $4800 | $2500 |
| 11 | relleno | Maracuyá | $4500 | $2200 |
| 12 | relleno | Arequipe | $4000 | $1200 |
| 13 | relleno | Kiwi | $6000 | $4000 |
| 14 | relleno | Cereza | $5000 | $3500 |
| 15 | relleno | Durazno | $4800 | $2500 |
| 16 | topping | Masmelos Choc. Blanco | $3500 | $1500 |
| 17 | topping | Masmelos Choc. Negro | $3500 | $1500 |
| 18 | topping | Barrichillos de Arequipe | $3000 | $1000 |
| 19 | topping | Mini Masmelos | $2500 | $800 |
| 20 | topping | Barrita Galleta Choc. Negro | $3000 | $1200 |
| 21 | topping | Cereza | $3800 | $1800 |
| 22 | topping | Chips Choc. Negro | $3500 | $2000 |

### 2.3 Relación Componente → Ingredientes

Cada componente usa 1 o más ingredientes con cantidades específicas:

| componente | ingrediente | cantidad_necesaria |
|------------|-------------|-------------------|
| 1 - Galletas Ducales | Galletas Ducales | 50 g |
| 2 - Ponqué Vainilla | Ponqué de Vainilla | 40 g |
| 3 - Crema Vainilla | Crema de Vainilla | 60 ml |
| 4 - Crema Limón | Crema de Limón | 60 ml |
| 5 - Crema Tres Leches | Crema Tres Leches | 60 ml |
| 6 - Crema Oreo | Crema Oreo | 60 ml |
| 7 - Crema Coco | Crema de Coco | 60 ml |
| 8 - Relleno Mora | Mora Fresca | 40 g |
| 9 - Relleno Coco | Coco Rallado | 35 g |
| 10 - Relleno Oreo | Galleta Oreo | 30 g |
| 11 - Relleno Maracuyá | Pulpa de Maracuyá | 50 ml |
| 12 - Relleno Arequipe | Arequipe | 40 g |
| 13 - Relleno Kiwi | Kiwi | 30 g |
| 14 - Relleno Cereza | Cereza | 25 g |
| 15 - Relleno Durazno | Durazno | 35 g |
| 16 - Topping Masmelos Blanco | Masmelos Choc. Blanco | 5 u |
| 17 - Topping Masmelos Negro | Masmelos Choc. Negro | 5 u |
| 18 - Topping Barrichillos | Barrichillos Arequipe | 8 u |
| 19 - Topping Mini Masmelos | Mini Masmelos | 10 u |
| 20 - Topping Barrita | Barrita Galleta Choc. Negro | 1 u |
| 21 - Topping Cereza | Cereza Candiada | 3 u |
| 22 - Topping Chips | Chips Choc. Negro | 15 g |

### 2.4 Migración de los 14 Productos Existentes

Cada producto existente se le asignan 7 capas en `producto_capas`:

**Ejemplo: Mochi de Fresa (id=1)**

| posicion | id_componente | capa |
|----------|---------------|------|
| 1 | 1 | Galletas Ducales |
| 2 | 3 | Crema Vainilla |
| 3 | 8 | Relleno Mora |
| 4 | 2 | Ponqué Vainilla |
| 5 | 3 | Crema Vainilla |
| 6 | 8 | Relleno Mora |
| 7 | 16 | Topping Masmelos Blanco |

Precio calculado: $4000+$4000+$4500+$4800+$4000+$4500+$3500 = **$29.300**
Precio de venta actual: $8.500 → Habría que ajustar o mantener como promo

> **NOTA IMPORTANTE**: Los precios actuales de los 14 productos ($8.500 - $16.500) son MENORES que la suma de sus capas. Esto significa que el modelo de "precio = suma de capas" no aplica directamente a los productos pre-hechos existentes. Hay dos opciones:
>
> **Opción A**: Los productos pre-hechos mantienen su precio actual (precio_venta fijo en `productos`), y las capas son solo para visualización/composición. El costo de producción se calcula desde las capas pero el precio lo define el admin.
>
> **Opción B**: Se ajustan los precios de las capas para que la suma coincida con el precio actual del producto. Esto requeriría cambiar los precios de venta de las capas cuando se usan en un postre pre-hecho vs un vaso personalizado.
>
> **Recomendación**: Opción A. Los productos pre-hechos tienen precio fijo. Las capas definen la composición visual y el costo de producción. El admin ve el margen de ganancia.

---

## 3. RPC Functions Nuevas/Modificadas

### 3.1 RPC: Crear Producto con Capas (Admin)

```sql
CREATE OR REPLACE FUNCTION crear_producto_con_capas(
  p_nombre_japones VARCHAR,
  p_nombre_espanol VARCHAR,
  p_descripcion_corta VARCHAR,
  p_descripcion_completa TEXT,
  p_id_categoria INTEGER,
  p_precio_venta NUMERIC,           -- precio que pone el admin
  p_stock INTEGER,
  p_imagen_principal VARCHAR,
  p_capas JSONB                     -- [{posicion: 1, id_componente: 1}, ...]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id_producto INTEGER;
  v_precio_calculado NUMERIC := 0;
  v_capa JSONB;
  v_precio_componente NUMERIC;
BEGIN
  -- Calcular precio desde las capas
  FOR v_capa IN SELECT * FROM jsonb_array_elements(p_capas)
  LOOP
    SELECT precio_venta INTO v_precio_componente
    FROM componentes_vaso
    WHERE id_componente = (v_capa->>'id_componente')::INTEGER;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Componente ID % no encontrado', v_capa->>'id_componente';
    END IF;

    v_precio_calculado := v_precio_calculado + v_precio_componente;
  END LOOP;

  -- Insertar producto
  INSERT INTO productos (
    nombre_japones, nombre_espanol, descripcion_corta, descripcion_completa,
    id_categoria, precio_calculado, precio_venta, stock,
    imagen_principal, disponible, destacado
  ) VALUES (
    p_nombre_japones, p_nombre_espanol, p_descripcion_corta, p_descripcion_completa,
    p_id_categoria, v_precio_calculado, p_precio_venta, p_stock,
    p_imagen_principal, true, false
  )
  RETURNING id_producto INTO v_id_producto;

  -- Insertar capas del producto
  FOR v_capa IN SELECT * FROM jsonb_array_elements(p_capas)
  LOOP
    INSERT INTO producto_capas (id_producto, posicion, id_componente)
    VALUES (
      v_id_producto,
      (v_capa->>'posicion')::INTEGER,
      (v_capa->>'id_componente')::INTEGER
    );
  END LOOP;

  RETURN v_id_producto;
END;
$$;
```

### 3.2 RPC: Obtener Composición de Producto (Admin/Público)

```sql
CREATE OR REPLACE FUNCTION obtener_composicion_producto(
  p_id_producto INTEGER
)
RETURNS TABLE(
  posicion INTEGER,
  id_componente INTEGER,
  tipo_componente VARCHAR,
  nombre_componente VARCHAR,
  precio_venta NUMERIC,
  imagen_componente VARCHAR,
  ingredientes JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.posicion,
    cv.id_componente,
    cv.tipo::VARCHAR,
    cv.nombre,
    cv.precio_venta,
    cv.imagen,
    (
      SELECT jsonb_agg(jsonb_build_object(
        'nombre', i.nombre,
        'cantidad', ci.cantidad_necesaria,
        'unidad', i.unidad_medida
      ))
      FROM componente_ingrediente ci
      JOIN ingredientes i ON i.id_ingrediente = ci.id_ingrediente
      WHERE ci.id_componente = cv.id_componente
    ) AS ingredientes
  FROM producto_capas pc
  JOIN componentes_vaso cv ON cv.id_componente = pc.id_componente
  WHERE pc.id_producto = p_id_producto
  ORDER BY pc.posicion;
END;
$$;
```

### 3.3 RPC: Validar y Crear Pedido con Vasos Personalizados

```sql
CREATE OR REPLACE FUNCTION crear_pedido_vaso_personalizado(
  p_id_usuario UUID,
  p_id_direccion INTEGER,
  p_productos JSONB,
  -- Formato: [{
  --   "id_producto": 99 (genérico "Vaso Personalizado"),
  --   "cantidad": 2,
  --   "configuracion_capas": {
  --     "base": {"id": 1, "nombre": "...", "precio": 4000},
  --     "crema": {"id": 3, "nombre": "...", "precio": 4000},
  --     "relleno": {"id": 5, "nombre": "...", "precio": 4500},
  --     "topping": {"id": 2, "nombre": "...", "precio": 3500}
  --   }
  -- }]
  p_metodo_pago VARCHAR,
  p_notas TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id_pedido INTEGER;
  v_numero TEXT;
  v_subtotal NUMERIC := 0;
  v_item JSONB;
  v_config JSONB;
  v_precio_capa NUMERIC;
  v_precio_item NUMERIC;
  v_componente_id INTEGER;
  v_stock INTEGER;
BEGIN
  -- Validar cada item del pedido
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    v_config := v_item->>'configuracion_capas';

    IF v_config IS NOT NULL THEN
      -- VASO PERSONALIZADO: calcular precio desde componentes_vaso
      v_precio_item := 0;

      -- Validar y sumar cada capa
      FOR SELECT jsonb_object_keys(v_config) AS tipo
      LOOP
        v_componente_id := (v_config->tipo->>'id')::INTEGER;

        SELECT precio_venta, stock_disponible INTO v_precio_capa, v_stock
        FROM componentes_vaso
        WHERE id_componente = v_componente_id AND activo = true;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Componente % no encontrado o inactivo', v_componente_id;
        END IF;

        IF v_stock < (v_item->>'cantidad')::INTEGER THEN
          RAISE EXCEPTION 'Stock insuficiente para componente %: disponible %, solicitado %',
            v_componente_id, v_stock, (v_item->>'cantidad')::INTEGER;
        END IF;

        v_precio_item := v_precio_item + v_precio_capa;
      END LOOP;

    ELSE
      -- PRODUCTO PRE-HECHO: usar precio de la BD
      SELECT precio_venta, stock INTO v_precio_item, v_stock
      FROM productos
      WHERE id_producto = (v_item->>'id_producto')::INTEGER;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto ID % no encontrado', v_item->>'id_producto';
      END IF;

      IF v_stock < (v_item->>'cantidad')::INTEGER THEN
        RAISE EXCEPTION 'Stock insuficiente para producto %: disponible %, solicitado %',
          (v_item->>'id_producto')::INTEGER, v_stock, (v_item->>'cantidad')::INTEGER;
      END IF;
    END IF;

    v_subtotal := v_subtotal + (v_precio_item * (v_item->>'cantidad')::INTEGER);
  END LOOP;

  -- Generar número de pedido
  v_numero := 'MOCHI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::TEXT;

  -- Insertar pedido
  INSERT INTO pedidos (
    id_usuario, id_direccion, numero_pedido, subtotal, total,
    metodo_pago, notas_especiales, estado, creado_por
  ) VALUES (
    p_id_usuario, p_id_direccion, v_numero, v_subtotal, v_subtotal,
    p_metodo_pago, p_notas, 'pendiente', 'web'
  )
  RETURNING id_pedido INTO v_id_pedido;

  -- Insertar detalles y descontar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    v_config := v_item->>'configuracion_capas';

    IF v_config IS NOT NULL THEN
      -- VASO PERSONALIZADO
      -- Calcular precio real
      v_precio_item := 0;
      FOR SELECT jsonb_object_keys(v_config) AS tipo
      LOOP
        SELECT precio_venta INTO v_precio_capa
        FROM componentes_vaso WHERE id_componente = (v_config->tipo->>'id')::INTEGER;
        v_precio_item := v_precio_item + v_precio_capa;
      END LOOP;

      -- Insertar detalle
      INSERT INTO detalle_pedido (
        id_pedido, id_producto, cantidad, precio_unitario, subtotal,
        configuracion_capas, origen
      ) VALUES (
        v_id_pedido,
        (v_item->>'id_producto')::INTEGER,
        (v_item->>'cantidad')::INTEGER,
        v_precio_item,
        v_precio_item * (v_item->>'cantidad')::INTEGER,
        v_config,
        'online'
      );

      -- Descontar stock de cada componente
      FOR SELECT jsonb_object_keys(v_config) AS tipo
      LOOP
        v_componente_id := (v_config->tipo->>'id')::INTEGER;

        UPDATE componentes_vaso
        SET stock_disponible = stock_disponible - (v_item->>'cantidad')::INTEGER,
            updated_at = NOW()
        WHERE id_componente = v_componente_id;

        -- Descontar stock de ingredientes del componente
        UPDATE ingredientes i
        SET stock_disponible = stock_disponible -
              (ci.cantidad_necesaria * (v_item->>'cantidad')::INTEGER)::INTEGER,
            updated_at = NOW()
        FROM componente_ingrediente ci
        WHERE ci.id_ingrediente = i.id_ingrediente
          AND ci.id_componente = v_componente_id;

        -- Si ingrediente <= stock_minimo, desactivar componente
        UPDATE componentes_vaso cv
        SET activo = false, updated_at = NOW()
        WHERE cv.id_componente = v_componente_id
          AND cv.stock_disponible <= cv.stock_minimo;
      END LOOP;

    ELSE
      -- PRODUCTO PRE-HECHO
      SELECT precio_venta INTO v_precio_item
      FROM productos WHERE id_producto = (v_item->>'id_producto')::INTEGER;

      INSERT INTO detalle_pedido (
        id_pedido, id_producto, cantidad, precio_unitario, subtotal, origen
      ) VALUES (
        v_id_pedido,
        (v_item->>'id_producto')::INTEGER,
        (v_item->>'cantidad')::INTEGER,
        v_precio_item,
        v_precio_item * (v_item->>'cantidad')::INTEGER,
        'online'
      );

      UPDATE productos
      SET stock = stock - (v_item->>'cantidad')::INTEGER,
          updated_at = NOW()
      WHERE id_producto = (v_item->>'id_producto')::INTEGER;
    END IF;
  END LOOP;

  RETURN v_id_pedido;
END;
$$;
```

### 3.4 RPC: Obtener Componentes Disponibles (para Custom Cup Builder)

```sql
CREATE OR REPLACE FUNCTION obtener_componentes_disponibles()
RETURNS TABLE(
  id_componente INTEGER,
  tipo VARCHAR,
  nombre VARCHAR,
  precio_venta NUMERIC,
  imagen VARCHAR,
  stock_disponible INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cv.id_componente,
    cv.tipo::VARCHAR,
    cv.nombre,
    cv.precio_venta,
    cv.imagen,
    cv.stock_disponible
  FROM componentes_vaso cv
  WHERE cv.activo = true
    AND cv.stock_disponible > cv.stock_minimo
  ORDER BY cv.tipo, cv.nombre;
END;
$$;
```

### 3.5 RPC: CRUD de Ingredientes (Admin)

```sql
-- Crear ingrediente
CREATE OR REPLACE FUNCTION crear_ingrediente(
  p_nombre VARCHAR,
  p_tipo VARCHAR,
  p_unidad_medida VARCHAR,
  p_costo_unitario NUMERIC,
  p_stock_disponible INTEGER,
  p_stock_minimo INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id INTEGER;
BEGIN
  INSERT INTO ingredientes (nombre, tipo, unidad_medida, costo_unitario, stock_disponible, stock_minimo)
  VALUES (p_nombre, p_tipo::ingredient_type, p_unidad_medida, p_costo_unitario, p_stock_disponible, p_stock_minimo)
  RETURNING id_ingrediente INTO v_id;
  RETURN v_id;
END;
$$;

-- Actualizar ingrediente
CREATE OR REPLACE FUNCTION actualizar_ingrediente(
  p_id INTEGER,
  p_nombre VARCHAR,
  p_tipo VARCHAR,
  p_unidad_medida VARCHAR,
  p_costo_unitario NUMERIC,
  p_stock_disponible INTEGER,
  p_stock_minimo INTEGER,
  p_activo BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ingredientes
  SET nombre = p_nombre,
      tipo = p_tipo::ingredient_type,
      unidad_medida = p_unidad_medida,
      costo_unitario = p_costo_unitario,
      stock_disponible = p_stock_disponible,
      stock_minimo = p_stock_minimo,
      activo = p_activo,
      updated_at = NOW()
  WHERE id_ingrediente = p_id;
END;
$$;

-- Eliminar ingrediente (soft delete)
CREATE OR REPLACE FUNCTION eliminar_ingrediente(p_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ingredientes SET activo = false, updated_at = NOW() WHERE id_ingrediente = p_id;
END;
$$;
```

### 3.6 RPC: CRUD de Componentes Vaso (Admin)

```sql
-- Crear componente
CREATE OR REPLACE FUNCTION crear_componente(
  p_tipo VARCHAR,
  p_nombre VARCHAR,
  p_descripcion TEXT,
  p_precio_venta NUMERIC,
  p_imagen VARCHAR,
  p_stock_disponible INTEGER,
  p_stock_minimo INTEGER,
  p_ingredientes JSONB  -- [{id_ingrediente: 1, cantidad_necesaria: 50}, ...]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id INTEGER;
  v_costo NUMERIC := 0;
  v_ing JSONB;
  v_costo_ing NUMERIC;
BEGIN
  -- Calcular costo de producción desde ingredientes
  FOR v_ing IN SELECT * FROM jsonb_array_elements(p_ingredientes)
  LOOP
    SELECT costo_unitario INTO v_costo_ing
    FROM ingredientes WHERE id_ingrediente = (v_ing->>'id_ingrediente')::INTEGER;

    v_costo := v_costo + (v_costo_ing * (v_ing->>'cantidad_necesaria')::NUMERIC);
  END LOOP;

  INSERT INTO componentes_vaso (tipo, nombre, descripcion, precio_venta, costo_produccion, imagen, stock_disponible, stock_minimo)
  VALUES (p_tipo::component_type, p_nombre, p_descripcion, p_precio_venta, v_costo, p_imagen, p_stock_disponible, p_stock_minimo)
  RETURNING id_componente INTO v_id;

  -- Asociar ingredientes
  FOR v_ing IN SELECT * FROM jsonb_array_elements(p_ingredientes)
  LOOP
    INSERT INTO componente_ingrediente (id_componente, id_ingrediente, cantidad_necesaria)
    VALUES (v_id, (v_ing->>'id_ingrediente')::INTEGER, (v_ing->>'cantidad_necesaria')::NUMERIC);
  END LOOP;

  RETURN v_id;
END;
$$;

-- Actualizar componente
CREATE OR REPLACE FUNCTION actualizar_componente(
  p_id INTEGER,
  p_tipo VARCHAR,
  p_nombre VARCHAR,
  p_descripcion TEXT,
  p_precio_venta NUMERIC,
  p_imagen VARCHAR,
  p_stock_disponible INTEGER,
  p_stock_minimo INTEGER,
  p_activo BOOLEAN,
  p_ingredientes JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_costo NUMERIC := 0;
  v_ing JSONB;
  v_costo_ing NUMERIC;
BEGIN
  -- Recalcular costo
  FOR v_ing IN SELECT * FROM jsonb_array_elements(p_ingredientes)
  LOOP
    SELECT costo_unitario INTO v_costo_ing
    FROM ingredientes WHERE id_ingrediente = (v_ing->>'id_ingrediente')::INTEGER;
    v_costo := v_costo + (v_costo_ing * (v_ing->>'cantidad_necesaria')::NUMERIC);
  END LOOP;

  UPDATE componentes_vaso
  SET tipo = p_tipo::component_type,
      nombre = p_nombre,
      descripcion = p_descripcion,
      precio_venta = p_precio_venta,
      costo_produccion = v_costo,
      imagen = p_imagen,
      stock_disponible = p_stock_disponible,
      stock_minimo = p_stock_minimo,
      activo = p_activo,
      updated_at = NOW()
  WHERE id_componente = p_id;

  -- Reemplazar ingredientes
  DELETE FROM componente_ingrediente WHERE id_componente = p_id;

  FOR v_ing IN SELECT * FROM jsonb_array_elements(p_ingredientes)
  LOOP
    INSERT INTO componente_ingrediente (id_componente, id_ingrediente, cantidad_necesaria)
    VALUES (p_id, (v_ing->>'id_ingrediente')::INTEGER, (v_ing->>'cantidad_necesaria')::NUMERIC);
  END LOOP;
END;
$$;
```

---

## 4. Enums Necesarios

```sql
-- Crear enums si no existen
DO $$ BEGIN
  CREATE TYPE ingredient_type AS ENUM ('base','crema','relleno','topping','general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE component_type AS ENUM ('base','crema','relleno','topping');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
```

---

## 5. Scripts SQL de Migración

### Fase 1: Crear tablas nuevas

```sql
-- 1. Tabla ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
  id_ingrediente SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  tipo ingredient_type NOT NULL DEFAULT 'general',
  unidad_medida VARCHAR(50) NOT NULL,
  costo_unitario NUMERIC NOT NULL CHECK (costo_unitario >= 0),
  stock_disponible INTEGER NOT NULL DEFAULT 0 CHECK (stock_disponible >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 10 CHECK (stock_minimo >= 0),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ingredientes_select_auth" ON ingredientes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ingredientes_insert_admin" ON ingredientes
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "ingredientes_update_admin" ON ingredientes
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

CREATE POLICY "ingredientes_delete_admin" ON ingredientes
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

-- 2. Tabla componentes_vaso
CREATE TABLE IF NOT EXISTS componentes_vaso (
  id_componente SERIAL PRIMARY KEY,
  tipo component_type NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_venta NUMERIC NOT NULL CHECK (precio_venta >= 0),
  costo_produccion NUMERIC NOT NULL DEFAULT 0 CHECK (costo_produccion >= 0),
  imagen VARCHAR(500),
  stock_disponible INTEGER NOT NULL DEFAULT 9999 CHECK (stock_disponible >= 0),
  stock_minimo INTEGER NOT NULL DEFAULT 10 CHECK (stock_minimo >= 0),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE componentes_vaso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "componentes_select_auth" ON componentes_vaso
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "componentes_insert_admin" ON componentes_vaso
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "componentes_update_admin" ON componentes_vaso
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

CREATE POLICY "componentes_delete_admin" ON componentes_vaso
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

-- 3. Tabla componente_ingrediente
CREATE TABLE IF NOT EXISTS componente_ingrediente (
  id_componente INTEGER NOT NULL REFERENCES componentes_vaso(id_componente) ON DELETE CASCADE,
  id_ingrediente INTEGER NOT NULL REFERENCES ingredientes(id_ingrediente) ON DELETE RESTRICT,
  cantidad_necesaria NUMERIC NOT NULL CHECK (cantidad_necesaria > 0),
  PRIMARY KEY (id_componente, id_ingrediente)
);

ALTER TABLE componente_ingrediente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_ing_select_auth" ON componente_ingrediente
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "comp_ing_insert_admin" ON componente_ingrediente
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "comp_ing_delete_admin" ON componente_ingrediente
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

-- 4. Tabla producto_capas
CREATE TABLE IF NOT EXISTS producto_capas (
  id_producto INTEGER NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
  posicion INTEGER NOT NULL CHECK (posicion >= 1 AND posicion <= 7),
  id_componente INTEGER NOT NULL REFERENCES componentes_vaso(id_componente) ON DELETE RESTRICT,
  PRIMARY KEY (id_producto, posicion)
);

ALTER TABLE producto_capas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prod_capas_select_auth" ON producto_capas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "prod_capas_insert_admin" ON producto_capas
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "prod_capas_delete_admin" ON producto_capas
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin'));

-- 5. Modificar tabla productos
ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS precio_calculado NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS precio_venta NUMERIC NULL,
  ADD COLUMN IF NOT EXISTS margen_ganancia NUMERIC DEFAULT 0;

-- Migrar precios existentes a precio_venta
UPDATE productos
SET precio_venta = precio,
    precio_calculado = precio,
    margen_ganancia = 0
WHERE precio_venta IS NULL;

-- 6. Modificar tabla detalle_pedido
ALTER TABLE detalle_pedido
  ADD COLUMN IF NOT EXISTS configuracion_capas JSONB NULL;
```

### Fase 2: Insertar datos iniciales

```sql
-- Insertar ingredientes (ver tabla en sección 2.1)
-- Insertar componentes (ver tabla en sección 2.2)
-- Insertar relaciones componente_ingrediente (ver tabla en sección 2.3)
-- Crear producto genérico "Vaso Personalizado"
INSERT INTO productos (
  nombre_japones, nombre_espanol, descripcion_corta, descripcion_completa,
  id_categoria, precio_calculado, precio_venta, stock, imagen_principal,
  disponible, destacado
) VALUES (
  'Vaso Personalizado', 'Vaso Personalizado',
  'Arma tu vaso con 7 capas de sabor',
  'Vaso relleno personalizado de 7 capas. Elige base, crema, relleno y topping.',
  1, 0, 0, 9999,
  'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=400&q=80',
  true, false
);
```

---

## 6. Cambios en el Frontend

### 6.1 Servicios Nuevos/Modificados

**Nuevo: `componentes-vaso.service.ts`**
```typescript
// Carga los componentes disponibles desde BD
// Reemplaza los datos hardcoded del custom cup builder
// Expone: bases(), cremas(), rellenos(), toppings()
// Expone: calcularPrecio(baseId, cremaId, rellenoId, toppingId)
```

**Nuevo: `ingredientes.service.ts`**
```typescript
// CRUD completo de ingredientes para el admin
// expone: ingredientes(), crear(), actualizar(), eliminar()
```

**Modificado: `cart.service.ts`**
```typescript
// addToCart() para custom cups:
//   - Usa id_producto del genérico "Vaso Personalizado"
//   - Guarda configuracion_capas en 'notas' como JSON string
//   - NO envía precio (se calcula en backend)

// removeFromCart(), updateQuantity() sin cambios significativos
```

**Modificado: `mochi-data.service.ts`**
```typescript
// loadProducts(): Ahora incluye precio_calculado y precio_venta
// createProduct(): Acepta capas (array de posiciones)
// new: obtenerComposicionProducto(id): Retorna las 7 capas de un producto
```

**Modificado: `supabase.service.ts`**
```typescript
// new: crearPedidoVasoPersonalizado(): RPC que calcula precio en backend
// new: obtenerComponentesDisponibles(): Para el custom cup builder
// new: CRUD ingredientes, CRUD componentes_vaso
```

### 6.2 Custom Cup Builder (`custom-cup.ts`)

Cambios:
- En vez de datos hardcoded, carga componentes desde BD via `componentesVasoService`
- El precio se calcula en el frontend para UX, pero el real viene del backend
- Al agregar al carrito: envía `{ id_producto: 99, configuracion_capas: {...} }`
- Se verifica stock de cada capa antes de agregar al carrito

### 6.3 Checkout (`checkout.ts`)

Cambios:
- Para items con `configuracion_capas`: usa `crearPedidoVasoPersonalizado`
- Para items sin configuración: usa `crearPedidoConStock` (original)
- El precio de los vasos custom NUNCA viene del frontend

### 6.4 Admin - Nuevo Constructor de Productos

**Nuevo componente: `admin-product-builder.ts`**
```
┌─────────────────────────────────────────────┐
│  Constructor de Postre                       │
├─────────────────────────────────────────────┤
│                                              │
│  Nombre Japonés: [____________]             │
│  Nombre Español: [____________]             │
│  Categoría:      [Mochis      ▼]           │
│  Descripción:    [____________]             │
│                                              │
│  ┌─────────────────────────────────┐        │
│  │  Composición por Capas          │        │
│  │                                   │        │
│  │  Capa 7 (Topping) [seleccionar ▼]│        │
│  │  Capa 6 (Relleno) [seleccionar ▼]│        │
│  │  Capa 5 (Crema)   [seleccionar ▼]│        │
│  │  Capa 4 (Base)    [seleccionar ▼]│        │
│  │  Capa 3 (Relleno) [seleccionar ▼]│        │
│  │  Capa 2 (Crema)   [seleccionar ▼]│        │
│  │  Capa 1 (Base)    [seleccionar ▼]│        │
│  │                                   │        │
│  │  Costo producción: $18.500      │        │
│  │  Precio venta:     [____]       │        │
│  │  Margen:           $6.500 ✓     │        │
│  └─────────────────────────────────┘        │
│                                              │
│  [Guardar Postre]                            │
└─────────────────────────────────────────────┘
```

### 6.5 Admin - Vista de Producto con Composición

**Modificar: `admin-product-detail` o agregar a `admin-dashboard`**
```
┌─────────────────────────────────────────────┐
│  Mochi de Fresa Fresca                      │
│  Imagen: [📷 foto]                          │
│                                              │
│  Composición:                                │
│  ┌─────────────────────────────────┐        │
│  │  🟫 Galletas Ducales     $4.000 │        │
│  │  🟡 Crema Vainilla       $4.000 │        │
│  │  🔴 Mora Fresca          $4.500 │        │
│  │  🟫 Ponqué Vainilla      $4.800 │        │
│  │  🟡 Crema Vainilla       $4.000 │        │
│  │  🔴 Mora Fresca          $4.500 │        │
│  │  ⬛ Chips Blanco         $3.500 │        │
│  │  ─────────────────────────────  │        │
│  │  Costo: $25.300                  │        │
│  │  Precio: $25.000 [editar]       │        │
│  │  Margen: -$300 ⚠️               │        │
│  └─────────────────────────────────┘        │
│                                              │
│  Stock: [50]  Disponible: [✓]               │
│  [Editar Composición] [Eliminar]             │
└─────────────────────────────────────────────┘
```

---

## 7. Diagrama de Relaciones

```
ingredientes ─────┐
                   ├── componente_ingrediente
componentes_vaso ──┘
       │
       ├── producto_capas ──→ productos
       │
       └── (custom cup: seleccionado por el cliente)

productos ──→ detalle_pedido ──→ pedidos ──→ pagos
                        │
                        └── configuracion_capas JSONB (para vasos custom)

usuarios ──→ carrito_compras ──→ productos
              (custom cups en 'notas' como JSON)
```

---

## 8. Orden de Implementación

| Fase | Descripción | Archivos Afectados |
|------|-------------|-------------------|
| **1** | Crear enums + tablas nuevas en BD | SQL migration |
| **2** | Insertar datos iniciales (ingredientes, componentes) | SQL migration |
| **3** | Crear RPCs de CRUD (ingredientes, componentes, producto_capas) | SQL migration |
| **4** | Modificar `productos` (agregar columnas) + migrar precios | SQL migration |
| **5** | Modificar `detalle_pedido` (agregar configuracion_capas) | SQL migration |
| **6** | Crear RPC: `crear_pedido_vaso_personalizado` | SQL migration |
| **7** | Crear servicio `ingredientes.service.ts` | Frontend |
| **8** | Crear servicio `componentes-vaso.service.ts` | Frontend |
| **9** | Actualizar `mochi-data.service.ts` y `supabase.service.ts` | Frontend |
| **10** | Actualizar `custom-cup.ts` (conectar a BD) | Frontend |
| **11** | Actualizar `cart.service.ts` (custom cups con IDs de BD) | Frontend |
| **12** | Actualizar `checkout.ts` (distinguir custom vs pre-hecho) | Frontend |
| **13** | Crear `admin-product-builder.ts` (constructor de capas) | Frontend |
| **14** | Actualizar admin dashboard (ver composición de productos) | Frontend |
| **15** | Actualizar admin pedidos (ver config de vasos custom) | Frontend |
| **16** | Actualizar empleado pedidos (ver capas del vaso) | Frontend |
| **17** | Migrar los 14 productos existentes a `producto_capas` | SQL + Frontend |
| **18** | Crear producto genérico "Vaso Personalizado" | SQL |

---

## 9. Riesgos y Consideraciones

1. **Precios de productos existentes**: Los 14 productos actuales tienen precios ($8.500-$16.500) que son MENORES que la suma de sus capas. Solución: `precio_venta` en productos permite precio fijo independiente de las capas.

2. **Migración de datos**: Se debe crear el producto genérico "Vaso Personalizado" ANTES de cambiar el frontend, para que no se rompa el carrito.

3. **Stock cascade**: Si un ingrediente llega a 0, la capa se desactiva, y si un postre tiene esa capa, el postre se marca como no disponible. Esto necesita trigger o lógica en el RPC.

4. **Performance**: Las consultas de composición involucran 3 JOINs. Se recomienda índice en `producto_capas(id_producto)` y `componente_ingrediente(id_componente)`.

5. **Backward compatibility**: El checkout actual usa `crearPedidoConStock`. Se debe mantener hasta que el nuevo RPC esté probado.

6. **Bundle size**: Agregar 2-3 servicios y 1-2 componentes nuevos aumentará el bundle ~15-20KB. Aceptariable.
