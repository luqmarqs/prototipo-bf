import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { signOutAdmin } from '../../services/supabase/auth'

const SANITY_STUDIO_URL = 'https://www.sanity.io/@ofvh5RcEk/studio/c5ez96ddgwco9xboliznqf96/default'

function AdminSanity() {
  const auth = useAdminAuth()

  async function handleLogout() {
    await signOutAdmin()
  }

  return (
    <AdminLayout
      title="Sanity Studio"
      subtitle="Edite e publique conteudo sem sair do painel administrativo."
      displayName={auth.displayName}
      avatarUrl={auth.avatarUrl}
      userEmail={auth.email}
      onLogout={handleLogout}
    >
      <section className="admin-card admin-sanity-card">
        <div className="admin-sanity-head">
          <p>Studio incorporado no painel.</p>
          <a
            href={SANITY_STUDIO_URL}
            target="_blank"
            rel="noreferrer"
            className="button admin-secondary-button"
          >
            Abrir em nova aba
          </a>
        </div>

        <div className="admin-sanity-embed-wrap">
          <iframe
            src={SANITY_STUDIO_URL}
            title="Sanity Studio"
            className="admin-sanity-iframe"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
    </AdminLayout>
  )
}

export default AdminSanity
