function AdminLoginCard({
  loading = false,
  error = '',
  isUnauthorized = false,
  currentEmail = '',
  onLogin,
  onLogout,
}) {
  return (
    <section className="admin-card admin-login-card">
      <p className="admin-eyebrow">Acesso restrito</p>
      <h3>Entrar no painel</h3>
      <p>
        Use sua conta Google autorizada para visualizar os leads captados pelo formulario.
      </p>

      {error ? <p className="admin-feedback admin-feedback-error">{error}</p> : null}

      {isUnauthorized ? (
        <div className="admin-feedback admin-feedback-error">
          <strong>Acesso negado.</strong>
          <span>{currentEmail || 'Sua conta atual'} nao esta na whitelist de administradores.</span>
        </div>
      ) : null}

      <div className="admin-login-actions">
        {!isUnauthorized ? (
          <button type="button" className="button button-primary" onClick={onLogin} disabled={loading}>
            {loading ? 'Redirecionando...' : 'Entrar com Google'}
          </button>
        ) : null}

        {currentEmail ? (
          <button type="button" className="button admin-secondary-button" onClick={onLogout}>
            Trocar conta
          </button>
        ) : null}
      </div>
    </section>
  )
}

export default AdminLoginCard
