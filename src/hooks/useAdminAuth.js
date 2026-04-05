import { useEffect, useState } from 'react'
import { isEmailAuthorized, getAdminWhitelist } from '../services/supabase/auth'
import { getSupabaseClient, hasSupabaseConfig } from '../services/supabase/client'

export function useAdminAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
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
        if (!active) {
          return
        }

        if (sessionError) {
          setError(sessionError.message)
        }

        setSession(data.session || null)
        setUser(data.session?.user || null)
        setLoading(false)
      })
      .catch((sessionError) => {
        if (!active) {
          return
        }

        setError(sessionError.message || 'Nao foi possivel carregar a sessao.')
        setLoading(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return
      }

      setSession(nextSession || null)
      setUser(nextSession?.user || null)
      setLoading(false)
      setError('')
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const email = user?.email?.toLowerCase() || ''
  const whitelist = getAdminWhitelist()

  return {
    session,
    user,
    email,
    loading,
    error,
    hasConfig: hasSupabaseConfig(),
    hasWhitelist: whitelist.length > 0,
    whitelist,
    isAuthorized: isEmailAuthorized(email),
  }
}
