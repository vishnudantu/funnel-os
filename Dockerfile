# FunnelOS Production Docker Image
FROM node:20-alpine

# Install corepack for Yarn
RUN corepack enable && corepack prepare yarn@stable --activate

WORKDIR /app

# Copy package files
COPY package.json .yarnrc.yml yarn.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
RUN yarn build:frontend

# Expose ports
EXPOSE 3001 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start with PM2
CMD ["yarn", "start"]
