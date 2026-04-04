function ProposalsSection({ title, intro, themes }) {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>

        <div className="card-grid">
          {themes.map((theme) => (
            <article key={theme.title} className="info-card">
              <h2>{theme.title}</h2>
              <p>{theme.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProposalsSection
