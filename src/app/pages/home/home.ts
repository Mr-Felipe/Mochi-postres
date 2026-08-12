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
    <section class="relative bg-[#FAF7F2] pt-12 pb-20 overflow-hidden border-b border-[#EBE3D5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Headlines & Action CTAs -->
          <div class="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-xs font-bold uppercase tracking-wider border border-[#EBE3D5]">
              <span>🌸</span>
              <span>100% Artesanal • La Dorada, Caldas</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif italic text-[#4A3F35] leading-tight">
              Descubre el arte del <span class="not-italic font-normal">Mochi.</span>
            </h1>

            <p class="text-base sm:text-lg text-[#4A3F35]/80 leading-relaxed font-sans max-w-xl mx-auto lg:mx-0">
              {{ config().heroSubtitulo }}
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a routerLink="/productos" class="w-full sm:w-auto px-8 py-4 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm">
                <span>Ver Catálogo</span>
                <span class="material-icons text-base">arrow_forward</span>
              </a>

              <a routerLink="/checkout" class="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FFD6E0] hover:bg-[#ffc2d1] text-[#4A3F35] font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2">
                <span>🛍️ Hacer Pedido</span>
              </a>
            </div>

            <!-- Features Trust Points -->
            <div class="grid grid-cols-3 gap-4 pt-8 border-t border-[#EBE3D5] text-[#4A3F35]">
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic block">24/7</span>
                <span class="text-[11px] text-[#4A3F35]/60 font-semibold uppercase tracking-wider">Pedidos Online</span>
              </div>
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic block">45 min</span>
                <span class="text-[11px] text-[#4A3F35]/60 font-semibold uppercase tracking-wider">Envío Local</span>
              </div>
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic block">4.9 ★</span>
                <span class="text-[11px] text-[#4A3F35]/60 font-semibold uppercase tracking-wider">Calificación</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Product Carousel Card -->
          <div class="lg:col-span-6">
            <app-product-carousel />
          </div>

        </div>
      </div>
    </section>

    <!-- Section 1: Explora por Categoría -->
    <section class="py-16 bg-white border-b border-[#EBE3D5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">Variedad Japonesa</span>
          <h2 class="text-3xl font-serif italic text-[#4A3F35] mt-1">Explora por Categoría</h2>
          <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider mt-2 font-medium">Delicadas creaciones elaboradas diariamente con ingredientes frescos</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          @for (cat of categories(); track cat.id) {
            <a 
              [routerLink]="['/productos']" 
              [queryParams]="{categoria: cat.id}"
              class="group p-6 rounded-[32px] bg-[#FAF7F2] hover:bg-[#FFD6E0]/30 border border-[#EBE3D5] text-center transition-all duration-300 hover:shadow-xs block">
              <div class="w-14 h-14 rounded-full bg-white border border-[#EBE3D5] flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                {{ cat.icono }}
              </div>
              <h3 class="font-serif italic text-[#4A3F35] text-base group-hover:opacity-80 transition-opacity">
                {{ cat.nombre }}
              </h3>
              <p class="text-[11px] text-[#4A3F35]/60 mt-1 line-clamp-2 leading-relaxed">
                {{ cat.descripcion }}
              </p>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Section 2: Top 3 Productos Más Populares -->
    <section class="py-20 bg-[#FAF7F2]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">⭐ Los Favoritos</span>
            <h2 class="text-3xl sm:text-4xl font-serif italic text-[#4A3F35] mt-1">Nuestros Más Populares</h2>
            <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider mt-1">Los postres más aclamados por la comunidad de La Dorada</p>
          </div>

          <a routerLink="/productos" class="px-6 py-3 rounded-full bg-white border border-[#EBE3D5] hover:border-[#4A3F35] text-[#4A3F35] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
            <span>Ver Todos los Productos</span>
            <span class="material-icons text-base">east</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (prod of topProducts(); track prod.id) {
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
              <!-- Image -->
              <div class="relative h-64 bg-[#FAF7F2] overflow-hidden">
                <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#4A3F35]/90 backdrop-blur-md text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider">
                  {{ prod.nombre_japones.split(' ')[0] }}
                </span>
                <button (click)="dataService.toggleFavorite(prod.id)" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 text-[#4A3F35] border border-[#EBE3D5] shadow-xs flex items-center justify-center hover:scale-110 transition-transform">
                  <span class="material-icons text-lg">{{ dataService.isFavorite(prod.id) ? 'favorite' : 'favorite_border' }}</span>
                </button>
              </div>

              <!-- Body -->
              <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-[#4A3F35]/60 font-serif italic">{{ prod.nombre_japones }}</span>
                    <div class="flex items-center text-[#4A3F35] text-xs font-bold gap-0.5">
                      <span class="material-icons text-sm text-amber-500">star</span>
                      <span>{{ prod.calificacion }} ({{ prod.num_resenas }})</span>
                    </div>
                  </div>

                  <h3 class="text-xl font-serif italic text-[#4A3F35]">
                    {{ prod.nombre_espanol }}
                  </h3>

                  <p class="text-xs text-[#4A3F35]/70 mt-2 line-clamp-2 leading-relaxed">
                    {{ prod.descripcion_corta }}
                  </p>
                </div>

                <div class="pt-4 border-t border-[#EBE3D5] flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-[#4A3F35]/60 uppercase tracking-widest block font-bold">Precio</span>
                    <span class="text-xl font-serif italic text-[#4A3F35]">
                      {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button (click)="cartService.addToCart(prod, 1)" class="p-3 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] transition-all hover:scale-105 active:scale-95" title="Añadir al Carrito">
                      <span class="material-icons text-base">add_shopping_cart</span>
                    </button>
                    <a [routerLink]="['/productos', prod.id]" class="px-4 py-3 rounded-full bg-[#FFD6E0] hover:bg-[#ffc2d1] text-[#4A3F35] text-xs font-bold uppercase tracking-wider transition-colors">
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
    <section class="py-14 bg-[#FFD6E0] text-[#4A3F35] border-y border-[#EBE3D5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span class="px-3.5 py-1 rounded-full bg-white/60 text-[10px] font-bold tracking-widest uppercase border border-[#EBE3D5]">Herramienta Interactiva</span>
          <h2 class="text-2xl sm:text-3xl font-serif italic mt-2">¿Quieres calcular el valor exacto de tu pedido?</h2>
          <p class="text-[#4A3F35]/80 text-xs uppercase tracking-wider mt-1 font-medium">Prueba nuestro simulador de pedidos sin compromiso y calcula el envío a domicilio.</p>
        </div>

        <a routerLink="/simulador" class="px-8 py-4 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-sm hover:bg-[#362D26] transition-all hover:scale-105 active:scale-95 whitespace-nowrap">
          🧮 Abrir Simulador de Pedidos
        </a>
      </div>
    </section>

    <!-- Section 3: Reseñas de Clientes (3 Mejores) -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">💬 Testimonios Reales</span>
          <h2 class="text-3xl font-serif italic text-[#4A3F35] mt-1">Lo que Dicen Nuestros Clientes</h2>
          <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider mt-1">Opiniones verificadas de amantes del dulce en La Dorada</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (rev of topReviews(); track rev.id) {
            <div class="p-8 rounded-[32px] bg-[#FAF7F2] border border-[#EBE3D5] flex flex-col justify-between space-y-4">
              <div>
                <div class="flex items-center text-amber-400 mb-4 gap-1">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="material-icons text-base">star</span>
                  }
                </div>
                <p class="text-[#4A3F35] text-xs leading-relaxed italic">
                  "{{ rev.comentario }}"
                </p>
              </div>

              <div class="pt-4 border-t border-[#EBE3D5] flex items-center justify-between text-xs">
                <span class="font-serif italic text-[#4A3F35]">— {{ rev.nombreCliente }}</span>
                <span class="text-[#4A3F35]/50 text-[11px]">{{ rev.fecha }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Section 4: Sobre Nosotros Preview -->
    <section class="py-20 bg-[#FAF7F2] border-t border-[#EBE3D5]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-5">
            <div class="relative rounded-[40px] overflow-hidden border border-[#EBE3D5] shadow-xs">
              <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80" alt="Sobre MOCHI" class="w-full h-96 object-cover">
              <div class="absolute inset-0 bg-gradient-to-t from-[#4A3F35]/80 via-transparent to-transparent flex items-end p-8 text-[#FAF7F2]">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-[#FFD6E0] block">Autenticidad Artesanal</span>
                  <span class="text-xl font-serif italic">Hecho a mano en La Dorada</span>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7 space-y-6">
            <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">🏯 Sobre Mochi.</span>
            <h2 class="text-3xl sm:text-4xl font-serif italic text-[#4A3F35] leading-tight">
              Pioneros en la repostería japonesa de Caldas
            </h2>
            <p class="text-[#4A3F35]/80 text-sm leading-relaxed">
              Somos un emprendimiento fundado por Michel, Felipe y Neider para traer la auténtica cultura del postre japonés a La Dorada. Cada pieza se prepara bajo procesos artesanales respetando las temperaturas, texturas y recetas ancestrales.
            </p>

            <div class="grid grid-cols-2 gap-4 pt-2">
              <div class="p-5 rounded-[24px] bg-white border border-[#EBE3D5]">
                <span class="text-2xl mb-1 block">🌿</span>
                <h4 class="font-serif italic text-[#4A3F35] text-base">Ingredientes Premium</h4>
                <p class="text-[11px] text-[#4A3F35]/70 mt-1">Matcha de Uji e ingredientes frescos locales.</p>
              </div>
              <div class="p-5 rounded-[24px] bg-white border border-[#EBE3D5]">
                <span class="text-2xl mb-1 block">🎁</span>
                <h4 class="font-serif italic text-[#4A3F35] text-base">Empaque de Regalo</h4>
                <p class="text-[11px] text-[#4A3F35]/70 mt-1">Presentación elegante lista para obsequiar.</p>
              </div>
            </div>

            <div class="pt-4">
              <a routerLink="/sobre-nosotros" class="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest transition-colors shadow-sm">
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
            <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">📰 Cultura & Recetas</span>
            <h2 class="text-3xl font-serif italic text-[#4A3F35] mt-1">Noticias y Consejos Japoneses</h2>
          </div>
          <a routerLink="/blog" class="px-6 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#EBE3D5] text-[#4A3F35] font-bold text-xs uppercase tracking-widest transition-colors">
            Ver Blog Completo →
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (post of blogPosts(); track post.id) {
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
              <div class="h-48 overflow-hidden bg-[#FAF7F2]">
                <img [src]="post.imagen" [alt]="post.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span class="text-[10px] font-bold text-[#4A3F35]/60 uppercase tracking-widest block mb-2 font-serif">{{ post.categoria }}</span>
                  <h3 class="text-lg font-serif italic text-[#4A3F35] group-hover:opacity-80 transition-opacity line-clamp-2">
                    {{ post.titulo }}
                  </h3>
                  <p class="text-xs text-[#4A3F35]/70 mt-2 line-clamp-3 leading-relaxed">
                    {{ post.resumen }}
                  </p>
                </div>
                <div class="pt-4 mt-4 border-t border-[#EBE3D5] flex items-center justify-between text-xs">
                  <span class="text-[#4A3F35]/50 font-medium text-[11px]">{{ post.tiempoLectura }} de lectura</span>
                  <a [routerLink]="['/blog', post.slug]" class="text-[#4A3F35] font-bold uppercase tracking-wider text-[11px] hover:underline">Leer Más →</a>
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
