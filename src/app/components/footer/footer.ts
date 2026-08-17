import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#FF758F] text-[#FDF5F0] pt-16 pb-12 border-t border-[#FF5277]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#FF5277]">
          
          <!-- Column 1: Brand & Philosophy -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-[#FF758F] text-white flex items-center justify-center text-xl font-serif italic shadow-md">
                M
              </div>
              <span class="text-3xl font-serif italic text-white tracking-tighter">Mochi.</span>
            </div>
            <p class="text-[#FDF5F0]/80 text-xs leading-relaxed mb-6 font-sans">
              Boutique de postres japoneses artesanales en La Dorada, Caldas. Cada pieza es elaborada con amor, técnicas tradicionales de Kioto y los ingredientes más puros.
            </p>
            <div class="flex items-center gap-3 text-[11px] font-bold text-[#FFA0B4]">
              <span class="w-2 h-2 rounded-full bg-[#80CBC4] animate-ping"></span>
              <span>Atención 11:00 AM - 9:00 PM</span>
            </div>
          </div>

          <!-- Column 2: Navigation Links -->
          <div>
            <h3 class="text-white font-serif italic text-lg mb-4">Explora Mochi.</h3>
            <ul class="space-y-2.5 text-xs text-[#FDF5F0]/80 uppercase tracking-widest font-semibold">
              <li><a routerLink="/productos" class="hover:text-[#FFA0B4] transition-colors">Catálogo de Postres</a></li>
              <li><a routerLink="/simulador" class="hover:text-[#FFA0B4] transition-colors">Simulador de Pedidos</a></li>
              <li><a routerLink="/sobre-nosotros" class="hover:text-[#FFA0B4] transition-colors">Nuestra Historia</a></li>
              <li><a routerLink="/blog" class="hover:text-[#FFA0B4] transition-colors">Blog de Cultura Japonesa</a></li>
              <li><a routerLink="/pedidos" class="hover:text-[#FFA0B4] transition-colors">Seguimiento de Pedidos</a></li>
            </ul>
          </div>

          <!-- Column 3: Contact & Location in La Dorada -->
          <div>
            <h3 class="text-white font-serif italic text-lg mb-4">Ubicación & Contacto</h3>
            <ul class="space-y-3 text-xs text-[#FDF5F0]/80">
              <li class="flex items-start gap-2.5">
                <span class="material-icons text-[#FFA0B4] text-base">location_on</span>
                <span>{{ config().direccionLocal }}</span>
              </li>
              <li class="flex items-center gap-2.5">
                <span class="material-icons text-[#FFA0B4] text-base">schedule</span>
                <span>{{ config().horarioAtencion }}</span>
              </li>
              <li class="flex items-center gap-2.5">
                <span class="material-icons text-[#FFA0B4] text-base">phone</span>
                <span>+57 300 123 4567</span>
              </li>
            </ul>

            <a [href]="'https://wa.me/' + config().telefonoWhatsApp.replace('+', '') + '?text=Hola%20Mochi,%20quisiera%20hacer%20un%20pedido'" target="_blank" class="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white font-bold text-xs shadow-md transition-colors uppercase tracking-wider">
              <span>💬 Contactar por WhatsApp</span>
            </a>
          </div>

          <!-- Column 4: Payment Methods Accepted & Team -->
          <div>
            <h3 class="text-white font-serif italic text-lg mb-4">Pasarela & Pagos</h3>
            <p class="text-xs text-[#FDF5F0]/80 mb-4 leading-relaxed">
              Aceptamos PSE, Nequi, Daviplata, Tarjetas de Crédito y Pago contra entrega en La Dorada.
            </p>
            <div class="flex flex-wrap gap-2 mb-6 text-[10px] font-bold">
              <span class="px-2.5 py-1 rounded-full bg-[#241A13] text-[#FDF5F0] border border-[#FF5277]">PSE</span>
              <span class="px-2.5 py-1 rounded-full bg-[#241A13] text-[#FDF5F0] border border-[#FF5277]">NEQUI</span>
              <span class="px-2.5 py-1 rounded-full bg-[#241A13] text-[#FDF5F0] border border-[#FF5277]">DAVIPLATA</span>
              <span class="px-2.5 py-1 rounded-full bg-[#241A13] text-[#FDF5F0] border border-[#FF5277]">VISA/MASTER</span>
              <span class="px-2.5 py-1 rounded-full bg-[#241A13] text-[#FDF5F0] border border-[#FF5277]">EFECTIVO</span>
            </div>

            <div class="text-xs text-[#FDF5F0]/70">
              <p class="font-semibold text-white">Equipo Creador:</p>
              <p>Michel • Felipe • Neider</p>
            </div>
          </div>

        </div>

        <div class="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#FDF5F0]/60 gap-4">
          <p>© 2026 Mochi. — Postres Japoneses Artesanales. Todos los derechos reservados.</p>
          <div class="flex items-center gap-6">
            <a routerLink="/sobre-nosotros" class="hover:text-white transition-colors">Términos</a>
            <a routerLink="/contacto" class="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  dataService = inject(MochiDataService);
  config = this.dataService.visualConfig;
}
