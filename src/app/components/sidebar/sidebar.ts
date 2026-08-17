import { Component, inject, signal, computed, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- Overlay mobile -->
    @if (open()) {
      <div class="fixed inset-0 bg-black/40 z-40 lg:hidden" (click)="close.emit()"></div>
    }

    <!-- Sidebar -->
    <aside
      [class]="open()
        ? 'fixed inset-y-0 left-0 z-50 w-64 bg-[#FFF0EA] flex flex-col transform transition-transform duration-300 translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto'
        : 'fixed inset-y-0 left-0 z-50 w-64 bg-[#FFF0EA] flex flex-col transform -translate-x-full transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto'">

      <!-- Logo -->
      <div class="h-16 flex items-center gap-2 px-5 border-b border-[#F0D5CC] shrink-0">
        <button (click)="close.emit()" class="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[#F5E0D8] text-[#1A1A1A] transition-colors">
          <span class="material-icons text-xl">menu_open</span>
        </button>
        <div class="w-8 h-8 rounded-full bg-[#FF758F] flex items-center justify-center text-white text-sm font-serif italic font-bold">
          M
        </div>
        <div>
          <span class="text-lg font-serif italic text-[#1A1A1A] block leading-none">Mochi.</span>
          <span class="text-[8px] uppercase tracking-widest text-[#1A1A1A]/50 font-bold">Panel de Control</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        @for (item of navItems(); track item.label) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-[#FF758F]/10 text-[#FF758F]"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            (click)="close.emit()"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-[#1A1A1A]/60 hover:bg-[#FF758F]/5 hover:text-[#1A1A1A]">
            <span class="material-icons text-[20px]">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User Footer -->
      <div class="border-t border-[#F0D5CC] p-4 shrink-0">
        <!-- User Info -->
        <div class="flex items-center gap-3 mb-3">
          <div class="w-9 h-9 rounded-full bg-[#FF758F] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {{ userName().charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-[#1A1A1A] truncate">{{ userName() }}</p>
            <p class="text-[10px] text-[#1A1A1A]/50 uppercase">{{ userRole() }}</p>
          </div>
        </div>

        <!-- Mi Perfil -->
        <a (click)="goToPerfil(); close.emit()" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#1A1A1A]/60 hover:bg-[#FF758F]/5 hover:text-[#1A1A1A] transition-all cursor-pointer mb-1">
          <span class="material-icons text-[18px]">person</span>
          <span>Mi Perfil</span>
        </a>

        <!-- Ver Tienda -->
        <a routerLink="/" (click)="close.emit()" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#1A1A1A]/60 hover:bg-[#FF758F]/5 hover:text-[#1A1A1A] transition-all cursor-pointer mb-1">
          <span class="material-icons text-[18px]">storefront</span>
          <span>Ver Tienda</span>
        </a>

        <!-- Cerrar Sesión -->
        <button (click)="onLogout()" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all w-full cursor-pointer">
          <span class="material-icons text-[18px]">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() open = signal(true);
  @Output() close = new EventEmitter<void>();

  private supabase = inject(SupabaseService);
  private router = inject(Router);

  userRole = computed(() => this.supabase.activeUser()?.rol ?? 'cliente');
  userName = computed(() => this.supabase.activeUser()?.nombre_completo ?? '');

  perfilRoute = computed(() => {
    const role = this.userRole();
    return role === 'admin' ? '/admin/perfil' : '/empleado/perfil';
  });

  navItems = computed(() => {
    const role = this.userRole();
    const items: { route: string; icon: string; label: string; exact: boolean }[] = [];

    if (role === 'admin') {
      items.push(
        { route: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true },
        { route: '/admin/productos', icon: 'inventory_2', label: 'Productos', exact: false },
        { route: '/admin/pedidos', icon: 'shopping_cart', label: 'Pedidos', exact: false },
        { route: '/admin/detalles', icon: 'receipt_long', label: 'Detalles Pedido', exact: false },
        { route: '/admin/usuarios', icon: 'people', label: 'Usuarios', exact: false },
        { route: '/admin/inventario', icon: 'warehouse', label: 'Inventario', exact: false },
        { route: '/admin/blog', icon: 'article', label: 'Blog', exact: false },
        { route: '/admin/diseno', icon: 'palette', label: 'Diseño', exact: false },
      );
    }

    if (role === 'empleado') {
      items.push(
        { route: '/empleado', icon: 'point_of_sale', label: 'Punto de Venta', exact: true },
      );
    }

    return items;
  });

  goToPerfil() {
    this.router.navigate([this.perfilRoute()]);
  }

  async onLogout() {
    this.close.emit();
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
