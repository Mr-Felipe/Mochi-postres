import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Top Announcement Bar -->
    @if (config().mostrarBanner && config().bannerPromocional) {
      <div class="bg-[#FFD6E0] text-[#4A3F35] text-xs font-semibold py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2 border-b border-[#EBE3D5]">
        <span>{{ config().bannerPromocional }}</span>
      </div>
    }

    <!-- Main Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EBE3D5] transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        <!-- Logo Branding -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-full bg-[#FFD6E0] border border-[#EBE3D5] flex items-center justify-center text-[#4A3F35] text-xl font-serif italic group-hover:scale-105 transition-transform duration-300 shadow-xs">
            M
          </div>
          <div>
            <span class="text-3xl font-serif italic tracking-tighter text-[#4A3F35] block leading-none group-hover:opacity-80 transition-opacity">
              Mochi.
            </span>
            <span class="text-[9px] uppercase tracking-widest text-[#4A3F35]/60 font-semibold block mt-1">
              Boutique Artesanal • La Dorada
            </span>
          </div>
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-semibold text-[#4A3F35]/70">
          <a routerLink="/" routerLinkActive="text-[#4A3F35] font-bold border-b-2 border-[#4A3F35]" [routerLinkActiveOptions]="{exact: true}" class="py-2 hover:text-[#4A3F35] transition-colors">
            Inicio
          </a>
          <a routerLink="/productos" routerLinkActive="text-[#4A3F35] font-bold border-b-2 border-[#4A3F35]" class="py-2 hover:text-[#4A3F35] transition-colors">
            Catálogo
          </a>
          <a routerLink="/sobre-nosotros" routerLinkActive="text-[#4A3F35] font-bold border-b-2 border-[#4A3F35]" class="py-2 hover:text-[#4A3F35] transition-colors">
            Nuestra Historia
          </a>
          <a routerLink="/simulador" routerLinkActive="text-[#4A3F35] font-bold border-b-2 border-[#4A3F35]" class="py-2 hover:text-[#4A3F35] transition-colors flex items-center gap-1">
            <span>Simulador</span>
          </a>
          <a routerLink="/blog" routerLinkActive="text-[#4A3F35] font-bold border-b-2 border-[#4A3F35]" class="py-2 hover:text-[#4A3F35] transition-colors">
            Blog
          </a>
          <a routerLink="/contacto" routerLinkActive="text-[#4A3F35] font-bold border-b-2 border-[#4A3F35]" class="py-2 hover:text-[#4A3F35] transition-colors">
            Contacto
          </a>
        </nav>

        <!-- Right Quick Actions & Roles -->
        <div class="flex items-center gap-3">
          <!-- POS Empleado Access Badge -->
          <a routerLink="/empleado" class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E0F2F1] text-[#2C5350] hover:bg-[#b2dfdb] text-[11px] font-bold uppercase tracking-wider border border-[#b2dfdb] transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00796b]"></span>
            POS
          </a>

          <!-- Admin Panel Badge -->
          <a routerLink="/admin" class="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3E0] text-[#6B4E28] hover:bg-[#ffe0b2] text-[11px] font-bold uppercase tracking-wider border border-[#ffe0b2] transition-colors">
            ⚙️ Admin
          </a>

          <!-- Track Orders Button -->
          <a routerLink="/pedidos" class="p-2 rounded-full text-[#4A3F35] hover:bg-[#EBE3D5]/50 transition-colors relative" title="Mis Pedidos">
            <span class="material-icons text-xl">receipt_long</span>
          </a>

          <!-- Shopping Cart Drawer Button -->
          <button 
            (click)="cartService.toggleDrawer()" 
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm focus:outline-none">
            <span class="material-icons text-base">shopping_bag</span>
            <span class="hidden sm:inline">Carrito</span>
            <span class="w-5 h-5 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[11px] font-bold flex items-center justify-center font-mono">
              {{ cartService.itemCount() }}
            </span>
          </button>

          <!-- Mobile Menu Trigger -->
          <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" class="md:hidden p-2 rounded-full text-[#4A3F35] hover:bg-[#EBE3D5]/50 focus:outline-none">
            <span class="material-icons text-2xl">{{ isMobileMenuOpen() ? 'close' : 'menu' }}</span>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden bg-[#FAF7F2] border-b border-[#EBE3D5] px-6 pt-4 pb-6 space-y-3 text-xs uppercase tracking-widest font-semibold shadow-lg">
          <a routerLink="/" (click)="isMobileMenuOpen.set(false)" class="block py-2 text-[#4A3F35] border-b border-[#EBE3D5]/50">
            Inicio
          </a>
          <a routerLink="/productos" (click)="isMobileMenuOpen.set(false)" class="block py-2 text-[#4A3F35] border-b border-[#EBE3D5]/50">
            Catálogo de Mochi
          </a>
          <a routerLink="/sobre-nosotros" (click)="isMobileMenuOpen.set(false)" class="block py-2 text-[#4A3F35] border-b border-[#EBE3D5]/50">
            Nuestra Historia
          </a>
          <a routerLink="/simulador" (click)="isMobileMenuOpen.set(false)" class="block py-2 text-[#4A3F35] border-b border-[#EBE3D5]/50">
            Simulador de Pedidos
          </a>
          <a routerLink="/blog" (click)="isMobileMenuOpen.set(false)" class="block py-2 text-[#4A3F35] border-b border-[#EBE3D5]/50">
            Blog & Noticias
          </a>
          <a routerLink="/contacto" (click)="isMobileMenuOpen.set(false)" class="block py-2 text-[#4A3F35] border-b border-[#EBE3D5]/50">
            Contacto & Ubicación
          </a>
          <div class="grid grid-cols-2 gap-2 pt-2">
            <a routerLink="/empleado" (click)="isMobileMenuOpen.set(false)" class="block text-center py-2.5 rounded-full bg-[#E0F2F1] text-[#2C5350] font-bold">
              🛒 Ventas POS
            </a>
            <a routerLink="/admin" (click)="isMobileMenuOpen.set(false)" class="block text-center py-2.5 rounded-full bg-[#FFF3E0] text-[#6B4E28] font-bold">
              ⚙️ Admin
            </a>
          </div>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  cartService = inject(CartService);
  dataService = inject(MochiDataService);
  config = this.dataService.visualConfig;

  isMobileMenuOpen = signal(false);
}
