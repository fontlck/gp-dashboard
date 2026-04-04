#!/bin/bash
# ============================================
# GP Report Dashboard - Deploy to Vercel
# ============================================
# รันหลังจาก setup.sh สำเร็จแล้ว
# วิธีใช้: chmod +x deploy.sh && ./deploy.sh
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}╔═════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   GP Report Dashboard - Deploy Script    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Read env values for Vercel
source .env

echo -e "${YELLOW}[1/3]${NC} Linking project to Vercel..."
vercel link

echo ""
echo -e "${YELLOW}[2/3]${NC} Setting environment variables..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production
echo "$DIRECT_URL" | vercel env add DIRECT_URL production
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production
echo "$VAT_RATE" | vercel env add VAT_RATE production

echo ""
echo -e "${YELLOW}[3/3]${NC} Deploying to production..."
vercel --prod

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment complete!                   ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║   IMPORTANT: After deploy, update        ║${NC}"
echo -e "${GREEN}║   NEXTAUTH_URL in Vercel settings        ║${NC}"
echo -e "${GREEN}║   to your actual deployment URL.         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
