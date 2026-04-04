import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalBranches = await prisma.branch.count()
    const totalPartners = await prisma.partner.count()
    const salesRecords = await prisma.salesRecord.findMany()
    const totalRevenue = salesRecords.reduce((sum, r) => sum + r.grossSales, 0)

    return NextResponse.json({
      totalRevenue,
      totalBranches,
      totalPartners,
      recentSales: salesRecords.slice(0, 10),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
