import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { CartService } from '../../services/cart.service';
import { Product, POSSale, DeliveryZone, getDeliveryPrice, detectZoneFromAddress } from '../../models/mochi.models';
import type * as L from 'leaflet';

interface POSCartItem {
  product: Product;
  cantidad: number;
  configuracion_capas?: any;
  customPrice?: number;
  frase_personalizada?: string;
}

@Component({
  selector: 'app-pos-employee',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col gap-3 overflow-hidden">

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 items-stretch">

        <!-- Left: Products -->
        <div class="lg:col-span-7 bg-white rounded-[28px] border border-[#E8D8D0] p-5 flex flex-col shadow-xs min-h-0">

          <!-- Search -->
          <div class="relative mb-4">
            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/25 text-lg">search</span>
            <input
              type="text"
              placeholder="Buscar postre..."
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              class="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-xs text-[#590E2A] placeholder-[#590E2A]/25 focus:outline-none focus:border-[#D95578] transition-colors"
            />
          </div>

          <!-- Products Grid -->
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-2.5 flex-1 overflow-y-auto pr-1 min-h-0 content-start">
            @for (prod of filteredProducts(); track prod.id) {
              <button
                (click)="addToPOSCart(prod)"
                class="p-2.5 rounded-[20px] bg-[#FDF8F4] border border-[#E8D8D0] hover:border-[#D95578] hover:shadow-md text-left transition-all active:scale-95 group">
                <div class="w-full aspect-square rounded-[14px] overflow-hidden mb-2 bg-[#E8D8D0]/30">
                  <img [src]="prod.imagen_principal" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                </div>
                <h3 class="text-[10px] font-serif italic text-[#590E2A] group-hover:text-[#D95578] transition-colors line-clamp-1 leading-tight">
                  {{ prod.nombre_espanol }}
                </h3>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-[11px] font-bold text-[#590E2A]">
                    {{ '$' + prod.precio.toLocaleString('es-CO') }}
                  </span>
                  <span [class]="prod.stock <= 5 ? 'text-red-500' : 'text-[#590E2A]/25'" class="text-[8px] font-bold">
                    {{ prod.stock }}
                  </span>
                </div>
              </button>
            }

            <!-- Personalizado Button -->
            <a routerLink="/empleado/personalizar-vaso"
              class="p-2.5 rounded-[20px] bg-gradient-to-br from-[#D95578] to-[#A33D5E] hover:shadow-md text-left transition-all active:scale-95 group">
              <div class="w-full aspect-square rounded-[14px] flex items-center justify-center mb-2">
                <span class="material-icons text-white/30 text-3xl group-hover:scale-110 transition-transform">local_cafe</span>
              </div>
              <h3 class="text-[10px] font-serif italic text-white leading-tight">Personalizado</h3>
              <span class="text-[8px] text-white/50 mt-0.5 block">Configurar</span>
            </a>
          </div>
        </div>

        <!-- Right: Ticket -->
        <div class="lg:col-span-5 bg-white rounded-[28px] border border-[#E8D8D0] p-5 flex flex-col shadow-xs min-h-0">

          <!-- Ticket Header -->
          <div class="flex items-center justify-between pb-3 border-b border-[#E8D8D0]">
            <div class="flex items-center gap-2">
              <span class="material-icons text-[#D95578] text-lg">receipt</span>
              <span class="text-sm font-serif italic text-[#590E2A]">Ticket</span>
            </div>
            @if (cartService.posItems().length > 0) {
              <button (click)="cartService.posItems.set([])" class="flex items-center gap-1 text-[10px] text-[#590E2A]/40 hover:text-red-500 font-bold uppercase tracking-wider transition-colors">
                <span class="material-icons text-xs">delete_sweep</span> Vaciar
              </button>
            }
          </div>

          <!-- Tipo Pedido Toggle -->
          <div class="pt-3 pb-2">
            <div class="flex bg-[#FDF8F4] rounded-xl p-1 border border-[#E8D8D0]">
              <button (click)="tipoPedido.set('local')"
                class="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                [class]="tipoPedido() === 'local' ? 'bg-[#590E2A] text-white shadow-xs' : 'text-[#590E2A]/50 hover:text-[#590E2A]'">
                <span class="material-icons text-sm">store</span> Local
              </button>
              <button (click)="tipoPedido.set('domicilio')"
                class="flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                [class]="tipoPedido() === 'domicilio' ? 'bg-[#D95578] text-white shadow-xs' : 'text-[#590E2A]/50 hover:text-[#590E2A]'">
                <span class="material-icons text-sm">delivery_dining</span> Domicilio
              </button>
            </div>
          </div>

          <!-- Delivery Fields (only when domicilio) -->
          @if (tipoPedido() === 'domicilio') {
            <div class="pb-2 space-y-2 border-b border-[#E8D8D0]/50">
              <div class="relative">
                <span class="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#590E2A]/25 text-sm">person</span>
                <input type="text" placeholder="Nombre cliente *"
                  [value]="clienteNombre()"
                  (input)="clienteNombre.set($any($event.target).value)"
                  [class]="clienteNombre() ? 'w-full pl-8 pr-3 py-2 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[11px] text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-[#D95578] font-medium' : 'w-full pl-8 pr-3 py-2 rounded-xl bg-[#FDF8F4] border border-red-300 text-[11px] text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-red-400 font-medium'" />
              </div>
              <div class="relative">
                <span class="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#590E2A]/25 text-sm">phone</span>
                <input type="text" placeholder="Telefono (min. 10 digitos) *"
                  [value]="clienteTelefono()"
                  (input)="clienteTelefono.set($any($event.target).value)"
                  [class]="!clienteTelefono() ? 'w-full pl-8 pr-3 py-2 rounded-xl bg-[#FDF8F4] border border-red-300 text-[11px] text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-red-400 font-medium' : clienteTelefono().replace(/\D/g, '').length < 10 ? 'w-full pl-8 pr-3 py-2 rounded-xl bg-[#FDF8F4] border border-red-300 text-[11px] text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-red-400 font-medium' : 'w-full pl-8 pr-3 py-2 rounded-xl bg-[#FDF8F4] border border-[#065F46] text-[11px] text-[#590E2A] placeholder-[#590E2A]/30 focus:outline-none focus:border-[#D95578] font-medium'" />
              </div>
              <button (click)="openAddressModal()"
                class="w-full py-2 rounded-xl border border-dashed text-[10px] hover:border-[#D95578] hover:text-[#D95578] transition-all flex items-center justify-center gap-1.5"
                [class]="clienteDireccion() ? 'border-[#065F46] text-[#065F46]' : 'border-red-300 text-red-400'">
                @if (clienteDireccion()) {
                  <span class="material-icons text-sm">check_circle</span>
                  <span class="font-bold truncate max-w-[180px]">{{ clienteDireccion() }}</span>
                } @else {
                  <span class="material-icons text-sm">add_location_alt</span>
                  Seleccionar direccion en mapa *
                }
              </button>
            </div>
          }

          <!-- Items List -->
          <div class="space-y-1.5 flex-1 overflow-y-auto py-3 min-h-0">
            @for (item of cartService.posItems(); track $index) {
              <div class="p-2.5 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0]">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-white border border-[#E8D8D0]">
                    <img [src]="item.product.imagen_principal" alt="" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[11px] font-serif italic text-[#590E2A] truncate">{{ item.product.nombre_espanol }}</span>
                      @if (item.configuracion_capas) {
                        <span class="material-icons text-[#D95578] text-[10px]">auto_awesome</span>
                      }
                    </div>
                    <span class="text-[9px] text-[#590E2A]/40 font-bold">{{ '$' + (item.customPrice || item.product.precio).toLocaleString('es-CO') }} c/u</span>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button (click)="openPhraseModal($index)"
                      class="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
                      [class]="item.frase_personalizada ? 'bg-[#D95578] text-white' : 'bg-white border border-[#E8D8D0] text-[#590E2A]/40 hover:text-[#D95578] hover:border-[#D95578]'">
                      <span class="material-icons text-[12px]">mode_edit</span>
                    </button>
                    <button (click)="updatePOSQty($index, -1)"
                      class="w-6 h-6 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] flex items-center justify-center text-[10px] font-bold hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-colors">
                      <span class="material-icons text-[12px]">remove</span>
                    </button>
                    <span class="w-5 text-center font-bold text-[11px] text-[#590E2A] font-mono">{{ item.cantidad }}</span>
                    <button (click)="updatePOSQty($index, 1)"
                      class="w-6 h-6 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] flex items-center justify-center text-[10px] font-bold hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-colors">
                      <span class="material-icons text-[12px]">add</span>
                    </button>
                  </div>
                </div>
                @if (item.frase_personalizada) {
                  <div class="mt-1.5 ml-[52px] px-2 py-0.5 rounded-lg bg-[#D95578]/10 text-[9px] text-[#D95578] italic flex items-center gap-1">
                    <span class="material-icons text-[10px]">format_quote</span>
                    {{ item.frase_personalizada }}
                  </div>
                }
              </div>
            } @empty {
              <div class="flex flex-col items-center justify-center py-12 text-[#590E2A]/20">
                <span class="material-icons text-4xl mb-2">shopping_bag</span>
                <span class="text-[10px] uppercase tracking-wider font-bold">Sin productos</span>
              </div>
            }
          </div>

          <!-- Payment Methods -->
          <div class="pt-3 border-t border-[#E8D8D0]">
            <div class="grid grid-cols-4 gap-1.5">
              <button
                (click)="metodoPago.set('efectivo')"
                [class]="metodoPago() === 'efectivo' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">payments</span>
                <span class="text-[8px] font-bold uppercase">Efectivo</span>
              </button>
              <button
                (click)="metodoPago.set('tarjeta')"
                [class]="metodoPago() === 'tarjeta' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">credit_card</span>
                <span class="text-[8px] font-bold uppercase">Tarjeta</span>
              </button>
              <button
                (click)="metodoPago.set('nequi')"
                [class]="metodoPago() === 'nequi' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">smartphone</span>
                <span class="text-[8px] font-bold uppercase">Nequi</span>
              </button>
              <button
                (click)="metodoPago.set('daviplata')"
                [class]="metodoPago() === 'daviplata' ? 'bg-[#D95578] text-white border-[#D95578]' : 'bg-[#FDF8F4] text-[#590E2A]/60 border-[#E8D8D0]'"
                class="py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 hover:opacity-80">
                <span class="material-icons text-sm">account_balance_wallet</span>
                <span class="text-[8px] font-bold uppercase">Daviplata</span>
              </button>
            </div>
          </div>

          <!-- Total & CTA -->
          <div class="pt-3 border-t border-[#E8D8D0] space-y-3">
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <span class="text-[10px] text-[#590E2A]/40 uppercase tracking-wider font-bold">Subtotal</span>
                <span class="text-sm font-serif italic text-[#590E2A]">{{ '$' + posSubtotal().toLocaleString('es-CO') }}</span>
              </div>
              @if (tipoPedido() === 'domicilio' && posShippingCost() > 0) {
                <div class="flex justify-between items-center">
                  <span class="text-[10px] text-[#590E2A]/40 uppercase tracking-wider font-bold flex items-center gap-1">
                    <span class="material-icons" style="font-size: 12px">local_shipping</span>
                    Envio ({{ posDeliveryZone() }})
                  </span>
                  <span class="text-sm font-serif italic text-[#E65100]">{{ '$' + posShippingCost().toLocaleString('es-CO') }}</span>
                </div>
              }
              <div class="flex justify-between items-center pt-1 border-t border-[#E8D8D0]/50">
                <span class="text-[10px] text-[#590E2A]/40 uppercase tracking-wider font-bold">Total</span>
                <span class="text-2xl font-serif italic text-[#D95578] font-bold">{{ '$' + posTotal().toLocaleString('es-CO') }}</span>
              </div>
            </div>
            <button
              [disabled]="cartService.posItems().length === 0 || processing() || (tipoPedido() === 'domicilio' && (!clienteNombre() || !clienteTelefono() || clienteTelefono().replace(/\D/g, '').length < 10 || !clienteDireccion()))"
              (click)="recordSale()"
              class="w-full py-3.5 rounded-full bg-[#D95578] hover:bg-[#FF6078] disabled:opacity-30 text-white font-bold text-[11px] uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2">
              @if (processing()) {
                <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"></circle>
                  <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" class="opacity-75"></path>
                </svg>
                <span>Procesando...</span>
              } @else {
                <span class="material-icons text-base">check_circle</span>
                <span>{{ tipoPedido() === 'domicilio' ? 'Registrar Domicilio' : 'Cobrar' }}</span>
              }
            </button>
          </div>

        </div>

      </div>

      <!-- Last Sale Toast -->
      @if (lastSale()) {
        @let sale = lastSale()!;
        <div class="fixed bottom-6 right-6 bg-white rounded-[24px] border border-[#E8D8D0] p-5 w-80 space-y-3 shadow-lg z-50">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="material-icons text-[#065F46]">check_circle</span>
              <span class="text-xs font-bold text-[#590E2A]">{{ sale.tipoPedido === 'domicilio' ? 'Domicilio Registrado' : 'Venta Registrada' }}</span>
            </div>
            <button (click)="lastSale.set(null)" class="text-[#590E2A]/30 hover:text-[#590E2A] transition-colors">
              <span class="material-icons text-sm">close</span>
            </button>
          </div>
          <div class="p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-1 text-[10px]">
            <div class="flex justify-between">
              <span class="text-[#590E2A]/40">Ticket</span>
              <span class="font-bold text-[#590E2A]">#{{ sale.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#590E2A]/40">Tipo</span>
              <span class="font-bold" [class]="sale.tipoPedido === 'domicilio' ? 'text-[#D95578]' : 'text-[#590E2A]'">{{ sale.tipoPedido === 'domicilio' ? 'Domicilio' : 'Local' }}</span>
            </div>
            @if (sale.tipoPedido === 'domicilio') {
              <div class="flex justify-between">
                <span class="text-[#590E2A]/40">Cliente</span>
                <span class="font-bold text-[#590E2A]">{{ sale.clienteNombre }}</span>
              </div>
            }
            <div class="flex justify-between font-bold text-sm text-[#D95578] pt-1.5 border-t border-[#E8D8D0]">
              <span>Cobrado</span>
              <span>{{ '$' + sale.total.toLocaleString('es-CO') }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Address Map Modal -->
      @if (showAddressModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="showAddressModal.set(false)">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-lg p-5 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-serif italic text-[#590E2A] font-bold flex items-center gap-2">
                <span class="material-icons text-[#D95578]">map</span>
                Seleccionar Direccion
              </h3>
              <button (click)="showAddressModal.set(false)" class="w-7 h-7 rounded-full bg-[#FDF8F4] flex items-center justify-center hover:bg-[#E8D8D0] transition-colors">
                <span class="material-icons text-[#590E2A] text-sm">close</span>
              </button>
            </div>

            <div id="pos-address-map" class="w-full h-64 rounded-2xl border border-[#E8D8D0] overflow-hidden"></div>

            <div class="space-y-2">
              <div class="flex items-center gap-2 text-[10px] text-[#590E2A]/50">
                <span class="material-icons text-xs">info</span>
                Haz clic en el mapa para colocar el marcador
              </div>
              <input type="text" placeholder="Direccion seleccionada"
                [value]="clienteDireccion()"
                (input)="clienteDireccion.set($any($event.target).value)"
                class="w-full px-3 py-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[11px] text-[#590E2A] focus:outline-none focus:border-[#D95578] font-medium" />
            </div>

            <div class="flex gap-2">
              <button (click)="showAddressModal.set(false)"
                class="flex-1 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#E8D8D0] transition-colors">
                Cancelar
              </button>
              <button (click)="confirmAddress()"
                class="flex-1 py-2.5 rounded-full bg-[#D95578] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#FF5277] transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Phrase Modal -->
      @if (showPhraseModal()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="closePhraseModal()">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-sm p-5 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-serif italic text-[#590E2A] font-bold flex items-center gap-2">
                <span class="material-icons text-[#D95578]">mode_edit</span>
                Frase Personalizada
              </h3>
              <button (click)="closePhraseModal()" class="w-7 h-7 rounded-full bg-[#FDF8F4] flex items-center justify-center hover:bg-[#E8D8D0] transition-colors">
                <span class="material-icons text-[#590E2A] text-sm">close</span>
              </button>
            </div>

            <textarea rows="3"
              [value]="phraseText()"
              (input)="phraseText.set($any($event.target).value)"
              placeholder="Ej. Feliz cumpleaños, con amor..."
              class="w-full px-3 py-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[11px] text-[#590E2A] focus:outline-none focus:border-[#D95578] font-medium resize-none">
            </textarea>

            <div class="flex gap-2">
              <button (click)="closePhraseModal()"
                class="flex-1 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#E8D8D0] transition-colors">
                Cancelar
              </button>
              <button (click)="savePhrase()"
                class="flex-1 py-2.5 rounded-full bg-[#D95578] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#FF5277] transition-colors">
                Guardar
              </button>
            </div>
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
                La direccion ingresada no esta dentro de nuestras zonas de envio. Para pedidos a nivel nacional, contactanos directamente.
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
export class PosEmployeePageComponent implements OnInit, AfterViewInit, OnDestroy {
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  cartService = inject(CartService);
  Number = Number;

  searchQuery = signal('');
  metodoPago = signal<'efectivo' | 'tarjeta' | 'nequi' | 'daviplata'>('efectivo');
  tipoPedido = signal<'local' | 'domicilio'>('local');
  clienteNombre = signal('');
  clienteTelefono = signal('');
  clienteDireccion = signal('');
  showAddressModal = signal(false);
  showPhraseModal = signal(false);
  showNoCoverageModal = signal(false);
  editingProductId = signal<number | null>(null);
  phraseText = signal('');
  mapLoading = signal(false);
  mapSearchQuery = signal('');
  processing = signal(false);

  private coverageEffect = effect(() => {
    const hasCoverage = this.posHasCoverage();
    const dir = this.clienteDireccion();
    const tipo = this.tipoPedido();
    if (tipo === 'domicilio' && dir && !hasCoverage) {
      this.showNoCoverageModal.set(true);
    }
  });

  lastSale = signal<POSSale | null>(null);

  private L: typeof import('leaflet') | null = null;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private readonly LADORADA = { lat: 5.4530, lng: -74.6630 };

  ngOnInit() {
    const pending = this.cartService.pendingCustomCup();
    if (pending) {
      const current = this.cartService.posItems();
      this.cartService.posItems.set([...current, {
        product: pending.product,
        cantidad: pending.cantidad,
        configuracion_capas: pending.configuracion_capas,
        customPrice: pending.customPrice
      }]);
      this.cartService.pendingCustomCup.set(null);
    }
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private async initMap() {
    if (this.L) return;
    this.L = await import('leaflet');
  }

  private async openMap() {
    await this.initMap();
    if (!this.L) return;

    setTimeout(() => {
      const container = document.getElementById('pos-address-map');
      if (!container) return;

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = this.L!.map('pos-address-map').setView(
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

      this.map.on('click', (e: L.LeafletMouseEvent) => {
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
        this.clienteDireccion.set(data.display_name);
      }
    } catch {
      this.clienteDireccion.set(`${lat.toFixed(5)}, ${lng.toFixed(5)} - La Dorada, Caldas`);
    }
    this.mapLoading.set(false);
  }

  async openAddressModal() {
    this.showAddressModal.set(true);
    await this.openMap();
  }

  confirmAddress() {
    this.showAddressModal.set(false);
  }

  openPhraseModal(itemIndex: number) {
    const item = this.cartService.posItems()[itemIndex];
    if (!item) return;
    this.editingProductId.set(itemIndex);
    this.phraseText.set(item.frase_personalizada || '');
    this.showPhraseModal.set(true);
  }

  savePhrase() {
    const idx = this.editingProductId();
    if (idx === null) return;
    const current = this.cartService.posItems();
    if (idx >= 0 && idx < current.length) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], frase_personalizada: this.phraseText() || undefined };
      this.cartService.posItems.set(updated);
    }
    this.showPhraseModal.set(false);
  }

  closePhraseModal() {
    this.showPhraseModal.set(false);
    this.editingProductId.set(null);
    this.phraseText.set('');
  }

  closeNoCoverage() {
    this.showNoCoverageModal.set(false);
    this.clienteDireccion.set('La Dorada, Caldas');
    this.tipoPedido.set('local');
  }

  selectedEmpleado = computed(() => {
    return this.supabaseService.usuarios().find(u => u.rol === 'empleado') || this.supabaseService.usuarios()[1];
  });

  filteredProducts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.dataService.activeProducts().filter(p => p.id !== 25);
    if (!q) return list;
    return list.filter(p =>
      p.nombre_espanol.toLowerCase().includes(q) ||
      p.nombre_japones.toLowerCase().includes(q)
    );
  });

  posSubtotal = computed(() => {
    return this.cartService.posItems().reduce((sum, item) => {
      const p = item.customPrice || item.product.precio;
      return sum + (p * item.cantidad);
    }, 0);
  });

  posDeliveryZone = computed<DeliveryZone>(() => {
    if (this.tipoPedido() !== 'domicilio') return 'La Dorada';
    const dir = this.clienteDireccion();
    if (!dir) return 'La Dorada';
    return detectZoneFromAddress(dir);
  });

  posHasCoverage = computed(() => {
    if (this.tipoPedido() !== 'domicilio') return true;
    const dir = this.clienteDireccion();
    if (!dir) return true;
    const lower = dir.toLowerCase();
    const zones = ['la dorada', 'puerto salgar', 'purnio', 'guarinocito', 'honda', 'victoria'];
    return zones.some(z => lower.includes(z));
  });

  posShippingCost = computed(() => {
    if (this.tipoPedido() !== 'domicilio') return 0;
    const totalQty = this.cartService.posItems().reduce((sum, item) => sum + item.cantidad, 0);
    return getDeliveryPrice(this.posDeliveryZone(), totalQty);
  });

  posTotal = computed(() => {
    return this.posSubtotal() + this.posShippingCost();
  });

  todaySalesTotal = computed(() => {
    return this.dataService.posSales().reduce((sum, s) => sum + s.total, 0);
  });

  todaySalesCount = computed(() => {
    return this.dataService.posSales().length;
  });

  addToPOSCart(product: Product) {
    const current = this.cartService.posItems();
    const idx = current.findIndex(i => i.product.id === product.id && !i.frase_personalizada);
    if (idx > -1) {
      const updated = [...current];
      updated[idx].cantidad += 1;
      this.cartService.posItems.set(updated);
    } else {
      this.cartService.posItems.set([...current, { product, cantidad: 1 }]);
    }
  }

  updatePOSQty(itemIndex: number, delta: number) {
    const current = this.cartService.posItems();
    if (itemIndex < 0 || itemIndex >= current.length) return;
    const newQty = current[itemIndex].cantidad + delta;
    if (newQty <= 0) {
      this.cartService.posItems.set(current.filter((_, i) => i !== itemIndex));
    } else {
      const updated = [...current];
      updated[itemIndex].cantidad = newQty;
      this.cartService.posItems.set(updated);
    }
  }

  async recordSale() {
    if (this.cartService.posItems().length === 0) return;
    if (this.tipoPedido() === 'domicilio' && (!this.clienteNombre() || !this.clienteTelefono() || this.clienteTelefono().replace(/\D/g, '').length < 10 || !this.clienteDireccion())) return;

    this.processing.set(true);
    try {
      const emp = this.selectedEmpleado();
      const sale = await this.dataService.recordPOSSale({
        id_empleado: emp?.id,
        empleado: emp?.nombre_completo || 'Neider Gómez',
        clienteNombre: this.tipoPedido() === 'domicilio' ? this.clienteNombre() : 'Cliente Local',
        clienteTelefono: this.tipoPedido() === 'domicilio' ? this.clienteTelefono() : '',
        clienteDireccion: this.tipoPedido() === 'domicilio' ? this.clienteDireccion() : '',
        tipoPedido: this.tipoPedido(),
        items: this.cartService.posItems().map(i => ({
          productoId: i.product.id,
          nombre: i.product.nombre_espanol,
          cantidad: i.cantidad,
          precio: i.customPrice || i.product.precio,
          frase_personalizada: i.frase_personalizada || ''
        })),
        subtotal: this.posSubtotal(),
        costoEnvio: this.posShippingCost(),
        total: this.posTotal(),
        metodoPago: this.metodoPago()
      });

      this.lastSale.set(sale);
      this.cartService.posItems.set([]);
      this.clienteNombre.set('');
      this.clienteTelefono.set('');
      this.clienteDireccion.set('');
      this.tipoPedido.set('local');
    } finally {
      this.processing.set(false);
    }
  }
}
