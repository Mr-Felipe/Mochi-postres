import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/mochi.models';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cartService.isDrawerOpen()) {
      <div (click)="cartService.closeDrawer()"
        class="fixed inset-0 z-50 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        [style.background]="'rgba(0,0,0,0.5)'"
        aria-hidden="true">
      </div>

      <aside
        class="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] shadow-2xl flex flex-col justify-between animate-slideLeft"
        [style.background]="panelBg()" [style.color]="textColor()">

        <!-- Header -->
        <div class="p-5 sm:p-6 flex items-center justify-between"
          [style.background]="headerBg()" [style.border-bottom]="'1px solid ' + borderColor()">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full text-white flex items-center justify-center font-serif italic text-lg shadow-xs"
              [style.background]="'var(--accent)'" [style.border]="'1px solid ' + borderColor()">
              &#127845;
            </div>
            <div>
              <h2 class="font-serif italic text-xl leading-none" [style.color]="headingColor()">Tu Carrito de Mochis</h2>
              <span class="text-[10px] uppercase tracking-widest block mt-0.5 font-bold opacity-70">
                {{ cartService.itemCount() }} {{ cartService.itemCount() === 1 ? 'producto seleccionado' : 'productos seleccionados' }}
              </span>
            </div>
          </div>
          <button (click)="cartService.closeDrawer()"
            class="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
            [style.background]="closeBtnBg()" [style.color]="headingColor()" title="Cerrar Carrito">
            &#10005;
          </button>
        </div>

        <!-- Scrollable Items List -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          @if (cartService.items().length > 0) {
            @for (item of cartService.items(); track item.product.id) {
              <div class="rounded-[24px] p-4 shadow-2xs flex gap-3.5 items-center relative group"
                [style.background]="cardBg()" [style.border]="'1px solid ' + borderColor()">
                <img [src]="item.product.imagen_principal" [alt]="item.product.nombre_espanol" class="w-16 h-16 rounded-2xl object-cover flex-shrink-0" [style.background]="imgBg()">
                <div class="flex-1 min-w-0 space-y-1">
                  <span class="text-[9px] font-serif italic uppercase tracking-wider block font-bold" [style.color]="'var(--accent)'">
                    {{ item.product.nombre_japones }}
                  </span>
                  <h3 class="text-sm font-serif italic truncate leading-tight font-bold" [style.color]="headingColor()">
                    {{ item.product.nombre_espanol }}
                  </h3>
                  @if (item.frase_personalizada) {
                    <p class="text-[9px] text-[#D95578] italic truncate flex items-center gap-1" title="{{ item.frase_personalizada }}"><span class="material-icons text-[11px]">edit_note</span> {{ item.frase_personalizada }}</p>
                  } @else if (item.product.frase) {
                    <p class="text-[9px] text-[#590E2A]/40 italic truncate flex items-center gap-1"><span class="material-icons text-[11px]">auto_awesome</span> {{ item.product.frase }}</p>
                  }
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-xs font-bold">
                      {{ '$' + itemTotal(item).toLocaleString('es-CO') }}
                    </span>
                    <div class="flex items-center rounded-full p-0.5" [style.background]="imgBg()" [style.border]="'1px solid ' + borderColor()">
                      <button (click)="cartService.updateQuantity(item.product.id, item.cantidad - 1)"
                        class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        [style.background]="cardBg()" [style.color]="headingColor()">-</button>
                      <span class="w-6 text-center text-xs font-bold font-mono">{{ item.cantidad }}</span>
                      <button (click)="cartService.updateQuantity(item.product.id, item.cantidad + 1)"
                        class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                        [style.background]="cardBg()" [style.color]="headingColor()">+</button>
                    </div>
                  </div>
                </div>
                <button (click)="cartService.removeFromCart(item.product.id, item.configuracion_capas)"
                  class="hover:opacity-70 p-1.5 rounded-full transition-colors"
                  style="color: #C62828" title="Eliminar producto">
                  <span class="material-icons text-base">delete_outline</span>
                </button>
              </div>
            }
          } @else {
            <div class="text-center py-12 px-4 space-y-4">
              <div class="w-20 h-20 rounded-full text-white flex items-center justify-center mx-auto shadow-sm"
                [style.background]="'var(--accent)'" [style.border]="'1px solid ' + borderColor()">
                <span class="material-icons text-3xl">shopping_bag</span>
              </div>
              <div class="space-y-1">
                <h3 class="font-serif italic text-xl" [style.color]="headingColor()">Tu Carrito esta Vacio</h3>
                <p class="text-xs max-w-xs mx-auto leading-relaxed font-medium opacity-70">
                  Anade tus mochis, postres artesanales o bebidas de Matcha para deleitarte hoy.
                </p>
              </div>
              <button (click)="goTo('/productos')"
                class="px-6 py-3 rounded-full text-white font-bold text-xs uppercase tracking-widest shadow-xs transition-colors"
                [style.background]="'var(--accent)'">
                Explorar Catalogo
              </button>
            </div>
          }
        </div>

        <!-- Sticky Footer -->
        @if (cartService.items().length > 0) {
          <div class="p-5 sm:p-6 space-y-4 shadow-lg"
            [style.background]="footerBg()" [style.border-top]="'1px solid ' + borderColor()">

            <!-- Price Breakdown -->
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between opacity-80">
                <span>Subtotal:</span>
                <span class="font-bold">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
              </div>
              <div class="flex justify-between opacity-80">
                <span>Domicilio ({{ cartService.deliveryZone() }}):</span>
                <span class="font-bold" style="color: var(--success)">
                  {{ cartService.shippingCost() === 0 ? 'GRATIS!' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}
                </span>
              </div>
              <div class="flex justify-between text-lg font-serif italic font-bold pt-2"
                [style.border-top]="'1px solid ' + borderColor()" [style.color]="headingColor()">
                <span>Total a Pagar:</span>
                <span class="text-xl font-sans not-italic font-bold">
                  {{ '$' + cartService.total().toLocaleString('es-CO') }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-2 pt-1">
              <button (click)="goTo('/carrito')"
                class="w-full py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs"
                [style.background]="'var(--accent)'" style="color: white">
                <span class="material-icons text-base">shopping_cart</span>
                <span>Ver Carrito</span>
              </button>
              <button (click)="goTo('/checkout')"
                class="w-full py-3.5 rounded-full text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
                [style.background]="'var(--accent)'">
                <span class="material-icons text-base">payment</span>
                <span>Finalizar Compra</span>
              </button>
            </div>
          </div>
        }
      </aside>
    }
  `
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  router = inject(Router);

  panelBg = signal('#3A0A1C');
  headerBg = signal('#4A0D22');
  footerBg = signal('#4A0D22');
  headingColor = signal('#FDF8F4');
  textColor = signal('rgba(253,248,244,0.8)');
  borderColor = signal('rgba(255,255,255,0.1)');
  cardBg = signal('rgba(255,255,255,0.05)');
  imgBg = signal('rgba(255,255,255,0.08)');
  closeBtnBg = signal('rgba(255,255,255,0.1)');

  goTo(path: string) {
    this.cartService.closeDrawer();
    this.router.navigate([path]);
  }

  itemTotal(item: CartItem): number {
    const base = item.customPrice || item.product.precio;
    return base * item.cantidad;
  }
}
