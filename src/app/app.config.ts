import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { SupabaseService } from './services/supabase.service';
import { MochiDataService } from './services/mochi-data.service';

function initializeApp(sbService: SupabaseService, dataService: MochiDataService) {
  return async () => {
    // Cargar datos públicos primero (puede fallar por RLS con anon)
    try { await sbService.loadAll(); } catch (_) {}
    await dataService.loadAllFromSupabase();

    // Restaurar sesión activa si existe
    const { data: { session } } = await sbService.getSession();
    if (session?.user) {
      // Si loadAll falló (RLS), consultar DB directamente con token autenticado
      if (!sbService.activeUser()) {
        const { data: usrRow } = await sbService['sb']
          .from('usuarios').select('*').eq('id', session.user.id).maybeSingle();
        if (usrRow) {
          sbService.activeUser.set(usrRow as any);
        }
      }
      await sbService.loadDirecciones(session.user.id);
      await dataService.loadFavorites(session.user.id);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [SupabaseService, MochiDataService],
      multi: true
    }
  ],
};
