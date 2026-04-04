export function shareOnWhatsApp(message) {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(message)
  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'noopener,noreferrer')
}
