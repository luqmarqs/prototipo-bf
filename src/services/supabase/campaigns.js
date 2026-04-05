import { getSupabaseClient } from './client'

export async function fetchCampaigns() {
  const supabase = getSupabaseClient()

  const { data: forms, error } = await supabase
    .from('lead_forms')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  if (!forms?.length) return []

  const counts = await Promise.all(
    forms.map((form) =>
      supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('form_slug', form.slug)
        .then(({ count, error: countError }) => {
          if (countError) throw countError
          return count || 0
        }),
    ),
  )

  return forms.map((form, index) => ({
    ...form,
    leadCount: counts[index],
  }))
}

export async function fetchCampaignBySlug(slug) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('lead_forms')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

export async function fetchCampaignMetrics(formSlug) {
  const supabase = getSupabaseClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalResult, todayResult] = await Promise.all([
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('form_slug', formSlug),
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('form_slug', formSlug)
      .gte('created_at', today.toISOString()),
  ])

  if (totalResult.error) throw totalResult.error
  if (todayResult.error) throw todayResult.error

  return {
    totalLeads: totalResult.count || 0,
    leadsToday: todayResult.count || 0,
  }
}

export async function fetchCampaignLeadsByDay(formSlug, { days = 30 } = {}) {
  const supabase = getSupabaseClient()
  const from = new Date()
  from.setDate(from.getDate() - days + 1)
  from.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('leads')
    .select('created_at')
    .eq('form_slug', formSlug)
    .gte('created_at', from.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  // Pre-fill all days in range with zero
  const counts = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    counts[d.toISOString().slice(0, 10)] = 0
  }

  ;(data || []).forEach((row) => {
    const key = row.created_at.slice(0, 10)
    if (key in counts) counts[key] = (counts[key] || 0) + 1
  })

  return Object.entries(counts).map(([date, count]) => ({ date, count }))
}

function applyCampaignLeadFilters(query, filters = {}) {
  const { search = '', dateFrom = '', dateTo = '', utmSource = '' } = filters
  const trimmed = search.trim()

  if (trimmed) {
    const safe = trimmed.replace(/[%(),]/g, ' ').trim()
    if (safe) {
      query = query.or(`nome.ilike.%${safe}%,email.ilike.%${safe}%,telefone.ilike.%${safe}%`)
    }
  }

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`)
  if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59.999Z`)
  if (utmSource) query = query.eq('utm_source', utmSource)

  return query
}

export async function fetchCampaignLeads(formSlug, {
  page = 1,
  pageSize = 15,
  search = '',
  dateFrom = '',
  dateTo = '',
  utmSource = '',
  sortColumn = 'created_at',
  sortDirection = 'desc',
} = {}) {
  const supabase = getSupabaseClient()
  const from = Math.max(0, (page - 1) * pageSize)
  const to = from + pageSize - 1

  let query = supabase
    .from('leads')
    .select('id, created_at, nome, email, telefone, utm_source, utm_campaign, form_slug, dados', { count: 'exact' })
    .eq('form_slug', formSlug)

  query = applyCampaignLeadFilters(query, { search, dateFrom, dateTo, utmSource })
  query = query.order(sortColumn, { ascending: sortDirection === 'asc', nullsFirst: false })
  query = query.range(from, to)

  const { data, error, count } = await query
  if (error) throw error

  return { rows: data || [], total: count || 0 }
}

export async function fetchCampaignLeadsForExport(formSlug, filters = {}) {
  const supabase = getSupabaseClient()

  let query = supabase
    .from('leads')
    .select('id, created_at, nome, email, telefone, utm_source, utm_campaign, form_slug, dados')
    .eq('form_slug', formSlug)

  query = applyCampaignLeadFilters(query, filters)
  query = query.order('created_at', { ascending: false })
  query = query.range(0, 4999)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchCampaignUtmSources(formSlug) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('leads')
    .select('utm_source')
    .eq('form_slug', formSlug)
    .not('utm_source', 'is', null)

  if (error) throw error

  const sources = [...new Set((data || []).map((row) => row.utm_source).filter(Boolean))]
  return sources.sort()
}
