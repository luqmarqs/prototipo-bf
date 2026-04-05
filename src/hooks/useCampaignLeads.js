import { useEffect, useState } from 'react'
import {
  fetchCampaignLeads,
  fetchCampaignLeadsByDay,
  fetchCampaignMetrics,
  fetchCampaignUtmSources,
} from '../services/supabase/campaigns'

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
