import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

function Header({ navigation, ctaLabel, onPrimaryCta, logo, brandName }) {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState(null)
  const navRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (!navRef.current?.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="site-header">
      <div className="container header-row">
        <NavLink to="/" className="brand" aria-label={`Ir para inicio - ${brandName}`}>
          {logo ? <img src={logo} alt="" className="brand-logo" /> : null}
          <span className="brand-name">{brandName}</span>
        </NavLink>

        <nav className="main-nav" aria-label="Navegacao principal" ref={navRef}>
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
                        onClick={() => setOpenDropdown(null)}
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
                className={({ isActive }) =>
                  isActive ? 'nav-link nav-link-active' : 'nav-link'
                }
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <button type="button" className="button button-primary" onClick={onPrimaryCta}>
          {ctaLabel}
        </button>
      </div>
    </header>
  )
}

export default Header
