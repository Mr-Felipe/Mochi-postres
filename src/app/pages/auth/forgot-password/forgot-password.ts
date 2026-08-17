import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAF7F2]">
      <div class="w-full max-w-md bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-10 shadow-xs space-y-6">
        
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD6E0] border border-[#EBE3D5] text-[#4A3F35] font-serif text-2xl mb-1 shadow-xs">
            🔑
          </div>
          <h1 class="text-2xl sm:text-3xl font-serif italic text-[#4A3F35]">
            Recuperar Contraseña
          </h1>
          <p class="text-xs text-[#4A3F35]/70">
            Ingresa tu correo electrónico y te enviaremos un enlace de recuperación de Supabase Auth
          </p>
        </div>

        @if (sent()) {
          <div class="p-6 rounded-2xl bg-[#E0F2F1] border border-[#B2DFDB] text-[#004D40] text-center space-y-3">
            <div class="text-3xl">📬</div>
            <h2 class="text-lg font-serif italic font-bold">Correo Enviado</h2>
            <p class="text-xs leading-relaxed">
              Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{{ email() }}</strong>.
            </p>
            <div class="pt-2">
              <a routerLink="/login" class="inline-block px-6 py-2.5 rounded-full bg-[#4A3F35] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#362D26]">
                Volver a Iniciar Sesión
              </a>
            </div>
          </div>
        } @else {
          <!-- Error Message Alert -->
          @if (error()) {
            <div class="p-3.5 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ error() }}</span>
            </div>
          }

          <!-- Form -->
          <form (submit)="onSubmit($event)" class="space-y-4 text-xs">
            <div>
              <label for="email" class="font-bold text-[#4A3F35] block mb-1 uppercase tracking-wider text-[11px]">
                Correo Electrónico Registrado *
              </label>
              <input
                type="email"
                id="email"
                [value]="email()"
                (input)="email.set($any($event.target).value)"
                name="email"
                placeholder="tu@email.com"
                required
                class="w-full px-4 py-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-xs focus:outline-none focus:border-[#4A3F35] transition-colors"
              />
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3.5 rounded-full bg-[#4A3F35] hover:bg-[#362D26] disabled:opacity-50 text-[#FAF7F2] font-bold text-xs uppercase tracking-widest transition-all shadow-xs mt-2">
              {{ loading() ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación' }}
            </button>
          </form>

          <!-- Links -->
          <div class="text-center pt-3 border-t border-[#EBE3D5] text-xs">
            <a routerLink="/login" class="text-[#4A3F35] font-bold hover:underline">
              ← Volver al inicio de sesión
            </a>
          </div>
        }

      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private supabase = inject(SupabaseService);

  email = signal('');
  error = signal('');
  loading = signal(false);
  sent = signal(false);

  async onSubmit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set('');

    const { error } = await this.supabase.resetPasswordForEmail(this.email());

    if (error) {
      this.error.set(error.message);
    } else {
      this.sent.set(true);
    }

    this.loading.set(false);
  }
}
