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
    <div class="bg-[#FDF8F4] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-serif italic text-[#590E2A]">Tu Carrito de Compras</h1>
            <p class="text-[#590E2A]/70 text-xs uppercase tracking-wider mt-1 font-medium">Revisa tus postres seleccionados antes de pasar a la pasarela de pago</p>
          </div>

          <a routerLink="/productos" class="text-xs font-bold uppercase tracking-wider text-[#590E2A] hover:underline flex items-center gap-1">
            <span>← Seguir Explorando</span>
          </a>
        </div>

        @if (cartService.items().length > 0) {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- Items List -->
            <div class="lg:col-span-8 space-y-4">
              @for (item of cartService.items(); track item.product.id) {
                <div class="p-4 sm:p-6 bg-white rounded-[32px] border border-[#E8D8D0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div class="flex items-center gap-4 w-full sm:w-auto">
                    <img [src]="item.product.imagen_principal" [alt]="item.product.nombre_espanol" class="w-20 h-20 rounded-2xl object-cover flex-shrink-0 bg-[#FDF8F4]">
                    <div>
                      <span class="text-[10px] font-bold text-[#590E2A]/60 font-serif italic uppercase tracking-wider block">
                        {{ item.product.nombre_japones }}
                      </span>
                      <h3 class="font-serif italic text-[#590E2A] text-base">
                        {{ item.product.nombre_espanol }}
                      </h3>
                      <span class="text-xs text-[#590E2A]/70 block mt-0.5">
                        Precio Unitario: {{ '$' + (item.customPrice || item.product.precio).toLocaleString('es-CO') }}
                      </span>
                    </div>
                  </div>

                  <!-- Controls & Subtotal -->
                  <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#E8D8D0]">
                    <!-- Quantity -->
                    <div class="flex items-center rounded-full bg-[#FDF8F4] border border-[#E8D8D0] p-1">
                      <button (click)="cartService.updateQuantity(item.product.id, item.cantidad - 1)" class="w-7 h-7 rounded-full bg-white text-[#590E2A] font-bold hover:bg-[#D95578] flex items-center justify-center text-xs">
                        -
                      </button>
                      <span class="w-10 text-center text-xs font-bold text-[#590E2A]">{{ item.cantidad }}</span>
                      <button (click)="cartService.updateQuantity(item.product.id, item.cantidad + 1)" class="w-7 h-7 rounded-full bg-white text-[#590E2A] font-bold hover:bg-[#D95578] flex items-center justify-center text-xs">
                        +
                      </button>
                    </div>

                    <!-- Item Subtotal -->
                    <div class="text-right">
                      <span class="text-base font-serif italic text-[#590E2A] block">
                        {{ '$' + itemTotal(item).toLocaleString('es-CO') }}
                      </span>
                      <button (click)="cartService.removeFromCart(item.product.id, item.configuracion_capas)" class="text-[11px] text-[#590E2A]/60 hover:text-[#590E2A] font-bold uppercase tracking-wider">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              }

              <button (click)="cartService.clearCart()" class="text-xs text-[#590E2A]/60 hover:text-[#590E2A] font-bold uppercase tracking-wider">
                🗑️ Vaciar Carrito Completo
              </button>
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-4 bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
              <h2 class="text-lg font-serif italic text-[#590E2A] pb-3 border-b border-[#E8D8D0]">Resumen del Pedido</h2>

              <!-- Cost Summary -->
              <div class="space-y-2.5 text-xs text-[#590E2A]/80 pt-3 border-t border-[#E8D8D0]">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span class="font-bold text-[#590E2A]">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
                </div>

                <div class="flex justify-between">
                  <span>Envío a La Dorada:</span>
                  <span class="font-bold text-[#590E2A]">
                    {{ cartService.shippingCost() === 0 ? '¡GRATIS!' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}
                  </span>
                </div>

                <div class="flex justify-between text-base font-bold text-[#590E2A] pt-3 border-t border-[#E8D8D0]">
                  <span>TOTAL A PAGAR:</span>
                  <span class="text-2xl font-serif italic text-[#590E2A]">{{ '$' + cartService.total().toLocaleString('es-CO') }}</span>
                </div>
              </div>

              <!-- Checkout Button -->
              <a 
                routerLink="/checkout"
                class="w-full py-4 rounded-full bg-[#590E2A] hover:bg-[#3A0A1C] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2">
                <span>Ir a la Pasarela de Pago →</span>
              </a>
            </div>

          </div>
        } @else {
          <div class="text-center py-20 bg-white rounded-[40px] border border-[#E8D8D0] p-8 space-y-4 max-w-lg mx-auto">
            <div class="w-20 h-20 rounded-full bg-[#FDF8F4] text-[#590E2A] flex items-center justify-center mx-auto shadow-xs border border-[#E8D8D0]">
              <span class="material-icons text-3xl">shopping_bag</span>
            </div>
            <h2 class="text-2xl font-serif italic text-[#590E2A]">Tu carrito está vacío</h2>
            <p class="text-[#590E2A]/70 text-xs uppercase tracking-wider">Agrega delicados mochis y postres japoneses de nuestro menú artesanal.</p>
            <a routerLink="/productos" class="inline-block px-8 py-3.5 rounded-full bg-[#590E2A] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest shadow-xs hover:bg-[#3A0A1C] transition-colors">
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
