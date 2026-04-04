import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// Deterministic random generator (seeded)
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate realistic sales data
interface SalesDataPoint {
  grossSales: number;
  refundsPercent: number;
  costOfGoodsPercent: number;
}

function generateSalesData(date: Date, seed: number): SalesDataPoint {
  const random = seededRandom(seed);

  // Vary by day of week (lower on weekdays, higher on weekends)
  const dayOfWeek = date.getDay();
  const weekdayMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 0.95;

  // Base amount between 5000-50000, adjusted by day of week
  const baseGrossSales = 20000 + (random() * 25000 - 12500) * weekdayMultiplier;
  const grossSales = Math.max(5000, Math.min(50000, Math.round(baseGrossSales * 100) / 100));

  // Refunds between 0-5% of gross sales
  const refundsPercent = random() * 0.05;

  // Cost of goods between 30-50% of net sales
  const costOfGoodsPercent = 0.3 + random() * 0.2;

  return {
    grossSales,
    refundsPercent,
    costOfGoodsPercent,
  };
}

// Calculate financial metrics
function calculateMetrics(
  grossSales: number,
  refundsPercent: number,
  costOfGoodsPercent: number,
  revenueSharePercent: number,
  isVatRegistered: boolean
) {
  const refunds = grossSales * refundsPercent;
  const netSales = grossSales - refunds;
  const costOfGoods = netSales * costOfGoodsPercent;
  const grossProfit = netSales - costOfGoods;

  const vatAmount = isVatRegistered ? 0 : 0; // VAT calculation simplified
  const netGP = grossProfit - vatAmount;
  const revenueShare = netGP * (revenueSharePercent / 100);
  const partnerEarnings = revenueShare - vatAmount;

  return {
    refunds: Math.round(refunds * 100) / 100,
    netSales: Math.round(netSales * 100) / 100,
    costOfGoods: Math.round(costOfGoods * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    netGP: Math.round(netGP * 100) / 100,
    revenueShare: Math.round(revenueShare * 100) / 100,
    partnerEarnings: Math.round(partnerEarnings * 100) / 100,
  };
}

async function main() {
  console.log('Starting database seed...\n');

  // Clear existing data
  await prisma.salesRecord.deleteMany();
  await prisma.csvUpload.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.user.deleteMany();

  // Create admin users
  const adminHash = await bcryptjs.hash('admin123', 10);
  const managerHash = await bcryptjs.hash('manager123', 10);
  const partnerHash = await bcryptjs.hash('partner123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      password: adminHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@company.com',
      password: managerHash,
      name: 'Manager User',
      role: 'ADMIN',
    },
  });

  console.log('✓ Created 2 admin users');

  // Create partners
  const partnerA_user = await prisma.user.create({
    data: {
      email: 'partner_a@email.com',
      password: partnerHash,
      name: 'Somchai',
      role: 'PARTNER',
    },
  });

  const partnerA = await prisma.partner.create({
    data: {
      name: 'Partner A - Somchai',
      email: 'partner_a@email.com',
      phone: '+66-2-1234-5678',
      isVatRegistered: true,
      userId: partnerA_user.id,
      joinedAt: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
    },
  });

  const partnerB_user = await prisma.user.create({
    data: {
      email: 'partner_b@email.com',
      password: partnerHash,
      name: 'Nattapong',
      role: 'PARTNER',
    },
  });

  const partnerB = await prisma.partner.create({
    data: {
      name: 'Partner B - Nattapong',
      email: 'partner_b@email.com',
      phone: '+66-2-8765-4321',
      isVatRegistered: false,
      userId: partner]Uuser.id,
    },
  });

  const partnerC_user = await prisma.user.create({
    data: {
      email: 'partner_c@email.com',
      password: partnerHash,
      name: 'Pranee',
      role: 'PARTNER',
    },
  });

  const partnerC = await prisma.partner.create({
    data: {
      name: 'Partner C - Pranee',
      email: 'partner_c@email.com',
      phone: '+66-2-5555-1111',
      isVatRegistered: true,
      userId: partnerC_user.id,
      joinedAt: new Date(new Date().setMonthnew Date().getMonth() - 6)),
    },
  });

  console.log('✓ Created 3 partners with users');

  // Create branches
  const branchSiam = await prisma.branch.create({
    data: {
      name: 'Branch Siam',
      code: 'SIAM',
      partnerId: partnerA.id,
      revenueSharePercent: 70,
      isActive: true,
    },
  });

  const branchThonglor = await prisma.branch.create({
    data: {
      name: 'Branch Thonglor',
      code: 'THONG',
      partnerId: partnerA.id,
      revenueSharePercent: 65,
      isActive: true,
    },
  });

  const branchAsoke = await prisma.branch.create({
    data: {
      name: 'Branch Asoke',
      code: 'ASOK',
      partnerId: partnerB.id,
      revenueSharePercent: 60,
      isActive: true,
    },
  });

  const branchSilom = await prisma.branch.create({
    data: {
      name: 'Branch Silom',
      code: 'SILOM',
      partnerId: partnerC.id,
      revenueSharePercent: 75,
      isActive: true,
    },
  });

  console.log('✓ Created 4 branches');

  // Generate 6 months of sales records
  const branches = [
    { branch: branchSiam, partner: partnerA, revenueShare: 70 },
    { branch: branchThonglor, partner: partnerA, revenueShare: 65 },
    { branch: branchAsoke, partner: partnerB, revenueShare: 60 },
    { branch: branchSilom, partner: partnerC, revenueShare: 75 },
  ];

  const currentDate = new Date();
  const sixMonthsAgo = new Date(currentDate);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let totalRecordsCreated = 0;
  let totalGrossSales = 0;

  for (const { branch, partner } of branches) {
    const csvHash = `${branch.id}-${Date.now()}`;

    const salesRecords = [];
    let csvTotalGrossSales = 0;
    let recordCount = 0;

    // Generate daily records for 6 months
    const currentIterDate = new Date(sixMonthsAgo);

    while (currentIterDate <= currentDate) {
      const seedValue = currentIterDate.getTime() + branch.id.charCodeAt(0);
      const salesData = generateSalesData(currentIterDate, seedValue);

      const metrics = calculateMetrics(
        salesData.grossSales,
        salesData.refundsPercent,
        salesData.costOfGoodsPercent,
        branch.revenueSharePercent,
        partner.isVatRegistered
      );

      salesRecords.push({
        date: currentIterDate,
        orderId: `ORD-${branch.code}-${currentIterDate.getTime()}`,
        grossSales: salesData.grossSales,
        refunds: metrics.refunds,
        netSales: metrics.netSales,
        costOfGoods: metrics.costOfGoods,
        grossProfit: metrics.grossProfit,
        vatAmount: metrics.vatAmount,
        netGP: metrics.netGP,
        revenueShare: metrics.revenueShare,
        partnerEarnings: metrics.partnerEarnings,
      });

      csvTotalGrossSales += salesData.grossSales;
      recordCount += 1;

      currentIterDate.setDate(currentIterDate.getDate() + 1);
    }

    // Create CSV upload record
    const csvUpload = await prisma.csvUpload.create({
      data: {
        fileName: `${branch.code}_sales_6months.csv`,
        fileHash: csvHash,
        branchId: branch.id,
        uploadedById: admin.id,
        recordCount: recordCount,
        totalGrossSales: Math.round(csvTotalGrossSales * 100) / 100,
        status: 'COMPLETED',
      },
    });

    // Create sales records
    for (const record of salesRecords) {
      await prisma.salesRecord.create({
        data: {
          ...record,
          csvUploadId: csvUpload.id,
          branchId: branch.id,
        },
      });
    }

    totalRecordsCreated += recordCount;
    totalGrossSales += csvTotalGrossSales;

    console.log(`✓ Created ${recordCount} sales records for ${branch.name}`);
  }

  console.log('\n========== Seed Summary ==========');
  console.log(`Admin Users: 2`);
  console.log(`Partners: 3`);
  console.log(`Branches: 4`);
  console.log(`Total Sales Records: ${totalRecordsCreated}`);
  console.log(`Total Gross Sales (6 months): THB ${totalGrossSales.toLocaleString('en-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  console.log(`Data Period: Last 6 months`);
  console.log('==================================\n');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
