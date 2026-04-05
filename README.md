# Template de Pre-Campanha Eleitoral (React + Vite + Sanity)

Template para captacao e engajamento com rotas dinamicas de campanhas e noticias integradas ao Sanity CMS.

## Tecnologias

- React + Vite
- React Router
- CSS responsivo
- Sanity CMS headless
- Integracao de formulario (Google Forms ou JSON API)

## Estrutura principal

- Home com hero, campanhas e noticias dinamicas
- Campanhas em /campanhas
- Landing dinamica por campanha em /campanha/:slug
- Noticias em /noticias
- Detalhe de noticia em /noticias/:slug
- Pagina de agenda em /agenda
- Painel admin em /admin

## Melhorias estruturais aplicadas

- Separacao de responsabilidades entre pages, components, hooks e services para o modulo admin
- Layout administrativo isolado das paginas publicas
- Client Supabase centralizado e protegido por variaveis de ambiente
- Guard de rota para acesso admin com whitelist de e-mails
- Hook de leads desacoplado da UI para paginação, busca e sincronizacao

## Estrutura do admin

- src/services/supabase/client.js
- src/services/supabase/auth.js
- src/services/supabase/leads.js
- src/hooks/useAdminAuth.js
- src/hooks/useLeads.js
- src/components/admin/AdminLayout.jsx
- src/components/admin/AdminRoute.jsx
- src/components/admin/AdminLoginCard.jsx
- src/components/admin/AdminLeadsToolbar.jsx
- src/components/admin/AdminLeadsTable.jsx
- src/components/admin/AdminPagination.jsx
- src/components/admin/AdminStatCard.jsx
- src/pages/admin/AdminLogin.jsx
- src/pages/admin/AdminLeads.jsx
- src/utils/admin/leads.js
- src/utils/admin/csv.js

## Configuracao local

1. Instale dependencias:

npm install

2. Configure ambiente (opcional, ja existe fallback):

Copie .env.example para .env:

VITE_SANITY_PROJECT_ID=4z8utkvy
VITE_SANITY_DATASET=production
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
VITE_ADMIN_EMAIL_WHITELIST=admin@seudominio.com.br,outra@seudominio.com.br
VITE_SUPABASE_GOOGLE_REDIRECT_URL=http://localhost:5173/admin
VITE_LEADS_API_ENDPOINT=/api/leads
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SECRETA_SERVER_ONLY

3. Rode em desenvolvimento:

npm run dev

4. Gere build:

npm run build

5. Rode preview:

npm run preview

## Painel administrativo de leads

Recursos implementados:

- Login com Google via Supabase Auth
- Persistencia de sessao
- Protecao client-side por whitelist de e-mails
- Tabela dinamica com paginação, busca e filtro por data
- Exportacao CSV com os mesmos campos presentes na tabela leads
- Ordenacao por coluna
- Selecao multipla para exportacao
- Metricas basicas de leads
- Atualizacao em tempo real via Supabase Realtime

### Tabela esperada no Supabase

Nome: public.leads

Campos recomendados:

- id
- created_at
- name
- email
- phone
- birthDate
- state
- city
- district
- interests
- priorityThemes
- source
- page
- consent

Campos extras tambem aparecem automaticamente na tabela do admin.

### API segura de captura de leads

O projeto agora inclui uma serverless function em api/leads.js para gravar os leads no Supabase usando a service role key sem expor segredo no frontend.

Fluxo:

1. O formulario envia para /api/leads.
2. A funcao valida os campos basicos.
3. O backend insere o lead em public.leads com SUPABASE_SERVICE_ROLE_KEY.

Importante: a rewrite do Vercel foi ajustada para nao capturar /api/*.

### Seguranca recomendada no Supabase

Whitelist no front evita acesso pela interface, mas nao substitui RLS. Para blindar a tabela, habilite RLS e crie uma politica de leitura apenas para contas autorizadas.

Exemplo de estrategia segura:

1. Criar uma tabela admin_users com os e-mails autorizados.
2. Habilitar RLS em public.leads.
3. Permitir SELECT apenas para usuarios autenticados cujo e-mail exista em admin_users.

Exemplo SQL:

```sql
create table if not exists public.admin_users (
	email text primary key
);

alter table public.leads enable row level security;

create policy "Admins can read leads"
on public.leads
for select
to authenticated
using (
	exists (
		select 1
		from public.admin_users
		where lower(admin_users.email) = lower(auth.jwt() ->> 'email')
	)
);
```

### Google Auth no Supabase

No painel do Supabase:

1. Ative o provider Google em Authentication > Providers.
2. Configure a URL de redirect para /admin.
3. Cadastre a origem local e a origem de producao.

## CORS no Sanity

Para funcionar no navegador local, a origem do frontend precisa estar liberada no projeto Sanity.

Origens comuns:

- http://localhost:5173
- http://127.0.0.1:5173
- http://localhost:4173
- http://127.0.0.1:4173

## Fluxo de conteudo

- Noticias usam o schema post
- Campanhas usam o schema campaign
- Home lista campanhas ativas e ultimas noticias
- Cada campanha abre landing propria com hero, conteudo, CTA e formulario
