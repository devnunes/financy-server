import { faker } from '@faker-js/faker'
import { prismaClient } from '@/prisma/prisma'

export async function createTransactionFactory(userId: string) {
  return prismaClient.transaction.create({
    data: {
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      date: faker.date.recent(),
      userId,
    },
  })
}
