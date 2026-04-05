import { buildLeadColumns, formatLeadValue, getLeadRowId } from '../../utils/admin/leads'

function AdminLeadsTable({
  rows,
  sortColumn,
  sortDirection,
  onSort,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) {
  const columns = buildLeadColumns(rows)
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(getLeadRowId(row)))

  if (!rows.length) {
    return (
      <section className="admin-card admin-empty-state">
        <h3>Nenhum lead encontrado</h3>
        <p>Ajuste a busca ou o intervalo de datas para encontrar registros.</p>
      </section>
    )
  }

  return (
    <section className="admin-card admin-table-card">
      <p className="admin-table-scroll-hint" aria-hidden="true">
        ← deslize para ver mais →
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-checkbox-cell">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => onToggleSelectAll(rows)}
                  aria-label="Selecionar todos os leads visíveis"
                />
              </th>

              {columns.map((column) => {
                const isActive = sortColumn === column.key

                return (
                  <th key={column.key}>
                    <button
                      type="button"
                      className={isActive ? 'admin-sort-button admin-sort-button-active' : 'admin-sort-button'}
                      onClick={() => onSort(column.key)}
                    >
                      {column.label}
                      {isActive ? <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span> : null}
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const rowId = getLeadRowId(row)
              const isSelected = selectedIds.includes(rowId)

              return (
                <tr key={rowId} className={isSelected ? 'admin-row-selected' : ''}>
                  <td className="admin-checkbox-cell">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(rowId)}
                      aria-label={`Selecionar lead ${row.email || row.nome || row.name || rowId}`}
                    />
                  </td>

                  {columns.map((column) => (
                    <td key={`${rowId}-${column.key}`}>{formatLeadValue(row[column.key], column.key)}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default AdminLeadsTable
