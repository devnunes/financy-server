import type { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import type { SignInOutput, SignUpOutput } from '@/dtos/output/auth.output'
import type { User } from '@/prisma/generated/client'
import { prismaClient } from '@/prisma/prisma'
import { type Either, makeLeft, makeRight } from '@/utils/either'
import { comparePassword, hashPassword } from '@/utils/hash'
import { jwtUtils } from '@/utils/jwt'

export class AuthService {
  generateTokens(user: User) {
    const token = jwtUtils.signAccessToken(user.id)
    const refreshToken = jwtUtils.signRefreshToken(user.id)
    return { token, refreshToken, user }
  }

  async signUp(data: SignUpInput): Promise<Either<Error, SignUpOutput>> {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (user) return makeLeft(new Error('User already exists'))
    const createdUser = await prismaClient.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: await hashPassword(data.password),
      },
    })

    return makeRight(this.generateTokens(createdUser))
  }

  async validateUser(data: SignInInput): Promise<Either<Error, SignInOutput>> {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (!user) return makeLeft(new Error('User not found'))
    const isPasswordValid = await comparePassword(data.password, user.password)
    if (!isPasswordValid) return makeLeft(new Error('Invalid password'))

    return makeRight({ user })
  }
}
