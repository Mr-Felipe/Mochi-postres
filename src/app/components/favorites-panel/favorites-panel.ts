import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/mochi.models';

@Component({
  selector: 'app-favorites-panel',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Overlay -->
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity"
        (click)="close()"></div>
    }

    <!-- Panel -->
    <div class="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col"
      [class.translate-x-full]="!isOpen()"
      [class.translate-x-0]="isOpen()">

      <!-- Header -->
      <div class="flex items-center justify-between p-5 border-b border-[#F0D5CC]">
        <div class="flex items-center gap-2">
          <span class="material-icons text-[#FF758F]">favorite</span>
          <h2 class="text-lg font-serif italic font-bold text-[#1A1A1A]">Mis Favoritos</h2>
          <span class="ml-1 px-2 py-0.5 rounded-full bg-[#FF758F]/10 text-[#FF758F] text-[10px] font-bold">
            {{ favoriteProducts().length }}
          </span>
        </div>
        <button (click)="close()" class="w-8 h-8 rounded-full bg-[#FDF5F0] flex items-center justify-center text-[#1A1A1A] hover:bg-[#FF758F] hover:text-white transition-colors">
          <span class="material-icons" style="font-size: 18px">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5 space-y-3">
        @if (favoriteProducts().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center py-12">
            <span class="material-icons text-5xl text-[#F0D5CC] mb-3">favorite_border</span>
            <p class="text-sm text-[#1A1A1A]/60 font-medium">No tienes favoritos aún</p>
            <p class="text-xs text-[#1A1A1A]/40 mt-1">Toca el corazón en cualquier producto para guardarlo aquí</p>
          </div>
        } @else {
          @for (prod of favoriteProducts(); track prod.id) {
            <div class="flex gap-3 p-3 rounded-2xl bg-[#FDF5F0] border border-[#F0D5CC] group hover:shadow-md transition-shadow">
              <!-- Image -->
              <a [routerLink]="['/productos', prod.id]" (click)="close()" class="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover" />
              </a>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <a [routerLink]="['/productos', prod.id]" (click)="close()" class="block">
                  <span class="text-[8px] font-bold text-[#FF758F] uppercase tracking-wider font-serif italic">{{ prod.nombre_japones }}</span>
                  <h4 class="text-xs font-serif italic font-bold text-[#1A1A1A] truncate">{{ prod.nombre_espanol }}</h4>
                </a>
                <div class="flex items-center justify-between mt-1.5">
                  @if (prod.precio_oferta) {
                    <span class="text-xs font-serif italic font-bold text-[#FF758F]">{{ '$' + prod.precio_oferta.toLocaleString('es-CO') }}</span>
                  } @else {
                    <span class="text-xs font-serif italic font-bold text-[#1A1A1A]">{{ '$' + prod.precio.toLocaleString('es-CO') }}</span>
                  }
                  <div class="flex items-center gap-1">
                    <button (click)="addToCart(prod)" class="w-6 h-6 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white flex items-center justify-center transition-all active:scale-90" title="Agregar al carrito">
                      <span class="material-icons" style="font-size: 12px">add_shopping_cart</span>
                    </button>
                    <button (click)="removeFavorite(prod.id)" class="w-6 h-6 rounded-full bg-white border border-[#F0D5CC] text-[#FF758F] flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all" title="Eliminar de favoritos">
                      <span class="material-icons" style="font-size: 12px">favorite</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class FavoritesPanelComponent {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);

  isOpen = signal(false);

  favoriteProducts = computed(() => {
    const favIds = this.dataService.favorites();
    const allProducts = this.dataService.products();
    return allProducts.filter(p => favIds.includes(p.id));
  });

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
  toggle() { this.isOpen.update(v => !v); }

  async removeFavorite(productId: number) {
    await this.dataService.toggleFavorite(productId);
  }

  async addToCart(product: Product) {
    await this.cartService.addToCart(product, 1);
  }
}
