# FunnelOS Quick Start Guide

## Prerequisites

- Node.js 20+
- Yarn (enabled via corepack)
- Docker & Docker Compose (for containerized deployment)
- MariaDB 10.11+ (for local development)

---

## Option 1: Local Development

### 1. Clone and Install

```bash
git clone https://github.com/vishnudantu/funnel-os.git
cd funnelos
corepack enable
yarn install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.development .env.local

# Edit with your values:
# - AI_PROVIDER: claude or ollama
# - CLAUDE_API_KEY: your Anthropic API key (if using Claude)
# - DB_HOST, DB_USER, DB_PASSWORD: your MariaDB credentials
```

### 3. Start Database

```bash
# Option A: Docker
docker run -d --name funnelos-db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=funnelos \
  -e MYSQL_USER=funnelos \
  -e MYSQL_PASSWORD=funnelos \
  -p 3306:3306 \
  mariadb:10.11

# Option B: Local MariaDB installation
```

### 4. Run Migrations

```bash
cd apps/backend
yarn db:migrate
```

### 5. Start Development Servers

```bash
# From project root
yarn dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## Option 2: Docker Deployment (Recommended for Production)

### 1. Configure Environment

```bash
# Copy and edit production environment
cp .env.production.example .env.production

# Generate secure secrets:
# JWT Secret: openssl rand -hex 32
# DB Password: openssl rand -base64 32
```

### 2. Deploy with Docker Compose

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production
```

### 3. View Logs

```bash
./deploy.sh logs
```

### 4. Access Application

- Frontend: http://localhost
- Backend API: http://localhost/api
- Health Check: http://localhost/health

---

## Option 3: PM2 Deployment (VPS)

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Configure and Start

```bash
# Install dependencies
yarn install --production

# Run migrations
cd apps/backend && yarn db:migrate

# Start with PM2
pm2 start infra/pm2/production.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 3. Setup Nginx

```bash
# Copy nginx config
sudo cp infra/nginx/production.conf /etc/nginx/sites-available/funnelos
sudo ln -s /etc/nginx/sites-available/funnelos /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d funnelos.example.com
```

---

## First-Time Setup

### 1. Create Super Admin

After deployment, create the first super admin:

```bash
# Connect to database
mysql -u funnelos -p funnelos

# Create super admin user (replace values)
INSERT INTO users (id, name, email, password_hash, is_super_admin)
VALUES (
  UNHEX(REPLACE(UUID(), '-', '')),
  'Admin',
  'admin@example.com',
  '$2a$10$...', -- bcrypt hash of your password
  1
);
```

### 2. Default Credentials

If using the seed data:
- Email: admin@funnelos.com
- Password: Check the seed file for the hash

---

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development`, `staging`, `production` |
| `PORT` | No | Backend port (default: 3001) |
| `DB_HOST` | Yes | MariaDB host |
| `DB_PORT` | No | MariaDB port (default: 3306) |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `DB_NAME` | No | Database name (default: funnelos) |
| `JWT_SECRET` | Yes | JWT signing secret |
| `AI_PROVIDER` | No | `claude` or `ollama` (default: ollama) |
| `CLAUDE_API_KEY` | If Claude | Anthropic API key |
| `CLAUDE_MODEL` | No | Claude model (default: claude-sonnet-4-6) |
| `OLLAMA_BASE_URL` | If Ollama | Ollama API URL |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: http://localhost:3001) |

---

## Troubleshooting

### Database Connection Failed

```bash
# Check MariaDB is running
docker ps | grep funnelos-db

# View database logs
docker logs funnelos-db
```

### Backend Won't Start

```bash
# Check environment variables
cat .env.production

# View backend logs
docker logs funnelos-backend
```

### Frontend Shows Blank Page

```bash
# Check API connectivity
curl http://localhost:3001/health

# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

## Next Steps

1. **Configure AI Provider**: Set up Claude API or Ollama
2. **Setup WhatsApp**: Configure WhatsApp Business API for messaging
3. **Setup Meta Ads**: Connect Meta Ads for lead import
4. **Invite Team**: Use organization settings to invite team members

For detailed documentation, see [README.md](./README.md).
