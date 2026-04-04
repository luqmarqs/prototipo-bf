function Hero({
  heroImage,
  heroImageMobile,
  heroTitle,
  heroSubtitle,
  signaturesCount,
  onSignClick,
  onShare,
}) {
  return (
    <section className="hero" aria-label="Hero da campanha">
      <picture>
        <source media="(max-width: 768px)" srcSet={heroImageMobile} />
        <img src={heroImage} alt={heroTitle} className="hero-image" />
      </picture>

      <div className="hero-overlay">
        <div className="container hero-content">
          <h1>{heroTitle}</h1>
          <p className="subtitle">{heroSubtitle}</p>

          <div className="hero-actions">
            <p className="counter">
              <strong>{signaturesCount.toLocaleString('pt-BR')} apoiadores cadastrados</strong>
            </p>

            <a
              href="#assinar"
              className="cta glow"
              onClick={(event) => {
                event.preventDefault()
                onSignClick()
              }}
            >
              Quero apoiar
            </a>

            <button type="button" className="cta whatsapp glow" onClick={onShare}>
              Compartilhar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero