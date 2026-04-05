function AdminLeadsToolbar({
  search,
  dateFrom,
  dateTo,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  onExport,
  exportLabel,
  onExportXlsx,
  exportXlsxLabel,
  extraFilters,
}) {
  return (
    <section className="admin-card admin-toolbar-card">
      <div className={`admin-toolbar-grid${extraFilters ? ' admin-toolbar-grid-wide' : ''}`}>
        <label className="admin-field">
          <span>Buscar</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Nome, e-mail ou telefone"
          />
        </label>

        <label className="admin-field">
          <span>Data inicial</span>
          <input type="date" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
        </label>

        <label className="admin-field">
          <span>Data final</span>
          <input type="date" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
        </label>

        {extraFilters}
      </div>

      <div className="admin-toolbar-actions">
        <button type="button" className="button admin-secondary-button" onClick={onClearFilters}>
          Limpar filtros
        </button>

        <button type="button" className="button button-primary" onClick={onExport}>
          {exportLabel}
        </button>

        {onExportXlsx ? (
          <button type="button" className="button admin-secondary-button" onClick={onExportXlsx}>
            {exportXlsxLabel || 'Exportar Excel'}
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default AdminLeadsToolbar
