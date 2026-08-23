import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[80vh] bg-[#FDF8F4] p-4 sm:p-8">
      <div class="max-w-2xl mx-auto space-y-6">
        
        <h1 class="text-2xl font-serif italic text-[#590E2A] font-bold">Mi Perfil</h1>

        @if (user(); as u) {
          <!-- Profile Card -->
          <div class="bg-white rounded-3xl border border-[#E8D8D0] p-6 sm:p-8 shadow-sm space-y-6">
            
            <!-- Avatar & Name -->
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#D95578] flex items-center justify-center text-white text-2xl font-serif italic font-bold">
                {{ u.nombre_completo?.charAt(0) || '?' }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-[#590E2A]">{{ u.nombre_completo }}</h2>
                <p class="text-sm text-[#590E2A]/60">{{ u.email }}</p>
                <span class="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  [class]="u.rol === 'admin' ? 'bg-[#D95578] text-[#590E2A]' : u.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FDF8F4] text-[#590E2A]'">
                  {{ u.rol }}
                </span>
              </div>
            </div>

            <!-- Info Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-[#FDF8F4] rounded-2xl p-4">
                <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Teléfono</span>
                <p class="text-sm font-bold text-[#590E2A] mt-1">{{ u.telefono || 'No registrado' }}</p>
              </div>
            </div>

            <!-- Change Password -->
            <div class="bg-[#FDF8F4] rounded-2xl p-4 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="text-xs uppercase tracking-wider font-bold text-[#590E2A]/50">Cambiar Contraseña</h3>
                <button (click)="showPasswordForm.set(!showPasswordForm())" 
                  class="text-[#D95578] text-xs font-bold hover:underline">
                  {{ showPasswordForm() ? 'Cancelar' : 'Cambiar' }}
                </button>
              </div>

              @if (showPasswordForm()) {
                @if (passwordSuccess()) {
                  <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] text-[#004D40] text-xs font-medium">
                    ✅ Contraseña actualizada exitosamente.
                  </div>
                }

                @if (passwordError()) {
                  <div class="p-3 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-medium">
                    ⚠️ {{ passwordError() }}
                  </div>
                }

                <form (submit)="onPasswordChange($event)" class="space-y-3">
                  <input
                    type="password"
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    [value]="newPassword()"
                    (input)="newPassword.set($any($event.target).value)"
                    required
                    minlength="6"
                    class="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    [value]="confirmPassword()"
                    (input)="confirmPassword.set($any($event.target).value)"
                    required
                    minlength="6"
                    class="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors"
                  />
                  <button type="submit" [disabled]="passwordLoading()"
                    class="w-full py-2.5 rounded-xl bg-[#590E2A] hover:bg-[#3A0A1C] disabled:opacity-50 text-[#FDF8F4] font-bold text-xs uppercase tracking-widest transition-colors">
                    {{ passwordLoading() ? 'Guardando...' : 'Guardar Contraseña' }}
                  </button>
                </form>
              }
            </div>

            <!-- Quick Actions -->
            <div class="space-y-2">
              <h3 class="text-xs uppercase tracking-wider font-bold text-[#590E2A]/50">Accesos Rápidos</h3>
              
              <a routerLink="/cliente/dashboard" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FDF8F4] transition-colors">
                <span class="material-icons text-[#D95578]">shopping_bag</span>
                <div>
                  <p class="text-sm font-bold text-[#590E2A]">Mis Pedidos</p>
                  <p class="text-[11px] text-[#590E2A]/60">Historial y estado de pedidos</p>
                </div>
              </a>

              <a routerLink="/productos" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FDF8F4] transition-colors">
                <span class="material-icons text-[#D95578]">restaurant</span>
                <div>
                  <p class="text-sm font-bold text-[#590E2A]">Ver Catálogo</p>
                  <p class="text-[11px] text-[#590E2A]/60">Explorar productos disponibles</p>
                </div>
              </a>

              @if (u.rol === 'admin') {
                <a routerLink="/admin" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FFF3E0] transition-colors">
                  <span class="material-icons text-[#FB923C]">admin_panel_settings</span>
                  <div>
                    <p class="text-sm font-bold text-[#7C2D12]">Panel Admin</p>
                    <p class="text-[11px] text-[#7C2D12]/60">Gestión completa del sistema</p>
                  </div>
                </a>
              }

              @if (u.rol === 'admin' || u.rol === 'empleado') {
                <a routerLink="/empleado" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#E0F2F1] transition-colors">
                  <span class="material-icons text-[#4DB6AC]">point_of_sale</span>
                  <div>
                    <p class="text-sm font-bold text-[#133834]">Punto de Venta</p>
                    <p class="text-[11px] text-[#133834]/60">Realizar ventas en caja</p>
                  </div>
                </a>
              }
            </div>

            <!-- Logout -->
            <button (click)="onLogout()" class="w-full py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors">
              Cerrar Sesión
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class ProfileComponent {
  private supabase = inject(SupabaseService);
  private dataService = inject(MochiDataService);
  private cartService = inject(CartService);
  private router = inject(Router);

  user = this.supabase.activeUser;

  showPasswordForm = signal(false);
  newPassword = signal('');
  confirmPassword = signal('');
  passwordError = signal('');
  passwordSuccess = signal(false);
  passwordLoading = signal(false);

  async onPasswordChange(event: Event) {
    event.preventDefault();
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    if (this.newPassword().length < 6) {
      this.passwordError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }

    this.passwordLoading.set(true);

    const { error } = await this.supabase.updatePassword(this.newPassword());

    if (error) {
      this.passwordError.set(error.message);
    } else {
      this.passwordSuccess.set(true);
      this.newPassword.set('');
      this.confirmPassword.set('');
      setTimeout(() => {
        this.showPasswordForm.set(false);
        this.passwordSuccess.set(false);
      }, 2500);
    }

    this.passwordLoading.set(false);
  }

  async onLogout() {
    await this.supabase.signOut();
    this.dataService.favorites.set([]);
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
