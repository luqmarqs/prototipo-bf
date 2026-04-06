/**
 * Hooks para leads e gráfico de uma campanha específica.
 *
 * Divididos em dois hooks para separar ciclos de vida:
 * - `useCampaignLeads`: re-executa sempre que os filtros mudam (busca, data, UTM, página)
 * - `useCampaignChartData`: executa uma vez por campanha (dados do gráfico e lista de UTMs)
 */
import { useEffect, useState } from 'react'
import {
  fetchCampaignLeads,
  fetchCampaignLeadsByDay,
  fetchCampaignMetrics,
  fetchCampaignUtmSources,
} from '../services/supabase/campaigns'

/**
 * Busca leads paginados e métricas de uma campanha, re-executando quando os filtros mudam.
 *
 * @param {string} formSlug - Slug da campanha.
 * @param {object} filters - Filtros (page, pageSize, search, dateFrom, dateTo, utmSource, sort).
 * @param {object} [options]
 * @param {boolean} [options.enabled=true]
 * @returns {{ rows: object[], total: number, metrics: object, loading: boolean, error: string }}
 */
export function useCampaignLeads(formSlug, filters, { enabled = true } = {}) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [metrics, setMetrics] = useState({ totalLeads: 0, leadsToday: 0 })
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  // Leads + metrics — re-fetched whenever filters change
  useEffect(() => {
    if (!enabled || !formSlug) return undefined

    let active = true

    Promise.all([
      fetchCampaignLeads(formSlug, filters),
      fetchCampaignMetrics(formSlug),
    ])
      .then(([leadsResult, metricsResult]) => {
        if (!active) return
        setRows(leadsResult.rows)
        setTotal(leadsResult.total)
        setMetrics(metricsResult)
        setError('')
      })
      .catch((err) => {
        if (active) setError(err.message || 'Nao foi possivel carregar os leads.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, formSlug, filters])

  return { rows, total, metrics, loading, error }
}

/**
 * Carrega dados do gráfico (leads por dia, 30 dias) e UTM sources de uma campanha.
 * Executado uma única vez por campanha — não re-executa com mudança de filtros.
 *
 * @param {string} formSlug - Slug da campanha.
 * @param {object} [options]
 * @param {boolean} [options.enabled=true]
 * @returns {{ dailyData: Array<{ date: string, count: number }>, utmSources: string[], loading: boolean }}
 */
export function useCampaignChartData(formSlug, { enabled = true } = {}) {
  const [dailyData, setDailyData] = useState([])
  const [utmSources, setUtmSources] = useState([])
  const [loading, setLoading] = useState(enabled)

  // Chart + UTM sources — fetched once per campaign
  useEffect(() => {
    if (!enabled || !formSlug) return undefined

    let active = true

    Promise.all([
      fetchCampaignLeadsByDay(formSlug),
      fetchCampaignUtmSources(formSlug),
    ])
      .then(([daily, sources]) => {
        if (!active) return
        setDailyData(daily)
        setUtmSources(sources)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled, formSlug])

  return { dailyData, utmSources, loading }
}
