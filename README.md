# Bancada Feminista — Site de Campanha Eleitoral

Site institucional e de captação de leads para a **Bancada Feminista do PSOL** (São Paulo/SP). Construído com React + Vite, integra Sanity CMS para conteúdo editorial e Supabase para autenticação e banco de dados.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack técnica](#stack-técnica)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Fluxos principais](#fluxos-principais)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy (Vercel)](#deploy-vercel)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [CMS (Sanity)](#cms-sanity)
- [Painel administrativo](#painel-administrativo)
- [Configuração do site](#configuração-do-site)
- [Exportação de leads](#exportação-de-leads)
- [Analytics](#analytics)

---

## Visão geral

O projeto tem dois grandes domínios:

| Domínio | Descrição |
|---|---|
| **Site público** | Páginas institucionais, campanhas, notícias, agenda, formulário de adesão |
| **Painel admin** | Gestão de leads em tempo real, gerenciamento de administradores, link para Sanity Studio |

O site público consome dados de duas fontes: **Sanity** (conteúdo editorial — campanhas, notícias, eventos) e **Supabase** (leads capturados). O painel admin é protegido por autenticação Google via Supabase Auth com verificação de whitelist de e-mails.

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 + Vite 8 |
| Roteamento | React Router 7 |
| CMS | Sanity (headless, GROQ queries) |
| Banco de dados / Auth | Supabase (PostgreSQL + Google OAuth) |
| Busca fuzzy | Fuse.js (autocomplete de cidades) |
| Rich text | `@portabletext/react` (renderização de conteúdo do Sanity) |
| Sanitização HTML | DOMPurify |
| Export Excel | write-excel-file |
| Serverless API | Vercel Functions (`api/leads.js`) |
| Estilização | CSS custom properties (variáveis de tema via `landingConfig`) |

---

## Estrutura do projeto

```
prototipo-bf/
├── api/
│   └── leads.js                   # Vercel serverless function — recebe e salva leads
├── public/
│   └── images/                    # Imagens estáticas (logo, hero, background)
├── src/
│   ├── main.jsx                   # Entry point (StrictMode + global CSS)
│   ├── App.jsx                    # Shell: roteamento, tema, analytics, scroll
│   ├── config/
│   │   └── landingConfig.js       # Config central do site (tema, nav, forms, conteúdo)
│   ├── components/
│   │   ├── Header.jsx             # Navegação principal com dropdown e menu mobile
│   │   ├── Footer.jsx             # Rodapé com links sociais
│   │   ├── Hero.jsx               # Seção hero da home
│   │   ├── PageHero.jsx           # Hero de páginas internas
│   │   ├── CampaignForm.jsx       # Formulário de adesão (full / simplificado)
│   │   ├── FormSection.jsx        # Formulário para landings de campanha
│   │   ├── NewsSection.jsx        # Grid de notícias
│   │   ├── EventsSection.jsx      # Lista de eventos
│   │   ├── NarrativeSection.jsx   # Seção narrativa da página "Quem somos"
│   │   ├── InfoSection.jsx        # Seção com imagem + texto
│   │   ├── MandatesSection.jsx    # Projetos de lei com busca e filtro
│   │   ├── ProposalsSection.jsx   # Cards de propostas temáticas
│   │   ├── SocialProofSection.jsx # Indicadores, depoimentos e fotos
│   │   ├── PrivacyConsent.jsx     # Checkbox de consentimento LGPD
│   │   ├── PrivacySection.jsx     # Modal com política de privacidade
│   │   ├── ErrorBoundary.jsx      # Boundary para erros de renderização
│   │   ├── ModalPortal.jsx        # Portal React para modais
│   │   └── admin/
│   │       ├── AdminLayout.jsx    # Layout do painel (sidebar + topbar)
│   │       ├── AdminRoute.jsx     # Guard de rota para /admin/*
│   │       ├── AdminLoginCard.jsx # Card de login com Google
│   │       ├── AdminLeadsTable.jsx    # Tabela de leads ordenável e selecionável
│   │       ├── AdminLeadsToolbar.jsx  # Busca, filtros de data e botões de export
│   │       ├── AdminPagination.jsx    # Controles de paginação
│   │       ├── AdminStatCard.jsx      # Card de indicador numérico
│   │       ├── AdminUserMenu.jsx      # Avatar + logout
│   │       ├── CampaignCard.jsx       # Card de campanha no grid admin
│   │       └── LeadsBarChart.jsx      # Gráfico de barras de leads por dia (30 dias)
│   ├── pages/
│   │   ├── Home.jsx               # Página inicial
│   │   ├── Campanhas.jsx          # Lista de campanhas ativas
│   │   ├── Campanha.jsx           # Detalhe de campanha com formulário
│   │   ├── Noticias.jsx           # Lista paginada de notícias
│   │   ├── NoticiaDetalhe.jsx     # Detalhe de notícia (Portable Text)
│   │   ├── Eventos.jsx            # Agenda de eventos
│   │   ├── QuemSou.jsx            # Página "Quem somos"
│   │   ├── Mandatas.jsx           # Redirect para /mandatas/municipal
│   │   ├── MandataEstadual.jsx    # Mandato estadual (Alesp)
│   │   ├── MandataMunicipal.jsx   # Mandato municipal (Câmara SP)
│   │   ├── Tema.jsx               # Redirect de /temas/:slug para campanha
│   │   └── admin/
│   │       ├── AdminLogin.jsx         # Tela de login Google
│   │       ├── AdminLeads.jsx         # Dashboard principal de leads
│   │       ├── AdminAdmins.jsx        # Gerenciamento de usuários admin
│   │       ├── AdminSanity.jsx        # Link para o Sanity Studio
│   │       ├── AdminCampaigns.jsx     # Visão geral das campanhas
│   │       └── AdminCampaignDetail.jsx # Leads e gráfico por campanha
│   ├── hooks/
│   │   ├── useAdminAuth.js        # Sessão, sync DB e verificação de admin
│   │   ├── useAuth.js             # Wrapper simplificado de auth
│   │   ├── useLeads.js            # Leads com filtros, paginação e realtime
│   │   ├── useCampaigns.js        # Campanhas Sanity + contagem de leads
│   │   ├── useAdmins.js           # CRUD de usuários administradores
│   │   └── useCampaignLeads.js    # Leads e gráfico por campanha específica
│   ├── services/supabase/
│   │   ├── client.js              # Singleton do cliente Supabase
│   │   ├── auth.js                # Google OAuth, whitelist, signOut
│   │   ├── leads.js               # Fetch, métricas, export e realtime de leads
│   │   ├── campaigns.js           # Leads por campanha, métricas, gráfico, UTMs
│   │   └── admins.js              # CRUD de admin_users, sync e verificação
│   ├── utils/
│   │   ├── sanityClient.js        # Cliente Sanity configurado
│   │   ├── campaigns.js           # Queries GROQ para campanhas
│   │   ├── news.js                # Queries GROQ para notícias/posts
│   │   ├── agendas.js             # Queries GROQ para eventos
│   │   ├── formValidation.js      # Validação e formatação de campos do formulário
│   │   ├── formSubmission.js      # Envio para Google Forms ou JSON API
│   │   ├── locationData.js        # Estados IBGE + cidades BR (JSON local)
│   │   ├── seo.js                 # Atualização de meta tags por página
│   │   ├── share.js               # Compartilhamento via WhatsApp
│   │   ├── analytics.js           # GA4 e Meta Pixel (inicialização e eventos)
│   │   └── admin/
│   │       ├── csv.js             # Exportação para CSV e Excel
│   │       └── leads.js           # Colunas, labels e formatação de valores de leads
│   └── data/
│       ├── cidadesBR.json         # Lista completa de municípios brasileiros
│       └── cidadesMG.json         # Municípios de Minas Gerais (subset)
├── index.html                     # HTML de entrada (meta OG, preconnect)
├── vite.config.js                 # Configuração do Vite
├── vercel.json                    # Configuração de deploy Vercel
├── .env.example                   # Template de variáveis de ambiente
└── package.json
```

---

## Fluxos principais

### Captação de leads

```
Usuário preenche formulário (CampaignForm / FormSection)
  └─> formValidation.js valida campos (nome, telefone, e-mail, data)
        └─> formSubmission.js envia para VITE_LEADS_API_ENDPOINT
              └─> api/leads.js (Vercel serverless)
                    ├─ sanitiza e valida payload
                    ├─ insere em public.leads via service role key
                    └─ responde 201 { ok: true, lead: { id, created_at } }
```

O formulário suporta dois modos:
- **`full`** — nome, nascimento, WhatsApp, e-mail, UF, cidade, bairro, interesses, temas
- **`simplified`** — apenas nome, e-mail e telefone (usado em campanhas específicas)

### Autenticação do painel admin

```
/admin/login
  └─> signInWithGoogle() → OAuth Google via Supabase
        └─> redirect para VITE_SUPABASE_GOOGLE_REDIRECT_URL (/admin)
              └─> useAdminAuth detecta sessão
                    ├─> syncAdminUser() — vincula user_id ao registro em admin_users
                    ├─> checkIsAdmin() — verifica is_active na tabela admin_users
                    └─> isAuthorized — verifica e-mail na VITE_ADMIN_EMAIL_WHITELIST
```

> Um usuário precisa ter o e-mail cadastrado em `admin_users` com `is_active = true` para acessar o painel. A whitelist de variável de ambiente é uma camada adicional opcional.

### Conteúdo editorial (Sanity)

As páginas que consomem o Sanity:

| Página | Função |
|---|---|
| Home, Campanhas, Campanha | `fetchActiveCampaigns`, `fetchCampaignBySlug` |
| Notícias, NoticiaDetalhe | `fetchLatestNews`, `fetchNewsPage`, `fetchPostBySlug` |
| Agenda | `fetchAgendas` |

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
# Sanity CMS
VITE_SANITY_PROJECT_ID=        # ID do projeto Sanity
VITE_SANITY_DATASET=production # Dataset (geralmente "production")

# Supabase
VITE_SUPABASE_URL=             # URL do projeto Supabase
VITE_SUPABASE_PUBLISHABLE_KEY= # Chave pública (anon key)

# Admin
VITE_ADMIN_EMAIL_WHITELIST=    # E-mails separados por vírgula (ex: admin@dominio.com)
VITE_SUPABASE_GOOGLE_REDIRECT_URL=http://localhost:5173/admin

# API de leads
VITE_LEADS_API_ENDPOINT=/api/leads

# Apenas no servidor (Vercel / backend) — nunca no frontend
SUPABASE_SERVICE_ROLE_KEY=     # Service role key do Supabase
SUPABASE_URL=                  # Mesma URL do Supabase (alias server-side)
LEADS_ALLOWED_ORIGINS=         # Origens CORS permitidas (ex: https://seusite.com)
LEADS_PROJECT_KEY=site         # Identificador do projeto salvo em cada lead
```

> `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta ao navegador. Ela é usada exclusivamente pela Vercel Function em `api/leads.js`.

---

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

O site estará disponível em `http://localhost:5173`.

```bash
# Outros comandos
npm run build    # Gera build de produção em /dist
npm run preview  # Serve o build localmente
npm run lint     # Verifica o código com ESLint
```

---

## Deploy (Vercel)

O projeto está configurado para deploy na Vercel via `vercel.json`. A Vercel Function em `api/leads.js` é detectada automaticamente.

**Variáveis obrigatórias na Vercel:**

- Todas as `VITE_*` (disponíveis no build)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, nunca com prefixo VITE_)
- `SUPABASE_URL` (alias server-side)
- `LEADS_ALLOWED_ORIGINS` (lista de domínios de produção)

```bash
vercel --prod
```

---

## Banco de dados (Supabase)

### Tabelas utilizadas

#### `public.leads`
Leads capturados pelo formulário público.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Chave primária |
| `created_at` | timestamptz | Data de captação |
| `name` / `nome` | text | Nome completo |
| `email` | text | E-mail |
| `phone` / `telefone` | text | Telefone |
| `birth_date` | date | Data de nascimento |
| `state` | text | UF |
| `city` | text | Cidade |
| `district` | text | Bairro |
| `interests` | text[] | Temas de interesse |
| `priority_themes` | text | Temas prioritários |
| `form_slug` | text | Slug da campanha/formulário de origem |
| `utm_source` | text | UTM source |
| `utm_campaign` | text | UTM campaign |
| `dados` | jsonb | Payload bruto completo |
| `consent` | boolean | Consentimento LGPD |

#### `public.lead_forms`
Campanhas/formulários cadastrados no painel admin.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Chave primária |
| `name` | text | Nome da campanha |
| `slug` | text | Slug único (vincula aos leads) |
| `is_active` | boolean | Se aparece no painel |

#### `public.admin_users`
Usuários autorizados a acessar o painel.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Chave primária |
| `user_id` | uuid | FK para `auth.users` (preenchido no primeiro login) |
| `email` | text | E-mail do usuário |
| `full_name` | text | Nome (preenchido automaticamente via Google) |
| `is_active` | boolean | Se o acesso está ativo |

### Realtime

O painel de leads (`/admin`) usa `subscribeToLeadChanges` para receber atualizações em tempo real via Supabase Realtime (canal `admin-leads-realtime`). A atualização é suspensa quando a aba está em segundo plano (`document.hidden`) para evitar recargas desnecessárias ao retornar de outra aba.

---

## CMS (Sanity)

O projeto usa o Sanity como CMS headless. As queries são feitas via GROQ diretamente no cliente (`@sanity/client`).

**Tipos de conteúdo usados:**

| Tipo Sanity | Páginas que consomem |
|---|---|
| `campaign` | Home, Campanhas, Campanha |
| `post` | Notícias, NoticiaDetalhe |
| `agenda` | Agenda |

**Campos principais de `campaign`:**
- `title`, `slug`, `description`, `imageUrl`
- `hero` — título, texto, CTA, assinaturas, imagens
- `contentSection` — conteúdo rich text (Portable Text)
- `form` — configuração do formulário inline
- `signatureCount` — contador de assinaturas integrado com Google Sheets

Para editar conteúdo, acesse o Sanity Studio pelo painel admin em `/admin/sanity`.

---

## Painel administrativo

### Acesso

1. Navegue para `/admin/login`
2. Clique em **Entrar com Google**
3. Após autenticação, o sistema verifica se o e-mail está em `admin_users` com `is_active = true`

### Seções do painel

| Rota | Descrição |
|---|---|
| `/admin` | Dashboard com todos os leads (busca, filtros, tabela, export) |
| `/admin/campanhas` | Visão geral das campanhas com contagem de leads |
| `/admin/campanhas/:slug` | Leads específicos de uma campanha + gráfico de 30 dias |
| `/admin/admins` | Gerenciar usuários com acesso ao painel |
| `/admin/sanity` | Link direto para o Sanity Studio |

### Gerenciar administradores

Em `/admin/admins`:
- **Adicionar:** informe o e-mail e clique em Adicionar
- **Desativar/Ativar:** use o toggle na linha do usuário
- **Remover:** clique no botão de remoção (pede confirmação)

O vínculo com a conta Google é feito automaticamente no primeiro login do usuário.

---

## Configuração do site

Todo o conteúdo estático e visual do site é centralizado em [`src/config/landingConfig.js`](src/config/landingConfig.js). Principais seções:

| Seção | O que controla |
|---|---|
| `metadata` | Nome da marca, candidata, cidade, slogan |
| `assets` | Caminhos de logo, imagens, favicon |
| `theme` | 15 cores CSS custom properties |
| `navigation` | Links do menu (com suporte a dropdown) |
| `tracking` | IDs de GA4 e Meta Pixel |
| `share` | Texto padrão de compartilhamento no WhatsApp |
| `socialProof` | Indicadores, depoimentos, contador ao vivo |
| `home` | Hero, seção de campanhas, seção de notícias |
| `aboutPage` | Biografia, história pessoal, causas |
| `mandatesPage` | Projetos de lei municipais e estaduais |
| `forms` | Título, campos, interesses, configuração da API |
| `privacyPolicy` | Texto completo da política LGPD |
| `footer` | Texto, Instagram |

### Trocar o provider do formulário

Em `landingConfig.forms.api`:

```js
// Google Forms (legado)
provider: 'google-forms',
endpoint: 'https://docs.google.com/forms/d/.../formResponse',
googleForms: { fieldIds: { nome: 'entry.XXXXX', ... } }

// JSON API (padrão — usa api/leads.js)
provider: 'json-api',
endpoint: '/api/leads',
```

---

## Exportação de leads

O painel suporta exportação nos formatos **CSV** e **Excel (.xlsx)**.

A exportação respeita os filtros ativos (busca por texto, intervalo de datas, campanha e UTM source). O limite por exportação é de **5.000 registros**.

**Colunas exportadas** (em ordem preferencial):
`Captado em` · `Nome` · `E-mail` · `Telefone` · `Origem` · `Campanha UTM` · `Campanha` · `Nascimento` · `UF` · `Cidade` · `Bairro` · `Interesses` · `Temas prioritários` · `Consentimento`

O arquivo CSV usa **UTF-8 com BOM** para compatibilidade com Microsoft Excel.

---

## Analytics

O projeto suporta dois provedores configurados em `landingConfig.tracking`:

| Provedor | Campo | Eventos rastreados |
|---|---|---|
| Google Analytics 4 | `measurementId` | `page_view`, `lead_captured` |
| Meta Pixel | `pixelId` | `PageView`, `Lead` |

Para habilitar, defina os IDs reais em `landingConfig.js` e garanta que `enabled: true`.

---

## Licença

Projeto privado — todos os direitos reservados à Bancada Feminista do PSOL.
