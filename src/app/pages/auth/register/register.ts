import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnDestroy, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { ToastService } from '../../../services/toast.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#FDF8F4]">
      <div class="w-full max-w-md bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-10 shadow-xs space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D95578] text-white font-serif text-2xl mb-1 shadow-xs font-bold">
            M
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif italic text-[#590E2A] font-bold">
            {{ step() === 1 ? 'Crear Cuenta' : 'Tu Dirección' }}
          </h1>
          <p class="text-xs text-[#590E2A]/80 font-medium">
            {{ step() === 1 ? 'Regístrate en Mochi y disfruta de envíos exclusivos' : 'Agrega tu dirección para recibir tus pedidos' }}
          </p>
        </div>

        <!-- Step Indicator -->
        <div class="flex items-center justify-center gap-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
              [class]="step() >= 1 ? 'bg-[#D95578] text-white' : 'bg-[#FDF8F4] text-[#590E2A]/40 border border-[#E8D8D0]'">
              @if (step() > 1) {
                <span class="material-icons" style="font-size: 16px">check</span>
              } @else {
                1
              }
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider" [class]="step() >= 1 ? 'text-[#D95578]' : 'text-[#590E2A]/40'">Datos</span>
          </div>
          <div class="w-8 h-px bg-[#E8D8D0]"></div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors"
              [class]="step() >= 2 ? 'bg-[#D95578] text-white' : 'bg-[#FDF8F4] text-[#590E2A]/40 border border-[#E8D8D0]'">
              2
            </div>
            <span class="text-[10px] font-bold uppercase tracking-wider" [class]="step() >= 2 ? 'text-[#D95578]' : 'text-[#590E2A]/40'">Dirección</span>
          </div>
        </div>

        @if (success()) {
          <div class="p-6 rounded-2xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-center space-y-3">
            <div class="text-3xl">✅</div>
            <h2 class="text-lg font-serif italic font-bold">¡Cuenta creada con éxito!</h2>
            <p class="text-xs leading-relaxed font-medium">
              Tu cuenta ha sido registrada. Ya puedes iniciar sesión y ordenar tus mochis artesanales favoritos.
            </p>
            <div class="pt-2">
              <a routerLink="/login" class="inline-block px-6 py-2.5 rounded-full bg-[#D95578] hover:bg-[#FF6078] text-[#FDF8F4] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors">
                Ir a Iniciar Sesión
              </a>
            </div>
          </div>
        } @else {

          <!-- ===================== STEP 1: Formulario ===================== -->
          @if (step() === 1) {
            <form (submit)="goToStep2($event)" class="space-y-4 text-xs">
              <div>
                <label class="font-bold text-[#590E2A] block mb-1 uppercase tracking-wider text-[11px]">Nombre Completo *</label>
                <input type="text" [value]="nombreCompleto()" (input)="nombreCompleto.set($any($event.target).value)" placeholder="Juan Pérez" required
                  class="w-full px-4 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors font-medium"/>
              </div>

              <div>
                <label class="font-bold text-[#590E2A] block mb-1 uppercase tracking-wider text-[11px]">Correo Electrónico *</label>
                <input type="email" [value]="email()" (input)="email.set($any($event.target).value)" placeholder="tu&#64;email.com" required
                  class="w-full px-4 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors font-medium"/>
              </div>

              <div>
                <label class="font-bold text-[#590E2A] block mb-1 uppercase tracking-wider text-[11px]">Teléfono Celular (Opcional)</label>
                <input type="tel" [value]="telefono()" (input)="telefono.set($any($event.target).value)" placeholder="+57 300 123 4567"
                  class="w-full px-4 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors font-medium"/>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="font-bold text-[#590E2A] block mb-1 uppercase tracking-wider text-[11px]">Contraseña *</label>
                  <div class="relative">
                    <input [type]="showPassword() ? 'text' : 'password'" [value]="password()" (input)="password.set($any($event.target).value)" placeholder="Mín. 6 caracteres" required minlength="6"
                      class="w-full px-4 pr-10 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors font-medium"/>
                    <button type="button" (click)="showPassword.set(!showPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30 hover:text-[#590E2A]/60 transition-colors">
                      <span class="material-icons" style="font-size: 16px">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label class="font-bold text-[#590E2A] block mb-1 uppercase tracking-wider text-[11px]">Confirmar *</label>
                  <div class="relative">
                    <input [type]="showConfirmPassword() ? 'text' : 'password'" [value]="confirmPassword()" (input)="confirmPassword.set($any($event.target).value)" placeholder="Repite contraseña" required minlength="6"
                      class="w-full px-4 pr-10 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors font-medium"/>
                    <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())" class="absolute right-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30 hover:text-[#590E2A]/60 transition-colors">
                      <span class="material-icons" style="font-size: 16px">{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <input type="checkbox" id="acceptTerms" [checked]="acceptTerms()" (change)="acceptTerms.set($any($event.target).checked)"
                  class="w-4 h-4 rounded text-[#D95578] focus:ring-0 cursor-pointer accent-[#D95578]"/>
                <label for="acceptTerms" class="text-xs text-[#590E2A]/80 cursor-pointer font-medium">
                  Acepto los <a routerLink="/contacto" class="underline font-medium text-[#D95578]">términos y condiciones</a>
                </label>
              </div>

              <button type="submit" class="w-full py-3.5 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xs mt-2 cursor-pointer">
                Siguiente →
              </button>
            </form>
          }

          <!-- ===================== STEP 2: Dirección ===================== -->
          @if (step() === 2) {
            <div class="space-y-4">
              <!-- Map -->
              <div class="relative rounded-xl overflow-hidden border border-[#E8D8D0]">
                <div class="absolute top-2 left-2 right-2 z-[1000]">
                  <div class="relative">
                    <span class="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#590E2A]/40" style="font-size: 16px">search</span>
                    <input #mapSearchInput type="text" placeholder="Buscar dirección..."
                      (keydown.enter)="searchAddress(mapSearchInput.value)"
                      class="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/95 backdrop-blur border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] shadow-sm"/>
                    <button (click)="searchAddress(mapSearchInput.value)" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#D95578] flex items-center justify-center hover:bg-[#FF6078] transition-colors">
                      <span class="material-icons text-white" style="font-size: 14px">arrow_forward</span>
                    </button>
                  </div>
                </div>
                <div id="register-map" class="w-full h-48"></div>
                @if (mapLoading()) {
                  <div class="absolute inset-0 bg-white/70 flex items-center justify-center z-[999]">
                    <span class="material-icons animate-spin text-[#D95578]">refresh</span>
                  </div>
                }
              </div>

              <p class="text-[10px] text-[#590E2A]/40 flex items-center gap-1">
                <span class="material-icons" style="font-size: 12px">info</span>
                Busca o haz clic en el mapa. Puedes saltarte este paso.
              </p>

              @if (mapAddress()) {
                <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center gap-2">
                  <span class="material-icons text-[#2C5350]" style="font-size: 14px">check_circle</span>
                  <p class="text-[11px] font-medium text-[#2C5350]">{{ mapAddress() }}</p>
                </div>
              }

              <!-- Address Input with Verify -->
              <div>
                <label class="font-bold text-[#590E2A] block mb-1 uppercase tracking-wider text-[11px]">Dirección</label>
                <div class="flex gap-2">
                  <div class="flex-1 relative">
                    <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30" style="font-size: 16px">edit_location</span>
                    <input #dirManualInput type="text" placeholder="Escribe tu dirección y presiona Enter..."
                      [value]="mapAddress()"
                      (input)="mapAddress.set($any($event.target).value)"
                      (keydown.enter)="searchAddress(dirManualInput.value)"
                      class="w-full pl-9 pr-4 py-3 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors font-medium"/>
                  </div>
                  <button type="button" (click)="searchAddress(dirManualInput.value)"
                    class="px-4 py-3 rounded-xl bg-[#590E2A] text-white hover:bg-[#3A0A1C] transition-colors shrink-0 flex items-center gap-1">
                    <span class="material-icons" style="font-size: 16px">search</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Verificar</span>
                  </button>
                </div>
                <p class="text-[9px] text-[#590E2A]/30 mt-1">Escribe la dirección y presiona Enter o "Verificar" para buscarla en el mapa</p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <input #aliasInput type="text" placeholder="Alias (Casa, Trabajo)" class="p-3 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                <input #barrioInput type="text" placeholder="Barrio" class="p-3 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
              </div>

              <div class="flex gap-3">
                <button (click)="step.set(1)"
                  class="px-5 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-xs uppercase tracking-wider hover:bg-[#E8D8D0]/30 transition-colors cursor-pointer">
                  ← Atrás
                </button>
                <button (click)="onSubmit(aliasInput.value, barrioInput.value)"
                  [disabled]="loading()"
                  class="flex-1 py-3.5 rounded-full bg-[#D95578] hover:bg-[#FF5277] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer">
                  {{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
                </button>
              </div>

              <button (click)="onSubmit('', '')"
                [disabled]="loading()"
                class="w-full text-center text-[10px] text-[#590E2A]/40 hover:text-[#590E2A]/60 transition-colors cursor-pointer">
                Saltar este paso →
              </button>
            </div>
          }

          <!-- Links -->
          <div class="text-center pt-3 border-t border-[#E8D8D0] text-xs">
            <span class="text-[#590E2A]/80 font-medium">¿Ya tienes una cuenta?</span>
            <a routerLink="/login" class="ml-1 text-[#D95578] font-bold hover:underline">
              Inicia sesión aquí
            </a>
          </div>
        }

      </div>
    </div>
  `
})
export class RegisterComponent implements OnDestroy {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private toast = inject(ToastService);

  step = signal(1);
  nombreCompleto = signal('');
  email = signal('');
  telefono = signal('');
  password = signal('');
  confirmPassword = signal('');
  acceptTerms = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  loading = signal(false);
  success = signal(false);

  mapAddress = signal('');
  mapLoading = signal(false);

  private map: any = null;
  private marker: any = null;
  private L: typeof import('leaflet') | null = null;
  private readonly LADORADA = { lat: 5.4538, lng: -74.6647 };

  constructor() {
    effect(() => {
      const currentStep = this.step();
      if (currentStep === 2 && isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initMap(), 50);
      } else {
        this.destroyMap();
      }
    });
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  async goToStep2(event: Event) {
    event.preventDefault();

    if (this.password() !== this.confirmPassword()) {
      this.toast.show('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (this.password().length < 6) {
      this.toast.show('La contraseña debe tener mínimo 6 caracteres.', 'error');
      return;
    }
    if (!this.acceptTerms()) {
      this.toast.show('Debes aceptar los términos y condiciones.', 'error');
      return;
    }

    // Check if email is already registered
    this.loading.set(true);
    const { data } = await this.supabase.checkEmailExists(this.email());
    this.loading.set(false);

    if (data && data.exists) {
      this.toast.show('Este correo ya está registrado. Inicia sesión o usa otro correo.', 'error');
      return;
    }

    this.step.set(2);
  }

  async onSubmit(alias: string, barrio: string) {
    this.loading.set(true);

    const { error } = await this.supabase.signUp(
      this.email(),
      this.password(),
      {
        nombre_completo: this.nombreCompleto(),
        telefono: this.telefono(),
        rol: 'cliente'
      }
    );

    if (error) {
      this.toast.show(error.message, 'error');
      this.loading.set(false);
      return;
    }

    // Save address if provided
    if (this.mapAddress() && alias) {
      const user = this.supabase.activeUser();
      if (user) {
        await this.supabase.addDireccion({
          id_usuario: user.id,
          alias: alias || 'Mi Dirección',
          direccion_completa: this.mapAddress(),
          barrio: barrio || 'Centro',
          ciudad: 'La Dorada',
          departamento: 'Caldas',
          codigo_postal: '175031',
          predeterminada: true
        });
      }
    }

    this.success.set(true);
    this.loading.set(false);
  }

  // ---- MAP ----

  async initMap() {
    if (this.map) return;
    if (!this.L) {
      this.L = await import('leaflet');
    }
    const L = this.L;
    const container = document.getElementById('register-map');
    if (!container) return;

    this.map = L.map('register-map').setView([this.LADORADA.lat, this.LADORADA.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.placeMarker(lat, lng);
      this.reverseGeocode(lat, lng);
    });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  placeMarker(lat: number, lng: number) {
    if (!this.map || !this.L) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      const icon = this.L.divIcon({
        html: `<span class="material-icons" style="font-size:32px;color:#D95578;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">location_on</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: ''
      });
      this.marker = this.L.marker([lat, lng], { icon }).addTo(this.map);
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    this.mapLoading.set(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`);
      const data = await res.json();
      if (data?.display_name) this.mapAddress.set(data.display_name);
    } catch {
      this.mapAddress.set(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    this.mapLoading.set(false);
  }

  async searchAddress(query: string) {
    if (!query || query.length < 3) return;
    this.mapLoading.set(true);
    try {
      let searchQuery = `${query}, Caldas, Colombia`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=es`);
      let data = await res.json();

      if (!data || data.length === 0) {
        searchQuery = `${query}, Colombia`;
        res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=es`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        this.map?.setView([latNum, lonNum], 16);
        this.placeMarker(latNum, lonNum);
        this.mapAddress.set(display_name);
      } else {
        this.toast.show('No se encontró la dirección. Intenta con otra descripción.', 'error');
      }
    } catch {
      this.toast.show('Error al buscar dirección. Intenta de nuevo.', 'error');
    }
    this.mapLoading.set(false);
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }
}
