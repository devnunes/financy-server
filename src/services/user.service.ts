import { prismaClient } from '@/prisma/prisma'
import { hashPassword } from '@/utils/hash'

export class UserService {
  async createUser(name: string, email: string, password: string) {
    return prismaClient.user.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
      },
    })
  }

  async getUserById(id: string) {
    const user = await prismaClient.user.findUnique({
      where: {
        id,
      },
    })
    if (!user) throw new Error('User not found')
    return user
  }
}
