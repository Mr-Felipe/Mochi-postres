import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SidebarComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="min-h-screen flex bg-[#FDF5F0]">
      <!-- Sidebar -->
      <app-sidebar [open]="sidebarOpen" (close)="sidebarOpen.set(false)" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Top Header -->
        <header class="h-16 bg-white border-b border-[#F0D5CC] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <!-- Left: hamburger (mobile) -->
          <button (click)="sidebarOpen.set(!sidebarOpen())" class="lg:hidden p-2 -ml-2 rounded-xl hover:bg-[#FDF5F0] transition-colors">
            <span class="material-icons text-[#1A1A1A]">menu</span>
          </button>

          <!-- Right: title + actions -->
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-[#1A1A1A] hidden sm:block">Panel de Control</h2>

            <!-- Ver como cliente -->
            <a routerLink="/"
              class="flex items-center gap-1.5 p-2 text-[#1A1A1A] hover:text-[#FF758F] transition-colors">
              <span class="material-icons text-xl">storefront</span>
              <span class="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Ver Tienda</span>
            </a>

            <!-- Logout -->
            <button (click)="onLogout()"
              class="flex items-center gap-1.5 p-2 text-red-500 hover:text-red-700 transition-colors">
              <span class="material-icons text-xl">logout</span>
              <span class="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Salir</span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class DashboardLayoutComponent {
  private router = inject(Router);
  private supabase = inject(SupabaseService);

  sidebarOpen = signal(false);

  constructor() {
    // En desktop, abrir sidebar por defecto
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      this.sidebarOpen.set(true);
    }
  }

  async onLogout() {
    await this.supabase.signOut();
    this.router.navigate(['/']);
  }
}
