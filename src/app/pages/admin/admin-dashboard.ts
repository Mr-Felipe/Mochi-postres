import { Component, inject, signal, computed, OnInit, OnDestroy, AfterViewInit, ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { filter } from 'rxjs/operators';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { NotificationService } from '../../services/notification.service';
import { UserRole, Usuario, Direccion, Product, Order, OrderStatus } from '../../models/mochi.models';
import { supabase } from '../../supabase';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FDF8F4] text-[#590E2A] min-h-screen p-4 sm:p-8 font-sans">
      <div class="max-w-7xl mx-auto space-y-8">
        
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

        <!-- TAB 1: DASHBOARD METRICS -->
        @if (activeTab() === 'dashboard') {
          <div class="space-y-8">
            <!-- Key Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="p-6 rounded-[28px] bg-white border border-[#E8D8D0] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#590E2A]/60 uppercase tracking-widest block">Ventas Online Totales</span>
                <span class="text-3xl font-serif italic text-[#590E2A]">{{ '$' + onlineRevenueTotal().toLocaleString('es-CO') }}</span>
                <span class="text-[11px] text-[#2C5350] font-bold block">↑ +18% esta semana</span>
              </div>

              <div class="p-6 rounded-[28px] bg-white border border-[#E8D8D0] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#590E2A]/60 uppercase tracking-widest block">Ventas POS Presencial</span>
                <span class="text-3xl font-serif italic text-[#590E2A]">{{ '$' + posRevenueTotal().toLocaleString('es-CO') }}</span>
                <span class="text-[11px] text-[#2C5350] font-bold block">Sucursal La Dorada</span>
              </div>

              <div class="p-6 rounded-[28px] bg-white border border-[#E8D8D0] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#590E2A]/60 uppercase tracking-widest block">Pedidos Recibidos</span>
                <span class="text-3xl font-serif italic text-[#590E2A]">{{ orders().length }}</span>
                <span class="text-[11px] text-[#8C3A3A] font-bold block">{{ pendingOrdersCount() }} pendientes de envío</span>
              </div>

              <div class="p-6 rounded-[28px] bg-white border border-[#E8D8D0] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#590E2A]/60 uppercase tracking-widest block">Postres en Menú</span>
                <span class="text-3xl font-serif italic text-[#590E2A]">{{ products().length }}</span>
                <span class="text-[11px] text-[#590E2A]/60 font-medium">Sincronizados en Supabase</span>
              </div>
            </div>

            <!-- Recent Orders Preview -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 shadow-xs space-y-4">
              <h2 class="text-lg font-serif italic text-[#590E2A]">Últimos Pedidos Registrados</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#FDF8F4] text-[#590E2A]/60 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="p-3 rounded-l-2xl">ID Pedido</th>
                      <th class="p-3">Cliente</th>
                      <th class="p-3">Método</th>
                      <th class="p-3">Total</th>
                      <th class="p-3">Estado</th>
                      <th class="p-3 rounded-r-2xl">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8D8D0]">
                    @for (ord of orders(); track ord.id) {
                      <tr>
                        <td class="p-3 font-mono font-bold">{{ ord.id }}</td>
                        <td class="p-3 font-medium">{{ ord.cliente.nombre }}</td>
                        <td class="p-3 uppercase">{{ ord.metodoPago }}</td>
                        <td class="p-3 font-serif italic text-sm">{{ '$' + ord.total.toLocaleString('es-CO') }}</td>
                        <td class="p-3">
                          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D95578] text-[#590E2A]">
                            {{ ord.estado }}
                          </span>
                        </td>
                        <td class="p-3">
                          <button (click)="activeTab.set('pedidos')" class="text-[#590E2A] font-bold uppercase tracking-wider text-[10px] hover:underline">Gestionar</button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- TAB 2: PRODUCT & STOCK MANAGEMENT (CRUD) -->
        @if (activeTab() === 'productos') {
          <div class="space-y-6">
            
            <!-- Header with Add Button -->
            <div class="bg-white rounded-[32px] border border-[#E8D8D0] p-6 shadow-xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="text-lg font-serif italic text-[#590E2A]">Catálogo de Productos</h2>
                  <p class="text-xs text-[#590E2A]/60">{{ products().length }} productos registrados</p>
                </div>
                <button 
                  (click)="openProductModal()"
                  class="px-6 py-3 rounded-full bg-[#590E2A] hover:bg-[#3A0A1C] text-[#FDF8F4] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors flex items-center gap-2">
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
                      <th class="text-left p-4 font-bold text-[#590E2A]">Producto</th>
                      <th class="text-right p-4 font-bold text-[#590E2A]">Precio</th>
                      <th class="text-center p-4 font-bold text-[#590E2A]">Stock</th>
                      <th class="text-center p-4 font-bold text-[#590E2A]">Mín</th>
                      <th class="text-center p-4 font-bold text-[#590E2A]">Máx</th>
                      <th class="text-center p-4 font-bold text-[#590E2A]">Estado</th>
                      <th class="text-right p-4 font-bold text-[#590E2A]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (prod of products(); track prod.id) {
                      <tr class="border-b border-[#E8D8D0] last:border-0 hover:bg-[#FDF8F4] transition-colors">
                        <td class="p-4">
                          <div class="flex items-center gap-3">
                            <img [src]="prod.imagen_principal" alt="" class="w-12 h-12 rounded-xl object-cover border border-[#E8D8D0]">
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
                          <span class="font-mono font-bold" [class]="prod.stock <= prod.stock_minimo ? 'text-[#8C3A3A]' : prod.stock >= prod.stock_maximo ? 'text-[#2C5350]' : 'text-[#590E2A]'">
                            {{ prod.stock }}
                          </span>
                        </td>
                        <td class="p-4 text-center">
                          <span class="text-[#590E2A]/60 font-mono">{{ prod.stock_minimo }}</span>
                        </td>
                        <td class="p-4 text-center">
                          <span class="text-[#590E2A]/60 font-mono">{{ prod.stock_maximo }}</span>
                        </td>
                        <td class="p-4 text-center">
                          @if (prod.stock <= prod.stock_minimo) {
                            <span class="bg-[#8C3A3A]/10 text-[#8C3A3A] px-2.5 py-1 rounded-full text-[10px] font-bold">Stock Bajo</span>
                          } @else if (prod.stock >= prod.stock_maximo) {
                            <span class="bg-[#2C5350]/10 text-[#2C5350] px-2.5 py-1 rounded-full text-[10px] font-bold">Completo</span>
                          } @else if (!prod.disponible) {
                            <span class="bg-[#590E2A]/10 text-[#590E2A] px-2.5 py-1 rounded-full text-[10px] font-bold">Inactivo</span>
                          } @else {
                            <span class="bg-[#D95578]/10 text-[#D95578] px-2.5 py-1 rounded-full text-[10px] font-bold">Activo</span>
                          }
                        </td>
                        <td class="p-4 text-right">
                          <div class="flex items-center justify-end gap-2">
                            <button (click)="openProductModal(prod)" class="p-2 rounded-xl hover:bg-[#E0F2F1] text-[#2C5350] transition-colors" title="Editar">
                              <span class="material-icons text-sm">edit</span>
                            </button>
                            <button (click)="dataService.deleteProduct(prod.id)" class="p-2 rounded-xl hover:bg-[#8C3A3A]/10 text-[#8C3A3A] transition-colors" title="Eliminar">
                              <span class="material-icons text-sm">delete</span>
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

                <!-- Ingredient Selector -->
                <div class="bg-[#FDF8F4] rounded-2xl p-4 space-y-3">
                  <h3 class="text-xs font-bold text-[#590E2A] uppercase tracking-wider">Ingredientes del Producto</h3>
                  @for (tipo of ['base', 'crema', 'relleno', 'topping']; track tipo) {
                    @if (ingredientsByTipo(tipo).length > 0) {
                      <div>
                        <span class="text-[10px] font-bold text-[#590E2A]/60 uppercase tracking-wider block mb-1.5">{{ tipo }}</span>
                        <div class="flex flex-wrap gap-1.5">
                          @for (ing of ingredientsByTipo(tipo); track ing.id) {
                            <button
                              (click)="toggleIngredient(ing)"
                              [class]="isIngredientSelected(ing.id)
                                ? 'bg-[#D95578] text-white border-[#D95578]'
                                : 'bg-white text-[#590E2A] border-[#E8D8D0] hover:border-[#D95578]/50'"
                              class="px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all">
                              {{ ing.nombre }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  }
                  @if (selectedIngredientes().length > 0) {
                    <div class="pt-2 border-t border-[#E8D8D0]/50">
                      <span class="text-[10px] text-[#590E2A]/50">{{ selectedIngredientes().length }} ingredientes seleccionados</span>
                    </div>
                  }
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
          <div class="space-y-6">

            <!-- Header with Stats -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 class="text-2xl font-serif italic text-[#590E2A] font-bold">Pedidos Online</h2>
                <p class="text-xs text-[#590E2A]/60 mt-1">Gestiona los estados de los pedidos recibidos</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl border border-[#E8D8D0] text-xs">
                  <div class="text-center">
                    <span class="block text-lg font-bold text-[#D95578]">{{ pendingCount() }}</span>
                    <span class="text-[9px] text-[#590E2A]/50 uppercase tracking-wider">Pendientes</span>
                  </div>
                  <div class="border-l border-[#E8D8D0] pl-4 text-center">
                    <span class="block text-lg font-bold text-[#065F46]">{{ activeCount() }}</span>
                    <span class="text-[9px] text-[#590E2A]/50 uppercase tracking-wider">Activos</span>
                  </div>
                  <div class="border-l border-[#E8D8D0] pl-4 text-center">
                    <span class="block text-lg font-bold text-[#590E2A]/40">{{ deliveredTodayCount() }}</span>
                    <span class="text-[9px] text-[#590E2A]/50 uppercase tracking-wider">Entregados Hoy</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-2 overflow-x-auto pb-1">
              <button (click)="activeOrderFilter.set('all')"
                [class]="activeOrderFilter() === 'all' ? 'bg-[#590E2A] text-white' : 'bg-white text-[#590E2A] border border-[#E8D8D0]'"
                class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
                Todos ({{ orders().length }})
              </button>
              <button (click)="activeOrderFilter.set('pendiente')"
                [class]="activeOrderFilter() === 'pendiente' ? 'bg-[#D95578] text-white' : 'bg-white text-[#D95578] border border-[#D95578]/30'"
                class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
                📝 Pendientes ({{ pendingCount() }})
              </button>
              <button (click)="activeOrderFilter.set('en_preparacion')"
                [class]="activeOrderFilter() === 'en_preparacion' ? 'bg-[#D95578] text-white' : 'bg-white text-[#D95578] border border-[#D95578]/30'"
                class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
                🍡 En Cocina ({{ prepCount() }})
              </button>
              <button (click)="activeOrderFilter.set('en_camino')"
                [class]="activeOrderFilter() === 'en_camino' ? 'bg-[#3B82F6] text-white' : 'bg-white text-[#3B82F6] border border-[#3B82F6]/30'"
                class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
                🛵 En Camino ({{ deliveryCount() }})
              </button>
              <button (click)="activeOrderFilter.set('entregado')"
                [class]="activeOrderFilter() === 'entregado' ? 'bg-[#065F46] text-white' : 'bg-white text-[#065F46] border border-[#065F46]/30'"
                class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors">
                ✅ Entregados ({{ deliveredCount() }})
              </button>
            </div>

            <!-- Orders List -->
            @if (filteredOrdersForTab().length > 0) {
              <div class="space-y-4">
                @for (ord of filteredOrdersForTab(); track ord.id) {
                  <div [id]="'pedido-' + ord.id_pedido"
                    class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 sm:p-6 shadow-xs transition-all hover:shadow-md"
                    [class.ring-2]="highlightedPedidoId() === ord.id_pedido"
                    [class.ring-[#D95578]]="highlightedPedidoId() === ord.id_pedido"
                    [class.ring-offset-2]="highlightedPedidoId() === ord.id_pedido">
                    <!-- Order Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8D8D0]/50">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          [class]="getStatusIconClass(ord.estado)">
                          {{ getStatusEmoji(ord.estado) }}
                        </div>
                        <div>
                          <span class="font-mono font-bold text-[#590E2A] text-sm block">{{ ord.id }}</span>
                          <span class="text-[11px] text-[#590E2A]/60">{{ ord.fecha | date:'short' }}</span>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <span class="text-lg font-serif italic text-[#590E2A]">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                        <span [class]="getStatusBadgeClass(ord.estado)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {{ getStatusLabel(ord.estado) }}
                        </span>
                      </div>
                    </div>

                    <!-- Client Info -->
                    <div class="py-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider">Cliente</span>
                        <span class="font-bold text-[#590E2A]">{{ ord.cliente.nombre }}</span>
                        <span class="text-[#590E2A]/60 block">{{ ord.cliente.telefono }}</span>
                      </div>
                      <div>
                        <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider">Direccion</span>
                        <span class="text-[#590E2A]">{{ ord.cliente.direccion }}</span>
                      </div>
                      <div>
                        <span class="text-[#590E2A]/50 block text-[10px] uppercase tracking-wider">Pago</span>
                        <span class="text-[#590E2A]">{{ ord.metodoPago | uppercase }} — {{ ord.estadoPago }}</span>
                      </div>
                    </div>

                    <!-- Items -->
                    <div class="py-3 border-t border-[#E8D8D0]/50">
                      <div class="flex flex-wrap gap-2">
                        @for (item of ord.items; track item.productoId) {
                          <div class="flex items-center gap-2 bg-[#FDF8F4] px-3 py-1.5 rounded-full text-[11px]">
                            <img [src]="item.imagen" class="w-5 h-5 rounded-full object-cover">
                            <span class="font-medium text-[#590E2A]">{{ item.nombreEspanol }}</span>
                            <span class="text-[#590E2A]/50">x{{ item.cantidad }}</span>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Status Update Actions -->
                    <div class="pt-3 border-t border-[#E8D8D0]/50">
                      <div class="flex items-center justify-between">
                        <span class="text-[10px] font-bold uppercase tracking-wider text-[#590E2A]/40">Avanzar Estado:</span>
                        <div class="flex gap-2 flex-wrap justify-end">
                          @if (ord.estado === 'pendiente') {
                            <button (click)="updateOrderStatusAdmin(ord, 'en_preparacion')"
                              class="px-4 py-2 rounded-full bg-[#D95578] text-white text-xs font-bold hover:bg-[#FF6078] transition-colors shadow-xs">
                              🍡 Poner en Cocina
                            </button>
                          }
                          @if (ord.estado === 'en_preparacion') {
                            <button (click)="updateOrderStatusAdmin(ord, 'en_camino')"
                              class="px-4 py-2 rounded-full bg-[#3B82F6] text-white text-xs font-bold hover:bg-[#2563EB] transition-colors shadow-xs">
                              🛵 Marcar En Camino
                            </button>
                          }
                          @if (ord.estado === 'en_camino') {
                            <button (click)="updateOrderStatusAdmin(ord, 'entregado')"
                              class="px-4 py-2 rounded-full bg-[#065F46] text-white text-xs font-bold hover:bg-[#047857] transition-colors shadow-xs">
                              ✅ Marcar Entregado
                            </button>
                          }
                          @if (ord.estado !== 'entregado' && ord.estado !== 'cancelado') {
                            <button (click)="updateOrderStatusAdmin(ord, 'cancelado')"
                              class="px-3 py-2 rounded-full bg-white border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-colors">
                              Cancelar
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="text-center py-16 bg-white rounded-[32px] border border-[#E8D8D0] space-y-4">
                <span class="material-icons text-5xl text-[#E8D8D0]">inventory_2</span>
                <div>
                  <h3 class="text-lg font-serif italic text-[#590E2A]">Sin pedidos</h3>
                  <p class="text-xs text-[#590E2A]/50 mt-1">
                    @if (activeOrderFilter() === 'all') {
                      No hay pedidos online todavia.
                    } @else {
                      No hay pedidos con este estado.
                    }
                  </p>
                </div>
              </div>
            }

          </div>
        }

        <!-- TAB 4: VENTAS -->
        @if (activeTab() === 'detalles') {
          <div class="space-y-6">

            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 class="text-2xl font-serif italic text-[#590E2A] font-bold">Ventas</h2>
                <p class="text-xs text-[#590E2A]/60 mt-1">Historial completo de ventas online y presenciales</p>
              </div>
            </div>

            <!-- Revenue Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest block">Ingresos Totales</span>
                <span class="text-2xl font-serif italic text-[#590E2A] mt-1 block">{{ '$' + totalSalesRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">{{ dataService.detallePedidos().length }} transacciones</span>
              </div>
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest block">🌐 Ventas Online</span>
                <span class="text-2xl font-serif italic text-[#2C5350] mt-1 block">{{ '$' + onlineSalesRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">{{ dataService.detallePedidosOnline().length }} pedidos</span>
              </div>
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest block">🏪 Ventas POS</span>
                <span class="text-2xl font-serif italic text-[#E65100] mt-1 block">{{ '$' + localSalesRevenue().toLocaleString('es-CO') }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">{{ dataService.detallePedidosLocal().length }} ventas</span>
              </div>
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <span class="text-[10px] font-bold text-[#590E2A]/50 uppercase tracking-widest block">Unidades Vendidas</span>
                <span class="text-2xl font-serif italic text-[#D95578] mt-1 block">{{ totalItemsSold() }}</span>
                <span class="text-[10px] text-[#590E2A]/40 mt-1 block">productos totales</span>
              </div>
            </div>

            <!-- Top Products + Filters -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <!-- Top Products -->
              <div class="bg-white rounded-[24px] border border-[#E8D8D0] p-5 shadow-xs">
                <h3 class="text-sm font-serif italic text-[#590E2A] font-bold mb-4">Top Productos</h3>
                @if (topProducts().length > 0) {
                  <div class="space-y-3">
                    @for (prod of topProducts(); track prod.nombre; let i = $index) {
                      <div class="flex items-center gap-3">
                        <span class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                          [class]="i === 0 ? 'bg-[#D95578] text-white' : i === 1 ? 'bg-[#E8D8D0] text-[#590E2A]' : 'bg-[#FDF8F4] text-[#590E2A]/60'">
                          {{ i + 1 }}
                        </span>
                        @if (prod.imagen) {
                          <img [src]="prod.imagen" class="w-8 h-8 rounded-lg object-cover border border-[#E8D8D0]">
                        }
                        <div class="flex-1 min-w-0">
                          <span class="text-xs font-bold text-[#590E2A] block truncate">{{ prod.nombre }}</span>
                          <span class="text-[10px] text-[#590E2A]/50">{{ prod.cantidad }} uds · {{ '$' + prod.subtotal.toLocaleString('es-CO') }}</span>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-xs text-[#590E2A]/40 text-center py-4">Sin ventas registradas</p>
                }
              </div>

              <!-- Sales Table -->
              <div class="lg:col-span-2 bg-white rounded-[24px] border border-[#E8D8D0] shadow-xs overflow-hidden">

                <!-- Filter Tabs -->
                <div class="flex gap-2 p-4 border-b border-[#E8D8D0]/50">
                  <button (click)="detalleOrigenFilter.set('todos')"
                    [class]="detalleOrigenFilter() === 'todos' ? 'bg-[#590E2A] text-white' : 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]'"
                    class="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors">
                    Todos ({{ dataService.detallePedidos().length }})
                  </button>
                  <button (click)="detalleOrigenFilter.set('online')"
                    [class]="detalleOrigenFilter() === 'online' ? 'bg-[#2C5350] text-white' : 'bg-[#FDF8F4] text-[#2C5350] border border-[#E8D8D0]'"
                    class="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors">
                    🌐 Online ({{ dataService.detallePedidosOnline().length }})
                  </button>
                  <button (click)="detalleOrigenFilter.set('local')"
                    [class]="detalleOrigenFilter() === 'local' ? 'bg-[#E65100] text-white' : 'bg-[#FDF8F4] text-[#E65100] border border-[#E8D8D0]'"
                    class="px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors">
                    🏪 POS ({{ dataService.detallePedidosLocal().length }})
                  </button>
                </div>

                <!-- Table -->
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-[#FDF8F4] text-[#590E2A]/60 font-bold uppercase tracking-wider">
                      <tr>
                        <th class="p-3 rounded-l-2xl">Producto</th>
                        <th class="p-3">Origen</th>
                        <th class="p-3">Pedido</th>
                        <th class="p-3 text-center">Cant.</th>
                        <th class="p-3 text-right">P. Unit.</th>
                        <th class="p-3 text-right rounded-r-2xl">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#E8D8D0]">
                      @for (det of filteredDetalles(); track det.id_detalle) {
                        <tr class="hover:bg-[#FDF8F4] transition-colors">
                          <td class="p-3">
                            <div class="flex items-center gap-2">
                              @if (det.producto?.imagen_principal) {
                                <img [src]="det.producto?.imagen_principal" class="w-8 h-8 rounded-lg object-cover border border-[#E8D8D0]">
                              }
                              <span class="font-medium text-[#590E2A]">{{ det.producto?.nombre_espanol || ' #' + det.id_producto }}</span>
                            </div>
                          </td>
                          <td class="p-3">
                            <span
                              [class]="det.origen === 'online' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FFF3E0] text-[#E65100]'"
                              class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                              {{ det.origen === 'online' ? '🌐' : '🏪' }}
                            </span>
                          </td>
                          <td class="p-3 font-mono text-[#590E2A]/70">#{{ det.id_pedido }}</td>
                          <td class="p-3 text-center font-bold text-[#590E2A]">{{ det.cantidad }}</td>
                          <td class="p-3 text-right font-mono text-[#590E2A]/70">{{ '$' + det.precio_unitario.toLocaleString('es-CO') }}</td>
                          <td class="p-3 text-right font-bold font-serif italic text-[#590E2A]">{{ '$' + det.subtotal.toLocaleString('es-CO') }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="6" class="p-8 text-center text-[#590E2A]/40">
                            <span class="material-icons text-3xl block mb-2 text-[#E8D8D0]">receipt_long</span>
                            No hay ventas registradas aún
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
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
                <div>
                  <h2 class="text-2xl font-serif italic text-[#590E2A]">Gestión de Usuarios</h2>
                  <p class="text-xs text-[#590E2A]/70">Admin, Empleado o Cliente. Edita datos y direcciones.</p>
                </div>
                <button (click)="reloadUsers()" class="px-4 py-2 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[10px] font-bold text-[#590E2A] hover:bg-[#D95578] transition-colors uppercase tracking-wider">
                  🔄 Recargar
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#FDF8F4] text-[#590E2A]/60 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="p-3 rounded-l-2xl">Usuario</th>
                      <th class="p-3">Email</th>
                      <th class="p-3">Teléfono</th>
                      <th class="p-3">Rol</th>
                      <th class="p-3">Direcciones</th>
                      <th class="p-3 rounded-r-2xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#E8D8D0]">
                    @for (usr of supabaseService.usuarios(); track usr.id) {
                      <tr>
                        <td class="p-3 font-medium flex items-center gap-2">
                          <img [src]="usr.foto_perfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'" alt="Foto" class="w-8 h-8 rounded-full object-cover">
                          <div>
                            <span class="font-bold text-[#590E2A] block">{{ usr.nombre_completo }}</span>
                            <span class="text-[9px] text-[#590E2A]/50 font-mono">{{ usr.id.substring(0, 8) }}...</span>
                          </div>
                        </td>
                        <td class="p-3 font-mono">{{ usr.email }}</td>
                        <td class="p-3">{{ usr.telefono || '—' }}</td>
                        <td class="p-3">
                          <span 
                            [class]="usr.rol === 'admin' ? 'bg-[#D95578] text-[#590E2A]' : usr.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FDF8F4] text-[#590E2A]'"
                            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#E8D8D0]">
                            {{ usr.rol }}
                          </span>
                        </td>
                        <td class="p-3">
                          <button (click)="viewAddresses(usr)" class="px-3 py-1 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] text-[10px] font-bold text-[#590E2A] hover:bg-[#D95578] transition-colors">
                            📍 Ver
                          </button>
                        </td>
                        <td class="p-3">
                          <div class="flex items-center gap-2">
                            <select 
                              [value]="usr.rol"
                              (change)="onRoleChange(usr.id, $any($event.target).value)"
                              class="px-3 py-1.5 rounded-full bg-white border border-[#E8D8D0] text-[11px] font-bold text-[#590E2A]">
                              <option value="admin">Admin</option>
                              <option value="empleado">Empleado</option>
                              <option value="cliente">Cliente</option>
                            </select>
                            <button (click)="editUser(usr)" class="w-7 h-7 rounded-full bg-[#FDF8F4] border border-[#E8D8D0] flex items-center justify-center hover:bg-[#D95578] transition-colors" title="Editar">
                              <span class="material-icons text-[#590E2A]" style="font-size: 14px">edit</span>
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

      </div>
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

  activeTab = signal<'dashboard' | 'productos' | 'pedidos' | 'detalles' | 'usuarios' | 'editor'>('dashboard');
  detalleOrigenFilter = signal<'todos' | 'online' | 'local'>('todos');
  editingUser = signal<Usuario | null>(null);
  editingProduct = signal<Product | null>(null);
  showProductModal = signal<boolean>(false);
  productImagePreview = signal<string | null>(null);
  selectedProductFile = signal<File | null>(null);
  viewingAddresses = signal<Usuario | null>(null);
  userAddresses = signal<Direccion[]>([]);
  highlightedPedidoId = signal<number | null>(null);
  activeOrderFilter = signal<string>('all');
  availableIngredientes = signal<{ id: number; nombre: string; tipo: string }[]>([]);
  selectedIngredientes = signal<{ id: number; nombre: string; tipo: string }[]>([]);

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
    const tabMap: Record<string, 'dashboard' | 'productos' | 'pedidos' | 'detalles' | 'usuarios' | 'editor'> = {
      '': 'dashboard',
      'productos': 'productos',
      'pedidos': 'pedidos',
      'detalles': 'detalles',
      'usuarios': 'usuarios',
      'blog': 'dashboard',
    };
    this.activeTab.set(tabMap[segment] ?? 'dashboard');
  }

  config = this.dataService.visualConfig;
  products = this.dataService.products;
  orders = this.dataService.orders;

  filteredDetalles = computed(() => {
    const filter = this.detalleOrigenFilter();
    if (filter === 'online') return this.dataService.detallePedidosOnline();
    if (filter === 'local') return this.dataService.detallePedidosLocal();
    return this.dataService.detallePedidos();
  });

  pendingOrdersCount = computed(() => {
    return this.orders().filter(o => o.estado !== 'entregado').length;
  });

  onlineRevenueTotal = computed(() => {
    return this.orders().reduce((sum, o) => sum + o.total, 0);
  });

  posRevenueTotal = computed(() => {
    return this.dataService.posSales().reduce((sum, s) => sum + s.total, 0);
  });

  filteredOrdersForTab = computed(() => {
    const filter = this.activeOrderFilter();
    const orders = this.orders();
    if (filter === 'all') return orders;
    return orders.filter(o => o.estado === filter);
  });

  pendingCount = computed(() => this.orders().filter(o => o.estado === 'pendiente').length);
  prepCount = computed(() => this.orders().filter(o => o.estado === 'en_preparacion').length);
  deliveryCount = computed(() => this.orders().filter(o => o.estado === 'en_camino').length);
  deliveredCount = computed(() => this.orders().filter(o => o.estado === 'entregado').length);
  activeCount = computed(() => this.orders().filter(o => ['pendiente', 'en_preparacion', 'en_camino'].includes(o.estado)).length);
  deliveredTodayCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.orders().filter(o => o.estado === 'entregado' && o.fecha?.startsWith(today)).length;
  });

  totalSalesRevenue = computed(() => {
    return this.dataService.detallePedidos().reduce((sum, d) => sum + d.subtotal, 0);
  });
  onlineSalesRevenue = computed(() => {
    return this.dataService.detallePedidosOnline().reduce((sum, d) => sum + d.subtotal, 0);
  });
  localSalesRevenue = computed(() => {
    return this.dataService.detallePedidosLocal().reduce((sum, d) => sum + d.subtotal, 0);
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

  async updateOrderStatusAdmin(order: Order, newStatus: OrderStatus) {
    await this.dataService.updateOrderStatus(order.id, newStatus, order.id_pedido);
  }

  getStatusEmoji(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return '📝';
      case 'en_preparacion': return '🍡';
      case 'en_camino': return '🛵';
      case 'entregado': return '✅';
      case 'cancelado': return '❌';
      default: return '📋';
    }
  }

  getStatusIconClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28]';
      case 'en_preparacion': return 'bg-[#D95578] text-[#590E2A]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350]';
      case 'cancelado': return 'bg-red-50 text-red-500';
      default: return 'bg-[#FDF8F4] text-[#590E2A]';
    }
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'bg-[#FFF3E0] text-[#6B4E28] border border-[#ffe0b2]';
      case 'en_preparacion': return 'bg-[#D95578] text-[#590E2A] border border-[#E8D8D0]';
      case 'en_camino': return 'bg-[#E8EAF6] text-[#283593] border border-[#c5cae9]';
      case 'entregado': return 'bg-[#E0F2F1] text-[#2C5350] border border-[#b2dfdb]';
      case 'cancelado': return 'bg-red-50 text-red-500 border border-red-200';
      default: return 'bg-[#FDF8F4] text-[#590E2A] border border-[#E8D8D0]';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case 'pendiente': return 'Recibido';
      case 'en_preparacion': return 'En Cocina';
      case 'en_camino': return 'En Camino';
      case 'entregado': return 'Entregado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
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

