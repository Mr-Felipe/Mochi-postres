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
        <div class="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[#E8D8D0] p-4 transform transition-all duration-300 animate-slideInRight">
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg"
              [class]="toast.tipo === 'nuevo_pedido' ? 'bg-[#D95578]/15 text-[#D95578]' : 'bg-[#065F46]/10 text-[#065F46]'">
              {{ toast.tipo === 'nuevo_pedido' ? '🛒' : '📦' }}
            </div>
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-[#590E2A]">{{ toast.titulo }}</p>
              <p class="text-[11px] text-[#590E2A]/70 mt-0.5 truncate">{{ toast.mensaje }}</p>
              <p class="text-[9px] text-[#590E2A]/40 mt-1">Hace unos segundos</p>
            </div>
            <!-- Close -->
            <button (click)="notificationService.dismissToast(toast.id)"
              class="w-6 h-6 rounded-full flex items-center justify-center text-[#590E2A]/40 hover:text-[#590E2A] hover:bg-[#FDF8F4] transition-colors flex-shrink-0">
              <span class="material-icons" style="font-size: 14px">close</span>
            </button>
          </div>
          <!-- Progress bar -->
          <div class="mt-2 h-0.5 rounded-full bg-[#E8D8D0] overflow-hidden">
            <div class="h-full rounded-full bg-[#D95578] animate-toastProgress"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastNotificationComponent {
  notificationService = inject(NotificationService);
}
