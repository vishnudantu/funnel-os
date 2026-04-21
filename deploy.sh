#!/bin/bash
# FunnelOS Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              FunnelOS Deployment Script                    ║"
echo "╠═══════════════════════════════════════════════════════════╣"
echo "║  Environment: $ENVIRONMENT"
echo "╚═══════════════════════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed${NC}"
        exit 1
    fi

    if [ ! -f ".env.production" ]; then
        echo -e "${RED}Error: .env.production not found${NC}"
        echo "Copy .env.production.example to .env.production and fill in your values"
        exit 1
    fi

    echo -e "${GREEN}✓ Prerequisites check passed${NC}"
}

# Build images
build() {
    echo -e "${YELLOW}Building Docker images...${NC}"
    docker-compose build
    echo -e "${GREEN}✓ Build completed${NC}"
}

# Run migrations
migrate() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose run --rm backend yarn db:migrate
    echo -e "${GREEN}✓ Migrations completed${NC}"
}

# Start services
start() {
    echo -e "${YELLOW}Starting services...${NC}"

    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.yml up -d
    else
        docker-compose -f docker-compose.yml up -d
    fi

    echo -e "${GREEN}✓ Services started${NC}"
}

# Health check
health_check() {
    echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 10

    max_retries=30
    retry=0

    while [ $retry -lt $max_retries ]; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Backend is healthy${NC}"
            return 0
        fi
        echo "  Waiting for backend... ($retry/$max_retries)"
        sleep 5
        retry=$((retry + 1))
    done

    echo -e "${RED}Backend failed to start${NC}"
    return 1
}

# Show logs
logs() {
    echo -e "${YELLOW}Service logs (press Ctrl+C to exit)${NC}"
    docker-compose logs -f
}

# Main deployment flow
main() {
    check_prerequisites
    build
    migrate
    start

    if health_check; then
        echo ""
        echo "╔═══════════════════════════════════════════════════════════╗"
        echo "║                   Deployment Successful!                   ║"
        echo "╠═══════════════════════════════════════════════════════════╣"
        echo "║  Backend:  http://localhost:3001                          ║"
        echo "║  Frontend: http://localhost:5173                          ║"
        echo "║  API:      http://localhost:3001/api                      ║"
        echo "╚═══════════════════════════════════════════════════════════╝"
        echo ""
        echo -e "${YELLOW}View logs: ./deploy.sh logs${NC}"
        echo -e "${YELLOW}Stop:      ./deploy.sh stop${NC}"
        echo -e "${YELLOW}Restart:   ./deploy.sh restart${NC}"
    fi
}

# Commands
case "${2:-}" in
    logs)
        logs
        ;;
    stop)
        echo "Stopping services..."
        docker-compose down
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    restart)
        echo "Restarting services..."
        docker-compose restart
        echo -e "${GREEN}✓ Services restarted${NC}"
        ;;
    status)
        docker-compose ps
        ;;
    *)
        main
        ;;
esac
