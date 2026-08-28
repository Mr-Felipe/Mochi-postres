import { Component, inject, signal, computed, effect, ChangeDetectionStrategy, OnDestroy, NgZone, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { MochiDataService } from '../../services/mochi-data.service';
import { CartService } from '../../services/cart.service';
import { Direccion, detectZoneFromAddress, DeliveryZone } from '../../models/mochi.models';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import type * as L from 'leaflet';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-[#FDF8F4] py-8 px-4">
      <div class="max-w-4xl mx-auto space-y-6">

        @if (user(); as u) {
          <!-- Header Card -->
          <div class="bg-white rounded-3xl border border-[#E8D8D0] shadow-sm p-6 sm:p-8">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              @if (u.foto_perfil) {
                <img [src]="u.foto_perfil" class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg shrink-0">
              } @else {
                <div class="w-24 h-24 rounded-full bg-[#D95578] border-4 border-white flex items-center justify-center text-white text-4xl font-serif italic font-bold shadow-lg shrink-0">
                  {{ u.nombre_completo?.charAt(0) || '?' }}
                </div>
              }
              <div class="flex-1 text-center sm:text-left min-w-0">
                <h1 class="text-2xl font-serif italic text-[#590E2A] font-bold">{{ u.nombre_completo }}</h1>
                <p class="text-sm text-[#590E2A]/60 mt-1">{{ u.email }}</p>
                <p class="text-sm text-[#590E2A]/60">{{ u.telefono || 'Sin telefono' }}</p>
                <span class="inline-block mt-3 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  [class]="u.rol === 'admin' ? 'bg-[#590E2A]/10 text-[#590E2A]' : u.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'">
                  {{ u.rol }}
                </span>
              </div>
              <button (click)="startEdit()" class="px-5 py-2.5 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] text-xs font-bold hover:bg-[#FDF8F4] transition-colors flex items-center gap-2 shrink-0">
                <span class="material-icons" style="font-size: 14px">edit</span> Editar
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white rounded-3xl border border-[#E8D8D0] shadow-sm overflow-hidden">
            <div class="flex border-b border-[#E8D8D0]">
              <button (click)="activeTab.set('cuenta')" class="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                [class]="activeTab() === 'cuenta' ? 'border-[#590E2A] text-[#590E2A] bg-[#590E2A]/5' : 'border-transparent text-[#590E2A]/40 hover:text-[#590E2A]/60'">
                <span class="material-icons" style="font-size: 16px">person</span>
                Mi Cuenta
              </button>
              <button (click)="activeTab.set('direcciones')" class="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                [class]="activeTab() === 'direcciones' ? 'border-[#590E2A] text-[#590E2A] bg-[#590E2A]/5' : 'border-transparent text-[#590E2A]/40 hover:text-[#590E2A]/60'">
                <span class="material-icons" style="font-size: 16px">location_on</span>
                Direcciones
              </button>
              <button (click)="activeTab.set('pedidos')" class="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-colors border-b-2"
                [class]="activeTab() === 'pedidos' ? 'border-[#590E2A] text-[#590E2A] bg-[#590E2A]/5' : 'border-transparent text-[#590E2A]/40 hover:text-[#590E2A]/60'">
                <span class="material-icons" style="font-size: 16px">receipt_long</span>
                Pedidos
              </button>
            </div>

            <div class="p-6 sm:p-8">

              <!-- ===================== TAB: MI CUENTA ===================== -->
              @if (activeTab() === 'cuenta') {
                <div class="space-y-6">
                  <!-- Info Personal -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-9 h-9 rounded-xl bg-[#D95578]/10 flex items-center justify-center">
                        <span class="material-icons text-[#D95578]" style="font-size: 18px">person</span>
                      </div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Información Personal</h2>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">email</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Correo</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A]">{{ u.email }}</p>
                      </div>
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">phone</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Teléfono</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A]">{{ u.telefono || 'No registrado' }}</p>
                      </div>
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">badge</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Rol</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A] capitalize">{{ u.rol }}</p>
                      </div>
                      <div class="bg-[#FDF8F4] rounded-2xl p-4">
                        <div class="flex items-center gap-2 mb-1">
                          <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">calendar_today</span>
                          <span class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50">Miembro desde</span>
                        </div>
                        <p class="text-sm font-bold text-[#590E2A]">{{ u.created_at ? (u.created_at | date:'mediumDate') : 'N/A' }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Seguridad -->
                  <div>
                    <div class="flex items-center gap-3 mb-5">
                      <div class="w-9 h-9 rounded-xl bg-[#E0F2F1] flex items-center justify-center">
                        <span class="material-icons text-[#2C5350]" style="font-size: 18px">lock</span>
                      </div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Seguridad</h2>
                    </div>

                    <div class="bg-[#FDF8F4] rounded-2xl p-4 mb-4">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <span class="material-icons text-[#590E2A]/40" style="font-size: 20px">key</span>
                          <div>
                            <p class="text-sm font-bold text-[#590E2A]">Contraseña</p>
                            <p class="text-[10px] text-[#590E2A]/50">Protege tu cuenta con una contraseña segura</p>
                          </div>
                        </div>
                        <button (click)="showPasswordForm.set(!showPasswordForm())"
                          class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                          [class]="showPasswordForm() ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#590E2A] text-[#FDF8F4] hover:bg-[#3A0A1C]'">
                          {{ showPasswordForm() ? 'Cancelar' : 'Cambiar' }}
                        </button>
                      </div>
                    </div>

                    @if (showPasswordForm()) {
                      <div class="space-y-3">
                        @if (passwordSuccess()) {
                          <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center gap-2">
                            <span class="material-icons text-[#004D40]" style="font-size: 16px">check_circle</span>
                            <p class="text-xs font-medium text-[#004D40]">Contraseña actualizada exitosamente.</p>
                          </div>
                        }
                        @if (passwordError()) {
                          <div class="p-3 rounded-xl bg-[#FFEBEE] border border-[#FFCDD2] flex items-center gap-2">
                            <span class="material-icons text-[#C62828]" style="font-size: 16px">error</span>
                            <p class="text-xs font-medium text-[#C62828]">{{ passwordError() }}</p>
                          </div>
                        }
                        <form (submit)="onPasswordChange($event)" class="space-y-3">
                          <div class="relative">
                            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30" style="font-size: 16px">lock_outline</span>
                            <input type="password" placeholder="Nueva contraseña (min. 6 caracteres)" [value]="newPassword()" (input)="newPassword.set($any($event.target).value)" required minlength="6"
                              class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors"/>
                          </div>
                          <div class="relative">
                            <span class="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#590E2A]/30" style="font-size: 16px">lock_outline</span>
                            <input type="password" placeholder="Confirmar contraseña" [value]="confirmPassword()" (input)="confirmPassword.set($any($event.target).value)" required minlength="6"
                              class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] transition-colors"/>
                          </div>
                          <button type="submit" [disabled]="passwordLoading()"
                            class="w-full py-3 rounded-xl bg-[#590E2A] hover:bg-[#3A0A1C] disabled:opacity-50 text-[#FDF8F4] font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            @if (passwordLoading()) {
                              <span class="material-icons animate-spin" style="font-size: 14px">refresh</span>
                            }
                            {{ passwordLoading() ? 'Guardando...' : 'Guardar Contraseña' }}
                          </button>
                        </form>
                      </div>
                    }
                  </div>

                  <!-- Cerrar Sesión -->
                  <button (click)="onLogout()" class="w-full py-3.5 rounded-2xl bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                    <span class="material-icons" style="font-size: 16px">logout</span>
                    Cerrar Sesión
                  </button>
                </div>
              }

              <!-- ===================== TAB: DIRECCIONES ===================== -->
              @if (activeTab() === 'direcciones') {
                <div class="space-y-5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-[#F3E5F5] flex items-center justify-center">
                        <span class="material-icons text-[#8E24AA]" style="font-size: 18px">location_on</span>
                      </div>
                      <div>
                        <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Mis Direcciones</h2>
                        <p class="text-[10px] text-[#590E2A]/50">{{ userAddresses().length }} direcciones guardadas</p>
                      </div>
                    </div>
                    <button (click)="showNewAddress.set(!showNewAddress())"
                      class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors"
                      [class]="showNewAddress() ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#D95578] text-white hover:bg-[#FF6078]'">
                      {{ showNewAddress() ? 'Cancelar' : '+ Nueva' }}
                    </button>
                  </div>

                  @if (showNewAddress()) {
                    <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-3">
                      <p class="text-xs font-bold text-[#590E2A]">Nueva Dirección</p>

                      <!-- Map -->
                      <div class="relative rounded-xl overflow-hidden border border-[#E8D8D0]">
                        <!-- Search Bar on Map -->
                        <div class="absolute top-2 left-2 right-2 z-[1000]">
                          <div class="relative">
                            <span class="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#590E2A]/40" style="font-size: 16px">search</span>
                            <input #mapSearchInput type="text" placeholder="Buscar dirección..."
                              (keydown.enter)="searchAddress(mapSearchInput.value)"
                              class="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white/95 backdrop-blur border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578] shadow-sm"/>
                            <button (click)="searchAddress(mapSearchInput.value)" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#D95578] flex items-center justify-center hover:bg-[#FF6078] transition-colors">
                              <span class="material-icons text-white" style="font-size: 14px">arrow_forward</span>
                            </button>
                          </div>
                        </div>

                        <div id="address-map" class="w-full h-56"></div>
                        @if (mapLoading()) {
                          <div class="absolute inset-0 bg-white/70 flex items-center justify-center z-[999]">
                            <span class="material-icons animate-spin text-[#D95578]">refresh</span>
                          </div>
                        }
                      </div>
                      <p class="text-[10px] text-[#590E2A]/40 flex items-center gap-1">
                        <span class="material-icons" style="font-size: 12px">info</span>
                        Busca una dirección o haz clic en el mapa para colocar tu ubicación
                      </p>

                      @if (mapAddress()) {
                        <div class="p-3 rounded-xl bg-[#E0F2F1] border border-[#B2DFDB] flex items-center gap-2">
                          <span class="material-icons text-[#2C5350]" style="font-size: 14px">check_circle</span>
                          <p class="text-[11px] font-medium text-[#2C5350]">{{ mapAddress() }}</p>
                        </div>
                      }

                      <div class="grid grid-cols-2 gap-3">
                        <input #aliasInput type="text" placeholder="Alias (Casa, Trabajo)" class="p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                        <input #barrioInput type="text" placeholder="Barrio" class="p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                      </div>
                      <input #dirInput type="text" [value]="mapAddress() || ''" placeholder="Dirección completa (Calle 14 # 5-20)" class="w-full p-3 rounded-xl bg-white border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]"/>
                      <button (click)="saveAddress(aliasInput.value, dirInput.value || mapAddress() || '', barrioInput.value); destroyMap()"
                        class="w-full py-2.5 rounded-xl bg-[#590E2A] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#3A0A1C] transition-colors">
                        Guardar Direccion
                      </button>
                    </div>
                  }

                  <div class="space-y-3">
                    @for (dir of userAddresses(); track dir.id_direccion) {
                      <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                          <div class="w-10 h-10 rounded-xl bg-[#D95578]/10 flex items-center justify-center shrink-0">
                            <span class="material-icons text-[#D95578]" style="font-size: 18px">{{ dir.predeterminada ? 'home' : 'location_on' }}</span>
                          </div>
                          <div class="min-w-0">
                            <div class="flex items-center gap-2">
                              <p class="text-sm font-bold text-[#590E2A] truncate">{{ dir.alias || 'Direccion' }}</p>
                              @if (dir.predeterminada) {
                                <span class="text-[9px] px-2 py-0.5 rounded-full bg-[#D95578]/10 text-[#D95578] font-bold shrink-0">Principal</span>
                              }
                            </div>
                            <p class="text-[11px] text-[#590E2A]/70 truncate">{{ dir.direccion_completa }}</p>
                            <p class="text-[10px] text-[#590E2A]/40">{{ dir.barrio ? dir.barrio + ', ' : '' }}{{ dir.ciudad }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                          @if (!dir.predeterminada) {
                            <button (click)="supabaseService.setDireccionPredeterminada(dir.id_direccion, u.id)"
                              class="group relative h-8 w-8 rounded-full bg-[#D95578]/10 text-[#D95578] hover:bg-[#065F46] hover:text-white hover:w-auto hover:px-3 hover:gap-1.5 transition-all duration-300 flex items-center justify-center overflow-hidden" title="Hacer principal">
                              <span class="material-icons text-sm shrink-0">star</span>
                              <span class="hidden group-hover:inline whitespace-nowrap text-[11px] font-bold ml-1">Hacer principal</span>
                            </button>
                          } @else {
                            <div class="flex items-center gap-1.5 px-3 h-8 rounded-full bg-[#065F46]/10 text-[#065F46] shrink-0">
                              <span class="material-icons text-sm">star</span>
                              <span class="text-[11px] font-bold">Principal</span>
                            </div>
                          }
                          <button (click)="editingDireccion.set(dir)"
                            class="w-8 h-8 rounded-full flex items-center justify-center bg-[#2C5350]/10 text-[#2C5350] hover:bg-[#2C5350] hover:text-white transition-all" title="Editar">
                            <span class="material-icons" style="font-size: 14px">edit</span>
                          </button>
                          <button (click)="deletingDireccion.set(dir)"
                            class="w-8 h-8 rounded-full flex items-center justify-center bg-[#8C3A3A]/10 text-[#8C3A3A] hover:bg-[#8C3A3A] hover:text-white transition-all" title="Eliminar">
                            <span class="material-icons" style="font-size: 14px">delete</span>
                          </button>
                        </div>
                      </div>
                    } @empty {
                      <div class="py-10 text-center">
                        <span class="material-icons text-[#E8D8D0] mb-2" style="font-size: 40px">location_off</span>
                        <p class="text-xs text-[#590E2A]/50">No tienes direcciones guardadas</p>
                        <p class="text-[10px] text-[#590E2A]/30 mt-1">Anade una para agilizar tus compras</p>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- ===================== TAB: PEDIDOS ===================== -->
              @if (activeTab() === 'pedidos') {
                <div class="space-y-5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
                      <span class="material-icons text-[#FB923C]" style="font-size: 18px">receipt_long</span>
                    </div>
                    <div>
                      <h2 class="text-sm font-bold text-[#590E2A] uppercase tracking-wider">Mis Pedidos</h2>
                      <p class="text-[10px] text-[#590E2A]/50">{{ userOrders().length }} pedidos realizados</p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    @for (ord of userOrders(); track ord.id) {
                      <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-3">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="font-mono text-sm font-bold text-[#590E2A]">#{{ ord.id }}</span>
                            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                              [class]="getStatusClass(ord.estado)">
                              {{ ord.estado }}
                            </span>
                          </div>
                          <div class="text-right">
                            <span class="text-sm font-serif italic font-bold text-[#590E2A] block">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                            <div class="inline-flex items-center gap-1.5 h-5 px-2 mt-1 rounded bg-white border border-[#E8D8D0]">
                              <img [src]="getPaymentLogo(ord.metodoPago)" [alt]="ord.metodoPago" class="h-3 object-contain">
                              <span class="text-[9px] font-bold text-[#590E2A]/60 uppercase">{{ ord.metodoPago }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-4 text-[11px] text-[#590E2A]/60">
                          <div class="flex items-center gap-1">
                            <span class="material-icons" style="font-size: 12px">shopping_bag</span>
                            {{ ord.items.length }} postres
                          </div>
                          <div class="flex items-center gap-1">
                            <span class="material-icons" style="font-size: 12px">calendar_today</span>
                            {{ ord.fecha | date:'short' }}
                          </div>
                        </div>

                        <!-- Products Toggle -->
                        <div class="border-t border-[#E8D8D0]/60 pt-3">
                          <button (click)="toggleOrderItems(ord.id)" class="w-full flex items-center justify-between text-left">
                            <div class="flex items-center gap-2 flex-wrap">
                              @for (item of ord.items.slice(0, 3); track item.productoId) {
                                <img [src]="item.imagen" class="w-7 h-7 rounded-full object-cover border-2 border-white -ml-2 first:ml-0" [title]="item.nombreEspanol">
                              }
                              @if (ord.items.length > 3) {
                                <span class="w-7 h-7 rounded-full bg-[#590E2A]/10 text-[#590E2A] text-[9px] font-bold flex items-center justify-center border-2 border-white -ml-2">
                                  +{{ ord.items.length - 3 }}
                                </span>
                              }
                            </div>
                            <span class="material-icons text-[#590E2A]/40 transition-transform" style="font-size: 18px"
                              [class.rotate-180]="expandedOrderItems() === ord.id">expand_more</span>
                          </button>

                          <div class="faq-answer" [class.open]="expandedOrderItems() === ord.id">
                            <div class="flex flex-wrap gap-2 pt-3">
                              @for (item of ord.items; track item.productoId) {
                                <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-[11px] border border-[#E8D8D0]/50">
                                  <img [src]="item.imagen" class="w-5 h-5 rounded-full object-cover">
                                  <span class="font-medium text-[#590E2A]">{{ item.nombreEspanol }}</span>
                                  <span class="text-[#590E2A]/50">x{{ item.cantidad }}</span>
                                </div>
                              }
                            </div>
                          </div>
                        </div>

                        @if (ord.cliente.direccion) {
                          <div class="flex items-center gap-1 text-[10px] text-[#590E2A]/40 pt-1">
                            <span class="material-icons" style="font-size: 10px">location_on</span>
                            {{ ord.cliente.direccion }}
                          </div>
                        }
                      </div>
                    } @empty {
                      <div class="py-10 text-center">
                        <span class="material-icons text-[#E8D8D0] mb-2" style="font-size: 40px">receipt_long</span>
                        <p class="text-xs text-[#590E2A]/50">Aún no has realizado pedidos</p>
                        <a routerLink="/productos" class="inline-block mt-3 px-5 py-2 rounded-full bg-[#590E2A] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#3A0A1C] transition-colors">
                          Explorar Catálogo
                        </a>
                      </div>
                    }
                  </div>
                </div>
              }

            </div>
          </div>

          <!-- Edit Profile Modal -->
          @if (isEditing()) {
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="cancelEdit()">
              <div class="bg-white rounded-3xl shadow-xl w-full max-w-lg p-6 sm:p-8" (click)="$event.stopPropagation()">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-lg font-serif italic text-[#590E2A] font-bold">Editar Perfil</h2>
                  <button (click)="cancelEdit()" class="p-2 rounded-full hover:bg-[#FDF8F4] transition-colors">
                    <span class="material-icons text-[#590E2A]/40">close</span>
                  </button>
                </div>

                <div class="flex flex-col sm:flex-row gap-6">
                  <!-- Avatar Section -->
                  <div class="flex flex-col items-center gap-3 shrink-0">
                    <div class="relative group">
                      @if (avatarPreview()) {
                        <img [src]="avatarPreview()" class="w-24 h-24 rounded-full object-cover border-4 border-[#E8D8D0]">
                      } @else {
                        <div class="w-24 h-24 rounded-full bg-[#D95578] flex items-center justify-center text-white text-4xl font-serif italic font-bold border-4 border-[#E8D8D0]">
                          {{ u.nombre_completo?.charAt(0) || '?' }}
                        </div>
                      }
                      <label class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span class="material-icons text-white">photo_camera</span>
                        <input type="file" accept="image/*" class="hidden" (change)="onAvatarSelected($event)">
                      </label>
                    </div>
                    <span class="text-[10px] text-[#590E2A]/40 text-center">Click para cambiar foto</span>
                  </div>

                  <!-- Form Fields -->
                  <div class="flex-1 space-y-4">
                    <div>
                      <label class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50 block mb-1 flex items-center gap-1">
                        <span class="material-icons" style="font-size: 14px">person</span> Nombre Completo
                      </label>
                      <input [(ngModel)]="editName" class="w-full text-sm text-[#590E2A] bg-[#FDF8F4] border border-[#E8D8D0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#590E2A] transition-colors" placeholder="Tu nombre">
                    </div>
                    <div>
                      <label class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50 block mb-1 flex items-center gap-1">
                        <span class="material-icons" style="font-size: 14px">email</span> Correo Electronico
                      </label>
                      <input [(ngModel)]="editEmail" type="email" class="w-full text-sm text-[#590E2A] bg-[#FDF8F4] border border-[#E8D8D0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#590E2A] transition-colors" placeholder="tu@email.com">
                    </div>
                    <div>
                      <label class="text-[10px] uppercase tracking-wider font-bold text-[#590E2A]/50 block mb-1 flex items-center gap-1">
                        <span class="material-icons" style="font-size: 14px">phone</span> Telefono
                      </label>
                      <input [(ngModel)]="editPhone" class="w-full text-sm text-[#590E2A] bg-[#FDF8F4] border border-[#E8D8D0] rounded-xl px-4 py-3 focus:outline-none focus:border-[#590E2A] transition-colors" placeholder="Tu telefono">
                    </div>
                  </div>
                </div>

                <div class="flex gap-3 mt-6">
                  <button (click)="cancelEdit()" class="flex-1 px-5 py-3 rounded-full bg-white border border-[#E8D8D0] text-[#590E2A] text-xs font-bold hover:bg-[#FDF8F4] transition-colors">
                    Cancelar
                  </button>
                  <button (click)="saveProfile()" [disabled]="isSaving()" class="flex-1 px-5 py-3 rounded-full bg-[#590E2A] text-white text-xs font-bold hover:bg-[#3A0A1C] transition-colors disabled:opacity-50">
                    {{ isSaving() ? 'Guardando...' : 'Guardar Cambios' }}
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Edit Address Modal -->
      @if (editingDireccion()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="editingDireccion.set(null)">
          <div class="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 space-y-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-serif italic text-[#590E2A] font-bold flex items-center gap-2">
                <span class="material-icons text-[#2C5350]">edit</span>
                Editar Direccion
              </h3>
              <button (click)="editingDireccion.set(null)" class="w-7 h-7 rounded-full bg-[#FDF8F4] flex items-center justify-center hover:bg-[#E8D8D0] transition-colors">
                <span class="material-icons text-[#590E2A] text-sm">close</span>
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 block">Alias</label>
                <input #editAlias type="text" [value]="editingDireccion()!.alias || ''"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]">
              </div>
              <div>
                <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 block">Direccion</label>
                <input #editDir type="text" [value]="editingDireccion()!.direccion_completa || ''"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]">
              </div>
              <div>
                <label class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider mb-1 block">Barrio</label>
                <input #editBarrio type="text" [value]="editingDireccion()!.barrio || ''"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-xs focus:outline-none focus:border-[#D95578]">
              </div>
            </div>

            <div class="flex gap-2">
              <button (click)="editingDireccion.set(null)"
                class="flex-1 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#E8D8D0] transition-colors">
                Cancelar
              </button>
              <button (click)="saveEditAddress(editAlias.value, editDir.value, editBarrio.value)"
                class="flex-1 py-2.5 rounded-full bg-[#2C5350] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#1f3d3b] transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Delete Address Modal -->
      @if (deletingDireccion()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" (click)="deletingDireccion.set(null)">
          <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center" (click)="$event.stopPropagation()">
            <div class="w-14 h-14 rounded-full bg-[#FFEBEE] flex items-center justify-center mx-auto">
              <span class="material-icons text-[#8C3A3A]" style="font-size: 28px">delete</span>
            </div>
            <div>
              <h3 class="text-base font-serif italic text-[#590E2A] font-bold">Eliminar Direccion</h3>
              <p class="text-[11px] text-[#590E2A]/60 mt-1">
                Se eliminara "{{ deletingDireccion()!.alias || 'Direccion' }}" permanentemente.
              </p>
            </div>
            <div class="flex gap-2">
              <button (click)="deletingDireccion.set(null)"
                class="flex-1 py-2.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-bold text-[10px] uppercase tracking-wider hover:bg-[#E8D8D0] transition-colors">
                Cancelar
              </button>
              <button (click)="confirmDeleteAddress()"
                class="flex-1 py-2.5 rounded-full bg-[#8C3A3A] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#6d2f2f] transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- No Coverage Modal -->
      @if (showNoCoverageModal()) {
        <div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="showNoCoverageModal.set(false)">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-sm p-6 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="w-14 h-14 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto">
              <span class="material-icons text-[#E65100]" style="font-size: 28px">warning</span>
            </div>
            <div class="text-center space-y-2">
              <h3 class="text-base font-serif italic text-[#590E2A] font-bold">Sin Cobertura en esta Zona</h3>
              <p class="text-[11px] text-[#590E2A]/60 leading-relaxed">
                La direccion ingresada no esta dentro de nuestras zonas de envio. Solo puedes guardar direcciones dentro de La Dorada, Puerto Salgar, Purnio, Guarinocito, Honda y Victoria.
              </p>
            </div>
            <div class="space-y-2">
              <a routerLink="/contacto" [queryParams]="{asunto: 'envio_nacional'}" (click)="showNoCoverageModal.set(false)"
                class="w-full py-3 rounded-full bg-[#D95578] hover:bg-[#FF6078] text-white font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <span class="material-icons text-sm">mail</span>
                Contactar para Envio Nacional
              </a>
              <button (click)="showNoCoverageModal.set(false)"
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
export class ProfileComponent implements OnInit, OnDestroy {
  supabaseService = inject(SupabaseService);
  private dataService = inject(MochiDataService);
  cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);

  user = this.supabaseService.activeUser;
  activeTab = signal<'cuenta' | 'direcciones' | 'pedidos'>('cuenta');

  showPasswordForm = signal(false);
  newPassword = signal('');
  confirmPassword = signal('');
  passwordError = signal('');
  passwordSuccess = signal(false);
  passwordLoading = signal(false);

  showNewAddress = signal(false);
  mapAddress = signal('');
  editingDireccion = signal<Direccion | null>(null);
  deletingDireccion = signal<Direccion | null>(null);
  showNoCoverageModal = signal(false);
  mapLoading = signal(false);

  isEditing = signal(false);
  isSaving = signal(false);
  editName = '';
  editEmail = '';
  editPhone = '';
  avatarPreview = signal<string | null>(null);
  avatarFile: File | null = null;
  expandedOrderItems = signal<string | null>(null);

  private map: any = null;
  private marker: any = null;
  private L: typeof import('leaflet') | null = null;

  // La Dorada, Caldas coords
  private readonly LADORADA = { lat: 5.4538, lng: -74.6647 };

  constructor() {
    effect(() => {
      const showing = this.showNewAddress();
      if (showing && isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initMap(), 50);
      } else {
        this.destroyMap();
        this.mapAddress.set('');
      }
    });
  }

  userAddresses = computed(() => {
    const u = this.user();
    if (!u) return [];
    return this.supabaseService.direcciones().filter(d => d.id_usuario === u.id);
  });

  userOrders = computed(() => {
    const u = this.user();
    if (!u) return [];
    return this.dataService.orders().filter(o => o.id_usuario === u.id);
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'pedidos') {
        this.activeTab.set('pedidos');
      }
    });
  }

  ngOnDestroy() {
    this.destroyMap();
  }

  async initMap() {
    if (this.map) return;
    if (!this.L) {
      this.L = await import('leaflet');
    }
    const L = this.L;
    const container = document.getElementById('address-map');
    if (!container) return;

    this.map = L.map('address-map').setView([this.LADORADA.lat, this.LADORADA.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.placeMarker(lat, lng);
      this.reverseGeocode(lat, lng);
    });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  placeMarker(lat: number, lng: number) {
    if (!this.map || !this.L) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      const icon = this.L.divIcon({
        html: `<span class="material-icons" style="font-size:32px;color:#D95578;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">location_on</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: ''
      });
      this.marker = this.L.marker([lat, lng], { icon }).addTo(this.map);
    }
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
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        this.map?.setView([latNum, lonNum], 16);
        this.placeMarker(latNum, lonNum);
        this.mapAddress.set(display_name);
      }
    } catch {}
    this.mapLoading.set(false);
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  getStatusClass(estado: string): string {
    const s = estado.toLowerCase();
    if (s === 'entregado') return 'bg-[#E0F2F1] text-[#2C5350]';
    if (s === 'en camino' || s === 'en camino') return 'bg-[#FFF3E0] text-[#E65100]';
    if (s === 'preparando') return 'bg-[#F3E5F5] text-[#6A1B9A]';
    return 'bg-[#FFEBEE] text-[#C62828]';
  }

  saveAddress(alias: string, dir: string, barrio: string) {
    const u = this.user();
    if (!dir || !u) return;
    const lower = dir.toLowerCase();
    const zones = ['la dorada', 'puerto salgar', 'purnio', 'guarinocito', 'honda', 'victoria'];
    const hasCoverage = zones.some(z => lower.includes(z));
    if (!hasCoverage) {
      this.showNoCoverageModal.set(true);
      return;
    }
    this.supabaseService.addDireccion({
      id_usuario: u.id,
      alias: alias || 'Mi Direccion',
      direccion_completa: dir,
      barrio: barrio || 'Centro',
      ciudad: 'La Dorada',
      departamento: 'Caldas',
      codigo_postal: '175031',
      predeterminada: this.userAddresses().length === 0
    });
    this.showNewAddress.set(false);
  }

  async saveEditAddress(alias: string, dir: string, barrio: string) {
    const u = this.user();
    const editing = this.editingDireccion();
    if (!u || !editing) return;
    await this.supabaseService.updateDireccion(editing.id_direccion, {
      alias: alias || 'Direccion',
      direccion_completa: dir,
      barrio: barrio || 'Centro'
    }, u.id);
    this.editingDireccion.set(null);
  }

  async confirmDeleteAddress() {
    const u = this.user();
    const deleting = this.deletingDireccion();
    if (!u || !deleting) return;
    await this.supabaseService.deleteDireccion(deleting.id_direccion, u.id);
    this.deletingDireccion.set(null);
  }

  async onPasswordChange(event: Event) {
    event.preventDefault();
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    if (this.newPassword().length < 6) {
      this.passwordError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }

    this.passwordLoading.set(true);

    const { error } = await this.supabaseService.updatePassword(this.newPassword());

    if (error) {
      this.passwordError.set(error.message);
    } else {
      this.passwordSuccess.set(true);
      this.newPassword.set('');
      this.confirmPassword.set('');
      setTimeout(() => {
        this.showPasswordForm.set(false);
        this.passwordSuccess.set(false);
      }, 2500);
    }

    this.passwordLoading.set(false);
  }

  toggleOrderItems(orderId: string) {
    this.expandedOrderItems.set(this.expandedOrderItems() === orderId ? null : orderId);
  }

  getPaymentLogo(method: string): string {
    const logos: Record<string, string> = {
      'nequi': 'https://ayuda.nequi.com.co/hc/theming_assets/01K33KNDSV01JCWCVQN8EPN9D7',
      'daviplata': 'https://http2.mlstatic.com/storage/logos-api-admin/72df52b0-f3c4-11eb-a186-1134488bf456-m.svg',
      'pse': 'https://http2.mlstatic.com/storage/logos-api-admin/254f9960-57b9-11e8-a82b-59483d0f8e12-m.svg',
      'bancolombia': 'https://http2.mlstatic.com/storage/logos-api-admin/5c2bfa10-7d35-11f0-b528-71999009c8ad-m.svg',
      'tarjeta_credito': 'https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg',
      'tarjeta_debito': 'https://http2.mlstatic.com/storage/logos-api-admin/9cf818e0-723a-11f0-a459-cf21d0937aeb-m.svg',
      'efectivo': 'https://d1b4gd4m8561gs.cloudfront.net/sites/default/files/images/bre-b-identifica.png',
      'contraentrega': 'https://d1b4gd4m8561gs.cloudfront.net/sites/default/files/images/bre-b-identifica.png',
    };
    const key = method.toLowerCase().replace(/\s+/g, '_');
    return logos[key] || 'https://http2.mlstatic.com/storage/logos-api-admin/254f9960-57b9-11e8-a82b-59483d0f8e12-m.svg';
  }

  startEdit() {
    const u = this.user();
    if (u) {
      this.editName = u.nombre_completo || '';
      this.editEmail = u.email || '';
      this.editPhone = u.telefono || '';
      this.avatarPreview.set(u.foto_perfil || null);
      this.avatarFile = null;
    }
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.avatarPreview.set(null);
    this.avatarFile = null;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.avatarFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.avatarFile);
    }
  }

  async saveProfile() {
    this.isSaving.set(true);

    const nameChanged = this.editName !== (this.user()?.nombre_completo || '');
    const phoneChanged = this.editPhone !== (this.user()?.telefono || '');
    const emailChanged = this.editEmail !== (this.user()?.email || '');

    if (nameChanged || phoneChanged) {
      await this.supabaseService.updateProfile({
        nombre_completo: this.editName,
        telefono: this.editPhone
      });
    }

    if (emailChanged) {
      await this.supabaseService.updateEmail(this.editEmail);
    }

    if (this.avatarFile) {
      await this.supabaseService.uploadAvatar(this.avatarFile);
    }

    this.isEditing.set(false);
    this.avatarFile = null;
    this.isSaving.set(false);
  }

  async onLogout() {
    await this.supabaseService.signOut();
    this.cartService.clearCart();
    this.router.navigate(['/']);
  }
}
