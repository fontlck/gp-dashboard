import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateNetSales, calculateVAT, calculatePartnerEarnings } from '@/lib/financial'
import crypto from 'crypto'

export const maxDuration = 60

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        current += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
  }
  result.push(current.trim())
  return result
}

function parseOPNCSV(text: string): { headers: string[], rows: Record<string, string>[] } {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => { row[h] = values[idx] || '' })
    rows.push(row)
  }
  return { headers, rows }
}

function getCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key]
  }
  return ''
}

function parseNum(val: string): number {
  if (!val) return 0
  const n = parseFloat(val.replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? 0 : n
}

function safeDate(s: string): Date {
  if (!s) return new Date()
  try { const d = new Date(s); return isNaN(d.getTime()) ? new Date() : d } catch { return new Date() }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const branchId = formData.get('branchId') as string
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!branchId) return NextResponse.json({ error: 'No branch selected' }, { status: 400 })

    const text = await file.text()
    const fileHash = crypto.createHash('md5').update(text).digest('hex')

    const existing = await prisma.csvUpload.findUnique({ where: { fileHash } })
    if (existing) return NextResponse.json({ error: 'Duplicate file - already uploaded' }, { status: 409 })

    const branch = await prisma.branch.findUnique({ where: { id: branchId }, include: { partner: true } })
    if (!branch) return NextResponse.json({ error: 'Branch not found' }, { status: 404 })

    const { headers: csvHeaders, rows } = parseOPNCSV(text)
    if (rows.length === 0) return NextResponse.json({ error: 'CSV has no data rows' }, { status: 400 })

    const isOPN = csvHeaders.includes('livemode') || csvHeaders.includes('funding_amount')
    const revShare = branch.revenueSharePercent
    const isVat = branch.partner?.isVatRegistered || false

    const records: any[] = []
    let totalGross = 0

    for (const row of rows) {
      let grossSales: number, refunds: number, costOfGoods: number, dateStr: string, orderId: string

      if (isOPN) {
        grossSales = parseNum(getCol(row, 'amount'))
        refunds = parseNum(getCol(row, 'refunded_amount'))
        costOfGoods = parseNum(getCol(row, 'fee')) + parseNum(getCol(row, 'fee_vat'))
        dateStr = getCol(row, 'created_at')
        orderId = getCol(row, 'id')
      } else {
        grossSales = parseNum(getCol(row, 'gross_sales', 'Gross Sales', 'amount', 'Amount', 'total', 'Total'))
        refunds = parseNum(getCol(row, 'refunds', 'Refunds', 'refund_amount'))
        costOfGoods = parseNum(getCol(row, 'cost_of_goods', 'Cost of Goods', 'cost', 'cogs'))
        dateStr = getCol(row, 'date', 'Date', 'created_at', 'transaction_date')
        orderId = getCol(row, 'order_id', 'Order ID', 'id', 'reference')
      }

      const netSales = calculateNetSales(grossSales, refunds)
      const grossProfit = netSales - costOfGoods
      const vatAmount = calculateVAT(grossProfit, isVat)
      const netGP = grossProfit - vatAmount
      const partnerEarnings = calculatePartnerEarnings(netGP, revShare)
      totalGross += grossSales

      records.push({
        date: safeDate(dateStr),
        branchId,
        orderId: orderId || null,
        grossSales,
        refunds,
        netSales,
        costOfGoods,
        grossProfit,
        vatAmount,
        netGP,
        revenueShare: revShare,
        partnerEarnings,
      })
    }

    const csvUpload = await prisma.csvUpload.create({
      data: {
        fileName: file.name, fileHash, branchId,
        uploadedById: (session.user as any).id,
        recordCount: rows.length, totalGrossSales: totalGross,
        status: 'PROCESSING',
      }
    })

    const withId = records.map(r => ({ ...r, csvUploadId: csvUpload.id }))
    let imported = 0
    for (let i = 0; i < withId.length; i += 500) {
      const batch = withId.slice(i, i + 500)
      const res = await prisma.salesRecord.createMany({ data: batch, skipDuplicates: true })
      imported += res.count
    }

    await prisma.csvUpload.update({ where: { id: csvUpload.id }, data: { status: 'COMPLETED' } })

    return NextResponse.json({
      message: 'Imported ' + imported + ' of ' + rows.length + ' records',
      count: imported,
      uploadId: csvUpload.id,
      detected: isOPN ? 'OPN Payments format' : 'Generic CSV format',
      columns: csvHeaders.slice(0, 10),
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
