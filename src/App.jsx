import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'
import Header from './components/Header'
import PrivacySection from './components/PrivacySection'
import landingConfig from './config/landingConfig'
import { initializeTracking, trackPageView } from './utils/analytics'

const Eventos = lazy(() => import('./pages/Eventos'))
const Campanhas = lazy(() => import('./pages/Campanhas'))
const Campanha = lazy(() => import('./pages/Campanha'))
const Home = lazy(() => import('./pages/Home'))
const MandataEstadual = lazy(() => import('./pages/MandataEstadual'))
const MandataMunicipal = lazy(() => import('./pages/MandataMunicipal'))
const NoticiaDetalhe = lazy(() => import('./pages/NoticiaDetalhe'))
const Noticias = lazy(() => import('./pages/Noticias'))
const QuemSou = lazy(() => import('./pages/QuemSou'))
const Tema = lazy(() => import('./pages/Tema'))

function AppShell() {
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [hideMobileCta, setHideMobileCta] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const pageStyle = useMemo(
    () => ({
      '--page-bg-image': `url(${landingConfig.assets.backgroundImage})`,
      '--color-primary': landingConfig.theme.primary,
      '--color-primary-strong': landingConfig.theme.primaryStrong,
      '--color-secondary': landingConfig.theme.secondary,
      '--color-accent': landingConfig.theme.accent,
      '--color-accent-mint': landingConfig.theme.accentMint,
      '--color-accent-yellow': landingConfig.theme.accentYellow,
      '--color-accent-lilac': landingConfig.theme.accentLilac,
      '--color-accent-amber': landingConfig.theme.accentAmber,
      '--color-accent-deep-purple': landingConfig.theme.accentDeepPurple,
      '--color-accent-lime-light': landingConfig.theme.accentLimeLight,
      '--color-accent-mint-light': landingConfig.theme.accentMintLight,
      '--color-accent-green-light': landingConfig.theme.accentGreenLight,
      '--color-success': landingConfig.theme.success,
      '--color-ink': landingConfig.theme.ink,
      '--color-surface': landingConfig.theme.surface,
      '--color-surface-strong': landingConfig.theme.surfaceStrong,
      '--color-text-dark': landingConfig.theme.textOnLight,
      '--color-text-light': landingConfig.theme.textOnDark,
    }),
    [],
  )

  useEffect(() => {
    initializeTracking(landingConfig.tracking)
  }, [])

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    // Rola para o topo quando muda de página (exceto quando há hash)
    if (!location.hash) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      return undefined
    }

    const footerElement = document.querySelector('.site-footer')
    if (!footerElement) {
      return undefined
    }

    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setHideMobileCta(entry.isIntersecting)
      },
      {
        root: null,
        threshold: 0.05,
      },
    )

    observer.observe(footerElement)

    return () => {
      observer.disconnect()
    }
  }, [location.pathname])

  function scrollToCapture() {
    if (location.pathname === '/') {
      // Se já está na home, apenas atualiza o hash
      window.location.hash = '#quero-participar'
    } else {
      // Se não está na home, navega para home com hash
      navigate('/#quero-participar')
    }
  }

  return (
    <>
      <div className="page" style={pageStyle}>
        <Header
          key={location.pathname}
          navigation={landingConfig.navigation}
          ctaLabel={landingConfig.home.hero.primaryCta}
          onPrimaryCta={scrollToCapture}
          logo={landingConfig.assets.logo}
          brandName={landingConfig.metadata.brandName}
        />

        <main>
          <Suspense
            fallback={(
              <section className="section">
                <div className="container">
                  <p>Carregando pagina...</p>
                </div>
              </section>
            )}
          >
            <Routes>
              <Route path="/" element={<Home onOpenPrivacy={() => setShowPrivacy(true)} />} />
              <Route
                path="/quem-sou"
                element={<QuemSou onOpenPrivacy={() => setShowPrivacy(true)} />}
              />
              <Route path="/mandatas" element={<Navigate to="/mandatas/municipal" replace />} />
              <Route path="/mandatas/municipal" element={<MandataMunicipal />} />
              <Route path="/mandatas/estadual" element={<MandataEstadual />} />
              <Route path="/campanhas" element={<Campanhas />} />
              <Route path="/eventos" element={<Navigate to="/agenda" replace />} />
              <Route
                path="/agenda"
                element={<Eventos onOpenPrivacy={() => setShowPrivacy(true)} />}
              />
              <Route
                path="/campanha/:slug"
                element={<Campanha onOpenPrivacy={() => setShowPrivacy(true)} />}
              />
              <Route path="/temas/:slug" element={<Tema />} />
              <Route path="/noticias" element={<Noticias />} />
              <Route path="/noticias/:slug" element={<NoticiaDetalhe />} />
            </Routes>
          </Suspense>
        </main>

        <Footer
          logo={landingConfig.assets.logo}
          brandName={landingConfig.metadata.brandName}
          text={landingConfig.footer.text}
          instagram={landingConfig.footer.instagram}
          instagramLabel={landingConfig.footer.instagramLabel}
          onOpenPrivacy={() => setShowPrivacy(true)}
        />

        <PrivacySection
          isOpen={showPrivacy}
          privacyPolicy={landingConfig.privacyPolicy}
          onClose={() => setShowPrivacy(false)}
        />
      </div>

      {/* Fora do .page para evitar containing block bugs no Android */}
      <Link
        to="/#quero-participar"
        className={hideMobileCta ? 'mobile-cta-float mobile-cta-float-hidden' : 'mobile-cta-float'}
      >
        Quero apoiar
      </Link>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </BrowserRouter>
  )
}

export default App
