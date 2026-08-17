import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[80vh] bg-[#FDF5F0] p-4 sm:p-8">
      <div class="max-w-2xl mx-auto space-y-6">
        
        <h1 class="text-2xl font-serif italic text-[#1A1A1A] font-bold">Mi Perfil</h1>

        @if (user(); as u) {
          <!-- Profile Card -->
          <div class="bg-white rounded-3xl border border-[#F0D5CC] p-6 sm:p-8 shadow-sm space-y-6">
            
            <!-- Avatar & Name -->
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#FF758F] flex items-center justify-center text-white text-2xl font-serif italic font-bold">
                {{ u.nombre_completo?.charAt(0) || '?' }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-[#1A1A1A]">{{ u.nombre_completo }}</h2>
                <p class="text-sm text-[#1A1A1A]/60">{{ u.email }}</p>
                <span class="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  [class]="u.rol === 'admin' ? 'bg-[#FFD6E0] text-[#4A3F35]' : u.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FAF7F2] text-[#4A3F35]'">
                  {{ u.rol }}
                </span>
              </div>
            </div>

            <!-- Info Fields -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-[#FDF5F0] rounded-2xl p-4">
                <span class="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/50">Teléfono</span>
                <p class="text-sm font-bold text-[#1A1A1A] mt-1">{{ u.telefono || 'No registrado' }}</p>
              </div>
              <div class="bg-[#FDF5F0] rounded-2xl p-4">
                <span class="text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/50">Sucursal</span>
                <p class="text-sm font-bold text-[#1A1A1A] mt-1">{{ u.id_sucursal ? 'Sucursal #' + u.id_sucursal : 'N/A' }}</p>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="space-y-2">
              <h3 class="text-xs uppercase tracking-wider font-bold text-[#1A1A1A]/50">Accesos Rápidos</h3>
              
              <a routerLink="/cliente/dashboard" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FDF5F0] transition-colors">
                <span class="material-icons text-[#FF758F]">shopping_bag</span>
                <div>
                  <p class="text-sm font-bold text-[#1A1A1A]">Mis Pedidos</p>
                  <p class="text-[11px] text-[#1A1A1A]/60">Historial y estado de pedidos</p>
                </div>
              </a>

              <a routerLink="/productos" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FDF5F0] transition-colors">
                <span class="material-icons text-[#FF758F]">restaurant</span>
                <div>
                  <p class="text-sm font-bold text-[#1A1A1A]">Ver Catálogo</p>
                  <p class="text-[11px] text-[#1A1A1A]/60">Explorar productos disponibles</p>
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
  private router = inject(Router);

  user = this.supabase.activeUser;

  async onLogout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
