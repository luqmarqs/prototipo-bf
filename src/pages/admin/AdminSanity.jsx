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
      subtitle="O Sanity Studio e o painel de edicao de conteudo do site. Use-o para criar, editar e publicar textos, imagens e outros dados que aparecem nas paginas."
      displayName={auth.displayName}
      avatarUrl={auth.avatarUrl}
      userEmail={auth.email}
      onLogout={handleLogout}
    >
      <section className="admin-card admin-sanity-card">
        <a
          href={SANITY_STUDIO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="button admin-primary-button"
        >
          Editar conteudo do site no Sanity Studio
        </a>
      </section>
    </AdminLayout>
  )
}

export default AdminSanity
