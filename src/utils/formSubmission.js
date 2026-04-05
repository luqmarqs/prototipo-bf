function buildJsonPayload(formValues, fieldMap = {}) {
  return Object.entries(formValues).reduce((payload, [key, value]) => {
    payload[fieldMap[key] || key] = Array.isArray(value) ? value : value ?? ''
    return payload
  }, {})
}

function parseBirthDateParts(value) {
  if (!value) {
    return ['', '', '']
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year = '', month = '', day = ''] = value.split('-')
    return [year, month, day]
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day = '', month = '', year = ''] = value.split('/')
    return [year, month, day]
  }

  return ['', '', '']
}

async function submitToGoogleForms(endpoint, googleFormsConfig, formValues) {
  const fieldIds = googleFormsConfig?.fieldIds || {}
  const data = new FormData()
  const [year = '', month = '', day = ''] = parseBirthDateParts(formValues.nascimento)

  if (fieldIds.nome) data.append(fieldIds.nome, formValues.nome)
  if (fieldIds.nascimento?.year) data.append(fieldIds.nascimento.year, year)
  if (fieldIds.nascimento?.month) data.append(fieldIds.nascimento.month, month)
  if (fieldIds.nascimento?.day) data.append(fieldIds.nascimento.day, day)
  if (fieldIds.whatsapp) data.append(fieldIds.whatsapp, formValues.whatsapp)
  if (fieldIds.email) data.append(fieldIds.email, formValues.email)
  if (fieldIds.uf) data.append(fieldIds.uf, formValues.uf)
  if (fieldIds.cidade) data.append(fieldIds.cidade, formValues.cidade)
  if (fieldIds.bairro) data.append(fieldIds.bairro, formValues.bairro)
  if (fieldIds.interesses) {
    data.append(fieldIds.interesses, (formValues.interesses || []).join(', '))
  }
  if (fieldIds.temasPrioritarios) {
    data.append(fieldIds.temasPrioritarios, formValues.temasPrioritarios || '')
  }
  if (fieldIds.origem) data.append(fieldIds.origem, formValues.origem || 'site')
  if (fieldIds.pagina) data.append(fieldIds.pagina, formValues.pagina || 'home')
  if (fieldIds.lgpd) {
    data.append(
      fieldIds.lgpd,
      googleFormsConfig?.lgpdAcceptedValue || String(formValues.lgpd),
    )
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      body: data,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function submitToJsonApi(endpoint, jsonApiConfig, formValues) {
  const method = jsonApiConfig?.method || 'POST'
  const headers = jsonApiConfig?.headers || { 'Content-Type': 'application/json' }
  const payload = buildJsonPayload(formValues, jsonApiConfig?.fieldMap)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      let errorMessage = 'Nao foi possivel enviar o formulario.'

      try {
        const data = await response.json()
        errorMessage = data?.error || errorMessage
      } catch {
        // Mantem mensagem padrao quando o backend nao devolve JSON.
      }

      throw new Error(errorMessage)
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function submitFormData(formIntegration, formValues) {
  const provider = formIntegration?.provider || 'google-forms'
  const endpoint = formIntegration?.endpoint

  if (!endpoint) {
    throw new Error('Endpoint de envio do formulario nao configurado.')
  }

  if (provider === 'google-forms') {
    await submitToGoogleForms(endpoint, formIntegration.googleForms, formValues)
    return
  }

  if (provider === 'json-api') {
    await submitToJsonApi(endpoint, formIntegration.jsonApi, formValues)
    return
  }

  throw new Error(`Provider de formulario nao suportado: ${provider}`)
}