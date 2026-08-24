import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnDestroy, NgZone, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import type * as L from 'leaflet';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#FDF8F4] py-8 px-4">
      <div class="max-w-4xl mx-auto space-y-6">

        @if (user(); as u) {
          <!-- Header Card -->
          <div class="bg-white rounded-3xl border border-[#E8D8D0] overflow-hidden shadow-sm">
            <div class="h-24 bg-gradient-to-r from-[#D95578] to-[#FF6078]"></div>
            <div class="px-6 sm:px-8 pb-6 -mt-10 relative">
              <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div class="w-20 h-20 rounded-full bg-[#D95578] border-4 border-white flex items-center justify-center text-white text-3xl font-serif italic font-bold shadow-lg">
                  {{ u.nombre_completo?.charAt(0) || '?' }}
                </div>
                <div class="flex-1 pt-2">
                  <h1 class="text-2xl font-serif italic text-[#590E2A] font-bold">{{ u.nombre_completo }}</h1>
                  <p class="text-xs text-[#590E2A]/60 mt-0.5">{{ u.email }}</p>
                </div>
                <span class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  [class]="u.rol === 'admin' ? 'bg-[#D95578]/10 text-[#D95578]' : u.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'">
                  {{ u.rol }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white rounded-3xl border border-[#E8D8D0] shadow-sm overflow-hidden">
            <div class="flex border-b border-[#E8D8D0]">
              <button (click)="activeTab.set('cuenta')" class="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                [class]="activeTab() === 'cuenta' ? 'border-[#D95578] text-[#D95578] bg-[#D95578]/5' : 'border-transparent text-[#590E2A]/40 hover:text-[#590E2A]/60'">
                <span class="material-icons" style="font-size: 16px">person</span>
                Mi Cuenta
              </button>
              <button (click)="activeTab.set('direcciones')" class="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                [class]="activeTab() === 'direcciones' ? 'border-[#D95578] text-[#D95578] bg-[#D95578]/5' : 'border-transparent text-[#590E2A]/40 hover:text-[#590E2A]/60'">
                <span class="material-icons" style="font-size: 16px">location_on</span>
                Direcciones
              </button>
              <button (click)="activeTab.set('pedidos')" class="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                [class]="activeTab() === 'pedidos' ? 'border-[#D95578] text-[#D95578] bg-[#D95578]/5' : 'border-transparent text-[#590E2A]/40 hover:text-[#590E2A]/60'">
                <span class="material-icons" style="font-size: 16px">receipt_long</span>
                Pedidos
              </button>
            </div>

            <div class="p-6 sm:p-8">

              <!-- ===================== TAB: MI CUENTA ===================== -->
              @if (activeTab() === 'cuenta') {
                <div class="space-y-6">
                  <!-- Info Personal -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-9 h-9 rounded-xl bg-[#D95578]/10 flex items-center justify-center">
                        <span class="material-icons text-[#D95578]" style="font-size: 18px">person</span>
                      </div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Información Personal</h2>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">email</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Correo</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A]">{{ u.email }}</p>
                      </div>
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">phone</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Teléfono</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A]">{{ u.telefono || 'No registrado' }}</p>
                      </div>
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">badge</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Rol</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A] capitalize">{{ u.rol }}</p>
                      </div>
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">calendar_today</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Miembro desde</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A]">{{ u.created_at ? (u.created_at | date:'mediumDate') : 'N/A' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Seguridad -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-9 h-9 rounded-xl bg-[#E0F2F1] flex items-center justify-center">
                        <span class="material-icons text-[#2C5350]" style="font-size: 18px">lock</span>
                      </div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Seguridad</h2>
                    </div>

                    <div class="bg-[#FDF8F4] rounded-2xl p-4 mb-4">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="material-icons text-[#590E2A]/40" style="font-size: 20px">key</span>
                          <div>
                            <p class="text-sm font-bold text-[#590E2A]">Contraseña</p>
                            <p class="text-[10px] text-[#590E2A]/50">Protege tu cuenta con una contraseña segura</p>
                          </div>
                        </div>
                        <button (click)="showPasswordForm.set(!showPasswordForm())"
                          class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                          [class]="showPasswordForm() ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#590E2A] text-[#FDF8F4] hover:bg-[#3A0A1C]'">
                          {{ showPasswordForm() ? 'Cancelar' : 'Cambiar' }}
                        </button>
                      </div>
                    </div>

                    @if (showPasswordForm()) {
                      <div class="space-y-3">
                        @if (passwordSuccess()) {
                          <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center gap-2">
                            <span class="material-icons text-[#004D40]" style="font-size: 16px">check_circle</span>
                            <p class="text-xs font-medium text-[#004D40]">Contraseña actualizada exitosamente.</p>
                          </div>
                        }
                        @if (passwordError()) {
                          <div class="p-3 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] flex items-center gap-2">
                            <span class="material-icons text-[#C62828]" style="font-size: 16px">error</span>
                            <p class="text-xs font-medium text-[#C62828]">{{ passwordError() }}</p>
                          </div>
                        }
                        <form (submit)="onPasswordChange($event)" class="space-y-3">
                          <div class="relative">
                            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30" style="font-size: 16px">lock_outline</span>
                            <input type="password" placeholder="Nueva contraseña (min. 6 caracteres)" [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" required minlength="6"
                              class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors"/>
                          </div>
                          <div class="relative">
                            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30" style="font-size: 16px">lock_outline</span>
                            <input type="password" placeholder="Confirmar contraseña" [value]="confirmPassword()" (input)="confirmPassword.set($any($event.target).value)" required minlength="6"
                              class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors"/>
                          </div>
                          <button type="submit" [disabled]="passwordLoading()"
                            class="w-full py-3 rounded-xl bg-[#590E2A] hover:bg-[#3A0A1C] disabled:opacity-50 text-[#FDF8F4] font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            @if (passwordLoading()) {
                              <span class="material-icons animate-spin" style="font-size: 14px">refresh</span>
                            }
                            {{ passwordLoading() ? 'Guardando...' : 'Guardar Contraseña' }}
                          </button>
                        </form>
                      </div>
                    }
                  </div>

                  <!-- Accesos Directos -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-9 h-9 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
                        <span class="material-icons text-[#FB923C]" style="font-size: 18px">bolt</span>
                      </div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Accesos Directos</h2>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <a routerLink="/carrito" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FDF8F4] hover:bg-[#E0F2F1] transition-colors text-center">
                        <span class="material-icons text-[#D95578]" style="font-size: 24px">shopping_cart</span>
                        <span class="text-[10px] font-bold text-[#590E2A]">Carrito</span>
                      </a>
                      <a routerLink="/productos" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FDF8F4] hover:bg-[#FFF3E0] transition-colors text-center">
                        <span class="material-icons text-[#FB923C]" style="font-size: 24px">restaurant_menu</span>
                        <span class="text-[10px] font-bold text-[#590E2A]">Catálogo</span>
                      </a>
                      @if (u.rol === 'admin') {
                        <a routerLink="/admin" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FDF8F4] hover:bg-[#FFF3E0] transition-colors text-center">
                          <span class="material-icons text-[#FB923C]" style="font-size: 24px">admin_panel_settings</span>
                          <span class="text-[10px] font-bold text-[#7C2D12]">Admin</span>
                        </a>
                      }
                      @if (u.rol === 'admin' || u.rol === 'empleado') {
                        <a routerLink="/empleado" class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#FDF8F4] hover:bg-[#E0F2F1] transition-colors text-center">
                          <span class="material-icons text-[#2C5350]" style="font-size: 24px">point_of_sale</span>
                          <span class="text-[10px] font-bold text-[#133834]">POS</span>
                        </a>
                      }
                    </div>
                  </div>

                  <!-- Cerrar Sesión -->
                  <button (click)="onLogout()" class="w-full py-3.5 rounded-2xl bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    <span class="material-icons" style="font-size: 16px">logout</span>
                    Cerrar Sesión
                  </button>
                </div>
              }

              <!-- ===================== TAB: DIRECCIONES ===================== -->
              @if (activeTab() === 'direcciones') {
                <div class="space-y-5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-[#F3E5F5] flex items-center justify-center">
                        <span class="material-icons text-[#8E24AA]" style="font-size: 18px">location_on</span>
                      </div>
                      <div>
                        <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Mis Direcciones</h2>
                        <p class="text-[10px] text-[#590E2A]/50">{{ userAddresses().length }} direcciones guardadas</p>
                      </div>
                    </div>
                    <button (click)="showNewAddress.set(!showNewAddress())"
                      class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                      [class]="showNewAddress() ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#D95578] text-white hover:bg-[#FF6078]'">
                      {{ showNewAddress() ? 'Cancelar' : '+ Nueva' }}
                    </button>
                  </div>

                  @if (showNewAddress()) {
                    <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-3">
                      <p class="text-xs font-bold text-[#590E2A]">Nueva Dirección</p>

                      <!-- Map -->
                      <div class="relative rounded-xl overflow-hidden border border-[#E8D8D0]">
                        <!-- Search Bar on Map -->
                        <div class="absolute top-2 left-2 right-2 z-[1000]">
                          <div class="relative">
                            <span class="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#590E2A]/40" style="font-size: 16px">search</span>
                            <input #mapSearchInput type="text" placeholder="Buscar dirección..."
                              (keydown.enter)="searchAddress(mapSearchInput.value)"
                              class="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/95 backdrop-blur border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] shadow-sm"/>
                            <button (click)="searchAddress(mapSearchInput.value)" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#D95578] flex items-center justify-center hover:bg-[#FF6078] transition-colors">
                              <span class="material-icons text-white" style="font-size: 14px">arrow_forward</span>
                            </button>
                          </div>
                        </div>

                        <div id="address-map" class="w-full h-56"></div>
                        @if (mapLoading()) {
                          <div class="absolute inset-0 bg-white/70 flex items-center justify-center z-[999]">
                            <span class="material-icons animate-spin text-[#D95578]">refresh</span>
                          </div>
                        }
                      </div>
                      <p class="text-[10px] text-[#590E2A]/40 flex items-center gap-1">
                        <span class="material-icons" style="font-size: 12px">info</span>
                        Busca una dirección o haz clic en el mapa para colocar tu ubicación
                      </p>

                      @if (mapAddress()) {
                        <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center gap-2">
                          <span class="material-icons text-[#2C5350]" style="font-size: 14px">check_circle</span>
                          <p class="text-[11px] font-medium text-[#2C5350]">{{ mapAddress() }}</p>
                        </div>
                      }

                      <div class="grid grid-cols-2 gap-3">
                        <input #aliasInput type="text" placeholder="Alias (Casa, Trabajo)" class="p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                        <input #barrioInput type="text" placeholder="Barrio" class="p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                      </div>
                      <input #dirInput type="text" [value]="mapAddress() || ''" placeholder="Dirección completa (Calle 14 # 5-20)" class="w-full p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                      <button (click)="saveAddress(aliasInput.value, dirInput.value || mapAddress() || '', barrioInput.value); showNewAddress.set(false); destroyMap()"
                        class="w-full py-2.5 rounded-xl bg-[#590E2A] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#3A0A1C] transition-colors">
                        Guardar Dirección
                      </button>
                    </div>
                  }

                  <div class="space-y-3">
                    @for (dir of userAddresses(); track dir.id_direccion) {
                      <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl bg-[#D95578]/10 flex items-center justify-center shrink-0">
                            <span class="material-icons text-[#D95578]" style="font-size: 18px">{{ dir.predeterminada ? 'home' : 'location_on' }}</span>
                          </div>
                          <div class="min-w-0">
                            <div class="flex items-center gap-2">
                              <p class="text-sm font-bold text-[#590E2A] truncate">{{ dir.alias || 'Dirección' }}</p>
                              @if (dir.predeterminada) {
                                <span class="text-[9px] px-2 py-0.5 rounded-full bg-[#D95578]/10 text-[#D95578] font-bold shrink-0">Principal</span>
                              }
                            </div>
                            <p class="text-[11px] text-[#590E2A]/70 truncate">{{ dir.direccion_completa }}</p>
                            <p class="text-[10px] text-[#590E2A]/40">{{ dir.barrio ? dir.barrio + ', ' : '' }}{{ dir.ciudad }}</p>
                          </div>
                        </div>
                        @if (!dir.predeterminada) {
                          <button (click)="supabaseService.setDireccionPredeterminada(dir.id_direccion, u.id)"
                            class="text-[10px] font-bold text-[#590E2A]/50 hover:text-[#D95578] transition-colors shrink-0 uppercase tracking-wider">
                            Principal
                          </button>
                        }
                      </div>
                    } @empty {
                      <div class="py-10 text-center">
                        <span class="material-icons text-[#E8D8D0] mb-2" style="font-size: 40px">location_off</span>
                        <p class="text-xs text-[#590E2A]/50">No tienes direcciones guardadas</p>
                        <p class="text-[10px] text-[#590E2A]/30 mt-1">Añade una para agilizar tus compras</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- ===================== TAB: PEDIDOS ===================== -->
              @if (activeTab() === 'pedidos') {
                <div class="space-y-5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
                      <span class="material-icons text-[#FB923C]" style="font-size: 18px">receipt_long</span>
                    </div>
                    <div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Mis Pedidos</h2>
                      <p class="text-[10px] text-[#590E2A]/50">{{ userOrders().length }} pedidos realizados</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    @for (ord of userOrders(); track ord.id) {
                      <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="font-mono text-sm font-bold text-[#590E2A]">#{{ ord.id }}</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                              [class]="getStatusClass(ord.estado)">
                              {{ ord.estado }}
                            </span>
                          </div>
                          <span class="text-sm font-serif italic font-bold text-[#590E2A]">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                        </div>

                        <div class="flex items-center gap-4 text-[11px] text-[#590E2A]/60">
                          <div class="flex items-center gap-1">
                            <span class="material-icons" style="font-size: 12px">shopping_bag</span>
                            {{ ord.items.length }} postres
                          </div>
                          <div class="flex items-center gap-1">
                            <span class="material-icons" style="font-size: 12px">payment</span>
                            {{ ord.metodoPago }}
                          </div>
                        </div>

                        <div class="flex items-center gap-1 text-[10px] text-[#590E2A]/40 border-t border-[#E8D8D0]/60 pt-2">
                          <span class="material-icons" style="font-size: 10px">location_on</span>
                          {{ ord.cliente.direccion }}
                        </div>
                      </div>
                    } @empty {
                      <div class="py-10 text-center">
                        <span class="material-icons text-[#E8D8D0] mb-2" style="font-size: 40px">receipt_long</span>
                        <p class="text-xs text-[#590E2A]/50">Aún no has realizado pedidos</p>
                        <a routerLink="/productos" class="inline-block mt-3 px-5 py-2 rounded-full bg-[#590E2A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#3A0A1C] transition-colors">
                          Explorar Catálogo
                        </a>
                      </div>
                    }
                  </div>
                </div>
              }

            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProfileComponent implements OnDestroy {
  supabaseService = inject(SupabaseService);
  private dataService = inject(MochiDataService);
  cartService = inject(CartService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  user = this.supabaseService.activeUser;
  activeTab = signal<'cuenta' | 'direcciones' | 'pedidos'>('cuenta');

  showPasswordForm = signal(false);
  newPassword = signal('');
  confirmPassword = signal('');
  passwordError = signal('');
  passwordSuccess = signal(false);
  passwordLoading = signal(false);

  showNewAddress = signal(false);
  mapAddress = signal('');
  mapLoading = signal(false);

  private map: any = null;
  private marker: any = null;
  private L: typeof import('leaflet') | null = null;

  // La Dorada, Caldas coords
  private readonly LADORADA = { lat: 5.4538, lng: -74.6647 };

  constructor() {
    effect(() => {
      const showing = this.showNewAddress();
      if (showing && isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initMap(), 50);
      } else {
        this.destroyMap();
        this.mapAddress.set('');
      }
    });
  }

  userAddresses = computed(() => {
    const u = this.user();
    if (!u) return [];
    return this.supabaseService.direcciones().filter(d => d.id_usuario === u.id);
  });

  userOrders = computed(() => {
    const u = this.user();
    if (!u) return [];
    return this.dataService.orders().filter(o =>
      o.cliente.email?.toLowerCase() === u.email.toLowerCase() ||
      o.cliente.nombre.toLowerCase().includes(u.nombre_completo.toLowerCase())
    );
  });

  ngOnDestroy() {
    this.destroyMap();
  }

  async initMap() {
    if (this.map) return;
    if (!this.L) {
      this.L = await import('leaflet');
    }
    const L = this.L;
    const container = document.getElementById('address-map');
    if (!container) return;

    this.map = L.map('address-map').setView([this.LADORADA.lat, this.LADORADA.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.placeMarker(lat, lng);
      this.reverseGeocode(lat, lng);
    });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  placeMarker(lat: number, lng: number) {
    if (!this.map || !this.L) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      const icon = this.L.divIcon({
        html: `<span class="material-icons" style="font-size:32px;color:#D95578;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">location_on</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: ''
      });
      this.marker = this.L.marker([lat, lng], { icon }).addTo(this.map);
    }
  }

  async reverseGeocode(lat: number, lng: number) {
    this.mapLoading.set(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`);
      const data = await res.json();
      if (data?.display_name) {
        this.mapAddress.set(data.display_name);
      }
    } catch {
      this.mapAddress.set(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    this.mapLoading.set(false);
  }

  async searchAddress(query: string) {
    if (!query || query.length < 3) return;
    this.mapLoading.set(true);
    try {
      let searchQuery = `${query}, Caldas, Colombia`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=es`);
      let data = await res.json();

      if (!data || data.length === 0) {
        searchQuery = `${query}, Colombia`;
        res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=es`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        this.map?.setView([latNum, lonNum], 16);
        this.placeMarker(latNum, lonNum);
        this.mapAddress.set(display_name);
      }
    } catch {}
    this.mapLoading.set(false);
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  getStatusClass(estado: string): string {
    const s = estado.toLowerCase();
    if (s === 'entregado') return 'bg-[#E0F2F1] text-[#2C5350]';
    if (s === 'en camino' || s === 'en camino') return 'bg-[#FFF3E0] text-[#E65100]';
    if (s === 'preparando') return 'bg-[#F3E5F5] text-[#6A1B9A]';
    return 'bg-[#FFEBEE] text-[#C62828]';
  }

  saveAddress(alias: string, dir: string, barrio: string) {
    const u = this.user();
    if (!dir || !u) return;
    this.supabaseService.addDireccion({
      id_usuario: u.id,
      alias: alias || 'Mi Dirección',
      direccion_completa: dir,
      barrio: barrio || 'Centro',
      ciudad: 'La Dorada',
      departamento: 'Caldas',
      codigo_postal: '175031',
      predeterminada: this.userAddresses().length === 0
    });
  }

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

    const { error } = await this.supabaseService.updatePassword(this.newPassword());

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
    await this.supabaseService.signOut();
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
