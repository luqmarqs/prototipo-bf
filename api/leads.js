/* global process */

import { createClient } from '@supabase/supabase-js'

const ALLOWED_METHODS = new Set(['POST', 'OPTIONS'])
const ALLOWED_KEYS = new Set([
  'name',
  'email',
  'phone',
  'birthDate',
  'state',
  'city',
  'district',
  'interests',
  'priorityThemes',
  'source',
  'page',
  'consent',
])

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_ROLE
    || process.env.SUPABASE_SECRET_KEY
    || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    const missing = []
    if (!supabaseUrl) missing.push('SUPABASE_URL')
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    throw new Error(`Supabase server config ausente. Defina: ${missing.join(', ')}`)
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function sanitizeLeadPayload(payload) {
  const sanitized = {}

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (!ALLOWED_KEYS.has(key)) {
      return
    }

    if (typeof value === 'string') {
      sanitized[key] = value.trim()
      return
    }

    if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => String(item).trim()).filter(Boolean)
      return
    }

    sanitized[key] = value
  })

  return sanitized
}

function enrichLeadPayload(payload) {
  const nowIso = new Date().toISOString()
  const projectKey = process.env.LEADS_PROJECT_KEY
    || process.env.VITE_LEADS_PROJECT_KEY
    || process.env.SUPABASE_PROJECT_KEY
    || 'site'

  return {
    ...payload,
    // Legacy/DB-specific required fields.
    project_key: payload.project_key || projectKey,
    form_slug: payload.form_slug || payload.page || payload.source || 'site',

    // Portuguese aliases used by existing schema.
    nome: payload.nome || payload.name,
    telefone: payload.telefone || payload.phone,
    origem: payload.origem || payload.source,

    // Raw payload mirrors for analytics/debug tables that store JSON snapshots.
    dados: payload.dados || payload,
    raw_payload: payload.raw_payload || payload,

    // Useful defaults when these columns exist.
    first_seen_at: payload.first_seen_at || nowIso,
    last_seen_at: payload.last_seen_at || nowIso,
    last_submission_at: payload.last_submission_at || nowIso,
    submission_count: Number.isFinite(payload.submission_count) ? payload.submission_count : 1,
  }
}

function toSnakeCasePayload(payload) {
  const aliases = {
    birthDate: 'birth_date',
    priorityThemes: 'priority_themes',
  }

  const normalized = { ...payload }

  Object.entries(aliases).forEach(([camelKey, snakeKey]) => {
    if (normalized[camelKey] !== undefined && normalized[snakeKey] === undefined) {
      normalized[snakeKey] = normalized[camelKey]
      delete normalized[camelKey]
    }
  })

  return normalized
}

function getMissingColumnName(message) {
  const match = String(message || '').match(/Could not find the '([^']+)' column/)
  return match?.[1] || ''
}

async function insertLeadWithFallback(supabase, payload) {
  let insertPayload = toSnakeCasePayload(enrichLeadPayload(payload))
  const triedMissingColumns = new Set()

  for (let attempt = 0; attempt < ALLOWED_KEYS.size; attempt += 1) {
    const { data, error } = await supabase
      .from('leads')
      .insert(insertPayload)
      .select('id, created_at')
      .single()

    if (!error) {
      return { data, error: null }
    }

    const missingColumn = getMissingColumnName(error.message)

    if (!missingColumn || triedMissingColumns.has(missingColumn)) {
      return { data: null, error }
    }

    triedMissingColumns.add(missingColumn)
    delete insertPayload[missingColumn]
  }

  return {
    data: null,
    error: new Error('Nao foi possivel mapear colunas da tabela leads para o payload enviado.'),
  }
}

function normalizeBirthDate(value) {
  if (!value) return ''

  const raw = String(value).trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split('/')
    return `${year}-${month}-${day}`
  }

  return ''
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function isValidPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 13
}

function validateLead(payload) {
  if (!payload.name || payload.name.length < 3) {
    return 'Nome invalido.'
  }

  if (!isValidEmail(payload.email)) {
    return 'E-mail invalido.'
  }

  if (!isValidPhone(payload.phone)) {
    return 'Telefone invalido.'
  }

  if (payload.birthDate) {
    const normalizedBirthDate = normalizeBirthDate(payload.birthDate)

    if (!normalizedBirthDate) {
      return 'Data de nascimento invalida.'
    }

    payload.birthDate = normalizedBirthDate
  }

  if (payload.consent !== true) {
    return 'Consentimento LGPD obrigatorio.'
  }

  return ''
}

export default async function handler(request, response) {
  setCorsHeaders(response)

  if (!ALLOWED_METHODS.has(request.method)) {
    response.status(405).json({ error: 'Metodo nao permitido.' })
    return
  }

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  try {
    const payload = sanitizeLeadPayload(request.body)
    const validationError = validateLead(payload)

    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }

    const supabase = getSupabaseAdminClient()
    const { data, error } = await insertLeadWithFallback(supabase, payload)

    if (error) {
      response.status(500).json({ error: error.message || 'Falha ao gravar lead.' })
      return
    }

    response.status(201).json({ ok: true, lead: data })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Erro interno ao processar lead.' })
  }
}
