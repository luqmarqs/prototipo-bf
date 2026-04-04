import NarrativeSection from '../components/NarrativeSection'
import landingConfig from '../config/landingConfig'

function QuemSou() {
  return (
    <>
      <NarrativeSection {...landingConfig.aboutPage} />

      <section className="section stats-dark">
        <div className="container">
          <div className="section-head">
            <h2>Dados da atuacao</h2>
          </div>

          <div className="indicator-grid">
            {landingConfig.socialProof.indicators.map((item) => (
              <article key={item.label} className="indicator-card">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default QuemSou
