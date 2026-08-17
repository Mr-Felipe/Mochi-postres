import { Injectable, signal, computed } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import {
  Usuario,
  UserRole,
  Direccion,
  StockValidation,
  StockCheckItem,
  Sucursal
} from '../models/mochi.models';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private sb: SupabaseClient = supabase;

  readonly sucursales = signal<Sucursal[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly direcciones = signal<Direccion[]>([]);
  readonly activeUser = signal<Usuario | null>(null);
  readonly currentRole = computed<UserRole>(() => this.activeUser()?.rol ?? 'cliente');

  // --- DATA LOADING ---

  async loadAll(): Promise<void> {
    const [sucRes, usrRes] = await Promise.all([
      this.sb.from('sucursales').select('*'),
      this.sb.from('usuarios').select('*')
    ]);
    if (sucRes.data) this.sucursales.set(sucRes.data as Sucursal[]);
    if (usrRes.data) this.usuarios.set(usrRes.data as Usuario[]);
  }

  async loadDirecciones(userId: string): Promise<void> {
    const { data } = await this.sb.from('direcciones').select('*').eq('id_usuario', userId);
    if (data) this.direcciones.set(data as Direccion[]);
  }

  // --- AUTHENTICATION ---

  async signIn(email: string, password: string) {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { data: null, error: { message: 'Por favor ingresa tu email y contraseña.' } };
    }
    const { data, error } = await this.sb.auth.signInWithPassword({
      email: trimmedEmail,
      password
    });
    if (error) return { data: null, error: { message: error.message } };

    if (data?.user) {
      // Forzar refresh de sesión para que queries subsiguientes usen token autenticado
      await this.sb.auth.getSession();

      const { data: usrRow, error: qErr } = await this.sb
        .from('usuarios').select('*').eq('id', data.user.id).maybeSingle();

      if (usrRow) {
        this.activeUser.set(usrRow as Usuario);
        const existentes = this.usuarios().filter(u => u.id !== usrRow.id);
        this.usuarios.set([...existentes, usrRow as Usuario]);
      } else {
        console.error('signIn: usuario no encontrado en tabla usuarios', qErr);
        // Crear registro solo si no existe
        const { data: newUsr } = await this.sb.from('usuarios').insert({
          id: data.user.id,
          email: data.user.email!,
          nombre_completo: data.user.user_metadata?.['nombre_completo'] || '',
          telefono: data.user.user_metadata?.['telefono'] || '',
          rol: 'cliente'
        }).select().single();
        if (newUsr) {
          this.usuarios.set([...this.usuarios(), newUsr as Usuario]);
          this.activeUser.set(newUsr as Usuario);
        }
      }
    }
    return { data, error: null };
  }

  async signUp(
    email: string,
    password: string,
    metadata: { nombre_completo: string; telefono?: string; rol?: UserRole }
  ) {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      return { data: null, error: { message: 'Todos los campos requeridos deben ser completados.' } };
    }
    if (password.length < 6) {
      return { data: null, error: { message: 'La contraseña debe tener un mínimo de 6 caracteres.' } };
    }

    const { data, error } = await this.sb.auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: metadata }
    });
    if (error) return { data: null, error: { message: error.message } };

    if (data?.user) {
      const { error: insertErr } = await this.sb.from('usuarios').upsert({
        id: data.user.id,
        email: trimmedEmail,
        nombre_completo: metadata.nombre_completo,
        telefono: metadata.telefono || '',
        rol: metadata.rol || 'cliente'
      }, { onConflict: 'id' });
      if (insertErr) console.warn('Error inserting user profile:', insertErr);

      // Recargar usuarios
      await this.loadAll();
      const matched = this.usuarios().find(u => u.id === data.user!.id);
      if (matched) this.activeUser.set(matched);
    }
    return { data, error: null };
  }

  async signOut() {
    await this.sb.auth.signOut();
    this.activeUser.set(null);
    this.direcciones.set([]);
    return { error: null };
  }

  async getSession() {
    return await this.sb.auth.getSession();
  }

  async getUser() {
    return await this.sb.auth.getUser();
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return this.sb.auth.onAuthStateChange(callback);
  }

  async resetPasswordForEmail(email: string) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return { data: null, error: { message: 'Por favor ingresa un correo electrónico válido.' } };
    }
    const { data, error } = await this.sb.auth.resetPasswordForEmail(trimmed);
    if (error) return { data: null, error: { message: error.message } };
    return { data, error: null };
  }

  // --- ROLE SWITCHING (for admin preview) ---

  switchUserRole(role: UserRole) {
    const found = this.usuarios().find(u => u.rol === role);
    if (found) this.activeUser.set(found);
  }

  selectActiveUser(userId: string) {
    const found = this.usuarios().find(u => u.id === userId);
    if (found) this.activeUser.set(found);
  }

  async getUserRole(): Promise<UserRole> {
    const { data, error } = await this.sb.rpc('get_user_role');
    if (!error && data) return data as UserRole;
    return this.currentRole();
  }

  // --- RPC: DIRECCIONES ---

  async obtenerDireccionesUsuario(usuarioId: string): Promise<Direccion[]> {
    const { data, error } = await this.sb.rpc('obtener_direcciones_usuario', { usuario_id: usuarioId });
    if (!error && data) return data as Direccion[];
    return this.direcciones().filter(d => d.id_usuario === usuarioId);
  }

  async obtenerDireccionPredeterminada(usuarioId: string): Promise<Direccion | null> {
    const { data, error } = await this.sb.rpc('obtener_direccion_predeterminada', { usuario_id: usuarioId });
    if (!error && data) return (Array.isArray(data) ? data[0] : data) as Direccion;
    const userDirs = this.direcciones().filter(d => d.id_usuario === usuarioId);
    return userDirs.find(d => d.predeterminada) || userDirs[0] || null;
  }

  // --- RPC: STOCK VALIDATION ---

  async validarStockPedido(
    p_productos: StockCheckItem[],
    currentCatalog: { id: number; stock: number }[]
  ): Promise<StockValidation[]> {
    const { data, error } = await this.sb.rpc('validar_stock_pedido', { p_productos });
    if (!error && data) return data as StockValidation[];

    // Fallback: validación local si el RPC falla
    return p_productos.map(req => {
      const prod = currentCatalog.find(p => p.id === req.id_producto);
      const disponible = prod ? prod.stock : 0;
      return {
        id_producto: req.id_producto,
        stock_disponible: disponible,
        stock_solicitado: req.cantidad,
        suficiente: disponible >= req.cantidad
      };
    });
  }

  // --- RPC: CREAR PEDIDO ---

  async crearPedidoConStock(params: {
    p_id_usuario: string;
    p_id_direccion?: number;
    p_productos: StockCheckItem[];
    p_metodo_pago: string;
    p_notas?: string;
  }): Promise<{ id_pedido: number; numero_pedido: string } | null> {
    const { data, error } = await this.sb.rpc('crear_pedido_con_stock', {
      p_id_usuario: params.p_id_usuario,
      p_id_direccion: params.p_id_direccion,
      p_productos: params.p_productos,
      p_metodo_pago: params.p_metodo_pago,
      p_notas: params.p_notas
    });
    if (!error && data) {
      const id = typeof data === 'number' ? data : Number(data);
      return { id_pedido: id, numero_pedido: `MOCHI-2026-${id}` };
    }
    return null;
  }

  // --- DIRECCIONES CRUD ---

  async addDireccion(dir: Omit<Direccion, 'id_direccion' | 'created_at' | 'updated_at'>): Promise<Direccion | null> {
    if (dir.predeterminada) {
      // Quitar predeterminada de otras direcciones del mismo usuario
      await this.sb.from('direcciones')
        .update({ predeterminada: false })
        .eq('id_usuario', dir.id_usuario);
    }
    const { data, error } = await this.sb.from('direcciones')
      .insert(dir)
      .select()
      .single();
    if (error) {
      console.warn('Error adding direccion:', error);
      return null;
    }
    await this.loadDirecciones(dir.id_usuario);
    return data as Direccion;
  }

  async setDireccionPredeterminada(id_direccion: number, id_usuario: string) {
    await this.sb.from('direcciones')
      .update({ predeterminada: false })
      .eq('id_usuario', id_usuario);
    await this.sb.from('direcciones')
      .update({ predeterminada: true })
      .eq('id_direccion', id_direccion);
    await this.loadDirecciones(id_usuario);
  }

  // --- USER MANAGEMENT (admin) ---

  async updateUsuarioRol(userId: string, newRole: UserRole, id_sucursal?: number, cargo?: string) {
    const update: Record<string, unknown> = { rol: newRole };
    if (id_sucursal !== undefined) update['id_sucursal'] = id_sucursal;
    if (cargo !== undefined) update['cargo'] = cargo;
    update['updated_at'] = new Date().toISOString();

    await this.sb.from('usuarios').update(update).eq('id', userId);
    await this.loadAll();

    // Refrescar activeUser si es el mismo
    const current = this.activeUser();
    if (current?.id === userId) {
      const refreshed = this.usuarios().find(u => u.id === userId);
      if (refreshed) this.activeUser.set(refreshed);
    }
  }

  getEmpleadosSucursal(id_sucursal?: number): Usuario[] {
    return this.usuarios().filter(u => u.rol === 'empleado' && (!id_sucursal || u.id_sucursal === id_sucursal));
  }
}
