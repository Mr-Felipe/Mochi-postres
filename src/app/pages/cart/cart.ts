import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/mochi.models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] min-h-screen py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/productos" class="w-10 h-10 rounded-full bg-white border border-[#E8D8D0] flex items-center justify-center hover:bg-[#D95578]/10 transition-colors">
              <span class="material-icons text-[#590E2A] text-xl">arrow_back</span>
            </a>
            <div>
              <h1 class="text-2xl font-serif italic text-[#590E2A] font-bold">Mi Carrito</h1>
              <p class="text-[#590E2A]/50 text-[10px] uppercase tracking-wider font-medium">{{ cartService.items().length }} {{ cartService.items().length === 1 ? 'producto' : 'productos' }}</p>
            </div>
          </div>
        </div>

        @if (cartService.items().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            <!-- Items List -->
            <div class="lg:col-span-8 space-y-3">
              @for (item of cartService.items(); track item.product.id + (item.frase_personalizada || '')) {
                <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
                  <div class="flex items-start gap-4">
                    <!-- Image -->
                    @if (item.product.id === 25) {
                      <div class="w-20 h-20 rounded-2xl flex-shrink-0 bg-gradient-to-b from-[#590E2A]/5 to-[#D95578]/10 border border-[#E8D8D0]/50 flex flex-col items-center justify-center p-1">
                        <div class="w-12 h-2.5 rounded-t-[0.5rem] bg-[#8B4513] flex items-center justify-center text-[4px] font-bold text-white">TOP</div>
                        <div class="w-12 h-2 bg-[#FF6B6B] flex items-center justify-center text-[3px] font-bold text-white">REL</div>
                        <div class="w-12 h-2 bg-[#FFEAA7] flex items-center justify-center text-[3px] font-bold text-[#590E2A]">GANACHE</div>
                        <div class="w-12 h-2 bg-[#D4A574] flex items-center justify-center text-[3px] font-bold text-white">BASE</div>
                        <div class="w-12 h-2 bg-[#FF6B6B] flex items-center justify-center text-[3px] font-bold text-white">REL</div>
                        <div class="w-12 h-2 bg-[#FFEAA7] flex items-center justify-center text-[3px] font-bold text-[#590E2A]">GANACHE</div>
                        <div class="w-12 h-2.5 rounded-b-[0.5rem] bg-[#D4A574] flex items-center justify-center text-[3px] font-bold text-white">BASE</div>
                      </div>
                    } @else {
                      <img [src]="item.product.imagen_principal" [alt]="item.product.nombre_espanol"
                        class="w-20 h-20 rounded-2xl object-cover flex-shrink-0 bg-[#FDF8F4] border border-[#E8D8D0]/50">
                    }

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <span class="text-[9px] font-bold text-[#D95578] uppercase tracking-widest block">
                            {{ item.product.nombre_japones }}
                          </span>
                          <h3 class="font-serif italic text-[#590E2A] text-sm font-bold">
                            {{ item.product.nombre_espanol }}
                          </h3>
                        </div>
                        <span class="text-sm font-serif italic text-[#590E2A] font-bold whitespace-nowrap">
                          {{ '$' + itemTotal(item).toLocaleString('es-CO') }}
                        </span>
                      </div>

                      @if (item.frase_personalizada) {
                        <div class="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#D95578]/10 text-[10px] text-[#D95578] italic">
                          <span class="material-icons text-[10px]">format_quote</span>
                          {{ item.frase_personalizada }}
                        </div>
                      }

                      <div class="flex items-center justify-between mt-2">
                        <span class="text-[10px] text-[#590E2A]/50">
                          {{ '$' + (item.customPrice || item.product.precio).toLocaleString('es-CO') }} c/u
                        </span>

                        <div class="flex items-center gap-2">
                          <!-- Delete -->
                          <button (click)="cartService.removeFromCart(item.product.id, item.configuracion_capas, item.frase_personalizada)"
                            class="w-7 h-7 rounded-full flex items-center justify-center text-[#590E2A]/40 hover:bg-red-50 hover:text-red-500 transition-colors">
                            <span class="material-icons text-sm">delete_outline</span>
                          </button>

                          <!-- Quantity -->
                          <div class="flex items-center rounded-full bg-[#FDF8F4] border border-[#E8D8D0]">
                            <button (click)="cartService.updateQuantity(item.product.id, item.cantidad - 1, item.frase_personalizada)"
                              class="w-8 h-8 rounded-full flex items-center justify-center text-[#590E2A] hover:bg-[#D95578] hover:text-white transition-colors">
                              <span class="material-icons text-sm">remove</span>
                            </button>
                            <span class="w-8 text-center text-xs font-bold text-[#590E2A]">{{ item.cantidad }}</span>
                            <button (click)="cartService.updateQuantity(item.product.id, item.cantidad + 1, item.frase_personalizada)"
                              class="w-8 h-8 rounded-full flex items-center justify-center text-[#590E2A] hover:bg-[#D95578] hover:text-white transition-colors">
                              <span class="material-icons text-sm">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Clear Cart -->
              <button (click)="cartService.clearCart()"
                class="flex items-center gap-1.5 text-[10px] text-[#590E2A]/40 hover:text-red-500 font-bold uppercase tracking-wider transition-colors ml-1">
                <span class="material-icons text-sm">delete_sweep</span>
                Vaciar Carrito
              </button>
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-4 bg-white rounded-[28px] border border-[#E8D8D0] p-6 shadow-xs space-y-5 sticky top-28">
              <div class="flex items-center gap-2 pb-3 border-b border-[#E8D8D0]">
                <span class="material-icons text-[#D95578] text-lg">receipt_long</span>
                <h2 class="text-sm font-serif italic text-[#590E2A] font-bold">Resumen del Pedido</h2>
              </div>

              <div class="space-y-3 text-xs">
                <div class="flex justify-between text-[#590E2A]/70">
                  <span class="flex items-center gap-1.5">
                    <span class="material-icons text-sm">shopping_bag</span> Subtotal
                  </span>
                  <span class="font-bold text-[#590E2A]">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
                </div>

                <div class="flex justify-between text-[#590E2A]/70">
                  <span class="flex items-center gap-1.5">
                    <span class="material-icons text-sm">local_shipping</span> Envío
                  </span>
                  <span class="font-bold text-[#590E2A]">
                    {{ cartService.shippingCost() === 0 ? 'Gratis' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}
                  </span>
                </div>

                <div class="flex justify-between items-end pt-3 border-t border-[#E8D8D0]">
                  <span class="text-xs font-bold text-[#590E2A] uppercase tracking-wider">Total</span>
                  <span class="text-xl font-serif italic text-[#D95578] font-bold">{{ '$' + cartService.total().toLocaleString('es-CO') }}</span>
                </div>
              </div>

              <a routerLink="/checkout"
                class="w-full py-3.5 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest shadow-xs transition-all hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2">
                <span class="material-icons text-base">lock</span>
                Ir a Pagar
              </a>

              <p class="text-[9px] text-[#590E2A]/40 text-center">
                Pago seguro verificado por Supabase
              </p>
            </div>
          </div>
        } @else {
          <div class="text-center py-16 bg-white rounded-[32px] border border-[#E8D8D0] p-8 space-y-4 max-w-md mx-auto">
            <div class="w-16 h-16 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-center mx-auto">
              <span class="material-icons text-2xl text-[#590E2A]/30">remove_shopping_cart</span>
            </div>
            <h2 class="text-lg font-serif italic text-[#590E2A] font-bold">Carrito vacío</h2>
            <p class="text-[#590E2A]/50 text-xs">Agrega postres japoneses artesanales desde nuestro catálogo.</p>
            <a routerLink="/productos"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-colors shadow-xs">
              <span class="material-icons text-sm">storefront</span>
              Explorar Catálogo
            </a>
          </div>
        }

      </div>
    </div>
  `
})
export class CartPageComponent {
  cartService = inject(CartService);

  itemTotal(item: CartItem): number {
    const base = item.customPrice || item.product.precio;
    return base * item.cantidad;
  }
}
