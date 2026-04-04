function SocialProofSection({ title, description, counter, indicators, testimonials, photos }) {
  return (
    <section className="section social-proof" aria-label="Prova social">
      <div className="container">
        <div className="section-head">
          <h2>{title}</h2>
          <p>
            {description} {counter.toLocaleString('pt-BR')} pessoas ja passaram pelo cadastro de
            mobilizacao.
          </p>
        </div>

        <div className="indicator-grid">
          {indicators.map((item) => (
            <article key={item.label} className="indicator-card">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>

        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <p>{item.text}</p>
              <h3>{item.name}</h3>
              <small>{item.role}</small>
            </article>
          ))}
        </div>

        <div className="photo-grid" aria-label="Fotos da mobilizacao">
          {photos.map((photo, index) => (
            <img key={`${photo}-${index}`} src={photo} alt={`Mobilizacao ${index + 1}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProofSection
