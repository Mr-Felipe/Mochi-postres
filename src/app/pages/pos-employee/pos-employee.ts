import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { Product, POSSale } from '../../models/mochi.models';

interface POSCartItem {
  product: Product;
  cantidad: number;
}

@Component({
  selector: 'app-pos-employee',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col gap-4 overflow-hidden">
      
      <!-- POS Top Header -->
      <div class="bg-white rounded-[28px] p-5 border border-[#E8D8D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#D95578] text-white flex items-center justify-center font-bold text-xl">
            🛒
          </div>
          <div>
            <h1 class="text-xl font-serif italic text-[#590E2A]">POS Ventas en Local — Mochi. La Dorada</h1>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-[#590E2A]/60 font-medium">
                Empleado: <strong class="text-[#590E2A]">{{ selectedEmpleado()?.nombre_completo || 'Neider Gómez' }}</strong>
              </span>
            </div>
          </div>
        </div>

        <!-- Shift Stats Summary -->
        <div class="flex flex-wrap items-center gap-4 text-xs">
          <div class="flex items-center gap-6 bg-[#FDF8F4] px-5 py-2 rounded-full border border-[#E8D8D0]">
            <div>
              <span class="text-[#590E2A]/50 block uppercase tracking-wider text-[9px]">Ventas Turno:</span>
              <span class="text-base font-serif italic text-[#D95578]">{{ '$' + todaySalesTotal().toLocaleString('es-CO') }}</span>
            </div>
            <div class="border-l border-[#E8D8D0] pl-4">
              <span class="text-[#590E2A]/50 block uppercase tracking-wider text-[9px]">Tickets:</span>
              <span class="text-base font-bold text-[#590E2A]">{{ todaySalesCount() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- POS Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 items-stretch">
        
        <!-- Left 7 Cols: Catalog & Fast Product Picker -->
        <div class="lg:col-span-7 bg-white rounded-[32px] border border-[#E8D8D0] p-6 flex flex-col shadow-xs min-h-0">
          
          <!-- Product Search -->
          <div class="relative">
            <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-[#590E2A]/30 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Buscar postre para venta en mostrador..." 
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              class="w-full pl-11 pr-4 py-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-xs text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-[#D95578] transition-colors"
            />
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1 min-h-0">
            @for (prod of filteredProducts(); track prod.id) {
              <button 
                (click)="addToPOSCart(prod)"
                class="p-3.5 rounded-[24px] bg-[#FDF8F4] border border-[#E8D8D0] hover:border-[#D95578] hover:shadow-md text-left transition-all active:scale-95 space-y-2 group">
                <img [src]="prod.imagen_principal" alt="" class="w-full h-24 object-cover rounded-[16px]">
                <div>
                  <span class="text-[10px] text-[#D95578] block font-serif italic">{{ prod.nombre_japones }}</span>
                  <h3 class="text-xs font-serif italic text-[#590E2A] group-hover:text-[#D95578] transition-colors line-clamp-1">
                    {{ prod.nombre_espanol }}
                  </h3>
                  <div class="flex justify-between items-center mt-1">
                    <span class="text-xs font-serif italic text-[#590E2A] font-bold">
                      {{ '$' + prod.precio.toLocaleString('es-CO') }}
                    </span>
                    <span [class]="prod.stock <= 5 ? 'text-red-500 font-bold' : 'text-[#590E2A]/40'" class="text-[9px]">
                      Stock: {{ prod.stock }}
                    </span>
                  </div>
                </div>
              </button>
            }

            <!-- Personalizado Button -->
            <a routerLink="/personalizar-vaso"
              class="p-3.5 rounded-[24px] bg-gradient-to-br from-[#D95578] to-[#A33D5E] hover:shadow-md text-left transition-all active:scale-95 space-y-2 group">
              <div class="w-full h-24 rounded-[16px] flex items-center justify-center">
                <span class="material-icons text-white/30 text-4xl group-hover:scale-110 transition-transform">local_cafe</span>
              </div>
              <div>
                <span class="text-[10px] text-white/70 block font-serif italic">カスタム</span>
                <h3 class="text-xs font-serif italic text-white group-hover:text-white transition-colors">
                  Personalizado
                </h3>
                <span class="text-[9px] text-white/60 mt-1 block">Configurar</span>
              </div>
            </a>
          </div>
        </div>

        <!-- Right 5 Cols: Current Order Ticket & Checkout -->
        <div class="lg:col-span-5 bg-white rounded-[32px] border border-[#E8D8D0] p-6 flex flex-col shadow-xs min-h-0">
          <h2 class="text-base font-serif italic text-[#590E2A] pb-2 border-b border-[#E8D8D0] flex justify-between items-center">
            <span>Ticket de Venta (local)</span>
            <button (click)="posItems.set([])" class="text-xs text-[#D95578] font-bold uppercase tracking-wider hover:underline">Vaciar</button>
          </h2>

          <!-- Customer Details -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <input 
              type="text" 
              placeholder="Nombre Cliente" 
              [value]="clienteNombre()"
              (input)="clienteNombre.set($any($event.target).value)"
              class="p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs placeholder-[#590E2A]/30 focus:outline-none focus:border-[#D95578]"
            />
            <input 
              type="text" 
              placeholder="Teléfono" 
              [value]="clienteTel()"
              (input)="clienteTel.set($any($event.target).value)"
              class="p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs placeholder-[#590E2A]/30 focus:outline-none focus:border-[#D95578]"
            />
          </div>

          <!-- Items List -->
          <div class="space-y-2 flex-1 overflow-y-auto pr-1 min-h-0">
            @for (item of posItems(); track item.product.id) {
              <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-xs">
                <div>
                  <span class="font-serif italic text-[#590E2A] block">{{ item.product.nombre_espanol }}</span>
                  <span class="text-[10px] text-[#590E2A]/50">{{ '$' + (item.product.precio).toLocaleString('es-CO') }} c/u</span>
                </div>

                <div class="flex items-center gap-2">
                  <button (click)="updatePOSQty(item.product.id, -1)" class="w-6 h-6 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] flex items-center justify-center text-xs font-bold hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-colors">-</button>
                  <span class="font-bold font-mono text-[#590E2A]">{{ item.cantidad }}</span>
                  <button (click)="updatePOSQty(item.product.id, 1)" class="w-6 h-6 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] flex items-center justify-center text-xs font-bold hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-colors">+</button>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-[#590E2A]/40 text-xs italic">
                Selecciona postres del panel izquierdo para agregarlos al ticket.
              </div>
            }
          </div>

          <!-- Payment Method Selector -->
          <div class="space-y-1.5 pt-2 border-t border-[#E8D8D0]">
            <span class="text-[10px] text-[#590E2A]/50 uppercase tracking-wider block font-bold">Método de Cobro:</span>
            <div class="grid grid-cols-4 gap-1 text-[10px] font-bold">
              <button 
                (click)="metodoPago.set('efectivo')"
                [class]="metodoPago() === 'efectivo' ? 'bg-[#D95578] text-white' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'"
                class="py-2 rounded-xl transition-all uppercase hover:opacity-80">
                💵 Efectivo
              </button>
              <button 
                (click)="metodoPago.set('tarjeta')"
                [class]="metodoPago() === 'tarjeta' ? 'bg-[#D95578] text-white' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'"
                class="py-2 rounded-xl transition-all uppercase hover:opacity-80">
                💳 Tarjeta
              </button>
              <button 
                (click)="metodoPago.set('nequi')"
                [class]="metodoPago() === 'nequi' ? 'bg-[#D95578] text-white' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'"
                class="py-2 rounded-xl transition-all uppercase hover:opacity-80">
                📱 Nequi
              </button>
              <button 
                (click)="metodoPago.set('daviplata')"
                [class]="metodoPago() === 'daviplata' ? 'bg-[#D95578] text-white' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'"
                class="py-2 rounded-xl transition-all uppercase hover:opacity-80">
                📱 Daviplata
              </button>
            </div>
          </div>

          <!-- Total and Finalize Button -->
          <div class="pt-3 border-t border-[#E8D8D0] space-y-3">
            <div class="flex justify-between items-center text-sm">
              <span class="text-[#590E2A]/70 font-medium">TOTAL A COBRAR:</span>
              <span class="text-2xl font-serif italic text-[#D95578] font-bold">{{ '$' + posTotal().toLocaleString('es-CO') }}</span>
            </div>

            <button 
              [disabled]="posItems().length === 0"
              (click)="recordSale()"
              class="w-full py-4 rounded-full bg-[#D95578] hover:bg-[#FF6078] disabled:opacity-40 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">
              <span class="material-icons text-lg">receipt_long</span>
              <span>Finalizar Venta & Emitir Ticket</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Last Sale Ticket -->
      @if (lastSale()) {
        @let sale = lastSale()!;
        <div class="bg-white rounded-[28px] border border-[#E8D8D0] p-6 max-w-md mx-auto space-y-3 text-xs shadow-xs">
          <div class="flex justify-between items-center text-sm font-bold text-[#590E2A]">
            <span class="flex items-center gap-2">
              <span class="material-icons text-[#065F46]">check_circle</span>
              Venta Registrada
            </span>
            <button (click)="lastSale.set(null)" class="text-[#590E2A]/40 hover:text-[#590E2A] transition-colors">
              <span class="material-icons text-lg">close</span>
            </button>
          </div>
          <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-1 font-mono text-[11px]">
            <div class="flex justify-between">
              <span class="text-[#590E2A]/50">Ticket:</span>
              <span class="font-bold text-[#590E2A]">{{ sale.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#590E2A]/50">Atendido por:</span>
              <span class="text-[#590E2A]">{{ sale.empleado }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#590E2A]/50">Cliente:</span>
              <span class="text-[#590E2A]">{{ sale.clienteNombre }}</span>
            </div>
            <div class="flex justify-between font-bold text-sm text-[#D95578] pt-2 border-t border-[#E8D8D0]">
              <span>Total Cobrado:</span>
              <span>{{ '$' + sale.total.toLocaleString('es-CO') }}</span>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class PosEmployeePageComponent {
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  Number = Number;

  searchQuery = signal('');
  clienteNombre = signal('Cliente General');
  clienteTel = signal('');
  metodoPago = signal<'efectivo' | 'tarjeta' | 'nequi' | 'daviplata'>('efectivo');

  posItems = signal<POSCartItem[]>([]);
  lastSale = signal<POSSale | null>(null);

  selectedEmpleado = computed(() => {
    return this.supabaseService.usuarios().find(u => u.rol === 'empleado') || this.supabaseService.usuarios()[1];
  });

  filteredProducts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.dataService.activeProducts();
    if (!q) return list;
    return list.filter(p =>
      p.nombre_espanol.toLowerCase().includes(q) ||
      p.nombre_japones.toLowerCase().includes(q)
    );
  });

  posTotal = computed(() => {
    return this.posItems().reduce((sum, item) => {
      const p = item.product.precio;
      return sum + (p * item.cantidad);
    }, 0);
  });

  todaySalesTotal = computed(() => {
    return this.dataService.posSales().reduce((sum, s) => sum + s.total, 0);
  });

  todaySalesCount = computed(() => {
    return this.dataService.posSales().length;
  });

  addToPOSCart(product: Product) {
    const current = this.posItems();
    const idx = current.findIndex(i => i.product.id === product.id);
    if (idx > -1) {
      const updated = [...current];
      updated[idx].cantidad += 1;
      this.posItems.set(updated);
    } else {
      this.posItems.set([...current, { product, cantidad: 1 }]);
    }
  }

  updatePOSQty(productId: number, delta: number) {
    const current = this.posItems();
    const idx = current.findIndex(i => i.product.id === productId);
    if (idx > -1) {
      const newQty = current[idx].cantidad + delta;
      if (newQty <= 0) {
        this.posItems.set(current.filter(i => i.product.id !== productId));
      } else {
        const updated = [...current];
        updated[idx].cantidad = newQty;
        this.posItems.set(updated);
      }
    }
  }

  async recordSale() {
    if (this.posItems().length === 0) return;

    const emp = this.selectedEmpleado();
    const sale = await this.dataService.recordPOSSale({
      id_empleado: emp?.id,
      empleado: emp?.nombre_completo || 'Neider Gómez',
      clienteNombre: this.clienteNombre() || 'Cliente General',
      clienteTelefono: this.clienteTel(),
      items: this.posItems().map(i => ({
        productoId: i.product.id,
        nombre: i.product.nombre_espanol,
        cantidad: i.cantidad,
        precio: i.product.precio
      })),
      subtotal: this.posTotal(),
      total: this.posTotal(),
      metodoPago: this.metodoPago()
    });

    this.lastSale.set(sale);
    this.posItems.set([]);
  }
}
