import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF5F0] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header Banner -->
        <div class="bg-[#FF758F] border border-[#FF5277] rounded-[40px] p-8 sm:p-12 text-white shadow-md mb-10 text-center sm:text-left relative overflow-hidden">
          <div class="relative z-10 max-w-2xl">
            <span class="px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest border border-white/30">
              Boutique 2026
            </span>
            <h1 class="text-3xl sm:text-5xl font-serif italic text-white mt-3 font-bold">
              Nuestros Postres Japoneses
            </h1>
            <p class="text-white/90 text-xs sm:text-sm mt-2 font-sans leading-relaxed font-medium">
              Explora la selección de mochis, daifukus, taiyakis calientes y lattes artesanales preparados en La Dorada.
            </p>
          </div>
        </div>

        <!-- Filters & Search Toolbar -->
        <div class="bg-white p-6 rounded-[32px] border border-[#F0D5CC] shadow-xs mb-8 space-y-4">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <!-- Search Bar -->
            <div class="relative w-full md:w-80">
              <span class="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 text-xl">search</span>
              <input 
                type="text" 
                placeholder="Buscar por nombre (ej. Fresa, Matcha)..."
                [value]="searchQuery()"
                (input)="searchQuery.set($any($event.target).value)"
                class="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-xs text-[#1A1A1A] font-medium focus:outline-none focus:border-[#FF758F] transition-colors"
              />
            </div>

            <!-- Sorting Select -->
            <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]/70">Ordenar por:</span>
              <select 
                [value]="sortBy()"
                (change)="sortBy.set($any($event.target).value)"
                class="px-4 py-2.5 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                <option value="destacados">⭐ Más Populares</option>
                <option value="precio_menor">💵 Precio: Menor a Mayor</option>
                <option value="precio_mayor">💰 Precio: Mayor a Menor</option>
                <option value="calificacion">★ Mejor Calificados</option>
              </select>
            </div>
          </div>

          <!-- Category Filter Pills -->
          <div class="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            <button 
              (click)="selectedCategory.set(null)"
              [class]="selectedCategory() === null ? 'bg-[#FF758F] text-[#FDF5F0] font-bold' : 'bg-[#FDF5F0] text-[#1A1A1A] border border-[#F0D5CC] hover:bg-[#FFA0B4]/30 font-bold'"
              class="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-all shadow-xs">
              🍡 Todos los Postres
            </button>
            @for (cat of categories(); track cat.id) {
              <button 
                (click)="selectedCategory.set(cat.id)"
                [class]="selectedCategory() === cat.id ? 'bg-[#FF758F] text-white font-bold' : 'bg-[#FDF5F0] text-[#1A1A1A] border border-[#F0D5CC] hover:bg-[#FFA0B4]/30 font-bold'"
                class="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5">
                <span>{{ cat.icono }}</span>
                <span>{{ cat.nombre }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Products Grid -->
        @if (filteredProducts().length > 0) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (prod of filteredProducts(); track prod.id) {
              <div class="bg-white rounded-[32px] border border-[#F0D5CC] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
                <!-- Image Container -->
                <div class="relative h-56 bg-[#FDF5F0] overflow-hidden">
                  <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                  <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#FF758F]/90 backdrop-blur-md text-[#FDF5F0] text-[10px] font-bold uppercase tracking-wider">
                    {{ prod.nombre_japones.split(' ')[0] }}
                  </span>
                  @if (prod.precio_oferta) {
                    <span class="absolute top-3 left-16 px-2.5 py-1 rounded-full bg-[#FDBA74] text-[#7C2D12] text-[10px] font-black border border-[#FB923C]">
                      OFERTA
                    </span>
                  }
                  <button (click)="dataService.toggleFavorite(prod.id)" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-[#1A1A1A] border border-[#F0D5CC] shadow-xs flex items-center justify-center hover:scale-110 transition-transform">
                    <span class="material-icons text-lg" [class.text-[#FF758F]]="dataService.isFavorite(prod.id)">{{ dataService.isFavorite(prod.id) ? 'favorite' : 'favorite_border' }}</span>
                  </button>
                </div>

                <!-- Product Content -->
                <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="font-serif italic font-bold text-[#FF758F]">{{ prod.nombre_japones }}</span>
                      <span class="text-[#1A1A1A] font-bold flex items-center gap-0.5">
                        <span class="material-icons text-xs text-amber-500">star</span>
                        {{ prod.calificacion }}
                      </span>
                    </div>

                    <h3 class="text-lg font-serif italic text-[#1A1A1A] font-bold">
                      {{ prod.nombre_espanol }}
                    </h3>

                    <p class="text-xs text-[#1A1A1A]/75 mt-1 line-clamp-2 leading-relaxed">
                      {{ prod.descripcion_corta }}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-[#F0D5CC] flex items-center justify-between">
                    <div>
                      <span class="text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest block font-bold">Precio</span>
                      <span class="text-lg font-serif italic text-[#1A1A1A] font-bold">
                        {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button (click)="cartService.addToCart(prod, 1)" class="p-2.5 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] transition-all hover:scale-105 active:scale-95" title="Añadir al Carrito">
                        <span class="material-icons text-base">add_shopping_cart</span>
                      </button>
                      <a [routerLink]="['/productos', prod.id]" class="px-3.5 py-2.5 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs">
                        Ver
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty Search / Filter State -->
          <div class="text-center py-20 bg-white rounded-[32px] border border-[#F0D5CC] p-8">
            <div class="w-16 h-16 rounded-full bg-[#FDF5F0] text-[#1A1A1A] flex items-center justify-center mx-auto mb-4 text-3xl border border-[#F0D5CC]">
              🔍
            </div>
            <h3 class="text-xl font-serif italic text-[#1A1A1A]">No encontramos postres coincidentes</h3>
            <p class="text-[#1A1A1A]/70 text-xs mt-1 max-w-md mx-auto uppercase tracking-wider">Prueba buscando con otros términos o seleccionando otra categoría de nuestro menú.</p>
            <button (click)="searchQuery.set(''); selectedCategory.set(null)" class="mt-4 px-6 py-3 rounded-full bg-[#FF758F] text-[#FDF5F0] font-bold text-xs uppercase tracking-wider hover:bg-[#FF6078]">
              Ver Todos los Postres
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class CatalogPageComponent {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);
  route = inject(ActivatedRoute);

  categories = this.dataService.categories;
  selectedCategory = signal<number | null>(null);
  searchQuery = signal<string>('');
  sortBy = signal<string>('destacados');

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['categoria']) {
        this.selectedCategory.set(Number(params['categoria']));
      }
    });
  }

  filteredProducts = computed(() => {
    let list = [...this.dataService.activeProducts()];

    // Category filter
    if (this.selectedCategory() !== null) {
      list = list.filter(p => p.id_categoria === this.selectedCategory());
    }

    // Search query filter
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      list = list.filter(p =>
        p.nombre_espanol.toLowerCase().includes(query) ||
        p.nombre_japones.toLowerCase().includes(query) ||
        p.descripcion_corta.toLowerCase().includes(query)
      );
    }

    // Sort
    if (this.sortBy() === 'precio_menor') {
      list.sort((a, b) => (a.precio_oferta || a.precio) - (b.precio_oferta || b.precio));
    } else if (this.sortBy() === 'precio_mayor') {
      list.sort((a, b) => (b.precio_oferta || b.precio) - (a.precio_oferta || a.precio));
    } else if (this.sortBy() === 'calificacion') {
      list.sort((a, b) => b.calificacion - a.calificacion);
    } else {
      // 'destacados'
      list.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    }

    return list;
  });
}
