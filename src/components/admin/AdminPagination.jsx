function buildPageNumbers(currentPage, totalPages) {
  const delta = 2
  const pages = []

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1
      || i === totalPages
      || (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return pages
}

function AdminPagination({ currentPage, totalPages, totalItems, pageSize, onPageChange, label = 'registros' }) {
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(totalItems, currentPage * pageSize)
  const pageNumbers = buildPageNumbers(currentPage, totalPages)

  return (
    <div className="admin-pagination">
      <p className="admin-pagination-copy">
        Exibindo {start}–{end} de {totalItems} {label}
      </p>

      <div className="admin-pagination-actions">
        <button
          type="button"
          className="button admin-secondary-button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Página anterior"
        >
          ←
        </button>

        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <span key={`ellipsis-${index}`} className="admin-pagination-ellipsis">
                …
              </span>
            )
          }

          return (
            <button
              key={page}
              type="button"
              className={currentPage === page ? 'button admin-pagination-number admin-pagination-number-active' : 'button admin-pagination-number'}
              onClick={() => onPageChange(page)}
              aria-label={`Ir para página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })}

        <button
          type="button"
          className="button admin-secondary-button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Próxima página"
        >
          →
        </button>
      </div>
    </div>
  )
}

export default AdminPagination
