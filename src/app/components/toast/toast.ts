import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto px-5 py-3 rounded-2xl shadow-lg border flex items-center gap-2 animate-slideUp"
          [style.background]="toast.type === 'success' ? '#FF758F' : toast.type === 'error' ? '#EF4444' : '#1A1A1A'"
          [style.border-color]="toast.type === 'success' ? '#FF5277' : 'transparent'"
          style="color: #FDF5F0; backdrop-filter: blur(8px);">
          <span class="material-icons" style="font-size: 18px">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="text-xs font-bold tracking-wide">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slideUp {
      animation: slideUp 0.25s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
