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
  nombre_japones: string;
  nombre_espanol: string;
  descripcion: string;
  precio: number;
  imagen_principal: string;
  galeria_imagenes: string[];
  disponible: boolean;
  stock: number;
  stock_minimo: number;
  stock_maximo: number;
  calificacion: number;
  num_resenas: number;
  calorias?: number;
  frase?: string;
}

export interface CartItem {
  product: Product;
  cantidad: number;
  notas?: string;
  frase_personalizada?: string;
  configuracion_capas?: { base: number; crema: number; relleno: number; topping: number } | null;
  customPrice?: number;
  toppings_seleccionados?: { id: string; nombre: string; precio: number }[];
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
  colorPrimarioHex: string;
}

export type DeliveryZone = 'La Dorada' | 'Puerto Salgar' | 'Purnio' | 'Guarinocito' | 'Honda' | 'Victoria';

export const DELIVERY_PRICES: Record<DeliveryZone, number> = {
  'La Dorada': 3000,
  'Puerto Salgar': 3800,
  'Purnio': 4200,
  'Guarinocito': 4800,
  'Honda': 8000,
  'Victoria': 10000
};

export function getDeliveryPrice(zone: DeliveryZone, quantity: number): number {
  const base = DELIVERY_PRICES[zone];
  const trips = quantity > 25 ? 2 : 1;
  return base * trips;
}

export function detectZoneFromAddress(address: string): DeliveryZone {
  const lower = address.toLowerCase();
  if (lower.includes('victoria')) return 'Victoria';
  if (lower.includes('honda')) return 'Honda';
  if (lower.includes('puerto salgar')) return 'Puerto Salgar';
  if (lower.includes('purnio')) return 'Purnio';
  if (lower.includes('guarinocito')) return 'Guarinocito';
  return 'La Dorada';
}

// --- Vaso Personalizado ---
export interface CupLayerOption {
  id: string;
  name: string;
  price: number;
}

export interface CupLayer {
  id: number;
  label: string;
  description: string;
  icon: string;
  options: CupLayerOption[];
}

export interface CustomCupConfig {
  base: CupLayerOption | null;
  crema: CupLayerOption | null;
  relleno: CupLayerOption | null;
  topping: CupLayerOption | null;
}

export interface CustomCup {
  layers: CustomCupConfig;
  total: number;
  cantidad: number;
}

