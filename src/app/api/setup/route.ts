import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function runSQL(sql: string) {
  await prisma.$executeRawUnsafe(sql)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  if (secret !== 'gp-setup-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await runSQL(`DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PARTNER'); EXCEPTION WHEN duplicate_object THEN null; END $$`)
    await runSQL(`DO $$ BEGIN CREATE TYPE "UploadStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED', 'DUPLICATE'); EXCEPTION WHEN duplicate_object THEN null; END $$`)

    await runSQL(`CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "email" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'PARTNER', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "User_pkey" PRIMARY KEY ("id"))`)
    await runSQL(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email")`)

    await runSQL(`CREATE TABLE IF NOT EXISTS "Partner" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "isVatRegistered" BOOLEAN NOT NULL DEFAULT false, "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "userId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Partner_pkey" PRIMARY KEY ("id"), CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE)`)
    await runSQL(`CREATE UNIQUE INDEX IF NOT EXISTS "Partner_email_key" ON "Partner"("email")`)
    await runSQL(`CREATE UNIQUE INDEX IF NOT EXISTS "Partner_userId_key" ON "Partner"("userId")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "Partner_userId_idx" ON "Partner"("userId")`)

    await runSQL(`CREATE TABLE IF NOT EXISTS "Branch" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "name" TEXT NOT NULL, "code" TEXT NOT NULL, "partnerId" TEXT NOT NULL, "revenueSharePercent" DOUBLE PRECISION NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Branch_pkey" PRIMARY KEY ("id"), CONSTRAINT "Branch_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE)`)
    await runSQL(`CREATE UNIQUE INDEX IF NOT EXISTS "Branch_code_key" ON "Branch"("code")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "Branch_partnerId_idx" ON "Branch"("partnerId")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "Branch_code_idx" ON "Branch"("code")`)

    await runSQL(`CREATE TABLE IF NOT EXISTS "CsvUpload" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "fileName" TEXT NOT NULL, "fileHash" TEXT NOT NULL, "branchId" TEXT NOT NULL, "uploadedById" TEXT NOT NULL, "recordCount" INTEGER NOT NULL, "totalGrossSales" DOUBLE PRECISION NOT NULL, "status" "UploadStatus" NOT NULL DEFAULT 'PROCESSING', "errorMessage" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CsvUpload_pkey" PRIMARY KEY ("id"), CONSTRAINT "CsvUpload_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "CsvUpload_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE)`)
    await runSQL(`CREATE UNIQUE INDEX IF NOT EXISTS "CsvUpload_fileHash_key" ON "CsvUpload"("fileHash")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "CsvUpload_branchId_idx" ON "CsvUpload"("branchId")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "CsvUpload_uploadedById_idx" ON "CsvUpload"("uploadedById")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "CsvUpload_status_idx" ON "CsvUpload"("status")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "CsvUpload_createdAt_idx" ON "CsvUpload"("createdAt")`)

    await runSQL(`CREATE TABLE IF NOT EXISTS "SalesRecord" ("id" TEXT NOT NULL DEFAULT gen_random_uuid()::text, "date" TIMESTAMP(3) NOT NULL, "csvUploadId" TEXT NOT NULL, "branchId" TEXT NOT NULL, "orderId" TEXT, "grossSales" DOUBLE PRECISION NOT NULL, "refunds" DOUBLE PRECISION NOT NULL DEFAULT 0, "netSales" DOUBLE PRECISION NOT NULL, "costOfGoods" DOUBLE PRECISION NOT NULL DEFAULT 0, "grossProfit" DOUBLE PRECISION NOT NULL, "vatAmount" DOUBLE PRECISION NOT NULL DEFAULT 0, "netGP" DOUBLE PRECISION NOT NULL, "revenueShare" DOUBLE PRECISION NOT NULL, "partnerEarnings" DOUBLE PRECISION NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SalesRecord_pkey" PRIMARY KEY ("id"), CONSTRAINT "SalesRecord_csvUploadId_fkey" FOREIGN KEY ("csvUploadId") REFERENCES "CsvUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "SalesRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE)`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "SalesRecord_date_idx" ON "SalesRecord"("date")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "SalesRecord_branchId_idx" ON "SalesRecord"("branchId")`)
    await runSQL(`CREATE INDEX IF NOT EXISTS "SalesRecord_csvUploadId_idx" ON "SalesRecord"("csvUploadId")`)

    const adminPassword = await bcrypt.hash('admin123', 12)
    const partnerPassword = await bcrypt.hash('partner123', 12)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@gpdashboard.com' },
      update: {},
      create: { email: 'admin@gpdashboard.com', password: adminPassword, name: 'Admin User', role: 'ADMIN' }
    })

    const partnerUser = await prisma.user.upsert({
      where: { email: 'partner@example.com' },
      update: {},
      create: { email: 'partner@example.com', password: partnerPassword, name: 'Demo Partner', role: 'PARTNER' }
    })

    const partner = await prisma.partner.upsert({
      where: { userId: partnerUser.id },
      update: {},
      create: { name: 'Demo Partner Co.', email: 'partner@example.com', phone: '0891234567', isVatRegistered: true, userId: partnerUser.id }
    })

    const branch1 = await prisma.branch.upsert({
      where: { code: 'BKK-01' },
      update: {},
      create: { name: 'Bangkok Siam', code: 'BKK-01', partnerId: partner.id, revenueSharePercent: 30 }
    })

    const branch2 = await prisma.branch.upsert({
      where: { code: 'CNX-01' },
      update: {},
      create: { name: 'Chiang Mai Central', code: 'CNX-01', partnerId: partner.id, revenueSharePercent: 25 }
    })

    return NextResponse.json({
      success: true,
      message: 'Database setup and seeded successfully',
      data: { admin: admin.email, partner: partnerUser.email, branches: [branch1.code, branch2.code] }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
