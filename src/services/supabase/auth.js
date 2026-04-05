import { getSupabaseClient } from './client'

function parseWhitelist(value) {
  return (value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

export function getAdminWhitelist() {
  return parseWhitelist(import.meta.env.VITE_ADMIN_EMAIL_WHITELIST)
}

export function isEmailAuthorized(email) {
  if (!email) {
    return false
  }

  return getAdminWhitelist().includes(email.trim().toLowerCase())
}

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

export async function signOutAdmin() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}
