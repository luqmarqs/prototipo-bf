import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useAdmins } from '../../hooks/useAdmins'
import { signOutAdmin } from '../../services/supabase/auth'

function AdminAdmins() {
  const auth = useAdminAuth()
  const enabled = auth.isAdmin || auth.isAuthorized
  const { admins, loading, error, refresh, addAdmin, toggleStatus, removeAdmin } = useAdmins({ enabled })

  const [newEmail, setNewEmail] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('')

  function showFeedback(msg, type) {
    setFeedback(msg)
    setFeedbackType(type)
    setTimeout(() => setFeedback(''), 5000)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setActionLoading(true)
    try {
      await addAdmin(newEmail.trim())
      const added = newEmail.trim().toLowerCase()
      setNewEmail('')
      showFeedback(`Admin "${added}" adicionado com sucesso.`, 'success')
    } catch (err) {
      showFeedback(err.message || 'Erro ao adicionar admin.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleToggle(id, currentStatus) {
    setActionLoading(true)
    try {
      await toggleStatus(id, !currentStatus)
      showFeedback(`Status atualizado com sucesso.`, 'success')
    } catch (err) {
      showFeedback(err.message || 'Erro ao atualizar status.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRemove(id, email) {
    if (!window.confirm(`Remover "${email}" dos admins?`)) return
    setActionLoading(true)
    try {
      await removeAdmin(id)
      showFeedback(`Admin removido.`, 'success')
    } catch (err) {
      showFeedback(err.message || 'Erro ao remover admin.', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await signOutAdmin()
    } catch {
      // ignore logout errors
    }
  }

  return (
    <AdminLayout
      title="Gerenciar Admins"
      subtitle="Controle quem tem acesso ao painel administrativo."
      email={auth.displayName}
      onLogout={handleLogout}
    >
      <section className="admin-card admin-admins-card">
        <h3 className="admin-section-title">Adicionar novo admin</h3>
        <form className="admin-admins-form" onSubmit={handleAdd}>
          <div className="admin-field">
            <span>Email</span>
            <input
              type="email"
              placeholder="email@exemplo.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={actionLoading}
              required
            />
          </div>
          <button
            type="submit"
            className="button"
            disabled={actionLoading || !newEmail.trim()}
          >
            {actionLoading ? 'Aguarde...' : 'Adicionar admin'}
          </button>
        </form>

        {feedback ? (
          <p className={`admin-feedback ${feedbackType === 'error' ? 'admin-feedback-error' : 'admin-feedback-success'}`}>
            {feedback}
          </p>
        ) : null}
      </section>

      <section className="admin-card admin-table-card">
        <div className="admin-table-header">
          <p>
            {loading
              ? 'Carregando...'
              : `${admins.length} admin${admins.length !== 1 ? 's' : ''} cadastrado${admins.length !== 1 ? 's' : ''}`}
          </p>
          <button
            type="button"
            className="button admin-secondary-button"
            onClick={refresh}
            disabled={loading || actionLoading}
          >
            Atualizar
          </button>
        </div>

        {error ? (
          <p className="admin-feedback admin-feedback-error">{error}</p>
        ) : null}

        {!loading && admins.length === 0 && !error ? (
          <p className="admin-empty-message">Nenhum admin cadastrado ainda.</p>
        ) : null}

        {admins.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table admin-admins-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Conta vinculada</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className={admin.is_active ? '' : 'admin-row-inactive'}>
                    <td className="admin-admins-email">{admin.email}</td>
                    <td>
                      <span className={`admin-status-badge ${admin.is_active ? 'admin-status-active' : 'admin-status-inactive'}`}>
                        {admin.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${admin.user_id ? 'admin-status-linked' : 'admin-status-unlinked'}`}>
                        {admin.user_id ? 'Sim' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {admin.is_active ? (
                          <button
                            type="button"
                            className="button admin-secondary-button admin-action-button"
                            onClick={() => handleToggle(admin.id, admin.is_active)}
                            disabled={actionLoading}
                          >
                            Desativar
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="button admin-action-button"
                            onClick={() => handleToggle(admin.id, admin.is_active)}
                            disabled={actionLoading}
                          >
                            Reativar
                          </button>
                        )}
                        <button
                          type="button"
                          className="button admin-danger-button admin-action-button"
                          onClick={() => handleRemove(admin.id, admin.email)}
                          disabled={actionLoading}
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </AdminLayout>
  )
}

export default AdminAdmins
