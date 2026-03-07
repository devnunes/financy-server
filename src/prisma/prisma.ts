import 'dotenv/config'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/prisma/generated/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaBetterSqlite3({ url: connectionString })

export const prismaClient =
  globalForPrisma.prisma || new PrismaClient({ adapter })

globalForPrisma.prisma = prismaClient
