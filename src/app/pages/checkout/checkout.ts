import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { PaymentService, COLOMBIAN_BANKS } from '../../services/payment.service';
import { PaymentMethodType, Order } from '../../models/mochi.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FAF7F2] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#EBE3D5] pb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-[#4A3F35]/60 font-serif">Paso Final</span>
            <h1 class="text-3xl font-serif italic text-[#4A3F35]">Checkout & Pasarela de Pago Integrada</h1>
          </div>
          <a routerLink="/carrito" class="text-xs font-bold uppercase tracking-wider text-[#4A3F35] hover:underline">← Volver al Carrito</a>
        </div>

        @if (!createdOrder()) {
          @if (cartService.items().length > 0) {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- Left Column: Delivery Form & Payment Gateway Options -->
              <div class="lg:col-span-7 space-y-8">
                
                <!-- 1. Customer & Delivery Address -->
                <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-4">
                  <h2 class="text-lg font-serif italic text-[#4A3F35] flex items-center gap-2 pb-2 border-b border-[#EBE3D5]">
                    <span class="w-7 h-7 rounded-full bg-[#4A3F35] text-[#FAF7F2] text-xs font-bold flex items-center justify-center">1</span>
                    <span>Datos del Cliente & Dirección de Entrega</span>
                  </h2>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label for="input-nombre" class="font-bold text-[#4A3F35] block mb-1">Nombre Completo *</label>
                      <input 
                        id="input-nombre"
                        #nombreInput
                        type="text" 
                        [value]="clienteNombre()" 
                        (input)="clienteNombre.set($any($event.target).value)" 
                        placeholder="Ej. Juan Pérez" 
                        class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35] font-medium" 
                      />
                    </div>

                    <div>
                      <label for="input-tel" class="font-bold text-[#4A3F35] block mb-1">Teléfono / WhatsApp *</label>
                      <input 
                        id="input-tel"
                        #telInput
                        type="text" 
                        [value]="clienteTelefono()" 
                        (input)="clienteTelefono.set($any($event.target).value)" 
                        placeholder="Ej. 300 123 4567" 
                        class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35] font-medium" 
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label for="input-email" class="font-bold text-[#4A3F35] block mb-1">Correo Electrónico *</label>
                      <input 
                        id="input-email"
                        #emailInput
                        type="email" 
                        [value]="clienteEmail()" 
                        (input)="clienteEmail.set($any($event.target).value)" 
                        placeholder="cliente@ejemplo.com" 
                        class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35] font-medium" 
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label for="input-dir" class="font-bold text-[#4A3F35] block mb-1">Dirección Exacta en La Dorada, Caldas *</label>
                      <input 
                        id="input-dir"
                        #dirInput
                        type="text" 
                        [value]="clienteDireccion()" 
                        (input)="clienteDireccion.set($any($event.target).value)" 
                        placeholder="Ej. Calle 12 # 4-30, Barrio Centro" 
                        class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35] font-medium" 
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label for="input-notas" class="font-bold text-[#4A3F35] block mb-1">Notas Especiales para la Cocina (Opcional)</label>
                      <textarea 
                        id="input-notas"
                        #notasInput
                        rows="2"
                        [value]="notasEspeciales()" 
                        (input)="notasEspeciales.set($any($event.target).value)" 
                        placeholder="Ej. Empaque de regalo, alergias a nueces, dejar en portería..." 
                        class="w-full p-3.5 rounded-[20px] bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35] font-medium">
                      </textarea>
                    </div>
                  </div>
                </div>

                <!-- 2. Integrated Payment Gateway Methods -->
                <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-6">
                  <h2 class="text-lg font-serif italic text-[#4A3F35] flex items-center gap-2 pb-2 border-b border-[#EBE3D5]">
                    <span class="w-7 h-7 rounded-full bg-[#4A3F35] text-[#FAF7F2] text-xs font-bold flex items-center justify-center">2</span>
                    <span>Selecciona tu Método de Pago</span>
                  </h2>

                  <!-- Method Selection Tabs -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button 
                      (click)="selectedMethod.set('pse')"
                      [class]="selectedMethod() === 'pse' ? 'bg-[#FFD6E0] border-[#4A3F35] text-[#4A3F35] font-bold' : 'bg-[#FAF7F2] border-[#EBE3D5] hover:border-[#4A3F35]/50 text-[#4A3F35]'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">💳</span>
                      <div>
                        <span class="font-bold block">PSE</span>
                        <span class="text-[10px] text-[#4A3F35]/60">Débito Bancario</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('nequi')"
                      [class]="selectedMethod() === 'nequi' ? 'bg-[#FFD6E0] border-[#4A3F35] text-[#4A3F35] font-bold' : 'bg-[#FAF7F2] border-[#EBE3D5] hover:border-[#4A3F35]/50 text-[#4A3F35]'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">📱</span>
                      <div>
                        <span class="font-bold block">Nequi / Daviplata</span>
                        <span class="text-[10px] text-[#4A3F35]/60">QR / Transferencia</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('tarjeta')"
                      [class]="selectedMethod() === 'tarjeta' ? 'bg-[#FFD6E0] border-[#4A3F35] text-[#4A3F35] font-bold' : 'bg-[#FAF7F2] border-[#EBE3D5] hover:border-[#4A3F35]/50 text-[#4A3F35]'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">💳</span>
                      <div>
                        <span class="font-bold block">Tarjeta Crédito</span>
                        <span class="text-[10px] text-[#4A3F35]/60">Visa / Mastercard</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('contraentrega')"
                      [class]="selectedMethod() === 'contraentrega' ? 'bg-[#FFD6E0] border-[#4A3F35] text-[#4A3F35] font-bold' : 'bg-[#FAF7F2] border-[#EBE3D5] hover:border-[#4A3F35]/50 text-[#4A3F35]'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">💵</span>
                      <div>
                        <span class="font-bold block">Contraentrega</span>
                        <span class="text-[10px] text-[#4A3F35]/60">Efectivo al recibir</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('transferencia')"
                      [class]="selectedMethod() === 'transferencia' ? 'bg-[#FFD6E0] border-[#4A3F35] text-[#4A3F35] font-bold' : 'bg-[#FAF7F2] border-[#EBE3D5] hover:border-[#4A3F35]/50 text-[#4A3F35]'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20 sm:col-span-2">
                      <span class="text-base">🏦</span>
                      <div>
                        <span class="font-bold block">Transferencia Bancaria</span>
                        <span class="text-[10px] text-[#4A3F35]/60">Bancolombia / Davivienda</span>
                      </div>
                    </button>
                  </div>

                  <!-- Dynamic Payment Details Form according to selected Method -->
                  <div class="p-5 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] text-xs space-y-4">
                    
                    <!-- PSE Option Details -->
                    @if (selectedMethod() === 'pse') {
                      <div class="space-y-3">
                        <h3 class="font-serif italic text-[#4A3F35] text-base">Pasarela PSE - Selección de Banco</h3>
                        <div>
                          <label for="select-banco" class="font-bold text-[#4A3F35] block mb-1">Elige tu Banco en Colombia *</label>
                          <select 
                            id="select-banco"
                            [value]="selectedBank()"
                            (change)="selectedBank.set($any($event.target).value)"
                            class="w-full p-3 rounded-full bg-white border border-[#EBE3D5] text-xs font-bold text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                            @for (b of banks; track b.id) {
                              <option [value]="b.nombre">{{ b.nombre }}</option>
                            }
                          </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label for="select-tipo-cliente" class="font-bold text-[#4A3F35] block mb-1">Tipo de Cliente</label>
                            <select id="select-tipo-cliente" class="w-full p-3 rounded-full bg-white border border-[#EBE3D5] text-[#4A3F35]">
                              <option>Persona Natural</option>
                              <option>Persona Jurídica</option>
                            </select>
                          </div>
                          <div>
                            <label for="input-cedula" class="font-bold text-[#4A3F35] block mb-1">Documento Identidad *</label>
                            <input id="input-cedula" type="text" placeholder="Número Cédula" class="w-full p-3 rounded-full bg-white border border-[#EBE3D5] text-[#4A3F35]">
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Nequi / Daviplata Details -->
                    @if (selectedMethod() === 'nequi' || selectedMethod() === 'daviplata') {
                      <div class="space-y-4 text-center">
                        <h3 class="font-serif italic text-[#4A3F35] text-base">
                          Pago Instantáneo por {{ selectedMethod() === 'nequi' ? 'Nequi' : 'Daviplata' }}
                        </h3>
                        <p class="text-[#4A3F35]/80 leading-relaxed">
                          Escanea el siguiente Código QR dinámico con tu app o transfiere al número oficial de Mochi.
                        </p>
                        
                        <!-- Simulated Interactive QR Code -->
                        <div class="w-48 h-48 mx-auto bg-white p-3 rounded-3xl shadow-xs border border-[#EBE3D5] flex flex-col items-center justify-center space-y-2">
                          <div class="w-36 h-36 bg-[#4A3F35] rounded-2xl flex items-center justify-center text-[#FAF7F2] text-4xl font-serif italic">
                            Mochi.
                          </div>
                          <span class="text-[10px] font-mono text-[#4A3F35]/60">REF: MOCHI-{{ cartService.total() }}</span>
                        </div>

                        <div class="p-3 rounded-full bg-white border border-[#EBE3D5] text-center font-mono">
                          <span class="text-[#4A3F35]/60 block text-[10px]">Número Nequi / Daviplata MOCHI:</span>
                          <span class="font-bold text-[#4A3F35] text-base">300 123 4567</span>
                        </div>
                      </div>
                    }

                    <!-- Credit Card Details -->
                    @if (selectedMethod() === 'tarjeta') {
                      <div class="space-y-3">
                        <h3 class="font-serif italic text-[#4A3F35] text-base">Procesador de Tarjetas de Crédito / Débito</h3>
                        <div>
                          <label for="input-tarjeta" class="font-bold text-[#4A3F35] block mb-1">Número de Tarjeta *</label>
                          <input id="input-tarjeta" type="text" maxlength="19" placeholder="4532 •••• •••• 8910" class="w-full p-3 rounded-full bg-white border border-[#EBE3D5] font-mono text-[#4A3F35]">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label for="input-titular" class="font-bold text-[#4A3F35] block mb-1">Titular *</label>
                            <input id="input-titular" type="text" placeholder="Nombre en tarjeta" class="w-full p-3 rounded-full bg-white border border-[#EBE3D5] text-[#4A3F35]">
                          </div>
                          <div>
                            <label for="input-venc" class="font-bold text-[#4A3F35] block mb-1">Vencimiento / CVV *</label>
                            <div class="flex gap-2">
                              <input id="input-venc" type="text" placeholder="MM/AA" class="w-1/2 p-3 rounded-full bg-white border border-[#EBE3D5] text-center text-[#4A3F35]">
                              <input type="text" maxlength="4" placeholder="CVC" class="w-1/2 p-3 rounded-full bg-white border border-[#EBE3D5] text-center font-mono text-[#4A3F35]">
                            </div>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Contraentrega Details -->
                    @if (selectedMethod() === 'contraentrega') {
                      <div class="space-y-2">
                        <h3 class="font-serif italic text-[#4A3F35] text-base">Pago Contraentrega en La Dorada</h3>
                        <p class="text-[#4A3F35]/80">
                          Pagarás en efectivo al momento de recibir tus postres. Nuestro repartidor lleva cambio exacto.
                        </p>
                      </div>
                    }

                    <!-- Transferencia Details -->
                    @if (selectedMethod() === 'transferencia') {
                      <div class="space-y-2">
                        <h3 class="font-serif italic text-[#4A3F35] text-base">Transferencia Bancaria Directa</h3>
                        <p class="text-[#4A3F35]/80">
                          Davivienda Ahorros: <strong>0098-4521-8901</strong> | Bancolombia: <strong>310-890123-01</strong>
                        </p>
                      </div>
                    }

                  </div>
                </div>

              </div>

              <!-- Right Column: Order Summary & Confirm Button -->
              <div class="lg:col-span-5 bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
                <h2 class="text-lg font-serif italic text-[#4A3F35] pb-3 border-b border-[#EBE3D5]">Resumen de Tu Compra</h2>

                <!-- Items Mini List -->
                <div class="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                  @for (item of cartService.items(); track item.product.id) {
                    <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF7F2]">
                      <div class="flex items-center gap-2">
                        <img [src]="item.product.imagen_principal" alt="" class="w-10 h-10 rounded-xl object-cover">
                        <div>
                          <span class="font-serif italic text-[#4A3F35] block">{{ item.product.nombre_espanol }}</span>
                          <span class="text-[10px] text-[#4A3F35]/60 font-mono">x{{ item.cantidad }}</span>
                        </div>
                      </div>
                      <span class="font-serif italic text-[#4A3F35]">
                        {{ '$' + (item.cantidad * (item.product.precio_oferta || item.product.precio)).toLocaleString('es-CO') }}
                      </span>
                    </div>
                  }
                </div>

                <!-- Price Totals -->
                <div class="space-y-2 text-xs text-[#4A3F35]/80 pt-3 border-t border-[#EBE3D5]">
                  <div class="flex justify-between">
                    <span>Subtotal:</span>
                    <span class="font-bold text-[#4A3F35]">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
                  </div>

                  @if (cartService.couponDiscount() > 0) {
                    <div class="flex justify-between text-[#2C5350] font-bold">
                      <span>Descuento Cupón:</span>
                      <span>-{{ '$' + cartService.couponDiscount().toLocaleString('es-CO') }}</span>
                    </div>
                  }

                  <div class="flex justify-between">
                    <span>Costo de Envío:</span>
                    <span class="font-bold text-[#4A3F35]">
                      {{ cartService.shippingCost() === 0 ? '¡GRATIS!' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}
                    </span>
                  </div>

                  <div class="flex justify-between text-base font-bold text-[#4A3F35] pt-3 border-t border-[#EBE3D5]">
                    <span>TOTAL COMPRA:</span>
                    <span class="text-2xl font-serif italic text-[#4A3F35]">{{ '$' + cartService.total().toLocaleString('es-CO') }}</span>
                  </div>
                </div>

                <!-- Payment Submit Button -->
                <button 
                  [disabled]="isProcessing() || !clienteNombre() || !clienteTelefono()"
                  (click)="submitPayment()"
                  class="w-full py-4 rounded-full bg-[#4A3F35] hover:bg-[#362D26] disabled:opacity-50 text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  @if (isProcessing()) {
                    <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Procesando Pago Seguro...</span>
                  } @else {
                    <span>🔒 Pagar {{ '$' + cartService.total().toLocaleString('es-CO') }} Ahora</span>
                  }
                </button>

                <p class="text-[10px] text-[#4A3F35]/50 text-center leading-tight">
                  Transacción 100% cifrada con tecnología de pasarela segura para La Dorada, Caldas.
                </p>
              </div>

            </div>
          } @else {
            <div class="text-center py-20 bg-white rounded-[40px] border border-[#EBE3D5] p-8 space-y-4 max-w-lg mx-auto">
              <h2 class="text-2xl font-serif italic text-[#4A3F35]">No tienes productos en tu carrito</h2>
              <a routerLink="/productos" class="inline-block px-8 py-3 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest">
                Ir al Catálogo
              </a>
            </div>
          }
        } @else {
          <!-- Order Confirmation Screen -->
          @let order = createdOrder()!;

          <div class="bg-white rounded-[40px] border border-[#EBE3D5] p-8 sm:p-12 shadow-xs max-w-2xl mx-auto text-center space-y-6">
            <div class="w-20 h-20 rounded-full bg-[#E0F2F1] text-[#2C5350] flex items-center justify-center text-3xl mx-auto border border-[#b2dfdb]">
              ✓
            </div>

            <span class="px-4 py-1.5 rounded-full bg-[#E0F2F1] text-[#2C5350] text-xs font-bold uppercase tracking-widest border border-[#b2dfdb]">
              ¡PAGO APROBADO CON ÉXITO!
            </span>

            <h1 class="text-3xl font-serif italic text-[#4A3F35]">
              ¡Gracias por tu pedido, {{ order.cliente.nombre }}!
            </h1>

            <p class="text-[#4A3F35]/80 text-sm leading-relaxed">
              Hemos recibido tu orden correctamente. Nuestro taller artesanal en La Dorada ya comenzó a preparar tus deliciosos postres japoneses.
            </p>

            <div class="p-5 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] text-xs text-left space-y-2 font-mono">
              <div class="flex justify-between">
                <span class="text-[#4A3F35]/60">Número de Orden:</span>
                <span class="font-bold text-[#4A3F35]">{{ order.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#4A3F35]/60">Método de Pago:</span>
                <span class="font-bold text-[#4A3F35] uppercase">{{ order.metodoPago }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#4A3F35]/60">Total Pagado:</span>
                <span class="font-bold text-[#4A3F35]">{{ '$' + order.total.toLocaleString('es-CO') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#4A3F35]/60">Tiempo Estimado de Entrega:</span>
                <span class="font-bold text-[#2C5350]">45 - 60 minutos</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-4">
              <a routerLink="/pedidos" class="flex-1 py-4 px-6 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors text-center">
                📍 Ver Seguimiento del Pedido
              </a>

              <a routerLink="/productos" class="py-4 px-6 rounded-full bg-[#FFD6E0] hover:bg-[#ffc2d1] text-[#4A3F35] font-bold text-xs uppercase tracking-widest transition-colors text-center">
                Volver a la Tienda
              </a>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class CheckoutPageComponent {
  cartService = inject(CartService);
  dataService = inject(MochiDataService);
  paymentService = inject(PaymentService);
  router = inject(Router);

  banks = COLOMBIAN_BANKS;

  clienteNombre = signal('María Fernanda López');
  clienteTelefono = signal('300 123 4567');
  clienteEmail = signal('maria.lopez@ejemplo.com');
  clienteDireccion = signal('Calle 12 # 4-30, Barrio Centro, La Dorada');
  notasEspeciales = signal('Favor empacar con moño de regalo');

  selectedMethod = signal<PaymentMethodType>('pse');
  selectedBank = signal<string>('Bancolombia');

  isProcessing = signal(false);
  createdOrder = signal<Order | null>(null);

  async submitPayment() {
    if (!this.clienteNombre() || !this.clienteTelefono()) return;

    this.isProcessing.set(true);

    const paymentRes = await this.paymentService.processPayment(
      this.selectedMethod(),
      this.cartService.total(),
      { banco: this.selectedBank(), telefono: this.clienteTelefono() }
    );

    this.isProcessing.set(false);

    if (paymentRes.success) {
      const order = this.dataService.createOrder({
        cliente: {
          nombre: this.clienteNombre(),
          email: this.clienteEmail(),
          telefono: this.clienteTelefono(),
          direccion: this.clienteDireccion(),
          ciudad: 'La Dorada'
        },
        tipoEntrega: this.cartService.deliveryType(),
        items: this.cartService.items().map(i => ({
          productoId: i.product.id,
          nombreJapones: i.product.nombre_japones,
          nombreEspanol: i.product.nombre_espanol,
          precio: i.product.precio_oferta || i.product.precio,
          cantidad: i.cantidad,
          imagen: i.product.imagen_principal
        })),
        subtotal: this.cartService.subtotal(),
        costoEnvio: this.cartService.shippingCost(),
        descuento: this.cartService.couponDiscount(),
        total: this.cartService.total(),
        metodoPago: this.selectedMethod(),
        estadoPago: 'aprobado',
        referenciaPago: paymentRes.transactionId,
        notasEspeciales: this.notasEspeciales(),
        tiempoEstimado: '45 - 60 minutos'
      });

      this.createdOrder.set(order);
      this.cartService.clearCart();
    }
  }
}
