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
  refreshing,
}) {
  return (
    <section className="admin-card admin-toolbar-card">
      <div className="admin-toolbar-grid">
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
      </div>

      <div className="admin-toolbar-actions">
        <button type="button" className="button admin-secondary-button" onClick={onClearFilters}>
          Limpar filtros
        </button>

        <button type="button" className="button button-primary" onClick={onExport}>
          {refreshing ? 'Atualizando...' : exportLabel}
        </button>
      </div>
    </section>
  )
}

export default AdminLeadsToolbar
