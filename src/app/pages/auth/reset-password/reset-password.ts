import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-[#FAF7F2]">
      <div class="w-full max-w-md bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-10 shadow-xs space-y-6">
        
        @if (success()) {
          <!-- Success State -->
          <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E0F2F1] border border-[#B2DFDB] text-4xl mb-2 shadow-xs">
              ✅
            </div>
            <h1 class="text-2xl sm:text-3xl font-serif italic text-[#4A3F35]">
              Contraseña Actualizada
            </h1>
            <p class="text-xs text-[#4A3F35]/70 leading-relaxed">
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <a routerLink="/login" 
              class="inline-block px-8 py-3 rounded-full bg-[#4A3F35] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#362D26] transition-colors">
              Iniciar Sesión
            </a>
          </div>
        } @else if (loading()) {
          <!-- Loading State -->
          <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFD6E0] border border-[#EBE3D5] text-4xl mb-2 shadow-xs animate-pulse">
              🔑
            </div>
            <h1 class="text-2xl font-serif italic text-[#4A3F35]">
              Verificando enlace...
            </h1>
            <p class="text-xs text-[#4A3F35]/70">
              Por favor espera un momento.
            </p>
          </div>
        } @else if (error()) {
          <!-- Error State -->
          <div class="text-center space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFEBEE] border border-[#FFCDD2] text-4xl mb-2 shadow-xs">
              ❌
            </div>
            <h1 class="text-2xl font-serif italic text-[#4A3F35]">
              Enlace inválido o expirado
            </h1>
            <p class="text-xs text-[#4A3F35]/70 leading-relaxed">
              {{ error() }}
            </p>
            <a routerLink="/recuperar" 
              class="inline-block px-8 py-3 rounded-full bg-[#4A3F35] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider shadow-xs hover:bg-[#362D26] transition-colors">
              Solicitar nuevo enlace
            </a>
          </div>
        } @else {
          <!-- Password Reset Form -->
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FFD6E0] border border-[#EBE3D5] text-[#4A3F35] font-serif text-2xl mb-1 shadow-xs">
              🔑
            </div>
            <h1 class="text-2xl sm:text-3xl font-serif italic text-[#4A3F35]">
              Nueva Contraseña
            </h1>
            <p class="text-xs text-[#4A3F35]/70">
              Ingresa tu nueva contraseña para tu cuenta.
            </p>
          </div>

          @if (formError()) {
            <div class="p-3.5 rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{{ formError() }}</span>
            </div>
          }

          <form (submit)="onSubmit($event)" class="space-y-4 text-xs">
            <div>
              <label for="new-password" class="font-bold text-[#4A3F35] block mb-1 uppercase tracking-wider text-[11px]">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                id="new-password"
                [value]="newPassword()"
                (input)="newPassword.set($any($event.target).value)"
                placeholder="Mínimo 6 caracteres"
                required
                minlength="6"
                class="w-full px-4 py-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-xs focus:outline-none focus:border-[#4A3F35] transition-colors"
              />
            </div>

            <div>
              <label for="confirm-password" class="font-bold text-[#4A3F35] block mb-1 uppercase tracking-wider text-[11px]">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                id="confirm-password"
                [value]="confirmPassword()"
                (input)="confirmPassword.set($any($event.target).value)"
                placeholder="Repite tu contraseña"
                required
                minlength="6"
                class="w-full px-4 py-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-xs focus:outline-none focus:border-[#4A3F35] transition-colors"
              />
            </div>

            <button
              type="submit"
              [disabled]="submitting()"
              class="w-full py-3.5 rounded-full bg-[#4A3F35] hover:bg-[#362D26] disabled:opacity-50 text-[#FAF7F2] font-bold text-xs uppercase tracking-widest transition-all shadow-xs mt-2">
              {{ submitting() ? 'Guardando...' : 'Guardar Nueva Contraseña' }}
            </button>
          </form>
        }

      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  newPassword = signal('');
  confirmPassword = signal('');
  formError = signal('');
  error = signal('');
  loading = signal(true);
  submitting = signal(false);
  success = signal(false);

  async ngOnInit() {
    // Supabase processes the hash fragment and establishes the session
    // We just need to wait a moment and check if the user is now authenticated
    setTimeout(async () => {
      const { data } = await this.supabase.getSession();
      if (data?.session) {
        this.loading.set(false);
      } else {
        this.error.set('No se pudo verificar el enlace. Intenta solicitar uno nuevo.');
        this.loading.set(false);
      }
    }, 1500);
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.formError.set('');

    if (this.newPassword().length < 6) {
      this.formError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.formError.set('Las contraseñas no coinciden.');
      return;
    }

    this.submitting.set(true);

    const { error } = await this.supabase.updatePassword(this.newPassword());

    if (error) {
      this.formError.set(error.message);
    } else {
      this.success.set(true);
    }

    this.submitting.set(false);
  }
}
