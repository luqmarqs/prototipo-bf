import { useEffect, useState } from 'react'
import { fetchLeadMetrics, fetchLeads, subscribeToLeadChanges } from '../services/supabase/leads'

export function useLeads(filters, { enabled = true, realtime = true } = {}) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [metrics, setMetrics] = useState({ totalLeads: 0, leadsToday: 0 })
  const [loading, setLoading] = useState(enabled)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    let active = true

    Promise.all([
      fetchLeads(filters),
      fetchLeadMetrics(),
    ])
      .then(([leadResult, metricResult]) => {
        if (!active) {
          return
        }

        setRows(leadResult.rows)
        setTotal(leadResult.total)
        setMetrics(metricResult)
        setError('')
      })
      .catch((requestError) => {
        if (!active) {
          return
        }

        setError(requestError.message || 'Nao foi possivel carregar os leads.')
      })
      .finally(() => {
        if (!active) {
          return
        }

        setLoading(false)
        setRefreshing(false)
      })

    return () => {
      active = false
    }
  }, [enabled, filters, reloadToken])

  useEffect(() => {
    if (!enabled || !realtime) {
      return undefined
    }

    return subscribeToLeadChanges(() => {
      setRefreshing(true)
      setReloadToken((value) => value + 1)
    })
  }, [enabled, realtime])

  return {
    rows,
    total,
    metrics,
    loading,
    refreshing,
    error,
    refresh() {
      setRefreshing(true)
      setReloadToken((value) => value + 1)
    },
  }
}
