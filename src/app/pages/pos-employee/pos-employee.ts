import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MochiDataService } from '../../services/mochi-data.service';
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
    <div class="bg-[#2E2620] text-[#FAF7F2] min-h-screen p-4 sm:p-6 font-sans">
      <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- POS Top Header -->
        <div class="bg-[#362D26] rounded-[28px] p-5 border border-[#4A3F35] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-[#FFD6E0] text-[#4A3F35] flex items-center justify-center font-bold text-xl">
              🛒
            </div>
            <div>
              <h1 class="text-xl font-serif italic text-white">POS Ventas en Local — Mochi. La Dorada</h1>
              <span class="text-xs text-[#E0F2F1] font-medium">Empleado Activo: Neider (Turno Tarde)</span>
            </div>
          </div>

          <!-- Shift Stats Summary -->
          <div class="flex items-center gap-6 text-xs bg-[#2E2620] px-5 py-2.5 rounded-full border border-[#4A3F35]">
            <div>
              <span class="text-[#FAF7F2]/60 block uppercase tracking-wider text-[10px]">Ventas Turno Hoy:</span>
              <span class="text-lg font-serif italic text-[#FFD6E0]">{{ '$' + todaySalesTotal().toLocaleString('es-CO') }}</span>
            </div>
            <div class="border-l border-[#4A3F35] pl-6">
              <span class="text-[#FAF7F2]/60 block uppercase tracking-wider text-[10px]">Tickets Emitidos:</span>
              <span class="text-lg font-bold text-white">{{ todaySalesCount() }}</span>
            </div>
          </div>
        </div>

        <!-- POS Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Left 7 Cols: Catalog & Fast Product Picker -->
          <div class="lg:col-span-7 bg-[#362D26] rounded-[32px] border border-[#4A3F35] p-6 space-y-4">
            
            <!-- Product Search -->
            <div class="relative">
              <span class="material-icons absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF7F2]/50">search</span>
              <input 
                type="text" 
                placeholder="Buscar producto para venta presencial..." 
                [value]="searchQuery()"
                (input)="searchQuery.set($any($event.target).value)"
                class="w-full pl-11 pr-4 py-3 rounded-full bg-[#2E2620] border border-[#4A3F35] text-xs text-white focus:outline-none focus:border-[#FFD6E0]"
              />
            </div>

            <!-- Products Tap Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              @for (prod of filteredProducts(); track prod.id) {
                <button 
                  (click)="addToPOSCart(prod)"
                  class="p-3.5 rounded-[24px] bg-[#2E2620] border border-[#4A3F35] hover:border-[#FFD6E0] text-left transition-all active:scale-95 space-y-2 group">
                  <img [src]="prod.imagen_principal" alt="" class="w-full h-24 object-cover rounded-[16px]">
                  <div>
                    <span class="text-[10px] text-[#FAF7F2]/60 block font-serif italic">{{ prod.nombre_japones }}</span>
                    <h3 class="text-xs font-serif italic text-white group-hover:text-[#FFD6E0] transition-colors line-clamp-1">
                      {{ prod.nombre_espanol }}
                    </h3>
                    <div class="flex justify-between items-center mt-1">
                      <span class="text-xs font-serif italic text-[#FFD6E0]">
                        {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                      </span>
                      <span class="text-[9px] text-[#FAF7F2]/50">Stock: {{ prod.stock }}</span>
                    </div>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Right 5 Cols: Current Order Ticket & Checkout -->
          <div class="lg:col-span-5 bg-[#362D26] rounded-[32px] border border-[#4A3F35] p-6 space-y-4 sticky top-6">
            <h2 class="text-base font-serif italic text-white pb-2 border-b border-[#4A3F35] flex justify-between items-center">
              <span>Ticket de Compra Presencial</span>
              <button (click)="posItems.set([])" class="text-xs text-[#FFD6E0] font-bold uppercase tracking-wider hover:underline">Vaciar</button>
            </h2>

            <!-- Customer Details for Local Receipt -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <input 
                type="text" 
                placeholder="Nombre Cliente" 
                [value]="clienteNombre()"
                (input)="clienteNombre.set($any($event.target).value)"
                class="p-3 rounded-full bg-[#2E2620] border border-[#4A3F35] text-white text-xs"
              />
              <input 
                type="text" 
                placeholder="Teléfono" 
                [value]="clienteTel()"
                (input)="clienteTel.set($any($event.target).value)"
                class="p-3 rounded-full bg-[#2E2620] border border-[#4A3F35] text-white text-xs"
              />
            </div>

            <!-- Items List -->
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              @for (item of posItems(); track item.product.id) {
                <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#2E2620] border border-[#4A3F35] text-xs">
                  <div>
                    <span class="font-serif italic text-white block">{{ item.product.nombre_espanol }}</span>
                    <span class="text-[10px] text-[#FAF7F2]/60">{{ '$' + (item.product.precio_oferta || item.product.precio).toLocaleString('es-CO') }} c/u</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="flex items-center bg-[#362D26] rounded-full border border-[#4A3F35] p-0.5">
                      <button (click)="updatePOSQty(item.product.id, -1)" class="w-5 h-5 text-zinc-300 font-bold">-</button>
                      <span class="w-6 text-center text-xs font-bold text-white">{{ item.cantidad }}</span>
                      <button (click)="updatePOSQty(item.product.id, 1)" class="w-5 h-5 text-zinc-300 font-bold">+</button>
                    </div>
                    <span class="font-serif italic text-[#FFD6E0] min-w-14 text-right">
                      {{ '$' + (item.cantidad * (item.product.precio_oferta || item.product.precio)).toLocaleString('es-CO') }}
                    </span>
                  </div>
                </div>
              }
            </div>

            <!-- Payment Method Selection -->
            <div class="space-y-1.5 text-xs pt-2 border-t border-[#4A3F35]">
              <span class="font-bold text-[#FAF7F2] uppercase tracking-wider text-[10px] block">Forma de Pago:</span>
              <div class="grid grid-cols-4 gap-2">
                <button 
                  (click)="metodoPago.set('efectivo')" 
                  [class]="metodoPago() === 'efectivo' ? 'bg-[#FFD6E0] text-[#4A3F35] font-bold' : 'bg-[#2E2620] text-[#FAF7F2]/70 border border-[#4A3F35]'"
                  class="py-2.5 rounded-full text-[11px] transition-colors">
                  💵 Efectivo
                </button>

                <button 
                  (click)="metodoPago.set('nequi')" 
                  [class]="metodoPago() === 'nequi' ? 'bg-[#FFD6E0] text-[#4A3F35] font-bold' : 'bg-[#2E2620] text-[#FAF7F2]/70 border border-[#4A3F35]'"
                  class="py-2.5 rounded-full text-[11px] transition-colors">
                  📱 Nequi
                </button>

                <button 
                  (click)="metodoPago.set('daviplata')" 
                  [class]="metodoPago() === 'daviplata' ? 'bg-[#FFD6E0] text-[#4A3F35] font-bold' : 'bg-[#2E2620] text-[#FAF7F2]/70 border border-[#4A3F35]'"
                  class="py-2.5 rounded-full text-[11px] transition-colors">
                  📱 Daviplata
                </button>

                <button 
                  (click)="metodoPago.set('tarjeta')" 
                  [class]="metodoPago() === 'tarjeta' ? 'bg-[#FFD6E0] text-[#4A3F35] font-bold' : 'bg-[#2E2620] text-[#FAF7F2]/70 border border-[#4A3F35]'"
                  class="py-2.5 rounded-full text-[11px] transition-colors">
                  💳 Tarjeta
                </button>
              </div>
            </div>

            <!-- Total & Checkout Action -->
            <div class="pt-3 border-t border-[#4A3F35] space-y-3">
              <div class="flex justify-between items-baseline">
                <span class="text-xs text-[#FAF7F2]/60 font-bold uppercase tracking-wider">TOTAL VENTA:</span>
                <span class="text-2xl font-serif italic text-[#FFD6E0]">{{ '$' + posTotal().toLocaleString('es-CO') }}</span>
              </div>

              <button 
                [disabled]="posItems().length === 0"
                (click)="recordSale()"
                class="w-full py-4 rounded-full bg-[#FFD6E0] hover:bg-[#ffc2d1] disabled:opacity-50 text-[#4A3F35] font-bold text-xs tracking-widest uppercase transition-all shadow-sm active:scale-95">
                Registrar Venta & Generar Comprobante
              </button>
            </div>

            <!-- Last Sale Digital Receipt Modal/Preview -->
            @if (lastSale()) {
              @let sale = lastSale()!;
              <div class="p-4 rounded-2xl bg-[#2E2620] border border-[#FFD6E0]/50 text-xs space-y-2 font-mono text-[#FAF7F2]">
                <div class="flex justify-between font-bold text-white">
                  <span>COMPROBANTE: {{ sale.id }}</span>
                  <span class="text-[#E0F2F1]">REGISTRADA</span>
                </div>
                <p class="text-[10px]">Cliente: {{ sale.clienteNombre }} | Método: {{ sale.metodoPago | uppercase }}</p>
                <p class="text-[#FFD6E0] font-bold text-sm">TOTAL: {{ '$' + sale.total.toLocaleString('es-CO') }}</p>
              </div>
            }

          </div>

        </div>

      </div>
    </div>
  `
})
export class PosEmployeePageComponent {
  dataService = inject(MochiDataService);

  searchQuery = signal('');
  clienteNombre = signal('Cliente General');
  clienteTel = signal('');
  metodoPago = signal<'efectivo' | 'tarjeta' | 'nequi' | 'daviplata'>('efectivo');

  posItems = signal<POSCartItem[]>([]);
  lastSale = signal<POSSale | null>(null);

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
      const p = item.product.precio_oferta || item.product.precio;
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

  recordSale() {
    if (this.posItems().length === 0) return;

    const sale = this.dataService.recordPOSSale({
      empleado: 'Neider',
      clienteNombre: this.clienteNombre() || 'Cliente General',
      clienteTelefono: this.clienteTel(),
      items: this.posItems().map(i => ({
        productoId: i.product.id,
        nombre: i.product.nombre_espanol,
        cantidad: i.cantidad,
        precio: i.product.precio_oferta || i.product.precio
      })),
      subtotal: this.posTotal(),
      total: this.posTotal(),
      metodoPago: this.metodoPago()
    });

    this.lastSale.set(sale);
    this.posItems.set([]);
  }
}
