import { faker } from '@faker-js/faker'
import { prismaClient } from '@/prisma/prisma'

export async function createCategoryFactory(userId: string) {
  return prismaClient.category.create({
    data: {
      title: faker.lorem.word(),
      description: faker.lorem.sentence(),
      icon: faker.word.noun(),
      color: faker.color.human(),
      userId,
    },
  })
}
