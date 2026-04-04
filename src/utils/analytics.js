export function initializeTracking(trackingConfig = {}) {
  const ga = trackingConfig.googleAnalytics
  const pixel = trackingConfig.metaPixel

  // Placeholder para GA4: substitua por script oficial em producao.
  if (ga?.enabled) {
    console.info('[Tracking] Google Analytics pronto para configuracao:', ga.measurementId)
  }

  // Placeholder para Meta Pixel: substitua por snippet oficial em producao.
  if (pixel?.enabled) {
    console.info('[Tracking] Meta Pixel pronto para configuracao:', pixel.pixelId)
  }
}

export function trackPageView(path) {
  console.info('[Tracking] Page view:', path)
}

export function trackLead(formName) {
  console.info('[Tracking] Lead capturado:', formName)
}
