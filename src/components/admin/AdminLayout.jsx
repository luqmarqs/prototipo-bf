import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import AdminUserMenu from './AdminUserMenu'

const NAV_LINKS = [
  { to: '/admin', end: true, icon: '◈', label: 'Leads' },
  { to: '/admin/campanhas', icon: '◉', label: 'Campanhas' },
  { to: '/admin/admins', icon: '◎', label: 'Admins' },
  { to: '/admin/sanity', icon: '✦', label: 'Sanity CMS' },
]

function AdminLayout({ title, subtitle, displayName, avatarUrl, userEmail, onLogout, children, compact = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar whenever the route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Prevent body scroll while mobile drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="admin-shell">
      {/* Backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar${sidebarOpen ? ' admin-sidebar-open' : ''}`}
        aria-label="Menu de navegação"
      >
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-brand">
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
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="admin-nav-icon" aria-hidden="true">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="admin-sidebar-bottom">
          {onLogout ? (
            <button
              type="button"
              className="button admin-secondary-button admin-sidebar-logout"
              onClick={onLogout}
            >
              Sair
            </button>
          ) : null}
          <div className="admin-sidebar-card">
            <p className="admin-sidebar-label">Versão</p>
            <p className="admin-sidebar-value">Admin v2</p>
          </div>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          {/* Left: hamburger + title */}
          <div className="admin-topbar-left">
            <button
              type="button"
              className={`admin-hamburger${sidebarOpen ? ' admin-hamburger-open' : ''}`}
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={sidebarOpen}
              aria-controls="admin-sidebar"
            >
              <span aria-hidden="true" />
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>

            <div className="admin-topbar-title">
              <p className="admin-eyebrow">Dashboard</p>
              <h2>{title}</h2>
              {subtitle ? <p className="admin-topbar-copy">{subtitle}</p> : null}
            </div>
          </div>

          {/* Right: user menu */}
          <AdminUserMenu
            displayName={displayName}
            avatarUrl={avatarUrl}
            userEmail={userEmail}
            onLogout={onLogout}
          />
        </header>

        <div className="admin-page-content">
          {children}
        </div>
      </section>
    </div>
  )
}

export default AdminLayout
