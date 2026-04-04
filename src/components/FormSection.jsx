import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import PrivacyConsent from './PrivacyConsent'
import { submitFormData } from '../utils/formSubmission'
import { getBrazilCities, getBrazilStates } from '../utils/locationData'

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
  const [cidadeBusca, setCidadeBusca] = useState('')
  const [cidadesFiltradas, setCidadesFiltradas] = useState([])
  const [ufs, setUfs] = useState([])
  const [cidadesFonte, setCidadesFonte] = useState([])

  const normalizar = (texto) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

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

    const cidadesFiltradasUF = cidadesFonte.filter((cidade) => cidade.uf === form.uf)
    return cidadesFiltradasUF.map((cidade) => ({
      ...cidade,
      nomeBusca: normalizar(cidade.nome),
    }))
  }, [cidadesFonte, form.uf])

  const fuse = useMemo(() => {
    if (!cidades.length) return null

    return new Fuse(cidades, {
      keys: ['nomeBusca'],
      threshold: 0.3,
      ignoreLocation: true,
    })
  }, [cidades])

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    if (digits.length <= 2) return digits
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  const formatBirthDate = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8)

    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
  }

  const validarNascimento = (value) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false

    const [diaStr, mesStr, anoStr] = value.split('/')
    const dia = Number(diaStr)
    const mes = Number(mesStr)
    const ano = Number(anoStr)

    if (ano < 1900 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return false

    const data = new Date(ano, mes - 1, dia)
    const hoje = new Date()

    return (
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia &&
      data <= hoje
    )
  }

  const validarTelefoneBR = (telefone) => {
    const numero = telefone.replace(/\D/g, '')

    if (numero.length !== 10 && numero.length !== 11) return false
    if (/^(\d)\1+$/.test(numero)) return false

    const ddd = parseInt(numero.substring(0, 2), 10)

    if (ddd < 11 || ddd > 99) return false
    if (numero.length === 11 && numero[2] !== '9') return false

    if (numero.length === 10) {
      const primeiro = parseInt(numero[2], 10)

      if (primeiro < 2 || primeiro > 5) return false
    }

    return true
  }

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validarCidade = (cidade) => {
    if (!cidade) return false

    const termo = normalizar(cidade)
    return cidades.some((item) => normalizar(item.nome) === termo)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validarTelefoneBR(form.whatsapp)) {
      window.alert('Telefone invalido')
      return
    }

    if (!validarNascimento(form.nascimento)) {
      window.alert('Informe uma data de nascimento valida no formato dd/mm/aaaa.')
      return
    }

    if (!validarCidade(form.cidade)) {
      window.alert('Selecione uma cidade valida.')
      return
    }

    if (!form.lgpd) {
      window.alert('Voce precisa aceitar a politica de privacidade.')
      return
    }

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

    if (
      window.confirm(
        'Apoio registrado com sucesso!\n\nDeseja compartilhar esta campanha no WhatsApp?',
      )
    ) {
      onShare()
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

                  if (masked.length === 10 && !validarNascimento(masked)) {
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
                    return
                  }

                  if (numero.length === 10 || numero.length === 11) {
                    if (!validarTelefoneBR(masked)) {
                      setTelefoneErro('Telefone invalido')
                    } else {
                      setTelefoneErro('')
                    }
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
                    if (!validarEmail(value)) {
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
                      const termo = normalizar(value)
                      const resultado = fuse
                        .search(termo)
                        .slice(0, 6)
                        .map((result) => result.item)

                      if (
                        resultado.length === 1 &&
                        normalizar(resultado[0].nome) === termo
                      ) {
                        setCidadesFiltradas([])
                      } else {
                        setCidadesFiltradas(resultado)
                      }
                    }

                    if (value.length > 2) {
                      const existe = cidades.some(
                        (cidade) => normalizar(cidade.nome) === normalizar(value),
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
                onChange={(checked) => setForm({ ...form, lgpd: checked })}
                onOpenPrivacy={onOpenPrivacy}
              />

              <button type="submit" className="glow form-submit">
                Confirmar apoio
              </button>

              <button
                type="button"
                className="whatsapp-share glow"
                onClick={onShare}
              >
                Compartilhar no WhatsApp
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default FormSection