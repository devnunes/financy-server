import type { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import type { SignInOutput, SignUpOutput } from '@/dtos/output/auth.output'
import type { User } from '@/prisma/generated/client'
import { prismaClient } from '@/prisma/prisma'
import { type Either, makeLeft, makeRight } from '@/utils/either'
import { comparePassword, hashPassword } from '@/utils/hash'
import { signJwt } from '@/utils/jwt'

export class AuthService {
  generateTokens(user: User) {
    const token = signJwt({ id: user.id, email: user.email }, '7d')
    const refreshToken = signJwt({ id: user.id, email: user.email }, '14d')
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

  async signIn(data: SignInInput): Promise<Either<Error, SignInOutput>> {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (!user) return makeLeft(new Error('User not found'))
    const isPasswordValid = await comparePassword(data.password, user.password)
    if (!isPasswordValid) return makeLeft(new Error('Invalid password'))

    return makeRight(this.generateTokens(user))
  }
}
