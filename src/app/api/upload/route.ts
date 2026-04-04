import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSV } from '@/lib/csv-parser'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const { rows } = parseCSV(text)

    // Save to database
    let imported = 0
    for (const row of rows) {
      try {
        await prisma.salesRecord.create({
          data: {
            date: new Date(row['date'] || row['Date'] || new Date().toISOString()),
            grossSales: parseFloat(row['gross_sales'] || row['Gross Sales'] || '0'),
            refunds: parseFloat(row['refunds'] || row['Refunds'] || '0'),
            netSales: parseFloat(row['net_sales'] || row['Net Sales'] || '0'),
            branchId: row['branch_id'] || row['Branch ID'] || '',
          },
        })
        imported++
      } catch (e) {
        // Skip invalid rows
      }
    }

    return NextResponse.json({ message: 'Imported ' + imported + ' records', count: imported })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
