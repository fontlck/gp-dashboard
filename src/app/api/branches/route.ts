import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      include: { partner: { select: { name: true } } },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(branches)
  } catch (error) {
    return NextResponse.json([], { status: 500 })
  }
}
