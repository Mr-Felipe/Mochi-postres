import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export interface AppNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'nuevo_pedido' | 'cambio_estado' | 'stock_bajo';
  leida: boolean;
  created_at: string;
  pedido_id?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private channel: RealtimeChannel | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter(n => !n.leida).length);
  readonly hasNewOrders = computed(() => this.notifications().some(n => n.tipo === 'nuevo_pedido' && !n.leida));

  // Toast queue — visible toasts
  readonly toasts = signal<AppNotification[]>([]);

  startListening(userId: string) {
    this.stopListening();

    // 1. Realtime subscription for new orders
    this.channel = supabase
      .channel('pedidos-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pedidos'
      }, (payload) => {
        const pedido = payload.new as Record<string, unknown>;
        const notif: AppNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          titulo: 'Nuevo Pedido Online',
          mensaje: `Pedido #${pedido['numero_pedido']} — $${Number(pedido['total']).toLocaleString('es-CO')}`,
          tipo: 'nuevo_pedido',
          leida: false,
          created_at: new Date().toISOString(),
          pedido_id: pedido['id_pedido'] as number
        };
        this.addNotification(notif);
        this.showToast(notif);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pedidos',
        filter: `id_usuario=eq.${userId}`
      }, (payload) => {
        const old = payload.old as Record<string, unknown>;
        const updated = payload.new as Record<string, unknown>;
        if (old['estado'] !== updated['estado']) {
          const notif: AppNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            titulo: 'Estado de Pedido Actualizado',
            mensaje: `Tu pedido #${updated['numero_pedido']} ahora está: ${this.estadoLabel(updated['estado'] as string)}`,
            tipo: 'cambio_estado',
            leida: false,
            created_at: new Date().toISOString(),
            pedido_id: updated['id_pedido'] as number
          };
          this.addNotification(notif);
          this.showToast(notif);
        }
      })
      .subscribe();

    // 2. Polling fallback every 30s for pending orders (admin/empleado)
    this.pollInterval = setInterval(() => this.pollPendingOrders(), 30000);
    this.pollPendingOrders();
  }

  stopListening() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async pollPendingOrders() {
    const { count } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pendiente', 'en_preparacion', 'en_camino']);

    if (count !== null) {
      const existing = this.notifications();
      const pendingNotif = existing.find(n => n.id === 'pending-count');
      if (pendingNotif) {
        this.notifications.set(existing.map(n =>
          n.id === 'pending-count'
            ? { ...n, mensaje: `${count} pedido(s) activo(s)` }
            : n
        ));
      } else if (count > 0) {
        this.notifications.set([{
          id: 'pending-count',
          titulo: 'Pedidos Activos',
          mensaje: `${count} pedido(s) activo(s) en el sistema`,
          tipo: 'nuevo_pedido' as const,
          leida: false,
          created_at: new Date().toISOString()
        }, ...existing]);
      }
    }
  }

  addNotification(notif: AppNotification) {
    this.notifications.set([notif, ...this.notifications().slice(0, 49)]);
  }

  showToast(notif: AppNotification) {
    this.toasts.set([notif, ...this.toasts()]);
    setTimeout(() => this.dismissToast(notif.id), 6000);
  }

  dismissToast(id: string) {
    this.toasts.set(this.toasts().filter(t => t.id !== id));
  }

  markAsRead(id: string) {
    this.notifications.set(this.notifications().map(n =>
      n.id === id ? { ...n, leida: true } : n
    ));
  }

  markAllAsRead() {
    this.notifications.set(this.notifications().map(n => ({ ...n, leida: true })));
  }

  clearAll() {
    this.notifications.set([]);
  }

  private estadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      pendiente: 'Recibido',
      confirmado: 'Confirmado',
      en_preparacion: 'En Cocina',
      listo: 'Listo',
      en_camino: 'En Camino',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    };
    return labels[estado] || estado;
  }

  ngOnDestroy() {
    this.stopListening();
  }
}
