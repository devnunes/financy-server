import { faker } from '@faker-js/faker'
import { prismaClient } from '@/prisma/prisma'

type CreateManyTransactionFactoryInput = {
  amount: number
  description: string
  type: string
  date: Date
  userId: string
  categoryId: string
}

export async function createTransactionFactory(
  userId: string,
  categoryId: string
) {
  return prismaClient.transaction.create({
    data: {
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      date: faker.date.recent(),
      userId,
      categoryId,
    },
  })
}

export async function createManyTransactionsFactory(
  data: CreateManyTransactionFactoryInput[]
) {
  return prismaClient.transaction.createMany({ data })
}
