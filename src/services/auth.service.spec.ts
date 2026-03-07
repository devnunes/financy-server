import { describe, expect, it } from 'vitest'
import { prismaClient } from '@/prisma/prisma'
import { AuthService } from '@/services/auth.service'
import { hashPassword } from '@/utils/hash'
import { verifyJwt } from '@/utils/jwt'

describe('AuthService.login', () => {
  it('returns signed tokens when credentials are valid', async () => {
    const service = new AuthService()
    const password = '123456'

    const user = await prismaClient.user.create({
      data: {
        name: 'Test User',
        email: 'test@email.com',
        password: await hashPassword(password),
      },
    })

    const result = await service.login({
      email: user.email,
      password,
    })

    expect(result.token).toBeTypeOf('string')
    expect(result.refreshToken).toBeTypeOf('string')
    expect(result.user.email).toBe('test@email.com')

    const tokenPayload = verifyJwt(result.token)
    const refreshTokenPayload = verifyJwt(result.refreshToken)

    expect(tokenPayload.email).toBe(user.email)
    expect(refreshTokenPayload.id).toBe(user.id)
  })

  it('throws when credentials are invalid', async () => {
    const service = new AuthService()

    await prismaClient.user.create({
      data: {
        name: 'Test User',
        email: 'test@email.com',
        password: await hashPassword('123456'),
      },
    })

    await expect(
      service.login({
        email: 'test@email.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid password')
  })
})
