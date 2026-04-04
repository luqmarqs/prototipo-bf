import { useEffect, useState } from 'react'
import NewsSection from '../components/NewsSection'
import landingConfig from '../config/landingConfig'
import { fetchNewsPage } from '../utils/news'
import { setBasicSeo } from '../utils/seo'

function Noticias() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  const pageSize = 6

  useEffect(() => {
    let active = true

    setLoading(true)
    setError(false)

    fetchNewsPage({ offset: 0, limit: pageSize })
      .then((response) => {
        if (!active) {
          return
        }

        setItems(response.items)
        setTotal(response.total)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setError(true)
      })
      .finally(() => {
        if (!active) {
          return
        }

        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setBasicSeo({
      title: `Noticias | ${landingConfig.metadata.brandName}`,
      description: 'Ultimas noticias e artigos da Bancada Feminista.',
    })
  }, [])

  async function handleLoadMore() {
    setLoadingMore(true)

    try {
      const response = await fetchNewsPage({ offset: items.length, limit: pageSize })
      setItems((current) => [...current, ...response.items])
      setTotal(response.total)
    } catch {
      setError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <>
      <NewsSection
        title="Noticias"
        intro="Acompanhe todas as publicacoes mais recentes da Bancada Feminista."
        posts={items}
        loading={loading}
        error={error}
      />

      {!loading && !error && items.length < total ? (
        <section className="section news-more-section">
          <div className="container">
            <button
              type="button"
              className="button button-primary"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Carregando...' : 'Ver mais noticias'}
            </button>
          </div>
        </section>
      ) : null}
    </>
  )
}

export default Noticias
