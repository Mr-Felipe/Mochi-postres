import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

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
                        Precio Unitario: {{ '$' + (item.product.precio_oferta || item.product.precio).toLocaleString('es-CO') }}
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
                        {{ '$' + (item.cantidad * (item.product.precio_oferta || item.product.precio)).toLocaleString('es-CO') }}
                      </span>
                      <button (click)="cartService.removeFromCart(item.product.id)" class="text-[11px] text-[#590E2A]/60 hover:text-[#590E2A] font-bold uppercase tracking-wider">
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

            <!-- Order Summary & Coupon -->
            <div class="lg:col-span-4 bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
              <h2 class="text-lg font-serif italic text-[#590E2A] pb-3 border-b border-[#E8D8D0]">Resumen del Pedido</h2>

              <!-- Coupon Code Section -->
              <div class="space-y-2">
                <label for="coupon-input" class="text-xs font-bold uppercase tracking-wider text-[#590E2A] block">¿Tienes un Cupón de Descuento?</label>
                <div class="flex gap-2">
                  <input 
                    #couponInput 
                    id="coupon-input"
                    type="text" 
                    placeholder="MOCHI10"
                    class="flex-1 px-4 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-xs text-[#590E2A] focus:outline-none focus:border-[#590E2A] font-mono uppercase"
                  />
                  <button 
                    (click)="applyCoupon(couponInput.value); couponInput.value=''"
                    class="px-5 py-2.5 rounded-full bg-[#590E2A] text-[#FDF8F4] font-bold text-xs uppercase tracking-wider hover:bg-[#3A0A1C] transition-colors">
                    Aplicar
                  </button>
                </div>

                @if (couponMessage()) {
                  <p [class]="couponSuccess() ? 'text-[#2C5350]' : 'text-[#8C3A3A]'" class="text-xs font-semibold">
                    {{ couponMessage() }}
                  </p>
                }

                @if (cartService.appliedCoupon()) {
                  <div class="flex items-center justify-between p-3 rounded-full bg-[#E0F2F1] text-[#2C5350] text-xs border border-[#b2dfdb] font-semibold uppercase tracking-wider">
                    <span>Cupón {{ cartService.appliedCoupon()?.codigo }} activo</span>
                    <button (click)="cartService.removeCoupon()" class="text-[#8C3A3A] font-bold">Remover</button>
                  </div>
                }
              </div>

              <!-- Cost Summary -->
              <div class="space-y-2.5 text-xs text-[#590E2A]/80 pt-3 border-t border-[#E8D8D0]">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span class="font-bold text-[#590E2A]">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
                </div>

                @if (cartService.couponDiscount() > 0) {
                  <div class="flex justify-between text-[#2C5350] font-bold">
                    <span>Descuento Cupón:</span>
                    <span>-{{ '$' + cartService.couponDiscount().toLocaleString('es-CO') }}</span>
                  </div>
                }

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
            <div class="w-20 h-20 rounded-full bg-[#D95578] text-[#590E2A] flex items-center justify-center mx-auto text-3xl shadow-xs border border-[#E8D8D0]">
              🛍️
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

  couponMessage = signal<string | null>(null);
  couponSuccess = signal<boolean>(false);

  applyCoupon(code: string) {
    if (!code) return;
    const res = this.cartService.applyCouponCode(code);
    this.couponMessage.set(res.message);
    this.couponSuccess.set(res.success);
  }
}
