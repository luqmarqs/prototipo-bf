const CHART_HEIGHT = 100
const BAR_MIN_HEIGHT = 2

function formatShortDate(dateStr) {
  const [, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

function LeadsBarChart({ data, days = 30 }) {
  if (!data?.length) {
    return (
      <div className="campaign-chart-empty">
        <p>Sem dados para exibir no gráfico.</p>
      </div>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)
  const labelStep = days <= 14 ? 1 : days <= 30 ? 5 : 7
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="campaign-chart">
      <div className="campaign-chart-header">
        <span className="campaign-chart-title">Leads por dia — últimos {days} dias</span>
        <span className="campaign-chart-total">{total} lead{total !== 1 ? 's' : ''} no período</span>
      </div>

      <div
        className="campaign-chart-bars"
        role="img"
        aria-label={`Gráfico de barras: leads por dia nos últimos ${days} dias. Total: ${total}`}
      >
        {data.map((point, index) => {
          const barHeight = Math.max(
            BAR_MIN_HEIGHT,
            Math.round((point.count / max) * CHART_HEIGHT),
          )
          const showLabel = index % labelStep === 0 || index === data.length - 1

          return (
            <div
              key={point.date}
              className="campaign-chart-col"
              title={`${formatShortDate(point.date)}: ${point.count} lead${point.count !== 1 ? 's' : ''}`}
            >
              <span className="campaign-chart-value">
                {point.count > 0 ? point.count : ''}
              </span>
              <div
                className={`campaign-chart-bar${point.count === 0 ? ' campaign-chart-bar-empty' : ''}`}
                style={{ height: `${barHeight}px` }}
              />
              {showLabel ? (
                <span className="campaign-chart-label">
                  {formatShortDate(point.date)}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="campaign-chart-axis">
        <span>0</span>
        <span>{Math.round(max / 2)}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default LeadsBarChart
