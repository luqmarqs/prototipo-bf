/**
 * landingConfig.js — Configuração central do site.
 *
 * Este arquivo é a única fonte de verdade para todos os aspectos configuráveis
 * do site público. Edite aqui para personalizar marca, tema, navegação,
 * conteúdo das páginas e integração de formulários.
 *
 * Seções principais:
 *
 * @property {object} metadata       - Nome da marca, candidata, cidade, slogan.
 * @property {object} assets         - Caminhos de imagens e favicon (pasta /public).
 * @property {object} theme          - 15 cores expostas como CSS custom properties (--color-*).
 * @property {object[]} navigation   - Links do menu. Suporta `children` para dropdown.
 * @property {object} tracking       - IDs de GA4 (measurementId) e Meta Pixel (pixelId).
 * @property {object} share          - Texto padrão de compartilhamento no WhatsApp.
 * @property {object} socialProof    - Indicadores, depoimentos, fotos e contador ao vivo.
 * @property {object} home           - Configuração da página inicial (hero, campanhas, notícias).
 * @property {object} aboutPage      - Biografia, história pessoal e lista de causas.
 * @property {object} mandatesPage   - Projetos de lei municipais e estaduais.
 * @property {object} proposalsPage  - Propostas temáticas (cards).
 * @property {object} eventsPage     - Lista de eventos/agenda estática.
 * @property {object[]} thematicLandings - Cards de campanhas temáticas para a home.
 * @property {object} forms          - Título, campos, interesses e configuração da API.
 * @property {object} privacyPolicy  - Texto completo da política LGPD.
 * @property {object} footer         - Texto e link do Instagram.
 *
 * Configuração do formulário (forms.api):
 * - provider "google-forms": usa FormData + no-cors para Google Forms legado.
 * - provider "json-api": usa JSON para /api/leads (Vercel Function) — padrão.
 */

const leadsApiEndpoint = import.meta.env.VITE_LEADS_API_ENDPOINT || '/api/leads'

const landingConfig = {
  metadata: {
    brandName: 'Bancada Feminista',
    candidateName: 'Bancada Feminista do PSOL',
    campaignNumber: '',
    city: 'Sao Paulo',
    state: 'SP',
    slogan: 'Feminismo popular, antirracista e ecossocialista para a maioria trabalhadora.',
  },

  assets: {
    favicon: '/favicon.svg',
    logo: '/images/logo-bf-negative.png',
    backgroundImage: '/images/background.webp',
    heroImage: '/images/hero-desktop.webp',
    heroImageMobile: '/images/hero-mobile.webp',
  },

  theme: {
    primary: '#f706a7',
    primaryStrong: '#660cad',
    secondary: '#372491',
    accent: '#74c970',
    accentMint: '#81efcd',
    accentYellow: '#e4ff48',
    accentLilac: '#cf6bf9',
    accentAmber: '#fcae00',
    accentDeepPurple: '#41085f',
    accentLimeLight: '#ebff81',
    accentMintLight: '#b5e8d9',
    accentGreenLight: '#b9eeb6',
    success: '#74c970',
    ink: '#140f20',
    surface: '#f7eef5',
    surfaceStrong: '#20112d',
    textOnDark: '#fffafc',
    textOnLight: '#16111d',
  },

  navigation: [
    { label: 'Inicio', path: '/' },
    { label: 'Quem somos', path: '/quem-sou' },
    {
      label: 'Mandatas',
      path: '/mandatas/municipal',
      children: [
        { label: 'Mandato municipal', path: '/mandatas/municipal' },
        { label: 'Mandato estadual', path: '/mandatas/estadual' },
      ],
    },
    { label: 'Agenda', path: '/agenda' },
    { label: 'Campanhas', path: '/campanhas' },
    { label: 'Noticias', path: '/noticias' },
  ],

  tracking: {
    googleAnalytics: {
      enabled: true,
      measurementId: 'G-XXXXXXXXXX',
    },
    metaPixel: {
      enabled: true,
      pixelId: '000000000000000',
    },
  },

  share: {
    whatsappText:
      'Conhece a Bancada Feminista do PSOL? Mandato coletivo de mulheres na Camara de SP e na Alesp, com campanhas, fiscalizacao e mobilizacao permanente. Vale acompanhar: ',
  },

  socialProof: {
    title: 'Mandatas que combinam parlamento e mobilizacao',
    description:
      'Uma construcao coletiva que ocupa a Camara Municipal e a Alesp, organiza redes e transforma denuncia em pressao politica.',
    liveCounter: {
      initialValue: 900,
      sourceUrl:
        'https://script.google.com/macros/s/AKfycbz-bf8QgHbKJwUa9nYXvcWDjvuuVfGNvy_1AvZRnpvmneSfj9RT5XvS-C4T0wh4-xbc/exec',
    },
    indicators: [
      { label: 'Mulheres eleitas de uma vez em 2020', value: '5' },
      { label: 'Votos para as codeputadas estaduais em 2022', value: '259.771' },
      { label: 'Mandatas coletivas em atividade', value: '2' },
    ],
    testimonials: [
      {
        name: 'Mulheres Vivas',
        role: 'Campanha permanente',
        text: 'Pressao popular por medidas concretas contra o feminicidio e a violencia domestica em Sao Paulo.',
      },
      {
        name: 'Escola publica e merenda',
        role: 'Fiscalizacao e denuncia',
        text: 'Atuacao institucional para enfrentar privatizacao, irregularidades e violacoes que afetam estudantes e familias.',
      },
      {
        name: 'Orgulho e direitos',
        role: 'LGBTQIA+ e justica social',
        text: 'Projetos e mobilizacoes por direitos, protecao e reconhecimento para a populacao LGBTQIA+.',
      },
    ],
  },

  home: {
    hero: {
      title: 'Bancada Feminista do PSOL',
      headline: 'Mulheres na politica para transformar denuncia em acao coletiva.',
      subheadline:
        'Feminismo popular, antirracista e ecossocialista na Camara de Sao Paulo e na Alesp, com campanhas, fiscalizacao e mobilizacao permanente.',
      primaryCta: 'Quero receber informacoes',
    },
    campaignsTitle: 'Campanhas e frentes em destaque',
    newsSection: {
      title: 'Ultimas noticias',
      intro:
        'Acompanhe as publicacoes mais recentes da Bancada Feminista direto do CMS.',
    },
    contentSection: {
      title: 'Ocupar a politica com feminismo popular',
      text: 'A Bancada Feminista do PSOL e um movimento pela ocupacao das mulheres na politica. Sua atuacao combina mandatas coletivas, organizacao de base, incidencia institucional e campanhas publicas para defender a vida das mulheres, a escola publica, os direitos LGBTQIA+ e a maioria da populacao trabalhadora.',
    },
  },

  aboutPage: {
    title: 'Quem somos',
    biography:
      'A Bancada Feminista do PSOL e um movimento pela ocupacao das mulheres na politica. Seu feminismo e popular, antirracista, ecossocialista e voltado para a maioria da populacao trabalhadora.',
    personalStory:
      'Em 2020, a Bancada Feminista foi eleita para a Camara Municipal de Sao Paulo com cinco mulheres de uma so vez. Em 2022, parte dessa experiencia se ampliou para a Alesp com uma codeputacao estadual muito votada. Hoje, a construcao sustenta duas mandatas coletivas e segue conectada a movimentos populares, redes feministas e lutas do territorio.',
    causes: [
      'Combate ao feminicidio e a violencia domestica',
      'Defesa da escola publica e da merenda escolar',
      'Direitos sexuais, reprodutivos e maternos',
      'Direitos LGBTQIA+ e enfrentamento a violencias',
    ],
  },

  mandatesPage: {
    title: 'Mandatas e projetos de lei',
    intro:
      'Acompanhe, de forma simples, os projetos de lei apresentados em cada mandata e os temas que organizam a atuacao legislativa da Bancada Feminista.',
    sections: [
      {
        slug: 'municipal',
        title: 'Mandato municipal',
        subtitle: 'Camara Municipal de Sao Paulo',
        sourceLabel: 'Fonte: Projetos-de-lei-apresentados-2021-2024.pdf',
        periodLabel: '2021-2024',
        totalLabel: '65 PLs catalogados',
        description:
          'Um panorama da producao legislativa municipal da Bancada Feminista, com propostas ligadas a direitos das mulheres, educacao publica, diversidade e vida urbana.',
        news: [
          {
            title: 'Camara de SP aprova em 1a votacao mudanca de nome da Rua Peixoto Gomide',
            date: '18/03/2026',
            source: 'G1 Sao Paulo',
            url: 'https://g1.globo.com/sp/sao-paulo/noticia/2026/03/18/camara-de-sp-aprova-em-1a-votacao-a-mudanca-de-nome-da-rua-peixoto-gomide.ghtml',
          },
          {
            title: 'Projeto para trocar nome da Rua Peixoto Gomide avanca na Camara de SP',
            date: '12/03/2026',
            source: 'G1 Sao Paulo',
            url: 'https://g1.globo.com/sp/sao-paulo/noticia/2026/03/12/projeto-para-trocar-nome-da-rua-peixoto-gomide-avanca-na-camara-de-sp-ex-senador-que-da-nome-a-via-matou-a-propria-filha.ghtml',
          },
          {
            title: 'Parlamentares mulheres fazem protocolaco de projetos pro-aleitamento materno',
            date: '14/08/2025',
            source: 'Site Bancada Feminista',
            url: 'https://bancadafeministapsol.com.br/2025/08/14/parlamentares-mulheres-fazem-protocolaco-de-projetos-pro-aleitamento-materno/',
          },
        ],
        projects: [
          { code: 'PL 591/2024', title: 'Programa Municipal de incentivo a jovens mulheres no esporte Menina Atleta.' },
          { code: 'PL 576/2024', title: 'Inclusao da Semana Municipal da Amamentacao na primeira semana de agosto.' },
          { code: 'PL 575/2024', title: 'Acoes para assegurar condicoes de presenca de bebes e criancas em predios publicos.' },
          { code: 'PL 571/2024', title: 'Informativos sobre atendimento de interrupcao de gravidez decorrente de violencia nas unidades de saude.' },
          { code: 'PL 192/2024', title: 'Cartaz informativo sobre atendimento de pessoas com gestacao indesejada no municipio.' },
          { code: 'PL 177/2024', title: 'Programa de cooperacao municipal para eliminacao da disparidade salarial entre homens e mulheres.' },
          { code: 'PL 573/2024', title: 'Selo Cartao Vermelho Contra o Assedio e Violencias no meio esportivo.' },
          { code: 'PL 565/2024', title: 'Reconhecimento do Funk como patrimonio cultural imaterial da cultura negra e periferica paulistana.' },
          { code: 'PL 175/2024', title: 'Sancoes administrativas para apologia ao golpe de 1964 e a ditadura militar.' },
          { code: 'PL 91/2024', title: 'Protocolo Vans Seguras para afericao de entrada e saida de estudantes.' },
          { code: 'PL 682/2023', title: 'Inclusao do Dia Municipal do Pre-Natal no calendario oficial.' },
          { code: 'PL 575/2023', title: 'Implementacao do Disque Saude Mental da Mulher.' },
          { code: 'PL 151/2023', title: 'Acesso de carrinhos de bebe em onibus da rede de transporte publico.' },
          { code: 'PL 60/2023', title: 'Declaracao de utilidade publica e desapropriacao do Liceu Coracao de Jesus para conservacao do servico publico de educacao.' },
          { code: 'PL 48/2023', title: 'Canal de denuncias contra assedio sexual nas instituicoes da rede municipal de ensino.' },
          { code: 'PL 16/2023', title: 'Implementacao do protocolo Nao se Cale contra violencia sexual em espacos de lazer noturno.' },
          { code: 'PL 703/2023', title: 'Protocolo Protecao e Cultura de Paz nas Escolas.' },
          { code: 'PL 592/2023', title: 'Programa de Apoio Psicologico aos Profissionais da Educacao.' },
          { code: 'PL 466/2023', title: 'Proibicao de imagens com apologia a armas, odio e violencia em materiais didaticos da rede municipal.' },
          { code: 'PL 204/2023', title: 'Criacao de equipe multidisciplinar e multiprofissional na rede municipal de ensino.' },
          { code: 'PL 203/2023', title: 'Criacao da funcao de professor mediador na rede municipal de ensino.' },
          { code: 'PL 184/2023', title: 'Canal de denuncias para casos ou ameacas de violencia contra escolas.' },
          { code: 'PL 179/2023', title: 'Inclusao de conteudos de critica a discursos de odio na internet no curriculo escolar.' },
          { code: 'PL 178/2023', title: 'Formacao para profissionais da educacao sobre identificacao de possiveis ataques em ambiente escolar.' },
          { code: 'PL 680/2023', title: 'Lei Ana Benevides sobre fornecimento obrigatorio de agua potavel em shows e grandes eventos.' },
          { code: 'PL 649/2023', title: 'Distribuicao gratuita de sutias pos mastectomia ou reconstrucao mamaria para pessoas vulnerabilizadas.' },
          { code: 'PL 560/2023', title: 'Instalacao de bebedouros publicos com agua potavel em pracas e espacos de transporte coletivo.' },
          { code: 'PL 557/2023', title: 'Dia Municipal da Visibilidade Bissexual.' },
          { code: 'PL 432/2023', title: 'Canais de comunicacao para ampliar o alcance do protocolo Nao Se Cale.' },
          { code: 'PL 357/2023', title: 'Dia do Orgulho LGBTQIAPN+ no calendario oficial.' },
          { code: 'PL 205/2023', title: 'Declaracao de nao utilizacao de trabalho analogo a escravidao em contratacoes e convenios.' },
          { code: 'PL 456/2022', title: 'Informativos sobre o direito a acompanhante para parturientes em servicos do SUS municipal.' },
          { code: 'PL 260/2022', title: 'Programa de acolhimento as pessoas em puerperio na rede municipal de saude.' },
          { code: 'PL 170/2022', title: 'Auxilio Vale-Gas para maes solo no municipio.' },
          { code: 'PL 34/2022', title: 'Fundo Municipal de Socorro as Pessoas Atingidas por Enchentes e Deslizamentos.' },
          { code: 'PL 675/2022', title: 'Programa Escola Sem Nazismo na rede municipal.' },
          { code: 'PL 589/2022', title: 'Protecao da liberdade de catedra e do professor diante de violencia no ambiente escolar.' },
          { code: 'PL 587/2022', title: 'Lei Lugar de Crianca e na Escola com semana de mutirao contra evasao escolar.' },
          { code: 'PL 586/2022', title: 'Lei Merenda e um Direito.' },
          { code: 'PL 373/2022', title: 'Abono de falta para pais e responsaveis participarem de reunioes escolares bimestrais.' },
          { code: 'PL 426/2022', title: 'Dia de Conscientizacao Contra a Mutilacao Infantil.' },
          { code: 'PL 425/2022', title: 'Campanha municipal contra a mutilacao genital intersexo nas maternidades de Sao Paulo.' },
          { code: 'PL 840/2021', title: 'Programa Municipal de Combate a Violencia Obstetrica.' },
          { code: 'PL 625/2021', title: 'Oferta de DIU e outros metodos anticoncepcionais com ampliacao de informacao na rede publica.' },
          { code: 'PL 136/2021', title: 'Encaminhamento para abrigamento emergencial e auxilio aluguel de mulheres em situacao de violencia.' },
          { code: 'PL 753/2021', title: 'Estado de emergencia climatica no municipio de Sao Paulo.' },
          { code: 'PL 443/2021', title: 'Dia Municipal da Luta Contra as Mudancas Climaticas.' },
          { code: 'PL 248/2021', title: 'Inclusao de alimentos da agricultura familiar e agroecologica em hospitais publicos.' },
          { code: 'PL 575/2021', title: 'Centro de Referencia e Apoio a Familiares e Vitimas da Violencia do Estado.' },
          { code: 'PL 493/2021', title: 'Educacao para igualdade de genero e racial nas escolas municipais.' },
          { code: 'PL 442/2021', title: 'Dia Contra o Genocidio da Juventude Negra.' },
          { code: 'PL 824/2021', title: 'Gratuidade no transporte publico para estudantes no dia de prova do ENEM.' },
          { code: 'PL 131/2021', title: 'Diretrizes do Plano Municipal de Educacao sobre igualdade racial, sexual e de genero nas escolas.' },
          { code: 'PL 61/2021', title: 'Distribuicao gratuita de tablets e chips de banda larga para alunos da rede municipal durante a pandemia.' },
          { code: 'PL 682/2021', title: 'Dia da Visibilidade da Pessoa Intersexo.' },
          { code: 'PL 134/2021', title: 'Respeito a autodeclaracao de genero nos servicos de assistencia social do municipio.' },
          { code: 'PL 856/2021', title: 'Dossie das Terceirizacoes para transparencia e monitoramento de contratos de terceirizacao.' },
        ],
      },
      {
        slug: 'estadual',
        title: 'Mandato estadual',
        subtitle: 'Assembleia Legislativa do Estado de Sao Paulo',
        sourceLabel: 'Fonte: PLs-BF-ALESP.pdf',
        periodLabel: '2023-atual',
        totalLabel: '16 PLs catalogados',
        description:
          'Uma visao direta da atuacao da Bancada Feminista na ALESP, com propostas sobre violencia domestica, educacao, racismo ambiental, trabalho e direitos LGBTQIAP+.',
        news: [
          {
            title: 'Janela partidaria altera bancadas na ALESP',
            date: '01/04/2026',
            source: 'SP2 / G1',
            url: 'https://g1.globo.com/sp/sao-paulo/sp2/video/janela-partidaria-altera-bancadas-na-alesp-14486656.ghtml',
          },
          {
            title: 'MPF manda PF abrir inquerito apos representacao da Bancada Feminista',
            date: '31/03/2026',
            source: 'G1 Sao Paulo',
            url: 'https://g1.globo.com/sp/sao-paulo/noticia/2026/03/31/mpf-manda-pf-abrir-inquerito-para-investigar-deputada-fabiana-bolsonaro-por-ter-feito-blackface-na-alesp.ghtml',
          },
          {
            title: 'Bancada Feminista do PSOL entra com pedido de liminar contra o CFM',
            date: '04/07/2025',
            source: 'Site Bancada Feminista',
            url: 'https://bancadafeministapsol.com.br/2025/07/04/bancada-feminista-do-psol-entra-com-pedido-de-liminar-contra-o-cfm/',
          },
        ],
        projects: [
          { code: 'PL 133/2023', title: 'Programa para promocao da educacao para igualdade de genero e racial nas escolas, de acordo com o curriculo paulista.' },
          { code: 'PL 134/2023', title: 'Auxilio financeiro para mulheres vitimas de violencia domestica e familiar.' },
          { code: 'PL 135/2023', title: 'Reparticao de vagas nas universidades e faculdades publicas estaduais para alunos transgeneros e intersexo.' },
          { code: 'PL 136/2023', title: 'Divulgacao de numeros telefonicos voltados a denuncia e combate a discriminacao e injuria racial.' },
          { code: 'PL 137/2023', title: 'Politica Estadual de Prevencao as Catastrofes Ambientais e de Combate ao Racismo Ambiental.' },
          { code: 'PL 585/2023', title: 'Campanha Todas Elas Vao Saber para ampliacao do acesso a informacao sobre direitos de mulheres expostas a violencia domestica.' },
          { code: 'PL 612/2023', title: 'Declaracao de utilidade publica da Associacao Aristocrata Clube, com sede na capital.' },
          { code: 'PL 809/2023', title: 'Campanha permanente contra a LGBTQIAPN+fobia e a violencia de genero nos eventos esportivos do Estado.' },
          { code: 'PL 862/2023', title: 'Politica estadual Vini Jr. de combate ao racismo nos estadios e arenas esportivas.' },
          { code: 'PL 960/2023', title: 'Politica Estadual de Protecao a Populacao LGBTQIAP+ Armario Nunca Mais.' },
          { code: 'PL 1054/2023', title: 'Politica Estadual Armario Nunca Mais com mecanismos de prevencao e combate a violencia contra a populacao LGBTQIAP+.' },
          { code: 'PL 1302/2023', title: 'Acoes para assegurar condicoes necessarias a presenca de bebes e criancas em predios publicos.' },
          { code: 'PL 1358/2023', title: 'Priorizacao de mulheres em situacao de violencia domestica no programa Emprega Sao Paulo.' },
          { code: 'PL 1419/2023', title: 'Dia Estadual da Luta Contra as Mudancas Climaticas.' },
          { code: 'PL 1427/2023', title: 'Dia Estadual da Visibilidade Bissexual.' },
          { code: 'PL 1447/2023', title: 'Instituicao do Disque Saude Mental da Mulher.' },
        ],
      },
    ],
  },

  proposalsPage: {
    title: 'Frentes de atuacao',
    intro:
      'A agenda publica da Bancada Feminista combina projeto de lei, fiscalizacao, acao judicial, abaixo-assinado e presenca nas ruas. Estas sao algumas frentes que aparecem com forca no site e nas noticias da mandata.',
    themes: [
      {
        title: 'Mulheres Vivas',
        description:
          'Campanha por medidas concretas para enfrentar o crescimento do feminicidio e da violencia domestica, com pressao popular e articulacao institucional.',
      },
      {
        title: 'Escola publica sem privatizacao',
        description:
          'Fiscalizacao de contratos, denuncia de irregularidades e acao politica em defesa da educacao publica, da merenda escolar e das condicoes de aprendizado.',
      },
      {
        title: 'Direitos LGBTQIA+',
        description:
          'Projetos e campanhas para garantir reconhecimento, protecao e acesso a direitos para a populacao LGBTQIA+ em Sao Paulo.',
      },
      {
        title: 'Cuidado, maternidade e vida digna',
        description:
          'Iniciativas ligadas ao aleitamento materno, aos direitos reprodutivos e a uma politica de cuidado que responda a vida real das mulheres.',
      },
    ],
  },

  eventsPage: {
    title: 'Agenda e mobilizacoes',
    intro: 'A Bancada combina rua, parlamento e redes. Estas entradas resumem campanhas e articulacoes recentes que podem virar frentes permanentes de engajamento no site.',
    events: [
      {
        id: 'ev-01',
        title: 'Campanha Mulheres Vivas',
        date: '2025-08-14',
        location: 'Sao Paulo e mobilizacao online',
        description: 'Abaixo-assinado e articulacao publica por estado de emergencia diante do feminicidio e da violencia domestica.',
        ctaLabel: 'Quero acompanhar',
      },
      {
        id: 'ev-02',
        title: 'Frente contra a misoginia nos espacos do forro',
        date: '2025-07-01',
        location: 'Territorios culturais e redes',
        description: 'Apoio a denuncias, enfrentamento a grupos misoginos e construcao de ambientes livres de odio.',
        ctaLabel: 'Entrar na rede',
      },
      {
        id: 'ev-03',
        title: 'Plebiscito popular e direitos sociais',
        date: '2025-07-01',
        location: 'Mobilizacao territorial',
        description: 'Debate com movimentos populares sobre jornada de trabalho, justica fiscal e defesa dos direitos sociais.',
        ctaLabel: 'Receber agenda',
      },
    ],
  },

  thematicLandings: [
    {
      slug: 'mulheres-vivas',
      type: 'abaixo-assinado',
      title: 'Mulheres Vivas: chega de palavras, queremos acoes',
      description:
        'Some-se ao abaixo-assinado por respostas concretas ao crescimento do feminicidio e da violencia domestica em Sao Paulo.',
      ctaLabel: 'Assinar a campanha',
    },
    {
      slug: 'frente-forro-sem-misoginia',
      type: 'campanha-especifica',
      title: 'Frente contra a misoginia nos espacos do forro',
      description:
        'Acompanhe e fortalezca a articulacao contra grupos misoginos e a exposicao de conteudos intimos sem consentimento.',
      ctaLabel: 'Quero fortalecer',
    },
    {
      slug: 'nosso-orgulho-e-lei',
      type: 'campanha-legislativa',
      title: 'Nosso orgulho e lei',
      description:
        'Conheca e divulgue projetos da Bancada Feminista para garantir direitos da populacao LGBTQIA+ em Sao Paulo.',
      ctaLabel: 'Quero receber materiais',
    },
  ],

  forms: {
    checkboxText: 'Eu concordo com o uso dos meus dados conforme a',
    confirmationMessage:
      'Cadastro confirmado! Obrigado por fortalecer a rede da Bancada Feminista.',
    title: 'Receba informacoes e participe da agenda',
    description:
      'Preencha seus dados para acompanhar campanhas, receber convites, fortalecer abaixo-assinados e entrar na rede de comunicacao da Bancada Feminista.',
    interests: ['Abaixo-assinados', 'Agenda de rua', 'Comunicacao digital', 'Formacao politica'],
    api: {
      provider: 'json-api',
      endpoint: leadsApiEndpoint,
      googleForms: {
        fieldIds: {
          nome: 'entry.841108454',
          nascimento: {
            year: 'entry.2078748064_year',
            month: 'entry.2078748064_month',
            day: 'entry.2078748064_day',
          },
          whatsapp: 'entry.1963593262',
          email: 'entry.1835698599',
          uf: 'entry.1397297655',
          cidade: 'entry.1434357970',
          bairro: 'entry.0000000001',
          interesses: 'entry.0000000002',
          temasPrioritarios: 'entry.0000000003',
          lgpd: 'entry.1477377412',
        },
        lgpdAcceptedValue: 'Aceito politica de privacidade',
      },
      jsonApi: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        fieldMap: {
          nome: 'name',
          whatsapp: 'phone',
          email: 'email',
          uf: 'state',
          cidade: 'city',
          bairro: 'district',
          interesses: 'interests',
          temasPrioritarios: 'priorityThemes',
          origem: 'source',
          pagina: 'page',
          lgpd: 'consent',
        },
      },
    },
  },

  privacyPolicy:
    'Ao enviar seus dados, voce autoriza o contato da equipe da Bancada Feminista para comunicacoes politicas, convites de mobilizacao e atualizacoes de campanhas, conforme a LGPD. Seus dados nao sao comercializados e podem ser removidos mediante solicitacao nos canais oficiais.',

  footer: {
    text: 'Mandatas coletivas da Bancada Feminista do PSOL na Camara Municipal de Sao Paulo e na Assembleia Legislativa, com articulacao permanente entre parlamento e mobilizacao popular.',
    instagram: 'https://www.instagram.com/bancadafeministapsol',
    instagramLabel: '@bancadafeministapsol',
  },
}

export default landingConfig