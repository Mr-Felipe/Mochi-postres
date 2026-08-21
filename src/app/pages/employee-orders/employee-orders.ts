import { Component, inject, signal, computed, OnInit, AfterViewInit, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationService } from '../../services/notification.service';
import { Order, OrderStatus } from '../../models/mochi.models';

@Component({
  selector: 'app-employee-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF5F0] min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="max-w-6xl mx-auto space-y-6">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 class="text-2xl font-serif italic text-[#1A1A1A] font-bold">Pedidos Online</h1>
            <p class="text-xs text-[#1A1A1A]/60 mt-1">Gestiona los estados de los pedidos recibidos</p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Stats -->
            <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-[#F0D5CC] text-xs">
              <div class="text-center">
                <span class="block text-lg font-bold text-[#FF758F]">{{ pendingCount() }}</span>
                <span class="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Pendientes</span>
              </div>
              <div class="border-l border-[#F0D5CC] pl-4 text-center">
                <span class="block text-lg font-bold text-[#065F46]">{{ activeCount() }}</span>
                <span class="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Activos</span>
              </div>
              <div class="border-l border-[#F0D5CC] pl-4 text-center">
                <span class="block text-lg font-bold text-[#1A1A1A]/40">{{ deliveredTodayCount() }}</span>
                <span class="text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Entregados Hoy</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button (click)="activeFilter.set('all')"
            [class]="activeFilter() === 'all' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] border border-[#F0D5CC]'"
            class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
            Todos ({{ allOrders().length }})
          </button>
          <button (click)="activeFilter.set('pendiente')"
            [class]="activeFilter() === 'pendiente' ? 'bg-[#FF758F] text-white' : 'bg-white text-[#FF758F] border border-[#FF758F]/30'"
            class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
            📝 Pendientes ({{ pendingCount() }})
          </button>
          <button (click)="activeFilter.set('en_preparacion')"
            [class]="activeFilter() === 'en_preparacion' ? 'bg-[#FF758F] text-white' : 'bg-white text-[#FF758F] border border-[#FF758F]/30'"
            class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
            🍡 En Cocina ({{ prepCount() }})
          </button>
          <button (click)="activeFilter.set('en_camino')"
            [class]="activeFilter() === 'en_camino' ? 'bg-[#3B82F6] text-white' : 'bg-white text-[#3B82F6] border border-[#3B82F6]/30'"
            class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
            🛵 En Camino ({{ deliveryCount() }})
          </button>
          <button (click)="activeFilter.set('entregado')"
            [class]="activeFilter() === 'entregado' ? 'bg-[#065F46] text-white' : 'bg-white text-[#065F46] border border-[#065F46]/30'"
            class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
            ✅ Entregados ({{ deliveredCount() }})
          </button>
        </div>

        <!-- Orders List -->
        @if (filteredOrders().length > 0) {
          <div class="space-y-4">
            @for (order of filteredOrders(); track order.id) {
              <div [id]="'pedido-' + order.id_pedido"
                class="bg-white rounded-[24px] border border-[#F0D5CC] p-5 sm:p-6 shadow-xs transition-all hover:shadow-md"
                [class.ring-2]="highlightedPedidoId() === order.id_pedido"
                [class.ring-[#FF758F]]="highlightedPedidoId() === order.id_pedido"
                [class.ring-offset-2]="highlightedPedidoId() === order.id_pedido">
                <!-- Order Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0D5CC]/50">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      [class]="getStatusIconClass(order.estado)">
                      {{ getStatusEmoji(order.estado) }}
                    </div>
                    <div>
                      <span class="font-mono font-bold text-[#1A1A1A] text-sm block">{{ order.id }}</span>
                      <span class="text-[11px] text-[#1A1A1A]/60">{{ order.fecha | date:'short' }}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-lg font-serif italic text-[#1A1A1A]">{{ '$' + order.total.toLocaleString('es-CO') }}</span>
                    <span [class]="getStatusBadgeClass(order.estado)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {{ getStatusLabel(order.estado) }}
                    </span>
                  </div>
                </div>

                <!-- Client Info -->
                <div class="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span class="text-[#1A1A1A]/50 block text-[10px] uppercase tracking-wider">Cliente</span>
                    <span class="font-bold text-[#1A1A1A]">{{ order.cliente.nombre }}</span>
                    <span class="text-[#1A1A1A]/60 block">{{ order.cliente.telefono }}</span>
                  </div>
                  <div>
                    <span class="text-[#1A1A1A]/50 block text-[10px] uppercase tracking-wider">Direccion</span>
                    <span class="text-[#1A1A1A]">{{ order.cliente.direccion }}</span>
                  </div>
                  <div>
                    <span class="text-[#1A1A1A]/50 block text-[10px] uppercase tracking-wider">Pago</span>
                    <span class="text-[#1A1A1A]">{{ order.metodoPago | uppercase }} — {{ order.estadoPago }}</span>
                  </div>
                </div>

                <!-- Items -->
                <div class="py-3 border-t border-[#F0D5CC]/50">
                  <div class="flex flex-wrap gap-2">
                    @for (item of order.items; track item.productoId) {
                      <div class="flex items-center gap-2 bg-[#FDF5F0] px-3 py-1.5 rounded-full text-[11px]">
                        <img [src]="item.imagen" class="w-5 h-5 rounded-full object-cover">
                        <span class="font-medium text-[#1A1A1A]">{{ item.nombreEspanol }}</span>
                        <span class="text-[#1A1A1A]/50">x{{ item.cantidad }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Status Update Actions -->
                <div class="pt-3 border-t border-[#F0D5CC]/50">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/40">Avanzar Estado:</span>
                    <div class="flex gap-2 flex-wrap justify-end">
                      @if (order.estado === 'pendiente') {
                        <button (click)="updateStatus(order, 'en_preparacion')"
                          class="px-4 py-2 rounded-full bg-[#FF758F] text-white text-xs font-bold hover:bg-[#FF6078] transition-colors shadow-xs">
                          🍡 Poner en Cocina
                        </button>
                      }
                      @if (order.estado === 'en_preparacion') {
                        <button (click)="updateStatus(order, 'en_camino')"
                          class="px-4 py-2 rounded-full bg-[#3B82F6] text-white text-xs font-bold hover:bg-[#2563EB] transition-colors shadow-xs">
                          🛵 Marcar En Camino
                        </button>
                      }
                      @if (order.estado === 'en_camino') {
                        <button (click)="updateStatus(order, 'entregado')"
                          class="px-4 py-2 rounded-full bg-[#065F46] text-white text-xs font-bold hover:bg-[#047857] transition-colors shadow-xs">
                          ✅ Marcar Entregado
                        </button>
                      }
                      @if (order.estado !== 'entregado' && order.estado !== 'cancelado') {
                        <button (click)="updateStatus(order, 'cancelado')"
                          class="px-3 py-2 rounded-full bg-white border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">
                          Cancelar
                        </button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-16 bg-white rounded-[32px] border border-[#F0D5CC] space-y-4">
            <span class="material-icons text-5xl text-[#F0D5CC]">inventory_2</span>
            <div>
              <h3 class="text-lg font-serif italic text-[#1A1A1A]">Sin pedidos</h3>
              <p class="text-xs text-[#1A1A1A]/50 mt-1">
                @if (activeFilter() === 'all') {
                  No hay pedidos online todavia.
                } @else {
                  No hay pedidos con este estado.
                }
              </p>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class EmployeeOrdersPageComponent implements OnInit, AfterViewInit {
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private el = inject(ElementRef);

  activeFilter = signal<string>('all');
  highlightedPedidoId = signal<number | null>(null);

  allOrders = this.dataService.orders;

  ngOnInit() {
    this.dataService.loadOrders();
    this.notificationService.pollPendingOrders();
  }

  ngAfterViewInit() {
    const pedidoId = this.route.snapshot.queryParamMap.get('pedido');
    if (pedidoId) {
      const id = parseInt(pedidoId, 10);
      this.highlightedPedidoId.set(id);
      setTimeout(() => {
        const el = this.el.nativeElement.querySelector('#pedido-' + id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      setTimeout(() => this.highlightedPedidoId.set(null), 4000);
    }
  }

  filteredOrders = computed(() => {
    const filter = this.activeFilter();
    const orders = this.allOrders();
    if (filter === 'all') return orders;
    return orders.filter(o => o.estado === filter);
  });

  pendingCount = computed(() => this.allOrders().filter(o => o.estado === 'pendiente').length);
  prepCount = computed(() => this.allOrders().filter(o => o.estado === 'en_preparacion').length);
  deliveryCount = computed(() => this.allOrders().filter(o => o.estado === 'en_camino').length);
  deliveredCount = computed(() => this.allOrders().filter(o => o.estado === 'entregado').length);
  activeCount = computed(() => this.allOrders().filter(o => ['pendiente', 'en_preparacion', 'en_camino'].includes(o.estado)).length);
  deliveredTodayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allOrders().filter(o => o.estado === 'entregado' && o.fecha?.startsWith(today)).length;
  });

  async updateStatus(order: Order, newStatus: OrderStatus) {
    await this.dataService.updateOrderStatus(order.id, newStatus);
  }

  getStatusEmoji(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return '📝';
      case 'en_preparacion': return '🍡';
      case 'en_camino': return '🛵';
      case 'entregado': return '✅';
      case 'cancelado': return '❌';
      default: return '📋';
    }
  }

  getStatusIconClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28]';
      case 'en_preparacion': return 'bg-[#FFD6E0] text-[#4A3F35]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350]';
      case 'cancelado': return 'bg-red-50 text-red-500';
      default: return 'bg-[#FDF5F0] text-[#1A1A1A]';
    }
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28] border border-[#ffe0b2]';
      case 'en_preparacion': return 'bg-[#FFD6E0] text-[#4A3F35] border border-[#EBE3D5]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593] border border-[#c5cae9]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350] border border-[#b2dfdb]';
      case 'cancelado': return 'bg-red-50 text-red-500 border border-red-200';
      default: return 'bg-[#FDF5F0] text-[#1A1A1A] border border-[#F0D5CC]';
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
