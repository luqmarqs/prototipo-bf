import { useEffect, useState } from 'react'
import { fetchCampaigns } from '../services/supabase/campaigns'

export function useCampaigns({ enabled = true } = {}) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return undefined

    let active = true
    setLoading(true)

    fetchCampaigns()
      .then((data) => {
        if (active) {
          setCampaigns(data)
          setError('')
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Nao foi possivel carregar as campanhas.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [enabled])

  return { campaigns, loading, error }
}
