export type UserRole = 'admin' | 'empleado' | 'cliente';

export interface Usuario {
  id: string; // UUID
  nombre_completo: string;
  email: string;
  telefono?: string;
  foto_perfil?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  rol: UserRole;
}

export interface Direccion {
  id_direccion: number;
  id_usuario: string;
  alias?: string;
  direccion_completa: string;
  barrio?: string;
  ciudad: string;
  departamento: string;
  codigo_postal?: string;
  instrucciones_entrega?: string;
  predeterminada: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DetallePedido {
  id_detalle: number;
  id_pedido?: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  origen: 'online' | 'local';
  created_at?: string;
  producto?: {
    nombre_espanol: string;
    nombre_japones?: string;
    imagen_principal?: string;
  };
}

export interface StockValidation {
  id_producto: number;
  stock_disponible: number;
  stock_solicitado: number;
  suficiente: boolean;
}

export interface StockCheckItem {
  id_producto: number;
  cantidad: number;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  activa: boolean;
  icono: string;
}

export interface Product {
  id: number;
  id_categoria: number;
  nombre_japones: string;
  nombre_espanol: string;
  descripcion_corta: string;
  descripcion_completa: string;
  ingredientes: string[];
  precio: number;
  precio_oferta?: number;
  imagen_principal: string;
  galeria_imagenes: string[];
  disponible: boolean;
  destacado: boolean;
  stock: number;
  stock_minimo: number;
  stock_maximo: number;
  calificacion: number;
  num_resenas: number;
  calorias?: number;
}

export interface CartItem {
  product: Product;
  cantidad: number;
  notas?: string;
}

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'en_camino' | 'listo_recogida' | 'entregado' | 'cancelado';
export type PaymentMethodType = 'pse' | 'nequi' | 'daviplata' | 'tarjeta' | 'contraentrega' | 'transferencia';

export interface Order {
  id: string; // e.g. MOCHI-2026-8941
  id_pedido?: number;
  id_usuario?: string;
  id_direccion?: number;
  fecha: string;
  cliente: {
    nombre: string;
    email: string;
    telefono: string;
    direccion?: string;
    barrio?: string;
    ciudad: string;
  };
  tipoEntrega: 'domicilio' | 'recogida';
  items: {
    productoId: number;
    nombreJapones: string;
    nombreEspanol: string;
    precio: number;
    cantidad: number;
    imagen: string;
  }[];
  subtotal: number;
  costoEnvio: number;
  descuento: number;
  total: number;
  metodoPago: PaymentMethodType;
  estadoPago: 'aprobado' | 'pendiente' | 'rechazado';
  referenciaPago?: string;
  estado: OrderStatus;
  notasEspeciales?: string;
  tiempoEstimado: string;
  creado_por?: 'web' | 'pos';
  id_empleado_registro?: string;
}

export interface Coupon {
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'monto_fijo' | 'envio_gratis';
  valor: number; // e.g. 10 for 10%
  montoMinimo: number;
  activo: boolean;
}

export interface Review {
  id: number;
  productoId: number;
  nombreCliente: string;
  comentario: string;
  calificacion: number;
  fecha: string;
  aprobado: boolean;
}

export interface BlogPost {
  id: number;
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;
  autor: string;
  fecha: string;
  imagen: string;
  categoria: string;
  tiempoLectura: string;
}

export interface POSSale {
  id: string;
  id_pedido?: number;
  id_empleado?: string;
  fecha: string;
  empleado: string;
  clienteNombre: string;
  clienteTelefono?: string;
  items: {
    productoId: number;
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
  subtotal: number;
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'nequi' | 'daviplata';
}

export interface VisualConfig {
  heroTitulo: string;
  heroSubtitulo: string;
  bannerPromocional: string;
  mostrarBanner: boolean;
  telefonoWhatsApp: string;
  direccionLocal: string;
  horarioAtencion: string;
  costoEnvioBase: number;
  montoEnvioGratis: number;
  colorPrimarioHex: string;
}

