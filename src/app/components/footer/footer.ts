import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer [style.background]="'var(--footer-bg)'" [style.color]="'var(--footer-text)'" class="font-sans">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <!-- Grid principal -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-16 border-b" [style.border-color]="footerBorderColor">

          <!-- Column 1: Brand + Contact -->
          <div class="text-center md:text-left">
            <div class="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl italic shadow-md" [style.background]="'var(--accent)'">M</div>
              <span class="text-3xl italic tracking-tighter" [style.color]="'var(--footer-heading)'">Mochi.</span>
            </div>
            <ul class="space-y-3 text-xs opacity-80 mb-6">
              <li class="flex items-center justify-center md:justify-start gap-2.5">
                <span class="material-icons text-base opacity-70">location_on</span>
                <span>{{ config().direccionLocal }}</span>
              </li>
              <li class="flex items-center justify-center md:justify-start gap-2.5">
                <span class="material-icons text-base opacity-70">schedule</span>
                <span>{{ config().horarioAtencion }}</span>
              </li>
              <li class="flex items-center justify-center md:justify-start gap-2.5">
                <span class="material-icons text-base opacity-70">phone</span>
                <span>+57 300 123 4567</span>
              </li>
            </ul>
            <div class="flex items-center justify-center md:justify-start gap-3 text-[11px] font-bold opacity-70">
              <span class="w-2 h-2 rounded-full animate-pulse" [style.background]="'var(--success)'"></span>
              <span>Atencion 11:00 AM - 9:00 PM</span>
            </div>
          </div>

          <!-- Column 2: Menu -->
          <div class="text-center md:text-left">
            <h3 class="italic text-lg mb-4" [style.color]="'var(--footer-heading)'">Explora Mochi.</h3>
            <ul class="space-y-2.5 text-xs uppercase tracking-widest font-semibold opacity-80">
              <li><a routerLink="/productos" class="hover:opacity-100 transition-opacity">Catalogo de Postres</a></li>
              <li><a routerLink="/simulador" class="hover:opacity-100 transition-opacity">Simulador de Pedidos</a></li>
              <li><a routerLink="/sobre-nosotros" class="hover:opacity-100 transition-opacity">Nuestra Historia</a></li>
              <li><a routerLink="/blog" class="hover:opacity-100 transition-opacity">Blog de Cultura Japonesa</a></li>
              <li><a routerLink="/pedidos" class="hover:opacity-100 transition-opacity">Seguimiento de Pedidos</a></li>
            </ul>
          </div>

          <!-- Column 3: Menu -->
          <div class="text-center md:text-left">
            <h3 class="italic text-lg mb-4" [style.color]="'var(--footer-heading)'">Pagos y Redes</h3>
            <p class="text-xs mb-4 leading-relaxed opacity-80">
              Aceptamos PSE, Nequi, Daviplata, Tarjetas de Credito y Pago contra entrega en La Dorada.
            </p>

            <!-- Logos de pago + Redes sociales en la misma linea -->
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/254f9960-57b9-11e8-a82b-59483d0f8e12-m.svg" alt="PSE" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <img src="https://ayuda.nequi.com.co/hc/theming_assets/01K33KNDSV01JCWCVQN8EPN9D7" alt="Nequi" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/72df52b0-f3c4-11eb-a186-1134488bf456-m.svg" alt="Daviplata" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/5c2bfa10-7d35-11f0-b528-71999009c8ad-m.svg" alt="Bancolombia" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" alt="Visa" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <img src="https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg" alt="Mastercard" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <img src="https://d1b4gd4m8561gs.cloudfront.net/sites/default/files/images/bre-b-identifica.png" alt="BRE-B" class="h-6 w-16 object-contain opacity-50 grayscale-[15%] hover:opacity-75 hover:grayscale-0 transition-all" loading="lazy">
              <span class="w-px h-5 opacity-30 mx-1 hidden sm:block" [style.background]="'var(--footer-text)'"></span>
              <!-- Instagram -->
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80" [style.border-color]="footerBorderColor">
                <svg class="w-4 h-4" viewBox="0 0 24 24" [style.color]="'var(--footer-text)'">
                  <path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                </svg>
              </a>
              <!-- TikTok -->
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80" [style.border-color]="footerBorderColor">
                <svg class="w-4 h-4" viewBox="0 0 24 24" [style.color]="'var(--footer-text)'">
                  <path fill="currentColor" d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
                </svg>
              </a>
              <!-- Facebook -->
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:opacity-80" [style.border-color]="footerBorderColor">
                <svg class="w-4 h-4" viewBox="0 0 24 24" [style.color]="'var(--footer-text)'">
                  <path fill="currentColor" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
            </div>

          </div>
        </div>

        <!-- Aliados / Colaboradores — entre pagos y terminos -->
        <div class="border-b" [style.border-color]="footerBorderColor">
          <div class="py-8">
            <div class="text-center mb-6">
              <p class="text-[10px] font-bold uppercase tracking-[0.25em] opacity-50 mb-1">Nuestros Aliados</p>
              <p class="text-[11px] opacity-40">Insumos de primera calidad para nuestros postres</p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              <a href="https://www.alqueria.com.co/" target="_blank" rel="noopener"
                class="flex items-center justify-center h-12 opacity-40 hover:opacity-75 transition-opacity grayscale hover:grayscale-0">
                <img src="https://www.alqueria.com.co/_next/static/media/logo.a742f8fc.svg" alt="Alquería" class="h-full object-contain" loading="lazy">
              </a>
              <a href="https://fruticola.co/" target="_blank" rel="noopener"
                class="flex items-center justify-center h-12 opacity-40 hover:opacity-75 transition-opacity grayscale hover:grayscale-0">
                <img src="https://fruticola.co/wp-content/uploads/2025/06/logo-blanco.webp" alt="Frutícola" class="h-full object-contain" loading="lazy">
              </a>
              <a href="https://chocolatecordillera.com/" target="_blank" rel="noopener"
                class="flex items-center justify-center h-12 opacity-40 hover:opacity-75 transition-opacity grayscale hover:grayscale-0">
                <img src="https://chocolatecordillera.com/wp-content/uploads/2024/02/logo-night.png" alt="La Cordillera" class="h-full object-contain" loading="lazy">
              </a>
              <a href="https://www.oreo.com/" target="_blank" rel="noopener"
                class="flex items-center justify-center h-12 opacity-40 hover:opacity-75 transition-opacity grayscale hover:grayscale-0">
                <img src="https://cdn.shopify.com/oxygen-v2/29113/15908/32818/4274814/assets/logo-D3vlQ8nU.svg" alt="Oreo" class="h-full object-contain" loading="lazy">
              </a>
              <a href="https://www.sellopack.com/" target="_blank" rel="noopener"
                class="flex items-center justify-center h-12 opacity-40 hover:opacity-75 transition-opacity grayscale hover:grayscale-0">
                <img src="https://media.licdn.com/dms/image/v2/C4E0BAQHh2h8tJ-6MTw/company-logo_200_200/company-logo_200_200/0/1630593911922?e=2147483647&v=beta&t=d7LdDkTNfOFpsTZhiw5Hw2yh65RA87jvWNxnYOARTno" alt="Sellopack" class="h-full object-contain" loading="lazy">
              </a>
            </div>
          </div>
        </div>

        <!-- Derechos reservados y terminos -- ULTIMO -->
        <div class="py-8 flex flex-col md:flex-row items-center justify-between text-xs opacity-60 gap-4">
          <p class="text-center md:text-left">2026 Mochi. - Postres Japoneses Artesanales. Todos los derechos reservados.</p>
          <div class="flex items-center justify-center gap-6">
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
