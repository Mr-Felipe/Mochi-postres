import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCarouselComponent } from '../../components/carousel/product-carousel';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCarouselComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero Section -->
    <section class="relative bg-[#FDF5F0] pt-12 pb-20 border-b border-[#F0D5CC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Headlines & Action CTAs -->
          <div class="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF758F] text-white text-xs font-bold uppercase tracking-wider border border-[#FF5277] shadow-xs">
              <span>🌸</span>
              <span>100% Artesanal • La Dorada, Caldas</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif italic text-[#1A1A1A] leading-tight">
              Descubre el arte del <span class="not-italic font-bold text-[#FF758F]">Mochi.</span>
            </h1>

            <p class="text-base sm:text-lg text-[#1A1A1A]/85 leading-relaxed font-sans max-w-xl mx-auto lg:mx-0 font-medium">
              {{ config().heroSubtitulo }}
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a routerLink="/productos" class="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm">
                <span>Ver Catálogo</span>
                <span class="material-icons text-base">arrow_forward</span>
              </a>

              <a routerLink="/checkout" class="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shadow-xs">
                <span>🛍️ Hacer Pedido</span>
              </a>
            </div>

            <!-- Features Trust Points -->
            <div class="grid grid-cols-3 gap-4 pt-8 border-t border-[#F0D5CC] text-[#1A1A1A]">
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic font-bold block text-[#FF758F]">24/7</span>
                <span class="text-[11px] text-[#1A1A1A]/75 font-bold uppercase tracking-wider">Pedidos Online</span>
              </div>
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic font-bold block text-[#1A1A1A]">45 min</span>
                <span class="text-[11px] text-[#1A1A1A]/75 font-bold uppercase tracking-wider">Envío Local</span>
              </div>
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic font-bold block text-amber-500">4.9 ★</span>
                <span class="text-[11px] text-[#1A1A1A]/75 font-bold uppercase tracking-wider">Calificación</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Product Carousel Card -->
          <div class="lg:col-span-7">
            <app-product-carousel />
          </div>

        </div>
      </div>
    </section>

    <!-- Section 1: Explora por Categoría -->
    <section class="py-16 bg-white border-b border-[#F0D5CC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-[#FF758F] font-serif">Variedad Japonesa</span>
          <h2 class="text-3xl font-serif italic text-[#1A1A1A] mt-1">Explora por Categoría</h2>
          <p class="text-[#1A1A1A]/75 text-xs uppercase tracking-wider mt-2 font-bold">Delicadas creaciones elaboradas diariamente con ingredientes frescos</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          @for (cat of categories(); track cat.id) {
            <a 
              [routerLink]="['/productos']" 
              [queryParams]="{categoria: cat.id}"
              class="group p-6 rounded-[32px] bg-[#FDF5F0] hover:bg-[#FFA0B4]/25 border border-[#F0D5CC] text-center transition-all duration-300 hover:shadow-xs block">
              <div class="w-14 h-14 rounded-full bg-white border border-[#F0D5CC] flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                {{ cat.icono }}
              </div>
              <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold group-hover:text-[#FF758F] transition-colors">
                {{ cat.nombre }}
              </h3>
              <p class="text-[11px] text-[#1A1A1A]/70 mt-1 line-clamp-2 leading-relaxed font-medium">
                {{ cat.descripcion }}
              </p>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Section 2: Top 3 Productos Más Populares -->
    <section class="py-20 bg-[#FDF5F0]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-[#FF758F] font-serif">⭐ Los Favoritos</span>
            <h2 class="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A] mt-1">Nuestros Más Populares</h2>
            <p class="text-[#1A1A1A]/75 text-xs uppercase tracking-wider mt-1 font-semibold">Los postres más aclamados por la comunidad de La Dorada</p>
          </div>

          <a routerLink="/productos" class="px-6 py-3 rounded-full bg-white border border-[#F0D5CC] hover:border-[#1A1A1A] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 shadow-2xs">
            <span>Ver Todos los Productos</span>
            <span class="material-icons text-base">east</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (prod of topProducts(); track prod.id) {
            <div class="bg-white rounded-[32px] border border-[#F0D5CC] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
              <!-- Image -->
              <div class="relative h-64 bg-[#FDF5F0] overflow-hidden">
                <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FF758F]/90 backdrop-blur-md text-[#FDF5F0] text-[10px] font-bold uppercase tracking-wider">
                  {{ prod.nombre_japones.split(' ')[0] }}
                </span>
                <button (click)="dataService.toggleFavorite(prod.id)" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white text-[#1A1A1A] border border-[#F0D5CC] shadow-xs flex items-center justify-center hover:scale-110 transition-transform">
                  <span class="material-icons text-lg" [class.text-[#FF758F]]="dataService.isFavorite(prod.id)">{{ dataService.isFavorite(prod.id) ? 'favorite' : 'favorite_border' }}</span>
                </button>
              </div>

              <!-- Body -->
              <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-[#FF758F] font-serif italic">{{ prod.nombre_japones }}</span>
                    <div class="flex items-center text-[#1A1A1A] text-xs font-bold gap-0.5">
                      <span class="material-icons text-sm text-amber-500">star</span>
                      <span>{{ prod.calificacion }} ({{ prod.num_resenas }})</span>
                    </div>
                  </div>

                  <h3 class="text-xl font-serif italic text-[#1A1A1A] font-bold">
                    {{ prod.nombre_espanol }}
                  </h3>

                  <p class="text-xs text-[#1A1A1A]/75 mt-2 line-clamp-2 leading-relaxed">
                    {{ prod.descripcion_corta }}
                  </p>
                </div>

                <div class="pt-4 border-t border-[#F0D5CC] flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-[#1A1A1A]/60 uppercase tracking-widest block font-bold">Precio</span>
                    <span class="text-xl font-serif italic text-[#1A1A1A] font-bold">
                      {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button (click)="cartService.addToCart(prod, 1)" class="p-3 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] transition-all hover:scale-105 active:scale-95" title="Añadir al Carrito">
                      <span class="material-icons text-base">add_shopping_cart</span>
                    </button>
                    <a [routerLink]="['/productos', prod.id]" class="px-4 py-3 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs">
                      Detalles
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Interactive Simulator CTA Callout -->
    <section class="py-14 bg-[#FF758F] text-white border-y border-[#FF5277] shadow-inner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span class="px-3.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold tracking-widest uppercase border border-white/30">Herramienta Interactiva</span>
          <h2 class="text-2xl sm:text-3xl font-serif italic mt-2 font-bold">¿Quieres calcular el valor exacto de tu pedido?</h2>
          <p class="text-white/90 text-xs uppercase tracking-wider mt-1 font-semibold">Prueba nuestro simulador de pedidos sin compromiso y calcula el envío a domicilio.</p>
        </div>

        <a routerLink="/simulador" class="px-8 py-4 rounded-full bg-[#FF758F] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest shadow-md hover:bg-[#FF6078] transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
          🧮 Abrir Simulador de Pedidos
        </a>
      </div>
    </section>

    <!-- Section 3: Reseñas de Clientes (3 Mejores) -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-[#FF758F] font-serif">💬 Testimonios Reales</span>
          <h2 class="text-3xl font-serif italic text-[#1A1A1A] mt-1">Lo que Dicen Nuestros Clientes</h2>
          <p class="text-[#1A1A1A]/75 text-xs uppercase tracking-wider mt-1 font-semibold">Opiniones verificadas de amantes del dulce en La Dorada</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (rev of topReviews(); track rev.id) {
            <div class="p-8 rounded-[32px] bg-[#FDF5F0] border border-[#F0D5CC] flex flex-col justify-between space-y-4 shadow-2xs">
              <div>
                <div class="flex items-center text-amber-500 mb-4 gap-1">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="material-icons text-base">star</span>
                  }
                </div>
                <p class="text-[#1A1A1A] text-xs leading-relaxed italic font-medium">
                  "{{ rev.comentario }}"
                </p>
              </div>

              <div class="pt-4 border-t border-[#F0D5CC] flex items-center justify-between text-xs font-bold">
                <span class="font-serif italic text-[#1A1A1A]">— {{ rev.nombreCliente }}</span>
                <span class="text-[#1A1A1A]/50 text-[11px]">{{ rev.fecha }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Section 4: Sobre Nosotros Preview -->
    <section class="py-20 bg-[#FDF5F0] border-t border-[#F0D5CC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-5">
            <div class="relative rounded-[40px] overflow-hidden border border-[#F0D5CC] shadow-sm">
              <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80" alt="Sobre MOCHI" class="w-full h-96 object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/90 via-[#1A1A1A]/20 to-transparent flex items-end p-8 text-[#FDF5F0]">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-[#FFA0B4] block">Autenticidad Artesanal</span>
                  <span class="text-xl font-serif italic font-bold">Hecho a mano en La Dorada</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-6">
            <span class="text-xs font-bold uppercase tracking-widest text-[#FF758F] font-serif">🏯 Sobre Mochi.</span>
            <h2 class="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A] leading-tight font-bold">
              Pioneros en la repostería japonesa de Caldas
            </h2>
            <p class="text-[#1A1A1A]/85 text-sm leading-relaxed font-medium">
              Somos un emprendimiento fundado por Michel, Felipe y Neider para traer la auténtica cultura del postre japonés a La Dorada. Cada pieza se prepara bajo procesos artesanales respetando las temperaturas, texturas y recetas ancestrales.
            </p>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="p-5 rounded-[24px] bg-white border border-[#F0D5CC] shadow-2xs">
                <span class="text-2xl mb-1 block">🌿</span>
                <h4 class="font-serif italic text-[#1A1A1A] text-base font-bold">Ingredientes Premium</h4>
                <p class="text-[11px] text-[#1A1A1A]/70 mt-1 font-medium">Matcha de Uji e ingredientes frescos locales.</p>
              </div>
              <div class="p-5 rounded-[24px] bg-white border border-[#F0D5CC] shadow-2xs">
                <span class="text-2xl mb-1 block">🎁</span>
                <h4 class="font-serif italic text-[#1A1A1A] text-base font-bold">Empaque de Regalo</h4>
                <p class="text-[11px] text-[#1A1A1A]/70 mt-1 font-medium">Presentación elegante lista para obsequiar.</p>
              </div>
            </div>

            <div class="pt-4">
              <a routerLink="/sobre-nosotros" class="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">
                <span>Conocer Más de Nuestra Historia</span>
                <span class="material-icons text-base">east</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Blog Preview -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-[#FF758F] font-serif">📰 Cultura & Recetas</span>
            <h2 class="text-3xl font-serif italic text-[#1A1A1A] mt-1">Noticias y Consejos Japoneses</h2>
          </div>
          <a routerLink="/blog" class="px-6 py-3 rounded-full bg-[#FDF5F0] hover:bg-[#F5E0D8] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest transition-colors border border-[#F0D5CC]">
            Ver Blog Completo →
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (post of blogPosts(); track post.id) {
            <div class="bg-white rounded-[32px] border border-[#F0D5CC] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
              <div class="h-48 overflow-hidden bg-[#FDF5F0]">
                <img [src]="post.imagen" [alt]="post.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span class="text-[10px] font-bold text-[#FF758F] uppercase tracking-widest block mb-2 font-serif">{{ post.categoria }}</span>
                  <h3 class="text-lg font-serif italic text-[#1A1A1A] group-hover:text-[#FF758F] transition-colors line-clamp-2 font-bold">
                    {{ post.titulo }}
                  </h3>
                  <p class="text-xs text-[#1A1A1A]/75 mt-2 line-clamp-3 leading-relaxed">
                    {{ post.resumen }}
                  </p>
                </div>
                <div class="pt-4 mt-4 border-t border-[#F0D5CC] flex items-center justify-between text-xs font-bold">
                  <span class="text-[#1A1A1A]/60 text-[11px]">{{ post.tiempoLectura }} de lectura</span>
                  <a [routerLink]="['/blog', post.slug]" class="text-[#FF758F] font-bold uppercase tracking-wider text-[11px] hover:underline">Leer Más →</a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HomePageComponent {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);

  config = this.dataService.visualConfig;
  categories = this.dataService.categories;
  topProducts = this.dataService.featuredProducts;
  topReviews = this.dataService.reviews;
  blogPosts = this.dataService.blogPosts;
}
