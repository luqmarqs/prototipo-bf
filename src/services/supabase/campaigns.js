/**
 * Camada de acesso a dados para campanhas e seus respectivos leads.
 *
 * Diferença de fontes:
 * - `lead_forms` (Supabase) — cadastro administrativo das campanhas (slug, nome, status)
 * - `leads` (Supabase) — leads capturados, vinculados via `form_slug`
 * - O hook `useCampaigns` usa o Sanity como fonte de verdade para a lista de campanhas
 *   e consulta o Supabase apenas para as contagens.
 */
import { getSupabaseClient } from './client'

/**
 * Busca campanhas ativas da tabela `lead_forms` com a contagem de leads de cada uma.
 *
 * @returns {Promise<Array<{ id: string, name: string, slug: string, leadCount: number }>>}
 */
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

/**
 * Busca uma campanha ativa pelo slug.
 *
 * @param {string} slug
 * @returns {Promise<{ id: string, name: string, slug: string }>}
 * @throws {Error} Se a campanha não for encontrada ou estiver inativa.
 */
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

/**
 * Retorna métricas de leads para uma campanha específica: total e captados hoje.
 *
 * @param {string} formSlug - Slug da campanha.
 * @returns {Promise<{ totalLeads: number, leadsToday: number }>}
 */
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

/**
 * Retorna a contagem diária de leads para uma campanha nos últimos N dias.
 * Dias sem registros são pré-preenchidos com zero para garantir continuidade no gráfico.
 *
 * @param {string} formSlug - Slug da campanha.
 * @param {object} [options]
 * @param {number} [options.days=30] - Janela de dias retroativos.
 * @returns {Promise<Array<{ date: string, count: number }>>} Array ordenado por data (YYYY-MM-DD).
 */
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

/**
 * Busca leads paginados de uma campanha específica com filtros opcionais.
 *
 * @param {string} formSlug - Slug da campanha.
 * @param {object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.pageSize=15]
 * @param {string} [params.search] - Busca por nome, e-mail ou telefone.
 * @param {string} [params.dateFrom] - Data inicial (YYYY-MM-DD).
 * @param {string} [params.dateTo] - Data final (YYYY-MM-DD).
 * @param {string} [params.utmSource] - Filtro por UTM source exato.
 * @param {string} [params.sortColumn='created_at']
 * @param {'asc'|'desc'} [params.sortDirection='desc']
 * @returns {Promise<{ rows: object[], total: number }>}
 */
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

/**
 * Busca todos os leads de uma campanha sem paginação para exportação (máx. 5000).
 *
 * @param {string} formSlug
 * @param {object} [filters] - Mesmos filtros de `fetchCampaignLeads`.
 * @returns {Promise<object[]>}
 */
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

/**
 * Retorna os valores distintos de `utm_source` dos leads de uma campanha.
 * Usado para popular o dropdown de filtro por origem no painel.
 *
 * @param {string} formSlug
 * @returns {Promise<string[]>} Lista de UTM sources ordenada alfabeticamente.
 */
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
