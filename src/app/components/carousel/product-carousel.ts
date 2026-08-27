import { Component, inject, signal, computed, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full overflow-visible">
      @if (products().length > 0) {
        <!-- Arc Container -->
        <div class="relative mx-auto" style="width: 16rem; height: 24rem; perspective: 800px;">

          @for (prod of products(); track prod.id; let i = $index) {
            <div
              class="absolute inset-0 rounded-[32px] cursor-pointer"
              [style.z-index]="getZIndex(i)"
              [style.transform]="getTransform(i)"
              [style.opacity]="getOpacity(i)"
              [style.transform-origin]="'bottom center'"
              [style.transition]="'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)'"
              [routerLink]="['/productos', prod.id]">

              <div class="w-full h-full rounded-[32px] overflow-hidden border border-[#E8D8D0] bg-white"
                [style.box-shadow]="getShadow(i)">

                <!-- Image -->
                <div class="relative h-72 overflow-hidden bg-[#FDF8F4]">
                  <img
                    [src]="prod.imagen_principal"
                    [alt]="prod.nombre_espanol"
                    class="w-full h-full object-cover" />
                  <div class="absolute inset-0 transition-all duration-700"
                    [style.background]="getOverlay(i)">
                  </div>
                  <span class="absolute top-3 left-3 px-3 py-1 rounded-tl-[32px] rounded-br-2xl bg-[#D95578]/90 backdrop-blur-md text-[#FDF8F4] text-xs font-bold uppercase tracking-wider transition-all duration-700">
                    {{ (prod.nombre_japones || '').split(' ')[0] }}
                  </span>
                </div>

                <!-- Body -->
                <div class="p-2 h-[5rem] flex flex-col justify-between bg-white">
                  <div>
                    <div class="flex items-center justify-between">
                      <h3 class="text-base font-serif italic text-[#590E2A] font-bold leading-tight">
                        {{ prod.nombre_espanol }}
                      </h3>
                      <span class="text-[#590E2A] font-bold flex items-center gap-0.5 text-[10px] shrink-0 ml-1">
                        <span class="material-icons text-[10px] text-amber-500">star</span>
                        {{ prod.calificacion }}
                      </span>
                    </div>
                  </div>
                  <div class="pt-1.5 border-t border-[#E8D8D0]/60 flex items-center justify-between">
                    <span class="text-sm font-serif italic font-bold text-[#590E2A]">
                      {{ '$' + prod.precio.toLocaleString('es-CO') }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <button
                        (click)="cartService.addToCart(prod, 1); $event.stopPropagation()"
                        class="w-8 h-8 rounded-xl bg-[#D95578] hover:bg-[#FF6078] text-[#FDF8F4] flex items-center justify-center transition-all active:scale-90"
                        title="Añadir al Carrito">
                        <span class="material-icons text-base">add_shopping_cart</span>
                      </button>
                      <a [routerLink]="['/productos', prod.id]" (click)="$event.stopPropagation()" class="px-2.5 h-8 rounded-xl bg-[#590E2A] hover:bg-[#7A1540] text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-all active:scale-95">
                        Ver
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Personalizado Card -->
          <div
            class="absolute inset-0 rounded-[32px] cursor-pointer"
            [style.z-index]="getZIndex(products().length)"
            [style.transform]="getTransform(products().length)"
            [style.opacity]="getOpacity(products().length)"
            [style.transform-origin]="'bottom center'"
            [style.transition]="'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)'"
            routerLink="/personalizar-vaso">

            <div class="w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-br from-[#D95578] to-[#A33D5E] text-white flex flex-col"
              [style.box-shadow]="getShadow(products().length)">
              <div class="relative h-72 flex items-center justify-center overflow-hidden">
                <span class="material-icons text-white/20 text-[100px] group-hover:scale-110 transition-transform duration-500">local_cafe</span>
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <span class="absolute top-3 left-3 px-3 py-1 rounded-tl-[32px] rounded-br-2xl bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30">
                  Tú lo armas
                </span>
              </div>
              <div class="p-2 h-[5rem] flex flex-col justify-between bg-gradient-to-br from-[#D95578] to-[#A33D5E]">
                <div>
                  <span class="font-serif italic font-bold text-white/80 text-[10px] block mb-0.5">カスタム</span>
                  <h3 class="text-sm font-serif italic text-white font-bold">Personalizado</h3>
                  <p class="text-white/60 text-[9px] mt-0.5 leading-tight">Elige base, crema, relleno y topping</p>
                </div>
                <div class="flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-wider pt-1.5 border-t border-white/20">
                  <span class="material-icons text-sm">arrow_forward</span> Crear mi vaso
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Controls — OUTSIDE the arc, below the cards -->
        <div class="relative z-50 flex items-center justify-center gap-3 mt-4">
          <button (click)="prevSlide()"
            class="w-9 h-9 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-center text-[#590E2A] hover:bg-[#D95578] hover:text-white hover:border-transparent transition-all">
            <span class="material-icons" style="font-size: 16px">chevron_left</span>
          </button>

          @for (prod of products(); track prod.id; let i = $index) {
            <button (click)="goToSlide(i)"
              class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
              [style.background]="i === currentIndex() ? '#D95578' : '#FDF8F4'"
              [style.color]="i === currentIndex() ? 'white' : '#590E2A'"
              [style.border]="i === currentIndex() ? 'none' : '1px solid #E8D8D0'">
              {{ i + 1 }}
            </button>
          }
          <!-- Personalizado dot -->
          <button (click)="goToSlide(products().length)"
            class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300"
            [style.background]="currentIndex() === products().length ? '#D95578' : '#FDF8F4'"
            [style.color]="currentIndex() === products().length ? 'white' : '#590E2A'"
            [style.border]="currentIndex() === products().length ? 'none' : '1px solid #E8D8D0'">
            <span class="material-icons" style="font-size: 12px">local_drink</span>
          </button>

          <button (click)="nextSlide()"
            class="w-9 h-9 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-center text-[#590E2A] hover:bg-[#D95578] hover:text-white hover:border-transparent transition-all">
            <span class="material-icons" style="font-size: 16px">chevron_right</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ProductCarouselComponent implements OnDestroy {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);

  products = computed(() => this.dataService.activeProducts().filter(p => p.id !== 25));
  currentIndex = signal(0);
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startAutoPlay();
  }

  startAutoPlay() {
    if (typeof window !== 'undefined') {
      this.autoPlayTimer = setInterval(() => {
        this.nextSlide();
      }, 4500);
    }
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }

  nextSlide() {
    const total = this.products().length + 1;
    if (total === 0) return;
    this.currentIndex.set((this.currentIndex() + 1) % total);
  }

  prevSlide() {
    const total = this.products().length + 1;
    if (total === 0) return;
    this.currentIndex.set((this.currentIndex() - 1 + total) % total);
  }

  goToSlide(index: number) {
    this.currentIndex.set(index);
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  isActive(index: number): boolean {
    return index === this.currentIndex();
  }

  private getRelative(index: number): number {
    const total = this.products().length + 1;
    if (total === 0) return 0;
    let rel = index - this.currentIndex();
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;
    return rel;
  }

  getTransform(index: number): string {
    const rel = this.getRelative(index);
    const arcAngle = 25;
    const radius = 340;
    const angle = rel * arcAngle;
    const rad = (angle * Math.PI) / 180;

    const x = Math.sin(rad) * radius;
    const y = (1 - Math.cos(rad)) * radius * 0.55;
    const rotate = angle;
    const scale = rel === 0 ? 1.12 : 0.85;

    return `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
  }

  getZIndex(index: number): number {
    const rel = Math.abs(this.getRelative(index));
    if (rel === 0) return 30;
    if (rel === 1) return 20;
    return 10;
  }

  getOpacity(index: number): number {
    const rel = Math.abs(this.getRelative(index));
    if (rel === 0) return 1;
    if (rel === 1) return 0.85;
    return 0;
  }

  getShadow(index: number): string {
    const rel = Math.abs(this.getRelative(index));
    if (rel === 0) return '0 25px 60px -12px rgba(217,85,120,0.35)';
    return '0 12px 30px -8px rgba(89,14,42,0.15)';
  }

  getOverlay(index: number): string {
    const rel = Math.abs(this.getRelative(index));
    if (rel === 0) return 'transparent';
    return 'linear-gradient(180deg, rgba(89,14,42,0.15) 0%, rgba(89,14,42,0.35) 100%)';
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }
}
