import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV } from '@/lib/csv-parser'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateNetSales, calculateVAT, calculatePartnerEarnings } from '@/lib/financial'
import crypto from 'crypto'

function findValue(row: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    const lower = key.toLowerCase()
    for (const [k, v] of Object.entries(row)) {
      if (k.toLowerCase() === lower || k.toLowerCase().replace(/[_\s-]/g, '') === lower.replace(/[_\s-]/g, '')) {
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const branchId = formData.get('branchId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!branchId) {
      return NextResponse.json({ error: 'No branch selected' }, { status: 400 })
    }

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
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    const { rows } = parseCSV(text)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or has no data rows' }, { status: 400 })
    }

    const totalGrossSales = rows.reduce((sum, row) => {
      return sum + parseNumber(findValue(row, ['gross_sales', 'Gross Sales', 'amount', 'Amount', 'total', 'Total', 'net', 'Net', 'charge_amount', 'Charge Amount']))
    }, 0)

    const csvUpload = await prisma.csvUpload.create({
      data: {
        fileName: file.name,
        fileHash: fileHash,
        branchId: branchId,
        uploadedById: (session.user as any).id,
        recordCount: rows.length,
        totalGrossSales: totalGrossSales,
        status: 'PROCESSING',
      }
    })

    let imported = 0
    const revenueSharePercent = branch.revenueSharePercent
    const isVatRegistered = branch.partner?.isVatRegistered || false

    for (const row of rows) {
      try {
        const grossSales = parseNumber(findValue(row, ['gross_sales', 'Gross Sales', 'amount', 'Amount', 'total', 'Total', 'net', 'Net', 'charge_amount', 'Charge Amount']))
        const refunds = parseNumber(findValue(row, ['refunds', 'Refunds', 'refund', 'Refund', 'refund_amount', 'Refund Amount']))
        const costOfGoods = parseNumber(findValue(row, ['cost_of_goods', 'Cost of Goods', 'cost', 'Cost', 'cogs', 'COGS']))
        const dateStr = findValue(row, ['date', 'Date', 'created_at', 'Created At', 'created', 'Created', 'transaction_date', 'Transaction Date', 'charged_at', 'Charged At'])
        const orderId = findValue(row, ['order_id', 'Order ID', 'id', 'ID', 'charge_id', 'Charge ID', 'reference', 'Reference'])

        const netSales = calculateNetSales(grossSales, refunds)
        const grossProfit = netSales - costOfGoods
        const vatAmount = calculateVAT(grossProfit, isVatRegistered)
        const netGP = grossProfit - vatAmount
        const revenueShare = revenueSharePercent
        const partnerEarnings = calculatePartnerEarnings(netGP, revenueSharePercent)

        let parsedDate: Date
        try {
          parsedDate = dateStr ? new Date(dateStr) : new Date()
          if (isNaN(parsedDate.getTime())) parsedDate = new Date()
        } catch {
          parsedDate = new Date()
        }

        await prisma.salesRecord.create({
          data: {
            date: parsedDate,
            csvUploadId: csvUpload.id,
            branchId: branchId,
            orderId: orderId || null,
            grossSales,
            refunds,
            netSales,
            costOfGoods,
            grossProfit,
            vatAmount,
            netGP,
            revenueShare,
            partnerEarnings,
          }
        })
        imported++
      } catch (e) {
        console.error('Row import error:', e)
      }
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
