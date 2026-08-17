import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#FDF5F0]">
      <div class="w-full max-w-md bg-white rounded-[32px] border border-[#F0D5CC] p-6 sm:p-10 shadow-xs space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FF758F] text-white font-serif text-2xl mb-1 shadow-xs font-bold">
            M
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif italic text-[#1A1A1A] font-bold">
            Crear Cuenta
          </h1>
          <p class="text-xs text-[#1A1A1A]/80 font-medium">
            Regístrate en Mochi. y disfruta de envíos exclusivos
          </p>
        </div>

        @if (success()) {
          <div class="p-6 rounded-2xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] text-center space-y-3">
            <div class="text-3xl">✅</div>
            <h2 class="text-lg font-serif italic font-bold">¡Cuenta creada con éxito!</h2>
            <p class="text-xs leading-relaxed font-medium">
              Tu cuenta ha sido registrada en Supabase. Ya puedes iniciar sesión y ordenar tus mochis artesanales favoritos.
            </p>
            <div class="pt-2">
              <a routerLink="/login" class="inline-block px-6 py-2.5 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] text-xs font-bold uppercase tracking-wider shadow-xs transition-colors">
                Ir a Iniciar Sesión
              </a>
            </div>
          </div>
        } @else {
          <!-- Error Message Alert -->
          @if (error()) {
            <div class="p-3.5 rounded-2xl bg-[#FFE4E6] border border-[#FDA4AF] text-[#9F1239] text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ error() }}</span>
            </div>
          }

          <!-- Register Form -->
          <form (submit)="onSubmit($event)" class="space-y-4 text-xs">
            <div>
              <label for="nombre" class="font-bold text-[#1A1A1A] block mb-1 uppercase tracking-wider text-[11px]">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                [value]="nombreCompleto()"
                (input)="nombreCompleto.set($any($event.target).value)"
                name="nombre_completo"
                placeholder="Juan Pérez"
                required
                class="w-full px-4 py-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#FF758F] transition-colors font-medium"
              />
            </div>

            <div>
              <label for="email" class="font-bold text-[#1A1A1A] block mb-1 uppercase tracking-wider text-[11px]">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                name="email"
                placeholder="tu@email.com"
                required
                class="w-full px-4 py-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#FF758F] transition-colors font-medium"
              />
            </div>

            <div>
              <label for="telefono" class="font-bold text-[#1A1A1A] block mb-1 uppercase tracking-wider text-[11px]">
                Teléfono Celular (Opcional)
              </label>
              <input
                type="tel"
                id="telefono"
                [value]="telefono()"
                (input)="telefono.set($any($event.target).value)"
                name="telefono"
                placeholder="+57 300 123 4567"
                class="w-full px-4 py-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#FF758F] transition-colors font-medium"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="password" class="font-bold text-[#1A1A1A] block mb-1 uppercase tracking-wider text-[11px]">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  [value]="password()"
                  (input)="password.set($any($event.target).value)"
                  name="password"
                  placeholder="Mín. 6 caracteres"
                  required
                  minlength="6"
                  class="w-full px-4 py-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#FF758F] transition-colors font-medium"
                />
              </div>

              <div>
                <label for="confirmPassword" class="font-bold text-[#1A1A1A] block mb-1 uppercase tracking-wider text-[11px]">
                  Confirmar *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  [value]="confirmPassword()"
                  (input)="confirmPassword.set($any($event.target).value)"
                  name="confirmPassword"
                  placeholder="Repite contraseña"
                  required
                  class="w-full px-4 py-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#FF758F] transition-colors font-medium"
                />
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="acceptTerms"
                [checked]="acceptTerms()"
                (change)="acceptTerms.set($any($event.target).checked)"
                name="acceptTerms"
                class="w-4 h-4 rounded text-[#FF758F] focus:ring-0 cursor-pointer accent-[#FF758F]"
              />
              <label for="acceptTerms" class="text-xs text-[#1A1A1A]/80 cursor-pointer font-medium">
                Acepto los <a routerLink="/contacto" class="underline font-medium text-[#FF758F]">términos y condiciones</a>
              </label>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3.5 rounded-full bg-[#FF758F] hover:bg-[#FF5277] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xs mt-2 cursor-pointer">
              {{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
            </button>
          </form>

          <!-- Links -->
          <div class="text-center pt-3 border-t border-[#F0D5CC] text-xs">
            <span class="text-[#1A1A1A]/80 font-medium">¿Ya tienes una cuenta?</span>
            <a routerLink="/login" class="ml-1 text-[#FF758F] font-bold hover:underline">
              Inicia sesión aquí
            </a>
          </div>
        }

      </div>
    </div>
  `
})
export class RegisterComponent {
  private supabase = inject(SupabaseService);

  nombreCompleto = signal('');
  email = signal('');
  telefono = signal('');
  password = signal('');
  confirmPassword = signal('');
  acceptTerms = signal(false);

  error = signal('');
  loading = signal(false);
  success = signal(false);

  async onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set('');

    // Validaciones
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden.');
      this.loading.set(false);
      return;
    }

    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener mínimo 6 caracteres.');
      this.loading.set(false);
      return;
    }

    if (!this.acceptTerms()) {
      this.error.set('Debes aceptar los términos y condiciones para registrarte.');
      this.loading.set(false);
      return;
    }

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
      this.error.set(error.message);
    } else {
      this.success.set(true);
    }

    this.loading.set(false);
  }
}
