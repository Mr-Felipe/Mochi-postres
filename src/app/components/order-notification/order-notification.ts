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
        class="relative p-2 rounded-xl transition-colors hover:opacity-70">
        <span class="material-icons text-xl" style="color: #FDF8F4">notifications</span>
        @if (notificationService.unreadCount() > 0) {
          <span class="absolute -top-0.5 -right-0.5 w-5 h-5 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce" style="background: #D95578">
            {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="absolute right-0 top-full mt-2 w-80 max-h-[70vh] rounded-2xl shadow-2xl overflow-hidden z-50" style="background: #3A0A1C; border: 1px solid rgba(255,255,255,0.1)">
          <!-- Header -->
          <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid rgba(255,255,255,0.1)">
            <div>
              <h3 class="text-sm font-bold" style="color: #FDF8F4">Notificaciones</h3>
              @if (notificationService.unreadCount() > 0) {
                <span class="text-[10px] font-bold" style="color: #D95578">{{ notificationService.unreadCount() }} sin leer</span>
              }
            </div>
            <div class="flex items-center gap-1">
              @if (notificationService.unreadCount() > 0) {
                <button (click)="notificationService.markAllAsRead()"
                  class="text-[10px] font-bold hover:underline px-2 py-1 rounded-lg hover:opacity-70" style="color: #D95578">
                  Marcar todo leído
                </button>
              }
              <button (click)="notificationService.clearAll()"
                class="text-[10px] hover:opacity-70 px-2 py-1 rounded-lg hover:opacity-50" style="color: rgba(253,248,244,0.4)">
                Limpiar
              </button>
            </div>
          </div>

          <!-- Notification List -->
          <div class="overflow-y-auto max-h-[50vh]">
            @if (notificationService.notifications().length === 0) {
              <div class="p-8 text-center">
                <span class="material-icons text-3xl" style="color: rgba(255,255,255,0.15)">notifications_none</span>
                <p class="text-xs mt-2" style="color: rgba(253,248,244,0.4)">Sin notificaciones nuevas</p>
              </div>
            } @else {
              @for (notif of notificationService.notifications(); track notif.id) {
                <button (click)="onNotificationClick(notif)"
                  class="w-full text-left p-4 transition-colors hover:opacity-80"
                  [style.background]="notif.leida ? 'transparent' : 'rgba(217,85,120,0.08)'"
                  [style.border-bottom]="'1px solid rgba(255,255,255,0.05)'">
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm" style="background: rgba(217,85,120,0.2)">
                      {{ getNotifIcon(notif.tipo) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-xs font-bold" style="color: #FDF8F4">{{ notif.titulo }}</p>
                        @if (!notif.leida) {
                          <span class="w-2 h-2 rounded-full flex-shrink-0" style="background: #D95578"></span>
                        }
                      </div>
                      <p class="text-[11px] mt-0.5" style="color: rgba(253,248,244,0.7)">{{ notif.mensaje }}</p>
                      <p class="text-[9px] mt-1" style="color: rgba(253,248,244,0.3)">{{ notif.created_at | date:'short' }}</p>
                    </div>
                  </div>
                </button>
              }
            }
          </div>

          <!-- Footer -->
          @if (isAdmin() || isEmpleado()) {
            <div class="p-3" style="border-top: 1px solid rgba(255,255,255,0.1)">
              <button (click)="goToOrders(); closeDropdown()"
                class="w-full py-2 rounded-xl text-xs font-bold transition-colors hover:opacity-70" style="color: #D95578">
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
}
