import { getSupabaseClient } from './client'

/**
 * After Google login, if the user's email exists in admin_users with a null user_id,
 * links the DB record to the authenticated user by updating user_id.
 * Safe to call on every login — only updates when user_id is still null.
 */
export async function syncAdminUser(user) {
  if (!user?.id || !user?.email) return null

  const supabase = getSupabaseClient()
  const normalizedEmail = user.email.trim().toLowerCase()

  const { data: existing, error: fetchError } = await supabase
    .from('admin_users')
    .select('id, user_id, full_name, is_active')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!existing) return null

  const updates = {}
  if (!existing.user_id) updates.user_id = user.id

  const googleName = user.user_metadata?.full_name || user.user_metadata?.name || ''
  if (googleName && !existing.full_name?.trim()) updates.full_name = googleName

  if (Object.keys(updates).length > 0) {
    const { data: updated, error: updateError } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', existing.id)
      .select('id, user_id, full_name, is_active')
      .single()

    if (updateError) throw updateError
    return updated
  }

  return existing
}

/**
 * Returns true if the authenticated user is an active admin.
 * Prefers user_id lookup (most accurate); falls back to email if user_id is unavailable.
 */
export async function checkIsAdmin(userId, email) {
  if (!userId && !email) return false

  const supabase = getSupabaseClient()

  if (userId) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    if (data) return data.is_active === true
  }

  if (email) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_active')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle()

    if (error) throw error
    if (data) return data.is_active === true
  }

  return false
}

export async function fetchAdmins() {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, user_id, email, full_name, is_active')
    .order('email', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function addAdmin(email) {
  if (!email?.trim()) throw new Error('Email obrigatório.')

  const supabase = getSupabaseClient()
  const normalizedEmail = email.trim().toLowerCase()

  const { data, error } = await supabase
    .from('admin_users')
    .insert({ email: normalizedEmail, is_active: true })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateAdminStatus(id, isActive) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('admin_users')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeAdmin(id) {
  const supabase = getSupabaseClient()

  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id)

  if (error) throw error
}
