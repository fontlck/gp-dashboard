import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signEd } from 'next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await signEd()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await prisma.gpReport.findMany({
      where: { userId: session.user?.id },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
