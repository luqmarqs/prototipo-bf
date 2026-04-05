import { PortableText } from '@portabletext/react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import FormSection from '../components/FormSection'
import landingConfig from '../config/landingConfig'
import { fetchCampaignBySlug } from '../utils/campaigns'
import { setBasicSeo } from '../utils/seo'
import { shareOnWhatsApp } from '../utils/share'

function Campanha({ onOpenPrivacy }) {
  const { slug } = useParams()
  const [campaign, setCampaign] = useState(null)
  const [signaturesCount, setSignaturesCount] = useState(
    landingConfig.socialProof.liveCounter.initialValue,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    fetchCampaignBySlug(slug)
      .then((result) => {
        if (!active) {
          return
        }

        setCampaign(result)
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
  }, [slug])

  const campaignFormConfig = useMemo(
    () => ({
      ...landingConfig.forms,
      title: campaign?.form?.title || landingConfig.forms.title,
    }),
    [campaign],
  )

  useEffect(() => {
    if (!campaign?.title) {
      return
    }

    setBasicSeo({
      title: `${campaign.title} | ${landingConfig.metadata.brandName}`,
      description: campaign.hero?.text || campaign.contentSection?.title || campaign.title,
      imageUrl: campaign.hero?.imageUrl || campaign.contentSection?.imageUrl,
    })
  }, [campaign])

  useEffect(() => {
    fetch(landingConfig.socialProof.liveCounter.sourceUrl)
      .then((response) => response.json())
      .then((data) =>
        setSignaturesCount(
          Number(data.assinaturas) || landingConfig.socialProof.liveCounter.initialValue,
        ),
      )
      .catch(() => {
        // Keep default counter value if source is unavailable.
      })
  }, [])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Carregando campanha...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="section">
        <div className="container section-head">
          <h1>Campanha indisponivel</h1>
          <p>Nao foi possivel carregar esta campanha agora.</p>
          <Link to="/" className="button button-primary">
            Voltar para a home
          </Link>
        </div>
      </section>
    )
  }

  if (!campaign || !campaign.active) {
    return <Navigate to="/" replace />
  }

  const whatsappMessage = campaign.cta?.whatsappText || landingConfig.share.whatsappText

  return (
    <>
      <section className="section">
        <div className="container campaign-landing">
          <article className="campaign-hero-card">
            <div className="campaign-hero-media-wrap">
              {campaign.hero?.imageUrl ? (
                <img
                  src={campaign.hero.imageUrl}
                  alt={campaign.hero?.title || campaign.title}
                  className="campaign-hero-image"
                />
              ) : null}
              <div className="campaign-hero-shade" aria-hidden="true" />
            </div>

            <div className="campaign-hero-copy">
              <h1>{campaign.hero?.title || campaign.title}</h1>
              {campaign.hero?.text ? <p>{campaign.hero.text}</p> : null}
              <p className="campaign-signatures">
                <strong>{signaturesCount.toLocaleString('pt-BR')}</strong> assinaturas registradas
              </p>
              <div className="campaign-hero-actions">
                <a href="#assinar" className="button button-primary">
                  {campaign.cta?.ctaText || 'Quero apoiar'}
                </a>
                <button
                  type="button"
                  className="button button-whatsapp"
                  onClick={() => shareOnWhatsApp(whatsappMessage)}
                >
                  {campaign.cta?.whatsappButtonText || 'Compartilhar no WhatsApp'}
                </button>
              </div>
            </div>
          </article>

          <article className="campaign-content-card">
            <h2>{campaign.contentSection?.title || 'Conteudo da campanha'}</h2>
            {campaign.contentSection?.imageUrl ? (
              <img
                src={campaign.contentSection.imageUrl}
                alt={campaign.contentSection?.title || campaign.title}
                className="campaign-content-image"
              />
            ) : null}

            {campaign.contentSection?.content?.length ? (
              <div className="portable-content">
                <PortableText value={campaign.contentSection.content} />
              </div>
            ) : (
              <p>Conteudo em atualizacao.</p>
            )}
          </article>
        </div>
      </section>

      <FormSection
        formIntegration={campaignFormConfig.api}
        title={campaignFormConfig.title}
        source={campaign.form?.campaignTag || 'campanha'}
        page={campaign.slug}
        onShare={() => shareOnWhatsApp(whatsappMessage)}
        onOpenPrivacy={onOpenPrivacy}
      />
    </>
  )
}

export default Campanha
