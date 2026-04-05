import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV } from '@/lib/csv-parser'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateNetSales, calculateVAT, calculatePartnerEarnings } from '@/lib/financial'
import crypto from 'crypto'

function findValue(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const lower = key.toLowerCase().replace(/[_\s-]/g, '')
    for (const [k, v] of Object.entries(row)) {
      if (k.toLowerCase().replace(/[_\s-]/g, '') === lower) {
        return v || ''
      }
    }
  }
  return ''
}

function parseNumber(val: string): number {
  if (!val) return 0
  const cleaned = val.replace(/[^0-9.\-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function safeDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  try {
    const d = new Date(dateStr)
    return isNaN(d.getTime()) ? new Date() : d
  } catch {
    return new Date()
  }
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const branchId = formData.get('branchId') as string

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!branchId) return NextResponse.json({ error: 'No branch selected' }, { status: 400 })

    const text = await file.text()
    const fileHash = crypto.createHash('md5').update(text).digest('hex')

    const existingUpload = await prisma.csvUpload.findUnique({ where: { fileHash } })
    if (existingUpload) {
      return NextResponse.json({ error: 'This file has already been uploaded (duplicate)' }, { status: 409 })
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { partner: true }
    })
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })

    const { rows } = parseCSV(text)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or has no data rows' }, { status: 400 })
    }

    const revenueSharePercent = branch.revenueSharePercent
    const isVatRegistered = branch.partner?.isVatRegistered || false

    // Pre-compute all records in memory
    const records: any[] = []
    let totalGrossSales = 0

    for (const row of rows) {
      const grossSales = parseNumber(findValue(row, ['gross_sales', 'grosssales', 'amount', 'total', 'net', 'chargeamount', 'charge_amount']))
      const refunds = parseNumber(findValue(row, ['refunds', 'refund', 'refundamount', 'refund_amount']))
      const costOfGoods = parseNumber(findValue(row, ['costofgoods', 'cost_of_goods', 'cost', 'cogs']))
      const dateStr = findValue(row, ['date', 'createdat', 'created_at', 'created', 'transactiondate', 'transaction_date', 'chargedat', 'charged_at'])
      const orderId = findValue(row, ['orderid', 'order_id', 'id', 'chargeid', 'charge_id', 'reference'])

      const netSales = calculateNetSales(grossSales, refunds)
      const grossProfit = netSales - costOfGoods
      const vatAmount = calculateVAT(grossProfit, isVatRegistered)
      const netGP = grossProfit - vatAmount
      const partnerEarnings = calculatePartnerEarnings(netGP, revenueSharePercent)

      totalGrossSales += grossSales

      records.push({
        date: safeDate(dateStr),
        branchId: branchId,
        orderId: orderId || null,
        grossSales,
        refunds,
        netSales,
        costOfGoods,
        grossProfit,
        vatAmount,
        netGP,
        revenueShare: revenueSharePercent,
        partnerEarnings,
      })
    }

    // Create CsvUpload first
    const csvUpload = await prisma.csvUpload.create({
      data: {
        fileName: file.name,
        fileHash,
        branchId,
        uploadedById: (session.user as any).id,
        recordCount: rows.length,
        totalGrossSales,
        status: 'PROCESSING',
      }
    })

    // Add csvUploadId to all records
    const recordsWithUploadId = records.map(r => ({ ...r, csvUploadId: csvUpload.id }))

    // Batch insert using createMany (much faster than individual creates)
    const batchSize = 500
    let imported = 0
    for (let i = 0; i < recordsWithUploadId.length; i += batchSize) {
      const batch = recordsWithUploadId.slice(i, i + batchSize)
      const result = await prisma.salesRecord.createMany({ data: batch, skipDuplicates: true })
      imported += result.count
    }

    await prisma.csvUpload.update({
      where: { id: csvUpload.id },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json({
      message: 'Imported ' + imported + ' of ' + rows.length + ' records successfully',
      count: imported,
      uploadId: csvUpload.id
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
