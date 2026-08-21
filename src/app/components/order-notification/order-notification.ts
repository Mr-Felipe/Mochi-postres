import { Component, inject, signal, computed, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-order-notification',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <!-- Bell Button -->
      <button (click)="toggleDropdown()"
        class="relative p-2 rounded-xl transition-colors"
        [class]="isOpen() ? 'bg-[#FF758F]/10 text-[#FF758F]' : 'text-[#1A1A1A]/60 hover:text-[#FF758F] hover:bg-[#FF758F]/5'">
        <span class="material-icons text-xl">notifications</span>
        @if (notificationService.unreadCount() > 0) {
          <span class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF758F] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="absolute right-0 top-full mt-2 w-80 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-[#F0D5CC] overflow-hidden z-50">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-[#F0D5CC]">
            <div>
              <h3 class="text-sm font-bold text-[#1A1A1A]">Notificaciones</h3>
              @if (notificationService.unreadCount() > 0) {
                <span class="text-[10px] text-[#FF758F] font-bold">{{ notificationService.unreadCount() }} sin leer</span>
              }
            </div>
            <div class="flex items-center gap-1">
              @if (notificationService.unreadCount() > 0) {
                <button (click)="notificationService.markAllAsRead()"
                  class="text-[10px] text-[#FF758F] font-bold hover:underline px-2 py-1 rounded-lg hover:bg-[#FF758F]/5">
                  Marcar todo leído
                </button>
              }
              <button (click)="notificationService.clearAll()"
                class="text-[10px] text-[#1A1A1A]/40 hover:text-[#1A1A1A] px-2 py-1 rounded-lg hover:bg-[#FDF5F0]">
                Limpiar
              </button>
            </div>
          </div>

          <!-- Notification List -->
          <div class="overflow-y-auto max-h-[50vh]">
            @if (notificationService.notifications().length === 0) {
              <div class="p-8 text-center">
                <span class="material-icons text-3xl text-[#F0D5CC]">notifications_none</span>
                <p class="text-xs text-[#1A1A1A]/50 mt-2">Sin notificaciones nuevas</p>
              </div>
            } @else {
              @for (notif of notificationService.notifications(); track notif.id) {
                <button (click)="onNotificationClick(notif)"
                  class="w-full text-left p-4 border-b border-[#F0D5CC]/50 transition-colors hover:bg-[#FDF5F0]"
                  [class]="notif.leida ? '' : 'bg-[#FF758F]/5'">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
                      [class]="getNotifIconClass(notif.tipo)">
                      {{ getNotifIcon(notif.tipo) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-xs font-bold text-[#1A1A1A]">{{ notif.titulo }}</p>
                        @if (!notif.leida) {
                          <span class="w-2 h-2 rounded-full bg-[#FF758F] flex-shrink-0"></span>
                        }
                      </div>
                      <p class="text-[11px] text-[#1A1A1A]/70 mt-0.5">{{ notif.mensaje }}</p>
                      <p class="text-[9px] text-[#1A1A1A]/40 mt-1">{{ notif.created_at | date:'short' }}</p>
                    </div>
                  </div>
                </button>
              }
            }
          </div>

          <!-- Footer -->
          @if (isAdmin() || isEmpleado()) {
            <div class="p-3 border-t border-[#F0D5CC]">
              <button (click)="goToOrders(); closeDropdown()"
                class="w-full py-2 rounded-xl text-xs font-bold text-[#FF758F] hover:bg-[#FF758F]/5 transition-colors">
                Ver todos los pedidos →
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class OrderNotificationComponent {
  notificationService = inject(NotificationService);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  isOpen = signal(false);

  isAdmin = computed(() => this.supabase.activeUser()?.rol === 'admin');
  isEmpleado = computed(() => this.supabase.activeUser()?.rol === 'empleado');

  toggleDropdown() {
    this.isOpen.update(v => !v);
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-order-notification')) {
      this.closeDropdown();
    }
  }

  onNotificationClick(notif: { id: string; pedido_id?: number }) {
    this.notificationService.markAsRead(notif.id);
    if (notif.pedido_id) {
      this.goToPedido(notif.pedido_id);
      this.closeDropdown();
    }
  }

  goToPedido(pedidoId: number) {
    const role = this.supabase.activeUser()?.rol;
    const base = role === 'admin' ? '/admin/pedidos' : '/empleado/pedidos';
    this.router.navigate([base], { queryParams: { pedido: pedidoId } });
  }

  goToOrders() {
    const role = this.supabase.activeUser()?.rol;
    this.router.navigate([role === 'admin' ? '/admin/pedidos' : '/empleado/pedidos']);
  }

  getNotifIcon(tipo: string): string {
    switch (tipo) {
      case 'nuevo_pedido': return '🛒';
      case 'cambio_estado': return '📦';
      case 'stock_bajo': return '⚠️';
      default: return '🔔';
    }
  }

  getNotifIconClass(tipo: string): string {
    switch (tipo) {
      case 'nuevo_pedido': return 'bg-[#FF758F]/15 text-[#FF758F]';
      case 'cambio_estado': return 'bg-[#065F46]/10 text-[#065F46]';
      case 'stock_bajo': return 'bg-[#F59E0B]/10 text-[#F59E0B]';
      default: return 'bg-[#F0D5CC] text-[#1A1A1A]';
    }
  }
}
