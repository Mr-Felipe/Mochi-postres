import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] text-[#590E2A] min-h-screen py-10 font-sans">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Customer Profile Header Card -->
        <div class="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8D8D0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <img 
              [src]="activeUser()?.foto_perfil || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'" 
              alt="Foto de perfil del usuario"
              class="w-16 h-16 rounded-full object-cover border-2 border-[#D95578] shadow-xs"
            />
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl sm:text-3xl font-serif italic text-[#590E2A]">
                  ¡Hola, {{ activeUser()?.nombre_completo }}!
                </h1>
                <span class="px-3 py-1 rounded-full bg-[#D95578] text-[#590E2A] text-[10px] font-bold uppercase tracking-wider border border-[#E8D8D0]">
                  {{ activeUser()?.rol }}
                </span>
              </div>
              <p class="text-xs text-[#590E2A]/70 mt-1 font-mono">
                {{ activeUser()?.email }} • {{ activeUser()?.telefono || '+57 (No registrado)' }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs">
            <a routerLink="/productos" class="px-5 py-2.5 rounded-full bg-[#590E2A] text-[#FDF8F4] font-bold uppercase tracking-wider shadow-xs hover:bg-[#3A0A1C] transition-colors">
              🍡 Ver Menú & Pedir
            </a>
            <button 
              (click)="handleSignOut()"
              class="px-5 py-2.5 rounded-full bg-[#FDF8F4] hover:bg-[#FFEBEE] border border-[#E8D8D0] text-[#C62828] font-bold uppercase tracking-wider transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- Dashboard Grid: Addresses & Active Orders -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left 6 Cols: Saved Addresses in Supabase -->
          <div class="lg:col-span-6 bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-[#E8D8D0] pb-4">
              <div>
                <h2 class="text-xl font-serif italic text-[#590E2A]">Mis Direcciones Guardadas</h2>
                <p class="text-xs text-[#590E2A]/60">Sincronizadas con la tabla 'direcciones' de Supabase</p>
              </div>
              <button 
                (click)="showNewAddressModal.set(!showNewAddressModal())"
                class="text-xs font-bold text-[#590E2A] uppercase tracking-wider bg-[#D95578] px-3.5 py-1.5 rounded-full border border-[#E8D8D0] hover:bg-[#ffc2d1]">
                + Añadir
              </button>
            </div>

            <!-- New Address Form Collapsible -->
            @if (showNewAddressModal()) {
              <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-3 text-xs">
                <span class="font-bold text-[#590E2A] block">Nueva Dirección de Entrega:</span>
                <div class="grid grid-cols-2 gap-2">
                  <input 
                    #aliasInput 
                    type="text" 
                    placeholder="Alias (Ej. Casa, Trabajo)" 
                    class="p-2.5 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A]"
                  />
                  <input 
                    #barrioInput 
                    type="text" 
                    placeholder="Barrio (Ej. Centro, Las Ferias)" 
                    class="p-2.5 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A]"
                  />
                </div>
                <input 
                  #dirInput 
                  type="text" 
                  placeholder="Dirección completa (Ej. Calle 14 # 5-20)" 
                  class="w-full p-2.5 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A]"
                />
                <button 
                  (click)="saveAddress(aliasInput.value, dirInput.value, barrioInput.value); showNewAddressModal.set(false)"
                  class="w-full py-2 rounded-xl bg-[#590E2A] text-white font-bold uppercase tracking-wider text-[11px]">
                  Guardar Dirección
                </button>
              </div>
            }

            <!-- Addresses List -->
            <div class="space-y-3">
              @for (dir of userAddresses(); track dir.id_direccion) {
                <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-between gap-3 text-xs">
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-[#590E2A] font-serif text-sm">{{ dir.alias || 'Dirección' }}</span>
                      @if (dir.predeterminada) {
                        <span class="text-[9px] px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#2C5350] font-bold">Principal</span>
                      }
                    </div>
                    <p class="text-[#590E2A]/80">{{ dir.direccion_completa }}</p>
                    <span class="text-[10px] text-[#590E2A]/50">{{ dir.barrio ? dir.barrio + ', ' : '' }}{{ dir.ciudad }}, {{ dir.departamento }}</span>
                  </div>

                  @if (!dir.predeterminada) {
                    <button 
                      (click)="supabaseService.setDireccionPredeterminada(dir.id_direccion, activeUser()?.id!)"
                      class="text-[10px] font-bold uppercase tracking-wider text-[#590E2A]/70 hover:text-[#590E2A] underline">
                      Fijar Principal
                    </button>
                  }
                </div>
              } @empty {
                <div class="p-6 text-center text-[#590E2A]/60 text-xs">
                  No tienes direcciones registradas aún. Añade una para agilizar tus compras.
                </div>
              }
            </div>
          </div>

          <!-- Right 6 Cols: Customer Orders & History -->
          <div class="lg:col-span-6 bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-[#E8D8D0] pb-4">
              <div>
                <h2 class="text-xl font-serif italic text-[#590E2A]">Historial de Mis Pedidos</h2>
                <p class="text-xs text-[#590E2A]/60">Monitoreo en tiempo real de cocina y delivery</p>
              </div>
              <a routerLink="/pedidos" class="text-xs font-bold text-[#590E2A] uppercase tracking-wider hover:underline">
                Ver Todos →
              </a>
            </div>

            <div class="space-y-4">
              @for (ord of userOrders(); track ord.id) {
                <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-2 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="font-mono font-bold text-[#590E2A]">{{ ord.id }}</span>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D95578] text-[#590E2A]">
                      {{ ord.estado }}
                    </span>
                  </div>

                  <div class="flex justify-between items-center text-[#590E2A]/80">
                    <span>{{ ord.items.length }} postres artesanales</span>
                    <span class="font-serif italic text-sm font-bold text-[#590E2A]">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                  </div>

                  <div class="text-[10px] text-[#590E2A]/60 border-t border-[#E8D8D0]/60 pt-2 flex justify-between">
                    <span>Entrega en: {{ ord.cliente.direccion }}</span>
                    <span class="uppercase">{{ ord.metodoPago }}</span>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-[#590E2A]/60 text-xs space-y-3">
                  <p>Aún no has realizado pedidos en línea con esta cuenta.</p>
                  <a routerLink="/productos" class="inline-block px-5 py-2 rounded-full bg-[#590E2A] text-white text-xs font-bold uppercase tracking-wider">
                    Explorar Catálogo
                  </a>
                </div>
              }
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class CustomerDashboardComponent {
  supabaseService = inject(SupabaseService);
  dataService = inject(MochiDataService);
  private cartService = inject(CartService);
  private router = inject(Router);

  activeUser = this.supabaseService.activeUser;
  showNewAddressModal = signal(false);

  userAddresses = computed(() => {
    const user = this.activeUser();
    if (!user) return [];
    return this.supabaseService.direcciones().filter(d => d.id_usuario === user.id);
  });

  userOrders = computed(() => {
    const user = this.activeUser();
    if (!user) return [];
    return this.dataService.orders().filter(o => 
      o.cliente.email?.toLowerCase() === user.email.toLowerCase() ||
      o.cliente.nombre.toLowerCase().includes(user.nombre_completo.toLowerCase())
    );
  });

  saveAddress(alias: string, dir: string, barrio: string) {
    const user = this.activeUser();
    if (!dir || !user) return;
    this.supabaseService.addDireccion({
      id_usuario: user.id,
      alias: alias || 'Mi Dirección',
      direccion_completa: dir,
      barrio: barrio || 'Centro',
      ciudad: 'La Dorada',
      departamento: 'Caldas',
      codigo_postal: '175031',
      predeterminada: this.userAddresses().length === 0
    });
  }

  async handleSignOut() {
    await this.supabaseService.signOut();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
