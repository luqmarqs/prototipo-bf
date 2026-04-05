function AdminPagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) {
    return null
  }

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(totalItems, currentPage * pageSize)

  return (
    <div className="admin-pagination">
      <p className="admin-pagination-copy">
        Exibindo {start}–{end} de {totalItems} leads
      </p>

      <div className="admin-pagination-actions">
        <button
          type="button"
          className="button admin-secondary-button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </button>

        <span className="admin-page-badge">Pagina {currentPage} de {totalPages}</span>

        <button
          type="button"
          className="button admin-secondary-button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Proxima
        </button>
      </div>
    </div>
  )
}

export default AdminPagination
