import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, Category, Coupon, Review, BlogPost, VisualConfig, Order, POSSale, DetallePedido } from '../models/mochi.models';
import { SupabaseService } from './supabase.service';
import { supabase } from '../supabase';

const DEFAULT_CONFIG: VisualConfig = {
  heroTitulo: 'Descubre la magia del auténtico Mochi Japonés en La Dorada',
  heroSubtitulo: 'Postres artesanales elaborados con ingredientes premium, recetas tradicionales de Kioto y presentación de lujo.',
  bannerPromocional: '🌸 ¡Envío GRATIS en compras superiores a $30.000 COP en La Dorada! Usa el cupón MOCHI10',
  mostrarBanner: true,
  telefonoWhatsApp: '+573001234567',
  direccionLocal: 'Calle 10 # 5-20, Centro, La Dorada, Caldas',
  horarioAtencion: 'Lunes a Domingo: 11:00 AM - 9:00 PM',
  costoEnvioBase: 5000,
  montoEnvioGratis: 30000,
  colorPrimarioHex: '#f472b6'
};

@Injectable({
  providedIn: 'root'
})
export class MochiDataService {
  readonly supabaseService = inject(SupabaseService);

  readonly categories = signal<Category[]>([]);
  readonly products = signal<Product[]>([]);
  readonly coupons = signal<Coupon[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly blogPosts = signal<BlogPost[]>([]);
  readonly visualConfig = signal<VisualConfig>(DEFAULT_CONFIG);
  readonly orders = signal<Order[]>([]);
  readonly posSales = signal<POSSale[]>([]);
  readonly detallePedidos = signal<DetallePedido[]>([]);
  readonly favorites = signal<number[]>([]);

  readonly activeProducts = computed(() => this.products().filter(p => p.disponible));
  readonly featuredProducts = computed(() => this.products().filter(p => p.destacado && p.disponible));
  readonly detallePedidosOnline = computed(() => this.detallePedidos().filter(d => d.origen === 'online'));
  readonly detallePedidosLocal = computed(() => this.detallePedidos().filter(d => d.origen === 'local'));

  // --- DATA LOADING FROM SUPABASE ---

  async loadAllFromSupabase(): Promise<void> {
    const [catsRes, prodsRes, cupsRes, revsRes, blogsRes] = await Promise.all([
      supabase.from('categorias').select('*'),
      supabase.from('productos').select('*'),
      supabase.from('cupones_descuento').select('*'),
      supabase.from('resenas').select('*'),
      supabase.from('blog').select('*')
    ]);

    if (catsRes.data) {
      this.categories.set(catsRes.data.map((c: Record<string, unknown>) => ({
        id: c['id_categoria'] as number,
        nombre: c['nombre'] as string,
        descripcion: c['descripcion'] as string || '',
        imagen: c['imagen'] as string || '',
        activa: c['activa'] as boolean,
        icono: ''
      })));
    }

    if (prodsRes.data) {
      this.products.set(prodsRes.data.map((p: Record<string, unknown>) => ({
        id: p['id_producto'] as number,
        id_categoria: p['id_categoria'] as number,
        nombre_japones: p['nombre_japones'] as string || '',
        nombre_espanol: p['nombre_espanol'] as string,
        descripcion_corta: p['descripcion_corta'] as string || '',
        descripcion_completa: p['descripcion_completa'] as string || '',
        ingredientes: typeof p['ingredientes'] === 'string' ? JSON.parse(p['ingredientes'] as string) : (p['ingredientes'] as string[]) || [],
        precio: Number(p['precio']),
        precio_oferta: p['precio_oferta'] ? Number(p['precio_oferta']) : undefined,
        imagen_principal: p['imagen_principal'] as string || '',
        galeria_imagenes: typeof p['galeria_imagenes'] === 'string' ? JSON.parse(p['galeria_imagenes'] as string) : (p['galeria_imagenes'] as string[]) || [],
        disponible: p['disponible'] as boolean,
        destacado: p['destacado'] as boolean,
        stock: p['stock'] as number || 0,
        calificacion: 0,
        num_resenas: 0,
        calorias: p['calorias'] as number | undefined
      })));
    }

    if (cupsRes.data) {
      this.coupons.set(cupsRes.data.map((c: Record<string, unknown>) => ({
        codigo: c['codigo'] as string,
        descripcion: c['descripcion'] as string || '',
        tipo: c['tipo_descuento'] as 'porcentaje' | 'monto_fijo' | 'envio_gratis',
        valor: Number(c['valor_descuento']),
        montoMinimo: Number(c['monto_minimo_compra'] || 0),
        activo: c['activo'] as boolean
      })));
    }

    if (revsRes.data) {
      this.reviews.set(revsRes.data.map((r: Record<string, unknown>) => ({
        id: r['id_resena'] as number,
        productoId: r['id_producto'] as number,
        nombreCliente: '',
        comentario: r['comentario'] as string || '',
        calificacion: r['calificacion'] as number,
        fecha: r['created_at'] as string || '',
        aprobado: r['aprobado'] as boolean
      })));
    }

    if (blogsRes.data) {
      this.blogPosts.set(blogsRes.data.map((b: Record<string, unknown>) => ({
        id: b['id_articulo'] as number,
        slug: b['slug'] as string,
        titulo: b['titulo'] as string,
        resumen: b['resumen'] as string || '',
        contenido: b['contenido'] as string || '',
        autor: '',
        fecha: b['fecha_publicacion'] as string || '',
        imagen: b['imagen_principal'] as string || '',
        categoria: b['categoria'] as string || '',
        tiempoLectura: Math.ceil(((b['contenido'] as string) || '').length / 1000) + ' min'
      })));
    }

    // Cargar calificaciones de productos desde resenas
    this.updateProductRatings();
  }

  private updateProductRatings() {
    const revs = this.reviews();
    const updated = this.products().map(p => {
      const productReviews = revs.filter(r => r.productoId === p.id && r.aprobado);
      const avg = productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.calificacion, 0) / productReviews.length
        : 0;
      return { ...p, calificacion: Math.round(avg * 10) / 10, num_resenas: productReviews.length };
    });
    this.products.set(updated);
  }

  // --- Product CRUD ---

  async addProduct(product: Omit<Product, 'id' | 'calificacion' | 'num_resenas'>): Promise<void> {
    const { error } = await supabase.from('productos').insert({
      id_categoria: product.id_categoria,
      nombre_japones: product.nombre_japones,
      nombre_espanol: product.nombre_espanol,
      descripcion_corta: product.descripcion_corta,
      descripcion_completa: product.descripcion_completa,
      ingredientes: JSON.stringify(product.ingredientes),
      precio: product.precio,
      precio_oferta: product.precio_oferta || null,
      imagen_principal: product.imagen_principal,
      galeria_imagenes: JSON.stringify(product.galeria_imagenes),
      disponible: product.disponible,
      destacado: product.destacado,
      stock: product.stock
    });
    if (error) { console.error('Error adding product:', error); return; }
    await this.loadAllFromSupabase();
  }

  async updateProduct(product: Product): Promise<void> {
    const { error } = await supabase.from('productos').update({
      id_categoria: product.id_categoria,
      nombre_japones: product.nombre_japones,
      nombre_espanol: product.nombre_espanol,
      descripcion_corta: product.descripcion_corta,
      descripcion_completa: product.descripcion_completa,
      ingredientes: JSON.stringify(product.ingredientes),
      precio: product.precio,
      precio_oferta: product.precio_oferta || null,
      imagen_principal: product.imagen_principal,
      galeria_imagenes: JSON.stringify(product.galeria_imagenes),
      disponible: product.disponible,
      destacado: product.destacado,
      stock: product.stock,
      updated_at: new Date().toISOString()
    }).eq('id_producto', product.id);
    if (error) { console.error('Error updating product:', error); return; }
    await this.loadAllFromSupabase();
  }

  async deleteProduct(productId: number): Promise<void> {
    const { error } = await supabase.from('productos').delete().eq('id_producto', productId);
    if (error) { console.error('Error deleting product:', error); return; }
    await this.loadAllFromSupabase();
  }

  // --- Favorites ---

  async toggleFavorite(productId: number): Promise<void> {
    const userId = this.supabaseService.activeUser()?.id;
    if (!userId) return;
    const current = this.favorites();
    if (current.includes(productId)) {
      await supabase.from('favoritos').delete().eq('id_usuario', userId).eq('id_producto', productId);
      this.favorites.set(current.filter(id => id !== productId));
    } else {
      await supabase.from('favoritos').insert({ id_usuario: userId, id_producto: productId });
      this.favorites.set([...current, productId]);
    }
  }

  isFavorite(productId: number): boolean {
    return this.favorites().includes(productId);
  }

  async loadFavorites(userId: string): Promise<void> {
    const { data } = await supabase.from('favoritos').select('id_producto').eq('id_usuario', userId);
    if (data) this.favorites.set(data.map((f: Record<string, unknown>) => f['id_producto'] as number));
  }

  // --- Orders ---

  async createOrder(orderData: Omit<Order, 'id' | 'fecha' | 'estado'>): Promise<Order> {
    const { data: pedidoData, error: pedidoErr } = await supabase.from('pedidos').insert({
      id_usuario: orderData.id_usuario,
      id_direccion: orderData.id_direccion,
      numero_pedido: `MOCHI-${Date.now()}`,
      subtotal: orderData.subtotal,
      costo_envio: orderData.costoEnvio,
      impuestos: orderData.descuento,
      total: orderData.total,
      metodo_pago: orderData.metodoPago,
      notas_especiales: orderData.notasEspeciales,
      creado_por: 'web'
    }).select().single();

    if (pedidoErr) { console.error('Error creating order:', pedidoErr); }

    const id_pedido = pedidoData?.['id_pedido'] || Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `MOCHI-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${id_pedido}`,
      id_pedido,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };

    // Insertar detalle del pedido
    if (orderData.items?.length) {
      const detalles = orderData.items.map(item => ({
        id_pedido,
        id_producto: item.productoId,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad,
        origen: 'online' as const
      }));
      await supabase.from('detalle_pedido').insert(detalles);
    }

    this.orders.set([newOrder, ...this.orders()]);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, newStatus: Order['estado']): Promise<void> {
    const idNum = orderId.split('-').pop();
    if (idNum) {
      await supabase.from('pedidos').update({ estado: newStatus, updated_at: new Date().toISOString() }).eq('id_pedido', parseInt(idNum));
    }
    const updated = this.orders().map(o => o.id === orderId ? { ...o, estado: newStatus } : o);
    this.orders.set(updated);
  }

  // --- POS Sales ---

  async recordPOSSale(saleData: Omit<POSSale, 'id' | 'fecha'>): Promise<POSSale> {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const { error } = await supabase.from('compras_locales').insert({
      id_sucursal: saleData.id_sucursal || 1,
      id_empleado: saleData.id_empleado || '',
      numero_compra: `POS-${randNum}`,
      cliente_nombre: saleData.clienteNombre,
      cliente_telefono: saleData.clienteTelefono,
      subtotal: saleData.subtotal,
      total: saleData.total,
      metodo_pago: saleData.metodoPago,
      estado: 'completada'
    });
    if (error) console.error('Error recording POS sale:', error);

    const newSale: POSSale = {
      ...saleData,
      id: `POS-${randNum}`,
      id_compra_local: randNum,
      fecha: new Date().toISOString()
    };
    this.posSales.set([newSale, ...this.posSales()]);
    return newSale;
  }

  // --- Visual Config (hardcoded - solo en memoria) ---

  updateVisualConfig(config: Partial<VisualConfig>) {
    const updated = { ...this.visualConfig(), ...config };
    this.visualConfig.set(updated);
  }

  // --- Reviews ---

  async addReview(review: Omit<Review, 'id' | 'fecha' | 'aprobado'>): Promise<void> {
    const userId = this.supabaseService.activeUser()?.id;
    if (!userId) return;
    const { error } = await supabase.from('resenas').insert({
      id_usuario: userId,
      id_producto: review.productoId,
      calificacion: review.calificacion,
      comentario: review.comentario,
      aprobado: true
    });
    if (error) { console.error('Error adding review:', error); return; }
    await this.loadAllFromSupabase();
  }

  // --- Coupons ---

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const found = this.coupons().find(c => c.codigo.toUpperCase() === code.trim().toUpperCase() && c.activo);
    if (!found) return { valid: false, discount: 0, message: 'Cupón no válido o expirado.' };
    if (subtotal < found.montoMinimo) {
      return { valid: false, discount: 0, message: `El cupón requiere una compra mínima de $${found.montoMinimo.toLocaleString()} COP.` };
    }
    let discount = 0;
    if (found.tipo === 'porcentaje') discount = Math.round((subtotal * found.valor) / 100);
    else if (found.tipo === 'monto_fijo') discount = found.valor;
    else if (found.tipo === 'envio_gratis') discount = this.visualConfig().costoEnvioBase;
    return { valid: true, discount, message: `¡Cupón ${found.codigo} aplicado correctamente!`, coupon: found };
  }
}
