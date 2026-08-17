import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-design-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="min-h-screen">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-[#1A1A1A]">Design Playground</h1>
        <p class="text-sm text-[#1A1A1A]/60 mt-1">Probá y editá el diseño de la web en tiempo real</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- ====== PANEL DE CONTROLES ====== -->
        <div class="lg:col-span-1 space-y-4">

          <!-- Fondo / Background -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-5">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span class="material-icons text-base">palette</span>
              Fondo
            </h3>

            <div class="space-y-3">
              <label class="text-[11px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider">Tipo</label>
              <select [(ngModel)]="bgType" (ngModelChange)="applyBackground()"
                class="w-full px-3 py-2 rounded-xl border border-[#F0D5CC] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF758F]">
                <option value="solid">Sólido</option>
                <option value="linear">Linear Gradient</option>
                <option value="radial">Radial Gradient</option>
                <option value="mesh">Mesh Gradient</option>
              </select>

              @if (bgType() === 'solid') {
                <div class="flex items-center gap-2">
                  <input type="color" [(ngModel)]="bgColor" (ngModelChange)="applyBackground()"
                    class="w-10 h-10 rounded-lg border border-[#F0D5CC] cursor-pointer">
                  <span class="text-xs text-[#1A1A1A]">{{ bgColor() }}</span>
                </div>
              }

              @if (bgType() === 'linear') {
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <input type="color" [(ngModel)]="gradientColor1" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                    <input type="color" [(ngModel)]="gradientColor2" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-[10px] text-[#1A1A1A]/60 w-12">Angle</label>
                    <input type="range" [(ngModel)]="gradientAngle" (ngModelChange)="applyBackground()" min="0" max="360" class="flex-1">
                    <span class="text-[10px] text-[#1A1A1A] w-8">{{ gradientAngle() }}°</span>
                  </div>
                </div>
              }

              @if (bgType() === 'radial') {
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <input type="color" [(ngModel)]="radialColor1" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                    <input type="color" [(ngModel)]="radialColor2" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                  </div>
                </div>
              }

              @if (bgType() === 'mesh') {
                <div class="space-y-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <input type="color" [(ngModel)]="meshColor1" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                    <input type="color" [(ngModel)]="meshColor2" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                    <input type="color" [(ngModel)]="meshColor3" (ngModelChange)="applyBackground()" class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                  </div>
                  <div class="flex items-center gap-2">
                    <label class="text-[10px] text-[#1A1A1A]/60 w-12">Blur</label>
                    <input type="range" [(ngModel)]="meshBlur" (ngModelChange)="applyBackground()" min="0" max="100" class="flex-1">
                    <span class="text-[10px] text-[#1A1A1A] w-8">{{ meshBlur() }}px</span>
                  </div>
                </div>
              }

              <!-- Presets -->
              <div class="pt-2 border-t border-[#F0D5CC]">
                <label class="text-[11px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider mb-2 block">Presets</label>
                <div class="grid grid-cols-4 gap-2">
                  @for (preset of bgPresets; track preset.name) {
                    <button (click)="applyPreset(preset)"
                      class="w-full h-10 rounded-lg border border-[#F0D5CC] hover:scale-105 transition-transform cursor-pointer"
                      [style.background]="preset.preview"
                      [title]="preset.name">
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Tipografía -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-5">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span class="material-icons text-base">text_fields</span>
              Tipografía
            </h3>

            <div class="space-y-3">
              <div>
                <label class="text-[11px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider">Fuente Serif (títulos)</label>
                <select [(ngModel)]="fontSerif" (ngModelChange)="applyFonts()"
                  class="w-full px-3 py-2 rounded-xl border border-[#F0D5CC] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF758F] mt-1">
                  @for (f of serifFonts; track f.name) {
                    <option [value]="f.name">{{ f.label }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="text-[11px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider">Fuente Sans (cuerpo)</label>
                <select [(ngModel)]="fontSans" (ngModelChange)="applyFonts()"
                  class="w-full px-3 py-2 rounded-xl border border-[#F0D5CC] text-xs text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF758F] mt-1">
                  @for (f of sansFonts; track f.name) {
                    <option [value]="f.name">{{ f.label }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="text-[11px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider">Tamaño base</label>
                <div class="flex items-center gap-2 mt-1">
                  <input type="range" [(ngModel)]="fontSize" (ngModelChange)="applyFonts()" min="12" max="20" class="flex-1">
                  <span class="text-[10px] text-[#1A1A1A] w-8">{{ fontSize() }}px</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Colores -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-5">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span class="material-icons text-base">color_lens</span>
              Colores
            </h3>

            <div class="space-y-2">
              @for (c of colorTokens; track c.name) {
                <div class="flex items-center gap-2">
                  <input type="color" [(ngModel)]="c.value" (ngModelChange)="applyColors()"
                    class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                  <span class="text-[11px] text-[#1A1A1A] flex-1">{{ c.label }}</span>
                  <span class="text-[9px] text-[#1A1A1A]/50 font-mono">{{ c.value() }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Sidebar Preview -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-5">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span class="material-icons text-base">view_sidebar</span>
              Sidebar
            </h3>

            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <input type="color" [(ngModel)]="sidebarBg" (ngModelChange)="applySidebar()"
                  class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                <span class="text-[11px] text-[#1A1A1A]">Fondo sidebar</span>
              </div>
              <div class="flex items-center gap-2">
                <input type="color" [(ngModel)]="sidebarText" (ngModelChange)="applySidebar()"
                  class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                <span class="text-[11px] text-[#1A1A1A]">Texto sidebar</span>
              </div>
              <div class="flex items-center gap-2">
                <input type="color" [(ngModel)]="sidebarAccent" (ngModelChange)="applySidebar()"
                  class="w-8 h-8 rounded-lg border border-[#F0D5CC] cursor-pointer">
                <span class="text-[11px] text-[#1A1A1A]">Accent sidebar</span>
              </div>
            </div>
          </div>

          <!-- CSS Output -->
          <div class="bg-[#FFF0EA] rounded-2xl border border-[#F0D5CC] p-5">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <span class="material-icons text-base text-[#FF758F]">code</span>
              CSS Generado
            </h3>
            <pre class="text-[10px] text-[#1A1A1A] font-mono whitespace-pre-wrap overflow-auto max-h-64 bg-white/50 rounded-xl p-3">{{ generatedCSS() }}</pre>
            <button (click)="copyCSS()"
              class="mt-3 w-full py-2 rounded-xl bg-[#FF758F] hover:bg-[#FF6078] text-white text-xs font-bold transition-colors">
              {{ copied() ? 'Copiado!' : 'Copiar CSS' }}
            </button>
          </div>

        </div>

        <!-- ====== PAGE WIREFRAMES ====== -->
        <div class="lg:col-span-3 mt-8">
          <h2 class="text-lg font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <span class="material-icons text-xl text-[#FF758F]">dashboard</span>
            Mapa de Páginas — Wireframes
          </h2>
          <p class="text-xs text-[#1A1A1A]/60 mb-6">Preview miniature de la estructura de cada página</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

            <!-- HOME -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('home')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🏠 Inicio</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                  <div class="flex-1 flex justify-center gap-1">
                    <div class="w-4 h-1 rounded bg-[#1A1A1A]/20"></div>
                    <div class="w-4 h-1 rounded bg-[#1A1A1A]/20"></div>
                    <div class="w-4 h-1 rounded bg-[#1A1A1A]/20"></div>
                  </div>
                  <div class="w-3 h-3 rounded bg-[#1A1A1A]/20"></div>
                </div>
                <!-- Hero -->
                <div class="h-16 rounded-lg bg-gradient-to-r from-[#FF758F]/30 to-[#FDBA74]/30 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-12 h-2 rounded bg-[#1A1A1A]/30 mx-auto mb-1"></div>
                    <div class="w-8 h-1 rounded bg-[#1A1A1A]/20 mx-auto"></div>
                  </div>
                </div>
                <!-- Products -->
                <div class="flex gap-1">
                  <div class="flex-1 h-12 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="flex-1 h-12 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="flex-1 h-12 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                </div>
                <!-- CTA -->
                <div class="h-5 rounded-full bg-[#FF758F] w-2/3 mx-auto"></div>
                <!-- Footer -->
                <div class="h-8 rounded bg-[#1A1A1A]/10"></div>
              </div>
            </div>

            <!-- CATALOGO -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('catalog')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🍰 Catálogo</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Search -->
                <div class="h-5 rounded-full bg-[#FFF0EA] border border-[#F0D5CC] flex items-center px-2">
                  <div class="w-2 h-2 rounded-full bg-[#1A1A1A]/20"></div>
                  <div class="flex-1 h-1 rounded bg-[#1A1A1A]/10 ml-1"></div>
                </div>
                <!-- Filters -->
                <div class="flex gap-1">
                  <div class="h-4 w-10 rounded-full bg-[#1A1A1A]"></div>
                  <div class="h-4 w-10 rounded-full bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="h-4 w-10 rounded-full bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                </div>
                <!-- Grid -->
                <div class="grid grid-cols-2 gap-1">
                  <div class="h-14 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="h-14 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="h-14 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="h-14 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                </div>
              </div>
            </div>

            <!-- PRODUCTO DETALLE -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('detail')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🍡 Detalle Producto</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Breadcrumb -->
                <div class="flex gap-1">
                  <div class="w-6 h-1 rounded bg-[#1A1A1A]/20"></div>
                  <div class="w-4 h-1 rounded bg-[#1A1A1A]/10"></div>
                </div>
                <!-- Image + Info -->
                <div class="flex gap-1.5">
                  <div class="flex-1 h-20 rounded-lg bg-[#FF758F]/20"></div>
                  <div class="flex-1 space-y-1">
                    <div class="w-3/4 h-2 rounded bg-[#1A1A1A]/30"></div>
                    <div class="w-1/2 h-1 rounded bg-[#1A1A1A]/20"></div>
                    <div class="w-full h-8 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                    <div class="h-4 rounded-full bg-[#FF758F]"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SOBRE NOSOTROS -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('about')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🌸 Sobre Nosotros</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Hero -->
                <div class="h-12 rounded-lg bg-gradient-to-r from-[#FF758F]/20 to-[#FDBA74]/20 flex items-center justify-center">
                  <div class="w-16 h-2 rounded bg-[#1A1A1A]/20"></div>
                </div>
                <!-- Story -->
                <div class="flex gap-1.5">
                  <div class="flex-1 space-y-1">
                    <div class="w-full h-1.5 rounded bg-[#1A1A1A]/20"></div>
                    <div class="w-3/4 h-1.5 rounded bg-[#1A1A1A]/15"></div>
                    <div class="w-1/2 h-1.5 rounded bg-[#1A1A1A]/10"></div>
                  </div>
                  <div class="w-12 h-16 rounded-lg bg-[#FF758F]/15"></div>
                </div>
                <!-- Values -->
                <div class="flex gap-1">
                  <div class="flex-1 h-10 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="flex-1 h-10 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="flex-1 h-10 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                </div>
              </div>
            </div>

            <!-- CONTACTO -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('contact')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">📍 Contacto</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Map placeholder -->
                <div class="h-16 rounded-lg bg-[#80CBC4]/20 flex items-center justify-center">
                  <div class="w-6 h-6 rounded-full bg-[#80CBC4]/40"></div>
                </div>
                <!-- Form -->
                <div class="space-y-1">
                  <div class="h-4 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="h-4 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="h-6 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                </div>
                <div class="h-4 rounded-full bg-[#FF758F] w-1/2 mx-auto"></div>
              </div>
            </div>

            <!-- LOGIN -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('login')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🔐 Login</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Split layout -->
                <div class="flex gap-1.5 h-28">
                  <!-- Left form -->
                  <div class="flex-1 rounded-lg bg-white border border-[#F0D5CC] p-2 space-y-1.5">
                    <div class="w-1/2 h-2 rounded bg-[#1A1A1A]/30"></div>
                    <div class="h-4 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                    <div class="h-4 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                    <div class="h-5 rounded-full bg-[#FF758F]"></div>
                    <div class="w-2/3 h-1 rounded bg-[#1A1A1A]/15 mx-auto"></div>
                  </div>
                  <!-- Right image -->
                  <div class="flex-1 rounded-lg bg-gradient-to-br from-[#FF758F]/30 to-[#FDBA74]/30 flex items-center justify-center">
                    <div class="w-8 h-8 rounded-full bg-white/50"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- CARRITO -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('cart')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🛒 Carrito</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Cart items -->
                <div class="space-y-1">
                  <div class="flex gap-1.5 items-center p-1 rounded bg-[#FFF0EA] border border-[#F0D5CC]">
                    <div class="w-6 h-6 rounded bg-[#FF758F]/20"></div>
                    <div class="flex-1">
                      <div class="w-3/4 h-1 rounded bg-[#1A1A1A]/20"></div>
                      <div class="w-1/2 h-1 rounded bg-[#1A1A1A]/10"></div>
                    </div>
                  </div>
                  <div class="flex gap-1.5 items-center p-1 rounded bg-[#FFF0EA] border border-[#F0D5CC]">
                    <div class="w-6 h-6 rounded bg-[#FF758F]/20"></div>
                    <div class="flex-1">
                      <div class="w-3/4 h-1 rounded bg-[#1A1A1A]/20"></div>
                      <div class="w-1/2 h-1 rounded bg-[#1A1A1A]/10"></div>
                    </div>
                  </div>
                </div>
                <!-- Summary -->
                <div class="p-1.5 rounded bg-white border border-[#F0D5CC]">
                  <div class="flex justify-between mb-1">
                    <div class="w-8 h-1 rounded bg-[#1A1A1A]/20"></div>
                    <div class="w-6 h-1 rounded bg-[#1A1A1A]/30"></div>
                  </div>
                  <div class="h-4 rounded-full bg-[#FF758F]"></div>
                </div>
              </div>
            </div>

            <!-- PERFIL -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('profile')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">👤 Perfil</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Avatar + Info -->
                <div class="flex items-center gap-2 p-2 rounded bg-[#FFF0EA] border border-[#F0D5CC]">
                  <div class="w-8 h-8 rounded-full bg-[#FF758F]/30"></div>
                  <div class="flex-1">
                    <div class="w-12 h-1.5 rounded bg-[#1A1A1A]/30"></div>
                    <div class="w-8 h-1 rounded bg-[#1A1A1A]/15 mt-0.5"></div>
                  </div>
                </div>
                <!-- Quick links -->
                <div class="grid grid-cols-3 gap-1">
                  <div class="h-10 rounded-lg bg-[#FF758F]/10 flex items-center justify-center">
                    <div class="w-3 h-3 rounded bg-[#FF758F]/40"></div>
                  </div>
                  <div class="h-10 rounded-lg bg-[#80CBC4]/10 flex items-center justify-center">
                    <div class="w-3 h-3 rounded bg-[#80CBC4]/40"></div>
                  </div>
                  <div class="h-10 rounded-lg bg-[#FDBA74]/10 flex items-center justify-center">
                    <div class="w-3 h-3 rounded bg-[#FDBA74]/40"></div>
                  </div>
                </div>
                <!-- Orders -->
                <div class="h-12 rounded-lg bg-white border border-[#F0D5CC] p-1.5">
                  <div class="w-1/3 h-1 rounded bg-[#1A1A1A]/20"></div>
                  <div class="w-full h-1 rounded bg-[#1A1A1A]/10 mt-1"></div>
                </div>
              </div>
            </div>

            <!-- SIMULADOR -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('simulator')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🧮 Simulador</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Step indicator -->
                <div class="flex justify-center gap-1">
                  <div class="w-4 h-4 rounded-full bg-[#FF758F]"></div>
                  <div class="w-4 h-4 rounded-full bg-[#F0D5CC]"></div>
                  <div class="w-4 h-4 rounded-full bg-[#F0D5CC]"></div>
                </div>
                <!-- Content -->
                <div class="flex gap-1.5">
                  <div class="flex-1 space-y-1">
                    <div class="h-14 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC] flex items-center justify-center">
                      <div class="flex gap-0.5">
                        <div class="w-3 h-3 rounded bg-[#FF758F]/30"></div>
                        <div class="w-3 h-3 rounded bg-[#80CBC4]/30"></div>
                        <div class="w-3 h-3 rounded bg-[#FDBA74]/30"></div>
                      </div>
                    </div>
                  </div>
                  <div class="w-12 rounded-lg bg-[#FF758F]/10 p-1">
                    <div class="w-full h-1 rounded bg-[#1A1A1A]/15 mb-0.5"></div>
                    <div class="w-full h-1 rounded bg-[#1A1A1A]/10 mb-0.5"></div>
                    <div class="w-full h-1 rounded bg-[#1A1A1A]/10"></div>
                  </div>
                </div>
                <div class="h-4 rounded-full bg-[#FF758F] w-1/2 mx-auto"></div>
              </div>
            </div>

            <!-- BLOG -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('blog')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">📝 Blog</p>
              </div>
              <div class="p-3 space-y-1.5">
                <!-- Navbar -->
                <div class="h-4 rounded bg-[#FF758F]/20 flex items-center px-1.5">
                  <div class="w-3 h-3 rounded-full bg-[#FF758F]"></div>
                </div>
                <!-- Featured -->
                <div class="h-14 rounded-lg bg-gradient-to-r from-[#FF758F]/20 to-[#FDBA74]/20 p-2">
                  <div class="w-2/3 h-1.5 rounded bg-[#1A1A1A]/25"></div>
                  <div class="w-1/2 h-1 rounded bg-[#1A1A1A]/15 mt-1"></div>
                </div>
                <!-- Posts -->
                <div class="space-y-1">
                  <div class="flex gap-1.5 items-center p-1 rounded bg-[#FFF0EA] border border-[#F0D5CC]">
                    <div class="w-8 h-8 rounded bg-[#FF758F]/15"></div>
                    <div class="flex-1">
                      <div class="w-3/4 h-1 rounded bg-[#1A1A1A]/20"></div>
                      <div class="w-1/2 h-1 rounded bg-[#1A1A1A]/10"></div>
                    </div>
                  </div>
                  <div class="flex gap-1.5 items-center p-1 rounded bg-[#FFF0EA] border border-[#F0D5CC]">
                    <div class="w-8 h-8 rounded bg-[#80CBC4]/15"></div>
                    <div class="flex-1">
                      <div class="w-3/4 h-1 rounded bg-[#1A1A1A]/20"></div>
                      <div class="w-1/2 h-1 rounded bg-[#1A1A1A]/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ADMIN DASHBOARD -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('admin')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FFF0EA]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">⚙️ Admin Dashboard</p>
              </div>
              <div class="p-3 flex gap-1.5">
                <!-- Sidebar -->
                <div class="w-10 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC] p-1 space-y-1">
                  <div class="w-full h-2 rounded bg-[#FF758F]/30"></div>
                  <div class="w-full h-2 rounded bg-[#1A1A1A]/10"></div>
                  <div class="w-full h-2 rounded bg-[#1A1A1A]/10"></div>
                  <div class="w-full h-2 rounded bg-[#1A1A1A]/10"></div>
                </div>
                <!-- Content -->
                <div class="flex-1 space-y-1">
                  <div class="h-3 rounded bg-[#FFF0EA] border border-[#F0D5CC] flex items-center px-1">
                    <div class="w-3 h-1.5 rounded bg-[#1A1A1A]/15"></div>
                    <div class="flex-1"></div>
                    <div class="w-4 h-1.5 rounded bg-[#FF758F]/20"></div>
                  </div>
                  <div class="grid grid-cols-3 gap-0.5">
                    <div class="h-6 rounded bg-[#FF758F]/15"></div>
                    <div class="h-6 rounded bg-[#80CBC4]/15"></div>
                    <div class="h-6 rounded bg-[#FDBA74]/15"></div>
                  </div>
                  <div class="h-12 rounded bg-white border border-[#F0D5CC]"></div>
                </div>
              </div>
            </div>

            <!-- POS EMPLEADO -->
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" (click)="selectedPage.set('pos')">
              <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FFF0EA]">
                <p class="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider">🛒 POS Empleado</p>
              </div>
              <div class="p-3 flex gap-1.5">
                <!-- Sidebar -->
                <div class="w-10 rounded-lg bg-[#FFF0EA] border border-[#F0D5CC] p-1 space-y-1">
                  <div class="w-full h-2 rounded bg-[#FF758F]/30"></div>
                  <div class="w-full h-2 rounded bg-[#1A1A1A]/10"></div>
                  <div class="w-full h-2 rounded bg-[#1A1A1A]/10"></div>
                </div>
                <!-- Content -->
                <div class="flex-1 space-y-1">
                  <div class="h-3 rounded bg-[#FFF0EA] border border-[#F0D5CC]"></div>
                  <div class="grid grid-cols-2 gap-0.5">
                    <div class="h-8 rounded bg-[#FF758F]/15"></div>
                    <div class="h-8 rounded bg-[#80CBC4]/15"></div>
                    <div class="h-8 rounded bg-[#FDBA74]/15"></div>
                    <div class="h-8 rounded bg-[#CE93D8]/15"></div>
                  </div>
                </div>
                <!-- Cart -->
                <div class="w-14 rounded-lg bg-white border border-[#F0D5CC] p-1 space-y-0.5">
                  <div class="w-full h-1.5 rounded bg-[#1A1A1A]/15"></div>
                  <div class="w-full h-1 rounded bg-[#FFF0EA]"></div>
                  <div class="w-full h-1 rounded bg-[#FFF0EA]"></div>
                  <div class="w-full h-3 rounded bg-[#FF758F] mt-1"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ====== ARC CAROUSEL ====== -->
        <div class="lg:col-span-3 mt-6">
          <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC] bg-[#FFF0EA]">
              <div class="flex items-center gap-2">
                <span class="material-icons text-[#FF758F] text-lg">style</span>
                <span class="text-sm font-bold text-[#1A1A1A]">Carrusel Arqueado</span>
              </div>
              <span class="text-[10px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider">Flechas o números para navegar</span>
            </div>

            <div class="p-8 bg-[#FDF5F0] flex items-center justify-center overflow-hidden" style="min-height: 400px;">
              <div class="relative" style="width: 15rem; height: 20rem; perspective: 800px;">

                @for (item of carouselItems(); track item.id; let i = $index) {
                  <div
                    class="absolute inset-0 rounded-2xl"
                    [style.z-index]="getArcZIndex(i)"
                    [style.transform]="getArcTransform(i)"
                    [style.opacity]="getArcOpacity(i)"
                    [style.transform-origin]="'bottom center'"
                    [style.transition]="'all 0.7s cubic-bezier(0.23, 1, 0.32, 1)'">

                    <div class="w-full h-full rounded-2xl overflow-hidden border border-white/10"
                      [style.box-shadow]="getArcShadow(i)">

                      <!-- Image Area -->
                      <div class="relative h-[13rem] overflow-hidden"
                        [style.background]="item.gradient">
                        <div class="absolute inset-0 flex items-center justify-center">
                          <span class="text-6xl">{{ item.emoji }}</span>
                        </div>
                        <!-- Overlay -->
                        <div class="absolute inset-0 transition-all duration-600"
                          [style.background]="getArcOverlay(i)">
                        </div>
                        <!-- Tag -->
                        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider text-white transition-all duration-600"
                          [style.background]="getArcTagBg(i)">
                          {{ item.tag }}
                        </span>
                      </div>

                      <!-- Card Body -->
                      <div class="p-4 h-[7rem] flex flex-col justify-between bg-white">
                        <div>
                          <span class="text-[8px] font-bold text-[#FF758F] uppercase tracking-wider block mb-0.5">{{ item.japanese }}</span>
                          <h3 class="text-sm font-serif italic text-[#1A1A1A] font-bold leading-tight">{{ item.name }}</h3>
                        </div>
                        <div class="flex items-center justify-between pt-1.5 border-t border-[#F0D5CC]">
                          <span class="text-xs font-serif italic font-bold text-[#1A1A1A]">{{ item.price }}</span>
                          <div class="flex items-center gap-0.5">
                            <span class="material-icons text-amber-500" style="font-size: 10px">star</span>
                            <span class="text-[9px] font-bold text-[#1A1A1A]">{{ item.rating }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }

              </div>
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-center gap-3 py-4 border-t border-[#F0D5CC] bg-white">
              @for (item of carouselItems(); track item.id; let i = $index) {
                <button (click)="arcSelect(i)"
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  [style.background]="arcActive() === i ? '#FF758F' : '#FFF0EA'"
                  [style.color]="arcActive() === i ? 'white' : '#1A1A1A'"
                  [style.border]="arcActive() === i ? 'none' : '1px solid #F0D5CC'">
                  {{ i + 1 }}
                </button>
              }
              <div class="w-px h-6 bg-[#F0D5CC] mx-1"></div>
              <button (click)="arcPrev()" class="w-9 h-9 rounded-full bg-[#FFF0EA] border border-[#F0D5CC] flex items-center justify-center text-[#1A1A1A] hover:bg-[#FF758F] hover:text-white hover:border-transparent transition-all">
                <span class="material-icons" style="font-size: 16px">chevron_left</span>
              </button>
              <button (click)="arcNext()" class="w-9 h-9 rounded-full bg-[#FFF0EA] border border-[#F0D5CC] flex items-center justify-center text-[#1A1A1A] hover:bg-[#FF758F] hover:text-white hover:border-transparent transition-all">
                <span class="material-icons" style="font-size: 16px">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ====== FULL PAGE PREVIEW ====== -->
        @if (selectedPage()) {
          <div class="lg:col-span-3 mt-6">
            <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden">
              <!-- Header -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC] bg-[#FFF0EA]">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-[#FF758F] text-lg">preview</span>
                  <span class="text-sm font-bold text-[#1A1A1A] capitalize">Vista Previa — {{ getPageLabel(selectedPage()) }}</span>
                </div>
                <button (click)="selectedPage.set('')" class="w-8 h-8 rounded-full bg-white border border-[#F0D5CC] flex items-center justify-center hover:bg-[#FF758F]/10 transition-colors">
                  <span class="material-icons text-[#1A1A1A] text-sm">close</span>
                </button>
              </div>

              <div class="p-4">
                <div class="rounded-2xl border border-[#F0D5CC] overflow-hidden text-xs" [style.background]="getPreviewBg()">

                  <!-- ========== HOME ========== -->
                  @if (selectedPage() === 'home') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3">
                        <span class="material-icons text-lg text-[#FF758F]">menu</span>
                        <span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span>
                      </div>
                      <div class="hidden sm:flex items-center gap-6">
                        <span class="text-[#1A1A1A] font-medium">Inicio</span>
                        <span class="text-[#1A1A1A]/60 font-medium">Productos</span>
                        <span class="text-[#1A1A1A]/60 font-medium">Sobre Nosotros</span>
                        <span class="text-[#1A1A1A]/60 font-medium">Blog</span>
                        <span class="text-[#1A1A1A]/60 font-medium">Contacto</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="material-icons text-[#1A1A1A]">person_outline</span>
                        <span class="material-icons text-[#1A1A1A]">shopping_cart</span>
                      </div>
                    </div>
                    <!-- HERO -->
                    <div class="relative p-6 sm:p-10 border-b border-[#F0D5CC]" [style.background]="'linear-gradient(135deg, ' + getPreviewBg() + ', #FDF5F0)'">
                      <div class="flex flex-col sm:flex-row gap-6 items-center">
                        <div class="flex-1 space-y-3">
                          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF758F] text-white text-[8px] font-bold uppercase tracking-wider w-fit"><span>🌸</span><span>100% Artesanal</span></div>
                          <h1 class="text-xl sm:text-2xl font-serif italic text-[#1A1A1A] leading-tight">Descubre el arte del <span class="not-italic font-bold text-[#FF758F]">Mochi.</span></h1>
                          <p class="text-[#1A1A1A]/75 text-[10px] leading-relaxed max-w-xs">Delicados postres japoneses artesanales con ingredientes premium importados de Japón.</p>
                          <div class="flex gap-2 pt-1">
                            <div class="px-4 py-2 rounded-full bg-[#FF758F] text-white text-[8px] font-bold uppercase tracking-widest">Ver Catálogo</div>
                            <div class="px-4 py-2 rounded-full bg-[#FF758F]/90 text-white text-[8px] font-bold uppercase tracking-widest">Hacer Pedido</div>
                          </div>
                          <div class="flex gap-4 pt-2 border-t border-[#F0D5CC]">
                            <div><span class="text-[#FF758F] font-serif italic font-bold text-sm block">24/7</span><span class="text-[#1A1A1A]/60 text-[7px] uppercase">Pedidos</span></div>
                            <div><span class="text-[#1A1A1A] font-serif italic font-bold text-sm block">45 min</span><span class="text-[#1A1A1A]/60 text-[7px] uppercase">Envío</span></div>
                            <div><span class="text-amber-500 font-serif italic font-bold text-sm block">4.9 ★</span><span class="text-[#1A1A1A]/60 text-[7px] uppercase">Rating</span></div>
                          </div>
                        </div>
                        <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-[#FF758F]/30 to-[#FDBA74]/30 border border-[#F0D5CC] flex items-center justify-center"><span class="text-4xl">🍡</span></div>
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Hero Section</div>
                    </div>
                    <!-- CATEGORIES -->
                    <div class="p-5 border-b border-[#F0D5CC] bg-white">
                      <div class="text-center mb-3"><span class="text-[8px] font-bold uppercase tracking-widest text-[#FF758F]">Variedad Japonesa</span><h2 class="text-sm font-serif italic text-[#1A1A1A]">Explora por Categoría</h2></div>
                      <div class="grid grid-cols-5 gap-2">
                        @for (cat of ['Mochi','Daifuku','Dango','Dorayaki','Hojaldras']; track cat) {
                          <div class="p-2 rounded-2xl bg-[#FDF5F0] border border-[#F0D5CC] text-center"><div class="w-8 h-8 rounded-full bg-white border border-[#F0D5CC] mx-auto mb-1 flex items-center justify-center text-sm">🍡</div><span class="text-[8px] font-serif italic text-[#1A1A1A] font-bold">{{ cat }}</span></div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Categorías</div>
                    </div>
                    <!-- TOP PRODUCTS -->
                    <div class="p-5 border-b border-[#F0D5CC] bg-[#FDF5F0]">
                      <div class="flex justify-between items-center mb-3"><div><span class="text-[8px] font-bold uppercase tracking-widest text-[#FF758F]">⭐ Los Favoritos</span><h2 class="text-sm font-serif italic text-[#1A1A1A]">Más Populares</h2></div><span class="px-3 py-1 rounded-full bg-white border border-[#F0D5CC] text-[8px] font-bold text-[#1A1A1A]">Ver Todos →</span></div>
                      <div class="grid grid-cols-3 gap-2">
                        @for (prod of [1,2,3]; track prod) {
                          <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden"><div class="h-16 bg-gradient-to-br from-[#FF758F]/20 to-[#FDBA74]/20 flex items-center justify-center relative"><span class="text-2xl">🍡</span><span class="absolute top-1 left-1 px-1.5 py-0.5 rounded-full bg-[#FF758F]/80 text-white text-[6px] font-bold">Mochi</span></div><div class="p-2"><span class="text-[7px] font-bold text-[#FF758F]">もchi</span><h3 class="text-[9px] font-serif italic text-[#1A1A1A] font-bold">Mochi Matcha</h3><p class="text-[7px] text-[#1A1A1A]/60 mt-0.5">Suave relleno de matcha</p><div class="flex justify-between items-center mt-1.5 pt-1.5 border-t border-[#F0D5CC]"><span class="text-[9px] font-serif italic font-bold text-[#1A1A1A]">$8.500</span><div class="w-5 h-5 rounded-full bg-[#FF758F] flex items-center justify-center"><span class="material-icons text-white" style="font-size:10px">add_shopping_cart</span></div></div></div></div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Productos Populares</div>
                    </div>
                    <!-- CTA BANNER -->
                    <div class="p-5 bg-[#FF758F] text-white text-center border-b border-[#FF5277]">
                      <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-[7px] font-bold uppercase tracking-widest mb-1">Herramienta Interactiva</div>
                      <h2 class="text-sm font-serif italic font-bold">¿Quieres calcular tu pedido?</h2>
                      <p class="text-white/80 text-[8px] uppercase tracking-wider mt-0.5">Prueba nuestro simulador</p>
                      <div class="inline-block mt-2 px-4 py-1.5 rounded-full bg-[#FF758F] border border-white/30 text-white text-[8px] font-bold uppercase tracking-widest">🧮 Abrir Simulador</div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/20 text-white text-[7px] font-bold uppercase tracking-wider">CTA Banner</div>
                    </div>
                    <!-- REVIEWS -->
                    <div class="p-5 bg-white border-b border-[#F0D5CC]">
                      <div class="text-center mb-3"><span class="text-[8px] font-bold uppercase tracking-widest text-[#FF758F]">💬 Testimonios</span><h2 class="text-sm font-serif italic text-[#1A1A1A]">Lo que Dicen Nuestros Clientes</h2></div>
                      <div class="grid grid-cols-3 gap-2">
                        @for (rev of [1,2,3]; track rev) {
                          <div class="p-3 rounded-2xl bg-[#FDF5F0] border border-[#F0D5CC]"><div class="flex text-amber-500 mb-1"><span class="material-icons" style="font-size:9px">star</span><span class="material-icons" style="font-size:9px">star</span><span class="material-icons" style="font-size:9px">star</span><span class="material-icons" style="font-size:9px">star</span><span class="material-icons" style="font-size:9px">star</span></div><p class="text-[8px] text-[#1A1A1A] italic leading-relaxed">"Excelente calidad y sabor."</p><div class="pt-1.5 mt-1.5 border-t border-[#F0D5CC] flex justify-between text-[7px] font-bold"><span class="font-serif italic text-[#1A1A1A]">— María L.</span><span class="text-[#1A1A1A]/50">Hace 2 días</span></div></div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Reseñas</div>
                    </div>
                    <!-- ABOUT PREVIEW -->
                    <div class="p-5 bg-[#FDF5F0] border-b border-[#F0D5CC]">
                      <div class="flex gap-4 items-center">
                        <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#FF758F]/30 to-[#FDBA74]/30 border border-[#F0D5CC] flex items-center justify-center flex-shrink-0 relative overflow-hidden"><span class="text-3xl">🏯</span><div class="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 to-transparent flex items-end p-1.5"><span class="text-white text-[6px] font-bold">Hecho en La Dorada</span></div></div>
                        <div class="flex-1 space-y-2"><span class="text-[8px] font-bold uppercase tracking-widest text-[#FF758F]">🏯 Sobre Mochi</span><h2 class="text-sm font-serif italic text-[#1A1A1A] font-bold leading-tight">Pioneros en repostería japonesa</h2><p class="text-[8px] text-[#1A1A1A]/70 leading-relaxed">Emprendimiento artesanal de La Dorada, Caldas.</p><div class="flex gap-2"><div class="p-1.5 rounded-lg bg-white border border-[#F0D5CC]"><span class="text-[8px]">🌿</span><span class="text-[6px] font-bold text-[#1A1A1A] block">Ingredientes Premium</span></div><div class="p-1.5 rounded-lg bg-white border border-[#F0D5CC]"><span class="text-[8px]">🎁</span><span class="text-[6px] font-bold text-[#1A1A1A] block">Empaque Regalo</span></div></div><div class="px-4 py-1.5 rounded-full bg-[#FF758F] text-white text-[8px] font-bold uppercase tracking-widest w-fit">Conocer Más →</div></div>
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Sobre Nosotros</div>
                    </div>
                    <!-- BLOG PREVIEW -->
                    <div class="p-5 bg-white border-b border-[#F0D5CC]">
                      <div class="flex justify-between items-center mb-3"><div><span class="text-[8px] font-bold uppercase tracking-widest text-[#FF758F]">📰 Cultura & Recetas</span><h2 class="text-sm font-serif italic text-[#1A1A1A]">Noticias Japonesas</h2></div><span class="px-3 py-1 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[8px] font-bold text-[#1A1A1A]">Ver Blog →</span></div>
                      <div class="grid grid-cols-3 gap-2">
                        @for (post of [1,2,3]; track post) {
                          <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden"><div class="h-12 bg-gradient-to-br from-[#80CBC4]/30 to-[#FDBA74]/20"></div><div class="p-2"><span class="text-[7px] font-bold text-[#FF758F] uppercase">Recetas</span><h3 class="text-[8px] font-serif italic text-[#1A1A1A] font-bold leading-tight">Cómo preparar Mochi</h3><div class="flex justify-between items-center mt-1 pt-1 border-t border-[#F0D5CC] text-[7px]"><span class="text-[#1A1A1A]/50">3 min</span><span class="text-[#FF758F] font-bold">Leer →</span></div></div></div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Blog</div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-4 text-center border-t border-[#F0D5CC]" [style.background]="sidebarBg()"><span class="font-serif italic font-bold text-[#1A1A1A] text-sm">Mochi.</span><p class="text-[8px] text-[#1A1A1A]/60 mt-0.5">La Dorada, Caldas — Postres Japoneses Artesanales</p><div class="flex justify-center gap-3 mt-2"><span class="text-[#1A1A1A]/50">📧 contacto&#64;mochi.co</span><span class="text-[#1A1A1A]/50">📱 +57 300 123 4567</span></div><div class="mt-2 text-[7px] text-[#1A1A1A]/40">© 2026 Mochi Postres Japoneses</div><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Footer</div></div>
                  }

                  <!-- ========== CATÁLOGO ========== -->
                  @if (selectedPage() === 'catalog') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="hidden sm:flex items-center gap-6"><span class="text-[#1A1A1A]/60 font-medium">Inicio</span><span class="text-[#1A1A1A] font-medium">Productos</span><span class="text-[#1A1A1A]/60 font-medium">Sobre Nosotros</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- BANNER -->
                    <div class="p-6 bg-[#FF758F] text-white text-center relative"><div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[8px] font-bold uppercase tracking-wider mb-1">🌸 Colección Completa</div><h1 class="text-xl font-serif italic font-bold">Catálogo de Productos</h1><p class="text-white/80 text-[9px] uppercase tracking-wider mt-1">Explora todos nuestros postres japoneses artesanales</p><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/20 text-white text-[7px] font-bold uppercase tracking-wider">Header Banner</div></div>
                    <!-- SEARCH & FILTERS -->
                    <div class="p-4 bg-white border-b border-[#F0D5CC]">
                      <div class="flex gap-2 mb-3">
                        <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-[#FDF5F0] border border-[#F0D5CC]"><span class="material-icons text-[#1A1A1A]/40" style="font-size:14px">search</span><span class="text-[9px] text-[#1A1A1A]/40">Buscar mochis, daifuku...</span></div>
                        <div class="px-3 py-2 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[9px] text-[#1A1A1A] font-bold">📋 Ordenar</div>
                      </div>
                      <div class="flex gap-1.5 overflow-hidden">
                        <span class="px-3 py-1 rounded-full bg-[#FF758F] text-white text-[8px] font-bold whitespace-nowrap">Todos</span>
                        <span class="px-3 py-1 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[8px] text-[#1A1A1A] font-bold whitespace-nowrap">🍡 Mochi</span>
                        <span class="px-3 py-1 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[8px] text-[#1A1A1A] font-bold whitespace-nowrap">🥠 Daifuku</span>
                        <span class="px-3 py-1 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[8px] text-[#1A1A1A] font-bold whitespace-nowrap">🍢 Dango</span>
                        <span class="px-3 py-1 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[8px] text-[#1A1A1A] font-bold whitespace-nowrap">🥞 Dorayaki</span>
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Filtros & Búsqueda</div>
                    </div>
                    <!-- PRODUCT GRID -->
                    <div class="p-5 bg-[#FDF5F0]">
                      <div class="grid grid-cols-3 gap-3">
                        @for (prod of [1,2,3,4,5,6]; track prod) {
                          <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden"><div class="h-20 bg-gradient-to-br from-[#FF758F]/20 to-[#FDBA74]/20 flex items-center justify-center relative"><span class="text-2xl">🍡</span><span class="absolute top-1 right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center"><span class="material-icons text-[#1A1A1A]" style="font-size:10px">favorite_border</span></span></div><div class="p-2.5"><span class="text-[7px] font-bold text-[#FF758F]">もchi</span><h3 class="text-[9px] font-serif italic text-[#1A1A1A] font-bold">Mochi Matcha</h3><div class="flex items-center gap-0.5 mt-0.5"><span class="material-icons text-amber-500" style="font-size:8px">star</span><span class="text-[7px] text-[#1A1A1A] font-bold">4.9</span></div><div class="flex justify-between items-center mt-1.5 pt-1.5 border-t border-[#F0D5CC]"><span class="text-[9px] font-serif italic font-bold text-[#1A1A1A]">$8.500</span><div class="w-5 h-5 rounded-full bg-[#FF758F] flex items-center justify-center"><span class="material-icons text-white" style="font-size:10px">add_shopping_cart</span></div></div></div></div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Grid de Productos</div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== DETALLE PRODUCTO ========== -->
                  @if (selectedPage() === 'detail') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- BREADCRUMB -->
                    <div class="px-5 py-2 bg-white border-b border-[#F0D5CC] text-[8px] text-[#1A1A1A]/60"><span class="text-[#FF758F]">Inicio</span> / <span>Catálogo</span> / <span class="text-[#1A1A1A] font-bold">Mochi Matcha</span><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Breadcrumb</div></div>
                    <!-- PRODUCT CARD -->
                    <div class="p-5 bg-[#FDF5F0]">
                      <div class="bg-white rounded-3xl border border-[#F0D5CC] overflow-hidden">
                        <div class="grid grid-cols-2 gap-0">
                          <!-- IMAGE -->
                          <div class="relative bg-gradient-to-br from-[#FF758F]/20 to-[#FDBA74]/20 p-6 flex items-center justify-center" style="min-height:200px">
                            <span class="text-6xl">🍡</span>
                            <span class="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#FF758F]/90 text-white text-[7px] font-bold">OFERTA</span>
                            <span class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center"><span class="material-icons text-[#1A1A1A]" style="font-size:12px">favorite_border</span></span>
                            <div class="absolute bottom-3 left-3 right-3 flex gap-1">
                              <div class="flex-1 h-8 rounded bg-white/60 border border-white/80"></div>
                              <div class="flex-1 h-8 rounded bg-white/60 border border-white/80"></div>
                              <div class="flex-1 h-8 rounded bg-white/60 border border-white/80"></div>
                            </div>
                            <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Imagen Principal</div>
                          </div>
                          <!-- DETAILS -->
                          <div class="p-5 space-y-3">
                            <div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-full bg-[#FF758F] text-white text-[7px] font-bold">もchi</span><span class="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[7px] font-bold">En Stock</span></div>
                            <h1 class="text-lg font-serif italic text-[#1A1A1A] font-bold">Mochi Matcha Premium</h1>
                            <div class="flex items-center gap-1"><span class="material-icons text-amber-500" style="font-size:10px">star</span><span class="text-[9px] text-[#1A1A1A] font-bold">4.9 (128 reseñas)</span></div>
                            <p class="text-[8px] text-[#1A1A1A]/70 leading-relaxed">Suave masa de arroz rellena de crema de matcha premium de Uji. Textura delicada y sabor equilibrado.</p>
                            <div class="flex items-baseline gap-2"><span class="text-xl font-serif italic text-[#FF758F] font-bold">$8.500</span><span class="text-[9px] text-[#1A1A1A]/40 line-through">$10.000</span></div>
                            <div class="flex items-center gap-2"><span class="text-[8px] text-[#1A1A1A]">Cantidad:</span><div class="flex items-center gap-1"><div class="w-6 h-6 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] flex items-center justify-center text-[10px] text-[#1A1A1A]">−</div><span class="text-[10px] font-bold text-[#1A1A1A] w-4 text-center">2</span><div class="w-6 h-6 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] flex items-center justify-center text-[10px] text-[#1A1A1A]">+</div></div></div>
                            <div class="flex gap-2"><div class="flex-1 py-2 rounded-full bg-[#FF758F] text-white text-[8px] font-bold text-center">🛒 Agregar al Carrito</div><div class="flex-1 py-2 rounded-full bg-[#FF758F]/90 text-white text-[8px] font-bold text-center">🛍️ Comprar Ahora</div></div>
                            <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Detalles</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- RELATED -->
                    <div class="p-5 bg-white border-t border-[#F0D5CC]"><h3 class="text-xs font-serif italic text-[#1A1A1A] font-bold mb-3">Productos Relacionados</h3><div class="grid grid-cols-4 gap-2">@for (p of [1,2,3,4]; track p) {<div class="rounded-xl bg-[#FDF5F0] border border-[#F0D5CC] p-2 text-center"><div class="w-10 h-10 rounded-full bg-white border border-[#F0D5CC] mx-auto mb-1 flex items-center justify-center text-sm">🍡</div><span class="text-[7px] font-serif italic text-[#1A1A1A] font-bold block">Mochi</span><span class="text-[8px] font-bold text-[#FF758F]">$8.500</span></div>}<div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Relacionados</div></div></div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== SOBRE NOSOTROS ========== -->
                  @if (selectedPage() === 'about') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="hidden sm:flex items-center gap-6"><span class="text-[#1A1A1A]/60 font-medium">Inicio</span><span class="text-[#1A1A1A]/60 font-medium">Productos</span><span class="text-[#1A1A1A] font-medium">Sobre Nosotros</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- HERO -->
                    <div class="relative p-8 bg-[#4A3F35] text-white text-center" style="min-height:120px">
                      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563805042-7684c019e1cb')] bg-cover bg-center opacity-20"></div>
                      <div class="relative z-10"><div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[8px] font-bold uppercase tracking-wider mb-2">🏯 Nuestra Historia</div><h1 class="text-xl font-serif italic font-bold">Sobre Mochi</h1><p class="text-white/80 text-[9px] uppercase tracking-wider mt-1">Conoce al equipo detrás de los postres</p></div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-white/20 text-white text-[7px] font-bold uppercase tracking-wider">Hero Oscuro</div>
                    </div>
                    <!-- TEAM -->
                    <div class="p-5 bg-white">
                      <div class="text-center mb-3"><span class="text-[8px] font-bold uppercase tracking-widest text-[#FF758F]">Equipo Fundador</span><h2 class="text-sm font-serif italic text-[#1A1A1A]">Nuestros Creadores</h2></div>
                      <div class="grid grid-cols-3 gap-3">
                        @for (f of ['Michel','Felipe','Neider']; track f) {
                          <div class="p-3 rounded-2xl bg-[#FAF7F2] border border-[#F0D5CC] text-center"><div class="w-12 h-12 rounded-full bg-[#FF758F]/20 border border-[#F0D5CC] mx-auto mb-2 flex items-center justify-center text-sm font-bold text-[#FF758F]">{{ f[0] }}</div><h3 class="text-[9px] font-serif italic text-[#1A1A1A] font-bold">{{ f }}</h3><span class="text-[7px] text-[#FF758F] font-bold">Co-Fundador</span><p class="text-[7px] text-[#1A1A1A]/60 mt-1">Pasión por la repostería japonesa.</p></div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Equipo</div>
                    </div>
                    <!-- MISSION -->
                    <div class="p-5 bg-[#FAF7F2] border-t border-[#F0D5CC]">
                      <div class="grid grid-cols-2 gap-3">
                        <div class="p-4 rounded-2xl bg-[#FFD6E0] border border-[#FF758F]/20"><span class="text-lg">🎯</span><h3 class="text-[10px] font-serif italic text-[#1A1A1A] font-bold mt-1">Misión</h3><p class="text-[7px] text-[#1A1A1A]/70 mt-1 leading-relaxed">Traer la auténtica cultura del postre japonés a Colombia.</p></div>
                        <div class="p-4 rounded-2xl bg-white border border-[#F0D5CC]"><span class="text-lg">👁️</span><h3 class="text-[10px] font-serif italic text-[#1A1A1A] font-bold mt-1">Visión</h3><p class="text-[7px] text-[#1A1A1A]/70 mt-1 leading-relaxed">Ser la marca líder en repostería japonesa artesanal.</p></div>
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Misión & Visión</div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== CONTACTO ========== -->
                  @if (selectedPage() === 'contact') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="hidden sm:flex items-center gap-6"><span class="text-[#1A1A1A]/60 font-medium">Inicio</span><span class="text-[#1A1A1A]/60 font-medium">Productos</span><span class="text-[#1A1A1A] font-medium">Contacto</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- HEADER -->
                    <div class="p-6 bg-white text-center border-b border-[#F0D5CC]"><div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD6E0] text-[8px] font-bold uppercase tracking-wider mb-1 text-[#1A1A1A]">📍 Contacto</div><h1 class="text-xl font-serif italic text-[#1A1A1A] font-bold">Hablemos</h1><p class="text-[9px] text-[#1A1A1A]/60 uppercase tracking-wider mt-1">Estamos aquí para atenderte</p><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Header</div></div>
                    <!-- FORM + INFO -->
                    <div class="p-5 bg-[#FAF7F2]">
                      <div class="grid grid-cols-5 gap-3">
                        <!-- FORM -->
                        <div class="col-span-3 bg-white rounded-2xl p-4 border border-[#F0D5CC] space-y-2">
                          <div class="space-y-1"><span class="text-[7px] font-bold text-[#1A1A1A]/60 uppercase">Nombre</span><div class="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#F0D5CC] text-[8px] text-[#1A1A1A]/40">Tu nombre completo</div></div>
                          <div class="space-y-1"><span class="text-[7px] font-bold text-[#1A1A1A]/60 uppercase">Email</span><div class="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#F0D5CC] text-[8px] text-[#1A1A1A]/40">correo&#64;ejemplo.com</div></div>
                          <div class="space-y-1"><span class="text-[7px] font-bold text-[#1A1A1A]/60 uppercase">Asunto</span><div class="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#F0D5CC] text-[8px] text-[#1A1A1A]/40">¿En qué podemos ayudarte?</div></div>
                          <div class="space-y-1"><span class="text-[7px] font-bold text-[#1A1A1A]/60 uppercase">Mensaje</span><div class="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#F0D5CC] text-[8px] text-[#1A1A1A]/40" style="min-height:40px">Escribe tu mensaje aquí...</div></div>
                          <div class="py-2 rounded-full bg-[#4A3F35] text-white text-[8px] font-bold text-center">Enviar Mensaje</div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Formulario</div>
                        </div>
                        <!-- INFO -->
                        <div class="col-span-2 space-y-2">
                          <div class="bg-white rounded-2xl p-3 border border-[#F0D5CC] space-y-2">
                            <div class="flex items-center gap-2"><span class="material-icons text-[#8C3A3A]" style="font-size:12px">location_on</span><div><span class="text-[8px] font-bold text-[#1A1A1A] block">Dirección</span><span class="text-[7px] text-[#1A1A1A]/60">La Dorada, Caldas</span></div></div>
                            <div class="flex items-center gap-2"><span class="material-icons text-[#8C3A3A]" style="font-size:12px">schedule</span><div><span class="text-[8px] font-bold text-[#1A1A1A] block">Horario</span><span class="text-[7px] text-[#1A1A1A]/60">Lun-Sáb 8AM-8PM</span></div></div>
                            <div class="flex items-center gap-2"><span class="material-icons text-[#8C3A3A]" style="font-size:12px">phone</span><div><span class="text-[8px] font-bold text-[#1A1A1A] block">Teléfono</span><span class="text-[7px] text-[#1A1A1A]/60">+57 300 123 4567</span></div></div>
                          </div>
                          <div class="p-3 rounded-2xl bg-[#25D366] text-white text-center"><span class="text-[8px] font-bold">💬 WhatsApp Rápido</span></div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Info Contacto</div>
                        </div>
                      </div>
                    </div>
                    <!-- MAP -->
                    <div class="h-20 bg-[#80CBC4]/20 border-t border-[#F0D5CC] flex items-center justify-center"><div class="text-center"><span class="material-icons text-[#80CBC4]" style="font-size:20px">map</span><span class="text-[7px] text-[#1A1A1A]/60 block mt-0.5">Mapa de ubicación</span></div><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Mapa</div></div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== LOGIN ========== -->
                  @if (selectedPage() === 'login') {
                    <div class="flex items-center justify-center p-6" [style.background]="'linear-gradient(135deg, ' + getPreviewBg() + ', #FDF5F0)'" style="min-height:300px">
                      <div class="bg-white rounded-3xl border border-[#F0D5CC] overflow-hidden w-full max-w-sm">
                        <!-- HEADER -->
                        <div class="p-5 text-center border-b border-[#F0D5CC]">
                          <div class="w-10 h-10 rounded-full bg-[#FF758F] mx-auto mb-2 flex items-center justify-center text-white font-serif italic font-bold text-sm">M</div>
                          <h1 class="text-lg font-serif italic text-[#1A1A1A] font-bold">Bienvenido de Vuelta</h1>
                          <p class="text-[8px] text-[#1A1A1A]/60 mt-0.5">Inicia sesión en tu cuenta</p>
                        </div>
                        <!-- FORM -->
                        <div class="p-5 space-y-3">
                          <div class="space-y-1"><span class="text-[7px] font-bold text-[#1A1A1A]/60 uppercase">Email</span><div class="px-3 py-2 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[9px] text-[#1A1A1A]/40">correo&#64;ejemplo.com</div></div>
                          <div class="space-y-1"><span class="text-[7px] font-bold text-[#1A1A1A]/60 uppercase">Contraseña</span><div class="px-3 py-2 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[9px] text-[#1A1A1A]/40 flex items-center justify-between"><span>••••••••</span><span class="material-icons text-[#1A1A1A]/40" style="font-size:12px">visibility_off</span></div></div>
                          <div class="text-right"><span class="text-[7px] text-[#FF758F] font-bold">¿Olvidaste tu contraseña?</span></div>
                          <div class="py-2.5 rounded-full bg-[#FF758F] text-white text-[9px] font-bold text-center">Iniciar Sesión</div>
                          <div class="text-center"><span class="text-[7px] text-[#1A1A1A]/60">¿No tienes cuenta? </span><span class="text-[7px] text-[#FF758F] font-bold">Regístrate aquí</span></div>
                        </div>
                        <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Login Card</div>
                      </div>
                    </div>
                  }

                  <!-- ========== CARRITO ========== -->
                  @if (selectedPage() === 'cart') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- HEADER -->
                    <div class="px-5 py-3 bg-white border-b border-[#F0D5CC] flex justify-between items-center"><h1 class="text-sm font-serif italic text-[#1A1A1A] font-bold">Mi Carrito</h1><span class="text-[8px] text-[#FF758F] font-bold">Seguir Explorando →</span><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Header</div></div>
                    <!-- CONTENT -->
                    <div class="p-5 bg-[#FAF7F2]">
                      <div class="grid grid-cols-5 gap-3">
                        <!-- ITEMS -->
                        <div class="col-span-3 space-y-2">
                          @for (item of [1,2]; track item) {
                            <div class="bg-white rounded-2xl border border-[#F0D5CC] p-3 flex gap-3">
                              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF758F]/20 to-[#FDBA74]/20 flex items-center justify-center flex-shrink-0"><span class="text-xl">🍡</span></div>
                              <div class="flex-1"><h3 class="text-[9px] font-serif italic text-[#1A1A1A] font-bold">Mochi Matcha</h3><span class="text-[7px] text-[#1A1A1A]/60">$8.500 c/u</span><div class="flex items-center justify-between mt-1.5"><div class="flex items-center gap-1"><div class="w-5 h-5 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] flex items-center justify-center text-[8px]">−</div><span class="text-[9px] font-bold text-[#1A1A1A] w-3 text-center">2</span><div class="w-5 h-5 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] flex items-center justify-center text-[8px]">+</div></div><span class="text-[9px] font-serif italic font-bold text-[#1A1A1A]">$17.000</span></div></div>
                              <span class="material-icons text-[#1A1A1A]/30 self-start" style="font-size:12px">close</span>
                            </div>
                          }
                          <div class="text-center py-1.5 rounded-full bg-[#FFE4E6] text-red-500 text-[8px] font-bold">🗑️ Vaciar Carrito</div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Items</div>
                        </div>
                        <!-- SUMMARY -->
                        <div class="col-span-2">
                          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-4 space-y-2 sticky">
                            <h3 class="text-[10px] font-serif italic text-[#1A1A1A] font-bold">Resumen del Pedido</h3>
                            <div class="flex justify-between text-[8px] text-[#1A1A1A]"><span>Subtotal</span><span class="font-bold">$34.000</span></div>
                            <div class="flex justify-between text-[8px] text-[#1A1A1A]"><span>Envío</span><span class="font-bold text-[#80CBC4]">$5.000</span></div>
                            <div class="px-2 py-1.5 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[7px] text-[#1A1A1A]/40 text-center">🏷️ Cupón de descuento</div>
                            <div class="border-t border-[#F0D5CC] pt-2 flex justify-between text-[10px]"><span class="font-bold text-[#1A1A1A]">Total</span><span class="font-serif italic font-bold text-[#FF758F]">$39.000</span></div>
                            <div class="py-2 rounded-full bg-[#FF758F] text-white text-[8px] font-bold text-center">🛍️ Proceder al Checkout</div>
                            <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Resumen</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== PERFIL ========== -->
                  @if (selectedPage() === 'profile') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#FF758F]">person</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- PROFILE CARD -->
                    <div class="p-5 bg-[#FDF5F0]" style="min-height:280px">
                      <div class="bg-white rounded-3xl border border-[#F0D5CC] p-5 space-y-4 max-w-sm mx-auto">
                        <!-- AVATAR -->
                        <div class="text-center">
                          <div class="w-14 h-14 rounded-full bg-[#FF758F] mx-auto mb-2 flex items-center justify-center text-white font-serif italic font-bold text-lg">A</div>
                          <h2 class="text-sm font-serif italic text-[#1A1A1A] font-bold">Admin Mochi</h2>
                          <p class="text-[8px] text-[#1A1A1A]/60">admin&#64;mochi.co</p>
                          <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-[#FF758F]/10 text-[#FF758F] text-[7px] font-bold">Administrador</span>
                        </div>
                        <!-- FIELDS -->
                        <div class="grid grid-cols-2 gap-2">
                          <div class="p-2 rounded-xl bg-[#FDF5F0] border border-[#F0D5CC] text-center"><span class="text-[6px] text-[#1A1A1A]/50 uppercase font-bold block">Teléfono</span><span class="text-[8px] text-[#1A1A1A] font-bold">300 123 4567</span></div>
                          <div class="p-2 rounded-xl bg-[#FDF5F0] border border-[#F0D5CC] text-center"><span class="text-[6px] text-[#1A1A1A]/50 uppercase font-bold block">Dirección</span><span class="text-[8px] text-[#1A1A1A] font-bold">La Dorada</span></div>
                        </div>
                        <!-- ACTIONS -->
                        <div class="space-y-1.5">
                          <div class="flex items-center gap-2 p-2 rounded-xl bg-[#FDF5F0] border border-[#F0D5CC]"><span class="material-icons text-[#FF758F]" style="font-size:14px">receipt_long</span><span class="text-[9px] font-bold text-[#1A1A1A]">Mis Pedidos</span></div>
                          <div class="flex items-center gap-2 p-2 rounded-xl bg-[#FDF5F0] border border-[#F0D5CC]"><span class="material-icons text-[#80CBC4]" style="font-size:14px">storefront</span><span class="text-[9px] font-bold text-[#1A1A1A]">Ver Tienda</span></div>
                          <div class="flex items-center gap-2 p-2 rounded-xl bg-[#FFF3E0] border border-[#FDBA74]/30"><span class="material-icons text-[#FDBA74]" style="font-size:14px">admin_panel_settings</span><span class="text-[9px] font-bold text-[#1A1A1A]">Panel Admin</span></div>
                          <div class="flex items-center gap-2 p-2 rounded-xl bg-[#E0F2F1] border border-[#80CBC4]/30"><span class="material-icons text-[#80CBC4]" style="font-size:14px">point_of_sale</span><span class="text-[9px] font-bold text-[#1A1A1A]">POS Empleado</span></div>
                        </div>
                        <div class="py-2 rounded-full bg-[#FFE4E6] text-red-500 text-[8px] font-bold text-center">🚪 Cerrar Sesión</div>
                        <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Mi Perfil</div>
                      </div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== SIMULADOR ========== -->
                  @if (selectedPage() === 'simulator') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- HEADER -->
                    <div class="p-6 bg-white text-center border-b border-[#F0D5CC]"><div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF758F] text-white text-[8px] font-bold uppercase tracking-wider mb-1">🧮 Herramienta</div><h1 class="text-xl font-serif italic text-[#1A1A1A] font-bold">Simulador de Pedidos</h1><p class="text-[9px] text-[#1A1A1A]/60 uppercase tracking-wider mt-1">Calcula el valor exacto de tu pedido</p><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Header</div></div>
                    <!-- CONTENT -->
                    <div class="p-5 bg-[#FDF5F0]">
                      <div class="grid grid-cols-5 gap-3">
                        <!-- PRODUCTS -->
                        <div class="col-span-3 bg-white rounded-2xl border border-[#F0D5CC] p-4">
                          <h3 class="text-[10px] font-serif italic text-[#1A1A1A] font-bold mb-2">Selecciona tus Productos</h3>
                          <div class="grid grid-cols-2 gap-2">
                            @for (prod of [1,2,3,4]; track prod) {
                              <div class="p-2 rounded-xl bg-[#FDF5F0] border border-[#F0D5CC] flex gap-2 items-center"><div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF758F]/20 to-[#FDBA74]/20 flex items-center justify-center flex-shrink-0"><span class="text-lg">🍡</span></div><div class="flex-1"><h4 class="text-[8px] font-serif italic text-[#1A1A1A] font-bold">Mochi Matcha</h4><span class="text-[8px] font-bold text-[#FF758F]">$8.500</span><div class="flex items-center gap-1 mt-0.5"><div class="w-4 h-4 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] flex items-center justify-center text-[7px]">−</div><span class="text-[8px] font-bold text-[#1A1A1A]">0</span><div class="w-4 h-4 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] flex items-center justify-center text-[7px]">+</div></div></div></div>
                            }
                          </div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Selección</div>
                        </div>
                        <!-- SUMMARY -->
                        <div class="col-span-2 bg-white rounded-2xl border border-[#F0D5CC] p-4 space-y-2 sticky">
                          <h3 class="text-[10px] font-serif italic text-[#1A1A1A] font-bold">Resumen</h3>
                          <div class="space-y-1">
                            <div class="flex justify-between text-[7px] text-[#1A1A1A]"><span>Mochi Matcha x2</span><span class="font-bold">$17.000</span></div>
                            <div class="flex justify-between text-[7px] text-[#1A1A1A]"><span>Dorayaki x1</span><span class="font-bold">$12.000</span></div>
                          </div>
                          <div class="border-t border-[#F0D5CC] pt-1 space-y-1">
                            <div class="flex justify-between text-[7px] text-[#1A1A1A]"><span>Subtotal</span><span class="font-bold">$29.000</span></div>
                            <div class="flex justify-between text-[7px] text-[#1A1A1A]"><span>Envío (45 min)</span><span class="font-bold text-[#80CBC4]">$5.000</span></div>
                            <div class="flex justify-between text-[9px] font-bold"><span class="text-[#1A1A1A]">Total</span><span class="font-serif italic text-[#FF758F]">$34.000</span></div>
                          </div>
                          <div class="py-2 rounded-full bg-[#FF758F] text-white text-[8px] font-bold text-center">🛒 Agregar al Carrito</div>
                          <div class="py-1.5 rounded-full bg-[#FF758F]/90 text-white text-[8px] font-bold text-center">🛍️ Comprar Ahora</div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Cotización</div>
                        </div>
                      </div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== BLOG ========== -->
                  @if (selectedPage() === 'blog') {
                    <!-- NAVBAR -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC]" [style.background]="sidebarBg()">
                      <div class="flex items-center gap-3"><span class="material-icons text-lg text-[#FF758F]">menu</span><span class="font-serif italic font-bold text-sm text-[#1A1A1A]">Mochi.</span></div>
                      <div class="hidden sm:flex items-center gap-6"><span class="text-[#1A1A1A]/60 font-medium">Inicio</span><span class="text-[#1A1A1A]/60 font-medium">Productos</span><span class="text-[#1A1A1A] font-medium">Blog</span></div>
                      <div class="flex items-center gap-2"><span class="material-icons text-[#1A1A1A]">person_outline</span><span class="material-icons text-[#1A1A1A]">shopping_cart</span></div>
                    </div>
                    <!-- HEADER -->
                    <div class="p-6 bg-white text-center border-b border-[#F0D5CC]"><div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD6E0] text-[8px] font-bold uppercase tracking-wider mb-1 text-[#1A1A1A]">📰 Blog</div><h1 class="text-xl font-serif italic text-[#1A1A1A] font-bold">Noticias y Recetas</h1><p class="text-[9px] text-[#1A1A1A]/60 uppercase tracking-wider mt-1">Cultura japonesa y consejos dulces</p><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Header</div></div>
                    <!-- ARTICLES GRID -->
                    <div class="p-5 bg-[#FAF7F2]">
                      <div class="grid grid-cols-3 gap-3">
                        @for (post of [1,2,3]; track post) {
                          <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden">
                            <div class="h-20 bg-gradient-to-br from-[#80CBC4]/30 to-[#FDBA74]/20 relative"><span class="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#4A3F35] text-white text-[6px] font-bold">Recetas</span></div>
                            <div class="p-3">
                              <div class="flex items-center gap-1 mb-1"><span class="w-4 h-4 rounded-full bg-[#FF758F]/20 flex items-center justify-center text-[6px] text-[#FF758F] font-bold">M</span><span class="text-[6px] text-[#1A1A1A]/50">Michel • 15 Ene 2026</span></div>
                              <h3 class="text-[9px] font-serif italic text-[#1A1A1A] font-bold leading-tight hover:text-[#FF758F]">Cómo preparar Mochi en casa: Guía completa</h3>
                              <p class="text-[7px] text-[#1A1A1A]/60 mt-1 leading-relaxed">Aprende los pasos para crear mochis perfectos desde tu cocina.</p>
                              <div class="flex justify-between items-center mt-2 pt-2 border-t border-[#F0D5CC] text-[7px]"><span class="text-[#1A1A1A]/50">3 min lectura</span><span class="text-[#FF758F] font-bold">Leer Artículo →</span></div>
                            </div>
                          </div>
                        }
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Artículos</div>
                    </div>
                    <!-- FOOTER -->
                    <div class="p-3 text-center border-t border-[#F0D5CC] bg-[#1A1A1A] text-white"><span class="font-serif italic font-bold text-[10px]">Mochi.</span><p class="text-[7px] text-white/50 mt-0.5">© 2026 Mochi Postres Japoneses</p></div>
                  }

                  <!-- ========== ADMIN DASHBOARD ========== -->
                  @if (selectedPage() === 'admin') {
                    <!-- ADMIN HEADER -->
                    <div class="flex items-center justify-between px-4 py-3 border-b border-[#F0D5CC] bg-white">
                      <div class="flex items-center gap-2">
                        <span class="material-icons text-[#FF758F]">menu</span>
                        <span class="px-2 py-0.5 rounded-full bg-[#FFD6E0] text-[7px] font-bold text-[#1A1A1A]">Panel de Admin</span>
                        <span class="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[7px] font-bold text-[#2C5350]">Schema v2</span>
                      </div>
                      <div class="flex items-center gap-1 bg-[#FAF7F2] rounded-full p-0.5">
                        <span class="px-2 py-0.5 rounded-full bg-[#4A3F35] text-white text-[7px] font-bold">Métricas</span>
                        <span class="px-2 py-0.5 text-[7px] font-bold text-[#1A1A1A]">Menú</span>
                        <span class="px-2 py-0.5 text-[7px] font-bold text-[#1A1A1A]">Pedidos</span>
                        <span class="px-2 py-0.5 text-[7px] font-bold text-[#1A1A1A]">Roles</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="material-icons text-[#1A1A1A]" style="font-size:14px">logout</span>
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Admin Header</div>
                    </div>
                    <!-- DASHBOARD CONTENT -->
                    <div class="p-4 bg-[#FAF7F2]">
                      <!-- STATS -->
                      <div class="grid grid-cols-4 gap-2 mb-3">
                        <div class="p-3 rounded-xl bg-white border border-[#F0D5CC]"><span class="text-[6px] text-[#1A1A1A]/50 uppercase font-bold">Ventas Hoy</span><span class="text-sm font-serif italic font-bold text-[#1A1A1A] block">$245.000</span><span class="text-[7px] text-[#80CBC4] font-bold">↑ 12%</span></div>
                        <div class="p-3 rounded-xl bg-white border border-[#F0D5CC]"><span class="text-[6px] text-[#1A1A1A]/50 uppercase font-bold">Pedidos</span><span class="text-sm font-serif italic font-bold text-[#1A1A1A] block">18</span><span class="text-[7px] text-[#80CBC4] font-bold">↑ 5</span></div>
                        <div class="p-3 rounded-xl bg-white border border-[#F0D5CC]"><span class="text-[6px] text-[#1A1A1A]/50 uppercase font-bold">Productos</span><span class="text-sm font-serif italic font-bold text-[#1A1A1A] block">24</span></div>
                        <div class="p-3 rounded-xl bg-white border border-[#F0D5CC]"><span class="text-[6px] text-[#1A1A1A]/50 uppercase font-bold">Empleados</span><span class="text-sm font-serif italic font-bold text-[#1A1A1A] block">6</span></div>
                      </div>
                      <!-- TABLE -->
                      <div class="bg-white rounded-xl border border-[#F0D5CC] overflow-hidden">
                        <div class="px-3 py-2 border-b border-[#F0D5CC] bg-[#FAF7F2]"><span class="text-[8px] font-bold text-[#1A1A1A]">Últimos Pedidos</span></div>
                        <div class="divide-y divide-[#F0D5CC]">
                          @for (order of ['#001','#002','#003']; track order) {
                            <div class="px-3 py-2 flex items-center justify-between text-[8px]">
                              <span class="font-bold text-[#1A1A1A]">{{ order }}</span>
                              <span class="px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-green-700 text-[6px] font-bold">Entregado</span>
                              <span class="text-[#1A1A1A]/60">María L.</span>
                              <span class="font-bold text-[#1A1A1A]">$34.000</span>
                            </div>
                          }
                        </div>
                      </div>
                      <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FF758F]/80 text-white text-[7px] font-bold uppercase tracking-wider">Métricas + Tabla</div>
                    </div>
                  }

                  <!-- ========== POS EMPLEADO ========== -->
                  @if (selectedPage() === 'pos') {
                    <div class="bg-[#2E2620] text-white">
                      <!-- POS HEADER -->
                      <div class="flex items-center justify-between px-4 py-3 border-b border-[#4A3F35] bg-[#362D26] rounded-t-2xl">
                        <div class="flex items-center gap-2"><div class="w-7 h-7 rounded-full bg-[#FFD6E0] flex items-center justify-center"><span class="text-[#4A3F35] font-serif italic font-bold text-[8px]">M</span></div><span class="font-serif italic font-bold text-[10px]">POS Mochi</span></div>
                        <div class="text-right"><span class="text-[7px] text-white/60 block">Empleado: Neider</span><span class="text-[7px] text-[#FFD6E0] font-bold">Sucursal: Centro</span></div>
                        <div class="text-right"><span class="text-[7px] text-white/60 block">Ventas Hoy</span><span class="text-[10px] text-[#FFD6E0] font-serif italic font-bold">$245.000</span></div>
                        <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFD6E0]/20 text-[#FFD6E0] text-[7px] font-bold uppercase tracking-wider">POS Header</div>
                      </div>
                      <!-- POS CONTENT -->
                      <div class="p-4 grid grid-cols-5 gap-3 bg-[#2E2620]">
                        <!-- PRODUCTS -->
                        <div class="col-span-3 bg-[#362D26] rounded-2xl border border-[#4A3F35] p-3">
                          <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2E2620] border border-[#4A3F35] mb-3"><span class="material-icons text-white/40" style="font-size:12px">search</span><span class="text-[8px] text-white/30">Buscar producto...</span></div>
                          <div class="grid grid-cols-3 gap-2">
                            @for (prod of [1,2,3,4,5,6]; track prod) {
                              <div class="p-2 rounded-xl bg-[#2E2620] border border-[#4A3F35] text-center"><div class="w-10 h-10 rounded-lg bg-[#4A3F35] mx-auto mb-1 flex items-center justify-center text-lg">🍡</div><span class="text-[8px] font-bold text-white block">Mochi Matcha</span><span class="text-[8px] text-[#FFD6E0] font-bold">$8.500</span></div>
                            }
                          </div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFD6E0]/20 text-[#FFD6E0] text-[7px] font-bold uppercase tracking-wider">Catálogo POS</div>
                        </div>
                        <!-- CART -->
                        <div class="col-span-2 bg-[#362D26] rounded-2xl border border-[#4A3F35] p-3 space-y-2">
                          <h3 class="text-[9px] font-serif italic font-bold">Carrito de Venta</h3>
                          <div class="space-y-1">
                            @for (item of [1,2]; track item) {
                              <div class="flex items-center gap-2 p-1.5 rounded-lg bg-[#2E2620] border border-[#4A3F35]"><div class="w-7 h-7 rounded bg-[#4A3F35] flex items-center justify-center text-xs">🍡</div><div class="flex-1"><span class="text-[7px] font-bold text-white block">Mochi Matcha</span><span class="text-[6px] text-white/50">x2</span></div><span class="text-[7px] text-[#FFD6E0] font-bold">$17.000</span></div>
                            }
                          </div>
                          <div class="border-t border-[#4A3F35] pt-2 space-y-1">
                            <div class="flex justify-between text-[7px]"><span class="text-white/60">Subtotal</span><span class="font-bold text-white">$29.000</span></div>
                            <div class="flex justify-between text-[7px]"><span class="text-white/60">IVA (19%)</span><span class="font-bold text-white">$5.510</span></div>
                            <div class="flex justify-between text-[9px] font-bold"><span class="text-white">Total</span><span class="text-[#FFD6E0] font-serif italic">$34.510</span></div>
                          </div>
                          <div class="grid grid-cols-2 gap-1.5">
                            <div class="py-1.5 rounded-lg bg-[#80CBC4] text-[#2E2620] text-[7px] font-bold text-center">💵 Efectivo</div>
                            <div class="py-1.5 rounded-lg bg-[#FFD6E0] text-[#4A3F35] text-[7px] font-bold text-center">💳 Tarjeta</div>
                          </div>
                          <div class="py-2 rounded-lg bg-[#FF758F] text-white text-[8px] font-bold text-center">✅ Confirmar Venta</div>
                          <div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FFD6E0]/20 text-[#FFD6E0] text-[7px] font-bold uppercase tracking-wider">Caja</div>
                        </div>
                      </div>
                    </div>
                  }

                </div>
              </div>

              <!-- Section Legend -->
              <div class="px-4 py-3 border-t border-[#F0D5CC] bg-[#FDF5F0]">
                <p class="text-[10px] font-bold text-[#1A1A1A] mb-2">Secciones de la página:</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (tag of getPageTags(selectedPage()); track tag) {
                    <span class="px-2 py-0.5 rounded-full text-[8px] font-bold border" [style.background]="tag.color + '15'" [style.color]="tag.color" [style.border-color]="tag.color + '30'">{{ tag.label }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ====== PREVIEW ====== -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Background Preview -->
          <div class="rounded-2xl border border-[#F0D5CC] overflow-hidden"
            [style.background]="previewBg()">
            <div class="p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
              <h2 class="text-4xl mb-2" [style.font-family]="fontSerif()">
                <span class="italic">Mochi.</span>
              </h2>
              <p class="text-sm opacity-70" [style.font-family]="fontSans()">
                Boutique Artesanal
              </p>
            </div>
          </div>

          <!-- Typography Preview -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-6">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-4">Tipografía Preview</h3>
            <div class="space-y-4">
              <div>
                <p class="text-3xl italic" [style.font-family]="fontSerif()">Playfair Display</p>
                <p class="text-[10px] text-[#1A1A1A]/50 mt-1">Serif — Títulos</p>
              </div>
              <div>
                <p class="text-lg" [style.font-family]="fontSans()">Plus Jakarta Sans</p>
                <p class="text-[10px] text-[#1A1A1A]/50 mt-1">Sans — Cuerpo</p>
              </div>
              <div class="border-t border-[#F0D5CC] pt-4">
                <p class="text-sm" [style.font-family]="fontSans()">
                  The quick brown fox jumps over the lazy dog. 0123456789
                </p>
                <p class="text-sm italic mt-2" [style.font-family]="fontSerif()">
                  The quick brown fox jumps over the lazy dog. 0123456789
                </p>
              </div>
            </div>
          </div>

          <!-- Component Preview -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] p-6">
            <h3 class="text-sm font-bold text-[#1A1A1A] mb-4">Componentes Preview</h3>
            <div class="grid grid-cols-2 gap-4">
              <!-- Buttons -->
              <div class="space-y-3">
                <p class="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Botones</p>
                <button class="px-4 py-2 rounded-full text-xs font-bold transition-colors"
                  [style.background]="colorTokens[0].value()" [style.color]="'white'">
                  Principal
                </button>
                <button class="px-4 py-2 rounded-full text-xs font-bold border transition-colors"
                  [style.border-color]="colorTokens[0].value()" [style.color]="colorTokens[0].value()">
                  Outline
                </button>
                <button class="px-4 py-2 rounded-full text-xs font-bold bg-red-500 text-white transition-colors">
                  Peligro
                </button>
              </div>

              <!-- Cards -->
              <div class="space-y-3">
                <p class="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Cards</p>
                <div class="p-4 rounded-xl border border-[#F0D5CC]" [style.background]="colorTokens[3].value() + '20'">
                  <p class="text-xs font-bold" [style.color]="colorTokens[0].value()">Card Title</p>
                  <p class="text-[10px] text-[#1A1A1A]/60 mt-1">Descripción de ejemplo</p>
                </div>
                <div class="p-4 rounded-xl" [style.background]="colorTokens[0].value()">
                  <p class="text-xs font-bold text-white">Card Invertida</p>
                  <p class="text-[10px] text-white/70 mt-1">Con fondo de accent</p>
                </div>
              </div>

              <!-- Sidebar Preview Mini -->
              <div class="space-y-3">
                <p class="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Sidebar Mini</p>
                <div class="rounded-xl overflow-hidden border border-[#F0D5CC]" [style.background]="sidebarBg()">
                  <div class="p-3 flex items-center gap-2 border-b border-white/10">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold italic" [style.background]="sidebarAccent()">M</div>
                    <span class="text-xs font-bold italic" [style.color]="sidebarText()">Mochi.</span>
                  </div>
                  <div class="p-2 space-y-1">
                    <div class="px-3 py-1.5 rounded-lg text-[10px] font-bold" [style.color]="sidebarText()" [style.background]="sidebarAccent() + '20'">Dashboard</div>
                    <div class="px-3 py-1.5 rounded-lg text-[10px] font-bold" [style.color]="sidebarText()">Productos</div>
                    <div class="px-3 py-1.5 rounded-lg text-[10px] font-bold" [style.color]="sidebarText()">Pedidos</div>
                  </div>
                </div>
              </div>

              <!-- Input Preview -->
              <div class="space-y-3">
                <p class="text-[10px] font-bold text-[#1A1A1A]/50 uppercase tracking-wider">Inputs</p>
                <input type="text" placeholder="Nombre..."
                  class="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2"
                  [style.border-color]="colorTokens[3].value()" [style.focus-ring-color]="colorTokens[2].value()">
                <select class="w-full px-3 py-2 rounded-xl border text-xs text-[#1A1A1A] focus:outline-none"
                  [style.border-color]="colorTokens[3].value()">
                  <option>Opción 1</option>
                  <option>Opción 2</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Sidebar Full Preview -->
          <div class="bg-white rounded-2xl border border-[#F0D5CC] overflow-hidden">
            <div class="p-4 border-b border-[#F0D5CC]">
              <h3 class="text-sm font-bold text-[#1A1A1A]">Sidebar Full Preview</h3>
            </div>
            <div class="flex h-64">
              <!-- Sidebar -->
              <div class="w-56 flex flex-col shrink-0" [style.background]="sidebarBg()">
                <div class="h-12 flex items-center gap-2 px-4 border-b border-white/10">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold italic" [style.background]="sidebarAccent()">M</div>
                  <span class="text-sm font-bold italic" [style.color]="sidebarText()">Mochi.</span>
                </div>
                <nav class="flex-1 p-2 space-y-1">
                  <a class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold" [style.color]="sidebarText()" [style.background]="sidebarAccent() + '20'">
                    <span class="material-icons text-sm">dashboard</span>
                    Dashboard
                  </a>
                  <a class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold" [style.color]="sidebarText()">
                    <span class="material-icons text-sm">inventory_2</span>
                    Productos
                  </a>
                  <a class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold" [style.color]="sidebarText()">
                    <span class="material-icons text-sm">shopping_cart</span>
                    Pedidos
                  </a>
                  <a class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold" [style.color]="sidebarText()">
                    <span class="material-icons text-sm">people</span>
                    Usuarios
                  </a>
                </nav>
                <div class="p-3 border-t border-white/10">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" [style.background]="sidebarAccent()">A</div>
                    <div>
                      <p class="text-[10px] font-bold" [style.color]="sidebarText()">Admin</p>
                      <p class="text-[8px]" [style.color]="sidebarText() + '80'">admin&#64;mochi.co</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Content -->
              <div class="flex-1 p-4" [style.background]="previewBg()">
                <div class="h-4 w-32 rounded bg-black/5 mb-4"></div>
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div class="h-16 rounded-xl bg-white/80 border border-black/5"></div>
                  <div class="h-16 rounded-xl bg-white/80 border border-black/5"></div>
                  <div class="h-16 rounded-xl bg-white/80 border border-black/5"></div>
                </div>
                <div class="h-24 rounded-xl bg-white/80 border border-black/5"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class DesignPlaygroundComponent {
  bgType = signal<string>('mesh');
  bgColor = signal('#FDF5F0');
  gradientColor1 = signal('#F7CAC9');
  gradientColor2 = signal('#F7786B');
  gradientAngle = signal(135);
  radialColor1 = signal('#F7CAC9');
  radialColor2 = signal('#FDD3EE');
  meshColor1 = signal('#F0D5BC');
  meshColor2 = signal('#F3CBA0');
  meshColor3 = signal('#FBCD8E');
  meshBlur = signal(60);

  // Circular Carousel
  activeCarousel = signal(0);
  arcActive = signal(2); // center card by default
  carouselItems = signal([
    { id: 1, name: 'Mochi Matcha', japanese: 'もみ茶餅', emoji: '🍡', price: '$8.500', rating: '4.9', tag: 'Favorito', desc: 'Suave masa de arroz rellena de crema de matcha premium de Uji.', gradient: 'linear-gradient(135deg, #FFD6E0 0%, #FFA0B4 100%)' },
    { id: 2, name: 'Daifuku Fresa', japanese: '苺大福', emoji: '🍓', price: '$9.200', rating: '4.8', tag: 'Nuevo', desc: 'Daifuku relleno de fresa fresca y pasta de judío blanco.', gradient: 'linear-gradient(135deg, #FFB3C1 0%, #FF758F 100%)' },
    { id: 3, name: 'Dango Sakura', japanese: '桜団子', emoji: '🍢', price: '$7.800', rating: '4.7', tag: 'Estacional', desc: 'Brochetas de dango con glaseado de almizcle y flor de cerezo.', gradient: 'linear-gradient(135deg, #FFC8D6 0%, #CE93D8 100%)' },
    { id: 4, name: 'Dorayaki', japanese: 'どら焼き', emoji: '🥞', price: '$8.000', rating: '4.9', tag: 'Clásico', desc: 'Panqueque japonés relleno de red bean paste dulce.', gradient: 'linear-gradient(135deg, #FDBA74 0%, #F7CAC9 100%)' },
    { id: 5, name: 'Taiyaki', japanese: 'たい焼き', emoji: '🐟', price: '$8.500', rating: '4.8', tag: 'Popular', desc: 'Pastel en forma de pez relleno de crema pastelera.', gradient: 'linear-gradient(135deg, #80CBC4 0%, #B2DFDB 100%)' },
  ]);

  fontSerif = signal('Playfair Display');
  fontSans = signal('Plus Jakarta Sans');
  fontSize = signal(16);

  sidebarBg = signal('#FFF0EA');
  sidebarText = signal('#1A1A1A');
  sidebarAccent = signal('#FF758F');

  copied = signal(false);
  previewBg = signal('');
  generatedCSS = signal('');
  selectedPage = signal('');

  colorTokens = [
    { name: 'primary', label: 'Primary', value: signal('#1A1A1A') },
    { name: 'accent', label: 'Accent', value: signal('#FF758F') },
    { name: 'accentLight', label: 'Accent Light', value: signal('#FFA0B4') },
    { name: 'border', label: 'Border', value: signal('#F0D5CC') },
    { name: 'canvas', label: 'Canvas', value: signal('#FDF5F0') },
    { name: 'matcha', label: 'Matcha', value: signal('#80CBC4') },
    { name: 'yuzu', label: 'Yuzu', value: signal('#FDBA74') },
  ];

  serifFonts = [
    { name: 'Playfair Display', label: 'Playfair Display' },
    { name: 'Cormorant Garamond', label: 'Cormorant Garamond' },
    { name: 'Libre Baskerville', label: 'Libre Baskerville' },
    { name: 'Vollkorn', label: 'Vollkorn' },
    { name: 'Spectral', label: 'Spectral' },
    { name: 'Lora', label: 'Lora' },
    { name: 'Merriweather', label: 'Merriweather' },
    { name: 'EB Garamond', label: 'EB Garamond' },
  ];

  sansFonts = [
    { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
    { name: 'Inter', label: 'Inter' },
    { name: 'DM Sans', label: 'DM Sans' },
    { name: 'Outfit', label: 'Outfit' },
    { name: 'Nunito', label: 'Nunito' },
    { name: 'Poppins', label: 'Poppins' },
  ];

  bgPresets = [
    { name: 'Rose Quartz', preview: 'linear-gradient(135deg, #F7CAC9, #FDD3EE)', type: 'linear', c1: '#F7CAC9', c2: '#FDD3EE', angle: 135 },
    { name: 'Peach', preview: 'linear-gradient(135deg, #FDD3EE, #FDBA74)', type: 'linear', c1: '#FDD3EE', c2: '#FDBA74', angle: 135 },
    { name: 'Lavender', preview: 'linear-gradient(135deg, #E6E6FA, #DDA0DD)', type: 'linear', c1: '#E6E6FA', c2: '#DDA0DD', angle: 135 },
    { name: 'Mint', preview: 'linear-gradient(135deg, #F5FFFA, #E0F2F1)', type: 'linear', c1: '#F5FFFA', c2: '#E0F2F1', angle: 135 },
    { name: 'Cream', preview: 'linear-gradient(135deg, #FFFDD0, #FDF5F0)', type: 'linear', c1: '#FFFDD0', c2: '#FDF5F0', angle: 135 },
    { name: 'Sunset', preview: 'linear-gradient(135deg, #FF758F, #FDBA74)', type: 'linear', c1: '#FF758F', c2: '#FDBA74', angle: 135 },
    { name: 'Ocean', preview: 'linear-gradient(135deg, #80CBC4, #B2DFDB)', type: 'linear', c1: '#80CBC4', c2: '#B2DFDB', angle: 135 },
    { name: 'Rose Mesh', preview: 'radial-gradient(at 30% 40%, #F7CAC9, transparent 60%), radial-gradient(at 70% 60%, #FDD3EE, transparent 60%), #FDF2F0', type: 'mesh', c1: '#F7CAC9', c2: '#FDD3EE', angle: 0 },
    { name: 'Peach Mesh', preview: 'radial-gradient(at 30% 40%, #F5D5B8, transparent 60%), radial-gradient(at 70% 60%, #FDBA74, transparent 60%), #FDF5F0', type: 'mesh', c1: '#F5D5B8', c2: '#FDBA74', angle: 0 },
    { name: 'Warm Mesh', preview: 'radial-gradient(at 20% 30%, #FDD3EE, transparent 50%), radial-gradient(at 80% 60%, #F5D5B8, transparent 50%), radial-gradient(at 50% 80%, #FDBA74, transparent 50%), #FDF5F0', type: 'mesh', c1: '#FDD3EE', c2: '#F5D5B8', angle: 0 },
  ];

  constructor() {
    this.applyBackground();
    this.applyFonts();
    this.applyColors();
    this.applySidebar();
  }

  applyBackground() {
    let bg = '';
    switch (this.bgType()) {
      case 'solid':
        bg = this.bgColor();
        break;
      case 'linear':
        bg = `linear-gradient(${this.gradientAngle()}deg, ${this.gradientColor1()}, ${this.gradientColor2()})`;
        break;
      case 'radial':
        bg = `radial-gradient(circle, ${this.radialColor1()}, ${this.radialColor2()})`;
        break;
      case 'mesh':
        bg = `radial-gradient(at 20% 30%, ${this.meshColor1()} 0%, transparent 50%), radial-gradient(at 80% 60%, ${this.meshColor2()} 0%, transparent 50%), radial-gradient(at 50% 80%, ${this.meshColor3()} 0%, transparent 50%), ${this.colorTokens[4].value()}`;
        break;
    }
    this.previewBg.set(bg);
    this.updateCSS();
  }

  applyFonts() {
    this.updateCSS();
  }

  applyColors() {
    this.updateCSS();
  }

  applySidebar() {
    this.updateCSS();
  }

  applyPreset(preset: any) {
    this.bgType.set(preset.type);
    if (preset.type === 'linear') {
      this.gradientColor1.set(preset.c1);
      this.gradientColor2.set(preset.c2);
      this.gradientAngle.set(preset.angle);
    } else if (preset.type === 'mesh') {
      this.meshColor1.set(preset.c1);
      this.meshColor2.set(preset.c2);
      this.meshColor3.set('#F7786B');
    }
    this.applyBackground();
  }

  updateCSS() {
    const css = `/* === MOCHI DESIGN TOKENS === */
@import url('https://fonts.googleapis.com/css2?family=${this.fontSerif().replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400;1,700&family=${this.fontSans().replace(/ /g, '+')}:wght@400;500;600;700&display=swap');

:root {
  --bg-canvas: ${this.colorTokens[4].value()};
  --text-main: ${this.colorTokens[0].value()};
  --accent: ${this.colorTokens[1].value()};
  --accent-light: ${this.colorTokens[2].value()};
  --border-soft: ${this.colorTokens[3].value()};
  --mochi-matcha: ${this.colorTokens[5].value()};
  --mochi-yuzu: ${this.colorTokens[6].value()};
  --sidebar-bg: ${this.sidebarBg()};
  --sidebar-text: ${this.sidebarText()};
  --sidebar-accent: ${this.sidebarAccent()};
}

body {
  font-family: '${this.fontSans()}', sans-serif;
  font-size: ${this.fontSize()}px;
  background: var(--bg-canvas);
  color: var(--text-main);
}

h1, h2, h3, .font-serif {
  font-family: '${this.fontSerif()}', serif;
}`;
    this.generatedCSS.set(css);
  }

  copyCSS() {
    navigator.clipboard.writeText(this.generatedCSS());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  // === Circular Carousel Methods ===

  rotateTo(index: number) {
    if (index === this.activeCarousel()) return;
    this.activeCarousel.set(index);
  }

  nextSlide() {
    const total = this.carouselItems().length;
    this.activeCarousel.set((this.activeCarousel() + 1) % total);
  }

  prevSlide() {
    const total = this.carouselItems().length;
    this.activeCarousel.set((this.activeCarousel() - 1 + total) % total);
  }

  getCardTransform(index: number): string {
    const active = this.activeCarousel();
    const total = this.carouselItems().length;
    const diff = ((index - active + total) % total);

    if (diff === 0) {
      return 'translateX(0) translateZ(40px) rotateY(0deg) scale(1)';
    } else if (diff === 1 || diff === -(total - 1)) {
      return 'translateX(180px) translateZ(-60px) rotateY(-25deg) scale(0.85)';
    } else if (diff === total - 1 || diff === -1) {
      return 'translateX(-180px) translateZ(-60px) rotateY(25deg) scale(0.85)';
    } else {
      return 'translateX(0) translateZ(-300px) rotateY(0deg) scale(0.5)';
    }
  }

  getCardZIndex(index: number): number {
    const active = this.activeCarousel();
    const total = this.carouselItems().length;
    const diff = ((index - active + total) % total);
    if (diff === 0) return 30;
    if (diff === 1 || diff === total - 1) return 20;
    return 10;
  }

  getCardFilter(index: number): string {
    const active = this.activeCarousel();
    const total = this.carouselItems().length;
    const diff = ((index - active + total) % total);
    if (diff === 0) return 'brightness(1) saturate(1)';
    if (diff === 1 || diff === total - 1) return 'brightness(0.7) saturate(0.8)';
    return 'brightness(0.4) saturate(0.5)';
  }

  getCardOpacity(index: number): number {
    const active = this.activeCarousel();
    const total = this.carouselItems().length;
    const diff = ((index - active + total) % total);
    if (diff === 0) return 1;
    if (diff === 1 || diff === total - 1) return 0.85;
    return 0;
  }

  // === Arc Carousel Methods ===

  arcSelect(index: number) {
    this.arcActive.set(index);
  }

  arcNext() {
    const total = this.carouselItems().length;
    this.arcActive.set((this.arcActive() + 1) % total);
  }

  arcPrev() {
    const total = this.carouselItems().length;
    this.arcActive.set((this.arcActive() - 1 + total) % total);
  }

  getArcTransform(index: number): string {
    const active = this.arcActive();
    const total = this.carouselItems().length;
    let rel = index - active;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;

    // Orbital arc: cards sit on a perfect circle
    const arcAngle = 25; // degrees between each card
    const angle = rel * arcAngle;

    // Convert to radians
    const rad = (angle * Math.PI) / 180;

    // Perfect circle: same radius for x and y
    const radius = 340;
    const x = Math.sin(rad) * radius;
    const y = (1 - Math.cos(rad)) * radius * 0.55;

    // Rotation tilts with the arc
    const rotate = angle;

    // Scale: center is biggest
    const scale = rel === 0 ? 1.05 : 0.88;

    return `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`;
  }

  getArcZIndex(index: number): number {
    const active = this.arcActive();
    const total = this.carouselItems().length;
    let rel = index - active;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;

    if (rel === 0) return 30;
    if (rel === -1 || rel === 1 || rel === total - 1 || rel === -(total - 1)) return 20;
    return 10;
  }

  getArcOpacity(index: number): number {
    const active = this.arcActive();
    const total = this.carouselItems().length;
    let rel = index - active;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;

    if (rel === 0) return 1;
    if (rel === -1 || rel === 1 || rel === total - 1 || rel === -(total - 1)) return 0.8;
    return 0;
  }

  getArcShadow(index: number): string {
    const active = this.arcActive();
    const total = this.carouselItems().length;
    let rel = index - active;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;

    if (rel === 0) {
      return '0 25px 60px -12px rgba(255,117,143,0.35)';
    }
    if (rel === -1 || rel === 1 || rel === total - 1 || rel === -(total - 1)) {
      return '0 12px 30px -8px rgba(26,26,26,0.15)';
    }
    return 'none';
  }

  getArcOverlay(index: number): string {
    const active = this.arcActive();
    const total = this.carouselItems().length;
    let rel = index - active;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;

    if (rel === 0) return 'transparent';
    return 'linear-gradient(180deg, rgba(26,26,26,0.15) 0%, rgba(26,26,26,0.35) 100%)';
  }

  getArcTagBg(index: number): string {
    const active = this.arcActive();
    const total = this.carouselItems().length;
    let rel = index - active;
    if (rel > total / 2) rel -= total;
    if (rel < -total / 2) rel += total;

    if (rel === 0) return '#FF758F';
    return 'rgba(255,255,255,0.25)';
  }

  getPageLabel(page: string): string {
    const labels: Record<string, string> = {
      home: 'Inicio',
      catalog: 'Catálogo',
      detail: 'Detalle de Producto',
      about: 'Sobre Nosotros',
      contact: 'Contacto',
      login: 'Login',
      cart: 'Carrito',
      profile: 'Perfil',
      simulator: 'Simulador',
      blog: 'Blog',
      admin: 'Admin Dashboard',
      pos: 'POS Empleado',
    };
    return labels[page] || page;
  }

  getPreviewBg(): string {
    switch (this.bgType()) {
      case 'solid': return this.bgColor();
      case 'linear': return `linear-gradient(${this.gradientAngle()}deg, ${this.gradientColor1()}, ${this.gradientColor2()})`;
      case 'radial': return `radial-gradient(circle, ${this.radialColor1()}, ${this.radialColor2()})`;
      case 'mesh': return `radial-gradient(at 20% 30%, ${this.meshColor1()}, transparent ${this.meshBlur()}%), radial-gradient(at 80% 60%, ${this.meshColor2()}, transparent ${this.meshBlur()}%), radial-gradient(at 50% 80%, ${this.meshColor3()}, transparent ${this.meshBlur()}%), ${this.bgColor()}`;
      default: return this.bgColor();
    }
  }

  getPageTags(page: string): { label: string; color: string }[] {
    const tags: Record<string, { label: string; color: string }[]> = {
      home: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Hero', color: '#FF758F' },
        { label: 'Categorías (5)', color: '#80CBC4' },
        { label: 'Productos (3)', color: '#FDBA74' },
        { label: 'CTA Simulador', color: '#FF758F' },
        { label: 'Reseñas (3)', color: '#CE93D8' },
        { label: 'Sobre Nosotros', color: '#80CBC4' },
        { label: 'Blog (3)', color: '#FDBA74' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      catalog: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Header Banner', color: '#FF758F' },
        { label: 'Búsqueda & Filtros', color: '#80CBC4' },
        { label: 'Grid Productos (6)', color: '#FDBA74' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      detail: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Breadcrumb', color: '#80CBC4' },
        { label: 'Imagen + Detalles', color: '#FF758F' },
        { label: 'Acciones', color: '#FDBA74' },
        { label: 'Relacionados (4)', color: '#CE93D8' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      about: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Hero Oscuro', color: '#4A3F35' },
        { label: 'Equipo (3)', color: '#FF758F' },
        { label: 'Misión & Visión', color: '#FFD6E0' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      contact: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Header', color: '#FF758F' },
        { label: 'Formulario', color: '#80CBC4' },
        { label: 'Info Contacto', color: '#FDBA74' },
        { label: 'Mapa', color: '#80CBC4' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      login: [
        { label: 'Login Card', color: '#FF758F' },
        { label: 'Formulario', color: '#80CBC4' },
      ],
      cart: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Items (2)', color: '#FF758F' },
        { label: 'Resumen Pedido', color: '#FDBA74' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      profile: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Avatar & Info', color: '#FF758F' },
        { label: 'Acciones Rápidas', color: '#80CBC4' },
        { label: 'Cerrar Sesión', color: '#FFE4E6' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      simulator: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Header', color: '#FF758F' },
        { label: 'Selección Productos', color: '#80CBC4' },
        { label: 'Resumen Cotización', color: '#FDBA74' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      blog: [
        { label: 'Navbar', color: '#FF758F' },
        { label: 'Header', color: '#FF758F' },
        { label: 'Artículos (3)', color: '#80CBC4' },
        { label: 'Footer', color: '#1A1A1A' },
      ],
      admin: [
        { label: 'Admin Header', color: '#FF758F' },
        { label: 'Stats (4)', color: '#80CBC4' },
        { label: 'Tabla Pedidos', color: '#FDBA74' },
        { label: 'Tabs Navegación', color: '#4A3F35' },
      ],
      pos: [
        { label: 'POS Header', color: '#FFD6E0' },
        { label: 'Catálogo POS', color: '#80CBC4' },
        { label: 'Caja / Carrito', color: '#FFD6E0' },
        { label: 'Métodos Pago', color: '#FF758F' },
      ],
    };
    return tags[page] || [];
  }
}
