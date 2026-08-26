import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrdersPanelComponent } from '../../components/orders-panel/orders-panel';

@Component({
  selector: 'app-employee-orders',
  standalone: true,
  imports: [OrdersPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div class="max-w-6xl mx-auto">
        <app-orders-panel role="empleado" />
      </div>
    </div>
  `
})
export class EmployeeOrdersPageComponent {}
