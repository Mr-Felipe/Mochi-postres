import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MochiDataService } from '../../services/mochi-data.service';
import { OrderStatus } from '../../models/mochi.models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DatePipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FAF7F2] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#EBE3D5] pb-4">
          <div>
            <h1 class="text-3xl font-serif italic text-[#4A3F35]">Mis Pedidos & Rastreador en Tiempo Real</h1>
            <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider mt-1 font-medium">Sigue la preparación artesanal y el envío de tu orden en La Dorada</p>
          </div>

          <a routerLink="/productos" class="px-5 py-2.5 rounded-full bg-[#FFD6E0] text-[#4A3F35] font-bold text-xs uppercase tracking-wider hover:bg-[#ffc2d1] transition-colors">
            + Nuevo Pedido
          </a>
        </div>

        @if (orders().length > 0) {
          <div class="space-y-6">
            @for (order of orders(); track order.id) {
              <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-6">
                
                <!-- Order Top Info -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EBE3D5]">
                  <div>
                    <span class="text-[10px] font-mono text-[#4A3F35]/60 block uppercase">NÚMERO DE REFERENCIA</span>
                    <span class="text-lg font-bold text-[#4A3F35] font-mono">{{ order.id }}</span>
                    <span class="text-xs text-[#4A3F35]/60 block mt-0.5">{{ order.fecha | date:'medium' }}</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <span [class]="getStatusBadgeClass(order.estado)" class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border">
                      {{ getStatusLabel(order.estado) }}
                    </span>
                    <span class="text-xl font-serif italic text-[#4A3F35]">
                      {{ '$' + order.total.toLocaleString('es-CO') }}
                    </span>
                  </div>
                </div>

                <!-- Status Live Tracker Pipeline -->
                <div class="py-4">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-[#4A3F35] font-serif mb-4">Estado del Pedido en Cocina Artesanal:</h4>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    
                    <div [class]="isStepActive(order.estado, 'pendiente') ? 'bg-[#4A3F35] text-[#FAF7F2] font-bold shadow-xs' : 'bg-[#FAF7F2] text-[#4A3F35]/40 border border-[#EBE3D5]'" class="p-3.5 rounded-2xl transition-all">
                      <span class="block text-lg mb-1">📝</span>
                      <span class="text-[11px] uppercase tracking-wider">1. Recibido</span>
                    </div>

                    <div [class]="isStepActive(order.estado, 'en_preparacion') ? 'bg-[#4A3F35] text-[#FAF7F2] font-bold shadow-xs' : 'bg-[#FAF7F2] text-[#4A3F35]/40 border border-[#EBE3D5]'" class="p-3.5 rounded-2xl transition-all">
                      <span class="block text-lg mb-1">🍡</span>
                      <span class="text-[11px] uppercase tracking-wider">2. En Cocina</span>
                    </div>

                    <div [class]="isStepActive(order.estado, 'en_camino') ? 'bg-[#4A3F35] text-[#FAF7F2] font-bold shadow-xs' : 'bg-[#FAF7F2] text-[#4A3F35]/40 border border-[#EBE3D5]'" class="p-3.5 rounded-2xl transition-all">
                      <span class="block text-lg mb-1">🛵</span>
                      <span class="text-[11px] uppercase tracking-wider">3. En Camino</span>
                    </div>

                    <div [class]="isStepActive(order.estado, 'entregado') ? 'bg-[#2C5350] text-[#FAF7F2] font-bold shadow-xs' : 'bg-[#FAF7F2] text-[#4A3F35]/40 border border-[#EBE3D5]'" class="p-3.5 rounded-2xl transition-all">
                      <span class="block text-lg mb-1">✅</span>
                      <span class="text-[11px] uppercase tracking-wider">4. Entregado</span>
                    </div>

                  </div>
                </div>

                <!-- Purchased Items Grid -->
                <div class="p-5 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] space-y-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-[#4A3F35] block font-serif">Detalle de Postres:</span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    @for (item of order.items; track item.productoId) {
                      <div class="flex items-center gap-3 bg-white p-3 rounded-2xl border border-[#EBE3D5]">
                        <img [src]="item.imagen" alt="" class="w-12 h-12 rounded-xl object-cover">
                        <div>
                          <span class="font-serif italic text-[#4A3F35] block">{{ item.nombreEspanol }}</span>
                          <span class="text-[10px] text-[#4A3F35]/60">{{ item.cantidad }} x {{ '$' + item.precio.toLocaleString('es-CO') }}</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Address & Payment summary -->
                <div class="flex flex-col sm:flex-row justify-between text-xs text-[#4A3F35]/80 gap-2 pt-2 border-t border-[#EBE3D5]">
                  <div>
                    <span class="font-bold text-[#4A3F35]">Dirección:</span> {{ order.cliente.direccion }}, {{ order.cliente.ciudad }}
                  </div>
                  <div>
                    <span class="font-bold text-[#4A3F35]">Pago:</span> {{ order.metodoPago | uppercase }} ({{ order.estadoPago }})
                  </div>
                </div>

              </div>
            }
          </div>
        } @else {
          <div class="text-center py-20 bg-white rounded-[40px] border border-[#EBE3D5] p-8 space-y-4 max-w-lg mx-auto">
            <div class="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#4A3F35] flex items-center justify-center mx-auto text-3xl border border-[#EBE3D5]">
              📦
            </div>
            <h2 class="text-2xl font-serif italic text-[#4A3F35]">Aún no has realizado pedidos</h2>
            <p class="text-[#4A3F35]/70 text-xs uppercase tracking-wider">Realiza tu primera compra para ver el rastreo en tiempo real.</p>
            <a routerLink="/productos" class="inline-block px-8 py-3.5 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs">
              Hacer un Pedido
            </a>
          </div>
        }

      </div>
    </div>
  `
})
export class OrdersPageComponent {
  dataService = inject(MochiDataService);
  orders = this.dataService.orders;

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28] border-[#ffe0b2]';
      case 'en_preparacion': return 'bg-[#FFD6E0] text-[#4A3F35] border-[#EBE3D5]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593] border-[#c5cae9]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350] border-[#b2dfdb]';
      default: return 'bg-[#FAF7F2] text-[#4A3F35] border-[#EBE3D5]';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'Recibido';
      case 'en_preparacion': return 'En Cocina Artesanal';
      case 'en_camino': return 'En Camino a tu Casa';
      case 'entregado': return 'Entregado con Éxito';
      default: return status;
    }
  }

  isStepActive(currentStatus: OrderStatus, step: OrderStatus): boolean {
    const order: OrderStatus[] = ['pendiente', 'en_preparacion', 'en_camino', 'entregado'];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(step);
    return currentIndex >= stepIndex;
  }
}
