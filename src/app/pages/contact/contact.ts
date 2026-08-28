import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <!-- Header -->
        <div class="bg-white rounded-[40px] p-8 sm:p-12 border border-[#E8D8D0] shadow-xs text-center max-w-3xl mx-auto space-y-3">
          <span class="px-4 py-1.5 rounded-full bg-[#D95578] text-[#590E2A] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#E8D8D0]">
            📍 Estamos para Atenderte
          </span>
          <h1 class="text-3xl sm:text-5xl font-serif italic text-[#590E2A]">
            Contacto & Atención en La Dorada
          </h1>
          <p class="text-[#590E2A]/70 text-xs uppercase tracking-wider leading-relaxed">
            ¿Tienes dudas sobre nuestros postres, catering para eventos especiales o pedidos corporativos? Escríbenos directamente.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Contact Form -->
          <div class="lg:col-span-7 bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-4">
            <h2 class="text-xl font-serif italic text-[#590E2A]">Envíanos un Mensaje Directo</h2>
            
            @if (messageSent()) {
              <div class="p-4 rounded-full bg-[#E0F2F1] border border-[#b2dfdb] text-[#2C5350] text-xs font-bold text-center space-y-1 uppercase tracking-wider">
                <span>✓ ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo en breve.</span>
              </div>
            }

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label for="c-nombre" class="font-bold text-[#590E2A] block mb-1">Nombre Completo *</label>
                <input id="c-nombre" #nInput type="text" placeholder="Ej. Ana María" class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]">
              </div>
              <div>
                <label for="c-email" class="font-bold text-[#590E2A] block mb-1">Correo Electrónico *</label>
                <input id="c-email" #eInput type="email" placeholder="ana@ejemplo.com" class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]">
              </div>
              <div class="sm:col-span-2">
                <label for="c-asunto" class="font-bold text-[#590E2A] block mb-1">Asunto *</label>
                <select id="c-asunto" #aInput
                  [value]="selectedSubject()"
                  (change)="selectedSubject.set($any($event.target).value)"
                  class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]">
                  <option value="general">Consulta General</option>
                  <option value="pedido">Pedido Especial / Cumpleaños</option>
                  <option value="evento">Evento / Catering</option>
                  <option value="envio_nacional">Envio Nacional</option>
                  <option value="franquicia">Franquicia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label for="c-mensaje" class="font-bold text-[#590E2A] block mb-1">Mensaje *</label>
                <textarea id="c-mensaje" #mInput rows="4" placeholder="Escribe tus preguntas..." class="w-full p-3.5 rounded-[20px] bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]"></textarea>
              </div>
            </div>

            <button 
              (click)="sendMessage(nInput.value, eInput.value, aInput.value, mInput.value); nInput.value=''; eInput.value=''; aInput.value=''; mInput.value=''"
              class="w-full py-4 rounded-full bg-[#590E2A] hover:bg-[#3A0A1C] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors">
              Enviar Mensaje a Mochi.
            </button>
          </div>

          <!-- Location Info & WhatsApp Quick Link -->
          <div class="lg:col-span-5 space-y-6">
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-4">
              <h2 class="text-xl font-serif italic text-[#590E2A]">Ubicación de la Tienda</h2>
              
              <div class="space-y-3 text-xs text-[#590E2A]">
                <div class="flex items-center gap-3">
                  <span class="material-icons text-[#8C3A3A] text-lg">location_on</span>
                  <span>{{ config().direccionLocal }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-icons text-[#8C3A3A] text-lg">schedule</span>
                  <span>{{ config().horarioAtencion }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="material-icons text-[#8C3A3A] text-lg">phone</span>
                  <span>+57 300 123 4567</span>
                </div>
              </div>

              <a [href]="'https://wa.me/' + config().telefonoWhatsApp.replace('+', '') + '?text=Hola%20Mochi,%20tengo%20una%20consulta'" target="_blank" class="w-full py-3.5 rounded-full bg-[#2C5350] hover:bg-[#1f3d3b] text-[#FDF8F4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors">
                <span>💬 Escribir al WhatsApp Oficial</span>
              </a>
            </div>

            <div class="bg-[#590E2A] text-[#FDF8F4] p-6 rounded-[32px] space-y-2 border border-[#E8D8D0]">
              <span class="text-xs font-serif italic uppercase tracking-wider block text-[#D95578]">Atención Personalizada</span>
              <p class="text-xs text-[#FDF8F4]/80 leading-relaxed">
                Aceptamos pedidos especiales para fiestas de cumpleaños, aniversarios y regalos corporativos con empaques fukusa tradicionales.
              </p>
            </div>
          </div>

        </div>

        <!-- Google Map -->
        <div class="bg-white rounded-[40px] border border-[#E8D8D0] overflow-hidden shadow-xs">
          <div class="p-6 sm:p-8 border-b border-[#E8D8D0]">
            <h2 class="text-xl font-serif italic text-[#590E2A] font-bold">Nuestra Ubicación</h2>
            <p class="text-xs text-[#590E2A]/60 mt-1">Calle 10 # 5-20, Centro, La Dorada, Caldas</p>
          </div>
          <div class="w-full h-80 sm:h-96">
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
  `
})
export class ContactPageComponent implements OnInit {
  dataService = inject(MochiDataService);
  private sanitizer = inject(DomSanitizer);
  private route = inject(ActivatedRoute);
  config = this.dataService.visualConfig;

  selectedSubject = signal('general');
  messageSent = signal(false);

  mapUrl = computed<SafeResourceUrl>(() => {
    const addr = encodeURIComponent(this.config().direccionLocal);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${addr}&output=embed`
    );
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['asunto']) {
        this.selectedSubject.set(params['asunto']);
      }
    });
  }

  sendMessage(n: string, e: string, a: string, m: string) {
    if (!n || !e || !m) return;
    this.messageSent.set(true);
    setTimeout(() => this.messageSent.set(false), 4000);
  }
}
