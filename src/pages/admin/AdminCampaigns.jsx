import AdminLayout from '../../components/admin/AdminLayout'
import CampaignCard from '../../components/admin/CampaignCard'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useCampaigns } from '../../hooks/useCampaigns'
import { signOutAdmin } from '../../services/supabase/auth'

function AdminCampaigns() {
  const auth = useAdminAuth()
  const { campaigns, loading, error } = useCampaigns({ enabled: auth.isAuthorized })

  async function handleLogout() {
    await signOutAdmin()
  }

  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leadCount || 0), 0)

  return (
    <AdminLayout
      title="Campanhas"
      subtitle="Visao geral das campanhas ativas com total de leads captados por formulario."
      displayName={auth.displayName}
      avatarUrl={auth.avatarUrl}
      userEmail={auth.email}
      onLogout={handleLogout}
    >
      {!loading && !error ? (
        <section className="admin-stats-grid">
          <article className="admin-stat-card admin-stat-card-highlight">
            <span>Campanhas ativas</span>
            <strong>{campaigns.length}</strong>
          </article>
          <article className="admin-stat-card">
            <span>Total de leads</span>
            <strong>{totalLeads}</strong>
          </article>
        </section>
      ) : null}

      {error ? (
        <p className="admin-feedback admin-feedback-error">{error}</p>
      ) : null}

      {loading ? (
        <section className="admin-card admin-empty-state">
          <p>Carregando campanhas...</p>
        </section>
      ) : null}

      {!loading && !error && campaigns.length === 0 ? (
        <section className="admin-card admin-empty-state">
          <h3>Nenhuma campanha ativa</h3>
          <p>Ative campanhas na tabela lead_forms para que apareçam aqui.</p>
        </section>
      ) : null}

      {!loading && campaigns.length > 0 ? (
        <section className="admin-campaign-grid">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              name={campaign.name}
              slug={campaign.slug}
              leadCount={campaign.leadCount}
              imageUrl={campaign.imageUrl}
            />
          ))}
        </section>
      ) : null}
    </AdminLayout>
  )
}

export default AdminCampaigns
