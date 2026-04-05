import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminLeadsTable from '../../components/admin/AdminLeadsTable'
import AdminLeadsToolbar from '../../components/admin/AdminLeadsToolbar'
import AdminPagination from '../../components/admin/AdminPagination'
import AdminStatCard from '../../components/admin/AdminStatCard'
import LeadsBarChart from '../../components/admin/LeadsBarChart'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useCampaignChartData, useCampaignLeads } from '../../hooks/useCampaignLeads'
import { signOutAdmin } from '../../services/supabase/auth'
import { fetchCampaignLeadsForExport } from '../../services/supabase/campaigns'
import { fetchCampaignBySlug as fetchCampaignFromSanity } from '../../utils/campaigns'
import { exportLeadsToCsv, exportLeadsToXlsx } from '../../utils/admin/csv'
import { getLeadRowId } from '../../utils/admin/leads'

const PAGE_SIZE = 15

function useFeedback() {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('success')

  function show(msg, msgType = 'success') {
    setMessage(msg)
    setType(msgType)
    setTimeout(() => setMessage(''), 5000)
  }

  return { message, type, show }
}

function AdminCampaignDetail() {
  const { slug } = useParams()
  const auth = useAdminAuth()

  const [campaign, setCampaign] = useState(null)
  const [campaignError, setCampaignError] = useState('')

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [utmSource, setUtmSource] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedIds, setSelectedIds] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingXlsx, setIsExportingXlsx] = useState(false)
  const feedback = useFeedback()
  const errorFeedback = useFeedback()

  const deferredSearch = useDeferredValue(search)

  const filters = useMemo(() => ({
    page: currentPage,
    pageSize: PAGE_SIZE,
    search: deferredSearch,
    dateFrom,
    dateTo,
    utmSource,
    sortColumn,
    sortDirection,
  }), [currentPage, deferredSearch, dateFrom, dateTo, utmSource, sortColumn, sortDirection])

  const { rows, total, metrics, loading, error } = useCampaignLeads(slug, filters, {
    enabled: auth.isAuthorized && Boolean(slug),
  })

  const { dailyData, utmSources } = useCampaignChartData(slug, {
    enabled: auth.isAuthorized && Boolean(slug),
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (!slug || !auth.isAuthorized) return undefined
    let active = true
    fetchCampaignFromSanity(slug)
      .then((data) => {
        if (active) setCampaign(data ? { name: data.title, slug: data.slug } : null)
      })
      .catch((err) => { if (active) setCampaignError(err.message || 'Campanha não encontrada.') })
    return () => { active = false }
  }, [slug, auth.isAuthorized])

  useEffect(() => { setCurrentPage(1) }, [deferredSearch, dateFrom, dateTo, utmSource])
  useEffect(() => { setSelectedIds([]) }, [rows])
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages) }, [currentPage, totalPages])

  async function handleLogout() { await signOutAdmin() }

  function handleSort(column) {
    if (sortColumn === column) {
      setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortColumn(column)
    setSortDirection('asc')
  }

  function handleToggleSelect(rowId) {
    setSelectedIds((current) => (
      current.includes(rowId)
        ? current.filter((value) => value !== rowId)
        : [...current, rowId]
    ))
  }

  function handleToggleSelectAll(visibleRows) {
    const visibleIds = visibleRows.map((row) => getLeadRowId(row))
    const allSelected = visibleIds.every((id) => selectedIds.includes(id))
    setSelectedIds((current) => {
      if (allSelected) return current.filter((id) => !visibleIds.includes(id))
      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  function handleClearFilters() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setUtmSource('')
    setCurrentPage(1)
    feedback.show('Filtros limpos.')
  }

  async function getRowsForExport() {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorFeedback.show('A data final precisa ser igual ou posterior à data inicial.', 'error')
      return null
    }
    const exported = await fetchCampaignLeadsForExport(slug, { search: deferredSearch, dateFrom, dateTo, utmSource })
    return selectedIds.length > 0
      ? exported.filter((row) => selectedIds.includes(getLeadRowId(row)))
      : exported
  }

  async function handleExportCsv() {
    setIsExporting(true)
    try {
      const rowsToExport = await getRowsForExport()
      if (!rowsToExport) return
      if (!rowsToExport.length) { errorFeedback.show('Nenhum lead encontrado para exportar.', 'error'); return }
      exportLeadsToCsv(rowsToExport, `${slug}-${new Date().toISOString().slice(0, 10)}.csv`)
      feedback.show(selectedIds.length > 0 ? 'CSV exportado com os leads selecionados.' : 'CSV exportado com sucesso.')
    } catch (exportError) {
      errorFeedback.show(exportError.message || 'Não foi possível exportar o CSV.', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleExportXlsx() {
    setIsExportingXlsx(true)
    try {
      const rowsToExport = await getRowsForExport()
      if (!rowsToExport) return
      if (!rowsToExport.length) { errorFeedback.show('Nenhum lead encontrado para exportar.', 'error'); return }
      exportLeadsToXlsx(rowsToExport, `${slug}-${new Date().toISOString().slice(0, 10)}.xlsx`)
      feedback.show(selectedIds.length > 0 ? 'Excel exportado com os leads selecionados.' : 'Excel exportado com sucesso.')
    } catch (exportError) {
      errorFeedback.show(exportError.message || 'Não foi possível exportar o Excel.', 'error')
    } finally {
      setIsExportingXlsx(false)
    }
  }

  const campaignName = campaign?.name || slug

  const utmSourceFilter = utmSources.length > 0 ? (
    <label className="admin-field">
      <span>Origem (utm_source)</span>
      <select value={utmSource} onChange={(e) => setUtmSource(e.target.value)}>
        <option value="">Todas as origens</option>
        {utmSources.map((src) => (
          <option key={src} value={src}>{src}</option>
        ))}
      </select>
    </label>
  ) : null

  return (
    <AdminLayout
      title={campaignName}
      subtitle={`Leads da campanha "${campaignName}" — filtros, gráfico e exportação.`}
      displayName={auth.displayName}
      avatarUrl={auth.avatarUrl}
      userEmail={auth.email}
      onLogout={handleLogout}
    >
      <div className="admin-campaign-detail-back">
        <Link to="/admin/campanhas" className="button admin-secondary-button">
          ← Voltar para campanhas
        </Link>
      </div>

      {campaignError ? (
        <p className="admin-feedback admin-feedback-error">{campaignError}</p>
      ) : null}

      <section className="admin-stats-grid">
        <AdminStatCard label="Total de leads" value={metrics.totalLeads} highlight />
        <AdminStatCard label="Leads hoje" value={metrics.leadsToday} />
        <AdminStatCard label="Resultados filtrados" value={total} />
        <AdminStatCard label="Selecionados" value={selectedIds.length} />
      </section>

      <section className="admin-card admin-chart-card">
        <LeadsBarChart data={dailyData} days={30} />
      </section>

      <AdminLeadsToolbar
        search={search}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearch}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearFilters={handleClearFilters}
        onExport={handleExportCsv}
        exportLabel={isExporting ? 'Exportando...' : selectedIds.length > 0 ? 'CSV selecionados' : 'Exportar CSV'}
        onExportXlsx={handleExportXlsx}
        exportXlsxLabel={isExportingXlsx ? 'Exportando...' : selectedIds.length > 0 ? 'Excel selecionados' : 'Exportar Excel'}
        extraFilters={utmSourceFilter}
      />

      {feedback.message ? (
        <p className="admin-feedback admin-feedback-success">{feedback.message}</p>
      ) : null}
      {errorFeedback.message ? (
        <p className="admin-feedback admin-feedback-error">{errorFeedback.message}</p>
      ) : null}
      {error ? (
        <p className="admin-feedback admin-feedback-error">{error}</p>
      ) : null}

      {loading ? (
        <section className="admin-card admin-skeleton-wrap">
          <div className="admin-skeleton admin-skeleton-row" />
          <div className="admin-skeleton admin-skeleton-row" />
          <div className="admin-skeleton admin-skeleton-row" />
          <div className="admin-skeleton admin-skeleton-row admin-skeleton-short" />
        </section>
      ) : (
        <>
          <AdminLeadsTable
            rows={rows}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
          />

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            label="leads"
          />
        </>
      )}
    </AdminLayout>
  )
}

export default AdminCampaignDetail
