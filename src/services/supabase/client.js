/**
 * Singleton do cliente Supabase para uso no frontend (browser).
 *
 * O cliente é inicializado apenas quando ambas as variáveis de ambiente
 * VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY estão presentes.
 * Caso contrário, `supabase` permanece `null` e `hasSupabaseConfig()` retorna false,
 * permitindo que a aplicação rode em modo degradado (sem painel admin).
 *
 * IMPORTANTE: nunca use a service role key aqui — use apenas a anon/publishable key.
 * A service role key fica exclusivamente em `api/leads.js` (server-side).
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Retorna `true` se as variáveis de ambiente do Supabase estão configuradas.
 * Use para renderização condicional do painel admin.
 *
 * @returns {boolean}
 */
export function hasSupabaseConfig() {
  return Boolean(supabase)
}

/**
 * Retorna o cliente Supabase inicializado.
 * Lança erro se as variáveis de ambiente não estiverem definidas.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 * @throws {Error} Se o Supabase não estiver configurado.
 */
export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase nao configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.')
  }

  return supabase
}
