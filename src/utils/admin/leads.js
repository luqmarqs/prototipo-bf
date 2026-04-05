const COLUMN_LABELS = {
  created_at: 'Captado em',
  // legacy column names
  name: 'Nome',
  phone: 'Telefone',
  birthDate: 'Nascimento',
  state: 'UF',
  city: 'Cidade',
  district: 'Bairro',
  interests: 'Interesses',
  priorityThemes: 'Temas prioritarios',
  source: 'Origem',
  page: 'Pagina',
  consent: 'Consentimento',
  // campaign column names
  nome: 'Nome',
  email: 'E-mail',
  telefone: 'Telefone',
  form_slug: 'Campanha',
  form_id: 'ID Formulario',
  utm_source: 'Origem',
  utm_campaign: 'Campanha UTM',
  dados: 'Dados adicionais',
}

const PREFERRED_ORDER = [
  'created_at',
  'nome',
  'name',
  'email',
  'telefone',
  'phone',
  'utm_source',
  'utm_campaign',
  'form_slug',
  'birthDate',
  'state',
  'city',
  'district',
  'interests',
  'priorityThemes',
  'source',
  'page',
  'consent',
  'dados',
  'form_id',
]

const HIDDEN_KEYS = new Set(['id'])

export function getLeadRowId(lead) {
  return String(lead.id || `${lead.email || 'lead'}-${lead.created_at || Math.random()}`)
}

function prettifyKey(key) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/^./, (letter) => letter.toUpperCase())
}

export function buildLeadColumns(rows) {
  const keys = new Set()

  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (!HIDDEN_KEYS.has(key)) {
        keys.add(key)
      }
    })
  })

  return Array.from(keys)
    .sort((left, right) => {
      const leftIndex = PREFERRED_ORDER.indexOf(left)
      const rightIndex = PREFERRED_ORDER.indexOf(right)

      if (leftIndex >= 0 && rightIndex >= 0) {
        return leftIndex - rightIndex
      }

      if (leftIndex >= 0) {
        return -1
      }

      if (rightIndex >= 0) {
        return 1
      }

      return left.localeCompare(right)
    })
    .map((key) => ({
      key,
      label: COLUMN_LABELS[key] || prettifyKey(key),
    }))
}

export function formatLeadValue(value, key) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  if (key === 'created_at') {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('pt-BR')
    }
  }

  return String(value)
}
