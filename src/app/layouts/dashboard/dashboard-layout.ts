import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { OrderNotificationComponent } from '../../components/order-notification/order-notification';
import { ToastNotificationComponent } from '../../components/toast-notification/toast-notification';
import { SupabaseService } from '../../services/supabase.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { NotificationService } from '../../services/notification.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SidebarComponent, OrderNotificationComponent, ToastNotificationComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="h-screen flex overflow-hidden" style="background: #2E0A16">
      <!-- Sidebar -->
      <app-sidebar [open]="sidebarOpen" (close)="sidebarOpen.set(false)" />

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <!-- Top Header -->
        <header class="h-16 flex items-center px-4 sm:px-6 shrink-0 z-30" style="background: #3A0A1C; border-bottom: 1px solid rgba(255,255,255,0.1)">
          <!-- Left: hamburger (mobile) -->
          <button (click)="sidebarOpen.set(!sidebarOpen())" class="lg:hidden p-2 -ml-2 rounded-xl transition-colors hover:opacity-70">
            <span class="material-icons" style="color: #FDF8F4">menu</span>
          </button>

          <!-- Right: title + actions -->
          <div class="flex items-center gap-2 ml-auto">
            <h2 class="text-sm font-bold hidden sm:block" style="color: #FDF8F4">Panel de Control</h2>

            <!-- Notification Bell -->
            <app-order-notification />

            <!-- Ver como cliente -->
            <a routerLink="/"
              class="flex items-center gap-1.5 p-2 transition-colors hover:opacity-70">
              <span class="material-icons text-xl" style="color: #FDF8F4">storefront</span>
              <span class="hidden sm:inline text-[11px] font-bold uppercase tracking-wider" style="color: #FDF8F4">Ver Tienda</span>
            </a>

            <!-- Logout -->
            <button (click)="onLogout()"
              class="flex items-center gap-1.5 p-2 transition-colors hover:opacity-70">
              <span class="material-icons text-xl" style="color: #EF5350">logout</span>
              <span class="hidden sm:inline text-[11px] font-bold uppercase tracking-wider" style="color: #EF5350">Salir</span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto" style="background: #FDF8F4">
          <router-outlet />
        </main>
      </div>
    </div>

    <!-- Toast Notifications (global) -->
    <app-toast-notification />
  `
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private dataService = inject(MochiDataService);
  private notificationService = inject(NotificationService);
  private cartService = inject(CartService);
  private platformId = inject(PLATFORM_ID);

  sidebarOpen = signal(false);

  constructor() {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      this.sidebarOpen.set(true);
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const user = this.supabase.activeUser();
      if (user) {
        this.notificationService.startListening(user.id);
      }
    }
  }

  ngOnDestroy() {
    this.notificationService.stopListening();
  }

  async onLogout() {
    this.notificationService.stopListening();
    await this.supabase.signOut();
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
