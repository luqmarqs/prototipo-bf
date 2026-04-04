import { useEffect, useState } from 'react'
import EventsSection from '../components/EventsSection'
import CampaignForm from '../components/CampaignForm'
import landingConfig from '../config/landingConfig'
import { fetchAgendas } from '../utils/agendas'
import { shareOnWhatsApp } from '../utils/share'
import { setBasicSeo } from '../utils/seo'

function Eventos({ onOpenPrivacy }) {
  const [agendas, setAgendas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setBasicSeo({
      title: `${landingConfig.metadata.brandName} | Agenda`,
      description: landingConfig.eventsPage.intro,
    })
  }, [])

  useEffect(() => {
    fetchAgendas()
      .then((items) => {
        setAgendas(items)
        setError(false)
      })
      .catch(() => {
        setError(true)
        setAgendas([])
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  function handleAgendaAction() {
    const formSection = document.getElementById('quero-participar')

    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    window.location.hash = '#quero-participar'
  }

  return (
    <>
      <EventsSection
        title={landingConfig.eventsPage.title}
        intro={landingConfig.eventsPage.intro}
        events={agendas}
        loading={isLoading}
        error={error}
        onAction={handleAgendaAction}
      />

      <CampaignForm
        mode="full"
        formConfig={landingConfig.forms}
        source="agenda"
        page="agenda"
        submitLabel="Receber agenda completa"
        onShare={() => shareOnWhatsApp(landingConfig.share.whatsappText)}
        onOpenPrivacy={onOpenPrivacy}
      />
    </>
  )
}

export default Eventos
