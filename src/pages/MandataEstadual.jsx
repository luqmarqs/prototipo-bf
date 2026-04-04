import MandatesSection from '../components/MandatesSection'
import landingConfig from '../config/landingConfig'

function MandataEstadual() {
  const estadual = landingConfig.mandatesPage.sections.find(
    (section) => section.slug === 'estadual',
  )

  return (
    <MandatesSection
      pageTitle="Mandato estadual"
      pageIntro="Nesta pagina, voce encontra as propostas da Bancada Feminista na ALESP, com uma visao clara das prioridades e dos temas que estao em debate no Estado."
      mandate={estadual}
    />
  )
}

export default MandataEstadual
