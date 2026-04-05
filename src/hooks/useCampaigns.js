import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../services/supabase/client'
import { fetchActiveCampaigns } from '../utils/campaigns'

async function fetchCampaignsWithCounts() {
  // Source of truth for campaigns: Sanity CMS (same as public site)
  const sanityData = await fetchActiveCampaigns(50)

  if (!sanityData?.length) return []

  const supabase = getSupabaseClient()

  // Count leads per form_slug in parallel
  const counts = await Promise.all(
    sanityData.map((campaign) =>
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('form_slug', campaign.slug)
        .then(({ count, error }) => {
          if (error) return 0
          return count || 0
        }),
    ),
  )

  return sanityData.map((campaign, index) => ({
    id: campaign.id,
    name: campaign.title,
    slug: campaign.slug,
    imageUrl: campaign.imageUrl,
    leadCount: counts[index],
  }))
}

export function useCampaigns({ enabled = true } = {}) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return undefined

    let active = true
    setLoading(true)

    fetchCampaignsWithCounts()
      .then((data) => {
        if (active) {
          setCampaigns(data)
          setError('')
        }
      })
      .catch((err) => {
        if (active) setError(err.message || 'Não foi possível carregar as campanhas.')
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
