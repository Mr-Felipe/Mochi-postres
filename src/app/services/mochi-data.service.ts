import { Injectable, signal, computed } from '@angular/core';
import { Product, Category, Coupon, Review, BlogPost, VisualConfig, Order, POSSale } from '../models/mochi.models';

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, nombre: 'Mochi Tradicional', descripcion: 'Pasteles de arroz suaves elaborados al estilo artesanal japonés', imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', activa: true, icono: '🍡' },
  { id: 2, nombre: 'Daifuku Relleno', descripcion: 'Mochi suave rebozado en fécula y relleno de frutas frescas o crema', imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', activa: true, icono: '🥟' },
  { id: 3, nombre: 'Taiyaki Artesanal', descripcion: 'Pastel japonés caliente en forma de pez dorada con variados rellenos', imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', activa: true, icono: '🐟' },
  { id: 4, nombre: 'Castella & Postres', descripcion: 'Bizcochos esponjosos japoneses de miel y delicados postres de autor', imagen: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80', activa: true, icono: '🍰' },
  { id: 5, nombre: 'Bebidas & Matcha', descripcion: 'Auténtico té matcha Uji ceremonial y lattes fríos cremosos', imagen: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80', activa: true, icono: '🍵' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    id_categoria: 1,
    nombre_japones: 'Ichigo Mochi (苺もち)',
    nombre_espanol: 'Mochi de Fresa Fresca',
    descripcion_corta: 'Arroz mochi ultra suave envuelto en anko artesanal con fresa natural entera.',
    descripcion_completa: 'Un clásico de la repostería de Kioto. Un bocado celestial donde la dulzura del anko (pasta de frijoles azuki) abraza la frescura dulce y ácida de una fresa entera de cultivo local.',
    ingredientes: ['Fresa fresca', 'Harina Mochiko', 'Anko artesanal (Azuki)', 'Azúcar glass', 'Fécula de maíz'],
    precio: 8500,
    precio_oferta: 7500,
    imagen_principal: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: true,
    stock: 25,
    calificacion: 4.9,
    num_resenas: 128,
    calorias: 140
  },
  {
    id: 2,
    id_categoria: 1,
    nombre_japones: 'Matcha Uji Mochi (宇治抹茶もち)',
    nombre_espanol: 'Mochi de Matcha Ceremonial',
    descripcion_corta: 'Infundido con puro té verde matcha de Uji, Kioto y centro cremoso.',
    descripcion_completa: 'Elaborado con polvo de matcha importado de grado ceremonial de la región de Uji. Su vibrante color verde natural y sutil nota terrosa combinan perfectamente con una mousse cremosa blanca.',
    ingredientes: ['Matcha Uji Grado Ceremonial', 'Masa Mochiko', 'Crema de leche vegetal', 'Azúcar orgánico'],
    precio: 9500,
    imagen_principal: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: true,
    stock: 18,
    calificacion: 4.8,
    num_resenas: 96,
    calorias: 155
  },
  {
    id: 3,
    id_categoria: 2,
    nombre_japones: 'Strawberry Daifuku (ストロベリー大福)',
    nombre_espanol: 'Daifuku Supremo de Fresa & Mascarpone',
    descripcion_corta: 'Daifuku suave relleno de mascarpone italiano y fresa jugosa.',
    descripcion_completa: 'Una fusión moderna que conquista paladares. Mochi elástico relleno con una capa sedosa de queso mascarpone artesanal y corazón dulce de fresa silvestre.',
    ingredientes: ['Fresa natural', 'Mochiko refinado', 'Queso Mascarpone', 'Mantequilla blanca', 'Azúcar refinada'],
    precio: 12000,
    precio_oferta: 10500,
    imagen_principal: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: true,
    stock: 15,
    calificacion: 5.0,
    num_resenas: 84,
    calorias: 180
  },
  {
    id: 4,
    id_categoria: 3,
    nombre_japones: 'Taiyaki Custard (たい焼き カスタード)',
    nombre_espanol: 'Taiyaki Caliente de Crema Pastelera Vanilla',
    descripcion_corta: 'Waffle pez crujiente por fuera y caliente relleno de crema suave de vainilla.',
    descripcion_completa: 'Servido tibio. Un emblemático snack callejero de Tokio con masa de waffle suave dorada y un interior generoso de crema pastelera infusionada con vaina de vainilla.',
    ingredientes: ['Harina especial de waffle', 'Crema pastelera casera', 'Vainilla natural', 'Mantequilla refinada'],
    precio: 11000,
    imagen_principal: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: false,
    stock: 20,
    calificacion: 4.7,
    num_resenas: 64,
    calorias: 220
  },
  {
    id: 5,
    id_categoria: 4,
    nombre_japones: 'Honey Castella Cake (カステラ)',
    nombre_espanol: 'Bizcocho Esponjoso Castella de Miel Orgánica',
    descripcion_corta: 'Pastel tradicional esponjoso de Nagasaki horneado con miel purificada.',
    descripcion_completa: 'Origen portugués adaptado en Nagasaki durante el siglo XVI. Su textura húmeda, ligera y esponjosa se logra mediante batido prolongado de huevos sin levadura química.',
    ingredientes: ['Huevos frescos', 'Harina de trigo blanda', 'Miel pura de abejas', 'Azúcar granulada Zarame'],
    precio: 14000,
    imagen_principal: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: false,
    stock: 12,
    calificacion: 4.9,
    num_resenas: 42,
    calorias: 190
  },
  {
    id: 6,
    id_categoria: 5,
    nombre_japones: 'Matcha Latte Iced (アイス抹茶ラテ)',
    nombre_espanol: 'Iced Matcha Latte Artesanal',
    descripcion_corta: 'Bebida helada de Matcha ceremonial con leche fresca batida y espuma.',
    descripcion_completa: 'Matcha de Uji batido tradicionalmente con chasen de bambú, servido sobre hielo crujiente y leche suave. Opción con leche de almendra o entera.',
    ingredientes: ['Matcha Uji', 'Leche entera o vegetal', 'Endulzante de vainilla', 'Hielo artesanal'],
    precio: 10500,
    imagen_principal: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: false,
    stock: 50,
    calificacion: 4.9,
    num_resenas: 110,
    calorias: 130
  },
  {
    id: 7,
    id_categoria: 1,
    nombre_japones: 'Kurogoma Mochi (黒ごまもち)',
    nombre_espanol: 'Mochi de Sésamo Negro Tostado',
    descripcion_corta: 'Pasta aromática de ajonjolí negro tostado artesanalmente.',
    descripcion_completa: 'Un sabor profundo y complejo. Elaborado cocinando semillas de sésamo negro tostado en piedra hasta obtener una pasta aromática con textura untuosa y sutil toque salado dulce.',
    ingredientes: ['Sésamo negro tostado', 'Harina Mochiko', 'Miel pura', 'Sal marina fina'],
    precio: 8500,
    imagen_principal: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: false,
    stock: 22,
    calificacion: 4.8,
    num_resenas: 39,
    calorias: 160
  },
  {
    id: 8,
    id_categoria: 3,
    nombre_japones: 'Taiyaki Nutella & Banana (たい焼き チョコバナナ)',
    nombre_espanol: 'Taiyaki de Chocolate Belga & Banano',
    descripcion_corta: 'Pastel crujiente de pez relleno de crema de chocolate avellana y banano dulce.',
    descripcion_completa: 'Favorito indiscutible de jóvenes y niños. Servido crujiente con centro abundante de chocolate avellana y rodajas de banano maduro.',
    ingredientes: ['Harina especial', 'Crema de avellana y cacao', 'Banano fresco', 'Mantequilla'],
    precio: 12000,
    imagen_principal: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    galeria_imagenes: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80'
    ],
    disponible: true,
    destacado: false,
    stock: 14,
    calificacion: 4.9,
    num_resenas: 58,
    calorias: 245
  }
];

const INITIAL_COUPONS: Coupon[] = [
  { codigo: 'MOCHI10', descripcion: '10% de descuento en tu primer pedido', tipo: 'porcentaje', valor: 10, montoMinimo: 15000, activo: true },
  { codigo: 'MATCHA15', descripcion: '15% de descuento especial en categoría Matcha', tipo: 'porcentaje', valor: 15, montoMinimo: 20000, activo: true },
  { codigo: 'ENVIOGRATIS', descripcion: 'Envío gratis a todo La Dorada', tipo: 'envio_gratis', valor: 0, montoMinimo: 25000, activo: true }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    productoId: 1,
    nombreCliente: 'María Fernanda L.',
    comentario: '¡Increíbles! Los mochi de fresa son súper suaves y el toque de anko es idéntico al que probé en mi viaje a Kioto. Repetiré 100%.',
    calificacion: 5,
    fecha: '2026-08-01',
    aprobado: true
  },
  {
    id: 2,
    productoId: 2,
    nombreCliente: 'Carlos Andrés R.',
    comentario: 'El mejor mochi de matcha que he probado en Colombia. La presentación es hermosísima y la velocidad de envío en La Dorada fue súper rápida.',
    calificacion: 5,
    fecha: '2026-08-04',
    aprobado: true
  },
  {
    id: 3,
    productoId: 3,
    nombreCliente: 'Ana Sofía G.',
    comentario: 'Presentación hermosa y sabor único con el mascarpone. Un detalle perfecto para regalar a alguien especial.',
    calificacion: 5,
    fecha: '2026-08-08',
    aprobado: true
  }
];

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 1,
    slug: 'que-es-el-mochi-historia-y-tradicion',
    titulo: '¿Qué es el Mochi? Historia y Tradición Japonesa',
    resumen: 'Descubre el milenario origen del pastel de arroz japonés y su significado en las festividades del Año Nuevo (Oshogatsu).',
    contenido: `
      El Mochi (餅) es un pastel de arroz japonés hecho de mochigome, un grano de arroz glutinoso de grano corto. El arroz se machaca tradicionalmente en un mortero de madera (Usu) con un mazo especial (Kine) en un ritual conocido como Mochitsuki.

      Aunque en la actualidad se disfruta durante todo el año en infinitas variantes con helado, frutas frescas y pastas dulces, el mochi tiene un profundo valor ceremonial en la cultura japonesa como símbolo de prosperidad, buena fortuna y unión familiar.
    `,
    autor: 'Felipe Verano - Co-Fundador MOCHI',
    fecha: '2026-07-28',
    imagen: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    categoria: 'Cultura & Tradición',
    tiempoLectura: '4 min'
  },
  {
    id: 2,
    slug: '5-beneficios-del-matcha-ceremonial-de-uji',
    titulo: '5 Beneficios Sorprendentes del Té Matcha Ceremonial',
    resumen: 'El superalimento japonés cargado de antioxidantes L-teanina y energía limpia para tu día.',
    contenido: `
      A diferencia del té verde convencional donde solo se infusionan las hojas, con el Matcha consumes la hoja completa pulverizada en molinos de piedra volcánica.

      1. Calma concentrada gracias a la L-teanina.
      2. Alta densidad de antioxidantes EGCG.
      3. Energía sostenida sin los picos de ansiedad del café.
      4. Acelerador natural del metabolismo.
      5. Apoyo al sistema inmune y desintoxicación celular.
    `,
    autor: 'Michel - Sommelier de Té MOCHI',
    fecha: '2026-08-02',
    imagen: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    categoria: 'Salud & Bienestar',
    tiempoLectura: '3 min'
  },
  {
    id: 3,
    slug: 'la-historia-del-taiyaki-el-pez-dorado-japones',
    titulo: 'La Historia del Taiyaki: El Antojo Caliente de Tokio',
    resumen: '¿Por qué este popular pastelito japonés tiene forma de pez dorada? Te contamos el origen del Taiyaki.',
    contenido: `
      El Taiyaki se creó por primera vez en Tokio en 1909 en la pastelería Naniwaya Sōhonten. La 'Tai' o besugo (dorada) era considerado el rey de los peces en Japón, reservado históricamente para nobles y fiestas especiales.

      Para hacer accesible esta sensación de lujo a la gente común, los artesanos crearon un molde con la forma estilizada de la dorada. ¡Hoy en día es el alimento de confort más amado de las calles de Japón!
    `,
    autor: 'Neider - Chef Repostero MOCHI',
    fecha: '2026-08-05',
    imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    categoria: 'Recetas & Curiosidades',
    tiempoLectura: '5 min'
  }
];

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
  readonly categories = signal<Category[]>(this.loadFromStorage('mochi_categories', INITIAL_CATEGORIES));
  readonly products = signal<Product[]>(this.loadFromStorage('mochi_products', INITIAL_PRODUCTS));
  readonly coupons = signal<Coupon[]>(this.loadFromStorage('mochi_coupons', INITIAL_COUPONS));
  readonly reviews = signal<Review[]>(this.loadFromStorage('mochi_reviews', INITIAL_REVIEWS));
  readonly blogPosts = signal<BlogPost[]>(this.loadFromStorage('mochi_blogs', INITIAL_BLOGS));
  readonly visualConfig = signal<VisualConfig>(this.loadFromStorage('mochi_config', DEFAULT_CONFIG));
  readonly orders = signal<Order[]>(this.loadFromStorage('mochi_orders', []));
  readonly posSales = signal<POSSale[]>(this.loadFromStorage('mochi_pos_sales', []));
  readonly favorites = signal<number[]>(this.loadFromStorage('mochi_favorites', [1, 3]));

  readonly activeProducts = computed(() => this.products().filter(p => p.disponible));
  readonly featuredProducts = computed(() => this.products().filter(p => p.destacado && p.disponible));

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveToStorage(key: string, data: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }

  // --- Product CRUD Operations ---
  addProduct(product: Omit<Product, 'id' | 'calificacion' | 'num_resenas'>) {
    const newId = Math.max(0, ...this.products().map(p => p.id)) + 1;
    const fullProduct: Product = {
      ...product,
      id: newId,
      calificacion: 5.0,
      num_resenas: 0
    };
    const updated = [fullProduct, ...this.products()];
    this.products.set(updated);
    this.saveToStorage('mochi_products', updated);
  }

  updateProduct(product: Product) {
    const updated = this.products().map(p => p.id === product.id ? product : p);
    this.products.set(updated);
    this.saveToStorage('mochi_products', updated);
  }

  deleteProduct(productId: number) {
    const updated = this.products().filter(p => p.id !== productId);
    this.products.set(updated);
    this.saveToStorage('mochi_products', updated);
  }

  toggleFavorite(productId: number) {
    const current = this.favorites();
    const updated = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    this.favorites.set(updated);
    this.saveToStorage('mochi_favorites', updated);
  }

  isFavorite(productId: number): boolean {
    return this.favorites().includes(productId);
  }

  // --- Orders Management ---
  createOrder(orderData: Omit<Order, 'id' | 'fecha' | 'estado'>): Order {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().split('T')[0];
    const newOrder: Order = {
      ...orderData,
      id: `MOCHI-${dateStr.replace(/-/g, '')}-${randNum}`,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };

    const updatedOrders = [newOrder, ...this.orders()];
    this.orders.set(updatedOrders);
    this.saveToStorage('mochi_orders', updatedOrders);

    // Decrement stock for purchased items
    const updatedProducts = this.products().map(p => {
      const purchased = orderData.items.find(item => item.productoId === p.id);
      if (purchased) {
        return { ...p, stock: Math.max(0, p.stock - purchased.cantidad) };
      }
      return p;
    });
    this.products.set(updatedProducts);
    this.saveToStorage('mochi_products', updatedProducts);

    return newOrder;
  }

  updateOrderStatus(orderId: string, newStatus: Order['estado']) {
    const updated = this.orders().map(o => o.id === orderId ? { ...o, estado: newStatus } : o);
    this.orders.set(updated);
    this.saveToStorage('mochi_orders', updated);
  }

  // --- POS / Empleado Sales ---
  recordPOSSale(saleData: Omit<POSSale, 'id' | 'fecha'>): POSSale {
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newSale: POSSale = {
      ...saleData,
      id: `POS-${randNum}`,
      fecha: new Date().toISOString()
    };

    const updatedSales = [newSale, ...this.posSales()];
    this.posSales.set(updatedSales);
    this.saveToStorage('mochi_pos_sales', updatedSales);

    // Decrement stock
    const updatedProducts = this.products().map(p => {
      const sold = saleData.items.find(item => item.productoId === p.id);
      if (sold) {
        return { ...p, stock: Math.max(0, p.stock - sold.cantidad) };
      }
      return p;
    });
    this.products.set(updatedProducts);
    this.saveToStorage('mochi_products', updatedProducts);

    return newSale;
  }

  // --- Visual Config Management ---
  updateVisualConfig(config: Partial<VisualConfig>) {
    const updated = { ...this.visualConfig(), ...config };
    this.visualConfig.set(updated);
    this.saveToStorage('mochi_config', updated);
  }

  // --- Reviews ---
  addReview(review: Omit<Review, 'id' | 'fecha' | 'aprobado'>) {
    const newReview: Review = {
      ...review,
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
      aprobado: true // auto-approved for interactive preview
    };
    const updated = [newReview, ...this.reviews()];
    this.reviews.set(updated);
    this.saveToStorage('mochi_reviews', updated);
  }

  // --- Coupons ---
  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const found = this.coupons().find(c => c.codigo.toUpperCase() === code.trim().toUpperCase() && c.activo);
    if (!found) {
      return { valid: false, discount: 0, message: 'Cupón no válido o expirado.' };
    }
    if (subtotal < found.montoMinimo) {
      return { valid: false, discount: 0, message: `El cupón requiere una compra mínima de $${found.montoMinimo.toLocaleString()} COP.` };
    }

    let discount = 0;
    if (found.tipo === 'porcentaje') {
      discount = Math.round((subtotal * found.valor) / 100);
    } else if (found.tipo === 'monto_fijo') {
      discount = found.valor;
    } else if (found.tipo === 'envio_gratis') {
      discount = this.visualConfig().costoEnvioBase;
    }

    return {
      valid: true,
      discount,
      message: `¡Cupón ${found.codigo} aplicado correctamente!`,
      coupon: found
    };
  }
}
