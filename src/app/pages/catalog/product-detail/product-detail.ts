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

      <div class="bg-[#FDF5F0] min-h-screen py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Breadcrumb Navigation -->
          <nav class="flex items-center gap-2 text-xs uppercase tracking-wider text-[#1A1A1A]/60 mb-8 font-semibold">
            <a routerLink="/" class="hover:text-[#1A1A1A] transition-colors">Inicio</a>
            <span>/</span>
            <a routerLink="/productos" class="hover:text-[#1A1A1A] transition-colors">Catálogo</a>
            <span>/</span>
            <span class="text-[#FF758F] font-bold">{{ prod.nombre_espanol }}</span>
          </nav>

          <!-- Main Product Card Layout -->
          <div class="bg-white rounded-[40px] border border-[#F0D5CC] p-6 sm:p-10 shadow-xs mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <!-- Left Column: Gallery Images -->
              <div class="lg:col-span-6 space-y-4">
                <div class="relative h-96 sm:h-[450px] rounded-[32px] bg-[#FDF5F0] overflow-hidden border border-[#F0D5CC]">
                  <img [src]="selectedImage() || prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover">
                  
                  @if (prod.precio_oferta) {
                    <span class="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-[#FDBA74] text-[#7C2D12] font-bold text-xs tracking-wider uppercase border border-[#FB923C]">
                      ¡EN OFERTA!
                    </span>
                  }

                  <button (click)="dataService.toggleFavorite(prod.id)" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-[#1A1A1A] border border-[#F0D5CC] shadow-xs flex items-center justify-center hover:scale-110 transition-transform">
                    <span class="material-icons text-xl" [class.text-[#FF758F]]="dataService.isFavorite(prod.id)">{{ dataService.isFavorite(prod.id) ? 'favorite' : 'favorite_border' }}</span>
                  </button>
                </div>

                <!-- Gallery Thumbnails -->
                @if (prod.galeria_imagenes && prod.galeria_imagenes.length > 1) {
                  <div class="flex items-center gap-3 overflow-x-auto pb-2">
                    @for (img of prod.galeria_imagenes; track img) {
                      <button 
                        (click)="selectedImage.set(img)"
                        [class]="selectedImage() === img ? 'ring-2 ring-[#FF758F] border-transparent' : 'border-[#F0D5CC] hover:border-[#FF758F]/50'"
                        class="w-20 h-20 rounded-2xl overflow-hidden border bg-[#FDF5F0] transition-all flex-shrink-0">
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
                    <span class="px-3.5 py-1 rounded-full bg-[#FF758F] text-white text-[11px] font-bold font-serif italic uppercase tracking-wider shadow-xs">
                      {{ prod.nombre_japones }}
                    </span>
                    <span class="text-[11px] font-bold text-[#065F46] bg-[#D1FAE5] px-3 py-1 rounded-full border border-[#A7F3D0] uppercase tracking-wider">
                      Disponibles: {{ prod.stock }} unidades
                    </span>
                  </div>

                  <h1 class="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A] font-bold">
                    {{ prod.nombre_espanol }}
                  </h1>

                  <!-- Rating & Calories -->
                  <div class="flex items-center gap-4 mt-3 text-xs font-semibold text-[#1A1A1A]/75">
                    <div class="flex items-center text-[#1A1A1A] font-bold gap-1">
                      <span class="material-icons text-base text-amber-500">star</span>
                      <span class="text-sm">{{ prod.calificacion }}</span>
                      <span class="text-[#1A1A1A]/50 font-normal">({{ prod.num_resenas }} opiniones)</span>
                    </div>
                    <span>•</span>
                    @if (prod.calorias) {
                      <span>🔥 {{ prod.calorias }} kcal por porción</span>
                    }
                  </div>

                  <!-- Price Tag -->
                  <div class="mt-6 flex items-baseline gap-3 p-5 rounded-[24px] bg-[#FDF5F0] border border-[#F0D5CC]">
                    @if (prod.precio_oferta) {
                      <span class="text-3xl font-serif italic text-[#FF758F] font-bold">
                        {{ '$' + prod.precio_oferta.toLocaleString('es-CO') }}
                      </span>
                      <span class="text-base text-[#1A1A1A]/50 line-through font-semibold">
                        {{ '$' + prod.precio.toLocaleString('es-CO') }}
                      </span>
                    } @else {
                      <span class="text-3xl font-serif italic text-[#1A1A1A] font-bold">
                        {{ '$' + prod.precio.toLocaleString('es-CO') }}
                      </span>
                    }
                    <span class="text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest ml-auto font-bold">IVA Incluido</span>
                  </div>

                  <!-- Full Description -->
                  <div class="mt-6 space-y-2 text-[#1A1A1A]/85 text-xs sm:text-sm leading-relaxed font-medium">
                    <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">Descripción Tradicional</h3>
                    <p>{{ prod.descripcion_completa }}</p>
                  </div>

                  <!-- Ingredients -->
                  @if (prod.ingredientes && prod.ingredientes.length > 0) {
                    <div class="mt-6">
                      <h3 class="font-serif italic text-[#1A1A1A] text-sm mb-2 font-bold">Ingredientes Selección:</h3>
                      <div class="flex flex-wrap gap-2">
                        @for (ing of prod.ingredientes; track ing) {
                          <span class="px-3.5 py-1 rounded-full bg-[#FDF5F0] text-[#1A1A1A] text-xs font-semibold border border-[#F0D5CC]">
                            🌱 {{ ing }}
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Quantity Selector & Add to Cart -->
                <div class="pt-6 border-t border-[#F0D5CC] space-y-4">
                  <div class="flex items-center gap-4">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Cantidad:</span>
                    <div class="flex items-center rounded-full bg-[#FDF5F0] border border-[#F0D5CC] p-1">
                      <button (click)="quantity.set(Math.max(1, quantity() - 1))" class="w-8 h-8 rounded-full bg-white text-[#1A1A1A] font-bold hover:bg-[#FF758F] hover:text-white transition-colors flex items-center justify-center shadow-2xs">
                        -
                      </button>
                      <span class="w-12 text-center text-sm font-bold text-[#1A1A1A]">{{ quantity() }}</span>
                      <button (click)="quantity.set(Math.min(prod.stock, quantity() + 1))" class="w-8 h-8 rounded-full bg-white text-[#1A1A1A] font-bold hover:bg-[#FF758F] hover:text-white transition-colors flex items-center justify-center shadow-2xs">
                        +
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-3">
                    <button 
                      (click)="cartService.addToCart(prod, quantity())" 
                      class="flex-1 py-4 px-6 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                      <span class="material-icons text-lg">shopping_cart</span>
                      <span>Añadir {{ quantity() }} al Carrito</span>
                    </button>

                    <a 
                      routerLink="/checkout" 
                      (click)="cartService.addToCart(prod, quantity())" 
                      class="py-4 px-6 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-colors text-center shadow-xs">
                      Comprar Ahora
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Related Products -->
          @if (relatedProducts().length > 0) {
            <div class="mt-12">
              <h2 class="text-2xl font-serif italic text-[#1A1A1A] mb-6 font-bold">
                También te puede gustar
              </h2>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                @for (rel of relatedProducts(); track rel.id) {
                  <a [routerLink]="['/productos', rel.id]" class="bg-white rounded-[28px] border border-[#F0D5CC] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
                    <div class="relative h-40 bg-[#FDF5F0] overflow-hidden">
                      <img [src]="rel.imagen_principal" [alt]="rel.nombre_espanol" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      @if (rel.precio_oferta) {
                        <span class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#FDBA74] text-[#7C2D12] text-[8px] font-bold uppercase">Oferta</span>
                      }
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span class="text-[8px] font-bold text-[#FF758F] uppercase tracking-wider font-serif italic">{{ rel.nombre_japones }}</span>
                        <h4 class="text-sm font-serif italic font-bold text-[#1A1A1A] leading-tight mt-0.5">{{ rel.nombre_espanol }}</h4>
                      </div>
                      <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#F0D5CC]">
                        @if (rel.precio_oferta) {
                          <span class="text-sm font-serif italic font-bold text-[#FF758F]">{{ '$' + rel.precio_oferta.toLocaleString('es-CO') }}</span>
                        } @else {
                          <span class="text-sm font-serif italic font-bold text-[#1A1A1A]">{{ '$' + rel.precio.toLocaleString('es-CO') }}</span>
                        }
                        <button (click)="cartService.addToCart(rel, 1); $event.preventDefault(); $event.stopPropagation()" class="w-7 h-7 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white flex items-center justify-center transition-all active:scale-90" title="Agregar al carrito">
                          <span class="material-icons" style="font-size: 14px">add_shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </a>
                }
              </div>
            </div>
          }

          <!-- Customer Reviews for this Product -->
          <div class="bg-white rounded-[40px] border border-[#F0D5CC] p-6 sm:p-10 shadow-xs">
            <h2 class="text-2xl font-serif italic text-[#1A1A1A] mb-6 font-bold">
              Reseñas y Opiniones de Clientes ({{ productReviews().length }})
            </h2>

            <div class="space-y-4 mb-8">
              @for (rev of productReviews(); track rev.id) {
                <div class="p-5 rounded-[24px] bg-[#FDF5F0] border border-[#F0D5CC] text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-serif italic text-[#1A1A1A] text-sm font-bold">— {{ rev.nombreCliente }}</span>
                    <div class="flex text-amber-500">
                      @for (s of [1,2,3,4,5]; track s) {
                        <span class="material-icons text-xs">{{ s <= rev.calificacion ? 'star' : 'star_border' }}</span>
                      }
                    </div>
                  </div>
                  <p class="text-[#1A1A1A]/85 leading-relaxed italic font-medium">{{ rev.comentario }}</p>
                  <span class="text-[10px] text-[#1A1A1A]/50 block pt-1 font-semibold">{{ rev.fecha }}</span>
                </div>
              }
            </div>

            <!-- Add Review Form -->
            <div class="p-6 rounded-[28px] bg-[#FDF5F0] border border-[#F0D5CC] space-y-3">
              <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">Deja tu calificación para este postre</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input #nameInput type="text" placeholder="Tu Nombre completo" class="p-3.5 rounded-full bg-white border border-[#F0D5CC] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                <select #starSelect class="p-3.5 rounded-full bg-white border border-[#F0D5CC] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                  <option value="5">⭐⭐⭐⭐⭐ (5 - Excelente)</option>
                  <option value="4">⭐⭐⭐⭐ (4 - Muy Bueno)</option>
                  <option value="3">⭐⭐⭐ (3 - Bueno)</option>
                </select>
              </div>
              <textarea #commentInput rows="2" placeholder="Escribe tu reseña..." class="w-full p-4 rounded-[20px] bg-white border border-[#F0D5CC] text-xs text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]"></textarea>
              <button 
                (click)="submitReview(prod.id, nameInput.value, starSelect.value, commentInput.value); nameInput.value = ''; commentInput.value = ''"
                class="px-6 py-3 rounded-full bg-[#FF758F] text-[#FDF5F0] font-bold text-xs uppercase tracking-wider hover:bg-[#FF6078] transition-colors shadow-xs">
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

  relatedProducts = computed(() => {
    const prod = this.product();
    if (!prod) return [];
    return this.dataService.products()
      .filter(p => p.id !== prod.id && p.id_categoria === prod.id_categoria && p.disponible)
      .slice(0, 4);
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
