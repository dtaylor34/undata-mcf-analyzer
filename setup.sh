#!/bin/bash

# UN Data Commons Integration - Complete Setup Script
# This script automates all critical updates from the EXECUTION_GUIDE.md

echo "🌍 UN Data Commons Integration - Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a React project
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from your React project root directory"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Creating directory structure...${NC}"
mkdir -p src/undata-integration
mkdir -p src/components
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

echo -e "${BLUE}📄 Step 2: Checking for required files...${NC}"

# Check if files exist in outputs directory
OUTPUTS_DIR="/mnt/user-data/outputs"

if [ -f "$OUTPUTS_DIR/config.dev.js" ]; then
    echo -e "${GREEN}✅ config.dev.js found${NC}"
    cp "$OUTPUTS_DIR/config.dev.js" src/undata-integration/
else
    echo -e "${YELLOW}⚠️  config.dev.js not found in outputs${NC}"
fi

if [ -f "$OUTPUTS_DIR/data-layer.js" ]; then
    echo -e "${GREEN}✅ data-layer.js found${NC}"
    cp "$OUTPUTS_DIR/data-layer.js" src/undata-integration/
else
    echo -e "${YELLOW}⚠️  data-layer.js not found${NC}"
fi

if [ -f "$OUTPUTS_DIR/App-enhanced.jsx" ]; then
    echo -e "${GREEN}✅ App-enhanced.jsx found${NC}"
    echo "Do you want to replace your current App.jsx? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        [ -f "src/App.jsx" ] && cp src/App.jsx src/App.jsx.backup
        cp "$OUTPUTS_DIR/App-enhanced.jsx" src/App.jsx
        echo -e "${GREEN}✅ App.jsx replaced (backup created)${NC}"
    else
        echo -e "${YELLOW}⏭️  Skipped App.jsx replacement${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  App-enhanced.jsx not found${NC}"
fi

if [ -f "$OUTPUTS_DIR/App.css" ]; then
    echo -e "${GREEN}✅ App.css found${NC}"
    [ -f "src/App.css" ] && cp src/App.css src/App.css.backup
    cp "$OUTPUTS_DIR/App.css" src/
    echo -e "${GREEN}✅ App.css replaced${NC}"
else
    echo -e "${YELLOW}⚠️  App.css not found${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Step 3: Setting up environment variables...${NC}"

if [ ! -f ".env" ]; then
    if [ -f "$OUTPUTS_DIR/.env.example" ]; then
        cp "$OUTPUTS_DIR/.env.example" .env
        echo -e "${GREEN}✅ .env created from example${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your actual API key${NC}"
    else
        cat > .env << 'EOF'
REACT_APP_DC_API_KEY=your_actual_api_key_here
REACT_APP_DC_API_URL=https://datacommons.undata.org/api
REACT_APP_STAT_API_URL=https://data.un.org/api/v1
REACT_APP_DEBUG=true
EOF
        echo -e "${GREEN}✅ .env created with template${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your actual API key${NC}"
    fi
else
    echo -e "${GREEN}✅ .env already exists${NC}"
fi

echo ""
echo -e "${BLUE}📚 Step 4: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo -e "${BLUE}🧪 Step 5: Verifying installation...${NC}"

# Check critical files
ERRORS=0

if [ ! -f "src/undata-integration/data-layer.js" ]; then
    echo -e "${RED}❌ Missing: src/undata-integration/data-layer.js${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "src/undata-integration/config.dev.js" ]; then
    echo -e "${RED}❌ Missing: src/undata-integration/config.dev.js${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "src/App.jsx" ]; then
    echo -e "${RED}❌ Missing: src/App.jsx${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "src/App.css" ]; then
    echo -e "${RED}❌ Missing: src/App.css${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Missing: .env${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All critical files verified${NC}"
else
    echo -e "${RED}❌ $ERRORS critical file(s) missing${NC}"
fi

echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Data Commons API key"
echo "2. Run: npm start"
echo "3. Open: http://localhost:3000"
echo ""
echo -e "${YELLOW}⚠️  Remember to restart dev server after editing .env${NC}"
echo ""
