# FunnelOS

**AI-Native Sales Funnel OS** — An intelligent sales CRM where leads from any source are automatically scored, tracked, messaged, and closed — with full human control and swappable AI backends.

## Architecture

```
funnelos/
├── apps/
│   ├── frontend/          # React 18 + TypeScript + Vite
│   └── backend/           # Node.js + Express ES Modules
├── packages/
│   └── shared/            # Shared types, constants, enums
├── infra/
│   ├── nginx/             # Nginx configs per environment
│   └── pm2/               # PM2 ecosystem configs
├── .github/workflows/     # CI/CD pipelines
└── .env.*                 # Environment configurations
```

## Tech Stack

### Backend
- Node.js 20+ with ES Modules
- Express.js
- MariaDB with Knex.js migrations
- AI Provider Factory (Ollama, Claude, OpenAI adapters)
- JWT Authentication

### Frontend
- React 18 + TypeScript
- Vite (build)
- Tailwind CSS v4
- Framer Motion (animations)
- Tanstack Query + Table
- Zustand (state)
- React Hook Form + Zod
- Recharts

## Getting Started

### Prerequisites
- Node.js 20+
- MariaDB 10.6+
- Ollama (for local AI) or Anthropic API key

### Development Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.development .env
# Edit .env with your settings
```

3. **Start Ollama (for local AI)**
```bash
ollama pull qwen2.5:72b
ollama serve
```

4. **Set up database**
```bash
mysql -u root -e "CREATE DATABASE funnelos;"
npm run db:migrate
npm run db:seed
```

5. **Run development servers**
```bash
npm run dev
```

This starts both frontend (port 5173) and backend (port 3001).

## Environment Variables

### Development (.env.development)
```
NODE_ENV=development
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:72b
DB_HOST=localhost
JWT_SECRET=dev-secret-change-in-production
```

### Staging (.env.staging)
```
NODE_ENV=staging
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://your-vps:11434
DB_HOST=staging-db
```

### Production (.env.production - DO NOT COMMIT)
```
NODE_ENV=production
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6
DB_HOST=prod-db
JWT_SECRET=<secure-random-string>
```

## AI Provider System

FunnelOS uses a pluggable AI provider architecture. Switch between providers without code changes:

```javascript
// Backend reads AI_PROVIDER from env
// Available providers:
- ollama    (local, free)
- claude    (Anthropic API)
- openai    (OpenAI API)
- gemini    (Google AI)
- groq      (Groq API)
```

Each provider implements the same interface:
- `scoreLead(lead)` → Lead score with reasoning
- `draftMessage(lead, context)` → Drafted outreach message
- `summarizeThread(messages)` → Conversation summary
- `classifyIntent(text)` → Message intent classification

## Database Schema

Key tables:
- `leads` — Core lead records
- `lead_events` — Immutable event log
- `ai_scores` — AI scoring history
- `funnel_stages` — Configurable pipeline
- `messages` — All communications
- `provider_configs` — AI provider credentials
- `api_integrations` — External connections

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Leads
- `GET /api/leads` — List leads
- `GET /api/leads/:id` — Get lead details
- `POST /api/leads` — Create lead
- `POST /api/leads/:id/score` — Re-score with AI

### AI
- `GET /api/ai/providers` — List available providers
- `POST /api/ai/test-provider` — Test provider connection
- `POST /api/ai/set-provider` — Switch active provider
- `POST /api/ai/score` — Score a lead
- `POST /api/ai/draft-message` — Draft a message
- `POST /api/ai/classify` — Classify intent

### Webhooks
- `GET/POST /api/webhooks/meta` — Meta Lead Gen webhook
- `GET/POST /api/webhooks/whatsapp` — WhatsApp Cloud API webhook

## GitHub Workflow

| Branch | Environment | Deployment |
|--------|-------------|------------|
| `main` | Production | Manual approval required |
| `staging` | Staging | Auto-deploy on push |
| `dev/*` | Local | No auto-deploy |
| `feature/*` | — | PR to staging |
| `hotfix/*` | Production | Fast-track merge |

## Build Order (Implementation Phases)

1. ✅ Repo scaffolding + CI/CD
2. ✅ Database schema + migrations
3. ✅ AI adapter factory
4. ✅ Webhook handlers
5. ✅ Frontend shell + auth
6. ✅ Lead list view
7. ✅ Pipeline board
8. ✅ Lead detail drawer
9. ✅ Integration settings
10. ⏳ Analytics dashboard
11. ⏳ WhatsApp send feature

## License

MIT
