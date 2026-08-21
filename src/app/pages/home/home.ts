import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCarouselComponent } from '../../components/carousel/product-carousel';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
import { PaletteService } from '../../services/palette.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCarouselComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ===================== HERO ===================== -->
    <section class="relative pt-20 sm:pt-24 pb-24 overflow-hidden" [style.background]="heroBg()">
      <!-- Decorative circles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none" [style.opacity]="heroPatternOpacity()">
        <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full" [style.background]="heroCircleColor()" style="filter: blur(80px)"></div>
        <div class="absolute top-40 -left-10 w-60 h-60 rounded-full" [style.background]="heroCircleColor2()" style="filter: blur(60px)"></div>
        <div class="absolute bottom-10 right-1/4 w-40 h-40 rounded-full" [style.background]="heroCircleColor()" style="filter: blur(50px)"></div>
      </div>

      <!-- Wave SVG bottom -->
      <div class="hero-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path [attr.fill]="heroWaveFill()" d="M0,30 C360,60 720,0 1080,30 C1260,45 1380,30 1440,30 L1440,60 L0,60 Z"></path>
        </svg>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <!-- Left: Headlines -->
          <div class="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              [style.background]="heroBadgeBg()" [style.color]="heroBadgeText()">
              <span>100% Artesanal</span>
              <span>La Dorada, Caldas</span>
            </div>

            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-serif italic leading-tight" [style.color]="heroTextColor()">
              Descubre el arte del <span class="not-italic font-bold" [style.color]="'var(--accent)'">Mochi.</span>
            </h1>

            <p class="text-base sm:text-lg leading-relaxed font-sans max-w-xl mx-auto lg:mx-0 font-medium" [style.color]="heroSubtextColor()">
              Postres artesanales elaborados con ingredientes premium, recetas tradicionales de Kioto y presentacion de lujo.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a routerLink="/productos" class="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm"
                [style.background]="'var(--accent)'" [style.color]="heroBtnText()">
                <span>Ver Catalogo</span>
                <span class="material-icons text-base">arrow_forward</span>
              </a>
              <a routerLink="/simulador" class="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 border"
                [style.border-color]="heroBtnBorder()" [style.color]="heroBtnText2()" [style.background]="heroBtnBg2()">
                <span>Calcular Pedido</span>
              </a>
            </div>

            <!-- Trust points -->
            <div class="grid grid-cols-3 gap-4 pt-8 border-t" [style.border-color]="heroBorderColor()">
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic font-bold block" [style.color]="'var(--accent)'">24/7</span>
                <span class="text-[11px] font-bold uppercase tracking-wider" [style.color]="heroSubtextColor()">Pedidos Online</span>
              </div>
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic font-bold block" [style.color]="heroTextColor()">45 min</span>
                <span class="text-[11px] font-bold uppercase tracking-wider" [style.color]="heroSubtextColor()">Envio Local</span>
              </div>
              <div class="text-center lg:text-left">
                <span class="text-2xl font-serif italic font-bold block" style="color: var(--star)">4.9 &#9733;</span>
                <span class="text-[11px] font-bold uppercase tracking-wider" [style.color]="heroSubtextColor()">Calificacion</span>
              </div>
            </div>
          </div>

          <!-- Right: Carousel -->
          <div class="lg:col-span-7">
            <app-product-carousel />
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== POR QUE SABE DIFERENTE ===================== -->
    <section class="py-16" [style.background]="sectionBg1()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-widest font-serif" [style.color]="'var(--accent)'">Por que sabe diferente</span>
          <h2 class="text-3xl font-serif italic mt-1" [style.color]="headingColor()">Nuestros Pilares de Calidad</h2>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          @for (pillar of pillars; track pillar.title) {
            <div class="p-6 rounded-3xl text-center transition-all duration-300 hover:shadow-lg group"
              [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">
              <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform"
                [style.background]="pillarBg()">
                {{ pillar.icon }}
              </div>
              <h3 class="font-serif italic text-base font-bold mb-1" [style.color]="headingColor()">{{ pillar.title }}</h3>
              <p class="text-[11px] leading-relaxed font-medium" [style.color]="textColor()">{{ pillar.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===================== LO MAS PEDIDOS ===================== -->
    <section class="py-20" [style.background]="sectionBg2()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest font-serif" [style.color]="'var(--accent)'">Los Favoritos</span>
            <h2 class="text-3xl sm:text-4xl font-serif italic mt-1" [style.color]="headingColor()">Lo Mas Pedidos</h2>
            <p class="text-xs uppercase tracking-wider mt-1 font-semibold" [style.color]="textColor()">Los postres mas aclamados por la comunidad de La Dorada</p>
          </div>
          <a routerLink="/productos" class="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2"
            [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'" [style.color]="headingColor()">
            <span>Ver Todos</span>
            <span class="material-icons text-base">east</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (prod of topProducts(); track prod.id) {
            <div class="rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group"
              [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">
              <div class="relative h-64 overflow-hidden" [style.background]="imgBg()">
                <img [src]="prod.imagen_principal" [alt]="prod.nombre_espanol" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <span class="absolute top-4 left-4 px-3 py-1 rounded-full text-[#FDF5F0] text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                  [style.background]="'var(--accent)/90'">
                  {{ prod.nombre_japones.split(' ')[0] }}
                </span>
                <button (click)="dataService.toggleFavorite(prod.id)" class="absolute top-4 right-4 w-9 h-9 rounded-full border shadow-xs flex items-center justify-center hover:scale-110 transition-transform"
                  [style.background]="cardBg()" [style.border-color]="'var(--border-soft)'">
                  <span class="material-icons text-lg" [style.color]="dataService.isFavorite(prod.id) ? 'var(--accent)' : 'var(--text-muted)'">
                    {{ dataService.isFavorite(prod.id) ? 'favorite' : 'favorite_border' }}
                  </span>
                </button>
              </div>
              <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold font-serif italic" [style.color]="'var(--accent)'">{{ prod.nombre_japones }}</span>
                    <div class="flex items-center text-xs font-bold gap-0.5" [style.color]="textColor()">
                      <span class="material-icons text-sm" style="color: var(--star)">star</span>
                      <span>{{ prod.calificacion }} ({{ prod.num_resenas }})</span>
                    </div>
                  </div>
                  <h3 class="text-xl font-serif italic font-bold" [style.color]="headingColor()">{{ prod.nombre_espanol }}</h3>
                  <p class="text-xs mt-2 line-clamp-2 leading-relaxed" [style.color]="textColor()">{{ prod.descripcion_corta }}</p>
                </div>
                <div class="pt-4 border-t flex items-center justify-between" [style.border-color]="'var(--border-soft)'">
                  <div>
                    <span class="text-[10px] uppercase tracking-widest block font-bold" [style.color]="textColor()">Precio</span>
                    <span class="text-xl font-serif italic font-bold" [style.color]="headingColor()">
                      {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="cartService.addToCart(prod, 1)" class="p-3 rounded-full transition-all hover:scale-105 active:scale-95"
                      [style.background]="'var(--accent)'" style="color: white">
                      <span class="material-icons text-base">add_shopping_cart</span>
                    </button>
                    <a [routerLink]="['/productos', prod.id]" class="px-4 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
                      [style.background]="'var(--accent)'">
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

    <!-- ===================== TESTIMONIOS ===================== -->
    <section class="py-20" [style.background]="sectionBg1()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-xl mx-auto mb-12">
          <span class="text-xs font-bold uppercase tracking-widest font-serif" [style.color]="'var(--accent)'">Lo que dicen nuestros clientes</span>
          <h2 class="text-3xl font-serif italic mt-1" [style.color]="headingColor()">Testimonios Reales</h2>
        </div>

        <!-- Carousel -->
        <div class="relative overflow-hidden">
          <div class="carousel-track" [style.transform]="'translateX(-' + (currentSlide() * 100) + '%)'">
            @for (review of reviews(); track review.id; let i = $index) {
              <div class="min-w-full px-4">
                <div class="max-w-2xl mx-auto p-8 rounded-3xl text-center" [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">
                  <!-- Stars -->
                  <div class="flex items-center justify-center gap-1 mb-4">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span class="material-icons text-lg" [style.color]="star <= review.calificacion ? 'var(--star)' : 'var(--border-soft)'">star</span>
                    }
                  </div>
                  <p class="text-sm leading-relaxed italic font-medium mb-6" [style.color]="textColor()">
                    "{{ review.comentario }}"
                  </p>
                  <div class="flex items-center justify-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.background]="'var(--accent)'">
                      {{ review.nombreCliente.charAt(0) }}
                    </div>
                    <div class="text-left">
                      <p class="text-xs font-bold" [style.color]="headingColor()">{{ review.nombreCliente }}</p>
                      <p class="text-[10px]" [style.color]="textColor()">Cliente verificado</p>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Dots -->
          <div class="flex items-center justify-center gap-2 mt-8">
            @for (review of reviews(); track review.id; let i = $index) {
              <button (click)="currentSlide.set(i)" class="carousel-dot" [class.active]="currentSlide() === i"></button>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== FAQ ===================== -->
    <section class="py-20" [style.background]="sectionBg2()">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="text-xs font-bold uppercase tracking-widest font-serif" [style.color]="'var(--accent)'">Preguntas Frecuentes</span>
          <h2 class="text-3xl font-serif italic mt-1" [style.color]="headingColor()">FAQ</h2>
        </div>

        <div class="space-y-3">
          @for (faq of faqs; track faq.q; let i = $index) {
            <div class="rounded-2xl overflow-hidden transition-all" [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">
              <button (click)="toggleFaq(i)" class="w-full flex items-center justify-between px-6 py-4 text-left">
                <span class="text-sm font-bold" [style.color]="headingColor()">{{ faq.q }}</span>
                <span class="material-icons text-lg transition-transform" [style.color]="textColor()"
                  [class.rotated]="openFaq() === i">add</span>
              </button>
              <div class="faq-answer px-6" [class.open]="openFaq() === i">
                <p class="text-xs leading-relaxed pb-4" [style.color]="textColor()">{{ faq.a }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===================== ZONAS DE DELIVERY ===================== -->
    <section class="py-20" [style.background]="sectionBg1()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <span class="text-xs font-bold uppercase tracking-widest font-serif" [style.color]="'var(--accent)'">Cobertura</span>
          <h2 class="text-3xl font-serif italic mt-1" [style.color]="headingColor()">Zonas de Delivery</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (zone of zones; track zone.name) {
            <div class="p-6 rounded-3xl transition-all hover:shadow-lg"
              [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">
              <div class="flex items-center gap-3 mb-4">
                <span class="material-icons text-2xl" [style.color]="'var(--accent)'">location_on</span>
                <h3 class="font-serif italic font-bold text-lg" [style.color]="headingColor()">{{ zone.name }}</h3>
              </div>
              <p class="text-xs mb-3" [style.color]="textColor()">{{ zone.desc }}</p>
              <div class="flex items-center justify-between text-xs font-bold">
                <span [style.color]="'var(--accent)'">{{ zone.price }}</span>
                <span [style.color]="textColor()">{{ zone.time }}</span>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ===================== BLOG PREVIEW ===================== -->
    <section class="py-20" [style.background]="sectionBg2()">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest font-serif" [style.color]="'var(--accent)'">Cultura y Recetas</span>
            <h2 class="text-3xl font-serif italic mt-1" [style.color]="headingColor()">Noticias Japonesas</h2>
          </div>
          <a routerLink="/blog" class="px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-colors border"
            [style.background]="cardBg()" [style.border-color]="'var(--border-soft)'" [style.color]="headingColor()">
            Ver Blog Completo
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (post of blogPosts(); track post.id) {
            <div class="rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-group"
              [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">
              <div class="h-48 overflow-hidden" [style.background]="imgBg()">
                <img [src]="post.imagen" [alt]="post.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
              </div>
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest block mb-2 font-serif" [style.color]="'var(--accent)'">{{ post.categoria }}</span>
                  <h3 class="text-lg font-serif italic font-bold line-clamp-2" [style.color]="headingColor()">{{ post.titulo }}</h3>
                  <p class="text-xs mt-2 line-clamp-3 leading-relaxed" [style.color]="textColor()">{{ post.resumen }}</p>
                </div>
                <div class="pt-4 mt-4 border-t flex items-center justify-between text-xs font-bold" [style.border-color]="'var(--border-soft)'">
                  <span [style.color]="textColor()">{{ post.tiempoLectura }} de lectura</span>
                  <a [routerLink]="['/blog', post.slug]" class="uppercase tracking-wider text-[11px] hover:underline" [style.color]="'var(--accent)'">Leer Mas</a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HomePageComponent implements OnInit, OnDestroy {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);
  palette = inject(PaletteService);
  private platformId = inject(PLATFORM_ID);

  config = this.dataService.visualConfig;
  categories = this.dataService.categories;
  topProducts = this.dataService.featuredProducts;
  blogPosts = this.dataService.blogPosts;
  reviews = this.dataService.reviews;

  currentSlide = signal(0);
  openFaq = signal<number | null>(null);
  private autoSlideTimer: any;

  pillars = [
    { icon: '\u{1F95B}', title: 'Leche de Pasto', desc: 'Fresca, sin conservadores, de tambores locales de La Dorada.' },
    { icon: '\u{1F38D}', title: 'Ingredientes Artesanales', desc: 'Matcha de Uji, chocolate belga, frutas frescas de temporada.' },
    { icon: '\u{1F33F}', title: 'Opciones Inclusivas', desc: 'Tambien tenemos opciones veganas y sin gluten para todos.' },
    { icon: '\u{23F0}', title: 'Produccion Diaria', desc: 'Cada pieza se elabora el mismo dia para maxima frescura.' }
  ];

  faqs = [
    { q: 'Cuanto tarda el envio?', a: 'En La Dorada el envio tarda entre 30-45 minutos. Para pedidos nacionales, el tiempo estimado es de 1-3 dias habiles dependiendo de la zona.' },
    { q: 'Tienen opciones veganas o sin gluten?', a: 'Si! Tenemos mochis de fresa sin lactosa y opciones con base de arroz que son naturalmente libres de gluten. Consulta nuestro catalogo completo.' },
    { q: 'Como conservo los postres?', a: 'Los mochis se conservan en refrigeracion hasta por 3 dias. Para mejor experiencia, consumentelos dentro de las primeras 24 horas. Tambien se pueden congelar hasta por 2 semanas.' },
    { q: 'Hacen envios nacionales?', a: 'Si, realizamos envios a toda Colombia mediante Servientrega. El costo varia segun la zona y el tiempo de entrega es de 1-3 dias habiles.' },
    { q: 'Puedo hacer pedidos para eventos?', a: 'Claro! Ofrecemos paquetes especiales para bodas, quinceaneras, bautizos y eventos corporativos. Contactanos con 72 horas de anticipacion.' }
  ];

  zones = [
    { name: 'Zona 1 - La Dorada', desc: 'Envio gratis en compras superiores a $50.000 COP.', price: 'Gratis >$50.000', time: '30-45 min' },
    { name: 'Zona 2 - Municipios', desc: 'Victoria, Honda, Marquetalia, Puerto Boyaca y alrededores.', price: '$5.000 COP', time: '45-60 min' },
    { name: 'Zona 3 - Nacional', desc: 'Envio a toda Colombia mediante Servientrega.', price: 'Variable', time: '1-3 dias habiles' }
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.autoSlideTimer = setInterval(() => {
        const total = this.reviews().length;
        if (total > 0) {
          this.currentSlide.update(s => (s + 1) % total);
        }
      }, 5000);
    }
  }

  ngOnDestroy() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
    }
  }

  toggleFaq(i: number) {
    this.openFaq.update(current => current === i ? null : i);
  }

  // ---- PALETTE-AWARE STYLES ----
  // Use palette service directly so computed re-evaluates on toggle
  private p = computed(() => this.palette.current());

  heroBg = computed(() => this.p() === 'vino' ? 'linear-gradient(135deg, #590E2A 0%, #3D0A1A 60%, #590E2A 100%)' : 'linear-gradient(135deg, #FDF5F0 0%, #F8E8EE 50%, #FDF5F0 100%)');
  heroTextColor = computed(() => this.p() === 'vino' ? '#FDF8F4' : '#590E2A');
  heroSubtextColor = computed(() => this.p() === 'vino' ? 'rgba(253,248,244,0.8)' : 'rgba(89,14,42,0.75)');
  heroBtnText = computed(() => '#FFFFFF');
  heroBtnText2 = computed(() => this.p() === 'vino' ? '#FDF8F4' : '#590E2A');
  heroBtnBg2 = computed(() => this.p() === 'vino' ? 'rgba(255,255,255,0.1)' : 'rgba(89,14,42,0.05)');
  heroBtnBorder = computed(() => this.p() === 'vino' ? 'rgba(253,248,244,0.3)' : 'rgba(89,14,42,0.2)');
  heroBorderColor = computed(() => this.p() === 'vino' ? 'rgba(253,248,244,0.15)' : 'rgba(89,14,42,0.12)');
  heroBadgeBg = computed(() => this.p() === 'vino' ? 'rgba(217,85,120,0.25)' : 'rgba(217,85,120,0.1)');
  heroBadgeText = computed(() => this.p() === 'vino' ? '#F2A3B5' : '#590E2A');
  heroPatternOpacity = computed(() => '1');
  heroCircleColor = computed(() => this.p() === 'vino' ? 'rgba(217,85,120,0.15)' : 'rgba(217,85,120,0.12)');
  heroCircleColor2 = computed(() => this.p() === 'vino' ? 'rgba(253,248,244,0.06)' : 'rgba(217,85,120,0.08)');
  heroWaveFill = computed(() => this.p() === 'vino' ? '#FDF8F4' : '#FFFFFF');

  headingColor = computed(() => this.p() === 'vino' ? '#590E2A' : '#590E2A');
  textColor = computed(() => this.p() === 'vino' ? '#8C6D51' : '#8C6D51');
  sectionBg1 = computed(() => this.p() === 'vino' ? '#FDF8F4' : '#FFFFFF');
  sectionBg2 = computed(() => this.p() === 'vino' ? '#FFFCF8' : '#FDF5F0');
  cardBg = computed(() => this.p() === 'vino' ? '#FFFCF8' : '#FFFFFF');
  imgBg = computed(() => this.p() === 'vino' ? '#FDF8F4' : '#FDF5F0');
  pillarBg = computed(() => this.p() === 'vino' ? 'rgba(217,85,120,0.1)' : 'rgba(217,85,120,0.08)');
}
