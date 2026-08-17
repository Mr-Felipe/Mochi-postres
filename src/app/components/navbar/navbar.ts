import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <!-- Main Navigation Header -->
    <header class="fixed top-0 left-0 right-0 z-40 bg-[#FDF5F0]/95 backdrop-blur-md border-b border-[#F0D5CC] transition-all">
      <div class="w-full px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

        <!-- ====== MOBILE LAYOUT (md:hidden) ====== -->
        <!-- Left: Hamburger -->
        <button (click)="isMobileMenuOpen.set(true)" class="md:hidden p-2 -ml-2 rounded-xl text-[#1A1A1A] hover:bg-[#F5E0D8] focus:outline-none">
          <span class="material-icons text-2xl">menu</span>
        </button>

        <!-- Center: Logo -->
        <a routerLink="/" class="md:hidden flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-full bg-[#FF758F] border border-[#F0D5CC] flex items-center justify-center text-white text-sm font-serif italic group-hover:scale-105 transition-transform duration-300 shadow-sm">
            M
          </div>
          <span class="text-xl font-serif italic tracking-tighter text-[#1A1A1A] group-hover:opacity-80 transition-opacity">
            Mochi.
          </span>
        </a>

        <!-- Right: Actions -->
        <div class="flex items-center gap-1 md:hidden">
          @if (isLoggedIn()) {
            <!-- Perfil: dropdown -->
            <div class="relative">
              <button (click)="userMenuOpen.set(!userMenuOpen())" class="p-2 text-[#1A1A1A] hover:text-[#FF758F] transition-colors">
                <span class="material-icons text-xl">person</span>
              </button>

              @if (userMenuOpen()) {
                <div class="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-[#F0D5CC] shadow-lg py-2 z-50">
                  <div class="px-4 py-2 border-b border-[#F0D5CC]">
                    <p class="text-xs font-bold text-[#1A1A1A]">{{ userFullName() }}</p>
                    <p class="text-[10px] text-[#1A1A1A]/60">{{ userEmail() }}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      [class]="userRole() === 'admin' ? 'bg-[#FFD6E0] text-[#4A3F35]' : userRole() === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FAF7F2] text-[#4A3F35]'">
                      {{ userRole() }}
                    </span>
                  </div>
                  <a (click)="goToPanel()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#1A1A1A] hover:bg-[#FDF5F0] transition-colors cursor-pointer">
                    <span class="material-icons text-base">dashboard</span>
                    Mi Panel
                  </a>
                  @if (isEmpleadoOrAdmin()) {
                    <a routerLink="/empleado" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#133834] hover:bg-[#E0F2F1] transition-colors">
                      <span class="material-icons text-base">point_of_sale</span>
                      Ventas POS
                    </a>
                  }
                  @if (isAdmin()) {
                    <a routerLink="/admin" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#7C2D12] hover:bg-[#FFF3E0] transition-colors">
                      <span class="material-icons text-base">settings</span>
                      Admin Panel
                    </a>
                  }
                  <div class="border-t border-[#F0D5CC] mt-1 pt-1">
                    <button (click)="onLogout()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors w-full">
                      <span class="material-icons text-base">logout</span>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Admin: Tienda + Salir (solo iconos) -->
            @if (isAdmin()) {
              <a routerLink="/admin" class="p-2 text-[#7C2D12] hover:text-[#FDBA74] transition-colors">
                <span class="material-icons text-xl">storefront</span>
              </a>
            }
            @if (isEmpleadoOrAdmin()) {
              <a routerLink="/empleado" class="p-2 text-[#133834] hover:text-[#80CBC4] transition-colors">
                <span class="material-icons text-xl">point_of_sale</span>
              </a>
            }
          } @else {
            <a routerLink="/login" class="p-2 text-[#1A1A1A] hover:text-[#FF758F] transition-colors">
              <span class="material-icons text-xl">login</span>
            </a>
          }

          <!-- Carrito -->
          <button (click)="cartService.toggleDrawer()" class="relative p-2 text-[#1A1A1A] hover:text-[#FF758F] transition-colors">
            <span class="material-icons text-xl">shopping_bag</span>
            @if (cartService.itemCount() > 0) {
              <span class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#FF758F] text-white text-[9px] font-bold flex items-center justify-center font-mono shadow">
                {{ cartService.itemCount() }}
              </span>
            }
          </button>
        </div>

        <!-- ====== DESKTOP LAYOUT (hidden md:flex) ====== -->
        <!-- Logo Branding -->
        <a routerLink="/" class="hidden md:flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-full bg-[#FF758F] border border-[#F0D5CC] flex items-center justify-center text-white text-xl font-serif italic group-hover:scale-105 transition-transform duration-300 shadow-sm">
            M
          </div>
          <div>
            <span class="text-3xl font-serif italic tracking-tighter text-[#1A1A1A] block leading-none group-hover:opacity-80 transition-opacity">
              Mochi.
            </span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-[#1A1A1A]/80">
          <a routerLink="/" routerLinkActive="text-[#1A1A1A] font-extrabold border-b-2 border-[#FF758F]" [routerLinkActiveOptions]="{exact: true}" class="py-2 hover:text-[#FF758F] transition-colors">
            Inicio
          </a>
          <a routerLink="/productos" routerLinkActive="text-[#1A1A1A] font-extrabold border-b-2 border-[#FF758F]" class="py-2 hover:text-[#FF758F] transition-colors">
            Catálogo
          </a>
          <a routerLink="/sobre-nosotros" routerLinkActive="text-[#1A1A1A] font-extrabold border-b-2 border-[#FF758F]" class="py-2 hover:text-[#FF758F] transition-colors">
            Nuestra Historia
          </a>
          <a routerLink="/simulador" routerLinkActive="text-[#1A1A1A] font-extrabold border-b-2 border-[#FF758F]" class="py-2 hover:text-[#FF758F] transition-colors flex items-center gap-1">
            <span>Simulador</span>
          </a>
          <a routerLink="/blog" routerLinkActive="text-[#1A1A1A] font-extrabold border-b-2 border-[#FF758F]" class="py-2 hover:text-[#FF758F] transition-colors">
            Blog
          </a>
          <a routerLink="/contacto" routerLinkActive="text-[#1A1A1A] font-extrabold border-b-2 border-[#FF758F]" class="py-2 hover:text-[#FF758F] transition-colors">
            Contacto
          </a>
        </nav>

        <!-- Desktop Right Quick Actions & Roles -->
        <div class="hidden md:flex items-center gap-2">
          <!-- POS Empleado Access Badge -->
          @if (isEmpleadoOrAdmin()) {
            <a routerLink="/empleado" class="hidden lg:flex items-center gap-1.5 py-2 text-[#133834] hover:text-[#80CBC4] text-[11px] font-bold uppercase tracking-wider transition-colors">
              <span class="material-icons text-base">point_of_sale</span>
              <span>POS</span>
            </a>
          }

          <!-- Admin Panel Badge -->
          @if (isAdmin()) {
            <a routerLink="/admin" class="hidden lg:flex items-center gap-1.5 py-2 text-[#7C2D12] hover:text-[#FDBA74] text-[11px] font-bold uppercase tracking-wider transition-colors">
              <span class="material-icons text-base">settings</span>
              <span>Admin</span>
            </a>
          }

          @if (isLoggedIn()) {
            <!-- User Account Dropdown -->
            <div class="relative">
              <button 
                (click)="userMenuOpen.set(!userMenuOpen())"
                class="flex items-center gap-1.5 py-2 text-[#1A1A1A] hover:text-[#FF758F] text-[11px] font-bold uppercase tracking-wider transition-colors">
                <span class="material-icons text-base">person</span>
                <span class="hidden xl:inline truncate max-w-[90px]">{{ userName() }}</span>
                <span class="material-icons text-sm">expand_more</span>
              </button>

              @if (userMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#F0D5CC] shadow-lg py-2 z-50">
                  <div class="px-4 py-2 border-b border-[#F0D5CC]">
                    <p class="text-xs font-bold text-[#1A1A1A]">{{ userFullName() }}</p>
                    <p class="text-[10px] text-[#1A1A1A]/60">{{ userEmail() }}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase"
                      [class]="userRole() === 'admin' ? 'bg-[#FFD6E0] text-[#4A3F35]' : userRole() === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FAF7F2] text-[#4A3F35]'">
                      {{ userRole() }}
                    </span>
                  </div>
                  <a (click)="goToPanel()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#1A1A1A] hover:bg-[#FDF5F0] transition-colors cursor-pointer">
                    <span class="material-icons text-base">dashboard</span>
                    Mi Panel
                  </a>
                  @if (isEmpleadoOrAdmin()) {
                    <a routerLink="/empleado" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#133834] hover:bg-[#E0F2F1] transition-colors">
                      <span class="material-icons text-base">point_of_sale</span>
                      Ventas POS
                    </a>
                  }
                  @if (isAdmin()) {
                    <a routerLink="/admin" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#7C2D12] hover:bg-[#FFF3E0] transition-colors">
                      <span class="material-icons text-base">settings</span>
                      Admin Panel
                    </a>
                  }
                  <div class="border-t border-[#F0D5CC] mt-1 pt-1">
                    <button (click)="onLogout()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors w-full">
                      <span class="material-icons text-base">logout</span>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Login Link -->
            <a 
              routerLink="/login"
              class="flex items-center gap-1.5 py-2 text-[#1A1A1A] hover:text-[#FF758F] text-[11px] font-bold uppercase tracking-wider transition-colors">
              <span class="material-icons text-base">login</span>
              <span class="hidden xl:inline">Iniciar Sesión</span>
            </a>
          }

          <!-- Shopping Cart Drawer Button -->
          <button 
            (click)="cartService.toggleDrawer()" 
            class="relative flex items-center gap-2 py-2 text-[#1A1A1A] hover:text-[#FF758F] transition-colors focus:outline-none">
            <span class="material-icons text-xl">shopping_bag</span>
            <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">Carrito</span>
            @if (cartService.itemCount() > 0) {
              <span class="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#FF758F] text-white text-[9px] font-bold flex items-center justify-center font-mono shadow">
                {{ cartService.itemCount() }}
              </span>
            }
          </button>
        </div>
      </div>
    </header>

    <!-- Spacer para navbar fijo -->
    <div class="h-16 sm:h-20"></div>

    <!-- Mobile Navigation Drawer (fuera del header para evitar clipping) -->
    @if (isMobileMenuOpen()) {
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black/40 z-40 md:hidden" (click)="isMobileMenuOpen.set(false)"
        style="animation: fadeIn 0.2s ease-out"></div>

      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-72 bg-[#FDF5F0] border-r border-[#F0D5CC] flex flex-col md:hidden shadow-2xl"
        style="animation: slideInLeft 0.3s ease-out">

        <!-- Header -->
        <div class="h-16 flex items-center gap-3 px-5 border-b border-[#F0D5CC] shrink-0">
          <button (click)="isMobileMenuOpen.set(false)" class="p-2 -ml-2 rounded-xl hover:bg-[#F5E0D8] text-[#1A1A1A] transition-colors">
            <span class="material-icons text-xl">close</span>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-[#FF758F] flex items-center justify-center text-white text-sm font-serif italic font-bold">M</div>
            <span class="text-lg font-serif italic text-[#1A1A1A]">Mochi.</span>
          </div>
        </div>

        <!-- Nav Links -->
        <nav class="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <a routerLink="/" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors">
            <span class="material-icons text-[20px]">home</span>
            <span>Inicio</span>
          </a>
          <a routerLink="/productos" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors">
            <span class="material-icons text-[20px]">cake</span>
            <span>Catálogo</span>
          </a>
          <a routerLink="/sobre-nosotros" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors">
            <span class="material-icons text-[20px]">info</span>
            <span>Nuestra Historia</span>
          </a>
          <a routerLink="/simulador" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors">
            <span class="material-icons text-[20px]">calculate</span>
            <span>Simulador</span>
          </a>
          <a routerLink="/blog" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors">
            <span class="material-icons text-[20px]">article</span>
            <span>Blog</span>
          </a>
          <a routerLink="/contacto" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors">
            <span class="material-icons text-[20px]">mail</span>
            <span>Contacto</span>
          </a>

          <!-- Separator -->
          <div class="border-t border-[#F0D5CC] my-3"></div>

          @if (isLoggedIn()) {
            <a (click)="goToPanel(); isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#1A1A1A] hover:bg-[#F5E0D8] transition-colors cursor-pointer">
              <span class="material-icons text-[20px]">person</span>
              <span>Mi Perfil</span>
            </a>
            @if (isEmpleadoOrAdmin()) {
              <a routerLink="/empleado" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#133834] hover:bg-[#E0F2F1] transition-colors">
                <span class="material-icons text-[20px]">point_of_sale</span>
                <span>Ventas POS</span>
              </a>
            }
            @if (isAdmin()) {
              <a routerLink="/admin" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-[#7C2D12] hover:bg-[#FFF3E0] transition-colors">
                <span class="material-icons text-[20px]">admin_panel_settings</span>
                <span>Admin Panel</span>
              </a>
            }
          }
        </nav>

        <!-- Footer -->
        <div class="border-t border-[#F0D5CC] p-4 shrink-0">
          @if (isLoggedIn()) {
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full bg-[#FF758F] flex items-center justify-center text-white text-xs font-bold">{{ userName().charAt(0) }}</div>
              <div>
                <p class="text-xs font-bold text-[#1A1A1A]">{{ userName() }}</p>
                <p class="text-[10px] text-[#1A1A1A]/60">{{ userRole() }}</p>
              </div>
            </div>
            <button (click)="onLogout()" class="w-full py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-colors">
              Cerrar Sesión
            </button>
          } @else {
            <a routerLink="/login" (click)="isMobileMenuOpen.set(false)" class="block w-full text-center py-2.5 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs transition-colors">
              Iniciar Sesión
            </a>
          }
        </div>
      </div>
    }
  `
})
export class NavbarComponent {
  cartService = inject(CartService);
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  private router = inject(Router);
  config = this.dataService.visualConfig;

  isMobileMenuOpen = signal(false);
  userMenuOpen = signal(false);

  isLoggedIn = computed(() => !!this.supabaseService.activeUser());
  userRole = computed(() => this.supabaseService.activeUser()?.rol ?? 'cliente');
  isAdmin = computed(() => this.userRole() === 'admin');
  isEmpleadoOrAdmin = computed(() => this.userRole() === 'admin' || this.userRole() === 'empleado');
  userFullName = computed(() => this.supabaseService.activeUser()?.nombre_completo ?? '');
  userEmail = computed(() => this.supabaseService.activeUser()?.email ?? '');

  dashboardRoute = computed(() => {
    const role = this.userRole();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'empleado') return '/empleado/dashboard';
    return '/cliente/dashboard';
  });

  userName = computed(() => (this.supabaseService.activeUser()?.nombre_completo ?? '').split(' ')[0]);

  async onLogout() {
    this.userMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    await this.supabaseService.signOut();
    this.router.navigate(['/']);
  }

  goToPanel() {
    this.userMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.router.navigate(['/perfil']);
  }
}
