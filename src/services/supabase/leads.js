/**
 * Camada de acesso a dados para a tabela `public.leads`.
 *
 * Responsabilidades:
 * - Busca paginada com filtros de texto e data
 * - Métricas agregadas (total e hoje)
 * - Export sem paginação (até 5000 registros)
 * - Subscrição realtime via Supabase Realtime
 */
import { getSupabaseClient } from './client'

/**
 * Aplica filtros de busca e data a uma query Supabase existente.
 * A busca por texto cobre nome, e-mail e telefone (case-insensitive).
 * Caracteres especiais do SQL são removidos do termo de busca antes do `ilike`.
 *
 * @param {object} query - Query Supabase em andamento.
 * @param {object} [filters]
 * @param {string} [filters.search] - Termo de busca livre.
 * @param {string} [filters.dateFrom] - Data inicial no formato YYYY-MM-DD.
 * @param {string} [filters.dateTo] - Data final no formato YYYY-MM-DD.
 * @returns {object} Query com filtros aplicados.
 */
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

/**
 * Busca leads paginados com filtros opcionais.
 *
 * @param {object} [params]
 * @param {number} [params.page=1] - Página atual (base 1).
 * @param {number} [params.pageSize=15] - Registros por página.
 * @param {string} [params.search] - Busca por nome, e-mail ou telefone.
 * @param {string} [params.dateFrom] - Data inicial (YYYY-MM-DD).
 * @param {string} [params.dateTo] - Data final (YYYY-MM-DD).
 * @param {string} [params.sortColumn='created_at'] - Coluna de ordenação.
 * @param {'asc'|'desc'} [params.sortDirection='desc'] - Direção da ordenação.
 * @returns {Promise<{ rows: object[], total: number }>}
 */
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

/**
 * Retorna métricas agregadas de leads: total geral e total captado hoje.
 * Usa `head: true` para evitar retornar os dados — apenas a contagem.
 *
 * @returns {Promise<{ totalLeads: number, leadsToday: number }>}
 */
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

/**
 * Busca todos os leads sem paginação para exportação (máx. 5000 registros).
 * Aceita os mesmos filtros de `fetchLeads`, exceto `page` e `pageSize`.
 *
 * @param {object} [params]
 * @param {string} [params.search]
 * @param {string} [params.dateFrom]
 * @param {string} [params.dateTo]
 * @param {string} [params.sortColumn='created_at']
 * @param {'asc'|'desc'} [params.sortDirection='desc']
 * @returns {Promise<object[]>}
 */
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

/**
 * Subscreve a mudanças realtime na tabela `public.leads`.
 * Chama `onChange` em qualquer INSERT, UPDATE ou DELETE.
 * Retorna uma função de cleanup que remove o canal.
 *
 * @param {() => void} onChange - Callback chamado quando há mudança.
 * @returns {() => void} Função de unsubscribe.
 */
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
