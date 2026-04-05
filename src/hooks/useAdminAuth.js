import { useEffect, useState } from 'react'
import { checkIsAdmin, syncAdminUser } from '../services/supabase/admins'
import { getAdminWhitelist, isEmailAuthorized } from '../services/supabase/auth'
import { getSupabaseClient, hasSupabaseConfig } from '../services/supabase/client'

export function useAdminAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(hasSupabaseConfig())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      return undefined
    }

    let active = true
    const supabase = getSupabaseClient()

    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return
        if (sessionError) setError(sessionError.message)

        const sessionUser = data.session?.user || null
        setSession(data.session || null)
        setUser(sessionUser)

        if (!sessionUser) {
          setLoading(false)
          return undefined
        }

        return syncAdminUser(sessionUser)
          .then((record) => {
            if (active && record?.full_name) setFullName(record.full_name)
            return checkIsAdmin(sessionUser.id, sessionUser.email)
          })
          .then((admin) => {
            if (!active) return
            setIsAdmin(admin)
            setError('')
          })
          .catch((authError) => {
            if (!active) return
            setIsAdmin(false)
            setError(authError?.message || 'Falha ao sincronizar usuario admin.')
          })
          .finally(() => {
            if (!active) return
            setLoading(false)
          })
      })
      .catch((sessionError) => {
        if (!active) return
        setError(sessionError.message || 'Nao foi possivel carregar a sessao.')
        setLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return

      const nextUser = nextSession?.user || null
      setSession(nextSession || null)
      setUser(nextUser)
      setError('')

      if (!nextUser) {
        setIsAdmin(false)
        setFullName('')
        setLoading(false)
        return
      }

      // Token refresh on focus/visibility change — session is already valid, no need to re-sync
      if (event === 'TOKEN_REFRESHED') {
        return
      }

      // Keep loading=true while the DB sync+check runs (set inside callback — not direct effect body)
      setLoading(true)

      syncAdminUser(nextUser)
        .then((record) => {
          if (active && record?.full_name) setFullName(record.full_name)
          return checkIsAdmin(nextUser.id, nextUser.email)
        })
        .then((admin) => {
          if (!active) return
          setIsAdmin(admin)
          setError('')
        })
        .catch((authError) => {
          if (!active) return
          setIsAdmin(false)
          setError(authError?.message || 'Falha ao sincronizar usuario admin.')
        })
        .finally(() => {
          if (!active) return
          setLoading(false)
        })
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const email = user?.email?.toLowerCase() || ''
  const avatarUrl = user?.user_metadata?.avatar_url || ''
  const whitelist = getAdminWhitelist()

  return {
    session,
    user,
    email,
    displayName: fullName || email,
    avatarUrl,
    loading,
    error,
    isAdmin,
    hasConfig: hasSupabaseConfig(),
    hasWhitelist: whitelist.length > 0,
    whitelist,
    isAuthorized: isEmailAuthorized(email),
  }
}
