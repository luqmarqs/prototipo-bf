import { NavLink } from 'react-router-dom'

function AdminLayout({ title, subtitle, email, onLogout, children, compact = false }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <p className="admin-eyebrow">Painel Admin</p>
          <h1 className="admin-brand">Bancada Feminista</h1>
          <p className="admin-sidebar-copy">
            Leads centralizados com filtros, exportacao e acesso restrito por conta autorizada.
          </p>
        </div>

        {!compact ? (
          <nav className="admin-nav">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`}
            >
              Leads
            </NavLink>
            <NavLink
              to="/admin/admins"
              className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`}
            >
              Admins
            </NavLink>
          </nav>
        ) : null}
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Dashboard</p>
            <h2>{title}</h2>
            {subtitle ? <p className="admin-topbar-copy">{subtitle}</p> : null}
          </div>

          <div className="admin-userbox">
            {email ? <span>{email}</span> : null}
            {onLogout ? (
              <button type="button" className="button admin-secondary-button" onClick={onLogout}>
                Sair
              </button>
            ) : null}
          </div>
        </header>

        {children}
      </section>
    </div>
  )
}

export default AdminLayout
