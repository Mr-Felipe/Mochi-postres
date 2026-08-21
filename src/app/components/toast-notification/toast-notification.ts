import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Toast Container — top-right fixed -->
    <div class="fixed top-4 right-4 z-[100] space-y-3 w-80 max-w-[90vw] pointer-events-none">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div class="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[#F0D5CC] p-4 transform transition-all duration-300 animate-slideInRight">
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
              [class]="toast.tipo === 'nuevo_pedido' ? 'bg-[#FF758F]/15 text-[#FF758F]' : 'bg-[#065F46]/10 text-[#065F46]'">
              {{ toast.tipo === 'nuevo_pedido' ? '🛒' : '📦' }}
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-[#1A1A1A]">{{ toast.titulo }}</p>
              <p class="text-[11px] text-[#1A1A1A]/70 mt-0.5 truncate">{{ toast.mensaje }}</p>
              <p class="text-[9px] text-[#1A1A1A]/40 mt-1">Hace unos segundos</p>
            </div>
            <!-- Close -->
            <button (click)="notificationService.dismissToast(toast.id)"
              class="w-6 h-6 rounded-full flex items-center justify-center text-[#1A1A1A]/40 hover:text-[#1A1A1A] hover:bg-[#FDF5F0] transition-colors flex-shrink-0">
              <span class="material-icons" style="font-size: 14px">close</span>
            </button>
          </div>
          <!-- Progress bar -->
          <div class="mt-2 h-0.5 rounded-full bg-[#F0D5CC] overflow-hidden">
            <div class="h-full rounded-full bg-[#FF758F] animate-toastProgress"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastNotificationComponent {
  notificationService = inject(NotificationService);
}
