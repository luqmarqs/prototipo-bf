function PageHero({
  title,
  subtitle,
  image,
  imageMobile,
  ctaLabel,
  onPrimaryCta,
  onShare,
  signaturesCount,
}) {
  return (
    <section className="page-hero">
      <div className="page-hero-media">
        {image && (
          <picture>
            {imageMobile ? <source media="(max-width: 768px)" srcSet={imageMobile} /> : null}
            <img
              src={image}
              alt={title}
              className="page-hero-image"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        )}
        <div className="page-hero-overlay" aria-hidden="true" />
      </div>

      <div className="page-hero-panel">
        <div className="container">
          <div className="page-hero-copy">
            <h1>{title}</h1>
            <p>{subtitle}</p>
            {typeof signaturesCount === 'number' ? (
              <p className="hero-signatures">
                <strong>{signaturesCount.toLocaleString('pt-BR')}</strong> assinaturas registradas
              </p>
            ) : null}
            <div className="hero-cta-row">
              <button type="button" className="button button-primary" onClick={onPrimaryCta}>
                {ctaLabel}
              </button>
              <button type="button" className="button button-whatsapp" onClick={onShare}>
                Compartilhar no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PageHero
