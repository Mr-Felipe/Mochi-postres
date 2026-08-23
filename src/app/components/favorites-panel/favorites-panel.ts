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
    @if (isOpen()) {
      <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity" (click)="close()"></div>
    }

    <div class="fixed top-0 right-0 h-full w-80 max-w-[85vw] shadow-2xl z-[70] transform transition-transform duration-300 ease-out flex flex-col"
      [class.translate-x-full]="!isOpen()"
      [class.translate-x-0]="isOpen()"
      [style.background]="panelBg()">

      <!-- Header -->
      <div class="flex items-center justify-between p-5" [style.border-bottom]="'1px solid ' + borderColor()">
        <div class="flex items-center gap-2">
          <span class="material-icons" [style.color]="'var(--accent)'">favorite</span>
          <h2 class="text-lg font-serif italic font-bold" [style.color]="headingColor()">Mis Favoritos</h2>
          <span class="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            [style.background]="'var(--accent-bg)'" [style.color]="'var(--accent)'">
            {{ favoriteProducts().length }}
          </span>
        </div>
        <button (click)="close()" class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          [style.background]="closeBtnBg()" [style.color]="headingColor()">
          <span class="material-icons" style="font-size: 18px">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-5 space-y-3">
        @if (favoriteProducts().length === 0) {
          <div class="flex flex-col items-center justify-center h-full text-center py-12">
            <span class="material-icons text-5xl mb-3" [style.color]="borderColor()">favorite_border</span>
            <p class="text-sm font-medium" [style.color]="textColor()">No tienes favoritos aun</p>
            <p class="text-xs mt-1 opacity-50" [style.color]="textColor()">Toca el corazon en cualquier producto para guardarlo aqui</p>
          </div>
        } @else {
          @for (prod of favoriteProducts(); track prod.id) {
            <div class="flex gap-3 p-3 rounded-2xl group hover:shadow-md transition-shadow"
              [style.background]="cardBg()" [style.border]="'1px solid ' + borderColor()">
              <a [routerLink]="['/productos', prod.id]" (click)="close()" class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                [style.background]="imgBg()">
                <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover" />
              </a>
              <div class="flex-1 min-w-0">
                <a [routerLink]="['/productos', prod.id]" (click)="close()" class="block">
                  <span class="text-[8px] font-bold uppercase tracking-wider font-serif italic" [style.color]="'var(--accent)'">{{ prod.nombre_japones }}</span>
                  <h4 class="text-xs font-serif italic font-bold truncate" [style.color]="headingColor()">{{ prod.nombre_espanol }}</h4>
                </a>
                <div class="flex items-center justify-between mt-1.5">
                  @if (prod.precio_oferta) {
                    <span class="text-xs font-serif italic font-bold" [style.color]="'var(--accent)'">{{ '$' + prod.precio_oferta.toLocaleString('es-CO') }}</span>
                  } @else {
                    <span class="text-xs font-serif italic font-bold" [style.color]="headingColor()">{{ '$' + prod.precio.toLocaleString('es-CO') }}</span>
                  }
                  <div class="flex items-center gap-1">
                    <button (click)="addToCart(prod)" class="w-6 h-6 rounded-full text-white flex items-center justify-center transition-all active:scale-90"
                      [style.background]="'var(--accent)'" title="Agregar al carrito">
                      <span class="material-icons" style="font-size: 12px">add_shopping_cart</span>
                    </button>
                    <button (click)="removeFavorite(prod.id)" class="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                      [style.background]="cardBg()" [style.border]="'1px solid ' + borderColor()" [style.color]="'var(--accent)'" title="Eliminar de favoritos">
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

  panelBg = signal('#3A0A1C');
  headingColor = signal('#FDF8F4');
  textColor = signal('rgba(253,248,244,0.8)');
  borderColor = signal('rgba(255,255,255,0.1)');
  cardBg = signal('rgba(255,255,255,0.05)');
  imgBg = signal('rgba(255,255,255,0.08)');
  closeBtnBg = signal('rgba(255,255,255,0.1)');

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
