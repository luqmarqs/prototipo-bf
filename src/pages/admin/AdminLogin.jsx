import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminLoginCard from '../../components/admin/AdminLoginCard'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { signInWithGoogle, signOutAdmin } from '../../services/supabase/auth'

function AdminLogin() {
  const auth = useAdminAuth()
  const location = useLocation()
  const [actionError, setActionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const routeError = location.state?.denied
    ? 'A conta autenticada nao esta autorizada para acessar o painel.'
    : ''

  if (auth.session && auth.isAuthorized) {
    const redirectTo = location.state?.from || '/admin'
    return <Navigate to={redirectTo} replace />
  }

  if (!auth.hasConfig || !auth.hasWhitelist) {
    return (
      <AdminLayout compact title="Configuracao pendente" subtitle="Conecte o Supabase e defina a whitelist para liberar o painel.">
        <section className="admin-card admin-empty-state">
          <h3>Painel indisponivel</h3>
          <p>
            Configure VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY e VITE_ADMIN_EMAIL_WHITELIST no ambiente do projeto.
          </p>
        </section>
      </AdminLayout>
    )
  }

  async function handleLogin() {
    setActionError('')
    setIsSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (error) {
      setActionError(error.message || 'Nao foi possivel iniciar o login com Google.')
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    setActionError('')

    try {
      await signOutAdmin()
    } catch (error) {
      setActionError(error.message || 'Nao foi possivel encerrar a sessao atual.')
    }
  }

  return (
    <AdminLayout compact title="Acesso administrativo" subtitle="Painel interno para gestao dos leads do formulario.">
      <AdminLoginCard
        loading={isSubmitting}
        error={actionError || routeError || auth.error}
        isUnauthorized={Boolean(auth.session && !auth.isAuthorized)}
        currentEmail={auth.email}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </AdminLayout>
  )
}

export default AdminLogin
