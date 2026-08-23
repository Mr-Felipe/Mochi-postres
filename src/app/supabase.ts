import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }
  return _client;
}

// Lazy proxy — only creates Supabase client on first property access (browser only)
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop: string | symbol) {
    const client = getClient();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
