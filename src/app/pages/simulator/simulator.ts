import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/mochi.models';

interface SimulatedItem {
  product: Product;
  cantidad: number;
}

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FAF7F2] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <!-- Header -->
        <div class="bg-white rounded-[40px] p-8 sm:p-12 border border-[#EBE3D5] shadow-xs text-center max-w-3xl mx-auto space-y-3">
          <span class="px-4 py-1.5 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#EBE3D5]">
            🧮 Cotizador Interactivo
          </span>
          <h1 class="text-3xl sm:text-4xl font-serif italic text-[#4A3F35]">
            Simulador de Pedidos en Línea
          </h1>
          <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider leading-relaxed">
            Arma tu combinación ideal de mochis y postres japoneses, calcula el domicilio exacto en La Dorada y conoce el tiempo estimado de entrega sin compromiso.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Product Selection Grid -->
          <div class="lg:col-span-7 bg-white rounded-[32px] border border-[#EBE3D5] p-6 shadow-xs space-y-6">
            <h2 class="text-xl font-serif italic text-[#4A3F35] flex items-center gap-2">
              <span>🍡</span>
              <span>Selecciona tus Postres para la Simulación</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              @for (prod of activeProducts(); track prod.id) {
                @let simulatedQty = getItemQuantity(prod.id);

                <div class="p-4 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] hover:border-[#4A3F35]/40 transition-all flex flex-col justify-between space-y-3">
                  <div class="flex items-start gap-3">
                    <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-16 h-16 rounded-2xl object-cover flex-shrink-0">
                    <div>
                      <span class="text-[10px] font-bold text-[#4A3F35]/60 font-serif italic uppercase tracking-wider block">{{ prod.nombre_japones }}</span>
                      <h3 class="font-serif italic text-[#4A3F35] text-sm leading-snug">{{ prod.nombre_espanol }}</h3>
                      <span class="text-xs font-serif italic text-[#4A3F35] font-bold mt-1 block">
                        {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                      </span>
                    </div>
                  </div>

                  <!-- Controls -->
                  <div class="flex items-center justify-between pt-2 border-t border-[#EBE3D5]">
                    <span class="text-[11px] text-[#4A3F35]/70 font-medium">Subtotal: {{ '$' + (simulatedQty * (prod.precio_oferta || prod.precio)).toLocaleString('es-CO') }}</span>
                    
                    <div class="flex items-center rounded-full bg-white border border-[#EBE3D5] p-1">
                      <button (click)="updateQuantity(prod, -1)" class="w-6 h-6 rounded-full bg-[#FAF7F2] text-[#4A3F35] font-bold hover:bg-[#FFD6E0] transition-colors flex items-center justify-center text-xs">
                        -
                      </button>
                      <span class="w-7 text-center text-xs font-bold text-[#4A3F35]">{{ simulatedQty }}</span>
                      <button (click)="updateQuantity(prod, 1)" class="w-6 h-6 rounded-full bg-[#FAF7F2] text-[#4A3F35] font-bold hover:bg-[#FFD6E0] transition-colors flex items-center justify-center text-xs">
                        +
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Right Column: Quote Summary Panel -->
          <div class="lg:col-span-5 bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs sticky top-28 space-y-6">
            <h2 class="text-xl font-serif italic text-[#4A3F35] pb-4 border-b border-[#EBE3D5] flex items-center gap-2">
              <span>📋</span>
              <span>Resumen de Simulación</span>
            </h2>

            <!-- Selected Items List -->
            @if (simulatedItems().length > 0) {
              <div class="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                @for (item of simulatedItems(); track item.product.id) {
                  <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF7F2]">
                    <div>
                      <span class="font-serif italic text-[#4A3F35] block text-sm">{{ item.product.nombre_espanol }}</span>
                      <span class="text-[10px] text-[#4A3F35]/60">x{{ item.cantidad }} a {{ '$' + (item.product.precio_oferta || item.product.precio).toLocaleString('es-CO') }} c/u</span>
                    </div>
                    <span class="font-serif italic text-[#4A3F35]">
                      {{ '$' + (item.cantidad * (item.product.precio_oferta || item.product.precio)).toLocaleString('es-CO') }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <div class="p-6 text-center text-[#4A3F35]/60 text-xs rounded-2xl bg-[#FAF7F2] border border-dashed border-[#EBE3D5]">
                Selecciona postres de la lista de la izquierda para comenzar a simular.
              </div>
            }

            <!-- Delivery Options Selector -->
            <div class="space-y-2 pt-2">
              <span class="text-xs font-bold text-[#4A3F35] block uppercase tracking-wider text-[10px]">Tipo de Entrega:</span>
              <div class="grid grid-cols-2 gap-3">
                <button 
                  (click)="tipoEntrega.set('domicilio')"
                  [class]="tipoEntrega() === 'domicilio' ? 'bg-[#FFD6E0] text-[#4A3F35] border-[#4A3F35]' : 'bg-[#FAF7F2] text-[#4A3F35] border-[#EBE3D5]'"
                  class="p-3 rounded-full border text-xs font-bold transition-all text-center uppercase tracking-wider">
                  🚗 Domicilio
                </button>
                <button 
                  (click)="tipoEntrega.set('recogida')"
                  [class]="tipoEntrega() === 'recogida' ? 'bg-[#FFD6E0] text-[#4A3F35] border-[#4A3F35]' : 'bg-[#FAF7F2] text-[#4A3F35] border-[#EBE3D5]'"
                  class="p-3 rounded-full border text-xs font-bold transition-all text-center uppercase tracking-wider">
                  🏪 Recoger en Local
                </button>
              </div>
            </div>

            <!-- Free Delivery Progress Bar -->
            @if (tipoEntrega() === 'domicilio') {
              <div class="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-xs space-y-1.5">
                @if (subtotal() >= config().montoEnvioGratis) {
                  <span class="font-bold text-[#2C5350] flex items-center gap-1 uppercase tracking-wider text-[11px]">
                    🎉 ¡Felicidades! Tienes envío GRATIS a todo La Dorada.
                  </span>
                } @else {
                  <div class="flex justify-between text-[#4A3F35]">
                    <span>Faltan <strong>{{ '$' + (config().montoEnvioGratis - subtotal()).toLocaleString('es-CO') }}</strong> para Envío Gratis</span>
                    <span>{{ Math.round((subtotal() / config().montoEnvioGratis) * 100) }}%</span>
                  </div>
                  <div class="w-full bg-[#EBE3D5] rounded-full h-2 overflow-hidden">
                    <div class="bg-[#4A3F35] h-2 rounded-full transition-all duration-300" [style.width.%]="Math.min(100, (subtotal() / config().montoEnvioGratis) * 100)"></div>
                  </div>
                }
              </div>
            }

            <!-- Costs Breakdown -->
            <div class="space-y-2 text-xs pt-2 border-t border-[#EBE3D5]">
              <div class="flex justify-between text-[#4A3F35]/80">
                <span>Subtotal Postres:</span>
                <span class="font-bold text-[#4A3F35]">{{ '$' + subtotal().toLocaleString('es-CO') }}</span>
              </div>
              <div class="flex justify-between text-[#4A3F35]/80">
                <span>Costo de Envío (La Dorada):</span>
                <span class="font-bold text-[#4A3F35]">
                  {{ costoEnvio() === 0 ? '¡GRATIS!' : '$' + costoEnvio().toLocaleString('es-CO') }}
                </span>
              </div>
              <div class="flex justify-between text-[#4A3F35]/80">
                <span>Tiempo Estimado:</span>
                <span class="font-bold text-[#2C5350]">45 - 60 minutos</span>
              </div>
              <div class="flex justify-between text-base font-bold text-[#4A3F35] pt-3 border-t border-[#EBE3D5]">
                <span>TOTAL ESTIMADO:</span>
                <span class="text-2xl font-serif italic text-[#4A3F35]">{{ '$' + total().toLocaleString('es-CO') }}</span>
              </div>
            </div>

            <!-- Transfer Simulated Order to Real Cart -->
            <button 
              [disabled]="simulatedItems().length === 0"
              (click)="transferToCart()"
              class="w-full py-4 rounded-full bg-[#4A3F35] hover:bg-[#362D26] disabled:opacity-50 text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
              <span>Llevar este Pedido al Checkout →</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SimulatorPageComponent {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);
  router = inject(Router);

  Math = Math;
  config = this.dataService.visualConfig;
  activeProducts = this.dataService.activeProducts;

  simulatedItems = signal<SimulatedItem[]>([
    { product: this.activeProducts()[0], cantidad: 2 },
    { product: this.activeProducts()[2], cantidad: 1 }
  ]);

  tipoEntrega = signal<'domicilio' | 'recogida'>('domicilio');

  getItemQuantity(productId: number): number {
    const found = this.simulatedItems().find(i => i.product.id === productId);
    return found ? found.cantidad : 0;
  }

  updateQuantity(product: Product, delta: number) {
    const current = this.simulatedItems();
    const existingIndex = current.findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      const newQty = current[existingIndex].cantidad + delta;
      if (newQty <= 0) {
        this.simulatedItems.set(current.filter(i => i.product.id !== product.id));
      } else {
        const updated = [...current];
        updated[existingIndex] = { ...updated[existingIndex], cantidad: newQty };
        this.simulatedItems.set(updated);
      }
    } else if (delta > 0) {
      this.simulatedItems.set([...current, { product, cantidad: delta }]);
    }
  }

  subtotal = computed(() => {
    return this.simulatedItems().reduce((sum, item) => {
      const price = item.product.precio_oferta || item.product.precio;
      return sum + (price * item.cantidad);
    }, 0);
  });

  costoEnvio = computed(() => {
    if (this.tipoEntrega() === 'recogida') return 0;
    if (this.subtotal() >= this.config().montoEnvioGratis) return 0;
    return this.config().costoEnvioBase;
  });

  total = computed(() => {
    return this.subtotal() + this.costoEnvio();
  });

  transferToCart() {
    this.cartService.clearCart();
    for (const item of this.simulatedItems()) {
      this.cartService.addToCart(item.product, item.cantidad);
    }
    this.cartService.setDeliveryType(this.tipoEntrega());
    this.router.navigate(['/checkout']);
  }
}
