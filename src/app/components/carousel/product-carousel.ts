import { Component, inject, signal, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
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
              class="absolute inset-0 rounded-3xl cursor-pointer"
              [style.z-index]="getZIndex(i)"
              [style.transform]="getTransform(i)"
              [style.opacity]="getOpacity(i)"
              [style.transform-origin]="'bottom center'"
              [style.transition]="'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)'"
              [routerLink]="['/productos', prod.id]">

              <div class="w-full h-full rounded-3xl overflow-hidden border border-white/5 bg-white"
                [style.box-shadow]="getShadow(i)">

                <!-- Image -->
                <div class="relative h-[14rem] overflow-hidden bg-[#FDF8F4]">
                  <img
                    [src]="prod.imagen_principal"
                    [alt]="prod.nombre_espanol"
                    class="w-full h-full object-cover" />
                  <div class="absolute inset-0 transition-all duration-700"
                    [style.background]="getOverlay(i)">
                  </div>
                  <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-white transition-all duration-700"
                    [style.background]="getTagBg(i)">
                    {{ prod.nombre_japones.split(' ')[0] }}
                  </span>
                  @if (prod.precio_oferta) {
                    <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#FDBA74] text-[#7C2D12] text-[7px] font-black uppercase"
                      [style.opacity]="isActive(i) ? 1 : 0.5">
                      OFERTA
                    </span>
                  }
                </div>

                <!-- Body -->
                <div class="p-4 h-[8rem] flex flex-col justify-between bg-white">
                  <div>
                    <span class="text-[8px] font-bold text-[#D95578] uppercase tracking-wider block mb-0.5 font-serif italic">
                      {{ prod.nombre_japones }}
                    </span>
                    <h3 class="text-sm font-serif italic text-[#590E2A] font-bold leading-tight">
                      {{ prod.nombre_espanol }}
                    </h3>
                    <p class="text-[9px] text-[#590E2A]/50 mt-0.5 line-clamp-1">
                      {{ prod.descripcion_corta }}
                    </p>
                  </div>
                  <div class="flex items-center justify-between pt-1.5 border-t border-[#E8D8D0]">
                    @if (prod.precio_oferta) {
                      <span class="text-xs font-serif italic font-bold text-[#D95578]">
                        {{ '$' + prod.precio_oferta.toLocaleString('es-CO') }}
                      </span>
                    } @else {
                      <span class="text-xs font-serif italic font-bold text-[#590E2A]">
                        {{ '$' + prod.precio.toLocaleString('es-CO') }}
                      </span>
                    }
                    <button
                      (click)="cartService.addToCart(prod, 1); $event.stopPropagation()"
                      class="w-7 h-7 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white flex items-center justify-center transition-all active:scale-90"
                      title="Añadir al Carrito">
                      <span class="material-icons" style="font-size: 14px">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }

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

  products = this.dataService.activeProducts;
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
    const total = this.products().length;
    if (total === 0) return;
    this.currentIndex.set((this.currentIndex() + 1) % total);
  }

  prevSlide() {
    const total = this.products().length;
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
    const total = this.products().length;
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

  getTagBg(index: number): string {
    const rel = Math.abs(this.getRelative(index));
    if (rel === 0) return '#D95578';
    return 'rgba(255,255,255,0.25)';
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }
}
