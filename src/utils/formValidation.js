export function normalizeText(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatBirthDate(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function isValidPhone(phone) {
  const number = phone.replace(/\D/g, '')

  if (number.length !== 10 && number.length !== 11) return false
  if (/^(\d)\1+$/.test(number)) return false

  const ddd = Number(number.substring(0, 2))
  if (ddd < 11 || ddd > 99) return false
  if (number.length === 11 && number[2] !== '9') return false
  if (number.length === 10 && (Number(number[2]) < 2 || Number(number[2]) > 5)) return false

  return true
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidBirthDate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false

  const [dayStr, monthStr, yearStr] = value.split('/')
  const day = Number(dayStr)
  const month = Number(monthStr)
  const year = Number(yearStr)

  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= new Date()
  )
}
