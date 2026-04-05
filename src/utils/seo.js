function setMeta(selector, attrKey, attrValue, contentValue) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attrKey, attrValue)
    document.head.appendChild(el)
  }
  el.setAttribute('content', contentValue)
}

export function setBasicSeo({ title, description, imageUrl, url, type = 'website' }) {
  if (title) {
    document.title = title
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  }

  if (description) {
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  }

  if (imageUrl) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl)
  }

  const canonicalUrl = url || window.location.href
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
  setMeta('meta[property="og:type"]', 'property', 'og:type', type)
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
}
