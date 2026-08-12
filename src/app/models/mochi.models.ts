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
