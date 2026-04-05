import { getSupabaseClient } from './client'

function applyLeadFilters(query, filters = {}) {
  const { search = '', dateFrom = '', dateTo = '' } = filters
  const trimmedSearch = search.trim()

  if (trimmedSearch) {
    const safeTerm = trimmedSearch.replace(/[%(),]/g, ' ').trim()

    if (safeTerm) {
      query = query.or(`name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%,phone.ilike.%${safeTerm}%`)
    }
  }

  if (dateFrom) {
    query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`)
  }

  if (dateTo) {
    query = query.lte('created_at', `${dateTo}T23:59:59.999Z`)
  }

  return query
}

export async function fetchLeads({
  page = 1,
  pageSize = 15,
  search = '',
  dateFrom = '',
  dateTo = '',
  sortColumn = 'created_at',
  sortDirection = 'desc',
} = {}) {
  const supabase = getSupabaseClient()
  const from = Math.max(0, (page - 1) * pageSize)
  const to = from + pageSize - 1

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })

  query = applyLeadFilters(query, { search, dateFrom, dateTo })
  query = query.order(sortColumn, { ascending: sortDirection === 'asc', nullsFirst: false })
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return {
    rows: data || [],
    total: count || 0,
  }
}

export async function fetchLeadMetrics() {
  const supabase = getSupabaseClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [allResult, todayResult] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
  ])

  if (allResult.error) {
    throw allResult.error
  }

  if (todayResult.error) {
    throw todayResult.error
  }

  return {
    totalLeads: allResult.count || 0,
    leadsToday: todayResult.count || 0,
  }
}

export async function fetchLeadsForExport({
  search = '',
  dateFrom = '',
  dateTo = '',
  sortColumn = 'created_at',
  sortDirection = 'desc',
} = {}) {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('leads')
    .select('*')

  query = applyLeadFilters(query, { search, dateFrom, dateTo })
  query = query.order(sortColumn, { ascending: sortDirection === 'asc', nullsFirst: false })
  query = query.range(0, 4999)

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data || []
}

export function subscribeToLeadChanges(onChange) {
  const supabase = getSupabaseClient()
  const channel = supabase
    .channel('admin-leads-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      () => {
        onChange()
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
