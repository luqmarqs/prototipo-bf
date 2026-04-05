import { Link } from 'react-router-dom'

function CampaignCard({ name, slug, leadCount, imageUrl }) {
  return (
    <article className="admin-campaign-card">
      {imageUrl ? (
        <div className="admin-campaign-card-image">
          <img src={imageUrl} alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="admin-campaign-card-body">
        <h3 className="admin-campaign-card-name">{name}</h3>
        <p className="admin-campaign-card-slug">{slug}</p>
      </div>

      <div className="admin-campaign-card-footer">
        <div className="admin-campaign-card-count">
          <strong>{leadCount ?? '—'}</strong>
          <span>leads</span>
        </div>

        <Link
          to={`/admin/campanhas/${slug}`}
          className="button button-primary admin-campaign-card-btn"
        >
          Ver campanha
        </Link>
      </div>
    </article>
  )
}

export default CampaignCard
