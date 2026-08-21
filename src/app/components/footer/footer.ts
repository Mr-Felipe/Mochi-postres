import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer [style.background]="'var(--footer-bg)'" [style.color]="'var(--footer-text)'">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16 border-b" [style.border-color]="footerBorderColor">

          <!-- Column 1: Brand + Newsletter -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-serif italic shadow-md" [style.background]="'var(--accent)'">M</div>
              <span class="text-3xl font-serif italic tracking-tighter" [style.color]="'var(--footer-heading)'">Mochi.</span>
            </div>
            <p class="text-xs leading-relaxed mb-6 opacity-80">
              Boutique de postres japoneses artesanales en La Dorada, Caldas. Cada pieza es elaborada con amor, tecnicas tradicionales de Kioto y los ingredientes mas puros.
            </p>
            <div class="flex items-center gap-3 text-[11px] font-bold opacity-70 mb-6">
              <span class="w-2 h-2 rounded-full animate-pulse" [style.background]="'var(--success)'"></span>
              <span>Atencion 11:00 AM - 9:00 PM</span>
            </div>

            <!-- Newsletter -->
            <div>
              <p class="text-xs font-bold uppercase tracking-widest mb-2 opacity-90">Newsletter</p>
              <p class="text-[11px] opacity-70 mb-3">Recibe ofertas y novedades en tu correo.</p>
              <div class="flex gap-2">
                <input type="email" placeholder="tu@email.com" class="flex-1 px-3 py-2 rounded-full text-xs border bg-transparent opacity-90 focus:outline-none focus:ring-2" [style.border-color]="footerBorderColor" [style.color]="'var(--footer-text)'">
                <button class="px-4 py-2 rounded-full text-white text-xs font-bold transition-colors" [style.background]="'var(--accent)'">Enviar</button>
              </div>
            </div>
          </div>

          <!-- Column 2: Menu -->
          <div>
            <h3 class="font-serif italic text-lg mb-4" [style.color]="'var(--footer-heading)'">Explora Mochi.</h3>
            <ul class="space-y-2.5 text-xs uppercase tracking-widest font-semibold opacity-80">
              <li><a routerLink="/productos" class="hover:opacity-100 transition-opacity">Catalogo de Postres</a></li>
              <li><a routerLink="/simulador" class="hover:opacity-100 transition-opacity">Simulador de Pedidos</a></li>
              <li><a routerLink="/sobre-nosotros" class="hover:opacity-100 transition-opacity">Nuestra Historia</a></li>
              <li><a routerLink="/blog" class="hover:opacity-100 transition-opacity">Blog de Cultura Japonesa</a></li>
              <li><a routerLink="/pedidos" class="hover:opacity-100 transition-opacity">Seguimiento de Pedidos</a></li>
            </ul>
          </div>

          <!-- Column 3: Contact -->
          <div>
            <h3 class="font-serif italic text-lg mb-4" [style.color]="'var(--footer-heading)'">Ubicacion y Contacto</h3>
            <ul class="space-y-3 text-xs opacity-80">
              <li class="flex items-start gap-2.5">
                <span class="material-icons text-base opacity-70">location_on</span>
                <span>{{ config().direccionLocal }}</span>
              </li>
              <li class="flex items-center gap-2.5">
                <span class="material-icons text-base opacity-70">schedule</span>
                <span>{{ config().horarioAtencion }}</span>
              </li>
              <li class="flex items-center gap-2.5">
                <span class="material-icons text-base opacity-70">phone</span>
                <span>+57 300 123 4567</span>
              </li>
            </ul>
            <a [href]="'https://wa.me/' + config().telefonoWhatsApp.replace('+', '') + '?text=Hola%20Mochi,%20quisiera%20hacer%20un%20pedido'" target="_blank"
              class="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-white font-bold text-xs shadow-md transition-colors uppercase tracking-wider"
              [style.background]="'var(--accent)'">
              <span>Contactar por WhatsApp</span>
            </a>
          </div>

          <!-- Column 4: Payments + Social -->
          <div>
            <h3 class="font-serif italic text-lg mb-4" [style.color]="'var(--footer-heading)'">Pagos y Redes</h3>
            <p class="text-xs mb-4 leading-relaxed opacity-80">
              Aceptamos PSE, Nequi, Daviplata, Tarjetas de Credito y Pago contra entrega en La Dorada.
            </p>
            <div class="flex flex-wrap gap-2 mb-6 text-[10px] font-bold">
              <span class="px-2.5 py-1 rounded-full border" [style.border-color]="'var(--accent)'" [style.color]="'var(--footer-text)'">PSE</span>
              <span class="px-2.5 py-1 rounded-full border" [style.border-color]="'var(--accent)'" [style.color]="'var(--footer-text)'">NEQUI</span>
              <span class="px-2.5 py-1 rounded-full border" [style.border-color]="'var(--accent)'" [style.color]="'var(--footer-text)'">DAVIPLATA</span>
              <span class="px-2.5 py-1 rounded-full border" [style.border-color]="'var(--accent)'" [style.color]="'var(--footer-text)'">VISA/MASTER</span>
              <span class="px-2.5 py-1 rounded-full border" [style.border-color]="'var(--accent)'" [style.color]="'var(--footer-text)'">EFECTIVO</span>
            </div>

            <p class="text-xs font-bold mb-2 opacity-90">Siguenos</p>
            <div class="flex items-center gap-3">
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80" [style.border-color]="footerBorderColor">
                <span class="material-icons text-base">photo_camera</span>
              </a>
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80" [style.border-color]="footerBorderColor">
                <span class="material-icons text-base">chat</span>
              </a>
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80" [style.border-color]="footerBorderColor">
                <span class="material-icons text-base">facebook</span>
              </a>
            </div>

            <div class="mt-6 text-xs opacity-70">
              <p class="font-semibold opacity-90">Equipo Creador:</p>
              <p>Michel - Felipe - Neider</p>
            </div>
          </div>
        </div>

        <div class="py-8 flex flex-col md:flex-row items-center justify-between text-xs opacity-60 gap-4">
          <p>2026 Mochi. - Postres Japoneses Artesanales. Todos los derechos reservados.</p>
          <div class="flex items-center gap-6">
            <a routerLink="/sobre-nosotros" class="hover:opacity-100 transition-opacity">Terminos</a>
            <a routerLink="/contacto" class="hover:opacity-100 transition-opacity">Privacidad</a>
            <a routerLink="/contacto" class="hover:opacity-100 transition-opacity">Nutricion</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  dataService = inject(MochiDataService);
  config = this.dataService.visualConfig;

  get footerBorderColor(): string {
    return 'rgba(255,255,255,0.15)';
  }
}
