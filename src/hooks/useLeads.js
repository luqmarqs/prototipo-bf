/**
 * Hook para busca paginada de leads com filtros, métricas e atualização em tempo real.
 *
 * O re-fetch é disparado automaticamente quando `filters` ou `reloadToken` mudam.
 * A subscrição realtime incrementa `reloadToken` ao detectar mudanças na tabela,
 * mas apenas quando a aba está visível (`!document.hidden`) para evitar
 * recargas desnecessárias ao retornar de outra aba.
 *
 * @param {object} filters - Filtros passados para `fetchLeads` (search, dateFrom, dateTo, page, etc.).
 * @param {object} [options]
 * @param {boolean} [options.enabled=true] - Se false, não faz nenhuma requisição.
 * @param {boolean} [options.realtime=true] - Se false, desativa a subscrição realtime.
 * @returns {{
 *   rows: object[],
 *   total: number,
 *   metrics: { totalLeads: number, leadsToday: number },
 *   loading: boolean,
 *   refreshing: boolean,
 *   error: string,
 *   refresh: () => void,
 * }}
 */
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
      // Don't reload if page is hidden (prevents reload when returning from another tab)
      if (!document.hidden) {
        setRefreshing(true)
        setReloadToken((value) => value + 1)
      }
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
