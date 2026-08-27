import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';
import { Product, POSSale } from '../../models/mochi.models';

interface POSCartItem {
  product: Product;
  cantidad: number;
  configuracion_capas?: any;
  customPrice?: number;
}

@Component({
  selector: 'app-pos-employee',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col gap-4 overflow-hidden">

      <!-- POS Header -->
      <div class="bg-white rounded-[28px] p-5 border border-[#E8D8D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#D95578] text-white flex items-center justify-center">
            <span class="material-icons text-xl">point_of_sale</span>
          </div>
          <div>
            <h1 class="text-lg font-serif italic text-[#590E2A]">Punto de Venta</h1>
            <span class="text-[10px] text-[#590E2A]/50 uppercase tracking-wider font-bold">{{ todaySalesCount() }} ventas hoy · {{ '$' + todaySalesTotal().toLocaleString('es-CO') }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="material-icons text-[#590E2A]/30 text-lg">person</span>
          <span class="text-xs text-[#590E2A] font-medium">{{ selectedEmpleado()?.nombre_completo || 'Neider Gómez' }}</span>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">

        <!-- Left: Products -->
        <div class="lg:col-span-7 bg-white rounded-[28px] border border-[#E8D8D0] p-5 flex flex-col shadow-xs min-h-0">

          <!-- Search -->
          <div class="relative mb-4">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/25 text-lg">search</span>
            <input
              type="text"
              placeholder="Buscar postre..."
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-xs text-[#590E2A] placeholder-[#590E2A]/25 focus:outline-none focus:border-[#D95578] transition-colors"
            />
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5 flex-1 overflow-y-auto pr-1 min-h-0 content-start">
            @for (prod of filteredProducts(); track prod.id) {
              <button
                (click)="addToPOSCart(prod)"
                class="p-2.5 rounded-[20px] bg-[#FDF8F4] border border-[#E8D8D0] hover:border-[#D95578] hover:shadow-md text-left transition-all active:scale-95 group">
                <div class="w-full aspect-square rounded-[14px] overflow-hidden mb-2 bg-[#E8D8D0]/30">
                  <img [src]="prod.imagen_principal" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <h3 class="text-[10px] font-serif italic text-[#590E2A] group-hover:text-[#D95578] transition-colors line-clamp-1 leading-tight">
                  {{ prod.nombre_espanol }}
                </h3>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-[11px] font-bold text-[#590E2A]">
                    {{ '$' + prod.precio.toLocaleString('es-CO') }}
                  </span>
                  <span [class]="prod.stock <= 5 ? 'text-red-500' : 'text-[#590E2A]/25'" class="text-[8px] font-bold">
                    {{ prod.stock }}
                  </span>
                </div>
              </button>
            }

            <!-- Personalizado Button -->
            <a routerLink="/empleado/personalizar-vaso"
              class="p-2.5 rounded-[20px] bg-gradient-to-br from-[#D95578] to-[#A33D5E] hover:shadow-md text-left transition-all active:scale-95 group">
              <div class="w-full aspect-square rounded-[14px] flex items-center justify-center mb-2">
                <span class="material-icons text-white/30 text-3xl group-hover:scale-110 transition-transform">local_cafe</span>
              </div>
              <h3 class="text-[10px] font-serif italic text-white leading-tight">Personalizado</h3>
              <span class="text-[8px] text-white/50 mt-0.5 block">Configurar</span>
            </a>
          </div>
        </div>

        <!-- Right: Ticket -->
        <div class="lg:col-span-5 bg-white rounded-[28px] border border-[#E8D8D0] p-5 flex flex-col shadow-xs min-h-0">

          <!-- Ticket Header -->
          <div class="flex items-center justify-between pb-3 border-b border-[#E8D8D0]">
            <div class="flex items-center gap-2">
              <span class="material-icons text-[#D95578] text-lg">receipt</span>
              <span class="text-sm font-serif italic text-[#590E2A]">Ticket</span>
            </div>
            @if (cartService.posItems().length > 0) {
              <button (click)="cartService.posItems.set([])" class="flex items-center gap-1 text-[10px] text-[#590E2A]/40 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">
                <span class="material-icons text-xs">delete_sweep</span> Vaciar
              </button>
            }
          </div>

          <!-- Items List -->
          <div class="space-y-1.5 flex-1 overflow-y-auto py-3 min-h-0">
            @for (item of cartService.posItems(); track item.product.id + (item.configuracion_capas?.base || '')) {
              <div class="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0]">
                <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white border border-[#E8D8D0]">
                  <img [src]="item.product.imagen_principal" alt="" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] font-serif italic text-[#590E2A] truncate">{{ item.product.nombre_espanol }}</span>
                    @if (item.configuracion_capas) {
                      <span class="material-icons text-[#D95578] text-[10px]">auto_awesome</span>
                    }
                  </div>
                  <span class="text-[9px] text-[#590E2A]/40 font-bold">{{ '$' + (item.customPrice || item.product.precio).toLocaleString('es-CO') }} c/u</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button (click)="updatePOSQty(item.product.id, -1)"
                    class="w-6 h-6 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] flex items-center justify-center text-[10px] font-bold hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-colors">
                    <span class="material-icons text-[12px]">remove</span>
                  </button>
                  <span class="w-5 text-center font-bold text-[11px] text-[#590E2A] font-mono">{{ item.cantidad }}</span>
                  <button (click)="updatePOSQty(item.product.id, 1)"
                    class="w-6 h-6 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] flex items-center justify-center text-[10px] font-bold hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-colors">
                    <span class="material-icons text-[12px]">add</span>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center py-12 text-[#590E2A]/20">
                <span class="material-icons text-4xl mb-2">shopping_bag</span>
                <span class="text-[10px] uppercase tracking-wider font-bold">Sin productos</span>
              </div>
            }
          </div>

          <!-- Payment Methods -->
          <div class="pt-3 border-t border-[#E8D8D0]">
            <div class="grid grid-cols-4 gap-1.5">
              <button
                (click)="metodoPago.set('efectivo')"
                [class]="metodoPago() === 'efectivo' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">payments</span>
                <span class="text-[8px] font-bold uppercase">Efectivo</span>
              </button>
              <button
                (click)="metodoPago.set('tarjeta')"
                [class]="metodoPago() === 'tarjeta' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">credit_card</span>
                <span class="text-[8px] font-bold uppercase">Tarjeta</span>
              </button>
              <button
                (click)="metodoPago.set('nequi')"
                [class]="metodoPago() === 'nequi' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">smartphone</span>
                <span class="text-[8px] font-bold uppercase">Nequi</span>
              </button>
              <button
                (click)="metodoPago.set('daviplata')"
                [class]="metodoPago() === 'daviplata' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">account_balance_wallet</span>
                <span class="text-[8px] font-bold uppercase">Daviplata</span>
              </button>
            </div>
          </div>

          <!-- Total & CTA -->
          <div class="pt-3 border-t border-[#E8D8D0] space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-[10px] text-[#590E2A]/40 uppercase tracking-wider font-bold">Total</span>
              <span class="text-2xl font-serif italic text-[#D95578] font-bold">{{ '$' + posTotal().toLocaleString('es-CO') }}</span>
            </div>
            <button
              [disabled]="cartService.posItems().length === 0"
              (click)="recordSale()"
              class="w-full py-3.5 rounded-full bg-[#D95578] hover:bg-[#FF6078] disabled:opacity-30 text-white font-bold text-[11px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">
              <span class="material-icons text-base">check_circle</span>
              <span>Cobrar</span>
            </button>
          </div>

        </div>

      </div>

      <!-- Last Sale Toast -->
      @if (lastSale()) {
        @let sale = lastSale()!;
        <div class="fixed bottom-6 right-6 bg-white rounded-[24px] border border-[#E8D8D0] p-5 w-80 space-y-3 shadow-lg z-50">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="material-icons text-[#065F46]">check_circle</span>
              <span class="text-xs font-bold text-[#590E2A]">Venta Registrada</span>
            </div>
            <button (click)="lastSale.set(null)" class="text-[#590E2A]/30 hover:text-[#590E2A] transition-colors">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
          <div class="p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-1 text-[10px]">
            <div class="flex justify-between">
              <span class="text-[#590E2A]/40">Ticket</span>
              <span class="font-bold text-[#590E2A]">#{{ sale.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#590E2A]/40">Empleado</span>
              <span class="text-[#590E2A]">{{ sale.empleado }}</span>
            </div>
            <div class="flex justify-between font-bold text-sm text-[#D95578] pt-1.5 border-t border-[#E8D8D0]">
              <span>Cobrado</span>
              <span>{{ '$' + sale.total.toLocaleString('es-CO') }}</span>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class PosEmployeePageComponent implements OnInit {
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  cartService = inject(CartService);
  Number = Number;

  searchQuery = signal('');
  metodoPago = signal<'efectivo' | 'tarjeta' | 'nequi' | 'daviplata'>('efectivo');

  lastSale = signal<POSSale | null>(null);

  ngOnInit() {
    const pending = this.cartService.pendingCustomCup();
    if (pending) {
      const current = this.cartService.posItems();
      this.cartService.posItems.set([...current, {
        product: pending.product,
        cantidad: pending.cantidad,
        configuracion_capas: pending.configuracion_capas,
        customPrice: pending.customPrice
      }]);
      this.cartService.pendingCustomCup.set(null);
    }
  }

  selectedEmpleado = computed(() => {
    return this.supabaseService.usuarios().find(u => u.rol === 'empleado') || this.supabaseService.usuarios()[1];
  });

  filteredProducts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.dataService.activeProducts().filter(p => p.id !== 25);
    if (!q) return list;
    return list.filter(p =>
      p.nombre_espanol.toLowerCase().includes(q) ||
      p.nombre_japones.toLowerCase().includes(q)
    );
  });

  posTotal = computed(() => {
    return this.cartService.posItems().reduce((sum, item) => {
      const p = item.customPrice || item.product.precio;
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
    const current = this.cartService.posItems();
    const idx = current.findIndex(i => i.product.id === product.id);
    if (idx > -1) {
      const updated = [...current];
      updated[idx].cantidad += 1;
      this.cartService.posItems.set(updated);
    } else {
      this.cartService.posItems.set([...current, { product, cantidad: 1 }]);
    }
  }

  updatePOSQty(productId: number, delta: number) {
    const current = this.cartService.posItems();
    const idx = current.findIndex(i => i.product.id === productId);
    if (idx > -1) {
      const newQty = current[idx].cantidad + delta;
      if (newQty <= 0) {
        this.cartService.posItems.set(current.filter(i => i.product.id !== productId));
      } else {
        const updated = [...current];
        updated[idx].cantidad = newQty;
        this.cartService.posItems.set(updated);
      }
    }
  }

  async recordSale() {
    if (this.cartService.posItems().length === 0) return;

    const emp = this.selectedEmpleado();
    const sale = await this.dataService.recordPOSSale({
      id_empleado: emp?.id,
      empleado: emp?.nombre_completo || 'Neider Gómez',
      clienteNombre: 'Cliente Local',
      clienteTelefono: '',
      items: this.cartService.posItems().map(i => ({
        productoId: i.product.id,
        nombre: i.product.nombre_espanol,
        cantidad: i.cantidad,
        precio: i.customPrice || i.product.precio
      })),
      subtotal: this.posTotal(),
      total: this.posTotal(),
      metodoPago: this.metodoPago()
    });

    this.lastSale.set(sale);
    this.cartService.posItems.set([]);
  }
}
