import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `

<!-- ========================================================= -->
<!-- PAGE -->
<!-- ========================================================= -->

<main class="min-h-screen bg-[#FDF8F4] text-[#590E2A] overflow-hidden">


  <!-- ======================================================= -->
  <!-- HERO -->
  <!-- ======================================================= -->

  <section class="relative min-h-[680px] lg:min-h-[760px] flex items-center overflow-hidden">

    <!-- Imagen -->
    <div
      class="absolute inset-0 bg-cover bg-center scale-105"
      style="
        background-image:
          linear-gradient(
            50deg,
            rgba(59,10,28,.96) 0%,
            rgba(89,14,42,.84) 42%,
            rgba(89,14,42,.25) 100%
          ),
          url('https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1800&q=85');
      ">
    </div>


    <!-- Mancha decorativa -->
    <div
      class="absolute -right-20 -top-20
             w-[300px] h-[300px]
             rounded-full
             border border-white/10">
    </div>

    <div
      class="absolute -right-20 -top-20
             w-[400px] h-[400px]
             rounded-full
             border border-white/10">
    </div>


    <!-- Contenido -->
    <div
      class="max-w-7xl mx-auto w-full
             px-5 sm:px-8 lg:px-12
             relative z-10">

      <div class="max-w-3xl py-28">


        <!-- Etiqueta -->
        <div class="flex items-center gap-4 mb-7">

          <span class="w-12 h-px bg-[#D95578]"></span>

          <span
            class="text-[10px]
                   uppercase
                   tracking-[0.4em]
                   font-bold
                   text-[#F6C6D2]">

            Nuestra historia

          </span>

        </div>


        <!-- Título -->
        <h1
          class="text-5xl sm:text-6xl lg:text-8xl
                 font-serif italic
                 text-white
                 leading-[.9]">

          De Japón

          <span class="block text-[#F3A5BA]">
            a La Dorada.
          </span>

        </h1>


        <!-- Texto -->
        <p
          class="mt-8
                 max-w-2xl
                 text-sm sm:text-base
                 leading-7
                 text-white/80">

          Mochi. nació del amor por la cultura nipona y de la
          visión de crear algo diferente: una propuesta de
          repostería artesanal donde el sabor, la estética y
          la innovación se encuentran en cada detalle.

        </p>


        <!-- CTA -->
        <div class="mt-9 flex flex-wrap gap-3">

          <a
            routerLink="/productos"
            class="group inline-flex items-center gap-3
                   px-7 py-4
                   rounded-full
                   bg-[#FDF8F4]
                   text-[#590E2A]
                   text-[10px]
                   uppercase
                   tracking-[0.2em]
                   font-bold
                   transition-all duration-300
                   hover:-translate-y-1
                   hover:shadow-2xl">

            Descubre nuestros postres

            <span
              class="material-icons text-sm
                     transition-transform
                     group-hover:translate-x-1">

              arrow_forward

            </span>

          </a>

        </div>

      </div>


      <!-- Sello -->
      <div
        class="absolute
               right-8 bottom-12
               hidden lg:flex
               w-32 h-32
               rounded-full
               border border-white/20
               items-center justify-center
               text-center
               rotate-[-10deg]">

        <div>

          <span class="block text-[8px] tracking-[0.3em] uppercase text-white/60">
            Artesanal
          </span>

          <span class="block font-serif italic text-2xl text-white">
            MOCHI
          </span>

          <span class="block text-[8px] tracking-[0.25em] uppercase text-[#F3A5BA]">
            La Dorada
          </span>

        </div>

      </div>

    </div>


    <!-- Indicador inferior -->
    <div
      class="absolute bottom-8 left-1/2
             -translate-x-1/2
             text-white/50
             flex flex-col
             items-center gap-2">

      <span class="text-[8px] uppercase tracking-[0.3em]">
        Conócenos
      </span>

      <span class="material-icons text-sm animate-bounce">
        south
      </span>

    </div>

  </section>



  <!-- ======================================================= -->
  <!-- MANIFIESTO -->
  <!-- ======================================================= -->

  <section class="relative py-18 sm:py-22 bg-[#FDF8F4]">

    <!-- Decoración -->
    <div
      class="absolute left-[-150px] top-20
             w-80 h-80
             rounded-full
             bg-[#D95578]/10
             blur-3xl">
    </div>


    <div
      class="max-w-7xl mx-auto
             px-5 sm:px-8 lg:px-12
             relative z-10">


      <div class="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">


        <!-- Número -->
        <div class="lg:col-span-3">

          <span
            class="text-[110px]
                   leading-none
                   font-serif italic
                   text-[#590E2A]/10">

            01

          </span>

          <div class="flex items-center gap-3">

            <span class="w-8 h-px bg-[#D95578]"></span>

            <span
              class="text-[9px]
                     uppercase
                     tracking-[0.3em]
                     font-bold
                     text-[#590E2A]/50">

              Nuestro origen

            </span>

          </div>

        </div>


        <!-- Texto -->
        <div class="lg:col-span-9">

          <h2
            class="text-4xl sm:text-5xl lg:text-6xl
                   font-serif italic
                   leading-tight
                   text-[#590E2A]">

            No queríamos crear
            <span class="text-[#D95578]">
              otro postre.
            </span>

          </h2>


          <p
            class="mt-7
                   max-w-3xl
                   text-sm sm:text-base
                   leading-8
                   text-[#590E2A]/70">

            Queríamos crear una experiencia. Una que comenzara
            desde la presentación y terminara en ese momento
            en que pruebas el primer bocado y descubres algo
            completamente diferente.

          </p>


          <p
            class="mt-4
                   max-w-3xl
                   text-sm sm:text-base
                   leading-8
                   text-[#590E2A]/70">

            Por eso MOCHI une inspiración japonesa, ingredientes
            seleccionados, repostería artesanal y una identidad
            visual cuidadosamente diseñada para convertir algo
            cotidiano en un pequeño momento especial.

          </p>


          <!-- Frase -->
          <div
            class="mt-9
                   pl-6
                   border-l-2
                   border-[#D95578]">

            <p
              class="font-serif italic
                     text-xl sm:text-2xl
                     text-[#590E2A]">

              "Los pequeños detalles son los que
              convierten un postre en un recuerdo."

            </p>

          </div>

        </div>

      </div>

    </div>

  </section>



  <!-- ======================================================= -->
  <!-- FUNDADORES -->
  <!-- ======================================================= -->

  <section
    class="relative py-18 sm:py-22
           bg-[#590E2A]
           text-[#FDF8F4]
           overflow-hidden">


    <!-- Decoración -->
    <div
      class="absolute -right-40 -top-40
             w-[500px] h-[500px]
             rounded-full
             border border-white/5">
    </div>
    <div
      class="absolute -left-40 bottom-[-250px]
             w-[500px] h-[500px]
             rounded-full
             border border-white/5">
    </div>


    <div
      class="max-w-7xl mx-auto
             px-5 sm:px-8 lg:px-12
             relative z-10">


      <!-- Encabezado -->
      <div
        class="flex flex-col
               lg:flex-row
               lg:items-end
               justify-between
               gap-8 mb-16">

        <div>

          <div class="flex items-center gap-4 mb-5">

            <span class="w-10 h-px bg-[#D95578]"></span>

            <span
              class="text-[10px]
                     uppercase
                     tracking-[0.35em]
                     font-bold
                     text-[#F3A5BA]">

              Las personas detrás de MOCHI

            </span>

          </div>


          <h2
            class="text-4xl sm:text-5xl lg:text-6xl
                   font-serif italic
                   leading-tight">

            Tres personas.
            <span class="block text-[#D95578]">
              Una misma visión.
            </span>

          </h2>

        </div>


        <p
          class="max-w-md
                 text-sm leading-7
                 text-white/60">

          Tres mentes apasionadas por el detalle,
          la repostería artesanal, la tecnología
          y la creación de experiencias memorables.

        </p>

      </div>


      <!-- Personas -->
      <div
        class="grid
               grid-cols-1
               md:grid-cols-3
               gap-6">


        <!-- MICHEL -->
        <article
          class="group
                 relative
                 min-h-[380px]
                 rounded-[2.5rem]
                 border border-white/10
                 bg-white/[0.04]
                 p-8
                 flex flex-col
                 justify-between
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:bg-white/[0.08]">

          <div>

            <span
              class="text-[70px]
                     leading-none
                     font-serif italic
                     text-white/10">

              M

            </span>

            <div
              class="mt-[-20px]
                     w-16 h-16
                     rounded-full
                     bg-[#D95578]
                     text-[#590E2A]
                     flex items-center
                     justify-center
                     font-serif italic
                     text-2xl
                     font-bold">

              M

            </div>

          </div>


          <div>

            <h3
              class="font-serif italic
                     text-3xl">

              Michel

            </h3>

            <span
              class="inline-block
                     mt-2
                     text-[9px]
                     uppercase
                     tracking-[0.2em]
                     text-[#F3A5BA]">

              Sommelier de Té & Diseño

            </span>

            <p
              class="mt-5
                     text-xs
                     leading-6
                     text-white/60">

              Encargado del maridaje sensorial del
              Matcha Uji ceremonial y de la estética
              visual japonesa de la marca.

            </p>

          </div>

        </article>


        <!-- FELIPE -->
        <article
          class="group
                 relative
                 min-h-[380px]
                 rounded-[2.5rem]
                 border border-white/10
                 bg-white/[0.04]
                 p-8
                 flex flex-col
                 justify-between
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:bg-white/[0.08]">

          <div>

            <span
              class="text-[70px]
                     leading-none
                     font-serif italic
                     text-white/10">

              F

            </span>

            <div
              class="mt-[-20px]
                     w-16 h-16
                     rounded-full
                     bg-[#D95578]
                     text-[#590E2A]
                     flex items-center
                     justify-center
                     font-serif italic
                     text-2xl
                     font-bold">

              F

            </div>

          </div>


          <div>

            <h3
              class="font-serif italic
                     text-3xl">

              Felipe

            </h3>

            <span
              class="inline-block
                     mt-2
                     text-[9px]
                     uppercase
                     tracking-[0.2em]
                     text-[#F3A5BA]">

              Director de Producto & Ecommerce

            </span>

            <p
              class="mt-5
                     text-xs
                     leading-6
                     text-white/60">

              Líder de la experiencia digital,
              la plataforma web y los estándares
              de servicio al cliente.

            </p>

          </div>

        </article>


        <!-- NEIDER -->
        <article
          class="group
                 relative
                 min-h-[380px]
                 rounded-[2.5rem]
                 border border-white/10
                 bg-white/[0.04]
                 p-8
                 flex flex-col
                 justify-between
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:bg-white/[0.08]">

          <div>

            <span
              class="text-[70px]
                     leading-none
                     font-serif italic
                     text-white/10">

              N

            </span>

            <div
              class="mt-[-20px]
                     w-16 h-16
                     rounded-full
                     bg-[#D95578]
                     text-[#590E2A]
                     flex items-center
                     justify-center
                     font-serif italic
                     text-2xl
                     font-bold">

              N

            </div>

          </div>


          <div>

            <h3
              class="font-serif italic
                     text-3xl">

              Neider

            </h3>

            <span
              class="inline-block
                     mt-2
                     text-[9px]
                     uppercase
                     tracking-[0.2em]
                     text-[#F3A5BA]">

              Master Chef Repostero

            </span>

            <p
              class="mt-5
                     text-xs
                     leading-6
                     text-white/60">

              Maestro detrás de las temperaturas
              exactas de cocción de la masa Mochiko
              y la frescura diaria.

            </p>

          </div>

        </article>

      </div>

    </div>

  </section>



  <!-- ======================================================= -->
  <!-- MISIÓN / VISIÓN -->
  <!-- ======================================================= -->

  <section class="relative py-18 sm:py-22 bg-[#FDF8F4]">

    <div
      class="max-w-7xl mx-auto
             px-5 sm:px-8 lg:px-12">


      <div class="text-center max-w-2xl mx-auto mb-16">

        <span
          class="text-[10px]
                 uppercase
                 tracking-[0.35em]
                 font-bold
                 text-[#D95578]">

          Lo que nos mueve

        </span>

        <h2
          class="mt-4
                 text-4xl sm:text-5xl
                 font-serif italic
                 text-[#590E2A]">

          Una visión que va
          <span class="text-[#D95578]">
            más allá del postre.
          </span>

        </h2>

      </div>


      <div
        class="grid
               grid-cols-1
               lg:grid-cols-2
               gap-6">


        <!-- MISIÓN -->
        <article
          class="relative
                 min-h-[360px]
                 rounded-[2.5rem]
                 bg-[#E8A0B5]
                 p-9 sm:p-12
                 overflow-hidden
                 group">

          <span
            class="absolute
                   right-8 top-5
                   text-[120px]
                   leading-none
                   font-serif italic
                   text-[#590E2A]/10">

            M

          </span>


          <div class="relative z-10">

            <span class="text-3xl">
              🎯
            </span>

            <span
              class="block mt-8
                     text-[9px]
                     uppercase
                     tracking-[0.3em]
                     font-bold
                     text-[#590E2A]/60">

              Nuestra misión

            </span>

            <h3
              class="mt-2
                     text-3xl
                     font-serif italic
                     text-[#590E2A]">

              Crear momentos especiales.

            </h3>

            <p
              class="mt-6
                     text-sm
                     leading-7
                     text-[#590E2A]/80">

              Ofrecer postres japoneses artesanales
              de la más alta calidad con un diseño
              elegante, conectando a la comunidad de
              La Dorada con la auténtica gastronomía
              oriental a través de una experiencia
              digital ágil e inolvidable.

            </p>

          </div>

        </article>


        <!-- VISIÓN -->
        <article
          class="relative
                 min-h-[360px]
                 rounded-[2.5rem]
                 bg-[#590E2A]
                 p-9 sm:p-12
                 overflow-hidden
                 group">

          <span
            class="absolute
                   right-8 top-5
                   text-[120px]
                   leading-none
                   font-serif italic
                   text-white/5">

            V

          </span>


          <div class="relative z-10">

            <span class="text-3xl">
              ✦
            </span>

            <span
              class="block mt-8
                     text-[9px]
                     uppercase
                     tracking-[0.3em]
                     font-bold
                     text-[#F3A5BA]/70">

              Nuestra visión

            </span>

            <h3
              class="mt-2
                     text-3xl
                     font-serif italic
                     text-white">

              Llevar MOCHI más lejos.

            </h3>

            <p
              class="mt-6
                     text-sm
                     leading-7
                     text-white/65">

              Ser reconocidos regional y nacionalmente
              como la marca líder en postres japoneses
              de autor, destacándonos por nuestra
              innovación tecnológica, frescura
              insuperable y responsabilidad social.

            </p>

          </div>

        </article>

      </div>

    </div>

  </section>



  <!-- ======================================================= -->
  <!-- PROCESO -->
  <!-- ======================================================= -->

  <section
    class="relative py-17 sm:py-21
           bg-[#F4E8E1]
           overflow-hidden">


    <div
      class="max-w-7xl mx-auto
             px-5 sm:px-6 lg:px-12">


      <!-- Encabezado -->
      <div
        class="max-w-3xl mb-16">

        <div class="flex items-center gap-4 mb-5">

          <span class="w-10 h-px bg-[#D95578]"></span>

          <span
            class="text-[10px]
                   uppercase
                   tracking-[0.35em]
                   font-bold
                   text-[#590E2A]/60">

            Técnica artesanal

          </span>

        </div>


        <h2
          class="text-4xl sm:text-5xl lg:text-6xl
                 font-serif italic
                 text-[#590E2A]">

          Cada postre tiene
          <span class="text-[#D95578]">
            su propio ritual.
          </span>

        </h2>


        <p
          class="mt-6
                 max-w-2xl
                 text-sm leading-7
                 text-[#590E2A]/65">

          Nuestro proceso combina técnica, paciencia
          y cuidado para conseguir la textura, frescura
          y presentación que buscamos en cada creación.

        </p>

      </div>


      <!-- Pasos -->
      <div
        class="grid
               grid-cols-1
               md:grid-cols-2
               lg:grid-cols-4
               gap-5">


        <!-- 1 -->
        <article
          class="relative
                 rounded-[2rem]
                 bg-[#FDF8F4]
                 p-7
                 border border-[#E8D8D0]
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:shadow-xl">

          <span
            class="text-6xl
                   font-serif italic
                   text-[#590E2A]/10">

            01

          </span>

          <div
            class="w-11 h-11
                   rounded-full
                   bg-[#590E2A]
                   text-white
                   flex items-center
                   justify-center
                   font-bold text-xs
                   mt-3">

            1

          </div>

          <h3
            class="mt-6
                   text-xl
                   font-serif italic
                   text-[#590E2A]">

            Selección Mochiko

          </h3>

          <p
            class="mt-3
                   text-xs
                   leading-6
                   text-[#590E2A]/65">

            Mezcla de harina de arroz glutinoso
            especial para conseguir la elasticidad
            perfecta.

          </p>

        </article>


        <!-- 2 -->
        <article
          class="relative
                 rounded-[2rem]
                 bg-[#FDF8F4]
                 p-7
                 border border-[#E8D8D0]
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:shadow-xl">

          <span
            class="text-6xl
                   font-serif italic
                   text-[#590E2A]/10">

            02

          </span>

          <div
            class="w-11 h-11
                   rounded-full
                   bg-[#590E2A]
                   text-white
                   flex items-center
                   justify-center
                   font-bold text-xs
                   mt-3">

            2

          </div>

          <h3
            class="mt-6
                   text-xl
                   font-serif italic
                   text-[#590E2A]">

            Cocción al Vapor

          </h3>

          <p
            class="mt-3
                   text-xs
                   leading-6
                   text-[#590E2A]/65">

            Vaporización lenta en bambú para conservar
            la humedad y lograr una textura delicada.

          </p>

        </article>


        <!-- 3 -->
        <article
          class="relative
                 rounded-[2rem]
                 bg-[#FDF8F4]
                 p-7
                 border border-[#E8D8D0]
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:shadow-xl">

          <span
            class="text-6xl
                   font-serif italic
                   text-[#590E2A]/10">

            03

          </span>

          <div
            class="w-11 h-11
                   rounded-full
                   bg-[#590E2A]
                   text-white
                   flex items-center
                   justify-center
                   font-bold text-xs
                   mt-3">

            3

          </div>

          <h3
            class="mt-6
                   text-xl
                   font-serif italic
                   text-[#590E2A]">

            Relleno Fresco

          </h3>

          <p
            class="mt-3
                   text-xs
                   leading-6
                   text-[#590E2A]/65">

            Envoltorio delicado a mano con frutas
            naturales seleccionadas y preparaciones
            artesanales.

          </p>

        </article>


        <!-- 4 -->
        <article
          class="relative
                 rounded-[2rem]
                 bg-[#FDF8F4]
                 p-7
                 border border-[#E8D8D0]
                 transition-all duration-500
                 hover:-translate-y-2
                 hover:shadow-xl">

          <span
            class="text-6xl
                   font-serif italic
                   text-[#590E2A]/10">

            04

          </span>

          <div
            class="w-11 h-11
                   rounded-full
                   bg-[#D95578]
                   text-[#590E2A]
                   flex items-center
                   justify-center
                   font-bold text-xs
                   mt-3">

            4

          </div>

          <h3
            class="mt-6
                   text-xl
                   font-serif italic
                   text-[#590E2A]">

            Presentación & Envío

          </h3>

          <p
            class="mt-3
                   text-xs
                   leading-6
                   text-[#590E2A]/65">

            Cada pedido se prepara cuidadosamente
            para conservar su frescura hasta llegar
            a tus manos.

          </p>

        </article>

      </div>

    </div>

  </section>



  <!-- ======================================================= -->
  <!-- SUCURSAL -->
  <!-- ======================================================= -->

  <section
    class="relative py-18 sm:py-22
           bg-[#FDF8F4]">


    <div
      class="max-w-7xl mx-auto
             px-5 sm:px-8 lg:px-12">


      <div
        class="grid
               grid-cols-1
               lg:grid-cols-12
               gap-8
               items-stretch">


        <!-- Información -->
        <div
          class="lg:col-span-5
                 rounded-[2.5rem]
                 bg-[#590E2A]
                 p-8 sm:p-12
                 text-white
                 flex flex-col
                 justify-between">


          <div>

            <div class="flex items-center gap-4 mb-6">

              <span class="w-10 h-px bg-[#D95578]"></span>

              <span
                class="text-[9px]
                       uppercase
                       tracking-[0.3em]
                       font-bold
                       text-[#F3A5BA]">

                Visítanos

              </span>

            </div>


            <h2
              class="text-4xl sm:text-5xl
                     font-serif italic
                     leading-tight">

              Nuestra casa
              <span class="block text-[#D95578]">
                en La Dorada.
              </span>

            </h2>


            <p
              class="mt-6
                     text-sm
                     leading-7
                     text-white/65">

              Ven a disfrutar de nuestro espacio,
              ambientado con música suave, aroma
              a té verde y la atención cálida
              de nuestro equipo.

            </p>


            <!-- Datos -->
            <div
              class="mt-9
                     space-y-5">


              <div class="flex items-start gap-4">

                <span
                  class="material-icons
                         text-[#D95578]">

                  location_on

                </span>

                <div>

                  <span
                    class="block text-[9px]
                           uppercase
                           tracking-[0.2em]
                           text-white/40">

                    Dirección

                  </span>

                  <span
                    class="text-xs
                           font-bold">

                    {{ config().direccionLocal }}

                  </span>

                </div>

              </div>


              <div class="flex items-start gap-4">

                <span
                  class="material-icons
                         text-[#D95578]">

                  schedule

                </span>

                <div>

                  <span
                    class="block text-[9px]
                           uppercase
                           tracking-[0.2em]
                           text-white/40">

                    Horario

                  </span>

                  <span class="text-xs">

                    {{ config().horarioAtencion }}

                  </span>

                </div>

              </div>


              <div class="flex items-start gap-4">

                <span
                  class="material-icons
                         text-[#D95578]">

                  phone

                </span>

                <div>

                  <span
                    class="block text-[9px]
                           uppercase
                           tracking-[0.2em]
                           text-white/40">

                    WhatsApp

                  </span>

                  <span class="text-xs">

                    +57 300 123 4567

                  </span>

                </div>

              </div>

            </div>

          </div>


          <a
            routerLink="/contacto"
            class="group
                   mt-10
                   inline-flex
                   w-fit
                   items-center gap-3
                   px-6 py-3.5
                   rounded-full
                   bg-[#FDF8F4]
                   text-[#590E2A]
                   text-[9px]
                   uppercase
                   tracking-[0.2em]
                   font-bold
                   transition-all duration-300
                   hover:-translate-y-1
                   hover:shadow-xl">

            Ver mapa & contacto

            <span
              class="material-icons text-sm
                     transition-transform
                     group-hover:translate-x-1">

              arrow_forward

            </span>

          </a>

        </div>


        <!-- MAPA -->
        <div
          class="lg:col-span-7
                 min-h-[200px]
                 rounded-[2.5rem]
                 overflow-hidden
                 border border-[#E8D8D0]
                 shadow-sm">

          <iframe
            [src]="mapUrl()"
            width="100%"
            height="100%"
            style="border:0; min-height:220px;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>

        </div>

      </div>

    </div>

  </section>



  <!-- ======================================================= -->
  <!-- CIERRE -->
  <!-- ======================================================= -->

  <section
    class="relative
           py-18 sm:py-22
           bg-[#D95578]
           text-[#590E2A]
           overflow-hidden">


    <!-- Círculos -->
    <div
      class="absolute
             -right-40 -top-40
             w-[400px] h-[400px]
             rounded-full
             border border-[#590E2A]/10">
    </div>

    <div
      class="absolute
             -left-30 -bottom-30
             w-[400px] h-[400px]
             rounded-full
             border border-[#590E2A]/10">
    </div>


    <div
      class="relative z-10
             max-w-3xl
             mx-auto
             px-5
             text-center">


      <span
        class="text-3xl">

        ✦

      </span>


      <h2
        class="mt-6
               text-4xl sm:text-5xl lg:text-6xl
               font-serif italic
               leading-tight">

        No hacemos simplemente
        <span class="block">
          postres.
        </span>

      </h2>


      <p
        class="mt-6
               text-sm sm:text-base
               leading-7
               text-[#590E2A]/70">

        Creamos pequeños momentos para disfrutar,
        compartir y recordar.

      </p>


      <a
        routerLink="/productos"
        class="inline-flex
               items-center gap-3
               mt-9
               px-8 py-4
               rounded-full
               bg-[#590E2A]
               text-[#FDF8F4]
               text-[10px]
               uppercase
               tracking-[0.2em]
               font-bold
               transition-all duration-300
               hover:-translate-y-1
               hover:shadow-xl">

        Conoce nuestros postres

        <span class="material-icons text-sm">
          arrow_forward
        </span>

      </a>

    </div>

  </section>


</main>


`
})
export class AboutPageComponent {

  dataService = inject(MochiDataService);

  private sanitizer = inject(DomSanitizer);

  config = this.dataService.visualConfig;

  mapUrl = computed<SafeResourceUrl>(() => {
    const addr = encodeURIComponent(
      this.config().direccionLocal
    );
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${addr}&output=embed`
    );
  });

}
