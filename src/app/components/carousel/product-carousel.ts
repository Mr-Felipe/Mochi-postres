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
    <div class="relative w-full max-w-xl mx-auto group">
      @if (products().length > 0) {
        @let current = products()[currentIndex()];

        <!-- Main Featured Carousel Card -->
        <div class="bg-white rounded-[40px] p-8 shadow-sm border border-[#F0D5CC] hover:shadow-md transition-all duration-300 relative overflow-hidden">
          
          <!-- Offer or Category Badge -->
          <div class="absolute top-8 left-8 z-10 flex items-center gap-2">
            <span class="px-3.5 py-1 rounded-full bg-[#FF758F] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
              {{ current.nombre_japones.split(' ')[0] }}
            </span>
            @if (current.precio_oferta) {
              <span class="px-3 py-1 rounded-full bg-[#FDBA74] text-[#7C2D12] text-[10px] font-black tracking-wider uppercase border border-[#FB923C]">
                OFERTA
              </span>
            }
          </div>

          <!-- Product Image Container -->
          <div class="relative w-full h-72 sm:h-80 rounded-[30px] overflow-hidden bg-[#FDF5F0] mb-6 group/img">
            <img 
              [src]="current.imagen_principal" 
              [alt]="current.nombre_espanol"
              class="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/50 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end p-4">
              <a [routerLink]="['/productos', current.id]" class="w-full py-3 rounded-full bg-[#FDF5F0] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider text-center shadow-md hover:bg-white transition-colors">
                Ver Detalles Completos →
              </a>
            </div>
          </div>

          <!-- Titles & Description -->
          <div class="space-y-2 mb-6">
            <div class="flex items-start justify-between">
              <div>
                <span class="text-xs font-bold text-[#FF758F] uppercase tracking-widest block font-serif italic">
                  {{ current.nombre_japones }}
                </span>
                <h3 class="text-2xl font-serif italic text-[#1A1A1A] font-bold">
                  {{ current.nombre_espanol }}
                </h3>
              </div>
              <div class="text-right">
                @if (current.precio_oferta) {
                  <span class="text-xs text-[#1A1A1A]/50 line-through block font-semibold">
                    {{ '$' + current.precio.toLocaleString('es-CO') }}
                  </span>
                  <span class="text-xl font-serif italic text-[#FF758F] font-bold">
                    {{ '$' + current.precio_oferta.toLocaleString('es-CO') }}
                  </span>
                } @else {
                  <span class="text-xl font-serif italic text-[#1A1A1A] font-bold">
                    {{ '$' + current.precio.toLocaleString('es-CO') }}
                  </span>
                }
              </div>
            </div>

            <p class="text-[#1A1A1A]/80 text-xs sm:text-sm line-clamp-2 leading-relaxed font-sans font-medium">
              {{ current.descripcion_corta }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button 
              (click)="cartService.addToCart(current, 1)"
              class="flex-1 py-3.5 px-6 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm">
              <span class="material-icons text-base">add_shopping_cart</span>
              <span>Añadir al Carrito</span>
            </button>

            <a 
              [routerLink]="['/productos', current.id]"
              class="py-3.5 px-5 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center shadow-xs">
              🔍 Detalle
            </a>
          </div>

          <!-- Carousel Controls: Left & Right Arrows -->
          <button 
            (click)="prevSlide()" 
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FDF5F0]/90 hover:bg-white text-[#1A1A1A] border border-[#F0D5CC] shadow-xs flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-20">
            <span class="material-icons text-xl">chevron_left</span>
          </button>

          <button 
            (click)="nextSlide()" 
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FDF5F0]/90 hover:bg-white text-[#1A1A1A] border border-[#F0D5CC] shadow-xs flex items-center justify-center transition-transform hover:scale-110 active:scale-90 z-20">
            <span class="material-icons text-xl">chevron_right</span>
          </button>
        </div>

        <!-- Dots Indicator Navigation -->
        <div class="flex items-center justify-center gap-2 mt-4">
          @for (prod of products(); track prod.id; let i = $index) {
            <button 
              (click)="goToSlide(i)"
              [class]="i === currentIndex() ? 'w-8 bg-[#FF758F]' : 'w-2.5 bg-[#F0D5CC] hover:bg-[#FF758F]/50'"
              class="h-2.5 rounded-full transition-all duration-300 focus:outline-none"
              [attr.aria-label]="'Ver producto ' + (i + 1)">
            </button>
          }
        </div>
      }
    </div>
  `
})
export class ProductCarouselComponent implements OnDestroy {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);

  products = this.dataService.featuredProducts;
  currentIndex = signal(0);
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startAutoPlay();
  }

  startAutoPlay() {
    if (typeof window !== 'undefined') {
      this.autoPlayTimer = setInterval(() => {
        this.nextSlide();
      }, 5000);
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
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }
}
