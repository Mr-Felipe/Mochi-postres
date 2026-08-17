import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product, Coupon } from '../models/mochi.models';
import { MochiDataService } from './mochi-data.service';
import { SupabaseService } from './supabase.service';
import { supabase } from '../supabase';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private dataService = inject(MochiDataService);
  private sbService = inject(SupabaseService);

  readonly items = signal<CartItem[]>([]);
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly deliveryType = signal<'domicilio' | 'recogida'>('domicilio');
  readonly isDrawerOpen = signal<boolean>(false);

  openDrawer() { this.isDrawerOpen.set(true); }
  closeDrawer() { this.isDrawerOpen.set(false); }
  toggleDrawer() { this.isDrawerOpen.update(v => !v); }

  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.cantidad, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, item) => {
    const price = item.product.precio_oferta || item.product.precio;
    return sum + (price * item.cantidad);
  }, 0));
  readonly shippingCost = computed(() => {
    if (this.deliveryType() === 'recogida') return 0;
    const config = this.dataService.visualConfig();
    if (this.appliedCoupon()?.tipo === 'envio_gratis') return 0;
    if (this.subtotal() >= config.montoEnvioGratis) return 0;
    return config.costoEnvioBase;
  });
  readonly couponDiscount = computed(() => {
    const coupon = this.appliedCoupon();
    const sub = this.subtotal();
    if (!coupon) return 0;
    if (coupon.tipo === 'porcentaje') return Math.round((sub * coupon.valor) / 100);
    else if (coupon.tipo === 'monto_fijo') return coupon.valor;
    else if (coupon.tipo === 'envio_gratis') return this.dataService.visualConfig().costoEnvioBase;
    return 0;
  });
  readonly total = computed(() => Math.max(0, this.subtotal() + this.shippingCost() - this.couponDiscount()));

  // --- SUPABASE CART OPERATIONS ---

  async loadCart(): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (!userId) { this.items.set([]); return; }

    const { data, error } = await supabase
      .from('carrito_compras')
      .select('id_producto, cantidad, notas, productos(id_producto, nombre_espanol, nombre_japones, precio, precio_oferta, imagen_principal, stock)')
      .eq('id_usuario', userId);

    if (error) { console.error('Error loading cart:', error); return; }

    const items: CartItem[] = (data || []).map((row: Record<string, unknown>) => {
      const prod = row['productos'] as Record<string, unknown> | null;
      if (!prod) return null;
      return {
        product: {
          id: prod['id_producto'] as number,
          nombre_espanol: prod['nombre_espanol'] as string,
          nombre_japones: prod['nombre_japones'] as string || '',
          precio: Number(prod['precio']),
          precio_oferta: prod['precio_oferta'] ? Number(prod['precio_oferta']) : undefined,
          imagen_principal: prod['imagen_principal'] as string || '',
          stock: prod['stock'] as number || 0,
          id_categoria: 0,
          descripcion_corta: '',
          descripcion_completa: '',
          ingredientes: [],
          galeria_imagenes: [],
          disponible: true,
          destacado: false,
          calificacion: 0,
          num_resenas: 0
        } as Product,
        cantidad: row['cantidad'] as number,
        notas: (row['notas'] as string) || ''
      };
    }).filter(Boolean) as CartItem[];

    this.items.set(items);
  }

  async addToCart(product: Product, quantity = 1, notes = ''): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (!userId) return;

    const { error } = await supabase.from('carrito_compras').upsert({
      id_usuario: userId,
      id_producto: product.id,
      cantidad: quantity,
      notas: notes || null
    }, { onConflict: 'id_usuario,id_producto' });

    if (error) { console.error('Error adding to cart:', error); return; }
    await this.loadCart();
    this.openDrawer();
  }

  async updateQuantity(productId: number, quantity: number): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (!userId) return;

    if (quantity <= 0) {
      await this.removeFromCart(productId);
      return;
    }

    const { error } = await supabase.from('carrito_compras')
      .update({ cantidad: quantity, updated_at: new Date().toISOString() })
      .eq('id_usuario', userId)
      .eq('id_producto', productId);

    if (error) { console.error('Error updating cart:', error); return; }
    await this.loadCart();
  }

  async removeFromCart(productId: number): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (!userId) return;

    const { error } = await supabase.from('carrito_compras')
      .delete()
      .eq('id_usuario', userId)
      .eq('id_producto', productId);

    if (error) { console.error('Error removing from cart:', error); return; }
    await this.loadCart();
  }

  async clearCart(): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (!userId) { this.items.set([]); this.appliedCoupon.set(null); return; }

    const { error } = await supabase.from('carrito_compras')
      .delete()
      .eq('id_usuario', userId);

    if (error) { console.error('Error clearing cart:', error); return; }
    this.items.set([]);
    this.appliedCoupon.set(null);
  }

  applyCouponCode(code: string): { success: boolean; message: string } {
    const res = this.dataService.validateCoupon(code, this.subtotal());
    if (res.valid && res.coupon) {
      this.appliedCoupon.set(res.coupon);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  }

  removeCoupon() { this.appliedCoupon.set(null); }
  setDeliveryType(type: 'domicilio' | 'recogida') { this.deliveryType.set(type); }
}
