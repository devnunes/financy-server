import type { AuthInput } from '@/dtos/input/auth.input'
import type { AuthOutput } from '@/dtos/output/auth.output'
import { InvalidCredentialsError } from '@/errors'
import { prismaClient } from '@/prisma/prisma'
import { type Either, makeLeft, makeRight } from '@/utils/either'
import { comparePassword } from '@/utils/hash'

export class AuthService {
  async getValidUser(
    data: AuthInput
  ): Promise<Either<InvalidCredentialsError, AuthOutput>> {
    const user = await prismaClient.user.findUnique({
      where: {
        email: data.email,
      },
    })
    if (!user) return makeLeft(new InvalidCredentialsError())
    const isPasswordValid = await comparePassword(data.password, user.password)
    if (!isPasswordValid) return makeLeft(new InvalidCredentialsError())

    return makeRight({
      id: user.id,
      name: user.name,
      email: user.email,
    })
  }
}
