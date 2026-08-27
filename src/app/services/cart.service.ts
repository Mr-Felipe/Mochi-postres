import { Injectable, signal, computed, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem, Product, DeliveryZone, getDeliveryPrice, detectZoneFromAddress } from '../models/mochi.models';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

const CART_STORAGE_KEY = 'mochi_guest_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private sbService = inject(SupabaseService);
  private toastService = inject(ToastService);
  private cartChannel: RealtimeChannel | null = null;
  private platformId = inject(PLATFORM_ID);
  private isLoadingCart = false;

  readonly items = signal<CartItem[]>([]);
  readonly deliveryType = signal<'domicilio' | 'recogida'>('domicilio');
  readonly deliveryZone = signal<DeliveryZone>('La Dorada');
  readonly isDrawerOpen = signal<boolean>(false);

  // POS: pending custom cup from configurator
  readonly pendingCustomCup = signal<{ product: Product; cantidad: number; configuracion_capas: any; customPrice: number } | null>(null);

  // POS: cart items (persist across navigation)
  readonly posItems = signal<{ product: Product; cantidad: number; configuracion_capas?: any; customPrice?: number }[]>([]);

  openDrawer() { this.isDrawerOpen.set(true); }
  closeDrawer() { this.isDrawerOpen.set(false); }
  toggleDrawer() { this.isDrawerOpen.update(v => !v); }

  readonly itemCount = computed(() => this.items().reduce((sum, item) => sum + item.cantidad, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, item) => {
    if (item.customPrice) {
      return sum + (item.customPrice * item.cantidad);
    }
    return sum + (item.product.precio * item.cantidad);
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

  // --- LOCAL STORAGE FOR GUEST CART ---

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private saveGuestCart(): void {
    if (!this.isBrowser()) return;
    const cartData = this.items().map(item => ({
      product: item.product,
      cantidad: item.cantidad,
      notas: item.notas,
      frase_personalizada: item.frase_personalizada,
      configuracion_capas: item.configuracion_capas,
      customPrice: item.customPrice
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  }

  private loadGuestCart(): CartItem[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }

  private clearGuestCart(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  private mergeCartItems(local: CartItem[], remote: CartItem[]): CartItem[] {
    const merged = [...remote];
    for (const localItem of local) {
      const existingIndex = merged.findIndex(
        m => m.product.id === localItem.product.id &&
             JSON.stringify(m.configuracion_capas) === JSON.stringify(localItem.configuracion_capas) &&
             m.customPrice === localItem.customPrice
      );
      if (existingIndex >= 0) {
        merged[existingIndex] = {
          ...merged[existingIndex],
          cantidad: merged[existingIndex].cantidad + localItem.cantidad
        };
      } else {
        merged.push(localItem);
      }
    }
    return merged;
  }

  // --- SUPABASE CART OPERATIONS ---

  async loadCart(): Promise<void> {
    if (this.isLoadingCart) return;
    this.isLoadingCart = true;

    try {
      const userId = this.sbService.activeUser()?.id;
      if (!userId) {
        const guestItems = this.loadGuestCart();
        this.items.set(guestItems);
        return;
      }

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
      const remoteItems: CartItem[] = rawItems.filter((item): item is NonNullable<typeof item> => item !== null);

      const guestItems = this.loadGuestCart();
      if (guestItems.length > 0) {
        // Limpiar ANTES del sync para que si Realtime dispara otro loadCart, no re-lea
        this.clearGuestCart();

        const merged = this.mergeCartItems(guestItems, remoteItems);
        this.items.set(merged);

        for (const item of guestItems) {
          const alreadyInRemote = remoteItems.some(
            r => r.product.id === item.product.id
          );
          if (!alreadyInRemote) {
            await supabase.from('carrito_compras').upsert({
              id_usuario: userId,
              id_producto: item.product.id,
              cantidad: item.cantidad,
              notas: item.notas || null,
              frase_personalizada: item.frase_personalizada || null
            }, { onConflict: 'id_usuario,id_producto' });
          }
        }
      } else {
        this.items.set(remoteItems);
      }

      const defaultDir = await this.sbService.obtenerDireccionPredeterminada(userId);
      if (defaultDir) {
        const fullAddress = [defaultDir.direccion_completa, defaultDir.barrio, defaultDir.ciudad].filter(Boolean).join(' ');
        this.deliveryZone.set(detectZoneFromAddress(fullAddress));
      }

      this.subscribeToCartChanges(userId);
    } finally {
      this.isLoadingCart = false;
    }
  }

  private subscribeToCartChanges(userId: string) {
    if (this.cartChannel) {
      supabase.removeChannel(this.cartChannel);
    }

    this.cartChannel = supabase
      .channel('carrito-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'carrito_compras',
        filter: `id_usuario=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const deletedProductoId = (payload.old as Record<string, unknown>)?.['id_producto'];
          if (deletedProductoId) {
            this.items.update(items => items.filter(item => item.product.id !== deletedProductoId));
          }
        }
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          this.loadCart();
        }
      })
      .subscribe();
  }

  ngOnDestroy() {
    if (this.cartChannel) {
      supabase.removeChannel(this.cartChannel);
    }
  }

  async addToCart(product: Product, quantity: number = 1, notas?: string, configuracion_capas?: { base: number; crema: number; relleno: number; topping: number } | null, customPrice?: number, frase_personalizada?: string): Promise<void> {
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
    const existingIndex = current.findIndex(i =>
      i.product.id === product.id &&
      !i.configuracion_capas &&
      !customPrice &&
      (i.frase_personalizada || '') === (frase_personalizada || '')
    );

    if (existingIndex >= 0) {
      const updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], cantidad: updated[existingIndex].cantidad + quantity };
      this.items.set(updated);
    } else {
      this.items.set([...current, { product, cantidad: quantity, notas, configuracion_capas: configuracion_capas || null, customPrice, frase_personalizada }]);
    }

    // Persistir en localStorage si no hay usuario logueado
    if (!userId) {
      this.saveGuestCart();
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
    if (!userId) {
      this.saveGuestCart();
    }
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
    if (!userId) {
      this.saveGuestCart();
    }
  }

  async clearCart(): Promise<void> {
    const userId = this.sbService.activeUser()?.id;
    if (userId) {
      await supabase.from('carrito_compras').delete().eq('id_usuario', userId);
    }
    this.items.set([]);
    this.clearGuestCart();
  }

  async clearCartOnLogout(): Promise<void> {
    if (this.cartChannel) {
      supabase.removeChannel(this.cartChannel);
      this.cartChannel = null;
    }
    // Guardar carrito actual en localStorage antes de limpiar para la próxima sesión
    this.saveGuestCart();
    this.items.set([]);
  }
}
