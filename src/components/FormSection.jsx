import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import PrivacyConsent from './PrivacyConsent'
import { submitFormData } from '../utils/formSubmission'
import { getBrazilCities, getBrazilStates } from '../utils/locationData'
import {
  formatBirthDate,
  formatPhone,
  isValidBirthDate,
  isValidEmail,
  isValidPhone,
  normalizeText,
} from '../utils/formValidation'

function FormSection({
  formIntegration,
  title = 'Cadastre-se para apoiar a campanha',
  source = 'campanha',
  page = 'campanha',
  onShare,
  onOpenPrivacy,
}) {
  const [form, setForm] = useState({
    nome: '',
    nascimento: '',
    whatsapp: '',
    email: '',
    uf: '',
    cidade: '',
    lgpd: false,
  })

  const [telefoneErro, setTelefoneErro] = useState('')
  const [nascimentoErro, setNascimentoErro] = useState('')
  const [emailErro, setEmailErro] = useState('')
  const [cidadeErro, setCidadeErro] = useState('')
  const [lgpdErro, setLgpdErro] = useState('')
  const [cidadeBusca, setCidadeBusca] = useState('')
  const [cidadesFiltradas, setCidadesFiltradas] = useState([])
  const [ufs, setUfs] = useState([])
  const [cidadesFonte, setCidadesFonte] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getBrazilStates()
      .then((data) => setUfs(data))
      .catch(() => setUfs([]))
  }, [])

  useEffect(() => {
    getBrazilCities()
      .then((data) => setCidadesFonte(data))
      .catch(() => setCidadesFonte([]))
  }, [])

  const cidades = useMemo(() => {
    if (!form.uf) return []

    return cidadesFonte
      .filter((cidade) => cidade.uf === form.uf)
      .map((cidade) => ({ ...cidade, nomeBusca: normalizeText(cidade.nome) }))
  }, [cidadesFonte, form.uf])

  const fuse = useMemo(() => {
    if (!cidades.length) return null

    return new Fuse(cidades, {
      keys: ['nomeBusca'],
      threshold: 0.3,
      ignoreLocation: true,
    })
  }, [cidades])

  const validarCidade = (cidade) => {
    if (!cidade) return false
    const termo = normalizeText(cidade)
    return cidades.some((item) => item.nomeBusca === termo)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setSuccess(false)

    if (!isValidPhone(form.whatsapp)) {
      setTelefoneErro('Telefone invalido')
      return
    }

    if (!isValidBirthDate(form.nascimento)) {
      setNascimentoErro('Data de nascimento invalida')
      return
    }

    if (!validarCidade(form.cidade)) {
      setCidadeErro('Selecione uma cidade valida')
      return
    }

    if (!form.lgpd) {
      setLgpdErro('Voce precisa aceitar a politica de privacidade')
      return
    }

    setIsSubmitting(true)

    try {
      await submitFormData(formIntegration, {
        ...form,
        origem: source,
        pagina: page,
      })

      setForm({
        nome: '',
        nascimento: '',
        whatsapp: '',
        email: '',
        uf: '',
        cidade: '',
        lgpd: false,
      })
      setCidadeBusca('')
      setCidadesFiltradas([])
      setNascimentoErro('')
      setTelefoneErro('')
      setEmailErro('')
      setCidadeErro('')
      setLgpdErro('')
      setSuccess(true)
    } catch {
      setSubmitError('Nao foi possivel enviar agora. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section id="assinar" className="form-section">
        <div className="container">
          <div className="form-card">
            <h2>{title}</h2>

            <form onSubmit={handleSubmit}>
              <input
                name="nome"
                placeholder="Nome completo"
                value={form.nome}
                onChange={(event) => setForm({ ...form, nome: event.target.value })}
                required
              />

              <label className="date-label">
                <span className="date-icon">📅</span>
                Data de nascimento
              </label>

              <input
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
                    setNascimentoErro('Data invalida')
                  } else {
                    setNascimentoErro('')
                  }
                }}
                required
              />
              {nascimentoErro && <p className="field-error">{nascimentoErro}</p>}

              <input
                name="whatsapp"
                placeholder="WhatsApp"
                value={form.whatsapp}
                inputMode="numeric"
                autoComplete="tel"
                onChange={(event) => {
                  const masked = formatPhone(event.target.value)
                  const numero = masked.replace(/\D/g, '')

                  setForm({ ...form, whatsapp: masked })

                  if (numero.length > 0 && numero.length < 10) {
                    setTelefoneErro('Telefone incompleto')
                  } else if ((numero.length === 10 || numero.length === 11) && !isValidPhone(masked)) {
                    setTelefoneErro('Telefone invalido')
                  } else {
                    setTelefoneErro('')
                  }
                }}
                required
              />
              {telefoneErro && <p className="field-error">{telefoneErro}</p>}

              <input
                type="email"
                name="email"
                placeholder="E-mail"
                value={form.email}
                autoComplete="email"
                onInput={(event) => {
                  const value = event.target.value

                  setForm({ ...form, email: value })

                  if (value.length > 3) {
                    if (!isValidEmail(value)) {
                      setEmailErro('E-mail invalido')
                    } else {
                      setEmailErro('')
                    }
                  } else {
                    setEmailErro('')
                  }
                }}
                required
              />
              {emailErro && <p className="field-error">{emailErro}</p>}

              <select
                value={form.uf}
                onChange={(event) => {
                  setForm({
                    ...form,
                    uf: event.target.value,
                    cidade: '',
                  })
                  setCidadeBusca('')
                  setCidadeErro('')
                  setCidadesFiltradas([])
                }}
                required
              >
                <option value="">Estado</option>

                {ufs.map((uf) => (
                  <option key={uf.id} value={uf.sigla}>
                    {uf.nome}
                  </option>
                ))}
              </select>

              <div className="cidade-field">
                <input
                  placeholder="Cidade"
                  value={cidadeBusca}
                  autoComplete="off"
                  onClick={(event) => event.stopPropagation()}
                  onBlur={() => setTimeout(() => setCidadesFiltradas([]), 150)}
                  onChange={(event) => {
                    const value = event.target.value

                    setCidadeBusca(value)
                    setForm({ ...form, cidade: value })

                    if (!fuse || value.length < 2) {
                      setCidadesFiltradas([])
                    } else {
                      const termo = normalizeText(value)
                      const resultado = fuse
                        .search(termo)
                        .slice(0, 6)
                        .map((result) => result.item)

                      if (
                        resultado.length === 1 &&
                        resultado[0].nomeBusca === termo
                      ) {
                        setCidadesFiltradas([])
                      } else {
                        setCidadesFiltradas(resultado)
                      }
                    }

                    if (value.length > 2) {
                      const existe = cidades.some(
                        (cidade) => cidade.nomeBusca === normalizeText(value),
                      )

                      if (!existe) {
                        setCidadeErro('Selecione uma cidade valida')
                      } else {
                        setCidadeErro('')
                        setCidadesFiltradas([])
                      }
                    } else {
                      setCidadeErro('')
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setCidadesFiltradas([])
                    }
                  }}
                  required
                />

                {cidadeErro && <p className="field-error">{cidadeErro}</p>}

                {cidadesFiltradas.length > 0 && (
                  <div
                    className="cidade-sugestoes"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {cidadesFiltradas.map((cidade, index) => (
                      <div
                        key={cidade.id || cidade.nome || index}
                        className="cidade-item"
                        onMouseDown={() => {
                          setForm({ ...form, cidade: cidade.nome })
                          setCidadeBusca(cidade.nome)
                          setCidadeErro('')
                          setCidadesFiltradas([])
                        }}
                      >
                        {cidade.nome}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <PrivacyConsent
                checked={form.lgpd}
                onChange={(checked) => {
                  setForm({ ...form, lgpd: checked })
                  if (checked) setLgpdErro('')
                }}
                onOpenPrivacy={onOpenPrivacy}
              />
              {lgpdErro && <p className="field-error">{lgpdErro}</p>}

              <button type="submit" className="glow form-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Confirmar apoio'}
              </button>

              <button
                type="button"
                className="whatsapp-share glow"
                onClick={onShare}
              >
                Compartilhar no WhatsApp
              </button>

              {submitError && <p className="field-error">{submitError}</p>}

              {success && (
                <div className="form-success">
                  <p>Apoio registrado com sucesso! Obrigada!</p>
                  <button type="button" className="whatsapp-share glow" onClick={onShare}>
                    Compartilhar no WhatsApp
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default FormSection
