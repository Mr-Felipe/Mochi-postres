import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { PaymentService, COLOMBIAN_BANKS } from '../../services/payment.service';
import { PaymentMethodType, Order, Direccion, StockValidation } from '../../models/mochi.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF5F0] min-h-screen py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-[#F0D5CC] pb-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-[#FF758F] font-serif">Paso Final</span>
            <h1 class="text-3xl font-serif italic text-[#1A1A1A] font-bold">Checkout & Pasarela de Pago Integrada</h1>
          </div>
          <a routerLink="/carrito" class="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:text-[#FF758F] transition-colors">← Volver al Carrito</a>
        </div>

        <!-- Stock Validation Warning if any -->
        @if (stockErrors().length > 0) {
          <div class="p-4 rounded-2xl bg-[#FFE4E6] border border-[#FDA4AF] text-[#9F1239] text-xs space-y-1 font-medium">
            <span class="font-bold flex items-center gap-1.5 uppercase tracking-wider">
              ⚠️ Stock Insuficiente en algunos productos:
            </span>
            <ul class="list-disc list-inside space-y-0.5 mt-1">
              @for (err of stockErrors(); track err.id_producto) {
                <li>
                  Producto #{{ err.id_producto }}: Solicitado {{ err.stock_solicitado }} un. — Solo disponible: {{ err.stock_disponible }} un.
                </li>
              }
            </ul>
          </div>
        }

        @if (!createdOrder()) {
          @if (cartService.items().length > 0) {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- Left Column: Delivery Form & Payment Gateway Options -->
              <div class="lg:col-span-7 space-y-8">
                
                <!-- 1. Customer & Delivery Address (Supabase 'direcciones' FK) -->
                <div class="bg-white rounded-[32px] border border-[#F0D5CC] p-6 sm:p-8 shadow-xs space-y-5">
                  <div class="flex items-center justify-between pb-2 border-b border-[#F0D5CC]">
                    <h2 class="text-lg font-serif italic text-[#1A1A1A] font-bold flex items-center gap-2">
                      <span class="w-7 h-7 rounded-full bg-[#FF758F] text-[#FDF5F0] text-xs font-bold flex items-center justify-center">1</span>
                      <span>Datos del Cliente & Dirección de Entrega</span>
                    </h2>
                    <span class="text-[11px] font-mono text-[#065F46] font-bold bg-[#D1FAE5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
                      📍 FK id_direccion
                    </span>
                  </div>

                  <!-- Address Picker: Saved in Supabase 'direcciones' table -->
                  @if (userAddresses().length > 0) {
                    <div class="space-y-2">
                      <span class="font-bold text-[#1A1A1A] text-xs block">Mis Direcciones Guardadas:</span>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        @for (dir of userAddresses(); track dir.id_direccion) {
                          <button 
                            type="button"
                            (click)="selectAddress(dir)"
                            [class]="selectedAddressId() === dir.id_direccion ? 'bg-[#FFA0B4]/25 border-[#FF758F] ring-1 ring-[#FF758F]' : 'bg-[#FDF5F0] border-[#F0D5CC] hover:border-[#FF758F]/50'"
                            class="p-3 rounded-2xl border text-xs text-left cursor-pointer transition-all space-y-1 w-full">
                            <div class="flex items-center justify-between">
                              <span class="font-bold text-[#1A1A1A] font-serif">{{ dir.alias || 'Dirección' }}</span>
                              @if (dir.predeterminada) {
                                <span class="text-[9px] px-2 py-0.5 rounded-full bg-[#FF758F] text-white font-bold">Principal</span>
                              }
                            </div>
                            <p class="text-[#1A1A1A]/80 text-[11px] leading-tight font-medium">{{ dir.direccion_completa }}</p>
                            <span class="text-[10px] text-[#1A1A1A]/60">{{ dir.barrio ? dir.barrio + ', ' : '' }}{{ dir.ciudad }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  }

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <label for="input-nombre" class="font-bold text-[#1A1A1A] block mb-1">Nombre Completo *</label>
                      <input 
                        id="input-nombre"
                        #nombreInput
                        type="text" 
                        [value]="clienteNombre()" 
                        (input)="clienteNombre.set($any($event.target).value)" 
                        placeholder="Ej. Juan Pérez" 
                        class="w-full p-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] focus:outline-none focus:border-[#FF758F] font-medium" 
                      />
                    </div>

                    <div>
                      <label for="input-tel" class="font-bold text-[#1A1A1A] block mb-1">Teléfono / WhatsApp *</label>
                      <input 
                        id="input-tel"
                        #telInput
                        type="text" 
                        [value]="clienteTelefono()" 
                        (input)="clienteTelefono.set($any($event.target).value)" 
                        placeholder="Ej. 300 123 4567" 
                        class="w-full p-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] focus:outline-none focus:border-[#FF758F] font-medium" 
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label for="input-email" class="font-bold text-[#1A1A1A] block mb-1">Correo Electrónico *</label>
                      <input 
                        id="input-email"
                        #emailInput
                        type="email" 
                        [value]="clienteEmail()" 
                        (input)="clienteEmail.set($any($event.target).value)" 
                        placeholder="cliente@ejemplo.com" 
                        class="w-full p-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] focus:outline-none focus:border-[#FF758F] font-medium" 
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label for="input-dir" class="font-bold text-[#1A1A1A] block mb-1">Dirección Exacta en La Dorada, Caldas *</label>
                      <input 
                        id="input-dir"
                        #dirInput
                        type="text" 
                        [value]="clienteDireccion()" 
                        (input)="clienteDireccion.set($any($event.target).value)" 
                        placeholder="Ej. Calle 12 # 4-30, Barrio Centro" 
                        class="w-full p-3 rounded-full bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] focus:outline-none focus:border-[#FF758F] font-medium" 
                      />
                    </div>

                    <div class="sm:col-span-2">
                      <label for="input-notas" class="font-bold text-[#1A1A1A] block mb-1">Notas Especiales para la Cocina / Instrucciones de Entrega (Opcional)</label>
                      <textarea 
                        id="input-notas"
                        #notasInput
                        rows="2"
                        [value]="notasEspeciales()" 
                        (input)="notasEspeciales.set($any($event.target).value)" 
                        placeholder="Ej. Empaque de regalo, alergias a nueces, dejar en portería..." 
                        class="w-full p-3.5 rounded-[20px] bg-[#FDF5F0] border border-[#F0D5CC] text-[#1A1A1A] focus:outline-none focus:border-[#FF758F] font-medium">
                      </textarea>
                    </div>
                  </div>
                </div>

                <!-- 2. Integrated Payment Gateway Methods -->
                <div class="bg-white rounded-[32px] border border-[#F0D5CC] p-6 sm:p-8 shadow-xs space-y-6">
                  <h2 class="text-lg font-serif italic text-[#1A1A1A] font-bold flex items-center gap-2 pb-2 border-b border-[#F0D5CC]">
                    <span class="w-7 h-7 rounded-full bg-[#FF758F] text-[#FDF5F0] text-xs font-bold flex items-center justify-center">2</span>
                    <span>Selecciona tu Método de Pago</span>
                  </h2>

                  <!-- Method Selection Tabs -->
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button 
                      (click)="selectedMethod.set('pse')"
                      [class]="selectedMethod() === 'pse' ? 'bg-[#FF758F] border-[#FF5277] text-white font-bold shadow-xs' : 'bg-[#FDF5F0] border-[#F0D5CC] hover:border-[#FF758F]/50 text-[#1A1A1A] font-medium'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">💳</span>
                      <div>
                        <span class="font-bold block">PSE</span>
                        <span class="text-[10px]" [class]="selectedMethod() === 'pse' ? 'text-white/80' : 'text-[#1A1A1A]/60'">Débito Bancario</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('nequi')"
                      [class]="selectedMethod() === 'nequi' ? 'bg-[#FF758F] border-[#FF5277] text-white font-bold shadow-xs' : 'bg-[#FDF5F0] border-[#F0D5CC] hover:border-[#FF758F]/50 text-[#1A1A1A] font-medium'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">📱</span>
                      <div>
                        <span class="font-bold block">Nequi / Daviplata</span>
                        <span class="text-[10px]" [class]="selectedMethod() === 'nequi' ? 'text-white/80' : 'text-[#1A1A1A]/60'">QR / Transferencia</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('tarjeta')"
                      [class]="selectedMethod() === 'tarjeta' ? 'bg-[#FF758F] border-[#FF5277] text-white font-bold shadow-xs' : 'bg-[#FDF5F0] border-[#F0D5CC] hover:border-[#FF758F]/50 text-[#1A1A1A] font-medium'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">💳</span>
                      <div>
                        <span class="font-bold block">Tarjeta Crédito</span>
                        <span class="text-[10px]" [class]="selectedMethod() === 'tarjeta' ? 'text-white/80' : 'text-[#1A1A1A]/60'">Visa / Mastercard</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('contraentrega')"
                      [class]="selectedMethod() === 'contraentrega' ? 'bg-[#FF758F] border-[#FF5277] text-white font-bold shadow-xs' : 'bg-[#FDF5F0] border-[#F0D5CC] hover:border-[#FF758F]/50 text-[#1A1A1A] font-medium'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20">
                      <span class="text-base">💵</span>
                      <div>
                        <span class="font-bold block">Contraentrega</span>
                        <span class="text-[10px]" [class]="selectedMethod() === 'contraentrega' ? 'text-white/80' : 'text-[#1A1A1A]/60'">Efectivo al recibir</span>
                      </div>
                    </button>

                    <button 
                      (click)="selectedMethod.set('transferencia')"
                      [class]="selectedMethod() === 'transferencia' ? 'bg-[#FF758F] border-[#FF5277] text-white font-bold shadow-xs' : 'bg-[#FDF5F0] border-[#F0D5CC] hover:border-[#FF758F]/50 text-[#1A1A1A] font-medium'"
                      class="p-3.5 rounded-2xl border text-xs text-left transition-all flex flex-col justify-between h-20 sm:col-span-2">
                      <span class="text-base">🏦</span>
                      <div>
                        <span class="font-bold block">Transferencia Bancaria</span>
                        <span class="text-[10px]" [class]="selectedMethod() === 'transferencia' ? 'text-white/80' : 'text-[#1A1A1A]/60'">Bancolombia / Davivienda</span>
                      </div>
                    </button>
                  </div>

                  <!-- Dynamic Payment Details Form according to selected Method -->
                  <div class="p-5 rounded-[24px] bg-[#FDF5F0] border border-[#F0D5CC] text-xs space-y-4">
                    
                    <!-- PSE Option Details -->
                    @if (selectedMethod() === 'pse') {
                      <div class="space-y-3">
                        <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">Pasarela PSE - Selección de Banco</h3>
                        <div>
                          <label for="select-banco" class="font-bold text-[#1A1A1A] block mb-1">Elige tu Banco en Colombia *</label>
                          <select 
                            id="select-banco"
                            [value]="selectedBank()"
                            (change)="selectedBank.set($any($event.target).value)"
                            class="w-full p-3 rounded-full bg-white border border-[#F0D5CC] text-xs font-bold text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                            @for (b of banks; track b.id) {
                              <option [value]="b.nombre">{{ b.nombre }}</option>
                            }
                          </select>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label for="select-tipo-cliente" class="font-bold text-[#1A1A1A] block mb-1">Tipo de Cliente</label>
                            <select id="select-tipo-cliente" class="w-full p-3 rounded-full bg-white border border-[#F0D5CC] text-[#1A1A1A] font-medium">
                              <option>Persona Natural</option>
                              <option>Persona Jurídica</option>
                            </select>
                          </div>
                          <div>
                            <label for="input-cedula" class="font-bold text-[#1A1A1A] block mb-1">Documento Identidad *</label>
                            <input id="input-cedula" type="text" placeholder="Número Cédula" class="w-full p-3 rounded-full bg-white border border-[#F0D5CC] text-[#1A1A1A] font-medium focus:outline-none focus:border-[#FF758F]">
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Nequi / Daviplata Details -->
                    @if (selectedMethod() === 'nequi' || selectedMethod() === 'daviplata') {
                      <div class="space-y-4 text-center">
                        <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">
                          Pago Instantáneo por {{ selectedMethod() === 'nequi' ? 'Nequi' : 'Daviplata' }}
                        </h3>
                        <p class="text-[#1A1A1A]/80 leading-relaxed font-medium">
                          Escanea el siguiente Código QR dinámico con tu app o transfiere al número oficial de Mochi.
                        </p>
                        
                        <!-- Simulated Interactive QR Code -->
                        <div class="w-48 h-48 mx-auto bg-white p-3 rounded-3xl shadow-xs border border-[#F0D5CC] flex flex-col items-center justify-center space-y-2">
                          <div class="w-36 h-36 bg-[#FF758F] rounded-2xl flex items-center justify-center text-[#FDF5F0] text-4xl font-serif italic font-bold">
                            Mochi.
                          </div>
                          <span class="text-[10px] font-mono text-[#1A1A1A]/60 font-bold">REF: MOCHI-{{ cartService.total() }}</span>
                        </div>

                        <div class="p-3 rounded-full bg-white border border-[#F0D5CC] text-center font-mono">
                          <span class="text-[#1A1A1A]/60 block text-[10px]">Número Nequi / Daviplata MOCHI:</span>
                          <span class="font-bold text-[#1A1A1A] text-base">300 123 4567</span>
                        </div>
                      </div>
                    }

                    <!-- Credit Card Details -->
                    @if (selectedMethod() === 'tarjeta') {
                      <div class="space-y-3">
                        <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">Procesador de Tarjetas de Crédito / Débito</h3>
                        <div>
                          <label for="input-tarjeta" class="font-bold text-[#1A1A1A] block mb-1">Número de Tarjeta *</label>
                          <input id="input-tarjeta" type="text" maxlength="19" placeholder="4532 •••• •••• 8910" class="w-full p-3 rounded-full bg-white border border-[#F0D5CC] font-mono text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label for="input-titular" class="font-bold text-[#1A1A1A] block mb-1">Titular *</label>
                            <input id="input-titular" type="text" placeholder="Nombre en tarjeta" class="w-full p-3 rounded-full bg-white border border-[#F0D5CC] text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                          </div>
                          <div>
                            <label for="input-venc" class="font-bold text-[#1A1A1A] block mb-1">Vencimiento / CVV *</label>
                            <div class="flex gap-2">
                              <input id="input-venc" type="text" placeholder="MM/AA" class="w-1/2 p-3 rounded-full bg-white border border-[#F0D5CC] text-center text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                              <input type="text" maxlength="4" placeholder="CVC" class="w-1/2 p-3 rounded-full bg-white border border-[#F0D5CC] text-center font-mono text-[#1A1A1A] focus:outline-none focus:border-[#FF758F]">
                            </div>
                          </div>
                        </div>
                      </div>
                    }

                    <!-- Contraentrega Details -->
                    @if (selectedMethod() === 'contraentrega') {
                      <div class="space-y-2">
                        <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">Pago Contraentrega en La Dorada</h3>
                        <p class="text-[#1A1A1A]/80 font-medium">
                          Pagarás en efectivo al momento de recibir tus postres. Nuestro repartidor lleva cambio exacto.
                        </p>
                      </div>
                    }

                    <!-- Transferencia Details -->
                    @if (selectedMethod() === 'transferencia') {
                      <div class="space-y-2">
                        <h3 class="font-serif italic text-[#1A1A1A] text-base font-bold">Transferencia Bancaria Directa</h3>
                        <p class="text-[#1A1A1A]/80 font-medium">
                          Davivienda Ahorros: <strong>0098-4521-8901</strong> | Bancolombia: <strong>310-890123-01</strong>
                        </p>
                      </div>
                    }

                  </div>
                </div>

              </div>

              <!-- Right Column: Order Summary & Confirm Button -->
              <div class="lg:col-span-5 bg-white rounded-[32px] border border-[#F0D5CC] p-6 sm:p-8 shadow-xs space-y-6 sticky top-28">
                <h2 class="text-lg font-serif italic text-[#1A1A1A] font-bold pb-3 border-b border-[#F0D5CC]">Resumen de Tu Compra</h2>

                <!-- Items Mini List -->
                <div class="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs">
                  @for (item of cartService.items(); track item.product.id) {
                    <div class="flex items-center justify-between p-2.5 rounded-2xl bg-[#FDF5F0] border border-[#F0D5CC]/50">
                      <div class="flex items-center gap-2">
                        <img [src]="item.product.imagen_principal" alt="" class="w-10 h-10 rounded-xl object-cover">
                        <div>
                          <span class="font-serif italic text-[#1A1A1A] font-bold block">{{ item.product.nombre_espanol }}</span>
                          <span class="text-[10px] text-[#1A1A1A]/60 font-mono font-bold">x{{ item.cantidad }}</span>
                        </div>
                      </div>
                      <span class="font-serif italic text-[#1A1A1A] font-bold">
                        {{ '$' + (item.cantidad * (item.product.precio_oferta || item.product.precio)).toLocaleString('es-CO') }}
                      </span>
                    </div>
                  }
                </div>

                <!-- Price Totals -->
                <div class="space-y-2 text-xs text-[#1A1A1A]/80 pt-3 border-t border-[#F0D5CC]">
                  <div class="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span class="font-bold text-[#1A1A1A]">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
                  </div>

                  @if (cartService.couponDiscount() > 0) {
                    <div class="flex justify-between text-[#065F46] font-bold">
                      <span>Descuento Cupón:</span>
                      <span>-{{ '$' + cartService.couponDiscount().toLocaleString('es-CO') }}</span>
                    </div>
                  }

                  <div class="flex justify-between font-medium">
                    <span>Costo de Envío:</span>
                    <span class="font-bold text-[#1A1A1A]">
                      {{ cartService.shippingCost() === 0 ? '¡GRATIS!' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}
                    </span>
                  </div>

                  <div class="flex justify-between text-base font-bold text-[#1A1A1A] pt-3 border-t border-[#F0D5CC]">
                    <span>TOTAL COMPRA:</span>
                    <span class="text-2xl font-serif italic text-[#FF758F] font-bold">{{ '$' + cartService.total().toLocaleString('es-CO') }}</span>
                  </div>
                </div>

                <!-- Payment Submit Button -->
                <button 
                  [disabled]="isProcessing() || !clienteNombre() || !clienteTelefono() || stockErrors().length > 0"
                  (click)="submitPayment()"
                  class="w-full py-4 rounded-full bg-[#FF758F] hover:bg-[#FF5277] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest shadow-xs transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                  @if (isProcessing()) {
                    <span class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Validando Stock & Procesando...</span>
                  } @else {
                    <span>🔒 Pagar {{ '$' + cartService.total().toLocaleString('es-CO') }} Ahora</span>
                  }
                </button>

                <p class="text-[10px] text-[#1A1A1A]/50 text-center leading-tight">
                  Transacción protegida mediante RPC <strong>crear_pedido_con_stock</strong> y RLS en Supabase.
                </p>
              </div>

            </div>
          } @else {
            <div class="text-center py-20 bg-white rounded-[40px] border border-[#F0D5CC] p-8 space-y-4 max-w-lg mx-auto">
              <h2 class="text-2xl font-serif italic text-[#1A1A1A] font-bold">No tienes productos en tu carrito</h2>
              <a routerLink="/productos" class="inline-block px-8 py-3.5 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest transition-colors shadow-xs">
                Ir al Catálogo
              </a>
            </div>
          }
        } @else {
          <!-- Order Confirmation Screen -->
          @let order = createdOrder()!;

          <div class="bg-white rounded-[40px] border border-[#F0D5CC] p-8 sm:p-12 shadow-xs max-w-2xl mx-auto text-center space-y-6">
            <div class="w-20 h-20 rounded-full bg-[#D1FAE5] text-[#065F46] flex items-center justify-center text-3xl mx-auto border border-[#A7F3D0]">
              ✓
            </div>

            <span class="px-4 py-1.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-xs font-bold uppercase tracking-widest border border-[#A7F3D0]">
              ¡PAGO APROBADO CON ÉXITO!
            </span>

            <h1 class="text-3xl font-serif italic text-[#1A1A1A] font-bold">
              ¡Gracias por tu pedido, {{ order.cliente.nombre }}!
            </h1>

            <p class="text-[#1A1A1A]/80 text-sm leading-relaxed font-medium">
              Hemos recibido tu orden correctamente. Nuestro taller artesanal en La Dorada ya comenzó a preparar tus deliciosos postres japoneses.
            </p>

            <div class="p-5 rounded-[24px] bg-[#FDF5F0] border border-[#F0D5CC] text-xs text-left space-y-2 font-mono">
              <div class="flex justify-between">
                <span class="text-[#1A1A1A]/60">Número de Orden:</span>
                <span class="font-bold text-[#1A1A1A]">{{ order.id }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#1A1A1A]/60">Dirección ID (FK):</span>
                <span class="font-bold text-[#1A1A1A]">#{{ order.id_direccion || selectedAddressId() || 101 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#1A1A1A]/60">Método de Pago:</span>
                <span class="font-bold text-[#FF758F] uppercase">{{ order.metodoPago }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#1A1A1A]/60">Total Pagado:</span>
                <span class="font-bold text-[#1A1A1A]">{{ '$' + order.total.toLocaleString('es-CO') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[#1A1A1A]/60">Tiempo Estimado de Entrega:</span>
                <span class="font-bold text-[#065F46]">45 - 60 minutos</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 pt-4">
              <a routerLink="/pedidos" class="flex-1 py-4 px-6 rounded-full bg-[#FF758F] hover:bg-[#FF6078] text-[#FDF5F0] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors text-center">
                📍 Ver Seguimiento del Pedido
              </a>

              <a routerLink="/productos" class="py-4 px-6 rounded-full bg-[#FF758F] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest transition-colors text-center shadow-xs">
                Volver a la Tienda
              </a>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class CheckoutPageComponent implements OnInit {
  cartService = inject(CartService);
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  paymentService = inject(PaymentService);
  router = inject(Router);

  banks = COLOMBIAN_BANKS;

  clienteNombre = signal('María Fernanda López');
  clienteTelefono = signal('300 123 4567');
  clienteEmail = signal('maria.lopez@ejemplo.com');
  clienteDireccion = signal('Calle 12 # 4-30, Barrio Centro, La Dorada');
  notasEspeciales = signal('Favor empacar con moño de regalo');

  selectedAddressId = signal<number>(101);
  userAddresses = signal<Direccion[]>([]);
  stockErrors = signal<StockValidation[]>([]);

  selectedMethod = signal<PaymentMethodType>('pse');
  selectedBank = signal<string>('Bancolombia');

  isProcessing = signal(false);
  createdOrder = signal<Order | null>(null);

  async ngOnInit() {
    const activeUser = this.supabaseService.activeUser();
    if (!activeUser) return;
    this.clienteNombre.set(activeUser.nombre_completo);
    this.clienteEmail.set(activeUser.email);
    if (activeUser.telefono) {
      this.clienteTelefono.set(activeUser.telefono);
    }

    // RPC: obtener_direcciones_usuario
    const addresses = await this.supabaseService.obtenerDireccionesUsuario(activeUser.id);
    this.userAddresses.set(addresses);

    // RPC: obtener_direccion_predeterminada
    const defaultAddr = await this.supabaseService.obtenerDireccionPredeterminada(activeUser.id);
    if (defaultAddr) {
      this.selectAddress(defaultAddr);
    }
  }

  selectAddress(dir: Direccion) {
    this.selectedAddressId.set(dir.id_direccion);
    this.clienteDireccion.set(dir.direccion_completa);
    if (dir.instrucciones_entrega) {
      this.notasEspeciales.set(dir.instrucciones_entrega);
    }
  }

  async submitPayment() {
    if (!this.clienteNombre() || !this.clienteTelefono()) return;

    this.isProcessing.set(true);
    this.stockErrors.set([]);

    // 1. RPC: validar_stock_pedido before placing order
    const stockItems = this.cartService.items().map(i => ({
      id_producto: i.product.id,
      cantidad: i.cantidad
    }));

    const stockValidation = await this.supabaseService.validarStockPedido(
      stockItems, 
      this.dataService.products()
    );

    const insuficientes = stockValidation.filter(item => !item.suficiente);
    if (insuficientes.length > 0) {
      this.stockErrors.set(insuficientes);
      this.isProcessing.set(false);
      return;
    }

    // 2. Process payment gateway simulation
    const paymentRes = await this.paymentService.processPayment(
      this.selectedMethod(),
      this.cartService.total(),
      { banco: this.selectedBank(), telefono: this.clienteTelefono() }
    );

    if (paymentRes.success) {
      // 3. RPC: crear_pedido_con_stock
      const currentUser = this.supabaseService.activeUser();
      if (!currentUser) { this.isProcessing.set(false); return; }
      const sbOrderRes = await this.supabaseService.crearPedidoConStock({
        p_id_usuario: currentUser.id,
        p_id_direccion: this.selectedAddressId(),
        p_productos: stockItems,
        p_metodo_pago: this.selectedMethod(),
        p_notas: this.notasEspeciales()
      });

      const order = await this.dataService.createOrder({
        id_pedido: sbOrderRes?.id_pedido,
        id_usuario: currentUser.id,
        id_direccion: this.selectedAddressId(),
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

    this.isProcessing.set(false);
  }
}

