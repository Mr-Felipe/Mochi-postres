import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cartService.isDrawerOpen()) {
      <!-- Backdrop Backdrop Overlay -->
      <div 
        (click)="cartService.closeDrawer()" 
        class="fixed inset-0 z-50 bg-[#4A3F35]/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        aria-hidden="true">
      </div>

      <!-- Slide-Over Drawer Panel -->
      <aside 
        class="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#FAF7F2] text-[#4A3F35] shadow-2xl flex flex-col justify-between border-l border-[#EBE3D5] animate-slideLeft">
        
        <!-- Header -->
        <div class="p-5 sm:p-6 bg-white border-b border-[#EBE3D5] flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-[#FFD6E0] text-[#4A3F35] flex items-center justify-center font-serif italic text-lg border border-[#EBE3D5]">
              🍡
            </div>
            <div>
              <h2 class="font-serif italic text-xl text-[#4A3F35] leading-none">Tu Carrito de Mochis</h2>
              <span class="text-[10px] text-[#4A3F35]/60 uppercase tracking-widest block mt-0.5">
                {{ cartService.itemCount() }} {{ cartService.itemCount() === 1 ? 'producto seleccionado' : 'productos seleccionados' }}
              </span>
            </div>
          </div>

          <button 
            (click)="cartService.closeDrawer()"
            class="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#4A3F35] hover:bg-[#FFD6E0] font-bold transition-colors flex items-center justify-center text-sm"
            title="Cerrar Carrito">
            ✕
          </button>
        </div>

        <!-- Free Delivery Progress Bar -->
        <div class="bg-[#FFD6E0]/40 px-6 py-2.5 border-b border-[#EBE3D5] text-xs">
          @if (cartService.subtotal() >= config().montoEnvioGratis) {
            <span class="font-bold text-[#2C5350] flex items-center gap-1.5 text-[11px]">
              🎉 ¡Genial! Tu pedido tiene Domicilio GRATIS en La Dorada
            </span>
          } @else {
            <div class="flex items-center justify-between text-[#4A3F35] text-[11px] mb-1">
              <span>Faltan <strong>{{ '$' + (config().montoEnvioGratis - cartService.subtotal()).toLocaleString('es-CO') }}</strong> para Domicilio Gratis</span>
              <span class="font-mono font-bold">{{ Math.round((cartService.subtotal() / config().montoEnvioGratis) * 100) }}%</span>
            </div>
            <div class="w-full bg-[#EBE3D5] rounded-full h-1.5 overflow-hidden">
              <div class="bg-[#4A3F35] h-1.5 rounded-full transition-all duration-300" [style.width.%]="Math.min(100, (cartService.subtotal() / config().montoEnvioGratis) * 100)"></div>
            </div>
          }
        </div>

        <!-- Scrollable Items List -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          @if (cartService.items().length > 0) {
            @for (item of cartService.items(); track item.product.id) {
              <div class="bg-white rounded-[24px] p-4 border border-[#EBE3D5] shadow-2xs flex gap-3.5 items-center relative group">
                
                <!-- Product Image -->
                <img [src]="item.product.imagen_principal" [alt]="item.product.nombre_espanol" class="w-16 h-16 rounded-2xl object-cover flex-shrink-0 bg-[#FAF7F2]">

                <!-- Details -->
                <div class="flex-1 min-w-0 space-y-1">
                  <span class="text-[9px] font-serif italic text-[#4A3F35]/60 uppercase tracking-wider block font-bold">
                    {{ item.product.nombre_japones }}
                  </span>
                  <h3 class="text-sm font-serif italic text-[#4A3F35] truncate leading-tight">
                    {{ item.product.nombre_espanol }}
                  </h3>
                  
                  <div class="flex items-center justify-between pt-1">
                    <span class="text-xs font-bold text-[#4A3F35]">
                      {{ '$' + ((item.product.precio_oferta || item.product.precio) * item.cantidad).toLocaleString('es-CO') }}
                    </span>

                    <!-- Quantity Control Buttons -->
                    <div class="flex items-center rounded-full bg-[#FAF7F2] border border-[#EBE3D5] p-0.5">
                      <button 
                        (click)="cartService.updateQuantity(item.product.id, item.cantidad - 1)"
                        class="w-6 h-6 rounded-full bg-white text-[#4A3F35] hover:bg-[#FFD6E0] font-bold text-xs flex items-center justify-center transition-colors">
                        -
                      </button>
                      <span class="w-6 text-center text-xs font-bold text-[#4A3F35] font-mono">{{ item.cantidad }}</span>
                      <button 
                        (click)="cartService.updateQuantity(item.product.id, item.cantidad + 1)"
                        class="w-6 h-6 rounded-full bg-white text-[#4A3F35] hover:bg-[#FFD6E0] font-bold text-xs flex items-center justify-center transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Remove Item Button -->
                <button 
                  (click)="cartService.removeFromCart(item.product.id)"
                  class="text-[#8C3A3A] hover:bg-rose-50 p-1.5 rounded-full transition-colors"
                  title="Eliminar producto">
                  <span class="material-icons text-base">delete_outline</span>
                </button>
              </div>
            }
          } @else {
            <div class="text-center py-12 px-4 space-y-4">
              <div class="w-20 h-20 rounded-full bg-[#FFD6E0]/60 text-[#4A3F35] flex items-center justify-center text-3xl mx-auto border border-[#EBE3D5]">
                🍡
              </div>
              <div class="space-y-1">
                <h3 class="font-serif italic text-xl text-[#4A3F35]">Tu Carrito está Vacío</h3>
                <p class="text-xs text-[#4A3F35]/70 max-w-xs mx-auto leading-relaxed">
                  Añade tus mochis favoritos, postres artesanales o bebidas de Matcha para deleitarte hoy.
                </p>
              </div>
              <button 
                (click)="goTo('/productos')"
                class="px-6 py-3 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs hover:bg-[#362D26] transition-colors inline-block">
                Explorar Catálogo →
              </button>
            </div>
          }
        </div>

        <!-- Sticky Footer Summary & Action Buttons -->
        @if (cartService.items().length > 0) {
          <div class="p-5 sm:p-6 bg-white border-t border-[#EBE3D5] space-y-4 shadow-lg">
            
            <!-- Coupon Code Entry Bar -->
            <div class="space-y-1.5">
              @if (!cartService.appliedCoupon()) {
                <div class="flex gap-2">
                  <input 
                    #cInput 
                    type="text" 
                    placeholder="Código de Cupón (Ej. MOCHI10)" 
                    class="flex-1 px-3.5 py-2 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-xs text-[#4A3F35] uppercase placeholder:normal-case focus:outline-none focus:border-[#4A3F35]">
                  <button 
                    (click)="applyCoupon(cInput.value); cInput.value=''"
                    class="px-4 py-2 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider hover:bg-[#362D26] transition-colors">
                    Aplicar
                  </button>
                </div>
              } @else {
                <div class="p-2.5 rounded-full bg-[#E0F2F1] border border-[#b2dfdb] flex items-center justify-between text-xs text-[#2C5350]">
                  <span class="font-bold flex items-center gap-1">
                    🏷️ Cupón: {{ cartService.appliedCoupon()?.codigo }}
                  </span>
                  <button (click)="cartService.removeCoupon()" class="text-[#8C3A3A] font-bold hover:underline text-[11px]">
                    Quitar
                  </button>
                </div>
              }

              @if (couponMessage()) {
                <p [class]="couponSuccess() ? 'text-[#2C5350]' : 'text-[#8C3A3A]'" class="text-[11px] font-bold px-1">
                  {{ couponMessage() }}
                </p>
              }
            </div>

            <!-- Price Breakdown -->
            <div class="space-y-1.5 text-xs text-[#4A3F35]">
              <div class="flex justify-between">
                <span class="text-[#4A3F35]/80">Subtotal:</span>
                <span class="font-bold">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
              </div>

              @if (cartService.couponDiscount() > 0) {
                <div class="flex justify-between text-[#2C5350]">
                  <span>Descuento Cupón:</span>
                  <span class="font-bold">-{{ '$' + cartService.couponDiscount().toLocaleString('es-CO') }}</span>
                </div>
              }

              <div class="flex justify-between">
                <span class="text-[#4A3F35]/80">Domicilio Estimado:</span>
                <span class="font-bold text-[#2C5350]">
                  {{ cartService.shippingCost() === 0 ? '¡GRATIS!' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}
                </span>
              </div>

              <div class="flex justify-between text-lg font-serif italic text-[#4A3F35] font-bold pt-2 border-t border-[#EBE3D5]">
                <span>Total a Pagar:</span>
                <span class="text-xl font-sans not-italic font-bold text-[#4A3F35]">
                  {{ '$' + cartService.total().toLocaleString('es-CO') }}
                </span>
              </div>
            </div>

            <!-- Action Buttons: Finalizar Compra -> Redirects to /carrito -->
            <div class="space-y-2 pt-1">
              <button 
                (click)="goTo('/carrito')"
                class="w-full py-3.5 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-md transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2">
                <span>Finalizar Compra (Ir al Carrito) →</span>
              </button>

              <button 
                (click)="goTo('/checkout')"
                class="w-full py-2.5 rounded-full bg-[#FFD6E0] hover:bg-[#ffb6c1] text-[#4A3F35] font-bold text-xs uppercase tracking-wider border border-[#EBE3D5] transition-colors flex items-center justify-center gap-2">
                <span>⚡ Proceder al Checkout Directo</span>
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
  dataService = inject(MochiDataService);
  router = inject(Router);

  Math = Math;
  config = this.dataService.visualConfig;

  couponMessage = signal<string>('');
  couponSuccess = signal<boolean>(false);

  applyCoupon(code: string) {
    if (!code.trim()) return;
    const res = this.cartService.applyCouponCode(code);
    this.couponSuccess.set(res.success);
    this.couponMessage.set(res.message);
    setTimeout(() => this.couponMessage.set(''), 4000);
  }

  goTo(path: string) {
    this.cartService.closeDrawer();
    this.router.navigate([path]);
  }
}
