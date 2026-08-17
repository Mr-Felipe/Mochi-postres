import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

async function ensureUser(sb: SupabaseService): Promise<boolean> {
  if (sb.activeUser()) return true;

  const { data: { session } } = await sb.getSession();
  if (!session) return false;

  // Intentar encontrar en el array local
  const matched = sb.usuarios().find(u => u.id === session.user.id);
  if (matched) {
    sb.activeUser.set(matched);
    return true;
  }

  // Consultar DB directamente
  const { data: usrRow } = await (sb as any).sb
    .from('usuarios').select('*').eq('id', session.user.id).maybeSingle();
  if (usrRow) {
    sb.activeUser.set(usrRow);
    return true;
  }

  return false;
}

export const authGuard: CanActivateFn = async () => {
  const sb = inject(SupabaseService);
  const router = inject(Router);

  if (!(await ensureUser(sb))) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = async () => {
  const sb = inject(SupabaseService);
  const router = inject(Router);

  if (!(await ensureUser(sb))) {
    router.navigate(['/login']);
    return false;
  }

  if (sb.activeUser()?.rol !== 'admin') {
    router.navigate(['/']);
    return false;
  }
  return true;
};

export const empleadoGuard: CanActivateFn = async () => {
  const sb = inject(SupabaseService);
  const router = inject(Router);

  if (!(await ensureUser(sb))) {
    router.navigate(['/login']);
    return false;
  }

  const role = sb.activeUser()?.rol;
  if (role !== 'admin' && role !== 'empleado') {
    router.navigate(['/']);
    return false;
  }
  return true;
};
