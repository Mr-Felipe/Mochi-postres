import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MochiDataService } from '../../../services/mochi-data.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product()) {
      @let prod = product()!;

      <div class="bg-[#FAF7F2] min-h-screen py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Breadcrumb Navigation -->
          <nav class="flex items-center gap-2 text-xs uppercase tracking-wider text-[#4A3F35]/60 mb-8 font-semibold">
            <a routerLink="/" class="hover:text-[#4A3F35] transition-colors">Inicio</a>
            <span>/</span>
            <a routerLink="/productos" class="hover:text-[#4A3F35] transition-colors">Catálogo</a>
            <span>/</span>
            <span class="text-[#4A3F35] font-bold">{{ prod.nombre_espanol }}</span>
          </nav>

          <!-- Main Product Card Layout -->
          <div class="bg-white rounded-[40px] border border-[#EBE3D5] p-6 sm:p-10 shadow-xs mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <!-- Left Column: Gallery Images -->
              <div class="lg:col-span-6 space-y-4">
                <div class="relative h-96 sm:h-[450px] rounded-[32px] bg-[#FAF7F2] overflow-hidden border border-[#EBE3D5]">
                  <img [src]="selectedImage() || prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover">
                  
                  @if (prod.precio_oferta) {
                    <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#FFF3E0] text-[#6B4E28] font-bold text-xs tracking-wider uppercase border border-[#ffe0b2]">
                      ¡EN OFERTA!
                    </span>
                  }

                  <button (click)="dataService.toggleFavorite(prod.id)" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 text-[#4A3F35] border border-[#EBE3D5] shadow-xs flex items-center justify-center hover:scale-110 transition-transform">
                    <span class="material-icons text-xl">{{ dataService.isFavorite(prod.id) ? 'favorite' : 'favorite_border' }}</span>
                  </button>
                </div>

                <!-- Gallery Thumbnails -->
                @if (prod.galeria_imagenes && prod.galeria_imagenes.length > 1) {
                  <div class="flex items-center gap-3 overflow-x-auto pb-2">
                    @for (img of prod.galeria_imagenes; track img) {
                      <button 
                        (click)="selectedImage.set(img)"
                        [class]="selectedImage() === img ? 'ring-2 ring-[#4A3F35] border-transparent' : 'border-[#EBE3D5] hover:border-[#4A3F35]/50'"
                        class="w-20 h-20 rounded-2xl overflow-hidden border bg-[#FAF7F2] transition-all flex-shrink-0">
                        <img [src]="img" alt="Thumbnail" class="w-full h-full object-cover">
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Right Column: Details & Actions -->
              <div class="lg:col-span-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="px-3.5 py-1 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[11px] font-bold font-serif italic uppercase tracking-wider">
                      {{ prod.nombre_japones }}
                    </span>
                    <span class="text-[11px] font-bold text-[#2C5350] bg-[#E0F2F1] px-3 py-1 rounded-full border border-[#b2dfdb] uppercase tracking-wider">
                      Disponibles: {{ prod.stock }} unidades
                    </span>
                  </div>

                  <h1 class="text-3xl sm:text-4xl font-serif italic text-[#4A3F35]">
                    {{ prod.nombre_espanol }}
                  </h1>

                  <!-- Rating & Calories -->
                  <div class="flex items-center gap-4 mt-3 text-xs font-semibold text-[#4A3F35]/70">
                    <div class="flex items-center text-[#4A3F35] font-bold gap-1">
                      <span class="material-icons text-base text-amber-500">star</span>
                      <span class="text-sm">{{ prod.calificacion }}</span>
                      <span class="text-[#4A3F35]/50 font-normal">({{ prod.num_resenas }} opiniones)</span>
                    </div>
                    <span>•</span>
                    @if (prod.calorias) {
                      <span>🔥 {{ prod.calorias }} kcal por porción</span>
                    }
                  </div>

                  <!-- Price Tag -->
                  <div class="mt-6 flex items-baseline gap-3 p-5 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5]">
                    @if (prod.precio_oferta) {
                      <span class="text-3xl font-serif italic text-[#4A3F35]">
                        {{ '$' + prod.precio_oferta.toLocaleString('es-CO') }}
                      </span>
                      <span class="text-base text-[#4A3F35]/40 line-through font-medium">
                        {{ '$' + prod.precio.toLocaleString('es-CO') }}
                      </span>
                    } @else {
                      <span class="text-3xl font-serif italic text-[#4A3F35]">
                        {{ '$' + prod.precio.toLocaleString('es-CO') }}
                      </span>
                    }
                    <span class="text-[10px] text-[#4A3F35]/60 uppercase tracking-widest ml-auto font-bold">IVA Incluido</span>
                  </div>

                  <!-- Full Description -->
                  <div class="mt-6 space-y-2 text-[#4A3F35]/80 text-xs sm:text-sm leading-relaxed">
                    <h3 class="font-serif italic text-[#4A3F35] text-base">Descripción Tradicional</h3>
                    <p>{{ prod.descripcion_completa }}</p>
                  </div>

                  <!-- Ingredients -->
                  @if (prod.ingredientes && prod.ingredientes.length > 0) {
                    <div class="mt-6">
                      <h3 class="font-serif italic text-[#4A3F35] text-sm mb-2">Ingredientes Selección:</h3>
                      <div class="flex flex-wrap gap-2">
                        @for (ing of prod.ingredientes; track ing) {
                          <span class="px-3.5 py-1 rounded-full bg-[#FAF7F2] text-[#4A3F35] text-xs font-semibold border border-[#EBE3D5]">
                            🌱 {{ ing }}
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Quantity Selector & Add to Cart -->
                <div class="pt-6 border-t border-[#EBE3D5] space-y-4">
                  <div class="flex items-center gap-4">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#4A3F35]">Cantidad:</span>
                    <div class="flex items-center rounded-full bg-[#FAF7F2] border border-[#EBE3D5] p-1">
                      <button (click)="quantity.set(Math.max(1, quantity() - 1))" class="w-8 h-8 rounded-full bg-white text-[#4A3F35] font-bold hover:bg-[#FFD6E0] transition-colors flex items-center justify-center">
                        -
                      </button>
                      <span class="w-12 text-center text-sm font-bold text-[#4A3F35]">{{ quantity() }}</span>
                      <button (click)="quantity.set(Math.min(prod.stock, quantity() + 1))" class="w-8 h-8 rounded-full bg-white text-[#4A3F35] font-bold hover:bg-[#FFD6E0] transition-colors flex items-center justify-center">
                        +
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-3">
                    <button 
                      (click)="cartService.addToCart(prod, quantity())" 
                      class="flex-1 py-4 px-6 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                      <span class="material-icons text-lg">shopping_cart</span>
                      <span>Añadir {{ quantity() }} al Carrito</span>
                    </button>

                    <a 
                      routerLink="/checkout" 
                      (click)="cartService.addToCart(prod, quantity())" 
                      class="py-4 px-6 rounded-full bg-[#FFD6E0] hover:bg-[#ffc2d1] text-[#4A3F35] font-bold text-xs uppercase tracking-widest transition-colors text-center">
                      Comprar Ahora
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Customer Reviews for this Product -->
          <div class="bg-white rounded-[40px] border border-[#EBE3D5] p-6 sm:p-10 shadow-xs">
            <h2 class="text-2xl font-serif italic text-[#4A3F35] mb-6">
              Reseñas y Opiniones de Clientes ({{ productReviews().length }})
            </h2>

            <div class="space-y-4 mb-8">
              @for (rev of productReviews(); track rev.id) {
                <div class="p-5 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-serif italic text-[#4A3F35] text-sm">— {{ rev.nombreCliente }}</span>
                    <div class="flex text-amber-500">
                      @for (s of [1,2,3,4,5]; track s) {
                        <span class="material-icons text-xs">{{ s <= rev.calificacion ? 'star' : 'star_border' }}</span>
                      }
                    </div>
                  </div>
                  <p class="text-[#4A3F35]/80 leading-relaxed italic">{{ rev.comentario }}</p>
                  <span class="text-[10px] text-[#4A3F35]/50 block pt-1">{{ rev.fecha }}</span>
                </div>
              }
            </div>

            <!-- Add Review Form -->
            <div class="p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EBE3D5] space-y-3">
              <h3 class="font-serif italic text-[#4A3F35] text-base">Deja tu calificación para este postre</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input #nameInput type="text" placeholder="Tu Nombre completo" class="p-3.5 rounded-full bg-white border border-[#EBE3D5] text-xs text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                <select #starSelect class="p-3.5 rounded-full bg-white border border-[#EBE3D5] text-xs text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Muy Bueno)</option>
                  <option value="3">⭐⭐⭐ (3 - Bueno)</option>
                </select>
              </div>
              <textarea #commentInput rows="2" placeholder="Escribe tu reseña..." class="w-full p-4 rounded-[20px] bg-white border border-[#EBE3D5] text-xs text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]"></textarea>
              <button 
                (click)="submitReview(prod.id, nameInput.value, starSelect.value, commentInput.value); nameInput.value = ''; commentInput.value = ''"
                class="px-6 py-3 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-wider hover:bg-[#362D26] transition-colors">
                Publicar Opinión
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class ProductDetailPageComponent {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);

  Math = Math;
  quantity = signal(1);
  selectedImage = signal<string | null>(null);

  productId = signal<number | null>(null);

  constructor() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId.set(Number(params['id']));
      }
    });
  }

  product = computed(() => {
    const id = this.productId();
    if (!id) return null;
    return this.dataService.products().find(p => p.id === id) || null;
  });

  productReviews = computed(() => {
    const id = this.productId();
    if (!id) return [];
    return this.dataService.reviews().filter(r => r.productoId === id && r.aprobado);
  });

  submitReview(productId: number, name: string, stars: string, comment: string) {
    if (!name || !comment) return;
    this.dataService.addReview({
      productoId: productId,
      nombreCliente: name,
      calificacion: Number(stars),
      comentario: comment
    });
  }
}
