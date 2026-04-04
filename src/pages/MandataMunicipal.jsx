import MandatesSection from '../components/MandatesSection'
import landingConfig from '../config/landingConfig'

function MandataMunicipal() {
  const municipal = landingConfig.mandatesPage.sections.find(
    (section) => section.slug === 'municipal',
  )

  return (
    <MandatesSection
      pageTitle="Mandato municipal"
      pageIntro="Aqui voce acompanha as propostas da Bancada Feminista na Camara Municipal de Sao Paulo e entende, de forma rapida, como essa atuacao impacta a vida na cidade."
      mandate={municipal}
    />
  )
}

export default MandataMunicipal
