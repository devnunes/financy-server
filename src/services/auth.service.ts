import type { LoginInput, RegisterInput } from '@/dtos/input/auth.input'
import type { User } from '@/prisma/generated/client'
import { prismaClient } from '@/prisma/prisma'
import { comparePassword } from '@/utils/hash'
import { singJwt } from '@/utils/jwt'

export class AuthService {
  generateTokens(user: User) {
    const token = singJwt({ id: user.id, email: user.email }, '15m')
    const refreshToken = singJwt({ id: user.id, email: user.email }, '7d')
    return { token, refreshToken, user }
  }

  async register(data: RegisterInput) {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (user) throw new Error('User already exists')

    return this.generateTokens(user)
  }

  async login(data: LoginInput) {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (!user) throw new Error('User not found')
    const isPasswordValid = await comparePassword(data.password, user.password)
    console.log('isPasswordValid', isPasswordValid)
    if (!isPasswordValid) throw new Error('Invalid password')

    return this.generateTokens(user)
  }
}
