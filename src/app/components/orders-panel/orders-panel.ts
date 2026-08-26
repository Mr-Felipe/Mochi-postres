import { Component, inject, signal, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MochiDataService } from '../../services/mochi-data.service';
import { Order, OrderStatus } from '../../models/mochi.models';

@Component({
  selector: 'app-orders-panel',
  standalone: true,
  imports: [DatePipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">

      <!-- Header with Stats -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-2xl font-serif italic text-[#590E2A] font-bold">Pedidos Online</h2>
          <p class="text-xs text-[#590E2A]/60 mt-1">Gestiona los estados de los pedidos recibidos</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-[#E8D8D0] text-xs">
            <div class="text-center">
              <span class="block text-lg font-bold text-[#D95578]">{{ pendingCount() }}</span>
              <span class="text-[9px] text-[#590E2A]/50 uppercase tracking-wider">Pendientes</span>
            </div>
            <div class="border-l border-[#E8D8D0] pl-4 text-center">
              <span class="block text-lg font-bold text-[#065F46]">{{ activeCount() }}</span>
              <span class="text-[9px] text-[#590E2A]/50 uppercase tracking-wider">Activos</span>
            </div>
            <div class="border-l border-[#E8D8D0] pl-4 text-center">
              <span class="block text-lg font-bold text-[#590E2A]/40">{{ deliveredTodayCount() }}</span>
              <span class="text-[9px] text-[#590E2A]/50 uppercase tracking-wider">Entregados Hoy</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 overflow-x-auto pb-1">
        <button (click)="activeFilter.set('pendiente')"
          [class]="activeFilter() === 'pendiente' ? 'bg-[#D95578] text-white' : 'bg-white text-[#D95578] border border-[#D95578]/30'"
          class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
          <span class="material-icons text-xs align-middle">pending</span> Pendientes ({{ pendingCount() }})
        </button>
        <button (click)="activeFilter.set('en_camino')"
          [class]="activeFilter() === 'en_camino' ? 'bg-[#3B82F6] text-white' : 'bg-white text-[#3B82F6] border border-[#3B82F6]/30'"
          class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
          <span class="material-icons text-xs align-middle">delivery_dining</span> En Camino ({{ deliveryCount() }})
        </button>
      </div>

      <!-- Orders List -->
      @if (filteredOrders().length > 0) {
        <div class="space-y-4">
          @for (ord of filteredOrders(); track ord.id) {
            <div [id]="'pedido-' + ord.id_pedido"
              class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 sm:p-6 shadow-xs transition-all hover:shadow-md"
                    [class.ring-2]="externalHighlightId() === ord.id_pedido"
                    [class.ring-[#D95578]]="externalHighlightId() === ord.id_pedido"
                    [class.ring-offset-2]="externalHighlightId() === ord.id_pedido">
              <!-- Order Header -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8D8D0]/50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    [class]="getStatusIconClass(ord.estado)">
                    <span class="material-icons text-base">{{ getStatusIcon(ord.estado) }}</span>
                  </div>
                  <div>
                    <span class="font-mono font-bold text-[#590E2A] text-sm block">{{ ord.id }}</span>
                    <span class="text-[11px] text-[#590E2A]/60">{{ ord.fecha | date:'short' }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-lg font-serif italic text-[#590E2A]">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                  <span [class]="getStatusBadgeClass(ord.estado)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {{ getStatusLabel(ord.estado) }}
                  </span>
                </div>
              </div>

              <!-- Client Info -->
              <div class="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span class="material-icons text-xs">person</span> Cliente
                  </span>
                  <span class="font-bold text-[#590E2A]">{{ ord.cliente.nombre }}</span>
                  <span class="text-[#590E2A]/60 block">{{ ord.cliente.telefono }}</span>
                </div>
                <div>
                  <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span class="material-icons text-xs">location_on</span> Direccion
                  </span>
                  <span class="text-[#590E2A]">{{ ord.cliente.direccion }}</span>
                </div>
                <div>
                  <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <span class="material-icons text-xs">payment</span> Pago
                  </span>
                  <span class="text-[#590E2A]">{{ ord.metodoPago | uppercase }} — {{ ord.estadoPago }}</span>
                </div>
              </div>

              <!-- Items -->
              <div class="py-3 border-t border-[#E8D8D0]/50">
                @if (ord.estado === 'pendiente') {
                  <div class="text-[10px] font-bold uppercase tracking-wider text-[#590E2A]/40 mb-2">
                    Verificar items antes de enviar:
                  </div>
                }
                <div class="flex flex-wrap gap-2">
                  @for (item of ord.items; track item.productoId; let idx = $index) {
                    @if (ord.estado === 'pendiente') {
                      <button (click)="toggleItem(ord.id, idx); $event.stopPropagation()"
                        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] border transition-all"
                        [class]="isItemSelected(ord.id, idx)
                          ? 'bg-[#065F46] text-white border-[#065F46] shadow-xs'
                          : 'bg-[#FDF8F4] text-[#590E2A] border-[#E8D8D0]/50 hover:border-[#065F46]/40'">
                        <span class="material-icons text-sm">
                          {{ isItemSelected(ord.id, idx) ? 'check_box' : 'check_box_outline_blank' }}
                        </span>
                        <img [src]="item.imagen" class="w-5 h-5 rounded-full object-cover">
                        <span class="font-medium">{{ item.nombreEspanol }}</span>
                        <span [class]="isItemSelected(ord.id, idx) ? 'text-white/70' : 'text-[#590E2A]/50'">x{{ item.cantidad }}</span>
                      </button>
                    } @else {
                      <div class="flex items-center gap-2 bg-[#FDF8F4] px-3 py-1.5 rounded-full text-[11px] border border-[#E8D8D0]/50">
                        <img [src]="item.imagen" class="w-5 h-5 rounded-full object-cover">
                        <span class="font-medium text-[#590E2A]">{{ item.nombreEspanol }}</span>
                        <span class="text-[#590E2A]/50">x{{ item.cantidad }}</span>
                      </div>
                    }
                  }
                </div>
                @if (ord.estado === 'pendiente') {
                  <div class="mt-2 text-[10px]" [class]="allItemsSelected(ord) ? 'text-[#065F46] font-bold' : 'text-[#590E2A]/50'">
                    {{ getSelectedCount(ord) }}/{{ ord.items.length }} items verificados
                  </div>
                }
              </div>

              <!-- Status Update Actions -->
              <div class="pt-3 border-t border-[#E8D8D0]/50">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#590E2A]/40">Avanzar Estado:</span>
                  <div class="flex gap-2 flex-wrap justify-end">
                    @if (ord.estado === 'pendiente') {
                      <button (click)="updateStatus(ord, 'en_camino')"
                        [disabled]="!allItemsSelected(ord)"
                        class="px-4 py-2 rounded-full text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                        [class]="allItemsSelected(ord)
                          ? 'bg-[#3B82F6] hover:bg-[#2563EB] cursor-pointer'
                          : 'bg-[#3B82F6]/40 cursor-not-allowed'">
                        <span class="material-icons text-xs">delivery_dining</span> Enviar a Domicilio
                      </button>
                    }
                    @if (ord.estado === 'en_camino') {
                      <button (click)="updateStatus(ord, 'entregado')"
                        class="px-4 py-2 rounded-full bg-[#065F46] text-white text-xs font-bold hover:bg-[#047857] transition-colors shadow-xs flex items-center gap-1">
                        <span class="material-icons text-xs">check_circle</span> Marcar Entregado
                      </button>
                    }
                    @if (ord.estado !== 'entregado' && ord.estado !== 'cancelado') {
                      <button (click)="updateStatus(ord, 'cancelado')"
                        class="px-3 py-2 rounded-full bg-white border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors flex items-center gap-1">
                        <span class="material-icons text-xs">cancel</span> Cancelar
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-16 bg-white rounded-[32px] border border-[#E8D8D0] space-y-4">
          <span class="material-icons text-5xl text-[#E8D8D0]">inbox</span>
          <div>
            <h3 class="text-lg font-serif italic text-[#590E2A]">Todo tranquilo</h3>
            <p class="text-xs text-[#590E2A]/50 mt-1">
              @if (activeFilter() === 'pendiente') {
                No hay pedidos pendientes por ahora.
              } @else {
                No hay pedidos en camino.
              }
            </p>
          </div>
        </div>
      }

      <!-- Historial de Pedidos Entregados (Acordeón) -->
      @if (deliveredOrders().length > 0) {
        <div class="rounded-[24px] overflow-hidden transition-all bg-white border border-[#E8D8D0]">
          <button (click)="openHistoryAccordion.set(!openHistoryAccordion())" class="w-full flex items-center justify-between px-6 py-4 text-left">
            <div class="flex items-center gap-3">
              <span class="material-icons text-lg text-[#065F46]">history</span>
              <span class="text-sm font-bold text-[#590E2A]">Historial de Pedidos Entregados</span>
              <span class="text-[10px] font-bold text-[#590E2A]/40 bg-[#FDF8F4] px-2 py-0.5 rounded-full">{{ deliveredOrders().length }}</span>
            </div>
            <span class="material-icons text-lg transition-transform text-[#590E2A]/40"
              [class.rotate-180]="openHistoryAccordion()">expand_more</span>
          </button>
          <div class="faq-answer px-6" [class.open]="openHistoryAccordion()">
            <div class="space-y-3 pb-4 max-h-[400px] overflow-y-auto pr-2">
              @for (ord of deliveredOrders(); track ord.id) {
                <div class="bg-[#FDF8F4] rounded-[20px] border border-[#E8D8D0]/50 overflow-hidden transition-all hover:shadow-md cursor-pointer"
                  (click)="toggleHistoryItem(ord.id)">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#065F46] text-white">
                        <span class="material-icons text-base">check_circle</span>
                      </div>
                      <div>
                        <span class="font-mono font-bold text-[#590E2A] text-sm block">{{ ord.id }}</span>
                        <span class="text-[11px] text-[#590E2A]/60">{{ ord.fecha | date:'short' }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-lg font-serif italic text-[#590E2A]">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                      <span class="material-icons text-lg transition-transform text-[#590E2A]/40"
                        [class.rotate-180]="expandedHistoryId() === ord.id">expand_more</span>
                    </div>
                  </div>

                  <div class="faq-answer px-4" [class.open]="expandedHistoryId() === ord.id">
                    <div class="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs border-t border-[#E8D8D0]/50">
                      <div>
                        <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <span class="material-icons text-xs">person</span> Cliente
                        </span>
                        <span class="font-bold text-[#590E2A]">{{ ord.cliente.nombre }}</span>
                        <span class="text-[#590E2A]/60 block">{{ ord.cliente.telefono }}</span>
                      </div>
                      <div>
                        <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <span class="material-icons text-xs">location_on</span> Direccion
                        </span>
                        <span class="text-[#590E2A]">{{ ord.cliente.direccion }}</span>
                      </div>
                      <div>
                        <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <span class="material-icons text-xs">payment</span> Pago
                        </span>
                        <span class="text-[#590E2A]">{{ ord.metodoPago | uppercase }} — {{ ord.estadoPago }}</span>
                      </div>
                    </div>
                    <div class="py-3 border-t border-[#E8D8D0]/50">
                      <div class="flex flex-wrap gap-2">
                        @for (item of ord.items; track item.productoId) {
                          <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-[11px] border border-[#E8D8D0]/50">
                            <img [src]="item.imagen" class="w-5 h-5 rounded-full object-cover">
                            <span class="font-medium text-[#590E2A]">{{ item.nombreEspanol }}</span>
                            <span class="text-[#590E2A]/50">x{{ item.cantidad }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class OrdersPanelComponent {
  dataService = inject(MochiDataService);

  role = input<'admin' | 'empleado'>('admin');
  externalHighlightId = input<number | null>(null);

  activeFilter = signal<'pendiente' | 'en_camino'>('pendiente');
  highlightedPedidoId = signal<number | null>(null);
  openHistoryAccordion = signal(false);
  expandedHistoryId = signal<string | null>(null);
  selectedItems = signal<Map<string, Set<number>>>(new Map());

  orders = this.dataService.orders;

  filteredOrders = computed(() => {
    const filter = this.activeFilter();
    return this.orders().filter(o => o.estado === filter);
  });

  pendingCount = computed(() => this.orders().filter(o => o.estado === 'pendiente').length);
  deliveryCount = computed(() => this.orders().filter(o => o.estado === 'en_camino').length);
  activeCount = computed(() => this.orders().filter(o => ['pendiente', 'en_camino'].includes(o.estado)).length);
  deliveredTodayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.orders().filter(o => o.estado === 'entregado' && o.fecha?.startsWith(today)).length;
  });
  deliveredOrders = computed(() => this.orders().filter(o => o.estado === 'entregado'));

  ngOnInit() {
    this.dataService.loadOrders();
  }

  toggleHistoryItem(orderId: string) {
    this.expandedHistoryId.set(this.expandedHistoryId() === orderId ? null : orderId);
  }

  async updateStatus(order: Order, newStatus: OrderStatus) {
    await this.dataService.updateOrderStatus(order.id, newStatus, order.id_pedido);
    this.selectedItems.update(m => { m.delete(order.id); return m; });
  }

  toggleItem(orderId: string, itemIdx: number) {
    this.selectedItems.update(map => {
      const next = new Map(map);
      const set = new Set(next.get(orderId) ?? []);
      if (set.has(itemIdx)) set.delete(itemIdx); else set.add(itemIdx);
      next.set(orderId, set);
      return next;
    });
  }

  isItemSelected(orderId: string, itemIdx: number): boolean {
    return this.selectedItems().get(orderId)?.has(itemIdx) ?? false;
  }

  allItemsSelected(order: Order): boolean {
    const set = this.selectedItems().get(order.id);
    return !!set && set.size === order.items.length;
  }

  getSelectedCount(order: Order): number {
    return this.selectedItems().get(order.id)?.size ?? 0;
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'pending';
      case 'en_preparacion': return 'restaurant';
      case 'en_camino': return 'delivery_dining';
      case 'entregado': return 'check_circle';
      case 'cancelado': return 'cancel';
      default: return 'receipt';
    }
  }

  getStatusIconClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28]';
      case 'en_preparacion': return 'bg-[#D95578] text-[#590E2A]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350]';
      case 'cancelado': return 'bg-red-50 text-red-500';
      default: return 'bg-[#FDF8F4] text-[#590E2A]';
    }
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28] border border-[#ffe0b2]';
      case 'en_preparacion': return 'bg-[#D95578] text-[#590E2A] border border-[#E8D8D0]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593] border border-[#c5cae9]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350] border border-[#b2dfdb]';
      case 'cancelado': return 'bg-red-50 text-red-500 border border-red-200';
      default: return 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'Recibido';
      case 'en_preparacion': return 'En Cocina';
      case 'en_camino': return 'En Camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  }
}
