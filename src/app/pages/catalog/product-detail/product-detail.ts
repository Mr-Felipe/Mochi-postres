import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MochiDataService } from '../../../services/mochi-data.service';
import { CartService } from '../../../services/cart.service';
import { SupabaseService } from '../../../services/supabase.service';
import { supabase } from '../../../supabase';

interface Topping {
  id: string;
  nombre: string;
  precio: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (product()) {
      @let prod = product()!;

      <div class="bg-[#FDF8F4] min-h-screen py-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <!-- Breadcrumb Navigation -->
          <nav class="flex items-center gap-2 text-xs uppercase tracking-wider text-[#590E2A]/60 mb-8 font-semibold">
            <a routerLink="/" class="hover:text-[#590E2A] transition-colors">Inicio</a>
            <span>/</span>
            <a routerLink="/productos" class="hover:text-[#590E2A] transition-colors">Catálogo</a>
            <span>/</span>
            <span class="text-[#D95578] font-bold">{{ prod.nombre_espanol }}</span>
          </nav>

          <!-- Main Product Card Layout -->
          <div class="bg-white rounded-[40px] border border-[#E8D8D0] p-6 sm:p-10 shadow-xs mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              <!-- Left Column: Gallery Images -->
              <div class="lg:col-span-6 space-y-4">
                <div class="relative h-96 sm:h-[450px] rounded-[32px] bg-[#FDF8F4] overflow-hidden border border-[#E8D8D0]">
                  <img [src]="selectedImage() || prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover">
                </div>

                <!-- Gallery Thumbnails -->
                @if (prod.galeria_imagenes && prod.galeria_imagenes.length > 1) {
                  <div class="flex items-center gap-3 overflow-x-auto pb-2">
                    @for (img of prod.galeria_imagenes; track img) {
                      <button 
                        (click)="selectedImage.set(img)"
                        [class]="selectedImage() === img ? 'ring-2 ring-[#D95578] border-transparent' : 'border-[#E8D8D0] hover:border-[#D95578]/50'"
                        class="w-20 h-20 rounded-2xl overflow-hidden border bg-[#FDF8F4] transition-all flex-shrink-0">
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
                    <span class="px-3.5 py-1 rounded-full bg-[#D95578] text-white text-[11px] font-bold font-serif italic uppercase tracking-wider shadow-xs">
                      {{ prod.nombre_japones }}
                    </span>
                    <span class="text-[11px] font-bold text-[#065F46] bg-[#D1FAE5] px-3 py-1 rounded-full border border-[#A7F3D0] uppercase tracking-wider">
                      Disponibles: {{ prod.stock }} unidades
                    </span>
                  </div>

                  <h1 class="text-3xl sm:text-4xl font-serif italic text-[#590E2A] font-bold">
                    {{ prod.nombre_espanol }}
                  </h1>

                  <!-- Rating & Calories -->
                  <div class="flex items-center gap-4 mt-3 text-xs font-semibold text-[#590E2A]/75">
                    <div class="flex items-center text-[#590E2A] font-bold gap-1">
                      <span class="material-icons text-base text-amber-500">star</span>
                      <span class="text-sm">{{ prod.calificacion }}</span>
                      <span class="text-[#590E2A]/50 font-normal">({{ prod.num_resenas }} opiniones)</span>
                    </div>
                    <span>•</span>
                    @if (prod.calorias) {
                      <span>🔥 {{ prod.calorias }} kcal por porción</span>
                    }
                  </div>

                  <!-- Price Tag -->
                  <div class="mt-6 flex items-baseline gap-3 p-5 rounded-[24px] bg-[#FDF8F4] border border-[#E8D8D0]">
                    <span class="text-3xl font-serif italic text-[#590E2A] font-bold">
                      {{ '$' + prod.precio.toLocaleString('es-CO') }}
                    </span>
                    <span class="text-[10px] text-[#590E2A]/60 uppercase tracking-widest ml-auto font-bold">IVA Incluido</span>
                  </div>

                  <!-- Full Description -->
                  <div class="mt-6 space-y-2 text-[#590E2A]/85 text-xs sm:text-sm leading-relaxed font-medium">
                    <h3 class="font-serif italic text-[#590E2A] text-base font-bold">Descripción</h3>
                    <p>{{ prod.descripcion }}</p>
                  </div>

                  <!-- Ingredients -->
                  @if (productIngredients().length > 0) {
                    <div class="mt-6">
                      <h3 class="font-serif italic text-[#590E2A] text-sm mb-2 font-bold">Ingredientes Selección:</h3>
                      <div class="flex flex-wrap gap-2">
                        @for (ing of productIngredients(); track ing.nombre) {
                          <span class="px-3.5 py-1 rounded-full bg-[#FDF8F4] text-[#590E2A] text-xs font-semibold border border-[#E8D8D0]">
                            🌱 {{ ing.nombre }}
                          </span>
                        }
                      </div>
                    </div>
                  }

                  <!-- Toppings Selector -->
                  @if (toppings().length > 0) {
                    <div class="mt-6">
                      <h3 class="font-serif italic text-[#590E2A] text-sm mb-3 font-bold">
                        Toppings Adicionales
                        <span class="text-[10px] text-[#590E2A]/50 font-normal not-italic ml-1">(Opcional)</span>
                      </h3>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        @for (topping of toppings(); track topping.id) {
                          <button
                            (click)="toggleTopping(topping)"
                            [class]="isToppingSelected(topping.id)
                              ? 'bg-[#D95578] text-white border-[#D95578]'
                              : 'bg-[#FDF8F4] text-[#590E2A] border-[#E8D8D0] hover:border-[#D95578]/50'"
                            class="flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all">
                            <span class="flex items-center gap-2">
                              <span class="material-icons text-sm">{{ isToppingSelected(topping.id) ? 'check_circle' : 'add_circle_outline' }}</span>
                              {{ topping.nombre }}
                            </span>
                            <span class="font-bold">+{{ '$' + topping.precio.toLocaleString('es-CO') }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Frase personalizada -->
                <div class="space-y-2 pt-4 border-t border-[#E8D8D0]">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#590E2A]">Frase para tu postre (opcional):</span>
                    <span class="text-[10px] text-[#590E2A]/50">{{ frasePersonalizada().length }}/80</span>
                  </div>
                  @if (prod.frase) {
                    <p class="text-[11px] text-[#590E2A]/60 italic">Por defecto: "{{ prod.frase }}"</p>
                  }
                  <input 
                    type="text" 
                    maxlength="80"
                    [value]="frasePersonalizada()"
                    (input)="frasePersonalizada.set($any($event.target).value)"
                    placeholder="Escribe una frase para tu postre..."
                    class="w-full px-4 py-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-xs text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-[#D95578] transition-colors">
                </div>

                <!-- Quantity Selector & Add to Cart -->
                <div class="pt-6 border-t border-[#E8D8D0] space-y-4">
                  <!-- Total with toppings -->
                  @if (selectedToppings().length > 0) {
                    <div class="flex items-center justify-between text-xs text-[#590E2A]/70">
                      <span>{{ prod.nombre_espanol }} × {{ quantity() }}</span>
                      <span class="font-bold">{{ '$' + prod.precio.toLocaleString('es-CO') }}</span>
                    </div>
                    @for (t of selectedToppings(); track t.id) {
                      <div class="flex items-center justify-between text-xs text-[#590E2A]/70">
                        <span>+ {{ t.nombre }} × {{ quantity() }}</span>
                        <span class="font-bold">{{ '$' + (t.precio * quantity()).toLocaleString('es-CO') }}</span>
                      </div>
                    }
                    <div class="flex items-center justify-between text-sm font-bold text-[#590E2A] pt-2 border-t border-[#E8D8D0]">
                      <span>Total</span>
                      <span class="text-lg font-serif italic text-[#D95578]">{{ '$' + totalWithToppings().toLocaleString('es-CO') }}</span>
                    </div>
                  }

                  <div class="flex items-center gap-4">
                    <span class="text-xs font-bold uppercase tracking-wider text-[#590E2A]">Cantidad:</span>
                    <div class="flex items-center rounded-full bg-[#FDF8F4] border border-[#E8D8D0] p-1">
                      <button (click)="quantity.set(Math.max(1, quantity() - 1))" class="w-8 h-8 rounded-full bg-white text-[#590E2A] font-bold hover:bg-[#D95578] hover:text-white transition-colors flex items-center justify-center shadow-2xs">
                        -
                      </button>
                      <span class="w-12 text-center text-sm font-bold text-[#590E2A]">{{ quantity() }}</span>
                      <button (click)="quantity.set(Math.min(prod.stock, quantity() + 1))" class="w-8 h-8 rounded-full bg-white text-[#590E2A] font-bold hover:bg-[#D95578] hover:text-white transition-colors flex items-center justify-center shadow-2xs">
                        +
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-3">
                    <button 
                      (click)="addToCart(prod)" 
                      class="flex-1 py-4 px-6 rounded-full bg-[#D95578] hover:bg-[#FF6078] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                      <span class="material-icons text-lg">shopping_cart</span>
                      <span>Añadir {{ quantity() }} al Carrito</span>
                    </button>

                    <a 
                      routerLink="/checkout" 
                      (click)="addToCart(prod); $event.preventDefault()" 
                      class="py-4 px-6 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-colors text-center shadow-xs">
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
              <h2 class="text-2xl font-serif italic text-[#590E2A] mb-6 font-bold">
                También te puede gustar
              </h2>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                @for (rel of relatedProducts(); track rel.id) {
                  <a [routerLink]="['/productos', rel.id]" class="bg-white rounded-[28px] border border-[#E8D8D0] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
                    <div class="relative h-40 bg-[#FDF8F4] overflow-hidden">
                      <img [src]="rel.imagen_principal" [alt]="rel.nombre_espanol" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span class="text-[8px] font-bold text-[#D95578] uppercase tracking-wider font-serif italic">{{ rel.nombre_japones }}</span>
                        <h4 class="text-sm font-serif italic font-bold text-[#590E2A] leading-tight mt-0.5">{{ rel.nombre_espanol }}</h4>
                      </div>
                      <div class="flex items-center justify-between mt-2 pt-2 border-t border-[#E8D8D0]">
                        <span class="text-sm font-serif italic font-bold text-[#590E2A]">{{ '$' + rel.precio.toLocaleString('es-CO') }}</span>
                        <button (click)="cartService.addToCart(rel, 1); $event.preventDefault(); $event.stopPropagation()" class="w-7 h-7 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white flex items-center justify-center transition-all active:scale-90" title="Agregar al carrito">
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
          <div class="bg-white rounded-[40px] border border-[#E8D8D0] p-6 sm:p-10 shadow-xs">
            <h2 class="text-2xl font-serif italic text-[#590E2A] mb-6 font-bold">
              Reseñas y Opiniones de Clientes ({{ productReviews().length }})
            </h2>

            <div class="space-y-4 mb-8">
              @for (rev of productReviews(); track rev.id) {
                <div class="p-5 rounded-[24px] bg-[#FDF8F4] border border-[#E8D8D0] text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-serif italic text-[#590E2A] text-sm font-bold">— {{ rev.nombreCliente }}</span>
                    <div class="flex text-amber-500">
                      @for (s of [1,2,3,4,5]; track s) {
                        <span class="material-icons text-xs">{{ s <= rev.calificacion ? 'star' : 'star_border' }}</span>
                      }
                    </div>
                  </div>
                  <p class="text-[#590E2A]/85 leading-relaxed italic font-medium">{{ rev.comentario }}</p>
                  <span class="text-[10px] text-[#590E2A]/50 block pt-1 font-semibold">{{ rev.fecha }}</span>
                </div>
              }
            </div>

            <!-- Add Review Form -->
            <div class="p-6 rounded-[28px] bg-[#FDF8F4] border border-[#E8D8D0] space-y-3">
              <h3 class="font-serif italic text-[#590E2A] text-base font-bold">Deja tu calificación para este postre</h3>

              @if (!supabaseService.activeUser()) {
                <div class="text-center py-4">
                  <span class="material-icons text-[#E8D8D0] text-4xl mb-2">lock</span>
                  <p class="text-xs text-[#590E2A]/60 mb-3">Inicia sesión para dejar tu reseña</p>
                  <a routerLink="/login" class="inline-block px-6 py-2.5 rounded-full bg-[#D95578] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#FF6078] transition-colors">
                    Iniciar Sesión
                  </a>
                </div>
              } @else {
                <div class="space-y-3">
                  <p class="text-[10px] text-[#590E2A]/50">Reviews como <span class="font-bold">{{ supabaseService.activeUser()?.nombre_completo }}</span></p>
                  <div class="flex items-center gap-1">
                    @for (star of [1,2,3,4,5]; track star) {
                      <button type="button" (click)="selectedStars.set(star)" class="transition-transform hover:scale-110">
                        <span class="material-icons text-2xl" [style.color]="star <= selectedStars() ? '#F59E0B' : '#E8D8D0'">
                          {{ star <= selectedStars() ? 'star' : 'star_border' }}
                        </span>
                      </button>
                    }
                    <span class="text-[10px] text-[#590E2A]/50 ml-2">{{ selectedStars() > 0 ? selectedStars() + '/5' : 'Selecciona' }}</span>
                  </div>
                  <textarea #commentInput rows="2" placeholder="Escribe tu reseña..." class="w-full p-4 rounded-[20px] bg-white border border-[#E8D8D0] text-xs text-[#590E2A] focus:outline-none focus:border-[#D95578]"></textarea>
                  <button 
                    (click)="submitReview(prod.id, commentInput.value); commentInput.value = ''"
                    [disabled]="selectedStars() === 0"
                    class="px-6 py-3 rounded-full bg-[#D95578] text-[#FDF8F4] font-bold text-xs uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FF6078]">
                    Publicar Opinión
                  </button>
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class ProductDetailPageComponent implements OnInit {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);
  supabaseService = inject(SupabaseService);
  route = inject(ActivatedRoute);

  Math = Math;
  quantity = signal(1);
  selectedImage = signal<string | null>(null);
  toppings = signal<Topping[]>([]);
  selectedToppings = signal<Topping[]>([]);
  productIngredients = signal<{nombre: string; tipo: string}[]>([]);
  selectedStars = signal<number>(0);
  frasePersonalizada = signal<string>('');

  productId = signal<number | null>(null);

  constructor() {
    this.route.params.subscribe(async params => {
      if (params['id']) {
        const id = Number(params['id']);
        this.productId.set(id);
        this.selectedToppings.set([]);
        this.quantity.set(1);
        this.frasePersonalizada.set('');
        await this.loadProductIngredients(id);
      }
    });
  }

  async loadProductIngredients(productId: number) {
    const { data } = await supabase
      .from('producto_ingrediente')
      .select('ingredientes(nombre, tipo)')
      .eq('id_producto', productId)
      .order('orden');

    if (data) {
      this.productIngredients.set(
        data.map((row: any) => ({
          nombre: row.ingredientes?.nombre || '',
          tipo: row.ingredientes?.tipo || ''
        }))
      );
    } else {
      this.productIngredients.set([]);
    }
  }

  async ngOnInit() {
    const { data } = await supabase
      .from('ingredientes')
      .select('id, nombre, precio')
      .eq('tipo', 'topping')
      .eq('activo', true)
      .gt('precio', 0)
      .order('nombre');

    if (data) {
      this.toppings.set(data.map(t => ({ id: String(t.id), nombre: t.nombre, precio: Number(t.precio) })));
    }
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
      .filter(p => p.id !== prod.id && p.disponible)
      .slice(0, 4);
  });

  totalWithToppings = computed(() => {
    const prod = this.product();
    if (!prod) return 0;
    const base = prod.precio;
    const toppingsTotal = this.selectedToppings().reduce((sum, t) => sum + t.precio, 0);
    return (base + toppingsTotal) * this.quantity();
  });

  isToppingSelected(toppingId: string): boolean {
    return this.selectedToppings().some(t => t.id === toppingId);
  }

  toggleTopping(topping: Topping) {
    const current = this.selectedToppings();
    if (current.some(t => t.id === topping.id)) {
      this.selectedToppings.set(current.filter(t => t.id !== topping.id));
    } else if (current.length < 2) {
      this.selectedToppings.set([...current, topping]);
    }
  }

  addToCart(prod: import('../../../models/mochi.models').Product) {
    const toppings = this.selectedToppings();
    const frase = this.frasePersonalizada().trim();
    this.cartService.addToCart(prod, this.quantity(), '', undefined, undefined, toppings.length > 0 ? toppings : undefined, frase || undefined);
    this.frasePersonalizada.set('');
  }

  submitReview(productId: number, comment: string) {
    const stars = this.selectedStars();
    if (!comment || stars === 0) return;
    this.dataService.addReview({
      productoId: productId,
      nombreCliente: '',
      calificacion: stars,
      comentario: comment
    });
    this.selectedStars.set(0);
  }
}
