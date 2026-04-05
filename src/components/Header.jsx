import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function Header({ navigation, ctaLabel, onPrimaryCta, logo, brandName }) {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    document.body.classList.toggle('nav-is-open', menuOpen)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('nav-is-open')
    }
  }, [menuOpen])

  useEffect(() => {
    function handleClickOutside(event) {
      if (!navRef.current?.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    function resetMenuState() {
      setMenuOpen(false)
      setOpenDropdown(null)
      document.body.style.overflow = ''
      document.body.classList.remove('nav-is-open')
    }

    function handlePageShow() {
      resetMenuState()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        resetMenuState()
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  function closeAll() {
    setMenuOpen(false)
    setOpenDropdown(null)
  }

  return (
    <header className="site-header">
      <div className="container header-row">
        <NavLink
          to="/"
          className="brand"
          aria-label={`Ir para inicio - ${brandName}`}
          onClick={closeAll}
        >
          {logo ? <img src={logo} alt="" className="brand-logo" /> : null}
          <span className="brand-name">{brandName}</span>
        </NavLink>

        <nav
          id="main-nav"
          className={menuOpen ? 'main-nav nav-open' : 'main-nav'}
          aria-label="Navegacao principal"
          ref={navRef}
        >
          <button
            type="button"
            className="nav-close-btn"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>

          {navigation.map((item) => {
            if (item.children?.length) {
              const dropdownActive = item.children.some((child) =>
                location.pathname.startsWith(child.path),
              )
              const isOpen = openDropdown === item.label

              return (
                <div
                  key={item.label}
                  className={isOpen ? 'nav-dropdown nav-dropdown-open' : 'nav-dropdown'}
                >
                  <button
                    type="button"
                    className={dropdownActive ? 'nav-link nav-link-active nav-dropdown-toggle' : 'nav-link nav-dropdown-toggle'}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                  >
                    {item.label}
                  </button>

                  <div className="nav-dropdown-menu" role="menu" aria-label={item.label}>
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={closeAll}
                        className={({ isActive }) =>
                          isActive
                            ? 'nav-link nav-link-active nav-dropdown-link'
                            : 'nav-link nav-dropdown-link'
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeAll}
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            )
          })}

          <button
            type="button"
            className="button button-primary nav-mobile-cta"
            onClick={() => {
              closeAll()
              onPrimaryCta()
            }}
          >
            {ctaLabel}
          </button>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="button button-primary header-cta"
            onClick={() => {
              closeAll()
              onPrimaryCta()
            }}
          >
            {ctaLabel}
          </button>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className={menuOpen ? 'hamburger hamburger-open' : 'hamburger'} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="nav-overlay"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header
