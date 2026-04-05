import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AdminLayout from './AdminLayout'

function AdminRoute({ children }) {
  const auth = useAdminAuth()
  const location = useLocation()

  if (!auth.hasConfig || !auth.hasWhitelist) {
    return (
      <AdminLayout
        compact
        title="Configuracao pendente"
        subtitle="Defina as variaveis do Supabase e a whitelist antes de liberar o painel."
      >
        <section className="admin-card admin-empty-state">
          <h3>Painel indisponivel</h3>
          <p>
            Configure VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY e VITE_ADMIN_EMAIL_WHITELIST para acessar o admin.
          </p>
        </section>
      </AdminLayout>
    )
  }

  if (auth.loading) {
    return (
      <AdminLayout compact title="Verificando acesso" subtitle="Restaurando sua sessao administrativa.">
        <section className="admin-card admin-empty-state">
          <p>Carregando painel...</p>
        </section>
      </AdminLayout>
    )
  }

  if (!auth.session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  // isAdmin = DB-based check (primary); isAuthorized = env whitelist (fallback for bootstrap)
  if (!auth.isAdmin && !auth.isAuthorized) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname, denied: true }} />
  }

  return children
}

export default AdminRoute
