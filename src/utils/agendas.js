import sanityClient from './sanityClient'

const AGENDA_LIST_QUERY = `*[_type == "event"] | order(startDate asc){
  _id,
  title,
  description,
  startDate,
  endDate,
  status,
  "locationName": coalesce(location.name, locationName),
  "locationAddress": coalesce(location.address, locationAddress),
  externalLink,
  "imageUrl": coalesce(image.asset->url, mainImage.asset->url, mainImageUrl)
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
      status: agenda.status || 'confirmado',
      location: [agenda.locationName, agenda.locationAddress].filter(Boolean).join(' — '),
      externalLink: agenda.externalLink,
      imageUrl: agenda.imageUrl,
    }))
  } catch (error) {
    console.error('Erro ao buscar agendas:', error)
    return []
  }
}
