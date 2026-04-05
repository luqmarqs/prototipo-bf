import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import PrivacyConsent from './PrivacyConsent'
import { submitFormData } from '../utils/formSubmission'
import { trackLead } from '../utils/analytics'
import { getBrazilCities, getBrazilStates } from '../utils/locationData'
import {
  formatBirthDate,
  formatPhone,
  isValidBirthDate,
  isValidEmail,
  isValidPhone,
  normalizeText,
} from '../utils/formValidation'

function buildInitialForm(mode) {
  if (mode === 'simplified') {
    return {
      nome: '',
      email: '',
      whatsapp: '',
      lgpd: false,
    }
  }

  return {
    nome: '',
    nascimento: '',
    whatsapp: '',
    email: '',
    uf: '',
    cidade: '',
    bairro: '',
    interesses: [],
    temasPrioritarios: '',
    lgpd: false,
  }
}

function CampaignForm({
  mode = 'full',
  formConfig,
  source = 'site',
  page = 'home',
  submitLabel = 'Enviar cadastro',
  onShare,
  onOpenPrivacy,
}) {
  const [form, setForm] = useState(buildInitialForm(mode))
  const [citiesSource, setCitiesSource] = useState([])
  const [ufs, setUfs] = useState([])
  const [cityQuery, setCityQuery] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [birthDateError, setBirthDateError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [cityError, setCityError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    getBrazilStates()
      .then((data) => setUfs(data))
      .catch(() => setUfs([]))
  }, [])

  useEffect(() => {
    if (mode !== 'full') return

    // Carrega a base completa de cidades somente quando o formulario completo e usado.
    getBrazilCities()
      .then((data) => setCitiesSource(data))
      .catch(() => setCitiesSource([]))
  }, [mode])

  const cities = useMemo(() => {
    if (!form.uf) return []

    return citiesSource
      .filter((city) => city.uf === form.uf)
      .map((city) => ({ ...city, normalizedName: normalizeText(city.nome) }))
  }, [citiesSource, form.uf])

  const fuse = useMemo(() => {
    if (!cities.length) return null

    return new Fuse(cities, {
      keys: ['normalizedName'],
      threshold: 0.3,
      ignoreLocation: true,
    })
  }, [cities])

  function validateCity(value) {
    if (!value) return false

    const term = normalizeText(value)
    return cities.some((city) => city.normalizedName === term)
  }

  function toggleInterest(item) {
    setForm((previous) => {
      const selected = previous.interesses || []
      const hasItem = selected.includes(item)

      return {
        ...previous,
        interesses: hasItem
          ? selected.filter((interest) => interest !== item)
          : [...selected, item],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatusMessage('')
    setErrorMessage('')

    if (!isValidPhone(form.whatsapp)) {
      setErrorMessage('Informe um WhatsApp valido antes de enviar.')
      return
    }

    if (!isValidEmail(form.email)) {
      setErrorMessage('Informe um e-mail valido antes de enviar.')
      return
    }

    if (mode === 'full' && !isValidBirthDate(form.nascimento)) {
      setErrorMessage('Informe uma data de nascimento valida no formato dd/mm/aaaa.')
      return
    }

    if (mode === 'full' && !validateCity(form.cidade)) {
      setErrorMessage('Selecione uma cidade valida na lista.')
      return
    }

    if (!form.lgpd) {
      setErrorMessage('Voce precisa aceitar a politica de privacidade para continuar.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitFormData(formConfig.api, {
        ...form,
        origem: source,
        pagina: page,
      })

      trackLead(page)
      setForm(buildInitialForm(mode))
      setCityQuery('')
      setCitySuggestions([])
      setBirthDateError('')
      setPhoneError('')
      setEmailError('')
      setCityError('')
      setStatusMessage(formConfig.confirmationMessage)
    } catch {
      setErrorMessage('Nao foi possivel enviar agora. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="section" id="quero-participar">
      <div className="container">
        <article className="form-shell">
          <h2>{formConfig.title || 'Receba informacoes e participe da agenda'}</h2>
          <p>
            {formConfig.description ||
              'Preencha os dados abaixo para participar de acoes, receber convites e fortalecer as campanhas em andamento.'}
          </p>

          <form className="lead-form" onSubmit={handleSubmit}>
            <input
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={(event) => setForm({ ...form, nome: event.target.value })}
              required
            />

            {mode === 'full' ? (
              <>
                <label className="date-label" htmlFor="nascimento">
                  Data de nascimento
                </label>
                <input
                  id="nascimento"
                  type="text"
                  name="nascimento"
                  inputMode="numeric"
                  placeholder="dd/mm/aaaa"
                  maxLength={10}
                  pattern="\d{2}/\d{2}/\d{4}"
                  value={form.nascimento}
                  onChange={(event) => {
                    const masked = formatBirthDate(event.target.value)
                    setForm({ ...form, nascimento: masked })

                    if (masked.length === 10 && !isValidBirthDate(masked)) {
                      setBirthDateError('Data invalida')
                    } else {
                      setBirthDateError('')
                    }
                  }}
                  required
                />
                {birthDateError ? <p className="field-error">{birthDateError}</p> : null}
              </>
            ) : null}

            <input
              name="whatsapp"
              placeholder="WhatsApp"
              value={form.whatsapp}
              inputMode="numeric"
              onChange={(event) => {
                const masked = formatPhone(event.target.value)
                const digits = masked.replace(/\D/g, '')

                setForm({ ...form, whatsapp: masked })

                if (digits.length > 0 && digits.length < 10) {
                  setPhoneError('Telefone incompleto')
                } else if (digits.length >= 10 && !isValidPhone(masked)) {
                  setPhoneError('Telefone invalido')
                } else {
                  setPhoneError('')
                }
              }}
              required
            />
            {phoneError ? <p className="field-error">{phoneError}</p> : null}

            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(event) => {
                const value = event.target.value
                setForm({ ...form, email: value })

                if (value.length > 3 && !isValidEmail(value)) {
                  setEmailError('E-mail invalido')
                } else {
                  setEmailError('')
                }
              }}
              required
            />
            {emailError ? <p className="field-error">{emailError}</p> : null}

            {mode === 'full' ? (
              <>
                <select
                  value={form.uf}
                  onChange={(event) => {
                    setForm({ ...form, uf: event.target.value, cidade: '' })
                    setCityQuery('')
                    setCitySuggestions([])
                    setCityError('')
                  }}
                  required
                >
                  <option value="">UF</option>
                  {ufs.map((uf) => (
                    <option key={uf.id} value={uf.sigla}>
                      {uf.sigla}
                    </option>
                  ))}
                </select>

                <div className="city-field">
                  <input
                    placeholder="Cidade"
                    value={cityQuery}
                    autoComplete="off"
                    onBlur={() => setTimeout(() => setCitySuggestions([]), 150)}
                    onChange={(event) => {
                      const value = event.target.value
                      setCityQuery(value)
                      setForm({ ...form, cidade: value })

                      if (!fuse || value.length < 2) {
                        setCitySuggestions([])
                      } else {
                        const term = normalizeText(value)
                        const result = fuse
                          .search(term)
                          .slice(0, 6)
                          .map((item) => item.item)

                        setCitySuggestions(result)
                      }

                      if (value.length > 2 && !validateCity(value)) {
                        setCityError('Selecione uma cidade valida')
                      } else {
                        setCityError('')
                      }
                    }}
                    required
                  />

                  {citySuggestions.length > 0 ? (
                    <div className="city-suggestion-list">
                      {citySuggestions.map((city, index) => (
                        <button
                          key={city.id || `${city.nome}-${index}`}
                          type="button"
                          className="city-suggestion-item"
                          onMouseDown={() => {
                            setForm({ ...form, cidade: city.nome })
                            setCityQuery(city.nome)
                            setCityError('')
                            setCitySuggestions([])
                          }}
                        >
                          {city.nome}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                {cityError ? <p className="field-error">{cityError}</p> : null}

                <input
                  name="bairro"
                  placeholder="Bairro"
                  value={form.bairro}
                  onChange={(event) => setForm({ ...form, bairro: event.target.value })}
                  required
                />

                <fieldset className="interest-group">
                  <legend>Interesses (opcional)</legend>
                  <div className="interest-grid">
                    {formConfig.interests.map((interest) => (
                      <label key={interest} className="interest-item">
                        <input
                          type="checkbox"
                          checked={(form.interesses || []).includes(interest)}
                          onChange={() => toggleInterest(interest)}
                        />
                        <span className="checkbox-custom" aria-hidden="true" />
                        <span>{interest}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <textarea
                  name="temasPrioritarios"
                  rows="3"
                  placeholder="Temas prioritarios (opcional)"
                  value={form.temasPrioritarios}
                  onChange={(event) =>
                    setForm({ ...form, temasPrioritarios: event.target.value })
                  }
                />
              </>
            ) : null}

            <PrivacyConsent
              checked={form.lgpd}
              onChange={(checked) => setForm({ ...form, lgpd: checked })}
              onOpenPrivacy={onOpenPrivacy}
            />

            <button type="submit" className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : submitLabel}
            </button>

            <button type="button" className="button button-whatsapp" onClick={onShare}>
              Compartilhar no WhatsApp
            </button>

            {statusMessage ? <p className="form-success">{statusMessage}</p> : null}
            {errorMessage ? <p className="field-error">{errorMessage}</p> : null}
          </form>
        </article>
      </div>
    </section>
  )
}

export default CampaignForm
