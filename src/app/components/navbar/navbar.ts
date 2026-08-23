import { Component, inject, signal, computed, ChangeDetectionStrategy, ViewChild, HostListener, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { FavoritesPanelComponent } from '../favorites-panel/favorites-panel';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FavoritesPanelComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-40"
      [style.padding]="headerPadding()"
      [style.transition]="'background 0.4s, box-shadow 0.4s, padding 0.4s'"
      [style.background]="headerBg()"
      [style.box-shadow]="headerShadow()">
      <div class="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between" [style.height]="headerHeight()" [style.transition]="'height 0.4s'">

        <!-- MOBILE -->
        <button (click)="isMobileMenuOpen.set(true)" class="md:hidden p-2 -ml-2 rounded-xl focus:outline-none" [style.color]="navColor()">
          <span class="material-icons text-2xl">menu</span>
        </button>
        <a routerLink="/" class="md:hidden flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-serif italic group-hover:scale-105 transition-transform duration-300 shadow-sm" [style.background]="'var(--accent)'">M</div>
          <span class="text-xl font-serif italic tracking-tighter group-hover:opacity-80 transition-opacity" [style.color]="navColor()">Mochi.</span>
        </a>
        <div class="flex items-center gap-1 md:hidden">
          @if (isLoggedIn()) {
            <div class="relative">
              <button (click)="userMenuOpen.set(!userMenuOpen())" class="p-2 transition-colors" [style.color]="navColor()">
                <span class="material-icons text-xl">person</span>
              </button>
              @if (userMenuOpen()) {
                <div class="absolute right-0 mt-2 w-52 bg-white rounded-2xl border shadow-lg py-2 z-50" [style.border-color]="'var(--border-soft)'">
                  <div class="px-4 py-2 border-b" [style.border-color]="'var(--border-soft)'">
                    <p class="text-xs font-bold" [style.color]="'var(--text-main)'">{{ userFullName() }}</p>
                    <p class="text-[10px]" [style.color]="'var(--text-muted)'">{{ userEmail() }}</p>
                  </div>
                  <a (click)="goToPanel()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer hover:opacity-70" [style.color]="'var(--text-main)'">
                    <span class="material-icons text-base">dashboard</span> Mi Panel
                  </a>
                  <div class="border-t mt-1 pt-1" [style.border-color]="'var(--border-soft)'">
                    <button (click)="onLogout()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors w-full">
                      <span class="material-icons text-base">logout</span> Cerrar Sesion
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="p-2 transition-colors" [style.color]="navColor()">
              <span class="material-icons text-xl">login</span>
            </a>
          }
          <button (click)="favoritesPanel.toggle()" class="relative p-2 transition-colors" [style.color]="navColor()">
            <span class="material-icons text-xl">favorite_border</span>
            @if (dataService.favorites().length > 0) {
              <span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center font-mono shadow px-1" [style.background]="'var(--accent)'">
                {{ dataService.favorites().length }}
              </span>
            }
          </button>
          <button (click)="cartService.toggleDrawer()" class="relative p-2 transition-colors" [style.color]="navColor()">
            <span class="material-icons text-xl">shopping_bag</span>
            <span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center font-mono shadow"
              [style.background]="cartService.itemCount() > 0 ? 'var(--accent)' : 'var(--border-soft)'"
              [style.color]="cartService.itemCount() > 0 ? 'white' : '#590E2A'"
              [class.px-1]="cartService.itemCount() < 10">
              {{ cartService.itemCount() }}
            </span>
          </button>
        </div>

        <!-- DESKTOP -->
        <a routerLink="/" class="hidden md:flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-serif italic group-hover:scale-105 transition-transform duration-300 shadow-sm" [style.background]="'var(--accent)'">M</div>
          <span class="text-3xl font-serif italic tracking-tighter block leading-none group-hover:opacity-80 transition-opacity" [style.color]="navColor()">Mochi.</span>
        </a>

        <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-bold">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link" [style.color]="navColor()">Inicio</a>
          <a routerLink="/productos" routerLinkActive="active" class="nav-link" [style.color]="navColor()">Catalogo</a>
          <a routerLink="/sobre-nosotros" routerLinkActive="active" class="nav-link" [style.color]="navColor()">Nuestra Historia</a>
          <a routerLink="/simulador" routerLinkActive="active" class="nav-link" [style.color]="navColor()">Simulador</a>
          <a routerLink="/blog" routerLinkActive="active" class="nav-link" [style.color]="navColor()">Blog</a>
          <a routerLink="/contacto" routerLinkActive="active" class="nav-link" [style.color]="navColor()">Contacto</a>
        </nav>

        <div class="hidden md:flex items-center gap-2">
          @if (isEmpleadoOrAdmin()) {
            <a routerLink="/empleado" class="hidden lg:flex items-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors" [style.color]="'var(--wine)'">
              <span class="material-icons text-base">point_of_sale</span><span>POS</span>
            </a>
          }
          @if (isAdmin()) {
            <a routerLink="/admin" class="hidden lg:flex items-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors" [style.color]="'var(--accent)'">
              <span class="material-icons text-base">settings</span><span>Admin</span>
            </a>
          }
          @if (isLoggedIn()) {
            <div class="relative">
              <button (click)="userMenuOpen.set(!userMenuOpen())" class="flex items-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors" [style.color]="navColor()">
                <span class="material-icons text-base">person</span>
                <span class="hidden xl:inline truncate max-w-[90px]">{{ userName() }}</span>
                <span class="material-icons text-sm">expand_more</span>
              </button>
              @if (userMenuOpen()) {
                <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl border shadow-lg py-2 z-50" [style.border-color]="'var(--border-soft)'">
                  <div class="px-4 py-2 border-b" [style.border-color]="'var(--border-soft)'">
                    <p class="text-xs font-bold" [style.color]="'var(--text-main)'">{{ userFullName() }}</p>
                    <p class="text-[10px]" [style.color]="'var(--text-muted)'">{{ userEmail() }}</p>
                  </div>
                  <a (click)="goToPanel()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer hover:opacity-70" [style.color]="'var(--text-main)'">
                    <span class="material-icons text-base">dashboard</span> Mi Panel
                  </a>
                  @if (isEmpleadoOrAdmin()) {
                    <a routerLink="/empleado" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors" [style.color]="'var(--wine)'">
                      <span class="material-icons text-base">point_of_sale</span> Ventas POS
                    </a>
                  }
                  @if (isAdmin()) {
                    <a routerLink="/admin" (click)="userMenuOpen.set(false)" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors" [style.color]="'var(--accent)'">
                      <span class="material-icons text-base">settings</span> Admin Panel
                    </a>
                  }
                  <div class="border-t mt-1 pt-1" [style.border-color]="'var(--border-soft)'">
                    <button (click)="onLogout()" class="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors w-full">
                      <span class="material-icons text-base">logout</span> Cerrar Sesion
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/login" class="flex items-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors" [style.color]="navColor()">
              <span class="material-icons text-base">login</span>
              <span class="hidden xl:inline">Iniciar Sesion</span>
            </a>
          }
          <button (click)="favoritesPanel.toggle()" class="relative flex items-center gap-2 py-2 transition-colors focus:outline-none" [style.color]="navColor()">
            <span class="material-icons text-xl">favorite_border</span>
            @if (dataService.favorites().length > 0) {
              <span class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center font-mono shadow px-1" [style.background]="'var(--accent)'">
                {{ dataService.favorites().length }}
              </span>
            }
          </button>
          <button (click)="cartService.toggleDrawer()" class="relative flex items-center gap-2 py-2 transition-colors focus:outline-none" [style.color]="navColor()">
            <span class="material-icons text-xl">shopping_bag</span>
            <span class="hidden sm:inline text-xs font-bold uppercase tracking-wider">Carrito</span>
            <span class="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[9px] font-bold flex items-center justify-center font-mono shadow"
              [style.background]="cartService.itemCount() > 0 ? 'var(--accent)' : 'var(--border-soft)'"
              [style.color]="cartService.itemCount() > 0 ? 'white' : '#590E2A'"
              [class.px-1]="cartService.itemCount() < 10">
              {{ cartService.itemCount() }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <app-favorites-panel />

    @if (isMobileMenuOpen()) {
      <div class="fixed inset-0 bg-black/40 z-40 md:hidden" (click)="isMobileMenuOpen.set(false)" style="animation: fadeIn 0.2s ease-out"></div>
      <div class="fixed inset-y-0 left-0 z-50 w-72 flex flex-col md:hidden shadow-2xl" style="animation: slideInLeft 0.3s ease-out" [style.background]="sidebarBg()" [style.box-shadow]="'4px 0 16px rgba(0,0,0,0.15)'">
        <div class="h-16 flex items-center gap-3 px-5 shrink-0" [style.border-bottom]="'1px solid ' + sidebarBorderColor()">
          <button (click)="isMobileMenuOpen.set(false)" class="p-2 -ml-2 rounded-xl transition-colors hover:opacity-70">
            <span class="material-icons text-xl" [style.color]="navColor()">close</span>
          </button>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-serif italic font-bold" [style.background]="'var(--accent)'">M</div>
            <span class="text-lg font-serif italic" [style.color]="navColor()">Mochi.</span>
          </div>
        </div>
        <nav class="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <a routerLink="/" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-70" [style.color]="navColor()">
            <span class="material-icons text-[20px]">home</span> Inicio
          </a>
          <a routerLink="/productos" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-70" [style.color]="navColor()">
            <span class="material-icons text-[20px]">cake</span> Catalogo
          </a>
          <a routerLink="/sobre-nosotros" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-70" [style.color]="navColor()">
            <span class="material-icons text-[20px]">info</span> Nuestra Historia
          </a>
          <a routerLink="/simulador" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-70" [style.color]="navColor()">
            <span class="material-icons text-[20px]">calculate</span> Simulador
          </a>
          <a routerLink="/blog" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-70" [style.color]="navColor()">
            <span class="material-icons text-[20px]">article</span> Blog
          </a>
          <a routerLink="/contacto" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors hover:opacity-70" [style.color]="navColor()">
            <span class="material-icons text-[20px]">mail</span> Contacto
          </a>
          <div class="my-3" [style.border-top]="'1px solid ' + sidebarBorderColor()"></div>
          @if (isLoggedIn()) {
            <a (click)="goToPanel(); isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer hover:opacity-70" [style.color]="navColor()">
              <span class="material-icons text-[20px]">person</span> Mi Perfil
            </a>
            @if (isEmpleadoOrAdmin()) {
              <a routerLink="/empleado" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors" [style.color]="'var(--wine)'">
                <span class="material-icons text-[20px]">point_of_sale</span> Ventas POS
              </a>
            }
            @if (isAdmin()) {
              <a routerLink="/admin" (click)="isMobileMenuOpen.set(false)" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors" [style.color]="'var(--accent)'">
                <span class="material-icons text-[20px]">admin_panel_settings</span> Admin Panel
              </a>
            }
          }
        </nav>
        <div class="p-4 shrink-0" [style.border-top]="'1px solid ' + sidebarBorderColor()">
          @if (isLoggedIn()) {
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.background]="'var(--accent)'">{{ userName().charAt(0) }}</div>
              <div>
                <p class="text-xs font-bold" [style.color]="navColor()">{{ userName() }}</p>
                <p class="text-[10px] opacity-70" [style.color]="navColor()">{{ userRole() }}</p>
              </div>
            </div>
            <button (click)="onLogout()" class="w-full py-2.5 rounded-full text-white font-bold text-xs transition-colors" [style.background]="'var(--accent)'">
              Cerrar Sesion
            </button>
          } @else {
            <a routerLink="/login" (click)="isMobileMenuOpen.set(false)" class="block w-full text-center py-2.5 rounded-full text-white font-bold text-xs transition-colors" [style.background]="'var(--accent)'">
              Iniciar Sesion
            </a>
          }
        </div>
      </div>
    }
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild(FavoritesPanelComponent) favoritesPanel!: FavoritesPanelComponent;
  cartService = inject(CartService);
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  isMobileMenuOpen = signal(false);
  userMenuOpen = signal(false);
  isScrolled = signal(false);
  isHomeRoute = signal(true);
  private routerSub?: Subscription;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 50);
      this.isHomeRoute.set(this.router.url === '/' || this.router.url === '/inicio');
    }
    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects || (e as NavigationEnd).url;
      this.isHomeRoute.set(url === '/' || url === '/inicio');
      // En rutas que no son home, el navbar siempre es solido
      if (!this.isHomeRoute()) {
        this.isScrolled.set(true);
      } else if (isPlatformBrowser(this.platformId)) {
        this.isScrolled.set(window.scrollY > 50);
      }
    });
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // En home, el scroll controla transparencia. En otras rutas, siempre solido.
    if (this.isHomeRoute() && isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 50);
    }
  }

  headerBg = computed(() => {
    if (!this.isHomeRoute() || this.isScrolled()) {
      return 'rgba(89, 14, 42, 0.97)';
    }
    return 'transparent';
  });

  headerShadow = computed(() => {
    if (!this.isHomeRoute() || this.isScrolled()) {
      return '0 2px 8px rgba(0,0,0,0.25)';
    }
    return 'none';
  });

  headerPadding = computed(() => {
    if (!this.isHomeRoute() || this.isScrolled()) {
      return '14px 0';
    }
    return '20px 0';
  });

  headerHeight = computed(() => {
    if (!this.isHomeRoute() || this.isScrolled()) {
      return '48px';
    }
    return '64px';
  });

  navColor = computed(() => '#FDF8F4');

  sidebarBg = computed(() => '#4A0D22');
  sidebarBorderColor = computed(() => 'rgba(255,255,255,0.1)');

  isLoggedIn = computed(() => !!this.supabaseService.activeUser());
  userRole = computed(() => this.supabaseService.activeUser()?.rol ?? 'cliente');
  isAdmin = computed(() => this.userRole() === 'admin');
  isEmpleadoOrAdmin = computed(() => this.userRole() === 'admin' || this.userRole() === 'empleado');
  userFullName = computed(() => this.supabaseService.activeUser()?.nombre_completo ?? '');
  userEmail = computed(() => this.supabaseService.activeUser()?.email ?? '');
  userName = computed(() => (this.supabaseService.activeUser()?.nombre_completo ?? '').split(' ')[0]);

  async onLogout() {
    this.userMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    await this.supabaseService.signOut();
    this.dataService.favorites.set([]);
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }

  goToPanel() {
    this.userMenuOpen.set(false);
    this.isMobileMenuOpen.set(false);
    this.router.navigate(['/perfil']);
  }
}
