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

## Configuracao local

1. Instale dependencias:

npm install

2. Configure ambiente (opcional, ja existe fallback):

Copie .env.example para .env:

VITE_SANITY_PROJECT_ID=4z8utkvy
VITE_SANITY_DATASET=production

3. Rode em desenvolvimento:

npm run dev

4. Gere build:

npm run build

5. Rode preview:

npm run preview

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
