import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, Review, BlogPost, VisualConfig, Order, POSSale, DetallePedido } from '../models/mochi.models';
import { SupabaseService } from './supabase.service';
import { supabase } from '../supabase';

const DEFAULT_CONFIG: VisualConfig = {
  heroTitulo: 'Descubre la magia del auténtico Mochi Japonés en La Dorada',
  heroSubtitulo: 'Postres artesanales elaborados con ingredientes premium, recetas tradicionales de Kioto y presentación de lujo.',
  bannerPromocional: '🌸 ¡Pide tus mochis favoritos y recíbelos en La Dorada y alrededores!',
  mostrarBanner: true,
  telefonoWhatsApp: '+573001234567',
  direccionLocal: 'Calle 10 # 5-20, Centro, La Dorada, Caldas',
  horarioAtencion: 'Lunes a Domingo: 11:00 AM - 9:00 PM',
  colorPrimarioHex: '#f472b6'
};

@Injectable({
  providedIn: 'root'
})
export class MochiDataService {
  readonly supabaseService = inject(SupabaseService);

  readonly products = signal<Product[]>([]);
  readonly reviews = signal<Review[]>([]);
  readonly blogPosts = signal<BlogPost[]>([]);
  readonly visualConfig = signal<VisualConfig>(DEFAULT_CONFIG);
  readonly orders = signal<Order[]>([]);
  readonly posSales = signal<POSSale[]>([]);
  readonly detallePedidos = signal<DetallePedido[]>([]);

  readonly activeProducts = computed(() => this.products().filter(p => p.disponible));
  readonly featuredProducts = computed(() => {
    return [...this.products()]
      .filter(p => p.disponible && p.num_resenas > 0)
      .sort((a, b) => b.calificacion - a.calificacion || b.num_resenas - a.num_resenas)
      .slice(0, 8);
  });
  readonly detallePedidosOnline = computed(() => this.detallePedidos().filter(d => d.origen === 'online'));
  readonly detallePedidosLocal = computed(() => this.detallePedidos().filter(d => d.origen === 'local'));

  // --- STORAGE UPLOAD ---

  async uploadProductImage(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'png';
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data?.publicUrl ?? null;
  }

  // --- DATA LOADING FROM SUPABASE ---

  async loadAllFromSupabase(): Promise<void> {
    const [prodsRes, revsRes, blogsRes] = await Promise.all([
      supabase.from('productos').select('*'),
      supabase.from('resenas').select('*, usuarios:id_usuario(nombre_completo)'),
      supabase.from('blog').select('*')
    ]);

    if (prodsRes.data) {
      this.products.set(prodsRes.data.map((p: Record<string, unknown>) => ({
        id: p['id_producto'] as number,
        nombre_japones: p['nombre_japones'] as string || '',
        nombre_espanol: p['nombre_espanol'] as string,
        descripcion: p['descripcion'] as string || '',
        precio: Number(p['precio']),
        imagen_principal: p['imagen_principal'] as string || '',
        galeria_imagenes: typeof p['galeria_imagenes'] === 'string' ? JSON.parse(p['galeria_imagenes'] as string) : (p['galeria_imagenes'] as string[]) || [],
        disponible: p['disponible'] as boolean,
        stock: p['stock'] as number || 0,
        stock_minimo: p['stock_minimo'] as number || 10,
        stock_maximo: p['stock_maximo'] as number || 500,
        calificacion: 0,
        num_resenas: 0,
        calorias: p['calorias'] as number | undefined
      })));
    }

    if (revsRes.data) {
      this.reviews.set(revsRes.data.map((r: Record<string, unknown>) => {
        const usuario = r['usuarios'] as Record<string, unknown> | null;
        return {
          id: r['id_resena'] as number,
          productoId: r['id_producto'] as number,
          nombreCliente: (usuario?.['nombre_completo'] as string) || 'Cliente',
          comentario: r['comentario'] as string || '',
          calificacion: r['calificacion'] as number,
          fecha: r['created_at'] as string || '',
          aprobado: r['aprobado'] as boolean
        };
      }));
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

    this.updateProductRatings();
    await this.loadOrders();
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

  async addProduct(product: Omit<Product, 'id' | 'calificacion' | 'num_resenas'>): Promise<number | null> {
    const { data, error } = await supabase.from('productos').insert({
      nombre_japones: product.nombre_japones,
      nombre_espanol: product.nombre_espanol,
      descripcion: product.descripcion,
      precio: product.precio,
      imagen_principal: product.imagen_principal,
      galeria_imagenes: JSON.stringify(product.galeria_imagenes),
      disponible: product.disponible,
      stock: product.stock,
      stock_minimo: product.stock_minimo || 10,
      stock_maximo: product.stock_maximo || 500
    }).select('id_producto').single();
    if (error) { console.error('Error adding product:', error); return null; }
    await this.loadAllFromSupabase();
    return data?.id_producto ?? null;
  }

  async updateProduct(product: Product): Promise<void> {
    const { error } = await supabase.from('productos').update({
      nombre_japones: product.nombre_japones,
      nombre_espanol: product.nombre_espanol,
      descripcion: product.descripcion,
      precio: product.precio,
      imagen_principal: product.imagen_principal,
      galeria_imagenes: JSON.stringify(product.galeria_imagenes),
      disponible: product.disponible,
      stock: product.stock,
      stock_minimo: product.stock_minimo || 10,
      stock_maximo: product.stock_maximo || 500,
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

  // --- Orders ---

  async loadOrders(): Promise<void> {
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('*, usuarios:id_usuario(nombre_completo, email, telefono), direcciones:id_direccion(direccion_completa, barrio, ciudad)')
      .order('created_at', { ascending: false });

    if (error) { console.error('Error loading orders:', error); return; }
    if (!pedidos) return;

    const { data: detalles } = await supabase.from('detalle_pedido').select('*');
    const { data: productos } = await supabase.from('productos').select('id_producto, nombre_japones, nombre_espanol, imagen_principal');

    const prodMap = new Map<number, Record<string, unknown>>();
    if (productos) productos.forEach(p => prodMap.set(p['id_producto'] as number, p));

    const detallesMap = new Map<number, Record<string, unknown>[]>();
    if (detalles) {
      detalles.forEach(d => {
        const pid = d['id_pedido'] as number;
        if (!detallesMap.has(pid)) detallesMap.set(pid, []);
        detallesMap.get(pid)!.push(d);
      });
    }

    const orders: Order[] = pedidos.map((p: Record<string, unknown>) => {
      const usuario = p['usuarios'] as Record<string, unknown> | null;
      const direccion = p['direcciones'] as Record<string, unknown> | null;
      const orderDetalles = detallesMap.get(p['id_pedido'] as number) || [];

      return {
        id: p['numero_pedido'] as string,
        id_pedido: p['id_pedido'] as number,
        id_usuario: p['id_usuario'] as string,
        id_direccion: p['id_direccion'] as number | undefined,
        fecha: p['created_at'] as string,
        cliente: {
          nombre: (usuario?.['nombre_completo'] as string) || 'Cliente',
          email: (usuario?.['email'] as string) || '',
          telefono: (usuario?.['telefono'] as string) || '',
          direccion: (direccion?.['direccion_completa'] as string) || '',
          barrio: (direccion?.['barrio'] as string) || '',
          ciudad: (direccion?.['ciudad'] as string) || 'La Dorada'
        },
        tipoEntrega: 'domicilio' as const,
        items: orderDetalles.map((d: Record<string, unknown>) => {
          const prod = prodMap.get(d['id_producto'] as number);
          return {
            productoId: d['id_producto'] as number,
            nombreJapones: (prod?.['nombre_japones'] as string) || '',
            nombreEspanol: (prod?.['nombre_espanol'] as string) || '',
            precio: Number(d['precio_unitario']),
            cantidad: d['cantidad'] as number,
            imagen: (prod?.['imagen_principal'] as string) || ''
          };
        }),
        subtotal: Number(p['subtotal']),
        costoEnvio: Number(p['costo_envio'] || 0),
        descuento: Number(p['impuestos'] || 0),
        total: Number(p['total']),
        metodoPago: (p['metodo_pago'] as Order['metodoPago']) || 'contraentrega',
        estadoPago: 'aprobado' as const,
        estado: (p['estado'] as Order['estado']) || 'pendiente',
        notasEspeciales: (p['notas_especiales'] as string) || '',
        tiempoEstimado: '45 - 60 minutos',
        creado_por: (p['creado_por'] as 'web' | 'pos') || 'web'
      };
    });

    this.orders.set(orders);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'fecha' | 'estado'>, rpcOrderId?: number): Promise<Order> {
    let id_pedido = rpcOrderId;

    if (!id_pedido) {
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

      id_pedido = pedidoData?.['id_pedido'] || Math.floor(1000 + Math.random() * 9000);

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
    }

    const newOrder: Order = {
      ...orderData,
      id: `MOCHI-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${id_pedido}`,
      id_pedido,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };

    this.orders.set([newOrder, ...this.orders()]);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, newStatus: Order['estado'], idPedido?: number): Promise<void> {
    if (idPedido) {
      const { error } = await supabase
        .from('pedidos')
        .update({ estado: newStatus, updated_at: new Date().toISOString() })
        .eq('id_pedido', idPedido);
      if (error) {
        console.error('Error updating order status:', error);
        return;
      }
    }
    await this.loadOrders();
  }

  // --- POS Sales ---

  async recordPOSSale(saleData: Omit<POSSale, 'id' | 'fecha'>): Promise<POSSale> {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const { error } = await supabase.from('pedidos').insert({
      id_empleado_registro: saleData.id_empleado || '',
      numero_pedido: `POS-${randNum}`,
      subtotal: saleData.subtotal,
      total: saleData.total,
      metodo_pago: saleData.metodoPago,
      estado: 'entregado',
      creado_por: 'local'
    });
    if (error) console.error('Error recording POS sale:', error);

    const newSale: POSSale = {
      ...saleData,
      id: `POS-${randNum}`,
      id_pedido: randNum,
      fecha: new Date().toISOString()
    };
    this.posSales.set([newSale, ...this.posSales()]);
    return newSale;
  }

  // --- Visual Config ---

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
}
