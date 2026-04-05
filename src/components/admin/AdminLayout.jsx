import { NavLink } from 'react-router-dom'
import AdminUserMenu from './AdminUserMenu'

const NAV_LINKS = [
  { to: '/admin', end: true, icon: '◈', label: 'Leads' },
  { to: '/admin/campanhas', icon: '◉', label: 'Campanhas' },
  { to: '/admin/admins', icon: '◎', label: 'Admins' },
  { to: '/admin/sanity', icon: '✦', label: 'Sanity CMS' },
]

function AdminLayout({ title, subtitle, displayName, avatarUrl, userEmail, onLogout, children, compact = false }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div>
            <p className="admin-eyebrow">Painel Admin</p>
            <h1 className="admin-brand">Bancada Feminista</h1>
          </div>

          {!compact ? (
            <nav className="admin-nav" aria-label="Navegação do painel">
              {NAV_LINKS.map(({ to, end, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link-active' : ''}`}
                >
                  <span className="admin-nav-icon" aria-hidden="true">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-card">
            <p className="admin-sidebar-label">Versão</p>
            <p className="admin-sidebar-value">Admin v2</p>
          </div>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Dashboard</p>
            <h2>{title}</h2>
            {subtitle ? <p className="admin-topbar-copy">{subtitle}</p> : null}
          </div>

          <AdminUserMenu
            displayName={displayName}
            avatarUrl={avatarUrl}
            userEmail={userEmail}
            onLogout={onLogout}
          />
        </header>

        {children}
      </section>
    </div>
  )
}

export default AdminLayout
