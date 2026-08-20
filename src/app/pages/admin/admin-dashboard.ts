import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { UserRole, Usuario, Direccion, Product } from '../../models/mochi.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FAF7F2] text-[#4A3F35] min-h-screen p-4 sm:p-8 font-sans">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Admin Header -->
        <div class="bg-white rounded-[32px] p-6 sm:p-8 border border-[#EBE3D5] shadow-xs">
          <div class="flex items-center gap-2">
            <span class="px-3.5 py-1 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#EBE3D5]">
              Panel de Administración
            </span>
          </div>
          <h1 class="text-3xl font-serif italic text-[#4A3F35] mt-2">
            Mochi. Control Center
          </h1>
          <p class="text-xs text-[#4A3F35]/70 uppercase tracking-wider mt-1 font-medium">Gestión de catálogo, pedidos, usuarios y configuración</p>
        </div>

        <!-- TAB 1: DASHBOARD METRICS -->
        @if (activeTab() === 'dashboard') {
          <div class="space-y-8">
            <!-- Key Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div class="p-6 rounded-[28px] bg-white border border-[#EBE3D5] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#4A3F35]/60 uppercase tracking-widest block">Ventas Online Totales</span>
                <span class="text-3xl font-serif italic text-[#4A3F35]">{{ '$' + onlineRevenueTotal().toLocaleString('es-CO') }}</span>
                <span class="text-[11px] text-[#2C5350] font-bold block">↑ +18% esta semana</span>
              </div>

              <div class="p-6 rounded-[28px] bg-white border border-[#EBE3D5] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#4A3F35]/60 uppercase tracking-widest block">Ventas POS Presencial</span>
                <span class="text-3xl font-serif italic text-[#4A3F35]">{{ '$' + posRevenueTotal().toLocaleString('es-CO') }}</span>
                <span class="text-[11px] text-[#2C5350] font-bold block">Sucursal La Dorada</span>
              </div>

              <div class="p-6 rounded-[28px] bg-white border border-[#EBE3D5] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#4A3F35]/60 uppercase tracking-widest block">Pedidos Recibidos</span>
                <span class="text-3xl font-serif italic text-[#4A3F35]">{{ orders().length }}</span>
                <span class="text-[11px] text-[#8C3A3A] font-bold block">{{ pendingOrdersCount() }} pendientes de envío</span>
              </div>

              <div class="p-6 rounded-[28px] bg-white border border-[#EBE3D5] shadow-xs space-y-2">
                <span class="text-[10px] font-bold text-[#4A3F35]/60 uppercase tracking-widest block">Postres en Menú</span>
                <span class="text-3xl font-serif italic text-[#4A3F35]">{{ products().length }}</span>
                <span class="text-[11px] text-[#4A3F35]/60 font-medium">Sincronizados en Supabase</span>
              </div>
            </div>

            <!-- Recent Orders Preview -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 shadow-xs space-y-4">
              <h2 class="text-lg font-serif italic text-[#4A3F35]">Últimos Pedidos Registrados</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#FAF7F2] text-[#4A3F35]/60 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="p-3 rounded-l-2xl">ID Pedido</th>
                      <th class="p-3">Cliente</th>
                      <th class="p-3">Método</th>
                      <th class="p-3">Total</th>
                      <th class="p-3">Estado</th>
                      <th class="p-3 rounded-r-2xl">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#EBE3D5]">
                    @for (ord of orders(); track ord.id) {
                      <tr>
                        <td class="p-3 font-mono font-bold">{{ ord.id }}</td>
                        <td class="p-3 font-medium">{{ ord.cliente.nombre }}</td>
                        <td class="p-3 uppercase">{{ ord.metodoPago }}</td>
                        <td class="p-3 font-serif italic text-sm">{{ '$' + ord.total.toLocaleString('es-CO') }}</td>
                        <td class="p-3">
                          <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFD6E0] text-[#4A3F35]">
                            {{ ord.estado }}
                          </span>
                        </td>
                        <td class="p-3">
                          <button (click)="activeTab.set('pedidos')" class="text-[#4A3F35] font-bold uppercase tracking-wider text-[10px] hover:underline">Gestionar</button>
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
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 shadow-xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="text-lg font-serif italic text-[#4A3F35]">Catálogo de Productos</h2>
                  <p class="text-xs text-[#4A3F35]/60">{{ products().length }} productos registrados</p>
                </div>
                <button 
                  (click)="openProductModal()"
                  class="px-6 py-3 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors flex items-center gap-2">
                  <span class="material-icons text-sm">add</span>
                  Nuevo Producto
                </button>
              </div>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] shadow-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-xs">
                  <thead>
                    <tr class="border-b border-[#EBE3D5] bg-[#FAF7F2]">
                      <th class="text-left p-4 font-bold text-[#4A3F35]">Producto</th>
                      <th class="text-left p-4 font-bold text-[#4A3F35]">Categoría</th>
                      <th class="text-right p-4 font-bold text-[#4A3F35]">Precio</th>
                      <th class="text-center p-4 font-bold text-[#4A3F35]">Stock</th>
                      <th class="text-center p-4 font-bold text-[#4A3F35]">Mín</th>
                      <th class="text-center p-4 font-bold text-[#4A3F35]">Máx</th>
                      <th class="text-center p-4 font-bold text-[#4A3F35]">Estado</th>
                      <th class="text-right p-4 font-bold text-[#4A3F35]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (prod of products(); track prod.id) {
                      <tr class="border-b border-[#EBE3D5] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                        <td class="p-4">
                          <div class="flex items-center gap-3">
                            <img [src]="prod.imagen_principal" alt="" class="w-12 h-12 rounded-xl object-cover border border-[#EBE3D5]">
                            <div>
                              <span class="font-serif italic text-[#4A3F35] block text-sm font-medium">{{ prod.nombre_espanol }}</span>
                              <span class="text-[#4A3F35]/50 block text-[10px]">{{ prod.nombre_japones }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="p-4">
                          <span class="bg-[#FDF5F0] text-[#4A3F35] px-3 py-1 rounded-full text-[10px] font-bold">
                            Cat. {{ prod.id_categoria }}
                          </span>
                        </td>
                        <td class="p-4 text-right">
                          <span class="font-serif italic font-bold text-[#4A3F35]">
                            {{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}
                          </span>
                          @if (prod.precio_oferta) {
                            <span class="text-[#4A3F35]/40 line-through block text-[10px]">{{ '$' + prod.precio.toLocaleString('es-CO') }}</span>
                          }
                        </td>
                        <td class="p-4 text-center">
                          <span class="font-mono font-bold" [class]="prod.stock <= prod.stock_minimo ? 'text-[#8C3A3A]' : prod.stock >= prod.stock_maximo ? 'text-[#2C5350]' : 'text-[#4A3F35]'">
                            {{ prod.stock }}
                          </span>
                        </td>
                        <td class="p-4 text-center">
                          <span class="text-[#4A3F35]/60 font-mono">{{ prod.stock_minimo }}</span>
                        </td>
                        <td class="p-4 text-center">
                          <span class="text-[#4A3F35]/60 font-mono">{{ prod.stock_maximo }}</span>
                        </td>
                        <td class="p-4 text-center">
                          @if (prod.stock <= prod.stock_minimo) {
                            <span class="bg-[#8C3A3A]/10 text-[#8C3A3A] px-2.5 py-1 rounded-full text-[10px] font-bold">Stock Bajo</span>
                          } @else if (prod.stock >= prod.stock_maximo) {
                            <span class="bg-[#2C5350]/10 text-[#2C5350] px-2.5 py-1 rounded-full text-[10px] font-bold">Completo</span>
                          } @else if (!prod.disponible) {
                            <span class="bg-[#4A3F35]/10 text-[#4A3F35] px-2.5 py-1 rounded-full text-[10px] font-bold">Inactivo</span>
                          } @else {
                            <span class="bg-[#FF758F]/10 text-[#FF758F] px-2.5 py-1 rounded-full text-[10px] font-bold">Activo</span>
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
            <div class="relative bg-white rounded-[32px] border border-[#EBE3D5] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              
              <!-- Modal Header -->
              <div class="sticky top-0 bg-white border-b border-[#EBE3D5] p-6 rounded-t-[32px] z-10">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-serif italic text-[#4A3F35]">
                    {{ editingProduct() ? 'Editar Producto' : 'Nuevo Producto' }}
                  </h2>
                  <button (click)="closeProductModal()" class="p-2 rounded-xl hover:bg-[#FAF7F2] text-[#4A3F35]/60 transition-colors">
                    <span class="material-icons">close</span>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="p-6 space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="font-bold text-[#4A3F35] block mb-1.5 text-xs">Nombre Japonés</label>
                    <input #mjap type="text" [value]="editingProduct()?.nombre_japones || ''" placeholder="Ej. Matcha Mochi" 
                      class="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-sm focus:outline-none focus:border-[#FF758F]">
                  </div>
                  <div>
                    <label class="font-bold text-[#4A3F35] block mb-1.5 text-xs">Nombre Español *</label>
                    <input #mesp type="text" [value]="editingProduct()?.nombre_espanol || ''" placeholder="Ej. Mochi de Té Verde" 
                      class="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-sm focus:outline-none focus:border-[#FF758F]">
                  </div>
                  <div>
                    <label class="font-bold text-[#4A3F35] block mb-1.5 text-xs">Precio COP *</label>
                    <input #mprice type="number" [value]="editingProduct()?.precio || ''" placeholder="9500" 
                      class="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-sm focus:outline-none focus:border-[#FF758F]">
                  </div>
                  <div>
                    <label class="font-bold text-[#4A3F35] block mb-1.5 text-xs">URL Imagen</label>
                    <input #mimg type="text" [value]="editingProduct()?.imagen_principal || ''" placeholder="https://..." 
                      class="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-sm focus:outline-none focus:border-[#FF758F]">
                  </div>
                </div>

                <!-- Stock Section -->
                <div class="bg-[#FAF7F2] rounded-2xl p-4 space-y-4">
                  <h3 class="text-xs font-bold text-[#4A3F35] uppercase tracking-wider">Control de Inventario</h3>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="font-bold text-[#4A3F35] block mb-1.5 text-[10px]">Stock Actual</label>
                      <input #mstock type="number" [value]="editingProduct()?.stock || 20" 
                        class="w-full p-3 rounded-2xl bg-white border border-[#EBE3D5] text-[#4A3F35] text-sm font-mono focus:outline-none focus:border-[#FF758F]">
                    </div>
                    <div>
                      <label class="font-bold text-[#4A3F35] block mb-1.5 text-[10px]">Mínimo</label>
                      <input #mstockmin type="number" [value]="editingProduct()?.stock_minimo || 10" 
                        class="w-full p-3 rounded-2xl bg-white border border-[#EBE3D5] text-[#4A3F35] text-sm font-mono focus:outline-none focus:border-[#FF758F]">
                    </div>
                    <div>
                      <label class="font-bold text-[#4A3F35] block mb-1.5 text-[10px]">Máximo</label>
                      <input #mstockmax type="number" [value]="editingProduct()?.stock_maximo || 500" 
                        class="w-full p-3 rounded-2xl bg-white border border-[#EBE3D5] text-[#4A3F35] text-sm font-mono focus:outline-none focus:border-[#FF758F]">
                    </div>
                  </div>
                </div>

                <!-- Description -->
                <div>
                  <label class="font-bold text-[#4A3F35] block mb-1.5 text-xs">Descripción Corta</label>
                  <input #mdesc type="text" [value]="editingProduct()?.descripcion_corta || ''" placeholder="Postre japonés artesanal..." 
                    class="w-full p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] text-sm focus:outline-none focus:border-[#FF758F]">
                </div>

                <!-- Toggles -->
                <div class="flex gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" #mdisp [checked]="editingProduct()?.disponible ?? true" 
                      class="w-4 h-4 rounded border-[#EBE3D5] text-[#FF758F] focus:ring-[#FF758F]">
                    <span class="text-xs font-bold text-[#4A3F35]">Disponible</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" #mdest [checked]="editingProduct()?.destacado ?? false" 
                      class="w-4 h-4 rounded border-[#EBE3D5] text-[#FF758F] focus:ring-[#FF758F]">
                    <span class="text-xs font-bold text-[#4A3F35]">Destacado</span>
                  </label>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="sticky bottom-0 bg-white border-t border-[#EBE3D5] p-6 rounded-b-[32px]">
                <div class="flex gap-3">
                  <button (click)="closeProductModal()" 
                    class="flex-1 py-3 rounded-full border border-[#EBE3D5] text-[#4A3F35] font-bold text-xs uppercase tracking-widest hover:bg-[#FAF7F2] transition-colors">
                    Cancelar
                  </button>
                  <button (click)="saveProductModal(mesp.value, mjap.value, mprice.value, mimg.value, mstock.value, mstockmin.value, mstockmax.value, mdesc.value, mdisp.checked, mdest.checked)" 
                    class="flex-1 py-3 rounded-full bg-[#FF758F] hover:bg-[#FF6080] text-white font-bold text-xs uppercase tracking-widest shadow-xs transition-colors">
                    {{ editingProduct() ? '✓ Guardar Cambios' : '+ Crear Producto' }}
                  </button>
                </div>
              </div>

            </div>
          </div>
        }

        <!-- TAB 3: ORDER STATUS MANAGEMENT -->
        @if (activeTab() === 'pedidos') {
          <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-6">
            <h2 class="text-lg font-serif italic text-[#4A3F35]">Gestión de Estados de Pedidos Online</h2>

            <div class="space-y-4">
              @for (ord of orders(); track ord.id) {
                <div class="p-5 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span class="font-mono font-bold text-[#4A3F35] text-sm block">{{ ord.id }}</span>
                    <span class="text-[#4A3F35]/80 block mt-0.5">Cliente: {{ ord.cliente.nombre }} ({{ ord.cliente.telefono }})</span>
                    <span class="text-[#4A3F35]/60 block">Dirección: {{ ord.cliente.direccion }} (ID: {{ ord.id_direccion || 101 }})</span>
                  </div>

                  <div class="flex items-center gap-3">
                    <span class="font-serif italic text-base text-[#4A3F35]">{{ '$' + ord.total.toLocaleString('es-CO') }}</span>
                    
                    <select 
                      [value]="ord.estado"
                      (change)="dataService.updateOrderStatus(ord.id, $any($event.target).value)"
                      class="px-4 py-2.5 rounded-full bg-white border border-[#EBE3D5] text-xs font-bold text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                      <option value="pendiente">1. Pendiente</option>
                      <option value="en_preparacion">2. En Cocina Artesanal</option>
                      <option value="en_camino">3. En Camino</option>
                      <option value="entregado">4. Entregado</option>
                    </select>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 4: UNIFIED DETALLE_PEDIDO (Schema Supabase) -->
        @if (activeTab() === 'detalles') {
          <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3D5] pb-4">
              <div>
                <h2 class="text-2xl font-serif italic text-[#4A3F35]">Tabla Unificada detalle_pedido</h2>
                <p class="text-xs text-[#4A3F35]/70">Unificación de compras online y ventas POS presenciales con discriminación por columna origen ('online' | 'local')</p>
              </div>

              <!-- Filter by Origin -->
              <div class="flex items-center gap-2 text-xs font-bold">
                <button 
                  (click)="detalleOrigenFilter.set('todos')"
                  [class]="detalleOrigenFilter() === 'todos' ? 'bg-[#4A3F35] text-white' : 'bg-[#FAF7F2] text-[#4A3F35]'"
                  class="px-3.5 py-1.5 rounded-full border border-[#EBE3D5]">
                  Todos ({{ dataService.detallePedidos().length }})
                </button>
                <button 
                  (click)="detalleOrigenFilter.set('online')"
                  [class]="detalleOrigenFilter() === 'online' ? 'bg-[#4A3F35] text-white' : 'bg-[#FAF7F2] text-[#4A3F35]'"
                  class="px-3.5 py-1.5 rounded-full border border-[#EBE3D5]">
                  🌐 Online ({{ dataService.detallePedidosOnline().length }})
                </button>
                <button 
                  (click)="detalleOrigenFilter.set('local')"
                  [class]="detalleOrigenFilter() === 'local' ? 'bg-[#4A3F35] text-white' : 'bg-[#FAF7F2] text-[#4A3F35]'"
                  class="px-3.5 py-1.5 rounded-full border border-[#EBE3D5]">
                  🏪 POS Local ({{ dataService.detallePedidosLocal().length }})
                </button>
              </div>
            </div>

            <!-- Detalle Pedido Records Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-[#FAF7F2] text-[#4A3F35]/60 font-bold uppercase tracking-wider">
                  <tr>
                    <th class="p-3 rounded-l-2xl">ID Detalle</th>
                    <th class="p-3">Origen</th>
                    <th class="p-3">ID Pedido / Venta</th>
                    <th class="p-3">Producto</th>
                    <th class="p-3">Cantidad</th>
                    <th class="p-3">Precio Unitario</th>
                    <th class="p-3 rounded-r-2xl">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#EBE3D5]">
                  @for (det of filteredDetalles(); track det.id_detalle) {
                    <tr>
                      <td class="p-3 font-mono font-bold text-[#4A3F35]">#{{ det.id_detalle }}</td>
                      <td class="p-3">
                        <span 
                          [class]="det.origen === 'online' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FFF3E0] text-[#E65100]'"
                          class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase">
                          {{ det.origen === 'online' ? '🌐 Online' : '🏪 POS Local' }}
                        </span>
                      </td>
                      <td class="p-3 font-mono">
                        Ped #{{ det.id_pedido }}
                      </td>
                      <td class="p-3 font-medium font-serif italic text-sm">
                        {{ det.producto?.nombre_espanol || 'Producto #' + det.id_producto }}
                      </td>
                      <td class="p-3 font-bold">{{ det.cantidad }} un.</td>
                      <td class="p-3 font-mono">{{ '$' + det.precio_unitario.toLocaleString('es-CO') }}</td>
                      <td class="p-3 font-bold font-serif italic text-sm">{{ '$' + det.subtotal.toLocaleString('es-CO') }}</td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="7" class="p-8 text-center text-[#4A3F35]/60">
                        No hay registros en detalle_pedido aún. Realiza compras online o ventas en el POS para ver los detalles.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- TAB 5: USUARIOS & ROLES -->
        @if (activeTab() === 'usuarios') {
          <div class="space-y-6">
            <!-- Users & Roles Management -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-serif italic text-[#4A3F35]">Gestión de Usuarios</h2>
                  <p class="text-xs text-[#4A3F35]/70">Admin, Empleado o Cliente. Edita datos y direcciones.</p>
                </div>
                <button (click)="reloadUsers()" class="px-4 py-2 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[10px] font-bold text-[#4A3F35] hover:bg-[#FFD6E0] transition-colors uppercase tracking-wider">
                  🔄 Recargar
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#FAF7F2] text-[#4A3F35]/60 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="p-3 rounded-l-2xl">Usuario</th>
                      <th class="p-3">Email</th>
                      <th class="p-3">Teléfono</th>
                      <th class="p-3">Rol</th>
                      <th class="p-3">Direcciones</th>
                      <th class="p-3 rounded-r-2xl">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#EBE3D5]">
                    @for (usr of supabaseService.usuarios(); track usr.id) {
                      <tr>
                        <td class="p-3 font-medium flex items-center gap-2">
                          <img [src]="usr.foto_perfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'" alt="Foto" class="w-8 h-8 rounded-full object-cover">
                          <div>
                            <span class="font-bold text-[#4A3F35] block">{{ usr.nombre_completo }}</span>
                            <span class="text-[9px] text-[#4A3F35]/50 font-mono">{{ usr.id.substring(0, 8) }}...</span>
                          </div>
                        </td>
                        <td class="p-3 font-mono">{{ usr.email }}</td>
                        <td class="p-3">{{ usr.telefono || '—' }}</td>
                        <td class="p-3">
                          <span 
                            [class]="usr.rol === 'admin' ? 'bg-[#FFD6E0] text-[#4A3F35]' : usr.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FAF7F2] text-[#4A3F35]'"
                            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#EBE3D5]">
                            {{ usr.rol }}
                          </span>
                        </td>
                        <td class="p-3">
                          <button (click)="viewAddresses(usr)" class="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[10px] font-bold text-[#4A3F35] hover:bg-[#FFD6E0] transition-colors">
                            📍 Ver
                          </button>
                        </td>
                        <td class="p-3">
                          <div class="flex items-center gap-2">
                            <select 
                              [value]="usr.rol"
                              (change)="onRoleChange(usr.id, $any($event.target).value)"
                              class="px-3 py-1.5 rounded-full bg-white border border-[#EBE3D5] text-[11px] font-bold text-[#4A3F35]">
                              <option value="admin">Admin</option>
                              <option value="empleado">Empleado</option>
                              <option value="cliente">Cliente</option>
                            </select>
                            <button (click)="editUser(usr)" class="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] flex items-center justify-center hover:bg-[#FFD6E0] transition-colors" title="Editar">
                              <span class="material-icons text-[#4A3F35]" style="font-size: 14px">edit</span>
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
              <div class="fixed inset-0 z-50 bg-[#4A3F35]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#EBE3D5]">
                  <div class="flex items-center justify-between">
                    <h3 class="text-xl font-serif italic text-[#4A3F35]">Editar Usuario</h3>
                    <button (click)="editingUser.set(null)" class="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#4A3F35] hover:bg-[#FFD6E0] transition-colors">✕</button>
                  </div>
                  <div class="space-y-3 text-xs">
                    <div>
                      <label class="font-bold text-[#4A3F35] block mb-1">Nombre Completo</label>
                      <input type="text" [value]="editingUser()!.nombre_completo" (input)="onEditField('nombre_completo', $any($event.target).value)" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                    </div>
                    <div>
                      <label class="font-bold text-[#4A3F35] block mb-1">Email</label>
                      <input type="email" [value]="editingUser()!.email" (input)="onEditField('email', $any($event.target).value)" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                    </div>
                    <div>
                      <label class="font-bold text-[#4A3F35] block mb-1">Teléfono</label>
                      <input type="text" [value]="editingUser()!.telefono || ''" (input)="onEditField('telefono', $any($event.target).value)" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] focus:outline-none focus:border-[#4A3F35]">
                    </div>
                  </div>
                  <button (click)="saveUser()" class="w-full py-3 rounded-full bg-[#4A3F35] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest hover:bg-[#362D26] transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            }

            <!-- View Addresses Modal -->
            @if (viewingAddresses()) {
              <div class="fixed inset-0 z-50 bg-[#4A3F35]/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div class="bg-white rounded-[32px] max-w-lg w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-[#EBE3D5]">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="text-xl font-serif italic text-[#4A3F35]">Direcciones</h3>
                      <p class="text-xs text-[#4A3F35]/60">{{ viewingAddresses()!.nombre_completo }}</p>
                    </div>
                    <button (click)="viewingAddresses.set(null)" class="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#4A3F35] hover:bg-[#FFD6E0] transition-colors">✕</button>
                  </div>
                  <div class="space-y-3">
                    @if (userAddresses().length === 0) {
                      <div class="p-6 text-center text-xs text-[#4A3F35]/50 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D5]">
                        Este usuario no tiene direcciones guardadas
                      </div>
                    } @else {
                      @for (dir of userAddresses(); track dir.id_direccion) {
                        <div class="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-xs space-y-1">
                          <div class="flex items-center justify-between">
                            <span class="font-bold text-[#4A3F35]">{{ dir.alias || 'Dirección' }}</span>
                            @if (dir.predeterminada) {
                              <span class="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#2C5350] text-[9px] font-bold">Principal</span>
                            }
                          </div>
                          <p class="text-[#4A3F35]/70">{{ dir.direccion_completa }}</p>
                          <p class="text-[#4A3F35]/50">{{ dir.ciudad }}, {{ dir.departamento }}</p>
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
          <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-6">
            <div class="flex items-center justify-between border-b border-[#EBE3D5] pb-4">
              <div>
                <span class="px-3.5 py-1 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#EBE3D5]">
                  Configuración Visual del Sitio Web
                </span>
                <h2 class="text-2xl font-serif italic text-[#4A3F35] mt-1">Modificar Textos & Parámetros Visuales</h2>
              </div>
              <span class="text-xs text-[#2C5350] font-bold uppercase tracking-wider">✓ Guardado en memoria activa</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label for="hero-title" class="font-bold text-[#4A3F35] block mb-1">Título Principal Hero</label>
                <input 
                  id="hero-title"
                  type="text" 
                  [value]="config().heroTitulo" 
                  (input)="dataService.updateVisualConfig({ heroTitulo: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] font-medium"
                />
              </div>

              <div>
                <label for="hero-subtitle" class="font-bold text-[#4A3F35] block mb-1">Subtítulo Descriptivo</label>
                <input 
                  id="hero-subtitle"
                  type="text" 
                  [value]="config().heroSubtitulo" 
                  (input)="dataService.updateVisualConfig({ heroSubtitulo: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] font-medium"
                />
              </div>

              <div class="md:col-span-2">
                <label for="banner-promo" class="font-bold text-[#4A3F35] block mb-1">Texto del Banner Anuncio Superior</label>
                <input 
                  id="banner-promo"
                  type="text" 
                  [value]="config().bannerPromocional" 
                  (input)="dataService.updateVisualConfig({ bannerPromocional: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] font-medium"
                />
              </div>

              <div>
                <label for="whatsapp-phone" class="font-bold text-[#4A3F35] block mb-1">Teléfono WhatsApp de Atención</label>
                <input 
                  id="whatsapp-phone"
                  type="text" 
                  [value]="config().telefonoWhatsApp" 
                  (input)="dataService.updateVisualConfig({ telefonoWhatsApp: $any($event.target).value })"
                  class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] font-medium"
                />
              </div>

              <div>
                <label for="free-shipping" class="font-bold text-[#4A3F35] block mb-1">Monto para Envío Gratis ($ COP)</label>
                <input 
                  id="free-shipping"
                  type="number" 
                  [value]="config().montoEnvioGratis" 
                  (input)="dataService.updateVisualConfig({ montoEnvioGratis: Number($any($event.target).value) })"
                  class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35] font-medium"
                />
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  dataService = inject(MochiDataService);
  supabaseService = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  Number = Number;

  activeTab = signal<'dashboard' | 'productos' | 'pedidos' | 'detalles' | 'usuarios' | 'editor'>('dashboard');
  detalleOrigenFilter = signal<'todos' | 'online' | 'local'>('todos');
  editingUser = signal<Usuario | null>(null);
  editingProduct = signal<Product | null>(null);
  showProductModal = signal<boolean>(false);
  viewingAddresses = signal<Usuario | null>(null);
  userAddresses = signal<Direccion[]>([]);

  ngOnInit() {
    // Reload users with admin token
    this.reloadUsers();
    // Sync sidebar navigation with internal tabs
    this.syncTabFromRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
      this.syncTabFromRoute(url);
    });
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

  openProductModal(product?: Product) {
    if (product) {
      this.editingProduct.set({ ...product });
    } else {
      this.editingProduct.set(null);
    }
    this.showProductModal.set(true);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.editingProduct.set(null);
  }

  async saveProductModal(esp: string, jap: string, price: string, img: string, stock: string, stockMin: string, stockMax: string, desc: string, disp: boolean, dest: boolean) {
    if (!esp || !price) return;
    
    const current = this.editingProduct();
    
    if (current) {
      // Edit existing
      const updated: Product = {
        ...current,
        nombre_japones: jap || esp,
        nombre_espanol: esp,
        precio: Number(price),
        imagen_principal: img || current.imagen_principal,
        stock: Number(stock) || current.stock,
        stock_minimo: Number(stockMin) || current.stock_minimo,
        stock_maximo: Number(stockMax) || current.stock_maximo,
        descripcion_corta: desc || current.descripcion_corta,
        disponible: disp,
        destacado: dest
      };
      await this.dataService.updateProduct(updated);
    } else {
      // Create new
      await this.dataService.addProduct({
        id_categoria: 1,
        nombre_japones: jap || esp,
        nombre_espanol: esp,
        descripcion_corta: desc || 'Postre japonés artesanal recién preparado.',
        descripcion_completa: 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.',
        ingredientes: ['Arroz Mochiko', 'Azúcar refinada'],
        precio: Number(price),
        imagen_principal: img || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
        galeria_imagenes: [img || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80'],
        disponible: disp,
        destacado: dest,
        stock: Number(stock) || 20,
        stock_minimo: Number(stockMin) || 10,
        stock_maximo: Number(stockMax) || 500
      });
    }
    
    this.closeProductModal();
  }
}

