import { faker } from '@faker-js/faker'
import type { CreateUserInput } from '@/dtos/input/user.input'
// import type { CreateUserOutput } from '@/dtos/input/user.output'
import type { UserModel } from '@/models/user.model'
import { prismaClient } from '@/prisma/prisma'
import { hashPassword } from '@/utils/hash'

export async function createUserFactory(
  overrides?: Partial<CreateUserInput>
): Promise<UserModel> {
  const generatedPassword = faker.internet.password()

  return prismaClient.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      ...overrides,
      password: await hashPassword(overrides?.password ?? generatedPassword),
    },
  })
}
