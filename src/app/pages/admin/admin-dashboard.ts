import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DatePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MochiDataService } from '../../services/mochi-data.service';
import { OrdersPanelComponent } from '../../components/orders-panel/orders-panel';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationService } from '../../services/notification.service';
import { UserRole, Usuario, Direccion, Product, Order, DetallePedido } from '../../models/mochi.models';
import { supabase } from '../../supabase';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [OrdersPanelComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] text-[#590E2A] min-h-screen p-4 sm:p-8 font-sans">
      <div class="max-w-full mx-auto space-y-8">
        
        <!-- Admin Header -->
        <div class="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8D8D0] shadow-xs">
          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1 rounded-full bg-[#D95578] text-[#590E2A] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#E8D8D0]">
              Panel de Administración
            </span>
          </div>
          <h1 class="text-3xl font-serif italic text-[#590E2A] mt-2">
            Mochi. Control Center
          </h1>
          <p class="text-xs text-[#590E2A]/70 uppercase tracking-wider mt-1 font-medium">Gestión de catálogo, pedidos, usuarios y configuración</p>
        </div>

        <!-- TAB: PRODUCT & STOCK MANAGEMENT (CRUD) -->
        @if (activeTab() === 'productos') {
          <div class="space-y-6">
            
            <!-- Header with Add Button -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 shadow-xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-[#FFF3E0] flex items-center justify-center">
                    <span class="material-icons text-[#E65100]" style="font-size: 20px">inventory_2</span>
                  </div>
                  <div>
                    <h2 class="text-lg font-serif italic text-[#590E2A]">Catalogo de Productos</h2>
                    <p class="text-xs text-[#590E2A]/60">{{ products().length }} productos registrados</p>
                  </div>
                </div>
                <button 
                  (click)="openProductModal()"
                  class="flex items-center gap-1.5 px-6 py-3 rounded-full bg-[#590E2A] hover:bg-[#3A0A1C] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors">
                  <span class="material-icons text-sm">add</span>
                  Nuevo Producto
                </button>
              </div>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] shadow-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-[#E8D8D0] bg-[#FDF8F4]">
                      <th class="text-left p-4 font-bold text-[#590E2A] uppercase tracking-wider text-[10px]">Producto</th>
                      <th class="text-right p-4 font-bold text-[#590E2A] uppercase tracking-wider text-[10px]">Precio</th>
                      <th class="text-center p-4 font-bold text-[#590E2A] uppercase tracking-wider text-[10px]">Stock</th>
                      <th class="text-center p-4 font-bold text-[#590E2A] uppercase tracking-wider text-[10px]">Rango</th>
                      <th class="text-center p-4 font-bold text-[#590E2A] uppercase tracking-wider text-[10px]">Estado</th>
                      <th class="text-right p-4 font-bold text-[#590E2A] uppercase tracking-wider text-[10px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8D8D0]/50">
                    @for (prod of products(); track prod.id) {
                      <tr class="hover:bg-[#FDF8F4]/50 transition-colors">
                        <td class="p-4">
                          <div class="flex items-center gap-3">
                            <div class="relative">
                              <img [src]="prod.imagen_principal" alt="" class="w-12 h-12 rounded-xl object-cover border border-[#E8D8D0]">
                              @if (!prod.disponible) {
                                <div class="absolute inset-0 bg-[#590E2A]/50 rounded-xl flex items-center justify-center">
                                  <span class="material-icons text-white" style="font-size: 16px">block</span>
                                </div>
                              }
                            </div>
                            <div>
                              <span class="font-serif italic text-[#590E2A] block text-sm font-medium">{{ prod.nombre_espanol }}</span>
                              <span class="text-[#590E2A]/50 block text-[10px]">{{ prod.nombre_japones }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="p-4 text-right">
                          <span class="font-serif italic font-bold text-[#590E2A]">
                            {{ '$' + prod.precio.toLocaleString('es-CO') }}
                          </span>
                        </td>
                        <td class="p-4 text-center">
                          <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
                            [class]="prod.stock <= prod.stock_minimo ? 'bg-[#8C3A3A]/10 text-[#8C3A3A]' : prod.stock >= prod.stock_maximo ? 'bg-[#2C5350]/10 text-[#2C5350]' : 'bg-[#590E2A]/10 text-[#590E2A]'">
                            <span class="material-icons" style="font-size: 12px">{{ prod.stock <= prod.stock_minimo ? 'warning' : 'inventory' }}</span>
                            <span class="font-mono font-bold">{{ prod.stock }}</span>
                          </div>
                        </td>
                        <td class="p-4 text-center">
                          <span class="text-[#590E2A]/60 font-mono text-[10px]">{{ prod.stock_minimo }} — {{ prod.stock_maximo }}</span>
                        </td>
                        <td class="p-4 text-center">
                          @if (prod.stock <= prod.stock_minimo) {
                            <span class="inline-flex items-center gap-1 bg-[#8C3A3A]/10 text-[#8C3A3A] px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <span class="material-icons" style="font-size: 12px">warning</span>
                              Stock Bajo
                            </span>
                          } @else if (prod.stock >= prod.stock_maximo) {
                            <span class="inline-flex items-center gap-1 bg-[#2C5350]/10 text-[#2C5350] px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <span class="material-icons" style="font-size: 12px">check_circle</span>
                              Completo
                            </span>
                          } @else if (!prod.disponible) {
                            <span class="inline-flex items-center gap-1 bg-[#590E2A]/10 text-[#590E2A] px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <span class="material-icons" style="font-size: 12px">block</span>
                              Inactivo
                            </span>
                          } @else {
                            <span class="inline-flex items-center gap-1 bg-[#D95578]/10 text-[#D95578] px-2.5 py-1 rounded-full text-[10px] font-bold">
                              <span class="material-icons" style="font-size: 12px">check_circle</span>
                              Activo
                            </span>
                          }
                        </td>
                        <td class="p-4 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <button (click)="openProductModal(prod)" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E0F2F1] text-[#2C5350] transition-colors" title="Editar">
                              <span class="material-icons" style="font-size: 16px">edit</span>
                            </button>
                            <button (click)="productToDelete.set(prod); showDeleteModal.set(true)" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#8C3A3A]/10 text-[#8C3A3A] transition-colors" title="Eliminar">
                              <span class="material-icons" style="font-size: 16px">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- PRODUCT MODAL -->
        @if (showProductModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="closeProductModal()"></div>
            <div class="relative bg-white rounded-[32px] border border-[#E8D8D0] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              
              <!-- Modal Header -->
              <div class="sticky top-0 bg-white border-b border-[#E8D8D0] p-6 rounded-t-[32px] z-10">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-serif italic text-[#590E2A]">
                    {{ editingProduct() ? 'Editar Producto' : 'Nuevo Producto' }}
                  </h2>
                  <button (click)="closeProductModal()" class="p-2 rounded-xl hover:bg-[#FDF8F4] text-[#590E2A]/60 transition-colors">
                    <span class="material-icons">close</span>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="p-6 space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="font-bold text-[#590E2A] block mb-1.5 text-xs">Nombre Japonés</label>
                    <input #mjap type="text" [value]="editingProduct()?.nombre_japones || ''" placeholder="Ej. Matcha Mochi" 
                      class="w-full p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-sm focus:outline-none focus:border-[#D95578]">
                  </div>
                  <div>
                    <label class="font-bold text-[#590E2A] block mb-1.5 text-xs">Nombre Español *</label>
                    <input #mesp type="text" [value]="editingProduct()?.nombre_espanol || ''" placeholder="Ej. Mochi de Té Verde" 
                      class="w-full p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-sm focus:outline-none focus:border-[#D95578]">
                  </div>
                  <div>
                    <label class="font-bold text-[#590E2A] block mb-1.5 text-xs">Precio COP *</label>
                    <input #mprice type="number" [value]="editingProduct()?.precio || ''" placeholder="9500" 
                      class="w-full p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-sm focus:outline-none focus:border-[#D95578]">
                  </div>
                  <div>
                    <label class="font-bold text-[#590E2A] block mb-1.5 text-xs">Imagen del Producto</label>
                    @if (productImagePreview()) {
                      <div class="relative mb-3">
                        <img [src]="productImagePreview()" class="w-full h-40 object-cover rounded-2xl border border-[#E8D8D0]">
                        <button (click)="clearProductImage()" 
                          class="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#D95578] text-white flex items-center justify-center text-xs shadow-md hover:bg-[#FF6080] transition-colors">
                          ✕
                        </button>
                      </div>
                    }
                    <label class="flex flex-col items-center justify-center w-full h-24 rounded-2xl border-2 border-dashed border-[#E8D8D0] bg-[#FDF8F4] cursor-pointer hover:border-[#D95578] transition-colors">
                      <span class="material-icons text-[#D95578] text-xl mb-1">cloud_upload</span>
                      <span class="text-[10px] font-bold text-[#590E2A]/60">{{ productImagePreview() ? 'Cambiar imagen' : 'Seleccionar archivo' }}</span>
                      <input type="file" accept="image/*" (change)="onProductImageSelected($event)" class="hidden">
                    </label>
                  </div>
                </div>

                <!-- Stock Section -->
                <div class="bg-[#FDF8F4] rounded-2xl p-4 space-y-4">
                  <h3 class="text-xs font-bold text-[#590E2A] uppercase tracking-wider">Control de Inventario</h3>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="font-bold text-[#590E2A] block mb-1.5 text-[10px]">Stock Actual</label>
                      <input #mstock type="number" [value]="editingProduct()?.stock || 20" 
                        class="w-full p-3 rounded-2xl bg-white border border-[#E8D8D0] text-[#590E2A] text-sm font-mono focus:outline-none focus:border-[#D95578]">
                    </div>
                    <div>
                      <label class="font-bold text-[#590E2A] block mb-1.5 text-[10px]">Mínimo</label>
                      <input #mstockmin type="number" [value]="editingProduct()?.stock_minimo || 10" 
                        class="w-full p-3 rounded-2xl bg-white border border-[#E8D8D0] text-[#590E2A] text-sm font-mono focus:outline-none focus:border-[#D95578]">
                    </div>
                    <div>
                      <label class="font-bold text-[#590E2A] block mb-1.5 text-[10px]">Máximo</label>
                      <input #mstockmax type="number" [value]="editingProduct()?.stock_maximo || 500" 
                        class="w-full p-3 rounded-2xl bg-white border border-[#E8D8D0] text-[#590E2A] text-sm font-mono focus:outline-none focus:border-[#D95578]">
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label class="font-bold text-[#590E2A] block mb-1.5 text-xs">Descripción</label>
                  <textarea #mdesc rows="3" [value]="editingProduct()?.descripcion || ''" placeholder="Postre japonés artesanal..." 
                    class="w-full p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] text-sm focus:outline-none focus:border-[#D95578]"></textarea>
                </div>

                <!-- Toggles -->
                <div class="flex gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" #mdisp [checked]="editingProduct()?.disponible ?? true" 
                      class="w-4 h-4 rounded border-[#E8D8D0] text-[#D95578] focus:ring-[#D95578]">
                    <span class="text-xs font-bold text-[#590E2A]">Disponible</span>
                  </label>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="sticky bottom-0 bg-white border-t border-[#E8D8D0] p-6 rounded-b-[32px]">
                <div class="flex gap-3">
                  <button (click)="closeProductModal()" 
                    class="flex-1 py-3 rounded-full border border-[#E8D8D0] text-[#590E2A] font-bold text-xs uppercase tracking-widest hover:bg-[#FDF8F4] transition-colors">
                    Cancelar
                  </button>
                  <button (click)="saveProductModal(mesp.value, mjap.value, mprice.value, mstock.value, mstockmin.value, mstockmax.value, mdesc.value, mdisp.checked)" 
                    class="flex-1 py-3 rounded-full bg-[#D95578] hover:bg-[#FF6080] text-white font-bold text-xs uppercase tracking-widest shadow-xs transition-colors">
                    {{ editingProduct() ? '✓ Guardar Cambios' : '+ Crear Producto' }}
                  </button>
                </div>
              </div>

            </div>
          </div>
        }

        <!-- TAB 3: ORDER STATUS MANAGEMENT -->
        @if (activeTab() === 'pedidos') {
          <app-orders-panel role="admin" [externalHighlightId]="highlightedPedidoId()" />
        }

        <!-- TAB 4: VENTAS -->
        @if (activeTab() === 'detalles') {
          <div class="space-y-6">

            <!-- Header -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 shadow-xs">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#E0F2F1] flex items-center justify-center">
                  <span class="material-icons text-[#2C5350]" style="font-size: 20px">point_of_sale</span>
                </div>
                <div>
                  <h2 class="text-2xl font-serif italic text-[#590E2A] font-bold">Ventas</h2>
                  <p class="text-xs text-[#590E2A]/60">Historial completo de ventas online y presenciales</p>
                </div>
              </div>
            </div>

            <!-- Filters Bar (Global - Top) -->
            <div class="bg-white rounded-[24px] border border-[#E8D8D0] px-4 py-3 shadow-xs space-y-3">
              <!-- Row 1: Date & Municipality -->
              <div class="flex flex-wrap gap-2 items-center">
                <div class="flex items-center gap-1.5">
                  <span class="material-icons text-[#590E2A]/40" style="font-size: 14px">filter_list</span>
                  <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest">Filtros</span>
                </div>
                <div class="flex items-center gap-1.5 bg-[#FDF8F4] border border-[#E8D8D0] rounded-lg px-2.5 py-1">
                  <span class="material-icons text-[#590E2A]/30" style="font-size: 12px">calendar_today</span>
                  <input type="date" [value]="dateFrom()" (input)="dateFrom.set($any($event.target).value)"
                    class="bg-transparent text-[10px] text-[#590E2A] focus:outline-none w-24">
                </div>
                <span class="text-[#590E2A]/30 text-[10px]">a</span>
                <div class="flex items-center gap-1.5 bg-[#FDF8F4] border border-[#E8D8D0] rounded-lg px-2.5 py-1">
                  <input type="date" [value]="dateTo()" (input)="dateTo.set($any($event.target).value)"
                    class="bg-transparent text-[10px] text-[#590E2A] focus:outline-none w-24">
                </div>
                <div class="flex items-center gap-1.5 bg-[#FDF8F4] border border-[#E8D8D0] rounded-lg px-2.5 py-1">
                  <span class="material-icons text-[#590E2A]/30" style="font-size: 12px">location_on</span>
                  <select [value]="municipioFilter()" (input)="municipioFilter.set($any($event.target).value)"
                    class="bg-transparent text-[10px] text-[#590E2A] focus:outline-none">
                    <option value="">Todos municipios</option>
                    @for (m of uniqueMunicipios(); track m) {
                      <option [value]="m">{{ m }}</option>
                    }
                  </select>
                </div>
                @if (dateFrom() || dateTo() || municipioFilter()) {
                  <button (click)="dateFrom.set(''); dateTo.set(''); municipioFilter.set('')"
                    class="flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFEBEE] text-[#C62828] text-[9px] font-bold hover:bg-[#C62828] hover:text-white transition-colors">
                    <span class="material-icons" style="font-size: 10px">close</span>
                    Limpiar
                  </button>
                }
              </div>

              <!-- Row 2: Origin Tabs with postres counts -->
              <div class="flex gap-2">
                <button (click)="detalleOrigenFilter.set('todos')"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold transition-all"
                  [class]="detalleOrigenFilter() === 'todos' ? 'bg-[#590E2A] text-white shadow-sm' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0] hover:border-[#590E2A]'">
                  <span class="material-icons" style="font-size: 14px">select_all</span>
                  Todos ({{ filteredTotalItems() }} postres)
                </button>
                <button (click)="detalleOrigenFilter.set('online')"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold transition-all"
                  [class]="detalleOrigenFilter() === 'online' ? 'bg-[#2C5350] text-white shadow-sm' : 'bg-[#FDF8F4] text-[#2C5350] border border-[#E8D8D0] hover:border-[#2C5350]'">
                  <span class="material-icons" style="font-size: 14px">language</span>
                  Online ({{ filteredOnlineCount() }} postres)
                </button>
                <button (click)="detalleOrigenFilter.set('local')"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold transition-all"
                  [class]="detalleOrigenFilter() === 'local' ? 'bg-[#E65100] text-white shadow-sm' : 'bg-[#FDF8F4] text-[#E65100] border border-[#E8D8D0] hover:border-[#E65100]'">
                  <span class="material-icons" style="font-size: 14px">store</span>
                  POS ({{ filteredLocalCount() }} postres)
                </button>
              </div>
            </div>

            <!-- Revenue Stats Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-[#590E2A]/40" style="font-size: 16px">paid</span>
                  <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest">Ingresos Totales</span>
                </div>
                <span class="text-2xl font-serif italic text-[#590E2A] block">{{ '$' + filteredTotalRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">{{ filteredDetalles().length }} transacciones</span>
              </div>
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-[#2C5350]" style="font-size: 16px">language</span>
                  <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest">Online</span>
                </div>
                <span class="text-2xl font-serif italic text-[#2C5350] block">{{ '$' + filteredOnlineRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">{{ filteredOnlineCount() }} pedidos</span>
              </div>
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-[#E65100]" style="font-size: 16px">store</span>
                  <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest">POS</span>
                </div>
                <span class="text-2xl font-serif italic text-[#E65100] block">{{ '$' + filteredLocalRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">{{ filteredLocalCount() }} ventas</span>
              </div>
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-[#00897B]" style="font-size: 16px">local_shipping</span>
                  <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest">Envios</span>
                </div>
                <span class="text-2xl font-serif italic text-[#00897B] block">{{ '$' + filteredShippingRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">ingreso por domicilio</span>
              </div>
              <button (click)="showProductBreakdown.set(true)"
                class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs hover:border-[#D95578] hover:shadow-md transition-all cursor-pointer group">
                <div class="flex items-center gap-2 mb-2">
                  <span class="material-icons text-[#D95578]" style="font-size: 16px">inventory_2</span>
                  <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest">Productos</span>
                </div>
                <span class="text-2xl font-serif italic text-[#D95578] block">{{ filteredTotalItems() }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block group-hover:text-[#D95578] transition-colors">Ver desglose</span>
              </button>
            </div>

            <!-- Sales Table -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] shadow-xs overflow-hidden">

                <!-- Order count header -->
                <div class="px-4 py-2.5 border-b border-[#E8D8D0]/50 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-icons text-[#590E2A]/40" style="font-size: 14px">receipt_long</span>
                    <span class="text-[11px] font-bold text-[#590E2A]">{{ filteredOrderCount() }} pedidos</span>
                    <span class="text-[10px] text-[#590E2A]/40">· {{ filteredTotalItems() }} postres</span>
                  </div>
                </div>

                <!-- Grouped Orders Table -->
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-[#FDF8F4] text-[#590E2A]/60 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th class="p-3 w-8"></th>
                        <th class="p-3">Pedido</th>
                        <th class="p-3">Cliente</th>
                        <th class="p-3">Direccion</th>
                        <th class="p-3">Origen</th>
                        <th class="p-3">Fecha</th>
                        <th class="p-3 text-center">Items</th>
                        <th class="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#E8D8D0]/50">
                      @for (group of groupedOrders(); track group.pedido?.id_pedido || $index) {
                        <!-- Order Header Row -->
                        <tr class="hover:bg-[#FDF8F4]/50 transition-colors cursor-pointer" (click)="togglePedido(group.pedido?.id_pedido || 0)">
                          <td class="p-3 pl-4">
                            <span class="material-icons text-[#590E2A]/30 transition-transform"
                              [class.rotate-90]="isPedidoExpanded(group.pedido?.id_pedido || 0)"
                              style="font-size: 18px">chevron_right</span>
                          </td>
                          <td class="p-3">
                            <span class="font-mono font-bold text-[#590E2A]">#{{ group.pedido?.id || group.items[0]?.id_pedido }}</span>
                          </td>
                          <td class="p-3">
                            <div class="flex items-center gap-1.5">
                              <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">person</span>
                              <span class="font-medium text-[#590E2A]">{{ group.pedido?.cliente?.nombre || 'Cliente' }}</span>
                            </div>
                          </td>
                          <td class="p-3">
                            <span class="text-[#590E2A]/60 truncate max-w-[150px] block">{{ getOrderAddress(group.pedido?.id_pedido) || '—' }}</span>
                          </td>
                          <td class="p-3">
                            @if (group.items[0]?.origen === 'online') {
                              <span class="inline-flex items-center gap-1 bg-[#E0F2F1] text-[#2C5350] px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <span class="material-icons" style="font-size: 10px">language</span>
                                Online
                              </span>
                            } @else {
                              <span class="inline-flex items-center gap-1 bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full text-[10px] font-bold">
                                <span class="material-icons" style="font-size: 10px">store</span>
                                POS
                              </span>
                            }
                          </td>
                          <td class="p-3">
                            <span class="text-[#590E2A]/50 text-[10px]">{{ group.items[0]?.created_at | date:'dd/MM/yy HH:mm' }}</span>
                          </td>
                          <td class="p-3 text-center">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#590E2A]/10 text-[#590E2A] text-[10px] font-bold">{{ group.items.length }}</span>
                          </td>
                          <td class="p-3 text-right">
                            <div class="text-right">
                              @if (group.pedido?.costoEnvio > 0) {
                                <span class="text-[9px] text-[#00897B] block">+{{'$' + group.pedido.costoEnvio.toLocaleString('es-CO') }} envio</span>
                              }
                              <span class="font-serif italic font-bold text-[#590E2A]">{{ '$' + group.totalConEnvio.toLocaleString('es-CO') }}</span>
                            </div>
                          </td>
                        </tr>

                        <!-- Expanded Items -->
                        @if (isPedidoExpanded(group.pedido?.id_pedido || 0)) {
                          @for (item of group.items; track item.id_detalle) {
                            <tr class="bg-[#FDF8F4]/30">
                              <td class="p-3"></td>
                              <td class="p-3 pl-8" colspan="7">
                                <div class="flex items-center gap-3 py-1">
                                  @if (item.producto?.imagen_principal) {
                                    <img [src]="item.producto!.imagen_principal" class="w-8 h-8 rounded-lg object-cover border border-[#E8D8D0]">
                                  } @else {
                                    <div class="w-8 h-8 rounded-lg bg-[#E8D8D0] flex items-center justify-center">
                                      <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">image</span>
                                    </div>
                                  }
                                  <div class="flex-1 min-w-0">
                                    <span class="font-medium text-[#590E2A] block">{{ item.producto?.nombre_espanol || 'Producto #' + item.id_producto }}</span>
                                    @if (item.frase_personalizada) {
                                      <span class="text-[10px] text-[#D95578] italic flex items-center gap-1">
                                        <span class="material-icons" style="font-size: 10px">format_quote</span>
                                        {{ item.frase_personalizada }}
                                      </span>
                                    }
                                  </div>
                                  <div class="text-right">
                                    <span class="text-[#590E2A]/50 text-[10px]">x{{ item.cantidad }}</span>
                                    <span class="font-bold text-[#590E2A] ml-2">{{ '$' + item.subtotal.toLocaleString('es-CO') }}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          }
                        }
                      } @empty {
                        <tr>
                          <td colspan="8" class="p-12 text-center text-[#590E2A]/40">
                            <span class="material-icons text-4xl block mb-2 text-[#E8D8D0]">receipt_long</span>
                            <p class="text-sm font-bold">No hay ventas registradas</p>
                            <p class="text-[10px] mt-1">Ajusta los filtros para ver resultados</p>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        }

        <!-- TAB 5: USUARIOS & ROLES -->
        @if (activeTab() === 'usuarios') {
          <div class="space-y-6">
            <!-- Users & Roles Management -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-[#F3E5F5] flex items-center justify-center">
                    <span class="material-icons text-[#8E24AA]" style="font-size: 20px">group</span>
                  </div>
                  <div>
                    <h2 class="text-2xl font-serif italic text-[#590E2A]">Gestion de Usuarios</h2>
                    <p class="text-xs text-[#590E2A]/70">Admin, Empleado o Cliente. Edita datos y direcciones.</p>
                  </div>
                </div>
                <button (click)="reloadUsers()" class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[10px] font-bold text-[#590E2A] hover:bg-[#D95578] hover:text-white transition-all uppercase tracking-wider">
                  <span class="material-icons" style="font-size: 14px">refresh</span>
                  Recargar
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#FDF8F4] text-[#590E2A]/60 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="p-3 rounded-l-2xl">Usuario</th>
                      <th class="p-3">Email</th>
                      <th class="p-3">Telefono</th>
                      <th class="p-3">Rol</th>
                      <th class="p-3">Direcciones</th>
                      <th class="p-3 rounded-r-2xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8D8D0]">
                    @for (usr of supabaseService.usuarios(); track usr.id) {
                      <tr class="hover:bg-[#FDF8F4]/50 transition-colors">
                        <td class="p-3 font-medium flex items-center gap-3">
                          @if (usr.foto_perfil) {
                            <img [src]="usr.foto_perfil" alt="Foto" class="w-9 h-9 rounded-full object-cover border-2 border-[#E8D8D0]">
                          } @else {
                            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#D95578] to-[#FF6078] flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {{ usr.nombre_completo?.charAt(0) || '?' }}
                            </div>
                          }
                          <div>
                            <span class="font-bold text-[#590E2A] block">{{ usr.nombre_completo }}</span>
                            <span class="text-[9px] text-[#590E2A]/40 font-mono">{{ usr.id.substring(0, 8) }}...</span>
                          </div>
                        </td>
                        <td class="p-3">
                          <div class="flex items-center gap-1.5">
                            <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">email</span>
                            <span class="font-mono">{{ usr.email }}</span>
                          </div>
                        </td>
                        <td class="p-3">
                          <div class="flex items-center gap-1.5">
                            <span class="material-icons text-[#590E2A]/30" style="font-size: 14px">phone</span>
                            <span>{{ usr.telefono || '—' }}</span>
                          </div>
                        </td>
                        <td class="p-3">
                          <span 
                            [class]="usr.rol === 'admin' ? 'bg-[#D95578]/10 text-[#D95578] border-[#D95578]/20' : usr.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350] border-[#B2DFDB]' : 'bg-[#FDF8F4] text-[#590E2A]/70 border-[#E8D8D0]'"
                            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1">
                            <span class="material-icons" style="font-size: 12px">{{ usr.rol === 'admin' ? 'shield' : usr.rol === 'empleado' ? 'badge' : 'person' }}</span>
                            {{ usr.rol }}
                          </span>
                        </td>
                        <td class="p-3">
                          <button (click)="viewAddresses(usr)" class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[10px] font-bold text-[#590E2A] hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-all">
                            <span class="material-icons" style="font-size: 12px">location_on</span>
                            Ver
                          </button>
                        </td>
                        <td class="p-3">
                          <div class="flex items-center gap-2">
                            <select 
                              [value]="usr.rol"
                              (change)="onRoleChange(usr.id, $any($event.target).value)"
                              class="px-3 py-1.5 rounded-full bg-white border border-[#E8D8D0] text-[11px] font-bold text-[#590E2A] focus:outline-none focus:border-[#D95578]">
                              <option value="admin">Admin</option>
                              <option value="empleado">Empleado</option>
                              <option value="cliente">Cliente</option>
                            </select>
                            <button (click)="editUser(usr)" class="w-8 h-8 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-center hover:bg-[#D95578] hover:text-white hover:border-[#D95578] transition-all" title="Editar">
                              <span class="material-icons" style="font-size: 14px">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Edit User Modal -->
            @if (editingUser()) {
              <div class="fixed inset-0 z-50 bg-[#590E2A]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#E8D8D0]">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xl font-serif italic text-[#590E2A]">Editar Usuario</h3>
                    <button (click)="editingUser.set(null)" class="w-8 h-8 rounded-full bg-[#FDF8F4] flex items-center justify-center text-[#590E2A] hover:bg-[#D95578] transition-colors">✕</button>
                  </div>
                  <div class="space-y-3 text-xs">
                    <div>
                      <label class="font-bold text-[#590E2A] block mb-1">Nombre Completo</label>
                      <input type="text" [value]="editingUser()!.nombre_completo" (input)="onEditField('nombre_completo', $any($event.target).value)" class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]">
                    </div>
                    <div>
                      <label class="font-bold text-[#590E2A] block mb-1">Email</label>
                      <input type="email" [value]="editingUser()!.email" (input)="onEditField('email', $any($event.target).value)" class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]">
                    </div>
                    <div>
                      <label class="font-bold text-[#590E2A] block mb-1">Teléfono</label>
                      <input type="text" [value]="editingUser()!.telefono || ''" (input)="onEditField('telefono', $any($event.target).value)" class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] focus:outline-none focus:border-[#590E2A]">
                    </div>
                  </div>
                  <button (click)="saveUser()" class="w-full py-3 rounded-full bg-[#590E2A] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest hover:bg-[#3A0A1C] transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            }

            <!-- View Addresses Modal -->
            @if (viewingAddresses()) {
              <div class="fixed inset-0 z-50 bg-[#590E2A]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#E8D8D0]">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-serif italic text-[#590E2A]">Direcciones</h3>
                      <p class="text-xs text-[#590E2A]/60">{{ viewingAddresses()!.nombre_completo }}</p>
                    </div>
                    <button (click)="viewingAddresses.set(null)" class="w-8 h-8 rounded-full bg-[#FDF8F4] flex items-center justify-center text-[#590E2A] hover:bg-[#D95578] transition-colors">✕</button>
                  </div>
                  <div class="space-y-3">
                    @if (userAddresses().length === 0) {
                      <div class="p-6 text-center text-xs text-[#590E2A]/50 bg-[#FDF8F4] rounded-2xl border border-[#E8D8D0]">
                        Este usuario no tiene direcciones guardadas
                      </div>
                    } @else {
                      @for (dir of userAddresses(); track dir.id_direccion) {
                        <div class="p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] text-xs space-y-1">
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-[#590E2A]">{{ dir.alias || 'Dirección' }}</span>
                            @if (dir.predeterminada) {
                              <span class="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#2C5350] text-[9px] font-bold">Principal</span>
                            }
                          </div>
                          <p class="text-[#590E2A]/70">{{ dir.direccion_completa }}</p>
                          <p class="text-[#590E2A]/50">{{ dir.ciudad }}, {{ dir.departamento }}</p>
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- TAB 6: LIVE NO-CODE VISUAL EDITOR -->
        @if (activeTab() === 'editor') {
          <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 sm:p-8 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-[#E8D8D0] pb-4">
              <div>
                <span class="px-3.5 py-1 rounded-full bg-[#D95578] text-[#590E2A] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#E8D8D0]">
                  Configuración Visual del Sitio Web
                </span>
                <h2 class="text-2xl font-serif italic text-[#590E2A] mt-1">Modificar Textos & Parámetros Visuales</h2>
              </div>
              <span class="text-xs text-[#2C5350] font-bold uppercase tracking-wider">✓ Guardado en memoria activa</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label for="hero-title" class="font-bold text-[#590E2A] block mb-1">Título Principal Hero</label>
                <input 
                  id="hero-title"
                  type="text" 
                  [value]="config().heroTitulo" 
                  (input)="dataService.updateVisualConfig({ heroTitulo: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-medium"
                />
              </div>

              <div>
                <label for="hero-subtitle" class="font-bold text-[#590E2A] block mb-1">Subtítulo Descriptivo</label>
                <input 
                  id="hero-subtitle"
                  type="text" 
                  [value]="config().heroSubtitulo" 
                  (input)="dataService.updateVisualConfig({ heroSubtitulo: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-medium"
                />
              </div>

              <div class="md:col-span-2">
                <label for="banner-promo" class="font-bold text-[#590E2A] block mb-1">Texto del Banner Anuncio Superior</label>
                <input 
                  id="banner-promo"
                  type="text" 
                  [value]="config().bannerPromocional" 
                  (input)="dataService.updateVisualConfig({ bannerPromocional: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-medium"
                />
              </div>

              <div>
                <label for="whatsapp-phone" class="font-bold text-[#590E2A] block mb-1">Teléfono WhatsApp de Atención</label>
                <input 
                  id="whatsapp-phone"
                  type="text" 
                  [value]="config().telefonoWhatsApp" 
                  (input)="dataService.updateVisualConfig({ telefonoWhatsApp: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[#590E2A] font-medium"
                />
                </div>
              </div>
          </div>
        }

        <!-- Delete Product Confirmation Modal -->
        @if (showDeleteModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="showDeleteModal.set(false)"></div>
            <div class="relative bg-white rounded-[28px] shadow-2xl w-full max-w-md p-8 space-y-6 text-center">
              <div class="w-16 h-16 rounded-full bg-[#8C3A3A]/10 flex items-center justify-center mx-auto">
                <span class="material-icons text-[#8C3A3A] text-3xl">warning</span>
              </div>
              <div>
                <h3 class="text-xl font-serif italic font-bold text-[#590E2A]">Eliminar Producto</h3>
                <p class="text-sm text-[#590E2A]/70 mt-2">
                  ¿Estás seguro de eliminar <span class="font-bold">"{{ productToDelete()?.nombre_espanol }}"</span>?
                </p>
                <p class="text-xs text-[#590E2A]/50 mt-1">Esta acción eliminará las reseñas y relaciones del producto. El historial de pedidos se mantendrá.</p>
              </div>
              <div class="flex gap-3">
                <button (click)="showDeleteModal.set(false)" 
                  class="flex-1 py-3 rounded-full border border-[#E8D8D0] text-[#590E2A] font-bold text-xs uppercase tracking-wider hover:bg-[#FDF8F4] transition-colors">
                  Cancelar
                </button>
                <button (click)="confirmDeleteProduct()" 
                  class="flex-1 py-3 rounded-full bg-[#8C3A3A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#6D2E2E] transition-colors">
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Sale Detail Modal -->
        @if (viewingDetalle()) {
          @let det = viewingDetalle()!;
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="viewingDetalle.set(null)"></div>
            <div class="relative bg-white rounded-[28px] shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-serif italic font-bold text-[#590E2A]">Detalle de Venta</h3>
                <button (click)="viewingDetalle.set(null)" class="p-2 rounded-xl hover:bg-[#FDF8F4] text-[#590E2A]/60 transition-colors">
                  <span class="material-icons">close</span>
                </button>
              </div>

              <div class="flex items-center gap-4 p-4 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0]">
                @if (det.producto?.imagen_principal) {
                  <img [src]="det.producto?.imagen_principal" class="w-16 h-16 rounded-2xl object-cover border border-[#E8D8D0]">
                }
                <div class="flex-1">
                  <span class="text-[10px] text-[#D95578] font-serif italic uppercase tracking-wider">{{ det.producto?.nombre_japones }}</span>
                  <h4 class="text-sm font-serif italic font-bold text-[#590E2A]">{{ det.producto?.nombre_espanol }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span [class]="det.origen === 'online' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FFF3E0] text-[#E65100]'"
                      class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                      {{ det.origen === 'online' ? '🌐 Online' : '🏪 Local' }}
                    </span>
                    @if (det.empleado_nombre) {
                      <span class="text-[10px] text-[#590E2A]/50 flex items-center gap-1">
                        <span class="material-icons text-[12px]">person</span>
                        {{ det.empleado_nombre }}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                @if (det.configuracion_capas) {
                  <div class="p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-1">
                    <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider">🎸 Vaso Personalizado</span>
                    <p class="text-xs text-[#590E2A]">Base: #{{ det.configuracion_capas.base }} · Crema: #{{ det.configuracion_capas.crema }} · Relleno: #{{ det.configuracion_capas.relleno }} · Topping: #{{ det.configuracion_capas.topping }}</p>
                  </div>
                }


                @if (det.frase_personalizada) {
                  <div class="p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-1">
                    <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider">📝 Frase Personalizada</span>
                    <p class="text-xs text-[#590E2A] italic">"{{ det.frase_personalizada }}"</p>
                  </div>
                } @else if (det.producto?.frase) {
                  <div class="p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0] space-y-1">
                    <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-wider">✨ Frase por Defecto</span>
                    <p class="text-xs text-[#590E2A] italic">"{{ det.producto?.frase }}"</p>
                  </div>
                }

                <div class="p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0]">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-[#590E2A]/60">Cantidad: <strong class="text-[#590E2A]">{{ det.cantidad }}</strong></span>
                    <span class="text-[#590E2A]/60">Precio unitario: <strong class="text-[#590E2A]">{{ '$' + det.precio_unitario.toLocaleString('es-CO') }}</strong></span>
                  </div>
                  <div class="flex justify-between items-center text-sm font-bold pt-2 mt-2 border-t border-[#E8D8D0]">
                    <span class="text-[#590E2A]">Subtotal</span>
                    <span class="font-serif italic text-[#D95578]">{{ '$' + det.subtotal.toLocaleString('es-CO') }}</span>
                  </div>
                </div>
              </div>

              <div class="text-center text-[10px] text-[#590E2A]/40">
                Pedido #{{ det.id_pedido }} · Detalle #{{ det.id_detalle }}
              </div>
            </div>
          </div>
        }

      </div>

      <!-- Product Breakdown Modal -->
      @if (showProductBreakdown()) {
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" (click)="showProductBreakdown.set(false)">
          <div class="bg-white rounded-[28px] w-[90vw] max-w-md p-6 space-y-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#FCE4EC] flex items-center justify-center">
                  <span class="material-icons text-[#D95578]" style="font-size: 20px">inventory_2</span>
                </div>
                <div>
                  <h3 class="text-base font-serif italic text-[#590E2A] font-bold">Desglose de Productos</h3>
                  <p class="text-[10px] text-[#590E2A]/50">{{ allProducts().length }} productos vendidos</p>
                </div>
              </div>
              <button (click)="showProductBreakdown.set(false)" class="w-8 h-8 rounded-full bg-[#FDF8F4] flex items-center justify-center hover:bg-[#E8D8D0] transition-colors">
                <span class="material-icons text-[#590E2A] text-sm">close</span>
              </button>
            </div>

            <div class="space-y-2 max-h-[60vh] overflow-y-auto">
              @for (prod of allProducts(); track prod.nombre) {
                <div class="flex items-center gap-3 p-3 rounded-2xl bg-[#FDF8F4] border border-[#E8D8D0]">
                  @if (prod.imagen) {
                    <img [src]="prod.imagen" class="w-10 h-10 rounded-xl object-cover border border-[#E8D8D0]">
                  } @else {
                    <div class="w-10 h-10 rounded-xl bg-[#E8D8D0] flex items-center justify-center">
                      <span class="material-icons text-[#590E2A]/30" style="font-size: 18px">image</span>
                    </div>
                  }
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-[#590E2A] truncate">{{ prod.nombre }}</p>
                    <p class="text-[10px] text-[#590E2A]/50">{{ prod.cantidad }} unidades vendidas</p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="text-sm font-serif italic font-bold text-[#590E2A]">{{ '$' + prod.subtotal.toLocaleString('es-CO') }}</p>
                    <div class="w-16 h-1.5 rounded-full bg-[#E8D8D0] mt-1">
                      <div class="h-full rounded-full bg-[#D95578] transition-all"
                        [style.width.%]="(prod.cantidad / totalItemsSold()) * 100"></div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div class="p-3 rounded-2xl bg-[#590E2A] text-white flex items-center justify-between">
              <span class="text-xs font-bold">Total vendido</span>
              <span class="text-lg font-serif italic font-bold">{{ totalItemsSold() }} postres</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  Number = Number;

  activeTab = signal<'productos' | 'pedidos' | 'detalles' | 'usuarios' | 'editor'>('detalles');
  detalleOrigenFilter = signal<'todos' | 'online' | 'local'>('todos');
  editingUser = signal<Usuario | null>(null);
  editingProduct = signal<Product | null>(null);
  showProductModal = signal<boolean>(false);
  productImagePreview = signal<string | null>(null);
  selectedProductFile = signal<File | null>(null);
  viewingAddresses = signal<Usuario | null>(null);
  userAddresses = signal<Direccion[]>([]);
  highlightedPedidoId = signal<number | null>(null);
  availableIngredientes = signal<{ id: number; nombre: string; tipo: string }[]>([]);
  selectedIngredientes = signal<{ id: number; nombre: string; tipo: string }[]>([]);
  productToDelete = signal<Product | null>(null);
  showDeleteModal = signal<boolean>(false);
  viewingDetalle = signal<DetallePedido | null>(null);
  expandedPedidos = signal<Set<number>>(new Set());
  showProductBreakdown = signal(false);
  dateFrom = signal('');
  dateTo = signal('');
  municipioFilter = signal('');

  private el = inject(ElementRef);

  ngOnInit() {
    // Reload users with admin token
    this.reloadUsers();
    // Load orders from Supabase
    this.dataService.loadOrders();
    // Start notification polling for real-time sync
    const user = this.supabaseService.activeUser();
    if (user) {
      this.notificationService.startListening(user.id);
    }
    // Sync sidebar navigation with internal tabs
    if (this.router.url === '/admin' || this.router.url === '/admin/') {
      this.router.navigate(['/admin/detalles']);
    }
    this.syncTabFromRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
      this.syncTabFromRoute(url);
    });

    // Handle ?pedido= query param for notification click
    const pedidoId = this.route.snapshot.queryParamMap.get('pedido');
    if (pedidoId) {
      const id = parseInt(pedidoId, 10);
      this.activeTab.set('pedidos');
      this.highlightedPedidoId.set(id);
      setTimeout(() => {
        const el = this.el.nativeElement.querySelector('#pedido-' + id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      setTimeout(() => this.highlightedPedidoId.set(null), 4000);
    }
  }

  ngOnDestroy() {
    this.notificationService.stopListening();
  }

  async reloadUsers() {
    await this.supabaseService.loadAll();
  }

  private syncTabFromRoute(url: string) {
    const segment = url.replace('/admin', '').replace(/^\//, '');
    const tabMap: Record<string, 'productos' | 'pedidos' | 'detalles' | 'usuarios' | 'editor'> = {
      '': 'detalles',
      'productos': 'productos',
      'pedidos': 'pedidos',
      'detalles': 'detalles',
      'usuarios': 'usuarios',
      'blog': 'detalles',
    };
    this.activeTab.set(tabMap[segment] ?? 'detalles');
  }

  config = this.dataService.visualConfig;
  products = this.dataService.products;
  orders = this.dataService.orders;

  filteredDetalles = computed(() => {
    const filter = this.detalleOrigenFilter();
    let detalles = filter === 'online' ? this.dataService.detallePedidosOnline()
      : filter === 'local' ? this.dataService.detallePedidosLocal()
      : this.dataService.detallePedidos();

    const from = this.dateFrom();
    const to = this.dateTo();
    if (from) {
      const fromDate = new Date(from);
      detalles = detalles.filter(d => d.created_at && new Date(d.created_at) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59);
      detalles = detalles.filter(d => d.created_at && new Date(d.created_at) <= toDate);
    }

    const mun = this.municipioFilter().trim().toLowerCase();
    if (mun) {
      detalles = detalles.filter(d => {
        const pid = d.id_pedido || 0;
        const order = this.getOrderInfo(pid);
        const ciudad = order?.cliente?.ciudad?.toLowerCase() || '';
        const dir = this.getOrderAddress(pid).toLowerCase();
        return ciudad.includes(mun) || dir.includes(mun);
      });
    }

    return detalles;
  });

  groupedOrders = computed(() => {
    const detalles = this.filteredDetalles();
    const map = new Map<number, { pedido: any; items: DetallePedido[]; total: number }>();

    for (const det of detalles) {
      const pid = det.id_pedido || 0;
      if (!map.has(pid)) {
        const pedido = this.getOrderInfo(pid);
        map.set(pid, { pedido, items: [], total: 0 });
      }
      const group = map.get(pid)!;
      group.items.push(det);
      group.total += det.subtotal;
    }

    return Array.from(map.values()).map(g => ({
      ...g,
      totalConEnvio: g.total + (g.pedido?.costoEnvio || 0)
    })).sort((a, b) => {
      const dateA = a.items[0]?.created_at || '';
      const dateB = b.items[0]?.created_at || '';
      return dateB.localeCompare(dateA);
    });
  });

  uniqueMunicipios = computed(() => {
    const munis = new Set<string>();
    for (const det of this.dataService.detallePedidos()) {
      const pid = det.id_pedido || 0;
      const order = this.getOrderInfo(pid);
      if (order?.cliente?.ciudad) {
        munis.add(order.cliente.ciudad);
      } else {
        const dir = this.getOrderAddress(pid);
        const parts = dir.split(',').map(s => s.trim());
        if (parts.length >= 3) munis.add(parts[2]);
        else if (parts.length === 2) munis.add(parts[1]);
      }
    }
    return Array.from(munis).sort();
  });

  totalSalesRevenue = computed(() => {
    const pedidos = this.dataService.orders();
    const detalles = this.dataService.detallePedidos();
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const envios = pedidos.reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
    return subtotal + envios;
  });
  onlineSalesRevenue = computed(() => {
    const pedidos = this.dataService.orders().filter(p => p.creado_por === 'web');
    const detalles = this.dataService.detallePedidosOnline();
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const envios = pedidos.reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
    return subtotal + envios;
  });
  localSalesRevenue = computed(() => {
    const pedidos = this.dataService.orders().filter(p => p.creado_por === 'pos');
    const detalles = this.dataService.detallePedidosLocal();
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const envios = pedidos.reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
    return subtotal + envios;
  });
  totalShippingRevenue = computed(() => {
    return this.dataService.orders().reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
  });

  // Filtered stats (used by the cards when filters are active)
  filteredTotalRevenue = computed(() => {
    const detalles = this.filteredDetalles();
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const pedidoIds = new Set(detalles.map(d => d.id_pedido));
    const envios = this.dataService.orders()
      .filter(p => pedidoIds.has(p.id_pedido))
      .reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
    return subtotal + envios;
  });
  filteredOnlineRevenue = computed(() => {
    const detalles = this.filteredDetalles().filter(d => d.origen === 'online');
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const pedidoIds = new Set(detalles.map(d => d.id_pedido));
    const envios = this.dataService.orders()
      .filter(p => pedidoIds.has(p.id_pedido))
      .reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
    return subtotal + envios;
  });
  filteredLocalRevenue = computed(() => {
    const detalles = this.filteredDetalles().filter(d => d.origen === 'local');
    const subtotal = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const pedidoIds = new Set(detalles.map(d => d.id_pedido));
    const envios = this.dataService.orders()
      .filter(p => pedidoIds.has(p.id_pedido))
      .reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
    return subtotal + envios;
  });
  filteredShippingRevenue = computed(() => {
    const detalles = this.filteredDetalles();
    const pedidoIds = new Set(detalles.map(d => d.id_pedido));
    return this.dataService.orders()
      .filter(p => pedidoIds.has(p.id_pedido))
      .reduce((sum, p) => sum + (p.costoEnvio || 0), 0);
  });
  filteredOnlineCount = computed(() => {
    // Count postres from online orders, filtered by date/municipality only (not origin)
    let detalles = this.dataService.detallePedidosOnline();
    const from = this.dateFrom();
    const to = this.dateTo();
    if (from) {
      const fromDate = new Date(from);
      detalles = detalles.filter(d => d.created_at && new Date(d.created_at) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59);
      detalles = detalles.filter(d => d.created_at && new Date(d.created_at) <= toDate);
    }
    const mun = this.municipioFilter().trim().toLowerCase();
    if (mun) {
      detalles = detalles.filter(d => {
        const pid = d.id_pedido || 0;
        const order = this.getOrderInfo(pid);
        const ciudad = order?.cliente?.ciudad?.toLowerCase() || '';
        const dir = this.getOrderAddress(pid).toLowerCase();
        return ciudad.includes(mun) || dir.includes(mun);
      });
    }
    return detalles.reduce((sum, d) => sum + d.cantidad, 0);
  });
  filteredLocalCount = computed(() => {
    // Count postres from POS orders, filtered by date/municipality only (not origin)
    let detalles = this.dataService.detallePedidosLocal();
    const from = this.dateFrom();
    const to = this.dateTo();
    if (from) {
      const fromDate = new Date(from);
      detalles = detalles.filter(d => d.created_at && new Date(d.created_at) >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59);
      detalles = detalles.filter(d => d.created_at && new Date(d.created_at) <= toDate);
    }
    const mun = this.municipioFilter().trim().toLowerCase();
    if (mun) {
      detalles = detalles.filter(d => {
        const pid = d.id_pedido || 0;
        const order = this.getOrderInfo(pid);
        const ciudad = order?.cliente?.ciudad?.toLowerCase() || '';
        const dir = this.getOrderAddress(pid).toLowerCase();
        return ciudad.includes(mun) || dir.includes(mun);
      });
    }
    return detalles.reduce((sum, d) => sum + d.cantidad, 0);
  });
  filteredTotalItems = computed(() => {
    return this.filteredDetalles().reduce((sum, d) => sum + d.cantidad, 0);
  });
  filteredOrderCount = computed(() => {
    const detalles = this.filteredDetalles();
    const pedidoIds = new Set(detalles.map(d => d.id_pedido));
    return pedidoIds.size;
  });
  totalItemsSold = computed(() => {
    return this.dataService.detallePedidos().reduce((sum, d) => sum + d.cantidad, 0);
  });
  topProducts = computed(() => {
    const map = new Map<string, { nombre: string; cantidad: number; subtotal: number; imagen: string }>();
    for (const d of this.dataService.detallePedidos()) {
      const key = d.producto?.nombre_espanol || `Producto #${d.id_producto}`;
      const existing = map.get(key) || { nombre: key, cantidad: 0, subtotal: 0, imagen: d.producto?.imagen_principal || '' };
      existing.cantidad += d.cantidad;
      existing.subtotal += d.subtotal;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  });
  allProducts = computed(() => {
    const map = new Map<string, { nombre: string; cantidad: number; subtotal: number; imagen: string }>();
    for (const d of this.dataService.detallePedidos()) {
      const key = d.producto?.nombre_espanol || `Producto #${d.id_producto}`;
      const existing = map.get(key) || { nombre: key, cantidad: 0, subtotal: 0, imagen: d.producto?.imagen_principal || '' };
      existing.cantidad += d.cantidad;
      existing.subtotal += d.subtotal;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.cantidad - a.cantidad);
  });

  togglePedido(pedidoId: number) {
    const current = this.expandedPedidos();
    const next = new Set(current);
    if (next.has(pedidoId)) next.delete(pedidoId);
    else next.add(pedidoId);
    this.expandedPedidos.set(next);
  }

  isPedidoExpanded(pedidoId: number): boolean {
    return this.expandedPedidos().has(pedidoId);
  }

  getOrderInfo(pedidoId: number) {
    const orders = this.dataService.orders();
    return orders.find(o => o.id_pedido === pedidoId) || null;
  }

  getOrderAddress(pedidoId: number | undefined): string {
    if (!pedidoId) return '';
    const order = this.getOrderInfo(pedidoId);
    return order?.cliente?.direccion || order?.notasEspeciales || '';
  }

  onRoleChange(userId: string, newRole: UserRole) {
    this.supabaseService.updateUsuarioRol(userId, newRole);
  }

  editUser(user: Usuario) {
    this.editingUser.set({ ...user });
  }

  onEditField(field: string, value: string) {
    const user = this.editingUser();
    if (user) {
      this.editingUser.set({ ...user, [field]: value });
    }
  }

  async saveUser() {
    const user = this.editingUser();
    if (!user) return;
    await this.supabaseService.updateUsuario(user.id, {
      nombre_completo: user.nombre_completo,
      email: user.email,
      telefono: user.telefono
    });
    this.editingUser.set(null);
  }

  async viewAddresses(user: Usuario) {
    this.viewingAddresses.set(user);
    const { data } = await import('../../supabase').then(m =>
      m.supabase.from('direcciones').select('*').eq('id_usuario', user.id)
    );
    this.userAddresses.set((data as Direccion[]) || []);
  }

  async confirmDeleteProduct() {
    const prod = this.productToDelete();
    if (prod) {
      await this.dataService.deleteProduct(prod.id);
    }
    this.showDeleteModal.set(false);
    this.productToDelete.set(null);
  }

  async openProductModal(product?: Product) {
    await this.loadIngredientes();
    if (product) {
      this.editingProduct.set({ ...product });
      this.productImagePreview.set(product.imagen_principal || null);
      await this.loadProductIngredients(product.id);
    } else {
      this.editingProduct.set(null);
      this.productImagePreview.set(null);
      this.selectedIngredientes.set([]);
    }
    this.selectedProductFile.set(null);
    this.showProductModal.set(true);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.editingProduct.set(null);
    this.productImagePreview.set(null);
    this.selectedIngredientes.set([]);
    this.selectedProductFile.set(null);
  }

  onProductImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.selectedProductFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.productImagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearProductImage() {
    this.productImagePreview.set(null);
    this.selectedProductFile.set(null);
  }

  async saveProductModal(esp: string, jap: string, price: string, stock: string, stockMin: string, stockMax: string, desc: string, disp: boolean) {
    if (!esp || !price) return;
    
    const current = this.editingProduct();
    const file = this.selectedProductFile();
    
    let imageUrl = current?.imagen_principal || '';
    
    if (file) {
      const uploaded = await this.dataService.uploadProductImage(file);
      if (uploaded) {
        imageUrl = uploaded;
      }
    }
    
    if (current) {
      const updated: Product = {
        ...current,
        nombre_japones: jap || esp,
        nombre_espanol: esp,
        precio: Number(price),
        imagen_principal: imageUrl || current.imagen_principal,
        stock: Number(stock) || current.stock,
        stock_minimo: Number(stockMin) || current.stock_minimo,
        stock_maximo: Number(stockMax) || current.stock_maximo,
        descripcion: desc || current.descripcion,
        disponible: disp
      };
      await this.dataService.updateProduct(updated);
      if (this.selectedIngredientes().length > 0) {
        await this.saveProductIngredients(current.id);
      }
    } else {
      const fallbackImg = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80';
      const finalImg = imageUrl || fallbackImg;
      const newProduct = await this.dataService.addProduct({
        nombre_japones: jap || esp,
        nombre_espanol: esp,
        descripcion: desc || 'Postre japonés artesanal recién preparado.',
        precio: Number(price),
        imagen_principal: finalImg,
        galeria_imagenes: [finalImg],
        disponible: disp,
        stock: Number(stock) || 20,
        stock_minimo: Number(stockMin) || 10,
        stock_maximo: Number(stockMax) || 500
      });
      if (newProduct && this.selectedIngredientes().length > 0) {
        await this.saveProductIngredients(newProduct);
      }
    }
    
    this.closeProductModal();
  }

  // --- INGREDIENTES ---

  async loadIngredientes() {
    const { data } = await supabase
      .from('ingredientes')
      .select('id, nombre, tipo')
      .eq('activo', true)
      .order('tipo')
      .order('nombre');
    if (data) this.availableIngredientes.set(data);
  }

  async loadProductIngredients(productId: number) {
    const { data } = await supabase
      .from('producto_ingrediente')
      .select('id_ingrediente, ingredientes(id, nombre, tipo)')
      .eq('id_producto', productId);
    if (data) {
      const selected = data
        .map((row: Record<string, unknown>) => {
          const ing = row['ingredientes'] as Record<string, unknown> | null;
          if (!ing) return null;
          return { id: ing['id'] as number, nombre: ing['nombre'] as string, tipo: ing['tipo'] as string };
        })
        .filter(Boolean) as { id: number; nombre: string; tipo: string }[];
      this.selectedIngredientes.set(selected);
    }
  }

  ingredientsByTipo(tipo: string): { id: number; nombre: string; tipo: string }[] {
    return this.availableIngredientes().filter(i => i.tipo === tipo);
  }

  isIngredientSelected(id: number): boolean {
    return this.selectedIngredientes().some(i => i.id === id);
  }

  toggleIngredient(ing: { id: number; nombre: string; tipo: string }) {
    const current = this.selectedIngredientes();
    if (current.some(i => i.id === ing.id)) {
      this.selectedIngredientes.set(current.filter(i => i.id !== ing.id));
    } else {
      this.selectedIngredientes.set([...current, ing]);
    }
  }

  async saveProductIngredients(productId: number) {
    // Delete existing
    await supabase.from('producto_ingrediente').delete().eq('id_producto', productId);
    // Insert new
    const rows = this.selectedIngredientes().map((ing, idx) => ({
      id_producto: productId,
      id_ingrediente: ing.id,
      orden: idx + 1
    }));
    if (rows.length > 0) {
      await supabase.from('producto_ingrediente').insert(rows);
    }
  }
}

