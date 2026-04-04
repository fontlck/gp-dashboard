#!/bin/bash
# ============================================
# GP Report Dashboard - Auto Setup & Deploy
# ============================================
# วิธีใช้: เปิด Terminal ในโฟลเดอร์ gp-dashboard แล้วรัน:
#   chmod +x setup.sh && ./setup.sh
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   GP Report Dashboard - Setup Script     ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}[1/5]${NC} Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Generate Prisma client
echo -e "${YELLOW}[2/5]${NC} Generating Prisma client..."
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Step 3: Push schema to database
echo -e "${YELLOW}[3/5]${NC} Pushing schema to Supabase..."
npx prisma db push
echo -e "${GREEN}✓ Database schema created${NC}"
echo ""

# Step 4: Seed database
echo -e "${YELLOW}[4/5]${NC} Seeding database with sample data..."
npm run db:seed
echo -e "${GREEN}✓ Sample data seeded${NC}"
echo ""

# Step 5: Test run
echo -e "${YELLOW}[5/5]${NC} Starting dev server..."
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup complete!                        ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║   Open: http://localhost:3000             ║${NC}"
echo -e "${GREEN}║                                          ║${NC}"
echo -e "${GREEN}║   Admin:   admin@company.com / admin123  ║${NC}"
echo -e "${GREEN}║   Partner: partner_a@email.com / partner123 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
npm run dev
