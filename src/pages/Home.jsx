import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CampaignForm from '../components/CampaignForm'
import NewsSection from '../components/NewsSection'
import PageHero from '../components/PageHero'
import landingConfig from '../config/landingConfig'
import { fetchActiveCampaigns } from '../utils/campaigns'
import { fetchLatestNews } from '../utils/news'
import { setBasicSeo } from '../utils/seo'
import { shareOnWhatsApp } from '../utils/share'

function Home({ onOpenPrivacy }) {
  const [newsPosts, setNewsPosts] = useState([])
  const [isLoadingNews, setIsLoadingNews] = useState(true)
  const [newsError, setNewsError] = useState(false)
  const [campaigns, setCampaigns] = useState(landingConfig.thematicLandings)
  const [campaignsError, setCampaignsError] = useState(false)

  useEffect(() => {
    let active = true

    fetchLatestNews(4)
      .then((posts) => {
        if (!active) {
          return
        }

        setNewsPosts(posts)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setNewsError(true)
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

  useEffect(() => {
    setBasicSeo({
      title: `${landingConfig.metadata.brandName} | Home`,
      description: landingConfig.home.hero.subheadline,
      imageUrl: landingConfig.assets.heroImage,
    })
  }, [])

  useEffect(() => {
    // Preload das imagens do hero para melhorar LCP no primeiro carregamento.
    const desktopPreload = document.createElement('link')
    desktopPreload.rel = 'preload'
    desktopPreload.as = 'image'
    desktopPreload.href = landingConfig.assets.heroImage

    const mobilePreload = document.createElement('link')
    mobilePreload.rel = 'preload'
    mobilePreload.as = 'image'
    mobilePreload.href = landingConfig.assets.heroImageMobile
    mobilePreload.media = '(max-width: 768px)'

    document.head.appendChild(desktopPreload)
    document.head.appendChild(mobilePreload)

    return () => {
      desktopPreload.remove()
      mobilePreload.remove()
    }
  }, [])

  useEffect(() => {
    let active = true

    fetchActiveCampaigns(6)
      .then((items) => {
        if (!active || !items.length) {
          return
        }

        setCampaigns(items)
      })
      .catch(() => {
        if (!active) {
          return
        }

        setCampaignsError(true)
        // Keeps local fallback campaigns when CMS is unavailable.
      })

    return () => {
      active = false
    }
  }, [])

  const location = useLocation()

  useEffect(() => {
    // Se o hash é #quero-participar, rola para o formulário quando o elemento estiver pronto
    if (location.hash === '#quero-participar') {
      let attempts = 0
      const maxAttempts = 30 // tenta por até 3 segundos (30 * 100ms)
      let timeoutId
      let cancelled = false
      
      const tryScroll = () => {
        if (cancelled) {
          return
        }

        const elemento = document.getElementById('quero-participar')
        
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth' })
          return
        }
        
        if (attempts < maxAttempts) {
          attempts++
          timeoutId = setTimeout(tryScroll, 100)
        }
      }
      
      // Começa a tentar imediatamente
      tryScroll()

      return () => {
        cancelled = true
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }
  }, [location.hash])

  function scrollToCapture() {
    document.getElementById('quero-participar')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleShare() {
    shareOnWhatsApp(landingConfig.share.whatsappText)
  }

  return (
    <>
      <PageHero
        title={landingConfig.home.hero.title}
        subtitle={`${landingConfig.home.hero.headline} ${landingConfig.home.hero.subheadline}`}
        image={landingConfig.assets.heroImage}
        ctaLabel={landingConfig.home.hero.primaryCta}
        onPrimaryCta={scrollToCapture}
        onShare={handleShare}
      />

      <section className="section deferred-section" id="campanhas">
        <div className="container thematic-list">
          <div className="section-head">
            <h2>{landingConfig.home.campaignsTitle}</h2>
            {campaignsError ? (
              <p>Exibindo campanhas locais enquanto o CMS fica indisponivel.</p>
            ) : null}
          </div>

          <div className="card-grid">
            {campaigns.map((item) => (
              <Link
                key={item.id || item.slug}
                to={`/campanha/${item.slug}`}
                className="campaign-card-link"
              >
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
                  <span className="button button-primary">
                    {item.ctaLabel || 'Ver landing'}
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="deferred-section">
        <NewsSection
          title={landingConfig.home.newsSection.title}
          intro={landingConfig.home.newsSection.intro}
          posts={newsPosts}
          loading={isLoadingNews}
          error={newsError}
          showMoreLink
        />
      </div>

      <div className="deferred-section">
        <CampaignForm
          mode="full"
          formConfig={landingConfig.forms}
          source="landing-principal"
          page="home"
          submitLabel="Enviar e participar"
          onShare={handleShare}
          onOpenPrivacy={onOpenPrivacy}
        />
      </div>
    </>
  )
}

export default Home