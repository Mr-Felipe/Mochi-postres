import { Component, inject, signal, computed, effect, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { PaymentService, COLOMBIAN_BANKS } from '../../services/payment.service';
import { PaymentMethodType, Order, Direccion, StockValidation } from '../../models/mochi.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] min-h-screen py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/carrito" class="w-10 h-10 rounded-full bg-white border border-[#E8D8D0] flex items-center justify-center hover:bg-[#D95578]/10 transition-colors">
              <span class="material-icons text-[#590E2A] text-xl">arrow_back</span>
            </a>
            <div>
              <span class="text-[9px] font-bold uppercase tracking-widest text-[#D95578] block">Paso Final</span>
              <h1 class="text-2xl font-serif italic text-[#590E2A] font-bold">Checkout</h1>
            </div>
          </div>
          <div class="hidden sm:flex items-center gap-2 text-[10px] text-[#590E2A]/40 font-bold uppercase tracking-wider">
            <span class="material-icons text-sm text-[#065F46]">lock</span>
            Pago Seguro
          </div>
        </div>

        @if (stockErrors().length > 0) {
          <div class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1.5">
            <span class="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <span class="material-icons text-sm">warning</span> Stock Insuficiente:
            </span>
            @for (err of stockErrors(); track err.id_producto) {
              <div class="flex items-center gap-2 ml-5">
                <span class="material-icons text-xs">error_outline</span>
                Producto #{{ err.id_producto }}: solicitar {{ err.stock_solicitado }} — disponible {{ err.stock_disponible }}
              </div>
            }
          </div>
        }

        @if (!createdOrder()) {
          @if (cartService.items().length > 0) {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <!-- Left: Collapsible Sections -->
              <div class="lg:col-span-7 space-y-3">

                <!-- Section 1: Customer Info -->
                <div class="bg-white rounded-[24px] border border-[#E8D8D0] shadow-xs overflow-hidden">
                  <button (click)="activeSection.set('info')"
                    class="w-full p-5 flex items-center justify-between text-left transition-colors"
                    [class.bg-[#FDF8F4]]="activeSection() === 'payment'"
                    [class.rounded-t-[24px]]="activeSection() === 'payment'">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-full bg-[#D95578] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                      <span class="material-icons text-[#D95578] text-lg">person</span>
                      <span class="text-sm font-serif italic text-[#590E2A] font-bold">Datos de Contacto</span>
                      @if (activeSection() === 'payment' && clienteNombre() && clienteDireccion()) {
                        <span class="material-icons text-[#065F46] text-sm">check_circle</span>
                      }
                    </div>
                    <span class="material-icons text-[#590E2A]/40 text-lg transition-transform duration-200"
                      [class.rotate-180]="activeSection() === 'info'">
                      expand_more
                    </span>
                  </button>

                  @if (activeSection() === 'info') {
                    <div class="px-5 pb-5 space-y-4 border-t border-[#E8D8D0]/50">
                      <!-- Saved Addresses -->
                      <div class="pt-4 space-y-2">
                        <div class="flex items-center justify-between">
                          <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider flex items-center gap-1">
                            <span class="material-icons text-xs">bookmarks</span> Direcciones
                          </span>
                          <button type="button" (click)="openNewAddressModal()" class="text-[10px] font-bold text-[#D95578] flex items-center gap-0.5 hover:underline">
                            <span class="material-icons text-xs">add_circle_outline</span> Nueva
                          </button>
                        </div>

                        @if (userAddresses().length > 0) {
                          <div class="space-y-1.5">
                            @if (selectedAddressId()) {
                              @for (dir of userAddresses(); track dir.id_direccion) {
                                @if (selectedAddressId() === dir.id_direccion) {
                                  <div class="p-3 rounded-xl border bg-[#D95578]/10 border-[#D95578] flex items-center gap-3">
                                    <span class="material-icons text-lg text-[#D95578]">radio_button_checked</span>
                                    <div class="flex-1 min-w-0">
                                      <div class="flex items-center gap-1.5">
                                        <span class="font-bold text-[#590E2A] text-xs">{{ dir.alias || 'Direccion' }}</span>
                                        @if (dir.predeterminada) {
                                          <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-[#D95578] text-white font-bold">Principal</span>
                                        }
                                      </div>
                                      <p class="text-[#590E2A]/60 text-[10px] truncate">{{ dir.direccion_completa }}</p>
                                    </div>
                                  </div>
                                }
                              }
                            } @else {
                              <div class="p-3 rounded-xl border border-dashed border-[#E8D8D0] text-center text-[10px] text-[#590E2A]/40">
                                Selecciona una direccion
                              </div>
                            }
                            <button type="button" (click)="showAllAddresses.set(true)"
                              class="w-full py-2 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[10px] font-bold text-[#590E2A]/50 hover:text-[#D95578] hover:border-[#D95578] transition-all flex items-center justify-center gap-1">
                              <span class="material-icons" style="font-size: 14px">location_on</span>
                              Cambiar direccion ({{ userAddresses().length }})
                            </button>
                          </div>
                        } @else {
                          <button type="button" (click)="openNewAddressModal()"
                            class="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#E8D8D0] text-[10px] text-[#590E2A]/50 hover:border-[#D95578] hover:text-[#D95578] transition-colors">
                            <span class="material-icons text-sm">add_location_alt</span>
                            Agregar primera direccion
                          </button>
                        }
                      </div>

                      <!-- Form Fields -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span class="material-icons text-xs">person</span> Nombre *
                          </label>
                          <input type="text" [value]="clienteNombre()" (input)="clienteNombre.set($any($event.target).value)"
                            placeholder="Tu nombre"
                            class="w-full p-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#D95578] font-medium text-xs" />
                        </div>
                        <div>
                          <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span class="material-icons text-xs">phone</span> Telefono *
                          </label>
                          <input type="text" [value]="clienteTelefono()" (input)="clienteTelefono.set($any($event.target).value)"
                            placeholder="300 123 4567"
                            class="w-full p-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#D95578] font-medium text-xs" />
                        </div>
                        <div class="sm:col-span-2">
                          <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span class="material-icons text-xs">email</span> Email *
                          </label>
                          <input type="email" [value]="clienteEmail()" (input)="clienteEmail.set($any($event.target).value)"
                            placeholder="correo@ejemplo.com"
                            class="w-full p-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#D95578] font-medium text-xs" />
                        </div>
                        <div class="sm:col-span-2">
                          <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <span class="material-icons text-xs">edit_note</span> Notas
                          </label>
                          <textarea rows="2" [value]="notasEspeciales()" (input)="notasEspeciales.set($any($event.target).value)"
                            placeholder="Empaque regalo, alergias..."
                            class="w-full p-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#D95578] font-medium text-xs resize-none"></textarea>
                        </div>
                      </div>

                      <!-- Next button -->
                      <button (click)="activeSection.set('payment')"
                        class="w-full py-2.5 rounded-full bg-[#590E2A] hover:bg-[#3A0A1C] text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5">
                        Siguiente: Metodo de Pago
                        <span class="material-icons text-sm">arrow_forward</span>
                      </button>
                    </div>
                  }
                </div>

                <!-- Section 2: Payment -->
                <div class="bg-white rounded-[24px] border border-[#E8D8D0] shadow-xs overflow-hidden">
                  <button (click)="activeSection.set('payment')"
                    class="w-full p-5 flex items-center justify-between text-left transition-colors"
                    [class.bg-[#FDF8F4]]="activeSection() === 'info'"
                    [class.rounded-t-[24px]]="activeSection() === 'info'">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded-full bg-[#D95578] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                      <span class="material-icons text-[#D95578] text-lg">payment</span>
                      <span class="text-sm font-serif italic text-[#590E2A] font-bold">Metodo de Pago</span>
                      @if (activeSection() === 'info') {
                        <span class="text-[10px] text-[#590E2A]/40 font-mono">{{ selectedMethod() | uppercase }}</span>
                      }
                    </div>
                    <span class="material-icons text-[#590E2A]/40 text-lg transition-transform duration-200"
                      [class.rotate-180]="activeSection() === 'payment'">
                      expand_more
                    </span>
                  </button>

                  @if (activeSection() === 'payment') {
                    <div class="px-5 pb-5 space-y-4 border-t border-[#E8D8D0]/50">
                      <!-- Payment Tabs -->
                      <div class="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button (click)="selectedMethod.set('contraentrega')"
                          [class]="selectedMethod() === 'contraentrega' ? 'bg-[#D95578] border-[#FF5277] text-white shadow-xs' : 'bg-[#FDF8F4] border-[#E8D8D0] hover:border-[#D95578]/40 text-[#590E2A]'"
                          class="p-3 rounded-xl border text-[11px] text-left transition-all flex items-center gap-2.5">
                          <span class="material-icons text-lg">payments</span>
                          <div>
                            <span class="font-bold block">Contraentrega</span>
                            <span [class]="selectedMethod() === 'contraentrega' ? 'text-white/70' : 'text-[#590E2A]/50'" class="text-[9px]">Efectivo</span>
                          </div>
                        </button>
                        <button (click)="selectedMethod.set('nequi')"
                          [class]="selectedMethod() === 'nequi' ? 'bg-[#D95578] border-[#FF5277] text-white shadow-xs' : 'bg-[#FDF8F4] border-[#E8D8D0] hover:border-[#D95578]/40 text-[#590E2A]'"
                          class="p-3 rounded-xl border text-[11px] text-left transition-all flex items-center gap-2.5">
                          <span class="material-icons text-lg">qr_code_2</span>
                          <div>
                            <span class="font-bold block">Nequi</span>
                            <span [class]="selectedMethod() === 'nequi' ? 'text-white/70' : 'text-[#590E2A]/50'" class="text-[9px]">QR</span>
                          </div>
                        </button>
                        <button (click)="selectedMethod.set('pse')"
                          [class]="selectedMethod() === 'pse' ? 'bg-[#D95578] border-[#FF5277] text-white shadow-xs' : 'bg-[#FDF8F4] border-[#E8D8D0] hover:border-[#D95578]/40 text-[#590E2A]'"
                          class="p-3 rounded-xl border text-[11px] text-left transition-all flex items-center gap-2.5">
                          <span class="material-icons text-lg">account_balance</span>
                          <div>
                            <span class="font-bold block">PSE</span>
                            <span [class]="selectedMethod() === 'pse' ? 'text-white/70' : 'text-[#590E2A]/50'" class="text-[9px]">Debito</span>
                          </div>
                        </button>
                        <button (click)="selectedMethod.set('tarjeta')"
                          [class]="selectedMethod() === 'tarjeta' ? 'bg-[#D95578] border-[#FF5277] text-white shadow-xs' : 'bg-[#FDF8F4] border-[#E8D8D0] hover:border-[#D95578]/40 text-[#590E2A]'"
                          class="p-3 rounded-xl border text-[11px] text-left transition-all flex items-center gap-2.5">
                          <span class="material-icons text-lg">credit_card</span>
                          <div>
                            <span class="font-bold block">Tarjeta</span>
                            <span [class]="selectedMethod() === 'tarjeta' ? 'text-white/70' : 'text-[#590E2A]/50'" class="text-[9px]">Credito</span>
                          </div>
                        </button>
                        <button (click)="selectedMethod.set('transferencia')"
                          [class]="selectedMethod() === 'transferencia' ? 'bg-[#D95578] border-[#FF5277] text-white shadow-xs' : 'bg-[#FDF8F4] border-[#E8D8D0] hover:border-[#D95578]/40 text-[#590E2A]'"
                          class="p-3 rounded-xl border text-[11px] text-left transition-all flex items-center gap-2.5 sm:col-span-2">
                          <span class="material-icons text-lg">swap_horiz</span>
                          <div>
                            <span class="font-bold block">Transferencia</span>
                            <span [class]="selectedMethod() === 'transferencia' ? 'text-white/70' : 'text-[#590E2A]/50'" class="text-[9px]">Bancolombia</span>
                          </div>
                        </button>
                      </div>

                      <!-- Payment Details -->
                      <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-xs space-y-3">
                        @if (selectedMethod() === 'contraentrega') {
                          <div class="flex items-start gap-2.5">
                            <span class="material-icons text-[#065F46] mt-0.5">check_circle</span>
                            <div>
                              <span class="font-bold text-[#590E2A] block">Pago en efectivo al recibir</span>
                              <span class="text-[#590E2A]/60">Nuestro repartidor lleva cambio exacto.</span>
                            </div>
                          </div>
                        }
                        @if (selectedMethod() === 'nequi') {
                          <div class="space-y-3 text-center">
                            <div class="w-28 h-28 mx-auto bg-white p-2 rounded-2xl border border-[#E8D8D0] flex items-center justify-center">
                              <div class="w-full h-full bg-[#D95578] rounded-xl flex items-center justify-center text-white text-sm font-serif italic font-bold">Mochi.</div>
                            </div>
                            <div class="p-2.5 rounded-xl bg-white border border-[#E8D8D0] font-mono">
                              <span class="text-[9px] text-[#590E2A]/50 block">Numero Nequi</span>
                              <span class="font-bold text-[#590E2A]">300 123 4567</span>
                            </div>
                          </div>
                        }
                        @if (selectedMethod() === 'pse') {
                          <div class="space-y-2">
                            <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider flex items-center gap-1">
                              <span class="material-icons text-xs">account_balance</span> Selecciona tu banco
                            </label>
                            <select [value]="selectedBank()" (change)="selectedBank.set($any($event.target).value)"
                              class="w-full p-2.5 rounded-xl bg-white border border-[#E8D8D0] text-xs font-bold text-[#590E2A] focus:outline-none focus:border-[#D95578]">
                              @for (b of banks; track b.id) { <option [value]="b.nombre">{{ b.nombre }}</option> }
                            </select>
                          </div>
                        }
                        @if (selectedMethod() === 'tarjeta') {
                          <div class="space-y-2">
                            <input type="text" placeholder="Numero de tarjeta"
                              class="w-full p-2.5 rounded-xl bg-white border border-[#E8D8D0] font-mono text-[#590E2A] focus:outline-none focus:border-[#D95578] text-xs" />
                            <div class="grid grid-cols-2 gap-2">
                              <input type="text" placeholder="MM/AA"
                                class="p-2.5 rounded-xl bg-white border border-[#E8D8D0] text-center text-[#590E2A] focus:outline-none focus:border-[#D95578] text-xs" />
                              <input type="text" maxlength="4" placeholder="CVC"
                                class="p-2.5 rounded-xl bg-white border border-[#E8D8D0] text-center font-mono text-[#590E2A] focus:outline-none focus:border-[#D95578] text-xs" />
                            </div>
                          </div>
                        }
                        @if (selectedMethod() === 'transferencia') {
                          <div class="space-y-1.5">
                            <div class="flex items-center gap-2 text-[#590E2A]/80">
                              <span class="material-icons text-xs text-[#D95578]">account_balance</span>
                              Davivienda: <span class="font-bold">0098-4521-8901</span>
                            </div>
                            <div class="flex items-center gap-2 text-[#590E2A]/80">
                              <span class="material-icons text-xs text-[#D95578]">account_balance</span>
                              Bancolombia: <span class="font-bold">310-890123-01</span>
                            </div>
                          </div>
                        }
                      </div>

                      <!-- Back button -->
                      <button (click)="activeSection.set('info')"
                        class="w-full py-2.5 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 hover:bg-[#FDF8F4]">
                        <span class="material-icons text-sm">arrow_back</span>
                        Volver a Datos
                      </button>
                    </div>
                  }
                </div>

              </div>

              <!-- Right: Summary (sticky) -->
              <div class="lg:col-span-5 bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs space-y-4 sticky top-28">
                <h2 class="text-sm font-serif italic text-[#590E2A] font-bold flex items-center gap-2 pb-3 border-b border-[#E8D8D0]">
                  <span class="material-icons text-[#D95578] text-lg">receipt_long</span>
                  Tu Pedido
                </h2>

                <div class="space-y-2 max-h-44 overflow-y-auto pr-1">
                  @for (item of cartService.items(); track item.product.id + (item.frase_personalizada || '')) {
                    <div class="flex items-center gap-2.5 p-2 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0]/50">
                      <img [src]="item.product.imagen_principal" class="w-9 h-9 rounded-lg object-cover">
                      <div class="flex-1 min-w-0">
                        <span class="text-[11px] font-bold text-[#590E2A] block truncate">{{ item.product.nombre_espanol }}</span>
                        <div class="flex items-center gap-1">
                          <span class="text-[9px] text-[#590E2A]/50">x{{ item.cantidad }}</span>
                          @if (item.frase_personalizada) {
                            <span class="material-icons text-[9px] text-[#D95578]">format_quote</span>
                          }
                        </div>
                      </div>
                      <span class="text-[11px] font-bold text-[#590E2A] whitespace-nowrap">{{ '$' + (item.cantidad * item.product.precio).toLocaleString('es-CO') }}</span>
                    </div>
                  }
                </div>

                <div class="space-y-2 text-xs pt-2 border-t border-[#E8D8D0]">
                  <div class="flex justify-between text-[#590E2A]/60">
                    <span class="flex items-center gap-1"><span class="material-icons text-xs">shopping_bag</span> Subtotal</span>
                    <span class="font-bold text-[#590E2A]">{{ '$' + cartService.subtotal().toLocaleString('es-CO') }}</span>
                  </div>
                  <div class="flex justify-between text-[#590E2A]/60">
                    <span class="flex items-center gap-1"><span class="material-icons text-xs">local_shipping</span> Envio</span>
                    <span class="font-bold text-[#590E2A]">{{ cartService.shippingCost() === 0 ? 'Gratis' : '$' + cartService.shippingCost().toLocaleString('es-CO') }}</span>
                  </div>
                  <div class="flex justify-between items-end pt-2 border-t border-[#E8D8D0]">
                    <span class="text-xs font-bold text-[#590E2A] uppercase">Total</span>
                    <span class="text-xl font-serif italic text-[#D95578] font-bold">{{ '$' + cartService.total().toLocaleString('es-CO') }}</span>
                  </div>
                </div>

                <button [disabled]="isProcessing() || !clienteNombre() || !clienteTelefono() || stockErrors().length > 0"
                  (click)="submitPayment()"
                  class="w-full py-3.5 rounded-full bg-[#D95578] hover:bg-[#FF5277] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest shadow-xs transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                  @if (isProcessing()) {
                    <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Procesando...</span>
                  } @else {
                    <span class="material-icons text-base">lock</span>
                    Pagar {{ '$' + cartService.total().toLocaleString('es-CO') }}
                  }
                </button>

                <p class="text-[9px] text-[#590E2A]/40 text-center">Pago seguro verificado por Supabase</p>
              </div>

            </div>
          } @else {
            <div class="text-center py-16 bg-white rounded-[32px] border border-[#E8D8D0] p-8 space-y-4 max-w-md mx-auto">
              <span class="material-icons text-3xl text-[#590E2A]/20">remove_shopping_cart</span>
              <h2 class="text-lg font-serif italic text-[#590E2A] font-bold">Sin productos</h2>
              <a routerLink="/productos" class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D95578] text-white font-bold text-xs uppercase tracking-widest">
                <span class="material-icons text-sm">storefront</span> Ir al Catalogo
              </a>
            </div>
          }
        } @else {
          <!-- Order Confirmation -->
          @let order = createdOrder()!;
          <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-8 sm:p-12 shadow-xs max-w-xl mx-auto text-center space-y-5">
            <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
              <span class="material-icons text-3xl text-emerald-600">check_circle</span>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest border border-emerald-200">
              <span class="material-icons text-xs">verified</span> Pago Aprobado
            </span>
            <h1 class="text-xl font-serif italic text-[#590E2A] font-bold">Gracias, {{ order.cliente.nombre }}!</h1>
            <p class="text-[#590E2A]/60 text-xs leading-relaxed max-w-sm mx-auto">Tu pedido esta siendo preparado en nuestro taller artesanal.</p>
            <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-xs space-y-2 font-mono text-left max-w-xs mx-auto">
              <div class="flex justify-between"><span class="text-[#590E2A]/50 flex items-center gap-1"><span class="material-icons text-xs">tag</span> Orden</span><span class="font-bold text-[#590E2A]">{{ order.id }}</span></div>
              <div class="flex justify-between"><span class="text-[#590E2A]/50 flex items-center gap-1"><span class="material-icons text-xs">payment</span> Metodo</span><span class="font-bold text-[#D95578] uppercase">{{ order.metodoPago }}</span></div>
              <div class="flex justify-between"><span class="text-[#590E2A]/50 flex items-center gap-1"><span class="material-icons text-xs">attach_money</span> Total</span><span class="font-bold text-[#590E2A]">{{ '$' + order.total.toLocaleString('es-CO') }}</span></div>
              <div class="flex justify-between"><span class="text-[#590E2A]/50 flex items-center gap-1"><span class="material-icons text-xs">schedule</span> Entrega</span><span class="font-bold text-[#065F46]">45-60 min</span></div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 pt-2">
              <a routerLink="/perfil" [queryParams]="{tab: 'pedidos'}" class="flex-1 py-3 px-4 rounded-full bg-[#D95578] hover:bg-[#FF5277] text-white font-bold text-xs uppercase tracking-widest text-center flex items-center justify-center gap-1.5">
                <span class="material-icons text-sm">local_shipping</span> Seguir Pedido
              </a>
              <a routerLink="/productos" class="py-3 px-4 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] font-bold text-xs uppercase tracking-widest text-center hover:bg-[#FDF8F4] transition-colors">
                Seguir Comprando
              </a>
            </div>
          </div>
        }

      </div>

      <!-- New Address Modal -->
      @if (showNewAddressModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeNewAddressModal()">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-lg p-5 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-serif italic text-[#590E2A] font-bold flex items-center gap-2">
                <span class="material-icons text-[#D95578]">add_location_alt</span>
                Nueva Direccion
              </h3>
              <button (click)="closeNewAddressModal()" class="w-7 h-7 rounded-full bg-[#FDF8F4] flex items-center justify-center hover:bg-[#E8D8D0] transition-colors">
                <span class="material-icons text-[#590E2A] text-sm">close</span>
              </button>
            </div>

            <div class="relative rounded-xl overflow-hidden border border-[#E8D8D0]">
              <div class="absolute top-2 left-2 right-2 z-[1000]">
                <div class="relative">
                  <span class="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#590E2A]/40" style="font-size: 16px">search</span>
                  <input #mapSearchInput type="text" placeholder="Buscar direccion..."
                    (keydown.enter)="searchAddress(mapSearchInput.value)"
                    class="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/95 backdrop-blur border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] shadow-sm"/>
                  <button (click)="searchAddress(mapSearchInput.value)" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#D95578] flex items-center justify-center hover:bg-[#FF6078] transition-colors">
                    <span class="material-icons text-white" style="font-size: 14px">arrow_forward</span>
                  </button>
                </div>
              </div>

              <div id="checkout-address-map" class="w-full h-56"></div>
              @if (mapLoading()) {
                <div class="absolute inset-0 bg-white/70 flex items-center justify-center z-[999]">
                  <span class="material-icons animate-spin text-[#D95578]">refresh</span>
                </div>
              }
            </div>

            <p class="text-[10px] text-[#590E2A]/40 flex items-center gap-1">
              <span class="material-icons" style="font-size: 12px">info</span>
              Busca o haz clic en el mapa para colocar tu ubicacion
            </p>

            @if (mapAddress()) {
              <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center gap-2">
                <span class="material-icons text-[#2C5350]" style="font-size: 14px">check_circle</span>
                <p class="text-[11px] font-medium text-[#2C5350]">{{ mapAddress() }}</p>
              </div>
            }

            <div class="grid grid-cols-2 gap-3">
              <input #newAliasInput type="text" placeholder="Alias (Casa, Trabajo)" class="p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
              <input #newBarrioInput type="text" placeholder="Barrio" class="p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
            </div>

            <div class="flex gap-2">
              <button (click)="closeNewAddressModal()"
                class="flex-1 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#E8D8D0] transition-colors">
                Cancelar
              </button>
              <button (click)="saveNewAddress(newAliasInput, newBarrioInput)" [disabled]="!mapAddress()"
                class="flex-1 py-2.5 rounded-full bg-[#D95578] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#FF5277] disabled:opacity-30 transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- All Addresses Modal -->
      @if (showAllAddresses()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="showAllAddresses.set(false)">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-lg p-5 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-serif italic text-[#590E2A] font-bold flex items-center gap-2">
                <span class="material-icons text-[#D95578]">location_on</span>
                Seleccionar Direccion
              </h3>
              <button (click)="showAllAddresses.set(false)" class="w-7 h-7 rounded-full bg-[#FDF8F4] flex items-center justify-center hover:bg-[#E8D8D0] transition-colors">
                <span class="material-icons text-[#590E2A] text-sm">close</span>
              </button>
            </div>

            <div class="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              @for (dir of userAddresses(); track dir.id_direccion) {
                <button type="button" (click)="selectAddress(dir); showAllAddresses.set(false)"
                  class="w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3"
                  [class]="selectedAddressId() === dir.id_direccion
                    ? 'bg-[#D95578]/10 border-[#D95578]'
                    : 'bg-[#FDF8F4] border-[#E8D8D0]/60 hover:border-[#D95578]/40'">
                  <span class="material-icons text-lg"
                    [class]="selectedAddressId() === dir.id_direccion ? 'text-[#D95578]' : 'text-[#590E2A]/20'">
                    {{ selectedAddressId() === dir.id_direccion ? 'radio_button_checked' : 'radio_button_unchecked' }}
                  </span>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-[#590E2A] text-xs">{{ dir.alias || 'Direccion' }}</span>
                      @if (dir.predeterminada) {
                        <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-[#D95578] text-white font-bold">Principal</span>
                      }
                    </div>
                    <p class="text-[#590E2A]/60 text-[10px] truncate">{{ dir.direccion_completa }}</p>
                  </div>
                </button>
              }
            </div>

            <button type="button" (click)="showAllAddresses.set(false); openNewAddressModal()"
              class="w-full py-2.5 rounded-full border border-dashed border-[#E8D8D0] text-[10px] font-bold text-[#590E2A]/50 hover:border-[#D95578] hover:text-[#D95578] transition-all flex items-center justify-center gap-1">
              <span class="material-icons" style="font-size: 14px">add_circle_outline</span>
              Agregar nueva direccion
            </button>
          </div>
        </div>
      }

      <!-- No Coverage Modal -->
      @if (showNoCoverageModal()) {
        <div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closeNoCoverage()">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-sm p-6 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="w-14 h-14 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto">
              <span class="material-icons text-[#E65100]" style="font-size: 28px">warning</span>
            </div>
            <div class="text-center space-y-2">
              <h3 class="text-base font-serif italic text-[#590E2A] font-bold">Sin Cobertura en esta Zona</h3>
              <p class="text-[11px] text-[#590E2A]/60 leading-relaxed">
                La direccion seleccionada no esta dentro de nuestras zonas de envio. Para pedidos a nivel nacional, contactanos directamente.
              </p>
            </div>
            <div class="space-y-2">
              <a routerLink="/contacto" [queryParams]="{asunto: 'envio_nacional'}" (click)="closeNoCoverage()"
                class="w-full py-3 rounded-full bg-[#D95578] hover:bg-[#FF6078] text-white font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <span class="material-icons text-sm">mail</span>
                Contactar para Envio Nacional
              </a>
              <button (click)="closeNoCoverage()"
                class="w-full py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#E8D8D0] transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
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

  selectedAddressId = signal<number | null>(null);
  userAddresses = signal<Direccion[]>([]);
  stockErrors = signal<StockValidation[]>([]);

  selectedMethod = signal<PaymentMethodType>('pse');
  selectedBank = signal<string>('Bancolombia');
  activeSection = signal<'info' | 'payment'>('info');

  isProcessing = signal(false);
  createdOrder = signal<Order | null>(null);

  showNewAddressModal = signal(false);
  showAllAddresses = signal(false);
  showNoCoverageModal = signal(false);
  mapLoading = signal(false);
  mapAddress = signal('');
  private L: typeof import('leaflet') | null = null;
  private map: any = null;
  private marker: any = null;
  private LADORADA = { lat: 5.4530, lng: -74.6630 };

  private coverageEffect = effect(() => {
    const dir = this.clienteDireccion();
    if (!dir) return;
    const lower = dir.toLowerCase();
    const zones = ['la dorada', 'puerto salgar', 'purnio', 'guarinocito', 'honda', 'victoria'];
    const hasCoverage = zones.some(z => lower.includes(z));
    if (!hasCoverage) {
      this.showNoCoverageModal.set(true);
    }
  });

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
    this.cartService.updateDeliveryZone(dir.direccion_completa + ' ' + (dir.barrio || '') + ' ' + (dir.ciudad || ''));
    if (dir.instrucciones_entrega) {
      this.notasEspeciales.set(dir.instrucciones_entrega);
    }
  }

  async submitPayment() {
    if (!this.clienteNombre() || !this.clienteTelefono()) return;

    this.isProcessing.set(true);
    this.stockErrors.set([]);

    const allItems = this.cartService.items();
    const customItems = allItems.filter(i => i.configuracion_capas);
    const normalItems = allItems.filter(i => !i.configuracion_capas);

    // 1. Validate stock for all items
    const stockItems = allItems.map(i => ({
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
      const currentUser = this.supabaseService.activeUser();
      if (!currentUser) { this.isProcessing.set(false); return; }

      let sbOrderRes: { id_pedido: number; numero_pedido: string } | null = null;

      // 3. Create orders in Supabase
      if (normalItems.length > 0) {
        const stockItems = normalItems.map(i => ({
          id_producto: i.product.id,
          cantidad: i.cantidad,
          frase_personalizada: i.frase_personalizada || ''
        }));
        sbOrderRes = await this.supabaseService.crearPedidoConStock({
          p_id_usuario: currentUser.id,
          p_id_direccion: this.selectedAddressId() ?? undefined,
          p_productos: stockItems,
          p_metodo_pago: this.selectedMethod(),
          p_notas: this.notasEspeciales()
        });
      }

      if (customItems.length > 0) {
        const customProducts = customItems.map(i => ({
          id_producto: i.product.id,
          cantidad: i.cantidad,
          configuracion_capas: i.configuracion_capas!
        }));
        await this.supabaseService.crearPedidoVasoPersonalizado({
          p_id_usuario: currentUser.id,
          p_id_direccion: this.selectedAddressId() ?? undefined,
          p_productos: customProducts,
          p_metodo_pago: this.selectedMethod(),
          p_notas: this.notasEspeciales()
        });
      }

      // 4. Create local order for UI
      const order = await this.dataService.createOrder({
        id_usuario: currentUser.id,
        id_direccion: this.selectedAddressId() ?? undefined,
        cliente: {
          nombre: this.clienteNombre(),
          email: this.clienteEmail(),
          telefono: this.clienteTelefono(),
          direccion: this.clienteDireccion(),
          ciudad: 'La Dorada'
        },
        tipoEntrega: this.cartService.deliveryType(),
        items: allItems.map(i => ({
          productoId: i.product.id,
          nombreJapones: i.product.nombre_japones,
          nombreEspanol: i.product.nombre_espanol,
          precio: i.customPrice || i.product.precio,
          cantidad: i.cantidad,
          imagen: i.product.imagen_principal,
          frase_personalizada: i.frase_personalizada
        })),
        subtotal: this.cartService.subtotal(),
        costoEnvio: this.cartService.shippingCost(),
        descuento: 0,
        total: this.cartService.total(),
        metodoPago: this.selectedMethod(),
        estadoPago: 'aprobado',
        referenciaPago: paymentRes.transactionId,
        notasEspeciales: this.notasEspeciales(),
        tiempoEstimado: '45 - 60 minutos'
      }, sbOrderRes?.id_pedido);

      this.createdOrder.set(order);
      this.cartService.clearCart();

      // Recargar productos para actualizar stock en UI
      await this.dataService.loadAllFromSupabase();
    }

    this.isProcessing.set(false);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  async openNewAddressModal() {
    this.showNewAddressModal.set(true);
    await this.initMap();
    setTimeout(() => this.openMap(), 100);
  }

  closeNewAddressModal() {
    this.showNewAddressModal.set(false);
    this.mapAddress.set('');
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  closeNoCoverage() {
    this.showNoCoverageModal.set(false);
    this.selectedAddressId.set(null);
    this.clienteDireccion.set('');
  }

  private async initMap() {
    if (this.L) return;
    this.L = await import('leaflet');
  }

  private async openMap() {
    await this.initMap();
    if (!this.L) return;

    setTimeout(() => {
      const container = document.getElementById('checkout-address-map');
      if (!container) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = this.L!.map('checkout-address-map').setView(
        [this.LADORADA.lat, this.LADORADA.lng], 15
      );

      this.L!.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);

      const icon = this.L!.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      this.marker = this.L!.marker([this.LADORADA.lat, this.LADORADA.lng], { icon }).addTo(this.map);

      this.map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        this.marker!.setLatLng([lat, lng]);
        this.reverseGeocode(lat, lng);
      });

      setTimeout(() => this.map?.invalidateSize(), 100);
    }, 100);
  }

  async reverseGeocode(lat: number, lng: number) {
    this.mapLoading.set(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`);
      const data = await res.json();
      if (data?.display_name) {
        this.mapAddress.set(data.display_name);
      }
    } catch {
      this.mapAddress.set(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    this.mapLoading.set(false);
  }

  async searchAddress(query: string) {
    if (!query || query.length < 3) return;
    this.mapLoading.set(true);
    try {
      let searchQuery = `${query}, Caldas, Colombia`;
      let res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=es`);
      let data = await res.json();

      if (!data || data.length === 0) {
        searchQuery = `${query}, Colombia`;
        res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=es`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        this.mapAddress.set(display_name);
        if (this.map && this.marker && this.L) {
          this.marker.setLatLng([lat, lon]);
          this.map.setView([lat, lon], 16);
        }
      }
    } catch {}
    this.mapLoading.set(false);
  }

  async saveNewAddress(aliasInput: HTMLInputElement, barrioInput: HTMLInputElement) {
    const u = this.supabaseService.activeUser();
    if (!u || !this.mapAddress()) return;

    const alias = aliasInput.value || 'Mi Dirección';
    const barrio = barrioInput.value || 'Centro';
    const isPrincipal = this.userAddresses().length === 0;

    await this.supabaseService.addDireccion({
      id_usuario: u.id,
      alias,
      direccion_completa: this.mapAddress(),
      barrio,
      ciudad: 'La Dorada',
      departamento: 'Caldas',
      codigo_postal: '175031',
      predeterminada: isPrincipal
    });

    const addresses = await this.supabaseService.obtenerDireccionesUsuario(u.id);
    this.userAddresses.set(addresses);

    const newDir = addresses[addresses.length - 1];
    if (newDir) {
      this.selectAddress(newDir);
    }

    this.closeNewAddressModal();
  }
}

