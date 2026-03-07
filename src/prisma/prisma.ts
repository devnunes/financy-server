import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { env } from '@/env'
import { PrismaClient } from '@/prisma/generated/client'

type PrismaGlobal = {
  prisma?: PrismaClient
}

const globalForPrisma = globalThis as PrismaGlobal

function getDatabaseUrl() {
  const databaseUrl = env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }
  return databaseUrl
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: getDatabaseUrl() })
  return new PrismaClient({ adapter })
}

function getPrismaClient() {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createPrismaClient()

  return globalForPrisma.prisma
}

export const prismaClient = getPrismaClient()
