# PharmaRoute 🗺️💊

**PharmaRoute** é um sistema completo de roterização inteligente e gestão de relacionamento farmacêutico (CRM de Campo) projetado para otimizar operações comerciais de distribuidoras, laboratórios e indústrias farmacêuticas.

🚀 **Deploy Pronto** | 📱 **Mobile-First** | 🗺️ **Geolocalização Integrada**
 
---

## 🎯 Visão Geral do Projeto

O PharmaRoute foi criado para resolver a ineficiência logística das equipes de vendas externas. Ele divide a operação em duas frentes integradas em tempo real:

1. **Visão do Agente (Mobile):** Roteirização inteligente baseada em localização, histórico consolidado de visitas da farmácia, check-ins no local e adição rápida de novos alvos (geocoding reverso via Nominatim).
2. **Visão do Gestor (Desktop):** "Centro de Comando" com visão macro de KPIs de negócios, eficiência por agente, controle do território (raio de atuação no Leaflet) e cronograma da equipe.

## 🛠️ Stack Tecnológico

O projeto opera em uma arquitetura monorepo gerenciada via **NPM Workspaces**, separando claramente as responsabilidades:

### Frontend (`apps/frontend`)
- **React.js 19** + **Vite** (SWC)
- **Tailwind CSS v4** para estilização utilitária de alta performance
- **Framer Motion** para animações fluidas de UI
- **React Leaflet** para mapeamento interativo (OpenStreetMap)
- **Lucide React** para iconografia
- Hospedagem recomendada: **Vercel**

### Backend API (`apps/api`)
- **Node.js** + **Express**
- **Zod** para validação de esquemas e payload
- Tipagem rigorosa com **TypeScript** e build `tsx`
- **Helmet** e **CORS** pré-configurados para a segurança do tráfego
- Hospedagem recomendada: **Railway** / **Render**

### Banco de Dados & Autenticação
- **Supabase** (PostgreSQL) com Row Level Security (RLS) habilitado.
- Gatilhos SQL (`Triggers`) para gerenciamento interno de estados operacionais e criação de profiles de usuários.

---

## 🚀 Como Executar Localmente

Siga estas instruções para configurar e rodar o ambiente de desenvolvimento local na sua máquina.

### 1. Requisitos
- Node.js `v18+`
- Conta no [Supabase](https://supabase.com/)

### 2. Configurando o Banco de Dados (Supabase)
1. Crie um novo projeto no Supabase.
2. Vá até a aba "SQL Editor".
3. Copie o conteúdo do arquivo `supabase/migrations/20260313042521_initial_schema.sql` (e em seguida o `_fix_auth_trigger.sql`) e execute. Isso criará toda a estrutura de tabelas, políticas de RLS (Row Level Security) e gatilhos de funcionamento da API.

### 3. Configurando as Variáveis de Ambiente
Na raiz da API e do Frontend, você precisará configurar os `.env` baseado nos arquivos base.

**API:**
Renomeie `/apps/api/.env.example` para `/apps/api/.env` e preencha:
```env
SUPABASE_URL=sua_url_do_projeto
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PORT=4000
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
REQUEST_TIMEOUT_MS=15000
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=500
AUTH_RATE_LIMIT_MAX=20
```

**Frontend:**
Renomeie `/apps/frontend/.env.example` para `/apps/frontend/.env.local` e preencha:
```env
VITE_SUPABASE_URL=sua_url_do_projeto
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_API_URL=http://localhost:4000
```

### 4. Instalando dependências e rodando
Na pasta raiz do projeto (onde está o `package.json` principal), instale os pacotes de todos os workspaces de uma vez:
```bash
npm install
```

Inicie ambos os servidores (Frontend e API) em paralelo:
```bash
npm run dev
```
- Frontend rodará em: `http://localhost:3000`
- API Backend rodará em: `http://localhost:4000`

---

## 🏗️ Populando o Banco (Mock Data)

Para testar o sistema com dados visuais (para uma Demo), você pode usar os scripts utilitários nativos em `/scripts`. 

Eles importarão milhares de farmácias para o banco e criarão o histórico de interações. *Lembre-se que eles dependerão das suas chaves de ambiente salvos em `apps/api/.env`.*

```bash
# 1. Cria os perfis de Gestor e Agente
node scripts/create-users.mjs

# 2. (OPCIONAL) Importa a base gigantesca em CSV de farmácias (Requer um CSV na sua máquina)
# node scripts/import-pharmacies.mjs

# 3. Gera visitas e agendamentos realistas para alimentar o Dashboard e Mapas
node scripts/seed-demo.mjs
```

> Com os dados injetados, você pode agora acessar com os dados criados pelo script (ex: `gestor@pharmaroute.com` e a senha gerada).

---

## 📄 Estrutura de Diretórios
```text
pharmaroute/
├── apps/
│   ├── api/                   # Backend Express & Lógica de Negócios
│   └── frontend/              # Interface Web/Mobile React
├── scripts/                   # Módulos Node isolados para data seeding e migrações raw 
├── data/                      # Datasets sanitizados para demo pública
├── supabase/                  # Dumps e schemas SQL primários e correções
└── package.json               # Configuração do Workspace Monorepo principal
```

---

## 🌍 Deploy MVP (100% Free)

- Frontend: **Vercel (Hobby)**
- Backend API: **Render (Free Web Service)**
- Banco/Auth: **Supabase Free**

### Deploy do Frontend (Vercel)
```bash
vercel --cwd apps/frontend --prod --yes
```

### Deploy da API (Render)
1. Crie o serviço usando `render.yaml`.
2. Faça deploy:
```bash
render deploys create <service-id>
```

Mais detalhes em: `docs/ops/deploy-rollback.md`.

---

## 🧾 Origem dos Dados de Farmácias

Os dados utilizados no MVP foram consolidados a partir de bases públicas da Receita Federal e enriquecidos com geocoding (lat/lon) para uso de mapa/roteirização.

### O que foi feito
- Limpeza e padronização dos registros.
- Geocodificação de endereços para obtenção de latitude/longitude.
- Geração de duas bases sanitizadas para demonstração pública do MVP:
  - `data/public/farmacias_unicas_base_2026_02_com_latlon_sanitized.csv`
  - `data/public/farmacias_rf_ativas_2026_02_com_latlon_sanitized.csv`

### Por que os dados completos não estão no repositório
Mesmo sendo dados de origem pública, a versão bruta contém campos que não são necessários para demonstrar o MVP (ex.: identificadores completos e contatos diretos).  
Para reduzir risco de compliance e exposição desnecessária, o repositório mantém apenas as versões sanitizadas e o processo de geração.
