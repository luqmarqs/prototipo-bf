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
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server config ausente. Defina VITE_SUPABASE_URL/SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
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
    const { data, error } = await supabase
      .from('leads')
      .insert(payload)
      .select('id, created_at')
      .single()

    if (error) {
      response.status(500).json({ error: error.message || 'Falha ao gravar lead.' })
      return
    }

    response.status(201).json({ ok: true, lead: data })
  } catch (error) {
    response.status(500).json({ error: error.message || 'Erro interno ao processar lead.' })
  }
}
