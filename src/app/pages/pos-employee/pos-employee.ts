import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
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
  imports: [UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#2E0A16] text-[#FDF8F4] min-h-screen p-4 sm:p-6 font-sans">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- POS Top Header -->
        <div class="bg-[#3A0A1C] rounded-[28px] p-5 border border-[#4A0D22] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#D95578] text-[#4A0D22] flex items-center justify-center font-bold text-xl">
              🛒
            </div>
            <div>
              <h1 class="text-xl font-serif italic text-white">POS Ventas en Local — Mochi. La Dorada</h1>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-[#E0F2F1] font-medium">
                  Empleado: <strong>{{ selectedEmpleado()?.nombre_completo || 'Neider Gómez' }}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Branch & Employee Selector + Shift Stats Summary -->
          <div class="flex flex-wrap items-center gap-4 text-xs">
            <div class="flex items-center gap-6 bg-[#2E0A16] px-5 py-2 rounded-full border border-[#4A0D22]">
              <div>
                <span class="text-[#FDF8F4]/60 block uppercase tracking-wider text-[9px]">Ventas Turno:</span>
                <span class="text-base font-serif italic text-[#D95578]">{{ '$' + todaySalesTotal().toLocaleString('es-CO') }}</span>
              </div>
              <div class="border-l border-[#4A0D22] pl-4">
                <span class="text-[#FDF8F4]/60 block uppercase tracking-wider text-[9px]">Tickets:</span>
                <span class="text-base font-bold text-white">{{ todaySalesCount() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- POS Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left 7 Cols: Catalog & Fast Product Picker -->
          <div class="lg:col-span-7 bg-[#3A0A1C] rounded-[32px] border border-[#4A0D22] p-6 space-y-4">
            
            <!-- Product Search -->
            <div class="relative">
              <input 
                type="text" 
                placeholder="Buscar postre para venta en mostrador..." 
                [value]="searchQuery()"
                (input)="searchQuery.set($any($event.target).value)"
                class="w-full px-4 py-3 rounded-full bg-[#2E0A16] border border-[#4A0D22] text-xs text-white focus:outline-none focus:border-[#D95578]"
              />
            </div>

            <!-- Products Tap Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              @for (prod of filteredProducts(); track prod.id) {
                <button 
                  (click)="addToPOSCart(prod)"
                  class="p-3.5 rounded-[24px] bg-[#2E0A16] border border-[#4A0D22] hover:border-[#D95578] text-left transition-all active:scale-95 space-y-2 group">
                  <img [src]="prod.imagen_principal" alt="" class="w-full h-24 object-cover rounded-[16px]">
                  <div>
                    <span class="text-[10px] text-[#FDF8F4]/60 block font-serif italic">{{ prod.nombre_japones }}</span>
                    <h3 class="text-xs font-serif italic text-white group-hover:text-[#D95578] transition-colors line-clamp-1">
                      {{ prod.nombre_espanol }}
                    </h3>
                    <div class="flex justify-between items-center mt-1">
                      <span class="text-xs font-serif italic text-[#D95578]">
                        {{ '$' + prod.precio.toLocaleString('es-CO') }}
                      </span>
                      <span [class]="prod.stock <= 5 ? 'text-[#ff8a80] font-bold' : 'text-[#FDF8F4]/50'" class="text-[9px]">
                        Stock: {{ prod.stock }}
                      </span>
                    </div>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Right 5 Cols: Current Order Ticket & Checkout -->
          <div class="lg:col-span-5 bg-[#3A0A1C] rounded-[32px] border border-[#4A0D22] p-6 space-y-4 sticky top-6">
            <h2 class="text-base font-serif italic text-white pb-2 border-b border-[#4A0D22] flex justify-between items-center">
              <span>Ticket de Venta (detalle_pedido: local)</span>
              <button (click)="posItems.set([])" class="text-xs text-[#D95578] font-bold uppercase tracking-wider hover:underline">Vaciar</button>
            </h2>

            <!-- Customer Details for Local Receipt -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <input 
                type="text" 
                placeholder="Nombre Cliente" 
                [value]="clienteNombre()"
                (input)="clienteNombre.set($any($event.target).value)"
                class="p-3 rounded-full bg-[#2E0A16] border border-[#4A0D22] text-white text-xs"
              />
              <input 
                type="text" 
                placeholder="Teléfono" 
                [value]="clienteTel()"
                (input)="clienteTel.set($any($event.target).value)"
                class="p-3 rounded-full bg-[#2E0A16] border border-[#4A0D22] text-white text-xs"
              />
            </div>

            <!-- Items List -->
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              @for (item of posItems(); track item.product.id) {
                <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#2E0A16] border border-[#4A0D22] text-xs">
                  <div>
                    <span class="font-serif italic text-white block">{{ item.product.nombre_espanol }}</span>
                    <span class="text-[10px] text-[#FDF8F4]/60">{{ '$' + (item.product.precio).toLocaleString('es-CO') }} c/u</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button (click)="updatePOSQty(item.product.id, -1)" class="w-6 h-6 rounded-full bg-[#3A0A1C] text-white flex items-center justify-center text-xs font-bold border border-[#4A0D22]">-</button>
                    <span class="font-bold font-mono">{{ item.cantidad }}</span>
                    <button (click)="updatePOSQty(item.product.id, 1)" class="w-6 h-6 rounded-full bg-[#3A0A1C] text-white flex items-center justify-center text-xs font-bold border border-[#4A0D22]">+</button>
                  </div>
                </div>
              } @empty {
                <div class="p-8 text-center text-[#FDF8F4]/50 text-xs italic">
                  Selecciona postres del panel izquierdo para agregarlos al ticket.
                </div>
              }
            </div>

            <!-- Payment Method Selector -->
            <div class="space-y-1.5 pt-2 border-t border-[#4A0D22]">
              <span class="text-[10px] text-[#FDF8F4]/60 uppercase tracking-wider block font-bold">Método de Cobro en Mostrador:</span>
              <div class="grid grid-cols-4 gap-1 text-[10px] font-bold">
                <button 
                  (click)="metodoPago.set('efectivo')"
                  [class]="metodoPago() === 'efectivo' ? 'bg-[#D95578] text-[#4A0D22]' : 'bg-[#2E0A16] text-white border border-[#4A0D22]'"
                  class="py-2 rounded-xl transition-all uppercase">
                  💵 Efvo
                </button>
                <button 
                  (click)="metodoPago.set('tarjeta')"
                  [class]="metodoPago() === 'tarjeta' ? 'bg-[#D95578] text-[#4A0D22]' : 'bg-[#2E0A16] text-white border border-[#4A0D22]'"
                  class="py-2 rounded-xl transition-all uppercase">
                  💳 Tarjeta
                </button>
                <button 
                  (click)="metodoPago.set('nequi')"
                  [class]="metodoPago() === 'nequi' ? 'bg-[#D95578] text-[#4A0D22]' : 'bg-[#2E0A16] text-white border border-[#4A0D22]'"
                  class="py-2 rounded-xl transition-all uppercase">
                  📱 Nequi
                </button>
                <button 
                  (click)="metodoPago.set('daviplata')"
                  [class]="metodoPago() === 'daviplata' ? 'bg-[#D95578] text-[#4A0D22]' : 'bg-[#2E0A16] text-white border border-[#4A0D22]'"
                  class="py-2 rounded-xl transition-all uppercase">
                  📱 Davi
                </button>
              </div>
            </div>

            <!-- Total and Print Ticket Button -->
            <div class="pt-3 border-t border-[#4A0D22] space-y-3">
              <div class="flex justify-between items-center text-sm">
                <span class="text-[#FDF8F4]/70 font-medium">TOTAL A COBRAR:</span>
                <span class="text-2xl font-serif italic text-[#D95578]">{{ '$' + posTotal().toLocaleString('es-CO') }}</span>
              </div>

              <button 
                [disabled]="posItems().length === 0"
                (click)="recordSale()"
                class="w-full py-4 rounded-full bg-[#D95578] hover:bg-[#ffc2d1] disabled:opacity-40 text-[#4A0D22] font-bold text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">
                <span>✓ Finalizar Venta & Emitir Ticket</span>
              </button>
            </div>

          </div>

        </div>

        <!-- Last Sale Ticket Modal / Toast -->
        @if (lastSale()) {
          @let sale = lastSale()!;
          <div class="bg-[#3A0A1C] rounded-[28px] border border-[#4A0D22] p-6 max-w-md mx-auto space-y-3 text-xs">
            <div class="flex justify-between items-center text-sm font-bold text-[#E0F2F1]">
              <span>✓ Venta Registrada con Éxito</span>
              <button (click)="lastSale.set(null)" class="text-[#FDF8F4]/60 hover:text-white">✕</button>
            </div>
            <div class="p-4 rounded-2xl bg-[#2E0A16] border border-[#4A0D22] space-y-1 font-mono text-[11px]">
              <div class="flex justify-between">
                <span class="text-[#FDF8F4]/60">Ticket:</span>
                <span class="font-bold text-white">{{ sale.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#FDF8F4]/60">Atendido por:</span>
                <span class="text-white">{{ sale.empleado }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#FDF8F4]/60">Cliente:</span>
                <span class="text-white">{{ sale.clienteNombre }}</span>
              </div>
              <div class="flex justify-between font-bold text-sm text-[#D95578] pt-2 border-t border-[#4A0D22]">
                <span>Total Cobrado:</span>
                <span>{{ '$' + sale.total.toLocaleString('es-CO') }}</span>
              </div>
            </div>
          </div>
        }

      </div>
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

