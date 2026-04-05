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
import { exportLeadsToCsv } from '../../utils/admin/csv'
import { getLeadRowId } from '../../utils/admin/leads'

function AdminLeads() {
  const auth = useAdminAuth()
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [selectedIds, setSelectedIds] = useState([])
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isExporting, setIsExporting] = useState(false)

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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
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
      if (allSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  function handleClearFilters() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
    setFeedback('Filtros limpos.')
    setErrorMessage('')
  }

  async function handleExport() {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setErrorMessage('A data final precisa ser igual ou posterior a data inicial.')
      setFeedback('')
      return
    }

    setIsExporting(true)
    setErrorMessage('')
    setFeedback('')

    try {
      const exportedRows = await fetchLeadsForExport({
        search: deferredSearch,
        dateFrom,
        dateTo,
        sortColumn,
        sortDirection,
      })

      const rowsToExport = selectedIds.length > 0
        ? exportedRows.filter((row) => selectedIds.includes(getLeadRowId(row)))
        : exportedRows

      if (!rowsToExport.length) {
        setErrorMessage('Nenhum lead encontrado para exportar com os filtros atuais.')
        return
      }

      exportLeadsToCsv(rowsToExport, `leads-${new Date().toISOString().slice(0, 10)}.csv`)
      setFeedback(selectedIds.length > 0 ? 'CSV exportado com os leads selecionados.' : 'CSV exportado com sucesso.')
    } catch (exportError) {
      setErrorMessage(exportError.message || 'Nao foi possivel exportar o CSV.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminLayout
      title="Leads captados"
      subtitle="Painel com busca, filtros, exportacao CSV e atualizacao em tempo real via Supabase."
      email={auth.displayName}
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
        onExport={handleExport}
        exportLabel={isExporting ? 'Exportando...' : selectedIds.length > 0 ? 'Exportar selecionados' : 'Exportar CSV'}
        refreshing={refreshing}
      />

      {feedback ? <p className="admin-feedback admin-feedback-success">{feedback}</p> : null}
      {errorMessage ? <p className="admin-feedback admin-feedback-error">{errorMessage}</p> : null}
      {error ? <p className="admin-feedback admin-feedback-error">{error}</p> : null}

      {loading ? (
        <section className="admin-card admin-empty-state">
          <p>Carregando leads...</p>
        </section>
      ) : (
        <>
          <div className="admin-table-header">
            <p>
              {refreshing ? 'Sincronizando atualizacoes...' : 'Dados sincronizados com a tabela leads.'}
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
