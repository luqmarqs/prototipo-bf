import { useCallback, useEffect, useState } from 'react'
import {
  addAdmin as addAdminService,
  fetchAdmins,
  removeAdmin as removeAdminService,
  updateAdminStatus,
} from '../services/supabase/admins'

export function useAdmins({ enabled = true } = {}) {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    let active = true

    fetchAdmins()
      .then((data) => {
        if (!active) return
        setAdmins(data)
        setError('')
      })
      .catch((err) => {
        if (!active) return
        setError(err.message || 'Erro ao carregar admins.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, reloadToken])

  const refresh = useCallback(() => {
    setReloadToken((v) => v + 1)
  }, [])

  const addAdmin = useCallback(async (email) => {
    await addAdminService(email)
    setReloadToken((v) => v + 1)
  }, [])

  const toggleStatus = useCallback(async (id, isActive) => {
    await updateAdminStatus(id, isActive)
    setReloadToken((v) => v + 1)
  }, [])

  const removeAdmin = useCallback(async (id) => {
    await removeAdminService(id)
    setReloadToken((v) => v + 1)
  }, [])

  return {
    admins,
    loading,
    error,
    refresh,
    addAdmin,
    toggleStatus,
    removeAdmin,
  }
}
