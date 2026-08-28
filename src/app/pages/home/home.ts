import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCarouselComponent } from '../../components/carousel/product-carousel';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
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
              Postres artesanales elaborados con ingredientes de alta calidad, recetas tradicionales de nuestra cultura Japonesa y presentacion de lujo.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a routerLink="/productos" class="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm"
                [style.background]="'var(--accent)'" [style.color]="heroBtnText()">
                <span>Ver Catalogo</span>
                <span class="material-icons text-base">arrow_forward</span>
              </a>
              <a routerLink="/productos" class="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2 border"
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

<section
  class="relative py-20 sm:py-24 overflow-hidden"
  [style.background]="sectionBg1()">

  <div class="absolute inset-0 pointer-events-none overflow-hidden">

<!-- Textura suave tipo papel -->
<div
  class="absolute inset-0 opacity-[0.035]"
  style="
    background-image:
      radial-gradient(circle at 20% 20%, currentColor 1px, transparent 1px),
      radial-gradient(circle at 80% 70%, currentColor 1px, transparent 1px);
    background-size: 32px 32px;
  ">
</div>

<!-- Mancha orgánica superior izquierda -->
<div
  class="absolute -top-32 -left-20 w-[420px] h-[320px]
         rounded-[45%] rotate-[-18deg]
         opacity-30 blur-3xl"
  [style.background]="'var(--accent)'">
</div>

<!-- Mancha orgánica inferior derecha -->
<div
  class="absolute -bottom-40 -right-24 w-[500px] h-[360px]
         rounded-[50%] rotate-[20deg]
         opacity-20 blur-3xl"
  [style.background]="'var(--accent)'">
</div>

<!-- Halo central -->
<div
  class="absolute left-1/2 top-1/2
         -translate-x-1/2 -translate-y-1/2
         w-[420px] h-[420px]
         rounded-full opacity-[0.07] blur-2xl"
  [style.background]="'var(--accent)'">
</div>

<!-- Círculos decorativos superiores -->
<div
  class="absolute top-16 right-[5%]
         w-40 h-40 rounded-full border opacity-10"
  [style.border-color]="'var(--accent)'">
</div>

<div
  class="absolute top-20 right-[7%]
         w-28 h-28 rounded-full border opacity-10"
  [style.border-color]="'var(--accent)'">
</div>

<!-- Círculo decorativo inferior -->
<div
  class="absolute bottom-20 left-[4%]
         w-28 h-28 rounded-full border opacity-10"
  [style.border-color]="'var(--accent)'">
</div>

<!-- Destellos -->
<div
  class="absolute top-[18%] left-[12%]
         text-xl opacity-20"
  [style.color]="'var(--accent)'">
  ✦
</div>

<div
  class="absolute top-[32%] right-[13%]
         text-sm opacity-20"
  [style.color]="'var(--accent)'">
  ✧
</div>

<div
  class="absolute bottom-[18%] right-[18%]
         text-lg opacity-15"
  [style.color]="'var(--accent)'">
  ✦
</div>

<div
  class="absolute bottom-[28%] left-[15%]
         text-xs opacity-20"
  [style.color]="'var(--accent)'">
  ✧
</div>

<!-- Líneas curvas decorativas izquierda -->
<svg
  class="absolute left-0 bottom-0
         w-72 h-72 opacity-[0.07]"
  viewBox="0 0 300 300"
  fill="none">

  <path
    d="M-20 260C70 180 120 320 310 170"
    [attr.stroke]="'var(--accent)'"
    stroke-width="1">
  </path>

  <path
    d="M-30 280C60 200 130 340 320 190"
    [attr.stroke]="'var(--accent)'"
    stroke-width="1">
  </path>

</svg>

<!-- Líneas curvas decorativas derecha -->
<svg
  class="absolute right-0 top-0
         w-80 h-80 opacity-[0.06]"
  viewBox="0 0 300 300"
  fill="none">

  <path
    d="M320 40C210 80 230 180 80 220"
    [attr.stroke]="'var(--accent)'"
    stroke-width="1">
  </path>

  <path
    d="M320 20C190 70 220 160 60 210"
    [attr.stroke]="'var(--accent)'"
    stroke-width="1">
  </path>

</svg>

  </div>

  <div
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

<div class="text-center max-w-2xl mx-auto mb-16">

  <div class="flex items-center justify-center gap-4 mb-5">
    <span
      class="w-10 h-px opacity-40"
      [style.background]="'var(--accent)'">
    </span>
    <span
      class="text-[10px] font-bold uppercase
             tracking-[0.35em] font-serif"
      [style.color]="'var(--accent)'">
      Por qué sabe diferente
    </span>
    <span
      class="w-10 h-px opacity-40"
      [style.background]="'var(--accent)'">
    </span>
  </div>

  <h2
    class="text-4xl sm:text-5xl font-serif italic leading-tight"
    [style.color]="headingColor()">
    Pequeños detalles.
    <span [style.color]="'var(--accent)'">
      Grandes sabores.
    </span>
  </h2>

  <p
    class="mt-5 text-sm sm:text-base
           leading-relaxed max-w-lg mx-auto"
    [style.color]="textColor()">
    En MOCHI creemos que un gran postre comienza mucho antes
    del primer bocado. Seleccionamos cada ingrediente y cuidamos
    cada detalle para crear una experiencia especial.
  </p>
</div>

<div class="relative max-w-6xl mx-auto">

  <div
    class="hidden lg:block absolute
           left-1/2 top-10 bottom-10
           w-px opacity-10"
    [style.background]="'var(--accent)'">
  </div>

  <div
    class="grid grid-cols-1 lg:grid-cols-2
           gap-x-24 gap-y-10">

    @for (pillar of pillars; track pillar.title; let i = $index) {

      <div
        class="group relative"
        [class.lg:text-right]="i === 0 || i === 2"
        [class.lg:text-left]="i === 1 || i === 3">

        <div
          class="hidden lg:block absolute
                 top-8 w-20 h-px opacity-20"
          [class.right-[-96px]]="i === 0 || i === 2"
          [class.left-[-96px]]="i === 1 || i === 3"
          [style.background]="'var(--accent)'">
        </div>

        <div
          class="relative p-7 sm:p-8
                 rounded-[2rem]
                 transition-all duration-500
                 hover:-translate-y-1
                 hover:shadow-xl"
          [style.background]="cardBg()"
          [style.border]="'1px solid var(--border-soft)'">

          <div
            class="absolute top-5
                   text-[10px] font-bold
                   tracking-[0.25em] opacity-40"
            [class.right-6]="i === 0 || i === 2"
            [class.left-6]="i === 1 || i === 3"
            [style.color]="'var(--accent)'">
            0{{ i + 1 }}
          </div>

          <div
            class="flex items-center gap-5"
            [class.lg:flex-row-reverse]="i === 0 || i === 2">

            <div
              class="flex-shrink-0
                     w-16 h-16
                     rounded-full
                     flex items-center justify-center
                     text-2xl
                     transition-all duration-500
                     group-hover:scale-110
                     group-hover:rotate-3"
              [style.background]="pillarBg()"
              [style.border]="'1px solid var(--border-soft)'">
              {{ pillar.icon }}
            </div>

            <div class="flex-1">
              <h3
                class="font-serif italic
                       text-xl font-bold mb-2"
                [style.color]="headingColor()">
                {{ pillar.title }}
              </h3>
              <p
                class="text-xs sm:text-[13px]
                       leading-relaxed font-medium"
                [style.color]="textColor()">
                {{ pillar.desc }}
              </p>
            </div>
          </div>

          <div
            class="mt-6 flex items-center gap-2"
            [class.lg:justify-end]="i === 0 || i === 2">
            <span
              class="w-1.5 h-1.5 rounded-full"
              [style.background]="'var(--accent)'">
            </span>
            <span
              class="text-[9px] uppercase
                     tracking-[0.2em]
                     font-bold opacity-50"
              [style.color]="textColor()">
              Calidad MOCHI
            </span>
          </div>
        </div>
      </div>
    }
  </div>

  <div
    class="hidden lg:flex
           absolute left-1/2 top-1/2
           -translate-x-1/2
           -translate-y-1/2
           w-28 h-28
           rounded-full
           items-center justify-center
           z-20"
    [style.background]="sectionBg1()"
    [style.border]="'1px solid var(--border-soft)'">
    <div
      class="w-20 h-20
             rounded-full
             flex flex-col
             items-center justify-center
             text-center"
      [style.background]="pillarBg()">
      <span
        class="text-[9px] uppercase
               tracking-[0.25em] font-bold"
        [style.color]="'var(--accent)'">
        Hecho
      </span>
      <span
        class="font-serif italic
               text-xl font-bold"
        [style.color]="headingColor()">
        MOCHI
      </span>
      <span
        class="text-[7px]
               uppercase tracking-widest opacity-60"
        [style.color]="textColor()">
        con amor
      </span>
    </div>
  </div>
</div>

<div class="text-center mt-16">
  <div
    class="inline-flex items-center
           gap-3 px-5 py-2
           rounded-full"
    [style.background]="cardBg()"
    [style.border]="'1px solid var(--border-soft)'">
    <span
      class="text-sm"
      [style.color]="'var(--accent)'">
      ✦
    </span>
    <span
      class="text-[10px]
             uppercase
             tracking-[0.25em]
             font-bold"
      [style.color]="textColor()">
      Hecho artesanalmente,
      pensado para sorprender
    </span>
  </div>
</div>

  </div>
</section>

<!-- ===================== LOS MÁS PEDIDOS ===================== -->
<section
  class="relative py-24 sm:py-28 overflow-hidden"
  style="background: #F3D6DF;">

  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      class="absolute top-1/2 left-1/2
             -translate-x-1/2 -translate-y-1/2
             w-[700px] h-[500px]
             rounded-full blur-3xl opacity-[0.10]"
      [style.background]="'var(--accent)'">
    </div>
    <div
      class="absolute -top-32 -right-32
             w-96 h-96 rounded-full
             blur-3xl opacity-[0.08]"
      [style.background]="'var(--accent)'">
    </div>
    <div
      class="absolute -bottom-32 -left-32
             w-96 h-96 rounded-full
             blur-3xl opacity-[0.06]"
      [style.background]="'var(--accent)'">
    </div>
  </div>

  <div
    class="max-w-6xl mx-auto
           px-4 sm:px-6 lg:px-8
           relative z-10">

    <div class="text-center max-w-2xl mx-auto mb-14">
      <div class="flex items-center justify-center gap-4 mb-4">
        <span
          class="w-10 h-px"
          [style.background]="'var(--accent)'">
        </span>
        <span
          class="text-[12px] font-bold uppercase
                 tracking-[0.35em] font-serif"
          [style.color]="'var(--accent)'">
          Los favoritos de MOCHI
        </span>
        <span
          class="w-10 h-px"
          [style.background]="'var(--accent)'">
        </span>
      </div>

      <h2
        class="text-4xl sm:text-5xl
               font-serif italic leading-tight"
        [style.color]="headingColor()">
        Los Más
        <span [style.color]="'var(--accent)'">
          Pedidos
        </span>
      </h2>

      <p
        class="mt-4 text-[18px]
               leading-relaxed"
        [style.color]="textColor()">
        Una selección de los postres favoritos
        de nuestra comunidad.
      </p>
    </div>

    <div class="flex flex-col items-center gap-8">
      @for (prod of topProducts(); track prod.id; let i = $index) {

        <article
          class="group w-full max-w-5xl
                 rounded-[2rem]
                 overflow-hidden
                 transition-all duration-500
                 hover:-translate-y-1
                 hover:shadow-2xl
                 flex flex-col md:flex-row"
          [style.background]="cardBg()"
          [style.border]="'1px solid var(--border-soft)'">

          <div
            class="relative
                   w-full md:w-[48%]
                   h-[330px] md:h-[420px]
                   flex-shrink-0 overflow-hidden"
            [style.background]="imgBg()">

            <img
              [src]="prod.imagen_principal"
              [alt]="prod.nombre_espanol"
              class="w-full h-full
                     object-cover
                     transition-transform
                     duration-700
                     group-hover:scale-105">

            <div
              class="absolute inset-0
                     bg-gradient-to-t
                     from-black/40
                     via-transparent
                     to-transparent
                     pointer-events-none">
            </div>

            <div
              class="absolute top-5 left-5
                     w-11 h-11 rounded-full
                     backdrop-blur-md
                     flex items-center justify-center
                     text-sm font-serif font-bold"
              style="background: rgba(255,255,255,0.90);"
              [style.color]="'var(--accent)'">
              0{{ i + 1 }}
            </div>

            <div
              class="absolute top-5 right-5
                     px-4 py-2 rounded-full
                     backdrop-blur-md
                     text-[12px] font-bold uppercase
                     tracking-[0.18em]"
              style="background: rgba(255,255,255,0.90);"
              [style.color]="'var(--accent)'">
              {{ (prod.nombre_japones || '').split(' ')[0] }}
            </div>

            <div
              class="absolute bottom-5 left-5
                     flex items-center gap-2 text-white">
              <span
                class="material-icons text-base"
                style="color: var(--star);">
                star
              </span>
              <span class="text-[11px] font-bold">
                {{ prod.calificacion }}
              </span>
              <span class="text-[10px] opacity-80">
                · {{ prod.num_resenas }} reseñas
              </span>
            </div>
          </div>

          <div
            class="flex-1
                   p-8 sm:p-10
                   flex flex-col
                   justify-center">

            <span
              class="text-[12px]
                     font-bold uppercase
                     tracking-[0.25em]
                     font-serif"
              [style.color]="'var(--accent)'">
              {{ prod.nombre_japones }}
            </span>

            <h3
              class="text-3xl sm:text-4xl
                     font-serif italic
                     font-bold mt-2"
              [style.color]="headingColor()">
              {{ prod.nombre_espanol }}
            </h3>

            <p
              class="text-[16px] leading-relaxed
                     mt-4 max-w-lg"
              [style.color]="textColor()">
              Un postre preparado para disfrutar
              cada detalle, con una combinación
              de sabores que lo convierte en uno
              de los favoritos de MOCHI.
            </p>

            <div
              class="mt-7 pt-6 border-t
                     flex items-end justify-between gap-5"
              [style.border-color]="'var(--border-soft)'">

              <div>
                <span
                  class="block text-[9px]
                         uppercase tracking-[0.2em]
                         font-bold mb-1"
                  [style.color]="textColor()">
                  Desde
                </span>
                <span
                  class="text-2xl sm:text-3xl
                         font-serif italic font-bold"
                  [style.color]="headingColor()">
                  {{ '$' + prod.precio.toLocaleString('es-CO') }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  (click)="cartService.addToCart(prod, 1)"
                  class="w-12 h-12 rounded-full
                         flex items-center justify-center
                         transition-all duration-300
                         hover:scale-110 active:scale-95"
                  [style.background]="'var(--accent)'"
                  style="color:white;"
                  aria-label="Agregar al carrito">
                  <span class="material-icons text-base">
                    add_shopping_cart
                  </span>
                </button>

                <a
                  [routerLink]="['/productos', prod.id]"
                  class="px-6 py-3.5
                         rounded-full text-white
                         text-[10px] font-bold
                         uppercase tracking-[0.15em]
                         transition-all duration-300
                         hover:shadow-lg
                         hover:scale-[1.03]"
                  [style.background]="'var(--accent)'">
                  Ver postre
                </a>
              </div>
            </div>
          </div>
        </article>
      }
    </div>

    <div
      class="flex items-center justify-center
             gap-4 mt-14">
      <span
        class="w-8 h-px opacity-30"
        [style.background]="'var(--accent)'">
      </span>
      <span
        class="text-[12px] uppercase
               tracking-[0.3em] font-bold text-center"
        [style.color]="textColor()">
        Elegidos por quienes ya probaron MOCHI
      </span>
      <span
        class="w-8 h-px opacity-30"
        [style.background]="'var(--accent)'">
      </span>
    </div>
  </div>
</section>

<!-- ===================== CUSTOM CUP CTA ===================== -->
<section
  class="relative py-20 sm:py-22 overflow-hidden"
  style="background: linear-gradient(135deg, #590E2A 0%, #3A0A1C 55%, #210610 100%);">

  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      class="absolute left-1/2 top-1/2
             -translate-x-1/2 -translate-y-1/2
             w-[700px] h-[500px]
             rounded-full
             bg-[#D95578]/10
             blur-3xl">
    </div>
    <div
      class="absolute -top-40 -right-20
             w-[420px] h-[420px]
             rounded-full
             bg-[#D95578]/15
             blur-3xl">
    </div>
    <div
      class="absolute -bottom-40 -left-20
             w-[400px] h-[400px]
             rounded-full
             bg-[#FDF8F4]/5
             blur-3xl">
    </div>
    <div
      class="absolute top-16 right-[8%]
             w-40 h-40
             rounded-full
             border border-[#D95578]/20">
    </div>
    <div
      class="absolute top-24 right-[10%]
             w-28 h-28
             rounded-full
             border border-[#D95578]/10">
    </div>
    <div
      class="absolute bottom-16 left-[7%]
             w-24 h-24
             rounded-full
             border border-white/10">
    </div>
    <span class="absolute top-[20%] left-[12%] text-[#D95578]/30 text-2xl">
      ✦
    </span>
    <span class="absolute top-[35%] right-[15%] text-white/20 text-sm">
      ✧
    </span>
    <span class="absolute bottom-[20%] right-[12%] text-[#D95578]/30 text-xl">
      ✦
    </span>
  </div>

  <div
    class="max-w-6xl mx-auto
           px-4 sm:px-6 lg:px-8
           relative z-10">

    <div
      class="grid grid-cols-1 lg:grid-cols-2
             gap-12 lg:gap-20
             items-center">

      <!-- IZQUIERDA: VASO -->
      <div class="relative flex justify-center">
        <div
          class="absolute
                 w-72 h-72
                 rounded-full
                 bg-[#D95578]/20
                 blur-3xl">
        </div>

        <div
          class="relative w-full max-w-sm
                 rounded-[2.5rem]
                 p-8 sm:p-10
                 bg-white/[0.06]
                 backdrop-blur-xl
                 border border-white/10
                 shadow-2xl">

          <div class="flex justify-between items-center mb-8">
            <span
              class="text-[9px]
                     font-bold uppercase
                     tracking-[0.3em]
                     text-white/50">
              Tu creación
            </span>
            <span
              class="px-3 py-1
                     rounded-full
                     bg-[#D95578]/15
                     border border-[#D95578]/20
                     text-[#D95578]
                     text-[9px]
                     font-bold uppercase
                     tracking-wider">
              7 capas
            </span>
          </div>

          <div class="flex flex-col items-center">
            <div
              class="w-44 h-9
                     rounded-t-[1.2rem]
                     bg-[#8B4513]
                     flex items-center justify-center
                     text-[9px] font-bold text-white
                     shadow-lg">
              TOPPING
            </div>
            <div
              class="w-44 h-7
                     bg-[#FF6B6B]
                     flex items-center justify-center
                     text-[8px] font-bold text-white">
              RELLENO
            </div>
            <div
              class="w-44 h-7
                     bg-[#FFEAA7]
                     flex items-center justify-center
                     text-[8px] font-bold text-[#590E2A]">
              CREMA GANACHE
            </div>
            <div
              class="w-44 h-7
                     bg-[#D4A574]
                     flex items-center justify-center
                     text-[8px] font-bold text-white">
              BASE
            </div>
            <div
              class="w-44 h-7
                     bg-[#FF6B6B]
                     flex items-center justify-center
                     text-[8px] font-bold text-white">
              RELLENO
            </div>
            <div
              class="w-44 h-7
                     bg-[#FFEAA7]
                     flex items-center justify-center
                     text-[8px] font-bold text-[#590E2A]">
              CREMA GANACHE
            </div>
            <div
              class="w-44 h-8
                     rounded-b-[1.2rem]
                     bg-[#D4A574]
                     flex items-center justify-center
                     text-[8px] font-bold text-white
                     shadow-lg">
              BASE
            </div>
          </div>

          <div
            class="mt-8 pt-6
                   border-t border-white/10
                   flex items-center
                   justify-between">
            <div>
              <span
                class="block text-[8px]
                       uppercase tracking-widest
                       text-white/40">
                Desde
              </span>
              <span
                class="text-lg
                       font-serif italic
                       font-bold text-white">
                $18.000 COP
              </span>
            </div>
            <span class="text-2xl">
              ✨
            </span>
          </div>
        </div>
      </div>

      <!-- DERECHA: INFORMACIÓN -->
      <div class="text-center lg:text-left">

        <div
          class="inline-flex items-center gap-2
                 px-4 py-2
                 rounded-full
                 bg-[#D95578]/10
                 border border-[#D95578]/20
                 text-[#D95578]
                 text-[11px]
                 font-bold uppercase
                 tracking-[0.25em]">
          <span>✦</span>
          Nuevo en MOCHI
        </div>

        <h2
          class="mt-6
                 text-4xl sm:text-5xl lg:text-6xl
                 font-serif italic
                 font-bold
                 leading-[1.05]
                 text-[#FDF8F4]">
          Arma tu vaso.
          <span class="block text-[#D95578]">
            A tu manera.
          </span>
        </h2>

        <div
          class="flex items-center
                 justify-center lg:justify-start
                 gap-3 mt-6">
          <span
            class="w-12 h-px
                   bg-[#D95578]">
          </span>
          <span class="text-[#D95578] text-sm">
            ✦
          </span>
        </div>

        <p
          class="mt-6
                 text-sm sm:text-base
                 leading-relaxed
                 text-[#FDF8F4]/60
                 max-w-lg
                 mx-auto lg:mx-0">
          Elige cada una de las 7 capas y crea
          una combinación completamente tuya.
          Bases, crema ganache, rellenos y toppings
          preparados artesanalmente para ti.
        </p>

        <div
          class="grid grid-cols-3
                 gap-3
                 max-w-lg
                 mx-auto lg:mx-0
                 mt-8">

          <div
            class="rounded-2xl
                   px-3 py-4
                   bg-white/[0.05]
                   border border-white/10">
            <span class="block text-lg mb-1">
              🍓
            </span>
            <span
              class="text-[10px]
                     uppercase
                     tracking-wider
                     font-bold
                     text-white/50">
              Ingredientes
            </span>
          </div>

          <div
            class="rounded-2xl
                   px-3 py-4
                   bg-white/[0.05]
                   border border-white/10">
            <span class="block text-lg mb-1">
              🍫
            </span>
            <span
              class="text-[10px]
                     uppercase
                     tracking-wider
                     font-bold
                     text-white/50">
              7 Capas
            </span>
          </div>

          <div
            class="rounded-2xl
                   px-3 py-4
                   bg-white/[0.05]
                   border border-white/10">
            <span class="block text-lg mb-1">
              💗
            </span>
            <span
              class="text-[10px]
                     uppercase
                     tracking-wider
                     font-bold
                     text-white/50">
              A tu gusto
            </span>
          </div>
        </div>

        <div
          class="flex flex-col sm:flex-row
                 items-center
                 justify-center lg:justify-start
                 gap-4 mt-9">

          <a
            routerLink="/personalizar-vaso"
            class="group
                   w-full sm:w-auto
                   px-8 py-4
                   rounded-full
                   bg-[#D95578]
                   hover:bg-[#FF6080]
                   text-white
                   font-bold
                   text-xs
                   uppercase
                   tracking-widest
                   transition-all
                   duration-300
                   hover:scale-105
                   active:scale-95
                   flex items-center
                   justify-center gap-3
                   shadow-xl
                   shadow-[#D95578]/20">
            <span>
              Crear mi vaso
            </span>
            <span
              class="material-icons text-base
                     transition-transform
                     group-hover:translate-x-1">
              arrow_forward
            </span>
          </a>
        </div>

        <div
          class="mt-8
                 flex items-center
                 justify-center lg:justify-start
                 gap-3">
          <span class="text-[#D95578]">
            ✦
          </span>
          <span
            class="text-[11px]
                   uppercase
                   tracking-[0.25em]
                   font-bold
                   text-white/35">
            Hecho especialmente para ti
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===================== TESTIMONIOS ===================== -->
<section class="relative py-24 sm:py-28 overflow-hidden" [style.background]="sectionBg1()">

  <div class="absolute inset-0 pointer-events-none overflow-hidden">
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.08] blur-3xl" [style.background]="'var(--accent)'"></div>
    <div class="absolute -top-32 -left-32 w-[380px] h-[380px] rounded-full opacity-[0.07] blur-3xl" [style.background]="'var(--accent)'"></div>
    <div class="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-3xl" [style.background]="'var(--accent)'"></div>

    <div class="absolute top-20 right-[8%] w-36 h-36 rounded-full border opacity-10" [style.border-color]="'var(--accent)'"></div>
    <div class="absolute top-28 right-[10%] w-24 h-24 rounded-full border opacity-10" [style.border-color]="'var(--accent)'"></div>
    <div class="absolute bottom-20 left-[7%] w-28 h-28 rounded-full border opacity-10" [style.border-color]="'var(--accent)'"></div>

    <span class="absolute top-[20%] left-[12%] text-xl opacity-20" [style.color]="'var(--accent)'">✦</span>
    <span class="absolute top-[35%] right-[15%] text-sm opacity-20" [style.color]="'var(--accent)'">✧</span>
    <span class="absolute bottom-[20%] right-[12%] text-lg opacity-20" [style.color]="'var(--accent)'">✦</span>
  </div>

  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

    <div class="text-center max-w-2xl mx-auto mb-12">
      <div class="flex items-center justify-center gap-4 mb-5">
        <span class="w-10 h-px opacity-40" [style.background]="'var(--accent)'"></span>
        <span class="text-[10px] font-bold uppercase tracking-[0.35em] font-serif" [style.color]="'var(--accent)'">Lo que dicen nuestros clientes</span>
        <span class="w-10 h-px opacity-40" [style.background]="'var(--accent)'"></span>
      </div>
      <h2 class="text-4xl sm:text-5xl font-serif italic leading-tight" [style.color]="headingColor()">
        Experiencias que <span [style.color]="'var(--accent)'">hablan por sí solas.</span>
      </h2>
      <p class="mt-4 text-sm sm:text-base leading-relaxed" [style.color]="textColor()">
        Descubre lo que nuestros clientes piensan después de probar MOCHI.
      </p>
    </div>

    <div class="relative max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-xl" [style.background]="cardBg()" [style.border]="'1px solid var(--border-soft)'">

      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full" [style.background]="'var(--accent)'"></div>

      @for (review of reviews(); track review.id; let i = $index) {
        <div class="relative px-7 py-12 sm:px-14 sm:py-16 text-center" [class.hidden]="currentSlide() !== i">

          <div class="absolute top-7 left-8 sm:top-8 sm:left-12 text-7xl sm:text-8xl font-serif leading-none opacity-[0.08]" [style.color]="'var(--accent)'">"</div>

          <div class="flex items-center justify-center gap-1 mb-7">
            @for (star of [1,2,3,4,5]; track star) {
              <span class="material-icons text-xl" [style.color]="star <= review.calificacion ? 'var(--star)' : 'var(--border-soft)'">star</span>
            }
          </div>

          <p class="relative z-10 max-w-3xl mx-auto text-lg sm:text-xl font-serif italic leading-relaxed font-medium" [style.color]="headingColor()">
            "{{ review.comentario }}"
          </p>

          <div class="flex items-center justify-center gap-3 my-8">
            <span class="w-8 h-px opacity-20" [style.background]="'var(--accent)'"></span>
            <span class="text-xs" [style.color]="'var(--accent)'">✦</span>
            <span class="w-8 h-px opacity-20" [style.background]="'var(--accent)'"></span>
          </div>

          <div class="flex items-center justify-center gap-4">
            <div class="relative w-14 h-14 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md" [style.background]="'var(--accent)'">
              {{ (review.nombreCliente || 'C').charAt(0).toUpperCase() }}
              <div class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full flex items-center justify-center bg-white border" [style.border-color]="'var(--border-soft)'">
                <span class="material-icons text-[12px]" [style.color]="'var(--accent)'">check</span>
              </div>
            </div>
            <div class="text-left">
              <p class="text-sm font-bold" [style.color]="headingColor()">{{ review.nombreCliente }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="w-1.5 h-1.5 rounded-full" [style.background]="'var(--accent)'"></span>
                <p class="text-[10px] uppercase tracking-[0.15em] font-bold" [style.color]="textColor()">Cliente verificado</p>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="pb-8 flex items-center justify-center gap-4">
        <button type="button" (click)="currentSlide.set(currentSlide() === 0 ? reviews().length - 1 : currentSlide() - 1)"
          class="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110"
          [style.border-color]="'var(--border-soft)'" [style.color]="headingColor()">
          <span class="material-icons text-sm">west</span>
        </button>

        <div class="flex items-center gap-2">
          @for (review of reviews(); track review.id; let i = $index) {
            <button type="button" (click)="currentSlide.set(i)" class="transition-all duration-300 rounded-full"
              [class.w-7]="currentSlide() === i" [class.w-2]="currentSlide() !== i" [class.h-2]="true"
              [style.background]="currentSlide() === i ? 'var(--accent)' : 'var(--border-soft)'" aria-label="Ver testimonio"></button>
          }
        </div>

        <button type="button" (click)="currentSlide.set(currentSlide() === reviews().length - 1 ? 0 : currentSlide() + 1)"
          class="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110"
          [style.border-color]="'var(--border-soft)'" [style.color]="headingColor()">
          <span class="material-icons text-sm">east</span>
        </button>
      </div>
    </div>

    <div class="flex items-center justify-center gap-4 mt-10">
      <span class="w-8 h-px opacity-30" [style.background]="'var(--accent)'"></span>
      <span class="text-[12px] uppercase tracking-[0.3em] font-bold text-center" [style.color]="textColor()">Gracias por elegir MOCHI</span>
      <span class="w-8 h-px opacity-30" [style.background]="'var(--accent)'"></span>
    </div>
  </div>
</section>

<!-- ===================== FAQ ===================== -->

<section
  class="relative py-18 sm:py-18 overflow-hidden"
  [style.background]="sectionBg2()">

  <div class="absolute inset-0 pointer-events-none overflow-hidden">

<div
  class="absolute
         -top-40 -left-40
         w-[500px] h-[500px]
         rounded-full
         blur-3xl
         opacity-[0.11]"
  [style.background]="'var(--accent)'">
</div>

<div
  class="absolute
         -bottom-48 -right-40
         w-[500px] h-[500px]
         rounded-full
         blur-3xl
         opacity-[0.11]"
  [style.background]="'var(--accent)'">
</div>

<div
  class="absolute
         top-20 right-[5%]
         w-44 h-44
         rounded-full
         border opacity-[0.08]"
  [style.border-color]="'var(--accent)'">
</div>

<div
  class="absolute
         top-28 right-[7%]
         w-28 h-28
         rounded-full
         border opacity-[0.06]"
  [style.border-color]="'var(--accent)'">
</div>

<span
  class="absolute top-[25%] left-[8%]
         text-xl opacity-20"
  [style.color]="'var(--accent)'">
  ✦
</span>

<span
  class="absolute bottom-[20%] right-[10%]
         text-sm opacity-20"
  [style.color]="'var(--accent)'">
  ✧
</span>

  </div>

  <div
    class="max-w-7xl mx-auto
           px-4 sm:px-6 lg:px-8
           relative z-10">

<div
  class="grid
         lg:grid-cols-[0.8fr_1.5fr]
         gap-12 lg:gap-20
         items-start
         mb-14">

  <div class="lg:sticky lg:top-24">

    <div class="flex items-center gap-4 mb-5">
      <span
        class="w-10 h-px"
        [style.background]="'var(--accent)'">
      </span>
      <span
        class="text-[10px]
               uppercase
               tracking-[0.35em]
               font-bold
               font-serif"
        [style.color]="'var(--accent)'">
        Todo lo que necesitas saber
      </span>
    </div>

    <h2
      class="text-5xl sm:text-6xl
             font-serif italic
             leading-[0.95]"
      [style.color]="headingColor()">
      Preguntas
      <span
        class="block"
        [style.color]="'var(--accent)'">
        frecuentes.
      </span>
    </h2>

    <p
      class="mt-6
             max-w-sm
             text-sm
             leading-7"
      [style.color]="textColor()">
      Queremos que pedir tus postres favoritos
      sea tan sencillo como disfrutarlos.
      Aquí encontrarás respuestas a las preguntas
      que más nos hacen nuestros clientes.
    </p>

    <div
      class="mt-8
             inline-flex
             items-center gap-4
             px-5 py-4
             rounded-2xl"
      [style.background]="cardBg()"
      [style.border]="'1px solid var(--border-soft)'">

      <div
        class="w-10 h-10
               rounded-full
               flex items-center
               justify-center"
        [style.background]="'var(--accent)'"
        style="color:white;">
        <span class="material-icons text-base">
          chat_bubble_outline
        </span>
      </div>

      <div>
        <span
          class="block
                 text-[9px]
                 uppercase
                 tracking-[0.2em]
                 font-bold"
          [style.color]="textColor()">
          ¿Aún tienes dudas?
        </span>
        <span
          class="block mt-1
                 text-xs
                 font-bold"
          [style.color]="headingColor()">
          Estamos aquí para ayudarte.
        </span>
      </div>
    </div>
  </div>

  <div class="space-y-4">

    @for (faq of faqs; track faq.q; let i = $index) {

      <div
        class="group
               rounded-[1.75rem]
               overflow-hidden
               transition-all
               duration-500"
        [style.background]="cardBg()"
        [style.border]="'1px solid var(--border-soft)'"
        [class.shadow-xl]="openFaq() === i"
        [class.-translate-y-1]="openFaq() === i">

        <button
          (click)="toggleFaq(i)"
          class="w-full
                 flex items-center
                 gap-5
                 px-5 sm:px-7
                 py-5 sm:py-6
                 text-left">

          <span
            class="shrink-0
                   w-10 h-10
                   rounded-full
                   flex items-center
                   justify-center
                   text-[15px]
                   font-serif
                   font-bold
                   transition-all duration-300"
            [style.background]="openFaq() === i
              ? 'var(--accent)'
              : 'var(--soft-bg)'"
            [style.color]="openFaq() === i
              ? '#e5cde5'
              : 'var(--accent)'">
            {{ i + 1 < 10 ? '0' + (i + 1) : i + 1 }}
          </span>

          <span
            class="flex-1
                   text-sm sm:text-[15px]
                   font-bold
                   leading-6
                   transition-colors"
            [style.color]="headingColor()">
            {{ faq.q }}
          </span>

          <span
            class="shrink-0
                   w-9 h-9
                   rounded-full
                   flex items-center
                   justify-center
                   transition-all duration-300"
            [style.background]="openFaq() === i
              ? 'var(--accent)'
              : 'var(--soft-bg)'"
            [style.color]="openFaq() === i
              ? '#af4b4b'
              : 'var(--accent)'"
            [class.rotate-45]="openFaq() === i">
            <span class="material-icons text-base">
              add
            </span>
          </span>
        </button>

        <div
          class="faq-answer
                 px-5 sm:px-7"
          [class.open]="openFaq() === i">

          <div
            class="ml-[60px]
                   mr-4
                   pb-6
                   pt-0">

            <div
              class="w-8 h-px
                     mb-4"
              [style.background]="'var(--accent)'">
            </div>

            <p
              class="text-xs sm:text-sm
                     leading-7"
              [style.color]="textColor()">
              {{ faq.a }}
            </p>
          </div>
        </div>
      </div>
    }

    <div
      class="mt-7
             rounded-[1.75rem]
             px-6 py-5
             flex items-center
             justify-between
             gap-5"
      [style.background]="'var(--accent)'">

      <div>
        <span
          class="block
                 text-[9px]
                 uppercase
                 tracking-[0.25em]
                 font-bold
                 text-white/70">
          MOCHI
        </span>
        <p
          class="mt-1
                 text-sm
                 font-serif italic
                 text-white">
          Tu próximo postre favorito
          podría estar a un clic.
        </p>
      </div>

      <a
        routerLink="/productos"
        class="shrink-0
               w-11 h-11
               rounded-full
               bg-white
               flex items-center
               justify-center
               transition-all duration-300
               hover:scale-110"
        [style.color]="'var(--accent)'">
        <span class="material-icons text-base">
          arrow_forward
        </span>
      </a>
    </div>
  </div>
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
                  <a [routerLink]="'/blog'" [queryParams]="{post: post.slug}" class="uppercase tracking-wider text-[11px] hover:underline" [style.color]="'var(--accent)'">Leer Mas</a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class HomePageComponent implements OnInit {
  dataService = inject(MochiDataService);
  cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  config = this.dataService.visualConfig;
  topProducts = this.dataService.featuredProducts;
  blogPosts = this.dataService.blogPosts;
  reviews = this.dataService.reviews;

  currentSlide = signal(0);
  openFaq = signal<number | null>(null);

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

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect((onCleanup) => {
        const total = this.reviews().length;
        if (total > 1) {
          const timer = setInterval(() => {
            this.currentSlide.update(s => (s + 1) % this.reviews().length);
          }, 5000);
          onCleanup(() => clearInterval(timer));
        }
      });
    }
  }

  ngOnInit() {}

  toggleFaq(i: number) {
    this.openFaq.update(current => current === i ? null : i);
  }

  // ---- PALETTE-AWARE STYLES (Vino only) ----
  heroBg = signal('linear-gradient(135deg, #590E2A 0%, #3D0A1A 60%, #590E2A 100%)');
  heroTextColor = signal('#FDF8F4');
  heroSubtextColor = signal('rgba(253,248,244,0.8)');
  heroBtnText = signal('#FFFFFF');
  heroBtnText2 = signal('#FDF8F4');
  heroBtnBg2 = signal('rgba(255,255,255,0.1)');
  heroBtnBorder = signal('rgba(253,248,244,0.3)');
  heroBorderColor = signal('rgba(253,248,244,0.15)');
  heroBadgeBg = signal('rgba(217,85,120,0.25)');
  heroBadgeText = signal('#FDF8F4');
  heroPatternOpacity = signal('1');
  heroCircleColor = signal('rgba(217,85,120,0.15)');
  heroCircleColor2 = signal('rgba(253,248,244,0.06)');
  heroWaveFill = signal('#FDF8F4');

  headingColor = signal('#590E2A');
  textColor = signal('#8C6D51');
  sectionBg1 = signal('#FDF8F4');
  sectionBg2 = signal('#FFFCF8');
  cardBg = signal('#FFFCF8');
  imgBg = signal('#FDF8F4');
  pillarBg = signal('rgba(217,85,120,0.1)');
}
