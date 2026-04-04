import sanityClient from './sanityClient'

const AGENDA_LIST_QUERY = `*[_type == "event"] | order(startDate asc){
  _id,
  title,
  description,
  startDate,
  endDate,
  status,
  "locationName": location.name,
  "locationAddress": location.address,
  externalLink,
  "imageUrl": image.asset->url
}`

export async function fetchAgendas() {
  try {
    const agendas = await sanityClient.fetch(AGENDA_LIST_QUERY)
    return agendas.map((agenda) => ({
      id: agenda._id,
      title: agenda.title,
      description: agenda.description,
      startDate: agenda.startDate,
      endDate: agenda.endDate,
      status: agenda.status,
      location: [agenda.locationName, agenda.locationAddress].filter(Boolean).join(' — '),
      externalLink: agenda.externalLink,
      imageUrl: agenda.imageUrl,
    }))
  } catch (error) {
    console.error('Erro ao buscar agendas:', error)
    return []
  }
}
