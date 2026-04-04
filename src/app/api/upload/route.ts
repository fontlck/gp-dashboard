import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV } from '@/lib/csv-parser'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { calculateNetSales, calculateVAT, calculatePartnerEarnings } from '@/lib/financial'
import crypto from 'crypto'

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
      return NextResponse.json({ error: 'No branchId provided' }, { status: 400 })
    }

    const text = await file.text()
    const fileHash = crypto.createHash('md5').update(text).digest('hex')

    const existingUpload = await prisma.csvUpload.findUnique({ where: { fileHash } })
    if (existingUpload) {
      return NextResponse.json({ error: 'This file has already been uploaded' }, { status: 409 })
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { partner: true }
    })
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 })
    }

    const { rows } = parseCSV(text)
    const totalGrossSales = rows.reduce((sum, row) => {
      return sum + parseFloat(row['gross_sales'] || row['Gross Sales'] || '0')
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
        const grossSales = parseFloat(row['gross_sales'] || row['Gross Sales'] || '0')
        const refunds = parseFloat(row['refunds'] || row['Refunds'] || '0')
        const costOfGoods = parseFloat(row['cost_of_goods'] || row['Cost of Goods'] || '0')
        const netSales = calculateNetSales(grossSales, refunds)
        const grossProfit = netSales - costOfGoods
        const vatAmount = calculateVAT(grossProfit, isVatRegistered)
        const netGP = grossProfit - vatAmount
        const revenueShare = revenueSharePercent
        const partnerEarnings = calculatePartnerEarnings(netGP, revenueSharePercent)

        await prisma.salesRecord.create({
          data: {
            date: new Date(row['date'] || row['Date'] || new Date().toISOString()),
            csvUploadId: csvUpload.id,
            branchId: branchId,
            orderId: row['order_id'] || row['Order ID'] || null,
            grossSales: grossSales,
            refunds: refunds,
            netSales: netSales,
            costOfGoods: costOfGoods,
            grossProfit: grossProfit,
            vatAmount: vatAmount,
            netGP: netGP,
            revenueShare: revenueShare,
            partnerEarnings: partnerEarnings,
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
      message: 'Imported ' + imported + ' records',
      count: imported,
      uploadId: csvUpload.id
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
