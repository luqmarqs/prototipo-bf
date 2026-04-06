function Footer({ logo, brandName, text, instagram, instagramLabel, onOpenPrivacy }) {
  return (
    <footer className="site-footer">
      <div className="container footer-shell">
        <div className="footer-brand">
          <img src={logo} alt={`Logo ${brandName}`} />
          <p>{text}</p>
        </div>

        <div className="footer-actions">
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="footer-instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7.75 2C4.575 2 2 4.575 2 7.75v8.5C2 19.425 4.575 22 7.75 22h8.5C19.425 22 22 19.425 22 16.25v-8.5C22 4.575 19.425 2 16.25 2h-8.5zm0 2h8.5C18.56 4 20 5.44 20 7.75v8.5C20 18.56 18.56 20 16.25 20h-8.5C5.44 20 4 18.56 4 16.25v-8.5C4 5.44 5.44 4 7.75 4zm9.25 1.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
            </svg>
            <span>{instagramLabel}</span>
          </a>

          <button type="button" className="inline-link" onClick={onOpenPrivacy}>
            Politica de privacidade
          </button>
        </div>
      </div>
    </footer>
  )
}

export default Footer