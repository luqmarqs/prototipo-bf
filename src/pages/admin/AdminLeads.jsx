import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminLeadsTable from '../../components/admin/AdminLeadsTable'
import AdminLeadsToolbar from '../../components/admin/AdminLeadsToolbar'
import AdminPagination from '../../components/admin/AdminPagination'
import AdminStatCard from '../../components/admin/AdminStatCard'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useLeads } from '../../hooks/useLeads'
import { signOutAdmin } from '../../services/supabase/auth'
import { fetchLeadsForExport } from '../../services/supabase/leads'
import { exportLeadsToCsv, exportLeadsToXlsx } from '../../utils/admin/csv'
import { getLeadRowId } from '../../utils/admin/leads'

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

function AdminLeads() {
  const auth = useAdminAuth()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedIds, setSelectedIds] = useState([])
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingXlsx, setIsExportingXlsx] = useState(false)
  const feedback = useFeedback()
  const errorFeedback = useFeedback()

  const deferredSearch = useDeferredValue(search)
  const pageSize = 15
  const filters = useMemo(() => ({
    page: currentPage,
    pageSize,
    search: deferredSearch,
    dateFrom,
    dateTo,
    sortColumn,
    sortDirection,
  }), [currentPage, deferredSearch, dateFrom, dateTo, sortColumn, sortDirection])

  const { rows, total, metrics, loading, refreshing, error, refresh } = useLeads(filters, {
    enabled: auth.isAuthorized,
    realtime: true,
  })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch, dateFrom, dateTo])

  useEffect(() => {
    setSelectedIds([])
  }, [rows])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  async function handleLogout() {
    await signOutAdmin()
  }

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
    setCurrentPage(1)
    feedback.show('Filtros limpos.')
  }

  async function getRowsForExport() {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      errorFeedback.show('A data final precisa ser igual ou posterior à data inicial.', 'error')
      return null
    }
    const exported = await fetchLeadsForExport({ search: deferredSearch, dateFrom, dateTo, sortColumn, sortDirection })
    return selectedIds.length > 0
      ? exported.filter((row) => selectedIds.includes(getLeadRowId(row)))
      : exported
  }

  async function handleExportCsv() {
    setIsExporting(true)
    try {
      const rowsToExport = await getRowsForExport()
      if (!rowsToExport) return
      if (!rowsToExport.length) {
        errorFeedback.show('Nenhum lead encontrado para exportar com os filtros atuais.', 'error')
        return
      }
      exportLeadsToCsv(rowsToExport, `leads-${new Date().toISOString().slice(0, 10)}.csv`)
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
      if (!rowsToExport.length) {
        errorFeedback.show('Nenhum lead encontrado para exportar com os filtros atuais.', 'error')
        return
      }
      await exportLeadsToXlsx(rowsToExport, `leads-${new Date().toISOString().slice(0, 10)}.xlsx`)
      feedback.show(selectedIds.length > 0 ? 'Excel exportado com os leads selecionados.' : 'Excel exportado com sucesso.')
    } catch (exportError) {
      errorFeedback.show(exportError.message || 'Não foi possível exportar o Excel.', 'error')
    } finally {
      setIsExportingXlsx(false)
    }
  }

  return (
    <AdminLayout
      title="Leads captados"
      subtitle="Busca, filtros, exportação CSV/Excel e sincronização em tempo real."
      displayName={auth.displayName}
      avatarUrl={auth.avatarUrl}
      userEmail={auth.email}
      onLogout={handleLogout}
    >
      <section className="admin-stats-grid">
        <AdminStatCard label="Leads totais" value={metrics.totalLeads} highlight />
        <AdminStatCard label="Leads hoje" value={metrics.leadsToday} />
        <AdminStatCard label="Resultados filtrados" value={total} />
        <AdminStatCard label="Selecionados" value={selectedIds.length} />
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
          <div className="admin-skeleton admin-skeleton-row" />
          <div className="admin-skeleton admin-skeleton-row admin-skeleton-short" />
        </section>
      ) : (
        <>
          <div className="admin-table-header">
            <p className={refreshing ? 'admin-sync-label admin-sync-label-active' : 'admin-sync-label'}>
              {refreshing ? 'Sincronizando...' : 'Sincronizado'}
            </p>
            <button type="button" className="button admin-secondary-button" onClick={refresh}>
              Atualizar agora
            </button>
          </div>

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
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </AdminLayout>
  )
}

export default AdminLeads
