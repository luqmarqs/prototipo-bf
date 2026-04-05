import { useEffect, useRef, useState } from 'react'
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
  // Tracks whether the initial DB sync has completed — prevents re-syncing on every
  // token refresh or SIGNED_IN event that Supabase fires when the window regains focus.
  const syncedRef = useRef(false)

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
            syncedRef.current = true
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

      // Sign-out: clear everything
      if (!nextUser) {
        syncedRef.current = false
        setSession(null)
        setUser(null)
        setIsAdmin(false)
        setFullName('')
        setError('')
        setLoading(false)
        return
      }

      // After the initial sync, only keep session/user in sync — do not re-run the DB check.
      // This prevents "Carregando..." from appearing every time Supabase fires TOKEN_REFRESHED
      // or SIGNED_IN when the window regains focus.
      if (syncedRef.current) {
        setSession(nextSession)
        setUser(nextUser)
        return
      }

      // First sign-in (syncedRef still false): run full sync
      setSession(nextSession)
      setUser(nextUser)
      setError('')
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
          syncedRef.current = true
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
