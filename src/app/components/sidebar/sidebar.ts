import { Component, inject, signal, computed, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
import { SidebarStateService } from '../../services/sidebar-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- Overlay mobile -->
    @if (open() && isMobile()) {
      <div class="fixed inset-0 bg-black/40 z-40" (click)="close.emit()"></div>
    }

    <!-- Sidebar -->
    <aside
      [class]="asideClasses()"
      style="background: #3A0A1C; overflow: hidden;">

      <!-- Logo -->
      <div class="h-16 flex items-center gap-2 px-5 shrink-0" style="border-bottom: 1px solid rgba(255,255,255,0.1)">
        @if (isMobile()) {
          <button (click)="close.emit()" class="lg:hidden p-2 -ml-2 rounded-xl transition-colors hover:opacity-70">
            <span class="material-icons text-xl" style="color: #FDF8F4">menu_open</span>
          </button>
        }
        @if (!isMobile()) {
          <button (click)="sidebarState.collapsed.set(!sidebarState.collapsed())" class="p-2 -ml-2 rounded-xl transition-colors hover:opacity-70">
            <span class="material-icons text-xl" style="color: #FDF8F4">{{ sidebarState.collapsed() ? 'chevron_right' : 'chevron_left' }}</span>
          </button>
        }
        @if (!isCollapsed()) {
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-serif italic font-bold shrink-0" style="background: #D95578">
            M
          </div>
          <div>
            <span class="text-lg font-serif italic block leading-none" style="color: #FDF8F4">Mochi.</span>
            <span class="text-[8px] uppercase tracking-widest font-bold" style="color: rgba(253,248,244,0.5)">Panel de Control</span>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
        @for (item of navItems(); track item.label) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active-nav-item"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            (click)="onNavClick()"
            [class]="isCollapsed() ? 'nav-link-collapsed' : 'nav-link-expanded'">
            <span class="material-icons text-[20px] shrink-0">{{ item.icon }}</span>
            @if (!isCollapsed()) {
              <span class="truncate">{{ item.label }}</span>
            }
            @if (isCollapsed()) {
              <span class="tooltip-text">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- User Footer -->
      <div class="shrink-0" style="border-top: 1px solid rgba(255,255,255,0.1)">
        @if (!isCollapsed()) {
          <div class="p-4">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style="background: #D95578">
                {{ userName().charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold truncate" style="color: #FDF8F4">{{ userName() }}</p>
                <p class="text-[10px] uppercase" style="color: rgba(253,248,244,0.5)">{{ userRole() }}</p>
              </div>
            </div>

            <a (click)="goToPerfil(); onNavClick()" class="sidebar-link flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer mb-1">
              <span class="material-icons text-[18px]">person</span>
              <span>Mi Perfil</span>
            </a>

            <a routerLink="/" (click)="onNavClick()" class="sidebar-link flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer mb-1">
              <span class="material-icons text-[18px]">storefront</span>
              <span>Ver Tienda</span>
            </a>

            <button (click)="onLogout()" class="sidebar-link-logout flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all w-full cursor-pointer">
              <span class="material-icons text-[18px]">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        } @else {
          <div class="p-2 space-y-1">
            <button (click)="goToPerfil()" class="w-full flex items-center justify-center p-2.5 rounded-xl transition-colors tooltip-parent sidebar-link-collapsed" title="Mi Perfil">
              <span class="material-icons text-[20px]">person</span>
              <span class="tooltip-text">Mi Perfil</span>
            </button>
            <a routerLink="/" class="w-full flex items-center justify-center p-2.5 rounded-xl transition-colors tooltip-parent sidebar-link-collapsed" title="Ver Tienda">
              <span class="material-icons text-[20px]">storefront</span>
              <span class="tooltip-text">Ver Tienda</span>
            </a>
            <button (click)="onLogout()" class="w-full flex items-center justify-center p-2.5 rounded-xl transition-colors tooltip-parent sidebar-link-logout-collapsed" title="Cerrar Sesión">
              <span class="material-icons text-[20px]">logout</span>
              <span class="tooltip-text">Cerrar Sesión</span>
            </button>
          </div>
        }
      </div>
    </aside>
  `,
  styles: [`
    :host ::ng-deep .active-nav-item {
      background: rgba(217, 85, 120, 0.2) !important;
      color: #FDF8F4 !important;
      font-weight: 700;
    }
    .nav-link-expanded {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
      color: rgba(253, 248, 244, 0.6);
    }
    .nav-link-expanded:hover {
      background: rgba(217, 85, 120, 0.15);
      color: #FDF8F4;
    }
    .nav-link-collapsed {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 0;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s;
      position: relative;
      color: rgba(253, 248, 244, 0.6);
    }
    .nav-link-collapsed:hover {
      background: rgba(217, 85, 120, 0.15);
      color: #FDF8F4;
    }
    .sidebar-link {
      color: rgba(253, 248, 244, 0.6);
    }
    .sidebar-link:hover {
      background: rgba(217, 85, 120, 0.15);
      color: #FDF8F4;
    }
    .sidebar-link-collapsed {
      color: rgba(253, 248, 244, 0.6);
    }
    .sidebar-link-collapsed:hover {
      background: rgba(217, 85, 120, 0.15);
      color: #FDF8F4;
    }
    .sidebar-link-logout {
      color: rgba(255, 150, 150, 0.7);
    }
    .sidebar-link-logout:hover {
      background: rgba(229, 57, 53, 0.15);
      color: #EF5350;
    }
    .sidebar-link-logout-collapsed {
      color: rgba(255, 150, 150, 0.7);
    }
    .sidebar-link-logout-collapsed:hover {
      background: rgba(229, 57, 53, 0.15);
      color: #EF5350;
    }
    .tooltip-parent {
      position: relative;
    }
    .tooltip-text {
      display: none;
      position: absolute;
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
      padding: 4px 10px;
      background: #FDF8F4;
      color: #590E2A;
      font-size: 11px;
      font-weight: 700;
      border-radius: 8px;
      white-space: nowrap;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      pointer-events: none;
    }
    .tooltip-parent:hover .tooltip-text {
      display: block;
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() open = signal(true);
  @Output() close = new EventEmitter<void>();

  isMobile = signal(false);
  private resizeHandler?: () => void;

  private supabase = inject(SupabaseService);
  private dataService = inject(MochiDataService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  sidebarState = inject(SidebarStateService);

  userRole = computed(() => this.supabase.activeUser()?.rol ?? 'cliente');
  userName = computed(() => this.supabase.activeUser()?.nombre_completo ?? '');

  perfilRoute = computed(() => '/perfil');

  isCollapsed = computed(() => {
    return !this.isMobile() && this.sidebarState.collapsed();
  });

  asideClasses = computed(() => {
    const mobile = this.isMobile();
    const collapsed = this.isCollapsed();

    if (mobile) {
      return this.open()
        ? 'fixed inset-y-0 left-0 z-50 w-56 flex flex-col transform transition-transform duration-300 translate-x-0'
        : 'fixed inset-y-0 left-0 z-50 w-56 flex flex-col transform -translate-x-full transition-transform duration-300';
    }

    return collapsed
      ? 'sticky top-0 h-screen flex flex-col transition-all duration-300 w-[60px] shrink-0'
      : 'sticky top-0 h-screen flex flex-col transition-all duration-300 w-56 shrink-0';
  });

  navItems = computed(() => {
    const role = this.userRole();
    const items: { route: string; icon: string; label: string; exact: boolean }[] = [];

    if (role === 'admin') {
      items.push(
        { route: '/admin/detalles', icon: 'point_of_sale', label: 'Ventas', exact: true },
        { route: '/admin/productos', icon: 'inventory_2', label: 'Productos', exact: false },
        { route: '/admin/pedidos', icon: 'shopping_cart', label: 'Pedidos', exact: false },
        { route: '/admin/usuarios', icon: 'people', label: 'Usuarios', exact: false },
      );
    }

    if (role === 'empleado') {
      items.push(
        { route: '/empleado', icon: 'point_of_sale', label: 'Punto de Venta', exact: true },
        { route: '/empleado/pedidos', icon: 'shopping_cart', label: 'Pedidos Online', exact: false },
      );
    }

    return items;
  });

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      this.resizeHandler = () => this.checkMobile();
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }

  private checkMobile() {
    this.isMobile.set(window.innerWidth < 1024);
  }

  onNavClick() {
    if (this.isMobile()) {
      this.close.emit();
    }
  }

  goToPerfil() {
    this.router.navigate([this.perfilRoute()]);
  }

  async onLogout() {
    this.close.emit();
    await this.supabase.signOut();
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
