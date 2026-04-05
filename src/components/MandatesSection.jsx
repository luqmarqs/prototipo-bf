import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchLatestNews } from '../utils/news'

function formatNewsDate(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function MandatesSection({ pageTitle, pageIntro, mandate }) {
  const [query, setQuery] = useState('')
  const [yearFilter, setYearFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [newsItems, setNewsItems] = useState([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const projects = useMemo(() => mandate?.projects || [], [mandate])
  const pageSize = 12

  useEffect(() => {
    let active = true

    fetchLatestNews(3)
      .then((items) => {
        if (!active) {
          return
        }

        setNewsItems(items)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setNewsItems([])
      })
      .finally(() => {
        if (!active) {
          return
        }

        setIsLoadingNews(false)
      })

    return () => {
      active = false
    }
  }, [])

  const availableYears = useMemo(() => {
    const years = projects
      .map((project) => project.code.match(/\/(\d{4})$/)?.[1])
      .filter(Boolean)

    return [...new Set(years)].sort((a, b) => b.localeCompare(a))
  }, [projects])

  const filteredProjects = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return projects.filter((project) => {
      const byYear = yearFilter === 'all' || project.code.endsWith(`/${yearFilter}`)
      const byText =
        !normalized ||
        project.code.toLowerCase().includes(normalized) ||
        project.title.toLowerCase().includes(normalized)

      return byYear && byText
    })
  }, [projects, query, yearFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProjects = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredProjects.slice(start, start + pageSize)
  }, [filteredProjects, safeCurrentPage])

  if (!mandate) {
    return null
  }

  return (
    <section className="section">
      <div className="container mandates-page">
        <div className="section-head mandates-head">
          <h1>{pageTitle}</h1>
          <p>{pageIntro}</p>
        </div>

        <section className="mandates-group mandates-scope-section">
          <div className="mandates-scope-top">
            <div className="section-head mandates-group-head">
              <p>{mandate.description}</p>
            </div>
          </div>

          {isLoadingNews ? (
            <section className="mandates-news-section">
              <div className="section-head mandates-group-head">
                <h3>Noticias recentes</h3>
                <p>Carregando artigos...</p>
              </div>
            </section>
          ) : newsItems.length ? (
            <section className="mandates-news-section">
              <div className="section-head mandates-group-head">
                <h3>Noticias recentes</h3>
              </div>

              <div className="mandates-news-grid">
                {newsItems.map((item) => (
                  <article key={item.id} className="mandates-news-card">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="mandates-news-image"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}

                    <div className="mandates-news-content">
                      <small>
                        {formatNewsDate(item.publishedAt)}
                        {item.author ? ` | ${item.author}` : ''}
                      </small>
                      <h4>{item.title}</h4>
                      <Link to={`/noticias/${item.slug}`} className="inline-link">
                        Ler materia
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mandates-projects-section">
            <div className="section-head mandates-group-head">
              <h3>Projetos de lei</h3>
              <p>Busque por numero, palavra-chave ou filtre por ano.</p>
            </div>

            <div className="pl-filters" role="search" aria-label="Busca de projetos de lei">
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Buscar PL por numero ou tema"
                aria-label="Buscar projeto de lei"
              />

              <select
                value={yearFilter}
                onChange={(event) => {
                  setYearFilter(event.target.value)
                  setCurrentPage(1)
                }}
                aria-label="Filtrar por ano"
              >
                <option value="all">Todos os anos</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <p className="pl-results-count">
                {filteredProjects.length} PLs encontrados
                {filteredProjects.length ? ` · Pagina ${safeCurrentPage} de ${totalPages}` : ''}
              </p>
            </div>

            <div className="mandates-grid">
              {paginatedProjects.map((project) => (
                <article key={`${mandate.slug}-${project.code}`} className="mandate-card">
                  <div className="mandate-meta-row">
                    <span className="thematic-chip">{project.code}</span>
                  </div>
                  <h3>{project.title}</h3>
                </article>
              ))}
            </div>

            {filteredProjects.length > pageSize ? (
              <div className="pl-pagination" aria-label="Paginacao dos projetos de lei">
                <button
                  type="button"
                  className="button pl-page-btn"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Anterior
                </button>

                <span className="pl-page-indicator">Pagina {safeCurrentPage} de {totalPages}</span>

                <button
                  type="button"
                  className="button pl-page-btn"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  disabled={safeCurrentPage === totalPages}
                >
                  Proxima
                </button>
              </div>
            ) : null}

            {!filteredProjects.length ? (
              <p className="pl-empty-state">Nenhum PL encontrado com esse filtro.</p>
            ) : null}
          </section>
        </section>
      </div>
    </section>
  )
}

export default MandatesSection