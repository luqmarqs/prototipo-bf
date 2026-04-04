import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import landingConfig from '../config/landingConfig'
import { fetchActiveCampaigns } from '../utils/campaigns'
import { setBasicSeo } from '../utils/seo'

function Campanhas() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchActiveCampaigns(20)
      .then((items) => {
        if (!active) {
          return
        }

        setCampaigns(items)
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
      title: `Campanhas | ${landingConfig.metadata.brandName}`,
      description: 'Campanhas ativas da Bancada Feminista com landing pages dinamicas.',
    })
  }, [])

  return (
    <section className="section">
      <div className="container thematic-list">
        <div className="section-head">
          <h1>Campanhas</h1>
          <p>Selecione uma campanha para abrir a landing page completa.</p>
        </div>

        {loading ? <p>Carregando campanhas...</p> : null}
        {error ? <p>Nao foi possivel carregar campanhas agora.</p> : null}

        {!loading && !error ? (
          <div className="card-grid">
            {campaigns.map((item) => (
              <Link key={item.id} to={`/campanha/${item.slug}`} className="campaign-card-link">
                <article className="info-card">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="campaign-card-image"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : null}
                  <span className="thematic-chip">{item.type}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="button button-primary">{item.ctaLabel || 'Ver landing'}</span>
                </article>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Campanhas
