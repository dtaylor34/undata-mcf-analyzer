#!/bin/bash

# UN Data Commons Integration - Deployment Script
# This script automates the deployment process for staging and production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse arguments
ENVIRONMENT=${1:-staging}
SKIP_TESTS=${2:-false}

log_info "Starting deployment to ${ENVIRONMENT}"

# ============================================================================
# 1. Environment Validation
# ============================================================================
log_info "Validating environment..."

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    log_error "Invalid environment: ${ENVIRONMENT}"
    log_error "Usage: ./deploy.sh [staging|production] [skip-tests]"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    log_warning ".env file not found"
    log_info "Copying .env.example to .env"
    cp .env.example .env
    log_warning "Please configure .env before deploying!"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18 or higher is required (current: $(node --version))"
    exit 1
fi

log_success "Environment validation passed"

# ============================================================================
# 2. Install Dependencies
# ============================================================================
log_info "Installing dependencies..."

npm ci

log_success "Dependencies installed"

# ============================================================================
# 3. Run Tests
# ============================================================================
if [ "$SKIP_TESTS" != "skip-tests" ]; then
    log_info "Running tests..."
    
    npm run lint
    npm run test
    
    log_success "All tests passed"
else
    log_warning "Skipping tests (--skip-tests flag)"
fi

# ============================================================================
# 4. Build Cache
# ============================================================================
log_info "Building cache..."

if [ -f "catalog-ui-cache.json" ]; then
    log_info "Backing up existing cache..."
    BACKUP_NAME="catalog-ui-cache.backup.$(date +%Y%m%d_%H%M%S).json"
    cp catalog-ui-cache.json "./backups/${BACKUP_NAME}"
    log_success "Cache backed up to ./backups/${BACKUP_NAME}"
fi

npm run build:cache

log_success "Cache built successfully"

# ============================================================================
# 5. Generate Documentation
# ============================================================================
log_info "Generating documentation..."

npm run build:docs

log_success "Documentation generated"

# ============================================================================
# 6. Set Environment Variables
# ============================================================================
log_info "Setting environment variables for ${ENVIRONMENT}..."

export NODE_ENV=$ENVIRONMENT

if [ "$ENVIRONMENT" = "production" ]; then
    # Production-specific settings
    log_info "Configuring for production..."
    
    # Validate required environment variables
    if [ -z "$DC_API_KEY" ]; then
        log_error "DC_API_KEY is required for production"
        exit 1
    fi
    
    export PORT=3000
    export LOG_LEVEL=info
    export CACHE_MAX_AGE=3600000
else
    # Staging settings
    log_info "Configuring for staging..."
    export PORT=3001
    export LOG_LEVEL=debug
    export CACHE_MAX_AGE=300000
fi

log_success "Environment configured"

# ============================================================================
# 7. Database Migrations (if applicable)
# ============================================================================
# Uncomment if using a database
# log_info "Running database migrations..."
# npm run db:migrate
# log_success "Database migrations complete"

# ============================================================================
# 8. Stop Existing Process
# ============================================================================
log_info "Stopping existing process..."

if pm2 list | grep -q "undata-integration"; then
    pm2 stop undata-integration
    log_success "Existing process stopped"
else
    log_info "No existing process found"
fi

# ============================================================================
# 9. Start Application
# ============================================================================
log_info "Starting application..."

if [ "$ENVIRONMENT" = "production" ]; then
    pm2 start ecosystem.prod.config.js
else
    pm2 start ecosystem.staging.config.js
fi

# Save PM2 process list
pm2 save

log_success "Application started"

# ============================================================================
# 10. Health Check
# ============================================================================
log_info "Running health check..."

sleep 5  # Give app time to start

HEALTH_URL="http://localhost:${PORT}/health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$HEALTH_RESPONSE" = "200" ]; then
    log_success "Health check passed (HTTP ${HEALTH_RESPONSE})"
else
    log_error "Health check failed (HTTP ${HEALTH_RESPONSE})"
    log_error "Check logs with: pm2 logs undata-integration"
    exit 1
fi

# ============================================================================
# 11. Setup Log Rotation
# ============================================================================
log_info "Setting up log rotation..."

if [ ! -d "/etc/logrotate.d" ]; then
    log_warning "logrotate not available, skipping log rotation setup"
else
    sudo tee /etc/logrotate.d/undata-integration > /dev/null <<EOF
/path/to/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 undata undata
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    log_success "Log rotation configured"
fi

# ============================================================================
# 12. Setup Monitoring
# ============================================================================
log_info "Setting up monitoring..."

# Setup PM2 monitoring (if configured)
if [ -n "$PM2_PLUS_API_KEY" ]; then
    pm2 plus $PM2_PLUS_API_KEY
    log_success "PM2 Plus monitoring enabled"
fi

# ============================================================================
# 13. Summary
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════"
log_success "Deployment to ${ENVIRONMENT} completed successfully!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Application Details:"
echo "  Environment: ${ENVIRONMENT}"
echo "  Port: ${PORT}"
echo "  Process: undata-integration"
echo "  Status: $(pm2 jlist | jq -r '.[0].pm2_env.status')"
echo ""
echo "Useful Commands:"
echo "  View logs:      pm2 logs undata-integration"
echo "  Monitor:        pm2 monit"
echo "  Restart:        pm2 restart undata-integration"
echo "  Stop:           pm2 stop undata-integration"
echo "  Health check:   curl http://localhost:${PORT}/health"
echo "  Metrics:        curl http://localhost:9090/metrics"
echo ""
echo "Next Steps:"
echo "  1. Verify application is working: curl http://localhost:${PORT}/health"
echo "  2. Check logs: pm2 logs undata-integration"
echo "  3. Set up monitoring alerts"
echo "  4. Configure backups"
echo "  5. Update DNS/Load Balancer if needed"
echo ""
echo "═══════════════════════════════════════════════════════"
