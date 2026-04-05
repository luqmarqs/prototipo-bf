function AdminStatCard({ label, value, highlight = false }) {
  return (
    <article className={highlight ? 'admin-stat-card admin-stat-card-highlight' : 'admin-stat-card'}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export default AdminStatCard
