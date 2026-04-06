/**
 * api/leads.js — Vercel Serverless Function para captação de leads.
 *
 * Esta função é o único ponto de escrita no banco de dados que usa a
 * SUPABASE_SERVICE_ROLE_KEY (server-only). Nunca exponha essa chave no frontend.
 *
 * Responsabilidades:
 * 1. Gerenciar CORS (origens permitidas via LEADS_ALLOWED_ORIGINS).
 * 2. Sanitizar o payload recebido (apenas chaves em ALLOWED_KEYS são aceitas).
 * 3. Validar campos obrigatórios (nome, email, telefone, consentimento LGPD).
 * 4. Enriquecer o payload com aliases PT/EN, UTMs e timestamps.
 * 5. Inserir em public.leads com fallback automático para colunas ausentes:
 *    se o Supabase retornar "column not found", remove a coluna e repete a inserção.
 *
 * Método aceito: POST (Content-Type: application/json)
 * Resposta de sucesso: 201 { ok: true, lead: { id, created_at } }
 */

/* global process */

import { createClient } from '@supabase/supabase-js'

const ALLOWED_METHODS = new Set(['POST', 'OPTIONS'])
const MAX_CONTENT_LENGTH_BYTES = Number(process.env.LEADS_MAX_CONTENT_LENGTH_BYTES || 32 * 1024)
const RATE_LIMIT_WINDOW_MS = Number(process.env.LEADS_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000)
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.LEADS_RATE_LIMIT_MAX_REQUESTS || 30)
const STRING_LIMITS = {
  name: 120,
  email: 160,
  phone: 32,
  birthDate: 16,
  state: 64,
  city: 120,
  district: 120,
  source: 120,
  page: 120,
}
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
const rateLimitStore = new Map()

function getClientIp(request) {
  const forwardedFor = String(request.headers['x-forwarded-for'] || '')
  const realIp = String(request.headers['x-real-ip'] || '')
  const firstForwarded = forwardedFor.split(',').map((item) => item.trim()).find(Boolean)
  return firstForwarded || realIp || 'unknown'
}

function isRateLimited(clientIp) {
  const now = Date.now()
  const bucket = rateLimitStore.get(clientIp)

  if (!bucket || now - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientIp, { count: 1, windowStart: now })
    return false
  }

  bucket.count += 1
  if (bucket.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  return false
}

function cleanupRateLimitStore() {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS
  for (const [ip, bucket] of rateLimitStore.entries()) {
    if (bucket.windowStart < cutoff) {
      rateLimitStore.delete(ip)
    }
  }
}

function parseAllowedOrigins(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function setCorsHeaders(request, response) {
  const requestOrigin = request.headers.origin
  const allowlist = parseAllowedOrigins(process.env.LEADS_ALLOWED_ORIGINS)

  if (allowlist.length === 0) {
    response.setHeader('Access-Control-Allow-Origin', '*')
  } else if (requestOrigin && allowlist.includes(requestOrigin)) {
    response.setHeader('Access-Control-Allow-Origin', requestOrigin)
    response.setHeader('Vary', 'Origin')
  }

  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function isOriginAllowed(request) {
  const requestOrigin = request.headers.origin
  const allowlist = parseAllowedOrigins(process.env.LEADS_ALLOWED_ORIGINS)

  if (allowlist.length === 0) {
    return true
  }

  if (!requestOrigin) {
    return true
  }

  return allowlist.includes(requestOrigin)
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_SERVICE_ROLE
    || process.env.SUPABASE_SECRET_KEY

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
      const limit = STRING_LIMITS[key] || 500
      sanitized[key] = value.trim().slice(0, limit)
      return
    }

    if (Array.isArray(value)) {
      sanitized[key] = value
        .slice(0, 20)
        .map((item) => String(item).trim().slice(0, 120))
        .filter(Boolean)
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

    // UTM compatibility for schemas that expose utm_* columns in admin.
    utm_source: payload.utm_source || payload.source || payload.origem || null,
    utm_campaign: payload.utm_campaign || payload.page || payload.form_slug || null,

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
  setCorsHeaders(request, response)
  cleanupRateLimitStore()

  if (!ALLOWED_METHODS.has(request.method)) {
    response.status(405).json({ error: 'Metodo nao permitido.' })
    return
  }

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (!isOriginAllowed(request)) {
    response.status(403).json({ error: 'Origem nao permitida.' })
    return
  }

  const contentLength = Number(request.headers['content-length'] || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_CONTENT_LENGTH_BYTES) {
    response.status(413).json({ error: 'Payload muito grande.' })
    return
  }

  const clientIp = getClientIp(request)
  if (isRateLimited(clientIp)) {
    response.status(429).json({ error: 'Muitas requisicoes. Tente novamente em alguns minutos.' })
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
      console.error('[api/leads] insert error', error)
      response.status(500).json({ error: 'Falha ao gravar lead.' })
      return
    }

    response.status(201).json({ ok: true, lead: data })
  } catch (error) {
    console.error('[api/leads] unexpected error', error)
    response.status(500).json({ error: 'Erro interno ao processar lead.' })
  }
}
