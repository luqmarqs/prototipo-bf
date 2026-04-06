/**
 * Autenticação de administradores via Google OAuth (Supabase Auth).
 *
 * Fluxo de acesso ao painel:
 * 1. `signInWithGoogle()` redireciona para o OAuth do Google.
 * 2. Após autenticação, Supabase redireciona para VITE_SUPABASE_GOOGLE_REDIRECT_URL.
 * 3. `useAdminAuth` detecta a sessão e chama `syncAdminUser` + `checkIsAdmin`.
 * 4. `isEmailAuthorized` verifica se o e-mail consta na whitelist de env (camada extra opcional).
 */
import { getSupabaseClient } from './client'

/**
 * Converte a string de whitelist (CSV) em array de e-mails normalizados.
 *
 * @param {string} value - String com e-mails separados por vírgula.
 * @returns {string[]}
 */
function parseWhitelist(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * Retorna a lista de e-mails autorizados definida em VITE_ADMIN_EMAIL_WHITELIST.
 *
 * @returns {string[]} Lista de e-mails em minúsculas.
 */
export function getAdminWhitelist() {
  return parseWhitelist(import.meta.env.VITE_ADMIN_EMAIL_WHITELIST)
}

/**
 * Verifica se um e-mail consta na whitelist de variável de ambiente.
 * Quando a whitelist está vazia, todos os e-mails passam (acesso controlado apenas pela tabela admin_users).
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isEmailAuthorized(email) {
  if (!email) {
    return false
  }

  return getAdminWhitelist().includes(email.trim().toLowerCase())
}

/**
 * Inicia o fluxo OAuth do Google via Supabase.
 * Sempre exibe o seletor de conta (`prompt: 'select_account'`).
 * Redireciona para VITE_SUPABASE_GOOGLE_REDIRECT_URL após autenticação.
 *
 * @returns {Promise<void>}
 * @throws {Error} Se o Supabase retornar erro no OAuth.
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseClient()
  const redirectTo = import.meta.env.VITE_SUPABASE_GOOGLE_REDIRECT_URL || `${window.location.origin}/admin`

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        prompt: 'select_account',
      },
    },
  })

  if (error) {
    throw error
  }
}

/**
 * Encerra a sessão do administrador no Supabase.
 *
 * @returns {Promise<void>}
 * @throws {Error} Se o Supabase retornar erro ao fazer logout.
 */
export async function signOutAdmin() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
