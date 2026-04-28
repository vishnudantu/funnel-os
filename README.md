# Saleduct

**Production-Ready AI-Native Sales Platform** — An intelligent sales CRM where leads from any source are automatically scored, tracked, messaged, and closed with full human control and swappable AI backends.

![Saleduct](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Capabilities
- **Multi-Tenant Architecture** - Complete organization isolation with role-based access control
- **AI-Powered Lead Scoring** - Automatic lead qualification using Claude, GPT-4, or local Ollama
- **Omnichannel Integration** - Meta, Google Ads, WhatsApp, SMS, Email in one platform
- **Pipeline Management** - Visual Kanban board with customizable funnel stages
- **Smart Automation** - Auto-advance leads based on AI-determined intent
- **Real-Time Analytics** - Conversion rates, pipeline velocity, revenue forecasting

### Integrations (14+ Providers)
| Category | Providers |
|----------|-----------|
| Lead Sources | Meta Lead Ads, Google Ads |
| Messaging | WhatsApp Cloud API, Twilio SMS |
| Notifications | Slack, Microsoft Teams |
| Scheduling | Calendly, Cal.com |
| Automation | Zapier, Make (Integromat) |
| CRM | Salesforce, HubSpot |
| Analytics | Google Analytics |
| Custom | REST API with webhooks |

## Quick Start

### Prerequisites
- Node.js 20+
- MySQL 8.0+ or MariaDB 10.6+
- Git

### 1. Clone & Install
```bash
git clone https://github.com/vishnudantu/saleduct.git
cd saleduct
npm install
```

### 2. Configure Environment
```bash
cp .env.development .env
# Edit .env with your database credentials
```

### 3. Setup Database
```bash
mysql -u root -p -e "CREATE DATABASE saleduct;"
npm run db:migrate
```

### 4. Initialize Super Admin
```bash
npm run init-admin
```

Default credentials (change immediately!):
- **Email:** `admin@saleduct.com`
- **Password:** `Saleduct@2026!SecureAdmin`

### 5. Start Development
```bash
npm run dev
```

Access the application at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## Production Deployment

### Environment Variables (.env.production)
```bash
# Server
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.saleduct.com

# Database
DB_HOST=prod-db-host
DB_PORT=3306
DB_USER=saleduct_prod
DB_PASSWORD=<secure-password>
DB_NAME=saleduct

# Security (generate with: openssl rand -hex 32)
JWT_SECRET=<64-character-random-string>
INTEGRATION_ENCRYPTION_KEY=<64-character-random-string>

# AI Provider (choose one)
AI_PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6

# Or use local Ollama
# AI_PROVIDER=ollama
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=qwen2.5:72b

# Session
SESSION_TIMEOUT=7d
MAX_LOGIN_ATTEMPTS=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (for invitations)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
FROM_EMAIL=noreply@saleduct.com

# WhatsApp (optional)
WHATSAPP_PHONE_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=

# Slack (optional)
SLACK_WEBHOOK_URL=
```

### Production Checklist
- [ ] Database backups configured (daily automated)
- [ ] SSL certificates installed
- [ ] Firewall rules configured (ports 80, 443, 3306)
- [ ] Environment variables secured (not in version control)
- [ ] Rate limiting enabled
- [ ] Monitoring/alerting configured
- [ ] Log aggregation setup
- [ ] Super admin password changed from default
- [ ] API keys rotated
- [ ] CORS configured for production domain

### Deploy with Docker
```bash
# Build images
docker-compose -f docker-compose.yml build

# Run migrations
docker-compose run --rm backend npm run db:migrate

# Start services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

## Architecture

### Backend (Node.js + Express)
```
apps/backend/
├── src/
│   ├── routes/          # API endpoints (REST)
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, validation, error handling
│   ├── db/
│   │   ├── migrations/  # Database schema versions
│   │   └── connection.js # Knex.js setup
│   └── index.js         # Express app entry
```

### Frontend (React + TypeScript)
```
apps/frontend/
├── src/
│   ├── pages/           # Route components
│   ├── components/      # Reusable UI components
│   ├── lib/
│   │   ├── api.ts       # API client
│   │   └── utils.ts     # Helpers
│   ├── hooks/           # Custom React hooks
│   └── App.tsx          # Main router
```

### Database Schema
```
organizations          - Multi-tenant isolation
├── users              - Platform users
├── organization_memberships - User roles per org
├── subscriptions      - Billing/plans
├── leads              - Lead records
├── lead_events        - Immutable activity log
├── ai_scores          - AI scoring history
├── funnel_stages      - Pipeline configuration
├── lead_stages        - Lead-to-stage assignments
├── messages           - Communications
├── api_integrations   - External connections
├── integration_events - Integration audit log
├── webhook_logs       - Webhook debugging
└── provider_configs   - AI provider credentials
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/switch-org` | Switch organization context |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads (paginated) |
| GET | `/api/leads/:id` | Get lead details |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/score` | Trigger AI scoring |

### Integrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/integrations` | List integrations |
| GET | `/api/integrations/templates` | Available templates |
| POST | `/api/integrations` | Create integration |
| PUT | `/api/integrations/:id` | Update integration |
| DELETE | `/api/integrations/:id` | Delete integration |
| POST | `/api/integrations/:id/toggle` | Activate/deactivate |
| POST | `/api/integrations/:id/test` | Test connection |
| POST | `/api/integrations/webhooks/:provider` | Webhook handler |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | List user's orgs |
| POST | `/api/organizations` | Create org |
| PUT | `/api/organizations/:id` | Update org |
| GET | `/api/organizations/:id/members` | List members |
| POST | `/api/organizations/:id/members` | Invite member |

## Security

- **JWT Authentication** - 7-day token expiry with refresh
- **Password Hashing** - bcrypt with 12 rounds
- **Credential Encryption** - AES-256-GCM for API keys
- **SQL Injection Prevention** - Parameterized queries via Knex
- **XSS Prevention** - React escapes by default
- **Rate Limiting** - 100 requests per 15 minutes per IP
- **CORS** - Configured for allowed origins only
- **Multi-Tenant Isolation** - Organization-scoped queries

## Development

### Scripts
```bash
npm run dev           # Start both frontend & backend
npm run dev:frontend  # Frontend only (port 5173)
npm run dev:backend   # Backend only (port 3001)
npm run build         # Build for production
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed sample data
npm run init-admin    # Create super admin user
npm run lint          # ESLint check
npm run typecheck     # TypeScript validation
```

### Testing
```bash
npm run test          # Run test suite
npm run test:coverage # With coverage report
```

## Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Verify database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'saleduct'"

# Check .env credentials
cat .env | grep DB_
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Migration Errors
```bash
# Reset migrations (development only!)
mysql -u root -p saleduct -e "DROP TABLE knex_migrations"
npm run db:migrate
```

## License

MIT License - See [LICENSE](LICENSE) for details.

## Support

For issues and feature requests, please use [GitHub Issues](https://github.com/vishnudantu/saleduct/issues).

---

Built with React 18, Node.js 20, Express, MySQL/MariaDB, and AI excellence.
