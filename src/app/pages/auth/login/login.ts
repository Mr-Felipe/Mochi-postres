import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-login',
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
            Iniciar Sesión
          </h1>
          <p class="text-xs text-[#1A1A1A]/80 font-medium">
            Accede a tu cuenta de Mochi.
          </p>
        </div>

        <!-- Error Message Alert -->
        @if (error()) {
          <div class="p-3.5 rounded-2xl bg-[#FFE4E6] border border-[#FDA4AF] text-[#9F1239] text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ error() }}</span>
          </div>
        }

        <!-- Login Form -->
        <form (submit)="onSubmit($event)" class="space-y-4 text-xs">
          <div>
            <label for="email" class="font-bold text-[#1A1A1A] block mb-1.5 uppercase tracking-wider text-[11px]">
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
            <div class="flex justify-between items-center mb-1.5">
              <label for="password" class="font-bold text-[#1A1A1A] uppercase tracking-wider text-[11px]">
                Contraseña *
              </label>
              <a routerLink="/recuperar" class="text-[11px] text-[#FF758F] hover:text-[#E63956] font-medium hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type="password"
              id="password"
              [value]="password()"
              (input)="password.set($any($event.target).value)"
              name="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] text-xs focus:outline-none focus:border-[#FF758F] transition-colors font-medium"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3.5 rounded-full bg-[#FF758F] hover:bg-[#FF5277] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xs mt-2 cursor-pointer">
            {{ loading() ? 'Iniciando Sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Quick Access Demo Users -->
        <div class="pt-4 border-t border-[#F0D5CC] space-y-2">
          <span class="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A]/60 block text-center">
            Acceso Rápido de Prueba (Demo Supabase)
          </span>
          <div class="grid grid-cols-3 gap-2 text-[10px]">
            <button 
              type="button" 
              (click)="fillDemo('admin@mochishop.co', 'Mochi.#2026')" 
              class="py-2 px-1 rounded-xl bg-[#FDF5F0] hover:bg-[#FFA0B4]/30 border border-[#F0D5CC] hover:border-[#FF758F] text-[#1A1A1A] font-bold transition-colors text-center cursor-pointer">
              ⚙️ Admin
            </button>
            <button 
              type="button" 
              (click)="fillDemo('neider@mochishop.co', 'Mochi.#2026')" 
              class="py-2 px-1 rounded-xl bg-[#D1FAE5] hover:bg-[#A7F3D0] border border-[#A7F3D0] text-[#065F46] font-bold transition-colors text-center cursor-pointer">
              🛒 Empleado
            </button>
            <button 
              type="button" 
              (click)="fillDemo('cliente@ejemplo.com', 'Mochi.#2026')" 
              class="py-2 px-1 rounded-xl bg-[#FDF5F0] hover:bg-[#FFA0B4]/30 border border-[#F0D5CC] hover:border-[#FF758F] text-[#1A1A1A] font-bold transition-colors text-center cursor-pointer">
              👤 Cliente
            </button>
          </div>
        </div>

        <!-- Links -->
        <div class="text-center pt-2 border-t border-[#F0D5CC] text-xs">
          <span class="text-[#1A1A1A]/80 font-medium">¿No tienes cuenta aún?</span>
          <a routerLink="/registro" class="ml-1 text-[#FF758F] font-bold hover:underline">
            Regístrate aquí
          </a>
        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = signal('cliente@ejemplo.com');
  password = signal('Mochi.#2026');
  error = signal('');
  loading = signal(false);

  fillDemo(demoEmail: string, demoPass: string) {
    this.email.set(demoEmail);
    this.password.set(demoPass);
    this.error.set('');
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set('');

    const { data, error } = await this.supabase.signIn(this.email(), this.password());

    if (error) {
      this.error.set(error.message);
      this.loading.set(false);
      return;
    }

    // Redirigir según el rol (lee de la tabla usuarios via activeUser)
    const rol = this.supabase.activeUser()?.rol ?? 'cliente';

    if (rol === 'admin') {
      this.router.navigateByUrl('/admin');
    } else if (rol === 'empleado') {
      this.router.navigateByUrl('/empleado');
    } else {
      this.router.navigate(['/cliente/dashboard']);
    }

    this.loading.set(false);
  }
}
