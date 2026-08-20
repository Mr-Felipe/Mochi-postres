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
    <div class="bg-[#FAF7F2] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <!-- Hero Section -->
        <div class="relative rounded-[40px] overflow-hidden bg-[#4A3F35] text-[#FAF7F2] p-8 sm:p-16 shadow-xs">
          <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80');"></div>
          <div class="relative z-10 max-w-2xl space-y-4">
            <span class="px-4 py-1.5 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-xs font-bold font-serif uppercase tracking-widest border border-[#EBE3D5]">
              Nuestra Historia
            </span>
            <h1 class="text-4xl sm:text-6xl font-serif italic text-white leading-tight">
              Un Viaje de Sabor de Kioto a La Dorada
            </h1>
            <p class="text-[#FAF7F2]/90 text-sm sm:text-base leading-relaxed font-sans">
              Mochi. nació del amor por la cultura nipona y la visión de brindar una propuesta gastronómica innovadora, saludable y sofisticada en el departamento de Caldas.
            </p>
          </div>
        </div>

        <!-- Quiénes Somos & Equipo Fundador -->
        <div class="bg-white rounded-[40px] border border-[#EBE3D5] p-8 sm:p-12 shadow-xs">
          <div class="max-w-3xl mb-12 space-y-2">
            <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">Equipo Creativo</span>
            <h2 class="text-3xl font-serif italic text-[#4A3F35]">Conoce a los Fundadores</h2>
            <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider leading-relaxed">
              Tres mentes apasionadas unidas por el detalle, la repostería artesanal y la tecnología.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-8 rounded-[32px] bg-[#FAF7F2] border border-[#EBE3D5] text-center space-y-3">
              <div class="w-20 h-20 rounded-full bg-[#FFD6E0] text-[#4A3F35] flex items-center justify-center text-2xl font-serif italic mx-auto border border-[#EBE3D5]">
                M
              </div>
              <h3 class="font-serif italic text-[#4A3F35] text-xl">Michel</h3>
              <span class="px-3.5 py-1 rounded-full bg-white text-[#4A3F35] text-[10px] font-bold uppercase tracking-widest border border-[#EBE3D5] block w-fit mx-auto">Sommelier de Té & Diseño</span>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">
                Encargado del maridaje sensorial del Matcha Uji ceremonial y de la estética visual japonesa de la marca.
              </p>
            </div>

            <div class="p-8 rounded-[32px] bg-[#FAF7F2] border border-[#EBE3D5] text-center space-y-3">
              <div class="w-20 h-20 rounded-full bg-[#FFD6E0] text-[#4A3F35] flex items-center justify-center text-2xl font-serif italic mx-auto border border-[#EBE3D5]">
                F
              </div>
              <h3 class="font-serif italic text-[#4A3F35] text-xl">Felipe</h3>
              <span class="px-3.5 py-1 rounded-full bg-white text-[#4A3F35] text-[10px] font-bold uppercase tracking-widest border border-[#EBE3D5] block w-fit mx-auto">Director de Producto & Ecommerce</span>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">
                Líder de la experiencia digital, la plataforma web y los estándares de servicio al cliente.
              </p>
            </div>

            <div class="p-8 rounded-[32px] bg-[#FAF7F2] border border-[#EBE3D5] text-center space-y-3">
              <div class="w-20 h-20 rounded-full bg-[#FFD6E0] text-[#4A3F35] flex items-center justify-center text-2xl font-serif italic mx-auto border border-[#EBE3D5]">
                N
              </div>
              <h3 class="font-serif italic text-[#4A3F35] text-xl">Neider</h3>
              <span class="px-3.5 py-1 rounded-full bg-white text-[#4A3F35] text-[10px] font-bold uppercase tracking-widest border border-[#EBE3D5] block w-fit mx-auto">Master Chef Repostero</span>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">
                Maestro detrás de las temperaturas exactas de cocción de la masa Mochiko y la frescura diaria.
              </p>
            </div>
          </div>
        </div>

        <!-- Misión, Visión & Valores -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="p-8 sm:p-10 rounded-[40px] bg-[#FFD6E0] text-[#4A3F35] border border-[#EBE3D5] space-y-3">
            <span class="text-3xl">🎯</span>
            <h2 class="text-2xl font-serif italic">Nuestra Misión</h2>
            <p class="text-[#4A3F35]/90 text-sm leading-relaxed">
              Ofrecer postres japoneses artesanales de la más alta calidad con un diseño elegante, conectando a la comunidad de La Dorada con la auténtica gastronomía oriental a través de una experiencia digital ágil e inolvidable.
            </p>
          </div>

          <div class="p-8 sm:p-10 rounded-[40px] bg-[#4A3F35] text-[#FAF7F2] space-y-3">
            <span class="text-3xl">🚀</span>
            <h2 class="text-2xl font-serif italic">Nuestra Visión</h2>
            <p class="text-[#FAF7F2]/90 text-sm leading-relaxed">
              Ser reconocidos regional y nacionalmente como la marca líder en postres japoneses de autor, destacándonos por nuestra innovación tecnológica, frescura insuperable y responsabilidad social.
            </p>
          </div>
        </div>

        <!-- Proceso Artesanal Paso a Paso -->
        <div class="bg-white rounded-[40px] border border-[#EBE3D5] p-8 sm:p-12 shadow-xs space-y-8">
          <div class="text-center max-w-xl mx-auto space-y-2">
            <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">Técnica Ancestral</span>
            <h2 class="text-3xl font-serif italic text-[#4A3F35]">Cómo Hacemos Nuestros Postres</h2>
            <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider">El proceso de preparación diaria en nuestra cocina en La Dorada</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EBE3D5] space-y-3 text-center">
              <span class="w-10 h-10 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-sm flex items-center justify-center mx-auto">1</span>
              <h3 class="font-serif italic text-[#4A3F35] text-base">Selección Mochiko</h3>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">Mezcla de harina de arroz glutinoso especial importado para la elasticidad perfecta.</p>
            </div>

            <div class="p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EBE3D5] space-y-3 text-center">
              <span class="w-10 h-10 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-sm flex items-center justify-center mx-auto">2</span>
              <h3 class="font-serif italic text-[#4A3F35] text-base">Cocción al Vapor</h3>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">Vaporización lenta en bambú para conservar la humedad sin aditivos artificiales.</p>
            </div>

            <div class="p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EBE3D5] space-y-3 text-center">
              <span class="w-10 h-10 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-sm flex items-center justify-center mx-auto">3</span>
              <h3 class="font-serif italic text-[#4A3F35] text-base">Relleno Fresco</h3>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">Envoltorio delicado a mano de frutas naturales seleccionadas y pastas artesanales.</p>
            </div>

            <div class="p-6 rounded-[28px] bg-[#FAF7F2] border border-[#EBE3D5] space-y-3 text-center">
              <span class="w-10 h-10 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-sm flex items-center justify-center mx-auto">4</span>
              <h3 class="font-serif italic text-[#4A3F35] text-base">Presentación & Envío</h3>
              <p class="text-xs text-[#4A3F35]/70 leading-relaxed">Empaque hermético diseñado para mantener la frescura hasta la puerta de tu hogar.</p>
            </div>
          </div>
        </div>

        <!-- Nuestra Sucursal en La Dorada -->
        <div class="bg-white rounded-[40px] border border-[#EBE3D5] p-8 sm:p-12 shadow-xs space-y-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div class="space-y-4">
              <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">Visítanos en Físico</span>
              <h2 class="text-3xl font-serif italic text-[#4A3F35]">Nuestra Sucursal Principal</h2>
              <p class="text-[#4A3F35]/80 text-sm leading-relaxed">
                Ven a disfrutar de nuestro espacio ambientado con música suave, aroma a té verde y la atención cálida de nuestro equipo.
              </p>

              <div class="space-y-3 text-xs text-[#4A3F35] pt-2">
                <div class="flex items-center gap-3">
                  <span class="material-icons text-[#8C3A3A]">location_on</span>
                  <span class="font-bold">{{ config().direccionLocal }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-icons text-[#8C3A3A]">schedule</span>
                  <span>{{ config().horarioAtencion }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-icons text-[#8C3A3A]">phone</span>
                  <span>WhatsApp: +57 300 123 4567</span>
                </div>
              </div>

              <div class="pt-2">
                <a routerLink="/contacto" class="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs hover:bg-[#362D26] transition-colors">
                  📍 Ver Mapa & Contacto
                </a>
              </div>
            </div>

            <!-- Google Maps -->
            <div class="rounded-[32px] overflow-hidden border border-[#EBE3D5] h-72">
              <iframe
                [src]="mapUrl()"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class AboutPageComponent {
  dataService = inject(MochiDataService);
  private sanitizer = inject(DomSanitizer);
  config = this.dataService.visualConfig;

  mapUrl = computed<SafeResourceUrl>(() => {
    const addr = encodeURIComponent(this.config().direccionLocal);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${addr}&output=embed`
    );
  });
}
