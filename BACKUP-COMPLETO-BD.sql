-- ============================================================
-- BACKUP COMPLETO DE BASE DE DATOS - MOCHI POSTRES JAPONESES
-- Fecha: 2026-08-23
-- Proyecto: iakkcxsjhuiaykyajbca.supabase.co
-- ============================================================
-- INSTRUCCIONES:
-- 1. Crear un proyecto nuevo en Supabase
-- 2. Ir al SQL Editor del dashboard
-- 3. Pegar y ejecutar este script completo
-- 4. Verificar que todas las tablas y datos se crearon
-- ============================================================

-- ============================================================
-- PARTE 1: ENUMS Y TIPOS PERSONALIZADOS
-- ============================================================

-- Enum: user_role
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'empleado', 'cliente');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- PARTE 2: FUNCIONES UTILITARIAS
-- ============================================================

-- Función: update_updated_at_column (trigger para timestamps)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Función: get_user_role (obtener rol del usuario actual)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  user_rol TEXT;
BEGIN
  SELECT rol::text INTO user_rol
  FROM public.usuarios
  WHERE id = auth.uid();
  RETURN COALESCE(user_rol, 'cliente');
END;
$function$;

-- Función: handle_new_user (trigger al registrar usuario)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Auto-confirmar email
  UPDATE auth.users 
  SET email_confirmed_at = now()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;

  INSERT INTO public.usuarios (id, email, nombre_completo, telefono, rol, activo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'telefono', NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'cliente'),
    true
  );
  RETURN NEW;
END;
$function$;

-- Función: generate_pedido_number (trigger para números de pedido)
CREATE OR REPLACE FUNCTION public.generate_pedido_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    NEW.numero_pedido := 'MOCHI-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((SELECT COUNT(*) + 1 FROM public.pedidos)::TEXT, 6, '0');
    RETURN NEW;
END;
$function$;

-- ============================================================
-- PARTE 3: TABLAS
-- ============================================================

-- Tabla: usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  nombre_completo VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  foto_perfil VARCHAR(500),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  rol user_role DEFAULT 'cliente'
);

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(500),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: productos
CREATE TABLE IF NOT EXISTS public.productos (
  id_producto SERIAL PRIMARY KEY,
  id_categoria INTEGER NOT NULL,
  nombre_japones VARCHAR(100) NOT NULL,
  nombre_espanol VARCHAR(150) NOT NULL,
  descripcion_corta VARCHAR(255),
  descripcion_completa TEXT,
  ingredientes TEXT,
  informacion_nutricional TEXT,
  precio NUMERIC NOT NULL,
  precio_oferta NUMERIC,
  imagen_principal VARCHAR(500),
  galeria_imagenes JSONB,
  peso VARCHAR(50),
  disponible BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  stock_minimo INTEGER DEFAULT 10,
  stock_maximo INTEGER DEFAULT 500
);

-- Tabla: direcciones
CREATE TABLE IF NOT EXISTS public.direcciones (
  id_direccion SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL,
  alias VARCHAR(50),
  direccion_completa VARCHAR(255) NOT NULL,
  barrio VARCHAR(100),
  ciudad VARCHAR(100) NOT NULL,
  departamento VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(10),
  instrucciones_entrega TEXT,
  predeterminada BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id_pedido SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL,
  id_direccion INTEGER,
  numero_pedido VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  subtotal NUMERIC NOT NULL,
  costo_envio NUMERIC DEFAULT 0,
  impuestos NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  metodo_pago VARCHAR(50),
  notas_especiales TEXT,
  fecha_entrega_estimada TIMESTAMPTZ,
  fecha_entrega_real TIMESTAMPTZ,
  creado_por VARCHAR(10) DEFAULT 'web',
  id_empleado_registro UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT pedidos_estado_check CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'confirmado'::character varying, 'en_preparacion'::character varying, 'listo'::character varying, 'en_camino'::character varying, 'entregado'::character varying, 'cancelado'::character varying]::text[])),
  CONSTRAINT pedidos_creado_por_check CHECK (creado_por::text = ANY (ARRAY['web'::character varying, 'local'::character varying]::text[]))
);

-- Tabla: detalle_pedido
CREATE TABLE IF NOT EXISTS public.detalle_pedido (
  id_detalle SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL,
  id_producto INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  origen VARCHAR(20) DEFAULT 'online',
  CONSTRAINT detalle_pedido_origen_check CHECK (origen::text = ANY (ARRAY['online'::character varying, 'local'::character varying]::text[]))
);

-- Tabla: pagos
CREATE TABLE IF NOT EXISTS public.pagos (
  id_pago SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  monto NUMERIC NOT NULL,
  referencia_transaccion VARCHAR(255),
  datos_pago JSONB,
  fecha_pago TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT pagos_estado_check CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'aprobado'::character varying, 'rechazado'::character varying, 'reembolsado'::character varying]::text[]))
);

-- Tabla: carrito_compras
CREATE TABLE IF NOT EXISTS public.carrito_compras (
  id_carrito SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL,
  id_producto INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  notas TEXT
);

-- Tabla: favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
  id_favorito SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL,
  id_producto INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: resenas
CREATE TABLE IF NOT EXISTS public.resenas (
  id_resena SERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL,
  id_producto INTEGER NOT NULL,
  calificacion INTEGER NOT NULL,
  titulo VARCHAR(100),
  comentario TEXT,
  aprobado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT comentarios_calificacion_check CHECK (calificacion >= 1 AND calificacion <= 5)
);

-- Tabla: blog
CREATE TABLE IF NOT EXISTS public.blog (
  id_articulo SERIAL PRIMARY KEY,
  id_autor UUID NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  resumen VARCHAR(500),
  contenido TEXT NOT NULL,
  imagen_principal VARCHAR(500),
  categoria VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'borrador',
  fecha_publicacion TIMESTAMPTZ,
  vistas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT blog_estado_check CHECK (estado::text = ANY (ARRAY['borrador'::character varying, 'publicado'::character varying, 'programado'::character varying]::text[]))
);

-- Tabla: cupones_descuento
CREATE TABLE IF NOT EXISTS public.cupones_descuento (
  id_cupon SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  tipo_descuento VARCHAR(20) NOT NULL,
  valor_descuento NUMERIC NOT NULL,
  monto_minimo_compra NUMERIC DEFAULT 0,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  uso_maximo INTEGER,
  usos_realizados INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT cupones_descuento_tipo_descuento_check CHECK (tipo_descuento::text = ANY (ARRAY['porcentaje'::character varying, 'monto_fijo'::character varying]::text[]))
);

-- ============================================================
-- PARTE 4: FOREIGN KEYS
-- ============================================================

-- productos → categorias
ALTER TABLE public.productos
  ADD CONSTRAINT productos_id_categoria_fkey
  FOREIGN KEY (id_categoria) REFERENCES public.categorias(id_categoria);

-- direcciones → usuarios
ALTER TABLE public.direcciones
  ADD CONSTRAINT direcciones_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

-- pedidos → usuarios
ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

-- pedidos → direcciones
ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_id_direccion_fkey
  FOREIGN KEY (id_direccion) REFERENCES public.direcciones(id_direccion);

-- pedidos → usuarios (empleado)
ALTER TABLE public.pedidos
  ADD CONSTRAINT pedidos_id_empleado_registro_fkey
  FOREIGN KEY (id_empleado_registro) REFERENCES public.usuarios(id);

-- detalle_pedido → pedidos
ALTER TABLE public.detalle_pedido
  ADD CONSTRAINT detalle_pedido_id_pedido_fkey
  FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido);

-- detalle_pedido → productos
ALTER TABLE public.detalle_pedido
  ADD CONSTRAINT detalle_pedido_id_producto_fkey
  FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);

-- pagos → pedidos
ALTER TABLE public.pagos
  ADD CONSTRAINT pagos_id_pedido_fkey
  FOREIGN KEY (id_pedido) REFERENCES public.pedidos(id_pedido);

-- carrito_compras → usuarios
ALTER TABLE public.carrito_compras
  ADD CONSTRAINT carrito_compras_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

-- carrito_compras → productos
ALTER TABLE public.carrito_compras
  ADD CONSTRAINT carrito_compras_id_producto_fkey
  FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);

-- favoritos → usuarios
ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

-- favoritos → productos
ALTER TABLE public.favoritos
  ADD CONSTRAINT favoritos_id_producto_fkey
  FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);

-- resenas → usuarios
ALTER TABLE public.resenas
  ADD CONSTRAINT comentarios_id_usuario_fkey
  FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id);

-- resenas → productos
ALTER TABLE public.resenas
  ADD CONSTRAINT comentarios_id_producto_fkey
  FOREIGN KEY (id_producto) REFERENCES public.productos(id_producto);

-- blog → usuarios
ALTER TABLE public.blog
  ADD CONSTRAINT blog_id_autor_fkey
  FOREIGN KEY (id_autor) REFERENCES public.usuarios(id);

-- ============================================================
-- PARTE 5: TRIGGERS
-- ============================================================

-- Trigger: update_usuarios_updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_categorias_updated_at
CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_productos_updated_at
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_direcciones_updated_at
CREATE TRIGGER update_direcciones_updated_at
  BEFORE UPDATE ON public.direcciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_pedidos_updated_at
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_pagos_updated_at
CREATE TRIGGER update_pagos_updated_at
  BEFORE UPDATE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_carrito_compras_updated_at
CREATE TRIGGER update_carrito_compras_updated_at
  BEFORE UPDATE ON public.carrito_compras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_comentarios_updated_at
CREATE TRIGGER update_comentarios_updated_at
  BEFORE UPDATE ON public.resenas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_blog_updated_at
CREATE TRIGGER update_blog_updated_at
  BEFORE UPDATE ON public.blog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: update_cupones_descuento_updated_at
CREATE TRIGGER update_cupones_descuento_updated_at
  BEFORE UPDATE ON public.cupones_descuento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: trg_generate_pedido_number
CREATE TRIGGER trg_generate_pedido_number
  BEFORE INSERT ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.generate_pedido_number();

-- Trigger: on_auth_user_created (en auth.users)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PARTE 6: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direcciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrito_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupones_descuento ENABLE ROW LEVEL SECURITY;

-- --- RLS: usuarios ---
CREATE POLICY "usuarios_select_own_or_admin" ON public.usuarios
  FOR SELECT TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text));

CREATE POLICY "usuarios_insert_own" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "usuarios_update_own" ON public.usuarios
  FOR UPDATE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id));

CREATE POLICY "usuarios_delete_admin" ON public.usuarios
  FOR DELETE TO authenticated
  USING ((( SELECT get_user_role() AS get_user_role) = 'admin'::text));

-- --- RLS: categorias ---
CREATE POLICY "categorias_select_public" ON public.categorias
  FOR SELECT TO public
  USING (true);

CREATE POLICY "categorias_admin_all" ON public.categorias
  FOR ALL TO authenticated
  USING ((( SELECT get_user_role() AS get_user_role) = 'admin'::text))
  WITH CHECK ((( SELECT get_user_role() AS get_user_role) = 'admin'::text));

-- --- RLS: productos ---
CREATE POLICY "productos_select_public" ON public.productos
  FOR SELECT TO public
  USING (true);

CREATE POLICY "productos_admin_all" ON public.productos
  FOR ALL TO authenticated
  USING ((( SELECT get_user_role() AS get_user_role) = 'admin'::text))
  WITH CHECK ((( SELECT get_user_role() AS get_user_role) = 'admin'::text));

-- --- RLS: direcciones ---
CREATE POLICY "direcciones_select_own_or_admin" ON public.direcciones
  FOR SELECT TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text));

CREATE POLICY "direcciones_insert_own" ON public.direcciones
  FOR INSERT TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "direcciones_update_own" ON public.direcciones
  FOR UPDATE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "direcciones_delete_own" ON public.direcciones
  FOR DELETE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario));

-- --- RLS: pedidos ---
CREATE POLICY "pedidos_select_own_or_staff" ON public.pedidos
  FOR SELECT TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario) OR (( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])));

CREATE POLICY "pedidos_insert_own" ON public.pedidos
  FOR INSERT TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "pedidos_update_staff" ON public.pedidos
  FOR UPDATE TO authenticated
  USING ((( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])))
  WITH CHECK ((( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])));

-- --- RLS: detalle_pedido ---
CREATE POLICY "detalle_pedido_select_own_or_staff" ON public.detalle_pedido
  FOR SELECT TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.pedidos
  WHERE ((pedidos.id_pedido = detalle_pedido.id_pedido) AND (pedidos.id_usuario = ( SELECT auth.uid() AS uid))))) OR (( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])));

CREATE POLICY "detalle_pedido_insert_own_or_staff" ON public.detalle_pedido
  FOR INSERT TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.pedidos
  WHERE ((pedidos.id_pedido = detalle_pedido.id_pedido) AND (pedidos.id_usuario = ( SELECT auth.uid() AS uid))))) OR (( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])));

-- --- RLS: pagos ---
CREATE POLICY "pagos_select_own_or_staff" ON public.pagos
  FOR SELECT TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.pedidos
  WHERE ((pedidos.id_pedido = pagos.id_pedido) AND (pedidos.id_usuario = ( SELECT auth.uid() AS uid))))) OR (( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])));

CREATE POLICY "pagos_insert_own_or_staff" ON public.pagos
  FOR INSERT TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.pedidos
  WHERE ((pedidos.id_pedido = pagos.id_pedido) AND (pedidos.id_usuario = ( SELECT auth.uid() AS uid))))) OR (( SELECT get_user_role() AS get_user_role) = ANY (ARRAY['admin'::text, 'empleado'::text])));

-- --- RLS: carrito_compras ---
CREATE POLICY "carrito_select_own" ON public.carrito_compras
  FOR SELECT TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "carrito_insert_own" ON public.carrito_compras
  FOR INSERT TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "carrito_update_own" ON public.carrito_compras
  FOR UPDATE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "carrito_delete_own" ON public.carrito_compras
  FOR DELETE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario));

-- --- RLS: favoritos ---
CREATE POLICY "favoritos_select_own" ON public.favoritos
  FOR SELECT TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "favoritos_insert_own" ON public.favoritos
  FOR INSERT TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "favoritos_delete_own" ON public.favoritos
  FOR DELETE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario));

-- --- RLS: resenas ---
CREATE POLICY "resenas_select_public" ON public.resenas
  FOR SELECT TO public
  USING (true);

CREATE POLICY "resenas_insert_own" ON public.resenas
  FOR INSERT TO authenticated
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario));

CREATE POLICY "resenas_update_own_or_admin" ON public.resenas
  FOR UPDATE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text))
  WITH CHECK ((( SELECT auth.uid() AS uid) = id_usuario) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text));

CREATE POLICY "resenas_delete_own_or_admin" ON public.resenas
  FOR DELETE TO authenticated
  USING ((( SELECT auth.uid() AS uid) = id_usuario) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text));

-- --- RLS: blog ---
CREATE POLICY "blog_select_published_or_admin" ON public.blog
  FOR SELECT TO public
  USING (((estado)::text = 'publicado'::text) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text));

CREATE POLICY "blog_admin_all" ON public.blog
  FOR ALL TO authenticated
  USING ((( SELECT get_user_role() AS get_user_role) = 'admin'::text))
  WITH CHECK ((( SELECT get_user_role() AS get_user_role) = 'admin'::text));

-- --- RLS: cupones_descuento ---
CREATE POLICY "cupones_select_valid_or_admin" ON public.cupones_descuento
  FOR SELECT TO public
  USING (((activo = true) AND (fecha_inicio <= now()) AND (fecha_fin >= now())) OR (( SELECT get_user_role() AS get_user_role) = 'admin'::text));

CREATE POLICY "cupones_admin_all" ON public.cupones_descuento
  FOR ALL TO authenticated
  USING ((( SELECT get_user_role() AS get_user_role) = 'admin'::text))
  WITH CHECK ((( SELECT get_user_role() AS get_user_role) = 'admin'::text));

-- ============================================================
-- PARTE 7: FUNCIONES RPC
-- ============================================================

-- RPC: validar_stock_pedido
CREATE OR REPLACE FUNCTION public.validar_stock_pedido(p_productos jsonb)
RETURNS TABLE(id_producto integer, stock_disponible integer, stock_solicitado integer, suficiente boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    (item->>'id_producto')::INTEGER,
    COALESCE(p.stock, 0)::INTEGER,
    (item->>'cantidad')::INTEGER,
    (COALESCE(p.stock, 0) >= (item->>'cantidad')::INTEGER)
  FROM jsonb_array_elements(p_productos) AS item
  LEFT JOIN productos p ON p.id_producto = (item->>'id_producto')::INTEGER;
END;
$function$;

-- RPC: crear_pedido_con_stock (versión SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.crear_pedido_con_stock(p_id_usuario uuid, p_id_direccion integer, p_productos jsonb, p_metodo_pago text, p_notas text DEFAULT NULL::text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_id_pedido INTEGER;
  v_numero TEXT;
  v_subtotal NUMERIC := 0;
  v_item JSONB;
  v_precio NUMERIC;
  v_stock INTEGER;
BEGIN
  -- Validar stock y calcular subtotal
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    SELECT precio, precio_oferta, stock INTO v_precio, v_precio, v_stock
    FROM productos WHERE id_producto = (v_item->>'id_producto')::INTEGER;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Producto ID % no encontrado', v_item->>'id_producto';
    END IF;

    IF COALESCE(v_stock, 0) < (v_item->>'cantidad')::INTEGER THEN
      RAISE EXCEPTION 'Stock insuficiente para producto ID %: disponible %, solicitado %',
        v_item->>'id_producto', v_stock, (v_item->>'cantidad')::INTEGER;
    END IF;

    v_subtotal := v_subtotal + (v_precio * (v_item->>'cantidad')::INTEGER);
  END LOOP;

  -- Generar número de pedido
  v_numero := 'MOCHI-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || floor(random() * 9000 + 1000)::TEXT;

  -- Insertar pedido
  INSERT INTO pedidos (id_usuario, id_direccion, numero_pedido, subtotal, total, metodo_pago, notas_especiales, creado_por)
  VALUES (p_id_usuario, p_id_direccion, v_numero, v_subtotal, v_subtotal, p_metodo_pago, p_notas, 'web')
  RETURNING id_pedido INTO v_id_pedido;

  -- Insertar detalles y descontar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    SELECT precio, precio_oferta INTO v_precio
    FROM productos WHERE id_producto = (v_item->>'id_producto')::INTEGER;

    INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal, origen)
    VALUES (
      v_id_pedido,
      (v_item->>'id_producto')::INTEGER,
      (v_item->>'cantidad')::INTEGER,
      v_precio,
      v_precio * (v_item->>'cantidad')::INTEGER,
      'online'
    );

    UPDATE productos
    SET stock = stock - (v_item->>'cantidad')::INTEGER,
        updated_at = NOW()
    WHERE id_producto = (v_item->>'id_producto')::INTEGER;
  END LOOP;

  RETURN v_id_pedido;
END;
$function$;

-- RPC: crear_pedido_con_stock (versión SECURITY INVOKER - alternativa)
CREATE OR REPLACE FUNCTION public.crear_pedido_con_stock(p_id_usuario uuid, p_id_direccion integer, p_productos jsonb, p_metodo_pago character varying, p_notas text DEFAULT NULL::text)
RETURNS integer
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_id_pedido INTEGER;
  v_stock_ok BOOLEAN;
  v_item JSONB;
  v_precio NUMERIC;
BEGIN
  -- 1. Validar stock
  SELECT BOOL_AND(suficiente) INTO v_stock_ok
  FROM validar_stock_pedido(p_productos);
  
  IF NOT v_stock_ok THEN
    RAISE EXCEPTION 'Stock insuficiente para uno o más productos';
  END IF;
  
  -- 2. Crear pedido
  INSERT INTO pedidos (
    id_usuario, id_direccion, metodo_pago, notas_especiales, estado
  ) VALUES (
    p_id_usuario, p_id_direccion, p_metodo_pago, p_notas, 'pendiente'
  ) RETURNING id_pedido INTO v_id_pedido;
  
  -- 3. Insertar detalles y actualizar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_productos)
  LOOP
    -- Obtener precio del producto
    SELECT precio INTO v_precio
    FROM productos
    WHERE id_producto = (v_item->>'id_producto')::INTEGER;
    
    -- Insertar detalle
    INSERT INTO detalle_pedido (
      id_pedido, id_producto, cantidad, precio_unitario, subtotal
    ) VALUES (
      v_id_pedido,
      (v_item->>'id_producto')::INTEGER,
      (v_item->>'cantidad')::INTEGER,
      v_precio,
      v_precio * (v_item->>'cantidad')::INTEGER
    );
    
    -- Actualizar stock
    UPDATE inventario 
    SET stock_actual = stock_actual - (v_item->>'cantidad')::INTEGER,
        ultima_actualizacion = NOW()
    WHERE id_producto = (v_item->>'id_producto')::INTEGER;
  END LOOP;
  
  RETURN v_id_pedido;
END;
$function$;

-- RPC: obtener_direcciones_usuario
CREATE OR REPLACE FUNCTION public.obtener_direcciones_usuario(usuario_id uuid)
RETURNS TABLE(id_direccion integer, alias character varying, direccion_completa character varying, barrio character varying, ciudad character varying, departamento character varying, predeterminada boolean)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    d.id_direccion,
    d.alias,
    d.direccion_completa,
    d.barrio,
    d.ciudad,
    d.departamento,
    d.predeterminada
  FROM direcciones d
  WHERE d.id_usuario = usuario_id
  ORDER BY d.predeterminada DESC, d.created_at DESC;
END;
$function$;

-- RPC: obtener_direccion_predeterminada
CREATE OR REPLACE FUNCTION public.obtener_direccion_predeterminada(usuario_id uuid)
RETURNS TABLE(id_direccion integer, alias character varying, direccion_completa character varying, barrio character varying, ciudad character varying, departamento character varying, codigo_postal character varying, instrucciones_entrega text)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    d.id_direccion,
    d.alias,
    d.direccion_completa,
    d.barrio,
    d.ciudad,
    d.departamento,
    d.codigo_postal,
    d.instrucciones_entrega
  FROM direcciones d
  WHERE d.id_usuario = usuario_id 
    AND d.predeterminada = true
  LIMIT 1;
END;
$function$;

-- RPC: generate_compra_local_number (trigger legacy)
CREATE OR REPLACE FUNCTION public.generate_compra_local_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    NEW.numero_compra := 'LOCAL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD((SELECT COUNT(*) + 1 FROM public.compras_locales)::TEXT, 6, '0');
    RETURN NEW;
END;
$function$;

-- ============================================================
-- PARTE 8: STORAGE
-- ============================================================

-- Bucket: product-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT TO public
  USING ((bucket_id = 'product-images'::text));

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK ((bucket_id = 'product-images'::text));

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE TO authenticated
  USING ((bucket_id = 'product-images'::text))
  WITH CHECK ((bucket_id = 'product-images'::text));

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE TO authenticated
  USING ((bucket_id = 'product-images'::text));

-- ============================================================
-- PARTE 9: DATOS INICIALES
-- ============================================================

-- Categorías
INSERT INTO public.categorias (id_categoria, nombre, descripcion, imagen, activa) VALUES
(1, 'Mochi Tradicional', 'Pasteles de arroz suaves elaborados al estilo artesanal japonés', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', true),
(2, 'Daifuku Relleno', 'Mochi suave rebozado en fécula y relleno de frutas frescas o crema', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', true),
(3, 'Taiyaki Artesanal', 'Pastel japonés caliente en forma de pez dorada con variados rellenos', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', true),
(4, 'Castella & Postres', 'Bizcochos esponjosos japoneses de miel y delicados postres de autor', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80', true),
(5, 'Bebidas & Matcha', 'Auténtico té matcha Uji ceremonial y lattes fríos cremosos', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', true);

-- Resetear secuencia de categorías
SELECT setval('public.categorias_id_categoria_seq', 5, true);

-- Productos
INSERT INTO public.productos (id_producto, id_categoria, nombre_japones, nombre_espanol, descripcion_corta, descripcion_completa, ingredientes, precio, precio_oferta, imagen_principal, galeria_imagenes, disponible, destacado, stock, stock_minimo, stock_maximo) VALUES
(1, 1, 'Ichigo Mochi (苺もち)', 'Mochi de Fresa Fresca', 'Arroz mochi ultra suave envuelto en anko artesanal con fresa natural entera.', 'Un clásico de la repostería de Kioto. Un bocado celestial donde la dulzura del anko (pasta de frijoles azuki) abraza la frescura dulce y ácida de una fresa entera de cultivo local.', '["Fresa fresca","Harina Mochiko","Anko artesanal (Azuki)","Azúcar glass","Fécula de maíz"]', 8500.00, 7500.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"]', true, true, 25, 10, 200),
(2, 1, 'Matcha Uji Mochi (宇治抹茶もち)', 'Mochi de Matcha Ceremonial', 'Infundido con puro té verde matcha de Uji, Kioto y centro cremoso.', 'Elaborado con polvo de matcha importado de grado ceremonial de la región de Uji.', '["Matcha Uji Grado Ceremonial","Masa Mochiko","Crema de leche vegetal","Azúcar orgánico"]', 9500.00, NULL, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80"]', true, true, 18, 10, 200),
(3, 2, 'Strawberry Daifuku (ストロベリー大福)', 'Daifuku Supremo de Fresa & Mascarpone', 'Daifuku suave relleno de mascarpone italiano y fresa jugosa.', 'Una fusión moderna que conquista paladares.', '["Fresa natural","Mochiko refinado","Queso Mascarpone","Mantequilla blanca","Azúcar refinada"]', 12000.00, 10500.00, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"]', true, true, 15, 10, 200),
(4, 3, 'Taiyaki Custard (たい焼き カスタード)', 'Taiyaki Caliente de Crema Pastelera Vanilla', 'Waffle pez crujiente por fuera y caliente relleno de crema suave de vainilla.', 'Servido tibio. Un emblemático snack callejero de Tokio.', '["Harina especial de waffle","Crema pastelera casera","Vainilla natural","Mantequilla refinada"]', 11000.00, NULL, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80"]', true, false, 20, 10, 200),
(5, 4, 'Honey Castella Cake (カステラ)', 'Bizcocho Esponjoso Castella de Miel Orgánica', 'Pastel tradicional esponjoso de Nagasaki horneado con miel purificada.', 'Origen portugués adaptado en Nagasaki durante el siglo XVI.', '["Huevos frescos","Harina de trigo blanda","Miel pura de abejas","Azúcar granulada Zarame"]', 14000.00, NULL, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80', '["https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"]', true, false, 12, 10, 200),
(16, 1, 'Morashi', 'Postre de Mora', 'La intensidad de la mora se transforma en un postre delicado, fresco y seductor. Un equilibrio perfecto entre dulzura y ese toque ligeramente ácido que despierta el paladar.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 14000.00, NULL, '..', '["https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"]', true, false, 50, 30, 200),
(17, 1, 'Kokoyashi', 'Postre de coco', 'Suave, cremoso y delicadamente tropical. Kokoyashi captura la esencia del coco en una creación ligera y envolvente, perfecta para quienes disfrutan de sabores sutiles y elegantes.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 14500.00, NULL, '..', '["https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"]', true, false, 45, 30, 200),
(18, 1, 'Kuro', 'Postre de galleta oreo', 'La intensidad de la galleta Oreo se encuentra con una textura cremosa y deliciosa. Kuro es una combinación irresistible para los amantes del chocolate y ese inconfundible sabor a galleta.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 14000.00, NULL, '..', '[".."]', true, false, 50, 30, 200),
(19, 1, 'Marakú ', 'Postre de maracuyá', 'Una creación fresca y vibrante donde el carácter exótico del maracuyá se convierte en una experiencia delicada y equilibrada. Su toque ácido despierta el paladar y deja un sabor inolvidable.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 14000.00, NULL, '...', '["..."]', true, false, 50, 30, 200),
(20, 1, 'Amaí ', ' Postre de arequipe', 'La suavidad del arequipe protagoniza esta creación cremosa, dulce y reconfortante. Amaí está pensado para quienes disfrutan de los sabores clásicos llevados a una presentación más delicada y especial.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 13500.00, NULL, 'https://drive.google.com/thumbnail?id=1LKFxdWRJkqN3l9SOFbuokQVH0rgaonyy&sz=w1200', '[".."]', true, false, 50, 30, 200),
(21, 1, 'Kiwiyuzu ', ' Postre de kiwi', 'Fresco, ligero y lleno de personalidad. Kiwiyuzu combina la esencia del kiwi con una propuesta delicada que sorprende desde el primer bocado.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 16500.00, NULL, '...', '["..."]', true, false, 50, 30, 200),
(22, 1, 'Sakura ', 'Postre de cereza', 'Delicado, elegante y encantador. Sakura lleva el sabor de la cereza a una creación suave y especial, inspirada en la belleza de los pequeños detalles.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 13500.00, NULL, 'https://drive.google.com/thumbnail?id=1ibALzyrCOYGMSyoUOxycuI1eVg8m2dF2&sz=w1200', '[".."]', true, false, 50, 30, 200),
(23, 1, 'Dakuro ', 'Postre de durazno', 'La dulzura y frescura del durazno se encuentran en una textura suave y deliciosa. Dakuro es una creación delicada, frutal y perfecta para disfrutar sin prisa.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 15000.00, NULL, 'https://drive.google.com/uc?export=view&id=1LKFxdWRJkqN3l9SOFbuokQVH0rgaonyy', '[".."]', true, false, 50, 30, 200),
(24, 1, 'Fuji', 'Postre de tres leches', 'Un clásico que se viste de elegancia. Fuji combina la suavidad de un delicioso tres leches con una textura húmeda, cremosa y envolvente que convierte cada cucharada en puro placer.', 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.', '["Arroz Mochiko","Azúcar refinada"]', 15500.00, NULL, 'https://iakkcxsjhuiaykyajbca.supabase.co/storage/v1/object/public/product-images/products/1787447229590-5idxl5.webp', '[".."]', true, false, 30, 60, 220);

-- Resetear secuencia de productos
SELECT setval('public.productos_id_producto_seq', 24, true);

-- Usuarios (solo los que existen en auth.users - se crean via registro)
-- NOTA: Los usuarios se crean automáticamente via trigger handle_new_user
-- al registrarse. Los IDs deben coincidir con auth.users existentes.
-- Si necesitas recrearlos, ejecuta esto DESPUÉS de que los usuarios se registren:

/*
INSERT INTO public.usuarios (id, nombre_completo, email, telefono, rol, activo) VALUES
('2efe03c8-4a67-4fe0-a913-be7630e37460', 'Felipe Verano', 'admin@mochishop.co', '+57 300 123 4567', 'admin', true),
('29ebd11b-85f0-484b-8344-aded59f70dc4', 'Neider Gómez', 'neider@mochishop.co', '+57 310 555 8899', 'empleado', true),
('526f3c12-d620-41b0-ab88-c5a893064d9b', 'Michel Sommelier', 'michel@mochishop.co', '+57 314 777 2211', 'empleado', true),
('3dff166b-3150-4311-b291-3ebd58fc8398', 'María Fernanda López', 'cliente@ejemplo.com', '+57 300 456 7890', 'cliente', true),
('c7f0c34c-e603-4532-b021-ab792687ddda', 'Felipe González Verano', 'veranofelipe28@gmail.com', '3105159472', 'cliente', true),
('60d43beb-e5b1-4a1f-96ba-13b6f7e8d232', 'Michel Gonzalez', 'mdymi28@gmail.com', '3026491141', 'cliente', true);
*/

-- Direcciones
INSERT INTO public.direcciones (id_direccion, id_usuario, alias, direccion_completa, barrio, ciudad, departamento, instrucciones_entrega, predeterminada) VALUES
(1, '3dff166b-3150-4311-b291-3ebd58fc8398', NULL, 'Calle 12 # 4-30, Barrio Centro, La Dorada', NULL, 'La Dorada', 'Caldas', 'Favor empacar con moño de regalo', true);

-- Resetear secuencia de direcciones
SELECT setval('public.direcciones_id_direccion_seq', 1, true);

-- Pedidos
INSERT INTO public.pedidos (id_pedido, id_usuario, id_direccion, numero_pedido, estado, subtotal, costo_envio, impuestos, total, metodo_pago, notas_especiales, creado_por) VALUES
(10, '3dff166b-3150-4311-b291-3ebd58fc8398', 1, 'MOCHI-2026-000001', 'entregado', 21000.00, 5000.00, 0.00, 26000.00, 'nequi', 'Favor empacar con moño de regalo', 'web');

-- Resetear secuencia de pedidos
SELECT setval('public.pedidos_id_pedido_seq', 10, true);

-- Detalle de pedido
INSERT INTO public.detalle_pedido (id_detalle, id_pedido, id_producto, cantidad, precio_unitario, subtotal, origen) VALUES
(10, 10, 3, 2, 10500.00, 21000.00, 'online');

-- Resetear secuencia de detalle_pedido
SELECT setval('public.detalle_pedido_id_detalle_seq', 10, true);

-- Favoritos
INSERT INTO public.favoritos (id_favorito, id_usuario, id_producto) VALUES
(10, 'c7f0c34c-e603-4532-b021-ab792687ddda', 1),
(14, '3dff166b-3150-4311-b291-3ebd58fc8398', 2);

-- Resetear secuencia de favoritos
SELECT setval('public.favoritos_id_favorito_seq', 14, true);

-- Reseñas
INSERT INTO public.resenas (id_resena, id_usuario, id_producto, calificacion, comentario, aprobado) VALUES
(1, '3dff166b-3150-4311-b291-3ebd58fc8398', 1, 5, '¡Increíbles! Los mochi de fresa son súper suaves y el toque de anko es idéntico al que probé en mi viaje a Kioto. Repetiré 100%.', true),
(2, '3dff166b-3150-4311-b291-3ebd58fc8398', 2, 5, 'El mejor mochi de matcha que he probado en Colombia. La presentación es hermosísima.', true),
(3, '3dff166b-3150-4311-b291-3ebd58fc8398', 3, 5, 'Presentación hermosa y sabor único con el mascarpone. Un detalle perfecto para regalar.', true),
(4, '3dff166b-3150-4311-b291-3ebd58fc8398', 3, 5, 'Muy bueno', true);

-- Resetear secuencia de resenas
SELECT setval('public.resenas_id_resena_seq', 5, true);

-- Blog
INSERT INTO public.blog (id_articulo, id_autor, titulo, slug, resumen, contenido, imagen_principal, categoria, estado, fecha_publicacion) VALUES
(1, '2efe03c8-4a67-4fe0-a913-be7630e37460', '¿Qué es el Mochi? Historia y Tradición Japonesa', 'que-es-el-mochi-historia-y-tradicion', 'Descubre el milenario origen del pastel de arroz japonés.', 'El Mochi (餅) es un pastel de arroz japonés hecho de mochigome, un grano de arroz glutinoso de grano corto que se tritura hasta obtener una masa pegajosa y elástica.\n\nOriginario del período Jōmon de Japón (hace más de 2,000 años), el mochi era considerado un alimento sagrado que los dioses ofrecían al Emperador en el Año Nuevo. La tradición de "mochitsuki" (餅つき) consiste en golpear la masa de arroz con un mazo de madera llamado "kine" sobre un mortero de piedra "usu". Este ritual se realiza cada diciembre en familias y comunidades de todo Japón.\n\nEn la cultura japonesa, el mochi simboliza la prosperidad, la longevidad y la buena fortuna. Su textura suave y delicada representa la gentileza del espíritu japonés. Hoy en día, el mochi se ha convertido en un postre artesanal que trasciende fronteras, combinando la tradición milenaria con sabores modernos como matcha, fresa, mango y chocolate.\n\nEn Mochi. La Dorada, honramos esta tradición preparando cada pieza artesanalmente, usando ingredientes importados de Japón y técnicas que respeta la autenticidad del proceso ancestral.', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', 'Cultura & Tradición', 'publicado', '2026-07-28 00:00:00+00'),
(2, '2efe03c8-4a67-4fe0-a913-be7630e37460', '5 Beneficios Sorprendentes del Té Matcha Ceremonial', '5-beneficios-del-matcha-ceremonial-de-uji', 'El superalimento japonés cargado de antioxidantes.', 'A diferencia del té verde convencional, con el Matcha consumes la hoja completa. Esto significa que obtienes 137 veces más antioxidantes que en una taza de té verde tradicional.\n\nEl Matcha ceremonial es el de mayor calidad, cultivado bajo sombra durante 20 días antes de la cosecha. Este proceso aumenta la clorofila y los aminoácidos, dando al té su característico color verde brillante y su sabor umami suave.\n\nBeneficios comprobados del Matcha:\n\n1. Rica fuente de antioxidantes (EGCG): Protege las células contra el daño oxidativo y reduce el riesgo de enfermedades crónicas.\n\n2. Mejora la concentración: Contiene L-teanina, un aminoácido que promueve la calma mental sin causar somnolencia. La combinación con cafeína ofrece un estado de alerta tranquilo.\n\n3. Acelera el metabolismo: Los catequinas del Matcha ayudan a quemar calorías hasta un 4 veces más rápido que el té verde normal.\n\n4. Desintoxicación natural: La clorofila ayuda a eliminar metales pesados y toxinas del organismo.\n\n5. Beneficios para la piel: Los antioxidantes combaten el envejecimiento prematuro y mejoran la textura de la piel.\n\nEn Mochi. La Dorada, utilizamos Matcha Uji ceremonial importado directamente de la prefectura de Kyoto, garantizando la máxima calidad y autenticidad en cada postre que preparamos.', 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80', 'Salud & Bienestar', 'publicado', '2026-08-02 00:00:00+00'),
(3, '2efe03c8-4a67-4fe0-a913-be7630e37460', 'La Historia del Taiyaki: El Antojo Caliente de Tokio', 'la-historia-del-taiyaki-el-pez-dorado-japones', '¿Por qué este popular pastelito japonés tiene forma de pez dorada?', 'El Taiyaki (たい焼き) es un pastel japonés en forma de pez, relleno tradicionalmente de "anko" (pasta de frijoles rojos dulces). Su nombre significa literalmente "pancake de pargo", aunque su forma recuerda al pargo o "tai", que en la cultura japonesa simboliza la buena fortuna.\n\nLa historia del Taiyaki comenzó en 1909 en Tokio, cuando la tienda "Naniwaya Sōhonten" creó esta deliciosa fusión de texturas. Originalmente, la forma de pez se usaba para los "taiyaki" (pastelitos de pescado), pero la gente empezó a rellenarlos con pasta de frijoles rojos, creando un snack que rápidamente se volvió icónico.\n\nEl proceso de elaboración es fascinante: se vierte una masa de harina, azúcar y huevos en un molde de hierro fundido con forma de pez, se agrega el relleno y se cocina a fuego lento hasta obtener un exterior crujiente y un interior suave.\n\nHoy en día, el Taiyaki ha evolucionado con rellenos modernos como crema pastelera, Nutella, queso crema, matcha y frutas frescas. En Japón, se encuentra en practically every corner store during the winter months, served hot and fresh.\n\nEn Mochi. La Dorada, honramos esta tradición offering our own artisanal version with premium fillings, combining the authentic Japanese technique with Colombian flavors.', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', 'Recetas & Curiosidades', 'publicado', '2026-08-05 00:00:00+00');

-- Resetear secuencia de blog
SELECT setval('public.blog_id_articulo_seq', 3, true);

-- Cupones de descuento
INSERT INTO public.cupones_descuento (id_cupon, codigo, descripcion, tipo_descuento, valor_descuento, monto_minimo_compra, fecha_inicio, fecha_fin, usos_realizados, activo) VALUES
(1, 'MOCHI10', '10% de descuento en tu primer pedido', 'porcentaje', 10.00, 15000.00, '2026-01-01 00:00:00+00', '2026-12-31 00:00:00+00', 0, true),
(2, 'MATCHA15', '15% de descuento especial en categoría Matcha', 'porcentaje', 15.00, 20000.00, '2026-01-01 00:00:00+00', '2026-12-31 00:00:00+00', 0, true),
(3, 'ENVIOGRATIS', 'Envío gratis a todo La Dorada', 'monto_fijo', 0.00, 25000.00, '2026-01-01 00:00:00+00', '2026-12-31 00:00:00+00', 0, true);

-- Resetear secuencia de cupones
SELECT setval('public.cupones_descuento_id_cupon_seq', 3, true);

-- Carrito de compras (datos de ejemplo)
INSERT INTO public.carrito_compras (id_carrito, id_usuario, id_producto, cantidad) VALUES
(5, '2efe03c8-4a67-4fe0-a913-be7630e37460', 1, 3),
(15, '29ebd11b-85f0-484b-8344-aded59f70dc4', 2, 2),
(16, '29ebd11b-85f0-484b-8344-aded59f70dc4', 1, 1),
(59, '29ebd11b-85f0-484b-8344-aded59f70dc4', 19, 1),
(61, '60d43beb-e5b1-4a1f-96ba-13b6f7e8d232', 2, 1);

-- Resetear secuencia de carrito
SELECT setval('public.carrito_compras_id_carrito_seq', 64, true);

-- ============================================================
-- PARTE 10: VERIFICACIÓN
-- ============================================================

-- Verificar tablas creadas
DO $$
DECLARE
  t RECORD;
BEGIN
  RAント '=== VERIFICACIÓN DE TABLAS ===';
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  LOOP
    RAISE NOTICE 'Tabla: %', t.tablename;
  END LOOP;
END $$;

-- Verificar funciones creadas
DO $$
DECLARE
  f RECORD;
BEGIN
  RAISE NOTICE '=== VERIFICACIÓN DE FUNCIONES ===';
  FOR f IN SELECT proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.prokind = 'f' ORDER BY proname
  LOOP
    RAISE NOTICE 'Función: %', f.proname;
  END LOOP;
END $$;

-- ============================================================
-- FIN DEL BACKUP
-- ============================================================
