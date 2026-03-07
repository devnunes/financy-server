import 'reflect-metadata'
import { afterAll, beforeEach } from 'vitest'

const { prismaClient } = await import('@/prisma/prisma')

beforeEach(async () => {
  await prismaClient.transaction.deleteMany()
  await prismaClient.user.deleteMany()
})

afterAll(async () => {
  await prismaClient.$disconnect()
})
