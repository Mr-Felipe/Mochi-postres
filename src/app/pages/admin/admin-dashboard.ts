import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MochiDataService } from '../../services/mochi-data.service';
import { SupabaseService } from '../../services/supabase.service';
import { UserRole } from '../../models/mochi.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#FAF7F2] text-[#4A3F35] min-h-screen p-4 sm:p-8 font-sans">
      <div class="max-w-7xl mx-auto space-y-8">
        
        <!-- Admin Header -->
        <div class="bg-white rounded-[32px] p-6 sm:p-8 border border-[#EBE3D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-3.5 py-1 rounded-full bg-[#FFD6E0] text-[#4A3F35] text-[10px] font-bold font-serif uppercase tracking-widest border border-[#EBE3D5]">
                Panel de Administración Supabase
              </span>
              <span class="px-3 py-1 rounded-full bg-[#E0F2F1] text-[#2C5350] text-[10px] font-bold font-mono">
                ⚡ Schema v2 Sincronizado
              </span>
            </div>
            <h1 class="text-3xl font-serif italic text-[#4A3F35] mt-2">
              Mochi. Control Center
            </h1>
            <p class="text-xs text-[#4A3F35]/70 uppercase tracking-wider mt-1 font-medium">Gestión de catálogo, detalle_pedido unificado, roles y sucursales</p>
          </div>

          <!-- View Switcher Tabs -->
          <div class="flex flex-wrap items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-full border border-[#EBE3D5] text-xs font-bold">
            <button 
              (click)="activeTab.set('dashboard')"
              [class]="activeTab() === 'dashboard' ? 'bg-[#4A3F35] text-[#FAF7F2] shadow-xs' : 'text-[#4A3F35]/70 hover:text-[#4A3F35]'"
              class="px-4 py-2 rounded-full transition-all uppercase tracking-wider text-[11px]">
              📊 Métricas
            </button>
            <button 
              (click)="activeTab.set('productos')"
              [class]="activeTab() === 'productos' ? 'bg-[#4A3F35] text-[#FAF7F2] shadow-xs' : 'text-[#4A3F35]/70 hover:text-[#4A3F35]'"
              class="px-4 py-2 rounded-full transition-all uppercase tracking-wider text-[11px]">
              🍡 Menú & Stock
            </button>
            <button 
              (click)="activeTab.set('pedidos')"
              [class]="activeTab() === 'pedidos' ? 'bg-[#4A3F35] text-[#FAF7F2] shadow-xs' : 'text-[#4A3F35]/70 hover:text-[#4A3F35]'"
              class="px-4 py-2 rounded-full transition-all uppercase tracking-wider text-[11px] relative">
              📦 Pedidos
              @if (pendingOrdersCount() > 0) {
                <span class="ml-1 bg-[#FFD6E0] text-[#4A3F35] text-[10px] w-4 h-4 rounded-full inline-flex items-center justify-center font-bold">
                  {{ pendingOrdersCount() }}
                </span>
              }
            </button>
            <button 
              (click)="activeTab.set('detalles')"
              [class]="activeTab() === 'detalles' ? 'bg-[#4A3F35] text-[#FAF7F2] shadow-xs' : 'text-[#4A3F35]/70 hover:text-[#4A3F35]'"
              class="px-4 py-2 rounded-full transition-all uppercase tracking-wider text-[11px]">
              📑 Detalle Unificado
            </button>
            <button 
              (click)="activeTab.set('usuarios')"
              [class]="activeTab() === 'usuarios' ? 'bg-[#4A3F35] text-[#FAF7F2] shadow-xs' : 'text-[#4A3F35]/70 hover:text-[#4A3F35]'"
              class="px-4 py-2 rounded-full transition-all uppercase tracking-wider text-[11px]">
              👥 Roles & Sucursales
            </button>
            <button 
              (click)="activeTab.set('editor')"
              [class]="activeTab() === 'editor' ? 'bg-[#FFD6E0] text-[#4A3F35] shadow-xs' : 'text-[#4A3F35]/70 hover:text-[#4A3F35]'"
              class="px-4 py-2 rounded-full transition-all uppercase tracking-wider text-[11px]">
              🎨 Editor
            </button>
          </div>
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
            
            <!-- Add New Product Form -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-4">
              <h2 class="text-lg font-serif italic text-[#4A3F35]">Añadir Nuevo Postre al Menú</h2>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label for="input-jap" class="font-bold text-[#4A3F35] block mb-1">Nombre Japonés</label>
                  <input id="input-jap" #japInput type="text" placeholder="Ej. Matcha Mochi" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35]">
                </div>
                <div>
                  <label for="input-esp" class="font-bold text-[#4A3F35] block mb-1">Nombre Español *</label>
                  <input id="input-esp" #espInput type="text" placeholder="Ej. Mochi de Té Verde" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35]">
                </div>
                <div>
                  <label for="input-price" class="font-bold text-[#4A3F35] block mb-1">Precio COP *</label>
                  <input id="input-price" #priceInput type="number" placeholder="9500" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35]">
                </div>
                <div>
                  <label for="input-img" class="font-bold text-[#4A3F35] block mb-1">URL Imagen Principal</label>
                  <input id="input-img" #imgInput type="text" placeholder="https://..." class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35]">
                </div>
                <div>
                  <label for="input-stock" class="font-bold text-[#4A3F35] block mb-1">Stock Inicial</label>
                  <input id="input-stock" #stockInput type="number" value="20" class="w-full p-3 rounded-full bg-[#FAF7F2] border border-[#EBE3D5] text-[#4A3F35]">
                </div>
                <div class="flex items-end">
                  <button 
                    (click)="createNewProduct(japInput.value, espInput.value, priceInput.value, imgInput.value, stockInput.value); japInput.value=''; espInput.value=''; priceInput.value=''"
                    class="w-full py-3 rounded-full bg-[#4A3F35] hover:bg-[#362D26] text-[#FAF7F2] font-bold text-xs uppercase tracking-widest shadow-xs transition-colors">
                    + Guardar Producto
                  </button>
                </div>
              </div>
            </div>

            <!-- Existing Products Inventory Table -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 shadow-xs space-y-4">
              <h2 class="text-lg font-serif italic text-[#4A3F35]">Catálogo de Productos ({{ products().length }})</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (prod of products(); track prod.id) {
                  <div class="p-4 rounded-[24px] bg-[#FAF7F2] border border-[#EBE3D5] flex items-center justify-between gap-3 text-xs">
                    <img [src]="prod.imagen_principal" alt="" class="w-14 h-14 rounded-2xl object-cover">
                    <div class="flex-1">
                      <span class="font-serif italic text-[#4A3F35] block text-sm">{{ prod.nombre_espanol }}</span>
                      <span class="text-[#4A3F35] font-serif italic font-bold">{{ '$' + (prod.precio_oferta || prod.precio).toLocaleString('es-CO') }}</span>
                      <span class="text-[#4A3F35]/60 block text-[10px]">Stock: {{ prod.stock }} un.</span>
                    </div>
                    <button (click)="dataService.deleteProduct(prod.id)" class="text-[#8C3A3A] font-bold text-[11px] uppercase tracking-wider hover:underline">
                      Eliminar
                    </button>
                  </div>
                }
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
                        {{ det.origen === 'online' ? 'Ped #' + det.id_pedido : 'POS #' + det.id_compra_local }}
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

        <!-- TAB 5: USUARIOS & ROLES & SUCURSALES (Supabase schema) -->
        @if (activeTab() === 'usuarios') {
          <div class="space-y-6">
            <!-- Header with Branches Info -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-4">
              <h2 class="text-2xl font-serif italic text-[#4A3F35]">Sucursales Oficiales (La Dorada, Caldas)</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (suc of supabaseService.sucursales(); track suc.id_sucursal) {
                  <div class="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D5] text-xs space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-[#4A3F35] font-serif text-sm">{{ suc.nombre }}</span>
                      <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#2C5350] font-bold">Activa</span>
                    </div>
                    <p class="text-[#4A3F35]/70">{{ suc.direccion }} — {{ suc.ciudad }}, {{ suc.departamento }}</p>
                    <span class="text-[10px] text-[#4A3F35]/50 font-mono">Tel: {{ suc.telefono }} | ID: #{{ suc.id_sucursal }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Users & Roles Management -->
            <div class="bg-white rounded-[32px] border border-[#EBE3D5] p-6 sm:p-8 shadow-xs space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-serif italic text-[#4A3F35]">Gestión de Usuarios & Roles de Supabase</h2>
                  <p class="text-xs text-[#4A3F35]/70">Roles admitidos: 'admin', 'empleado', 'cliente'. Empleados vinculados mediante id_sucursal (FK).</p>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#FAF7F2] text-[#4A3F35]/60 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="p-3 rounded-l-2xl">Usuario</th>
                      <th class="p-3">Email</th>
                      <th class="p-3">Rol Actual</th>
                      <th class="p-3">Sucursal Asignada (FK)</th>
                      <th class="p-3">Cargo</th>
                      <th class="p-3 rounded-r-2xl">Cambiar Rol</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#EBE3D5]">
                    @for (usr of supabaseService.usuarios(); track usr.id) {
                      <tr>
                        <td class="p-3 font-medium flex items-center gap-2">
                          <img [src]="usr.foto_perfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'" alt="Foto de perfil" class="w-8 h-8 rounded-full object-cover">
                          <div>
                            <span class="font-bold text-[#4A3F35] block">{{ usr.nombre_completo }}</span>
                            <span class="text-[9px] text-[#4A3F35]/50 font-mono">{{ usr.id.substring(0, 8) }}...</span>
                          </div>
                        </td>
                        <td class="p-3 font-mono">{{ usr.email }}</td>
                        <td class="p-3">
                          <span 
                            [class]="usr.rol === 'admin' ? 'bg-[#FFD6E0] text-[#4A3F35]' : usr.rol === 'empleado' ? 'bg-[#E0F2F1] text-[#2C5350]' : 'bg-[#FAF7F2] text-[#4A3F35]'"
                            class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#EBE3D5]">
                            {{ usr.rol }}
                          </span>
                        </td>
                        <td class="p-3">
                          @if (usr.id_sucursal) {
                            <span class="font-bold text-[#4A3F35]">Sede #{{ usr.id_sucursal }}</span>
                          } @else {
                            <span class="text-[#4A3F35]/40 italic">N/A</span>
                          }
                        </td>
                        <td class="p-3 text-[#4A3F35]/70">{{ usr.cargo || 'Cliente particular' }}</td>
                        <td class="p-3">
                          <select 
                            [value]="usr.rol"
                            (change)="onRoleChange(usr.id, $any($event.target).value)"
                            class="px-3 py-1.5 rounded-full bg-white border border-[#EBE3D5] text-[11px] font-bold text-[#4A3F35]">
                            <option value="admin">Admin</option>
                            <option value="empleado">Empleado</option>
                            <option value="cliente">Cliente</option>
                          </select>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
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

  ngOnInit() {
    // Sync sidebar navigation with internal tabs
    this.syncTabFromRoute(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
      this.syncTabFromRoute(url);
    });
  }

  private syncTabFromRoute(url: string) {
    const segment = url.replace('/admin', '').replace(/^\//, '');
    const tabMap: Record<string, 'dashboard' | 'productos' | 'pedidos' | 'detalles' | 'usuarios' | 'editor'> = {
      '': 'dashboard',
      'productos': 'productos',
      'pedidos': 'pedidos',
      'detalles': 'detalles',
      'usuarios': 'usuarios',
      'inventario': 'detalles',
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

  createNewProduct(jap: string, esp: string, price: string, img: string, stock: string) {
    if (!esp || !price) return;
    this.dataService.addProduct({
      id_categoria: 1,
      nombre_japones: jap || esp,
      nombre_espanol: esp,
      descripcion_corta: 'Postre japonés artesanal recién preparado.',
      descripcion_completa: 'Elaborado artesanalmente en La Dorada con ingredientes de alta calidad.',
      ingredientes: ['Arroz Mochiko', 'Azúcar refinada'],
      precio: Number(price),
      imagen_principal: img || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
      galeria_imagenes: [img || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80'],
      disponible: true,
      destacado: true,
      stock: Number(stock) || 20
    });
  }
}

