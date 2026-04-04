import { PrismaClient } from '@prisma/client'

const prismaClientLabel = global as unknown as { prisma: PrismaClient }

export const prisma =
  prismaClientLabel.prisma ||
  new PrismaClient()

if (process.env.NODE_ENV !== \"production\") prismaClientLabel.prisma = prisma
