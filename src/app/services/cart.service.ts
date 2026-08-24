import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product, DeliveryZone, getDeliveryPrice, detectZoneFromAddress } from '../models/mochi.models';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import { supabase } from '../supabase';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private sbService = inject(SupabaseService);
  private toastService = inject(ToastService);

  readonly items = signal<CartItem[]>([]);
  readonly deliveryType = signal<'domicilio' | 'recogida'>('domicilio');
  readonly deliveryZone = signal<DeliveryZone>('La Dorada');
  readonly isDrawerOpen = signal<boolean>(false);

  openDrawer() { this.isDrawerOpen.set(true); }
  closeDrawer() { this.isDrawerOpen.set(false); }
  toggleDrawer() { this.isDrawerOpen.update(v => !v); }

  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.cantidad, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, item) => {
    if (item.customPrice) {
      const toppingsTotal = item.toppings_seleccionados?.reduce((s, t) => s + t.precio, 0) || 0;
      return sum + ((item.customPrice + toppingsTotal) * item.cantidad);
    }
    const price = item.product.precio;
    const toppingsTotal = item.toppings_seleccionados?.reduce((s, t) => s + t.precio, 0) || 0;
    return sum + ((price + toppingsTotal) * item.cantidad);
  }, 0));
  readonly totalQuantity = computed(() => this.items().reduce((sum, item) => sum + item.cantidad, 0));
  readonly shippingCost = computed(() => {
    if (this.deliveryType() === 'recogida') return 0;
    return getDeliveryPrice(this.deliveryZone(), this.totalQuantity());
  });
  readonly total = computed(() => Math.max(0, this.subtotal() + this.shippingCost()));

  updateDeliveryZone(address: string) {
    const zone = detectZoneFromAddress(address);
    this.deliveryZone.set(zone);
  }

  // --- SUPABASE CART OPERATIONS ---

  async loadCart(): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (!userId) { this.items.set([]); return; }

    const { data, error } = await supabase
      .from('carrito_compras')
      .select('id_producto, cantidad, notas, frase_personalizada, productos(id_producto, nombre_espanol, nombre_japones, precio, imagen_principal, stock, frase)')
      .eq('id_usuario', userId);

    if (error) { console.error('Error loading cart:', error); return; }

    const rawItems = (data || []).map((row: Record<string, unknown>) => {
      const prod = row['productos'] as Record<string, unknown> | null;
      if (!prod) return null;
      return {
        product: {
          id: prod['id_producto'] as number,
          nombre_espanol: prod['nombre_espanol'] as string,
          nombre_japones: prod['nombre_japones'] as string || '',
          precio: Number(prod['precio']),
          imagen_principal: prod['imagen_principal'] as string || '',
          stock: prod['stock'] as number || 0,
          stock_minimo: 10,
          stock_maximo: 500,
          descripcion: '',
          galeria_imagenes: [],
          disponible: true,
          calificacion: 0,
          num_resenas: 0,
          frase: prod['frase'] as string || ''
        } as Product,
        cantidad: row['cantidad'] as number,
        notas: row['notas'] as string || undefined,
        frase_personalizada: row['frase_personalizada'] as string || undefined
      };
    });
    const items: CartItem[] = rawItems.filter((item): item is NonNullable<typeof item> => item !== null);

    this.items.set(items);

    // Detect delivery zone from default address
    const defaultDir = await this.sbService.obtenerDireccionPredeterminada(userId);
    if (defaultDir) {
      const fullAddress = [defaultDir.direccion_completa, defaultDir.barrio, defaultDir.ciudad].filter(Boolean).join(' ');
      this.deliveryZone.set(detectZoneFromAddress(fullAddress));
    }
  }

  async addToCart(product: Product, quantity: number = 1, notas?: string, configuracion_capas?: { base: number; crema: number; relleno: number; topping: number } | null, customPrice?: number, toppings?: { id: string; nombre: string; precio: number }[], frase_personalizada?: string): Promise<void> {
    const userId = this.sbService.activeUser()?.id;

    if (userId) {
      const { error } = await supabase.from('carrito_compras').upsert({
        id_usuario: userId,
        id_producto: product.id,
        cantidad: quantity,
        notas: notas || null,
        frase_personalizada: frase_personalizada || null
      }, { onConflict: 'id_usuario,id_producto' });

      if (error) { console.error('Error adding to cart:', error); }
    }

    const current = this.items();
    const existingIndex = current.findIndex(i => i.product.id === product.id && !i.configuracion_capas && !customPrice);

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], cantidad: updated[existingIndex].cantidad + quantity };
      this.items.set(updated);
    } else {
      this.items.set([...current, { product, cantidad: quantity, notas, configuracion_capas: configuracion_capas || null, customPrice, toppings_seleccionados: toppings, frase_personalizada }]);
    }

    this.toastService.show(`${product.nombre_espanol} añadido al carrito`, 'success');
  }

  async updateQuantity(productId: number, quantity: number): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (quantity <= 0) {
      await this.removeFromCart(productId);
      return;
    }
    if (userId) {
      await supabase.from('carrito_compras').update({ cantidad: quantity }).eq('id_usuario', userId).eq('id_producto', productId);
    }
    this.items.update(items => items.map(item =>
      item.product.id === productId ? { ...item, cantidad: quantity } : item
    ));
  }

  async removeFromCart(productId: number, configuracion_capas?: { base: number; crema: number; relleno: number; topping: number } | null): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (userId) {
      await supabase.from('carrito_compras').delete().eq('id_usuario', userId).eq('id_producto', productId);
    }
    this.items.update(items => items.filter(item => {
      if (configuracion_capas) {
        return !(item.product.id === productId && JSON.stringify(item.configuracion_capas) === JSON.stringify(configuracion_capas));
      }
      return item.product.id !== productId || item.configuracion_capas;
    }));
  }

  async clearCart(): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (userId) {
      await supabase.from('carrito_compras').delete().eq('id_usuario', userId);
    }
    this.items.set([]);
  }

  async clearCartOnLogout(): Promise<void> {
    this.items.set([]);
  }
}
