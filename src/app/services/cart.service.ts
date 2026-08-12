import { Injectable, signal, computed, inject } from '@angular/core';
import { CartItem, Product, Coupon } from '../models/mochi.models';
import { MochiDataService } from './mochi-data.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private dataService = inject(MochiDataService);

  readonly items = signal<CartItem[]>(this.loadCartFromStorage());
  readonly appliedCoupon = signal<Coupon | null>(null);
  readonly deliveryType = signal<'domicilio' | 'recogida'>('domicilio');
  readonly isDrawerOpen = signal<boolean>(false);

  openDrawer() {
    this.isDrawerOpen.set(true);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  toggleDrawer() {
    this.isDrawerOpen.update(v => !v);
  }

  readonly itemCount = computed(() => {
    return this.items().reduce((sum, item) => sum + item.cantidad, 0);
  });

  readonly subtotal = computed(() => {
    return this.items().reduce((sum, item) => {
      const price = item.product.precio_oferta || item.product.precio;
      return sum + (price * item.cantidad);
    }, 0);
  });

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
    if (coupon.tipo === 'porcentaje') {
      return Math.round((sub * coupon.valor) / 100);
    } else if (coupon.tipo === 'monto_fijo') {
      return coupon.valor;
    } else if (coupon.tipo === 'envio_gratis') {
      return this.dataService.visualConfig().costoEnvioBase;
    }
    return 0;
  });

  readonly total = computed(() => {
    const total = this.subtotal() + this.shippingCost() - this.couponDiscount();
    return Math.max(0, total);
  });

  private loadCartFromStorage(): CartItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('mochi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveCartToStorage(items: CartItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('mochi_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart', e);
    }
  }

  addToCart(product: Product, quantity = 1, notes = '') {
    const current = this.items();
    const existingIndex = current.findIndex(i => i.product.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = current.map((item, index) => {
        if (index === existingIndex) {
          return {
            ...item,
            cantidad: item.cantidad + quantity,
            notas: notes || item.notas
          };
        }
        return item;
      });
    } else {
      updated = [...current, { product, cantidad: quantity, notas: notes }];
    }

    this.items.set(updated);
    this.saveCartToStorage(updated);
    this.openDrawer();
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const updated = this.items().map(item => {
      if (item.product.id === productId) {
        return { ...item, cantidad: quantity };
      }
      return item;
    });

    this.items.set(updated);
    this.saveCartToStorage(updated);
  }

  removeFromCart(productId: number) {
    const updated = this.items().filter(item => item.product.id !== productId);
    this.items.set(updated);
    this.saveCartToStorage(updated);
  }

  clearCart() {
    this.items.set([]);
    this.appliedCoupon.set(null);
    this.saveCartToStorage([]);
  }

  applyCouponCode(code: string): { success: boolean; message: string } {
    const res = this.dataService.validateCoupon(code, this.subtotal());
    if (res.valid && res.coupon) {
      this.appliedCoupon.set(res.coupon);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message };
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
  }

  setDeliveryType(type: 'domicilio' | 'recogida') {
    this.deliveryType.set(type);
  }
}
