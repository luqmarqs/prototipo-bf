const STATUS_LABEL = {
  confirmado: 'Confirmado',
  'em breve': 'Em breve',
}

const STATUS_CLASS = {
  confirmado: 'event-status-confirmado',
  'em breve': 'event-status-embreve',
}

function formatDay(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit' })
}

function formatMonth(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function formatYear(value) {
  if (!value) return ''
  return new Date(value).getFullYear()
}

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDateRange(start, end) {
  if (!start) return ''
  const startDate = new Date(start)
  const endDate = end ? new Date(end) : null

  const startStr = startDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  if (!endDate) return `${startStr} às ${formatTime(start)}`

  const sameDay = startDate.toDateString() === endDate.toDateString()
  if (sameDay) {
    return `${startStr} · ${formatTime(start)} – ${formatTime(end)}`
  }

  const endStr = endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  return `${startStr} → ${endStr}`
}

function isPast(startDate) {
  if (!startDate) return false
  return new Date(startDate) < new Date()
}

// Formata data para o padrão do Google Calendar: YYYYMMDDTHHmmssZ
function toGCalDate(value) {
  if (!value) return ''
  return new Date(value).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildGoogleCalendarUrl(eventItem) {
  const start = new Date(eventItem.startDate)
  const end = eventItem.endDate
    ? new Date(eventItem.endDate)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventItem.title,
    dates: `${toGCalDate(start.toISOString())}/${toGCalDate(end.toISOString())}`,
    ...(eventItem.description ? { details: eventItem.description } : {}),
    ...(eventItem.location ? { location: eventItem.location } : {}),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function buildMapsUrl(location) {
  if (!location) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
}

function buildEventWhatsAppUrl(eventItem) {
  const date = formatDateRange(eventItem.startDate, eventItem.endDate)
  const lines = [
    `Vem com a gente! 🙌`,
    `*${eventItem.title}*`,
    date ? `📅 ${date}` : null,
    eventItem.location ? `📍 ${eventItem.location}` : null,
    eventItem.description ? `\n${eventItem.description}` : null,
    eventItem.externalLink ? `\nSaiba mais: ${eventItem.externalLink}` : null,
  ].filter(Boolean).join('\n')

  return `https://wa.me/?text=${encodeURIComponent(lines)}`
}

function EventCard({ eventItem, onAction }) {
  const past = isPast(eventItem.startDate)
  const mapsUrl = buildMapsUrl(eventItem.location)
  const gCalUrl = buildGoogleCalendarUrl(eventItem)
  const waUrl = buildEventWhatsAppUrl(eventItem)

  return (
    <article className={`event-card${past ? ' event-card-past' : ''}`}>
      {eventItem.imageUrl ? (
        <div className="event-card-image-wrap">
          <img src={eventItem.imageUrl} alt={eventItem.title} className="event-card-image" />
        </div>
      ) : null}

      <div className="event-card-inner">
        <div className="event-date-block" aria-hidden="true">
          <span className="event-date-day">{formatDay(eventItem.startDate)}</span>
          <span className="event-date-month">{formatMonth(eventItem.startDate)}</span>
          <span className="event-date-year">{formatYear(eventItem.startDate)}</span>
        </div>

        <div className="event-card-body">
          <div className="event-card-meta">
            {eventItem.status && STATUS_LABEL[eventItem.status] ? (
              <span className={`event-status ${STATUS_CLASS[eventItem.status] || ''}`}>
                {STATUS_LABEL[eventItem.status]}
              </span>
            ) : null}

            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="event-location"
                title="Abrir no Google Maps"
              >
                {eventItem.location}
              </a>
            ) : null}
          </div>

          <h2 className="event-title">{eventItem.title}</h2>

          <time className="event-datetime">{formatDateRange(eventItem.startDate, eventItem.endDate)}</time>

          {eventItem.description ? (
            <p className="event-description">{eventItem.description}</p>
          ) : null}

          <div className="event-card-actions">
            {eventItem.externalLink ? (
              <a
                href={eventItem.externalLink}
                target="_blank"
                rel="noreferrer"
                className="button button-primary"
              >
                Saiba mais
              </a>
            ) : (
              <button
                type="button"
                className="button button-primary"
                onClick={() => onAction(eventItem)}
              >
                Quero acompanhar
              </button>
            )}

            {!past ? (
              <>
                <a
                  href={gCalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button event-gcal-btn"
                  title="Adicionar ao Google Agenda"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
                    <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 14h4m0 0v4m0-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Salvar na agenda
                </a>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button event-wa-btn"
                  title="Convidar pelo WhatsApp"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.945 9.945 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.946 7.946 0 01-4.341-1.283l-.31-.186-3.24.917.88-3.17-.202-.324A7.944 7.944 0 014 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8z"/>
                  </svg>
                  Convidar
                </a>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

function EventsSection({ title, intro, events = [], loading = false, error = false, onAction }) {
  const now = new Date()
  const visibleEvents = events.filter((e) => e.status !== 'cancelado')

  const upcoming = visibleEvents.filter((e) => new Date(e.startDate) >= now)
  const past = visibleEvents.filter((e) => new Date(e.startDate) < now)

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>

        {loading ? (
          <p className="events-feedback">Carregando agenda...</p>
        ) : error ? (
          <p className="events-feedback">Erro ao carregar agenda. Tente novamente mais tarde.</p>
        ) : visibleEvents.length === 0 ? (
          <p className="events-feedback">Nenhum evento disponível no momento.</p>
        ) : (
          <div className="events-sections">
            {upcoming.length > 0 ? (
              <div className="events-group">
                <h2 className="events-group-label">Próximos eventos</h2>
                <div className="event-list">
                  {upcoming.map((e) => (
                    <EventCard key={e.id} eventItem={e} onAction={onAction} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="events-feedback">Nenhum evento próximo no momento.</p>
            )}

            {past.length > 0 ? (
              <div className="events-group events-group-past">
                <h2 className="events-group-label">Eventos realizados</h2>
                <div className="event-list">
                  {past.map((e) => (
                    <EventCard key={e.id} eventItem={e} onAction={onAction} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

export default EventsSection
