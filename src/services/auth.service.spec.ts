import { describe, expect, it } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { createUserFactory } from '@/test/factories/user.factory'
import { verifyJwt } from '@/utils/jwt'

describe('AuthService.login', () => {
  it('returns signed tokens when credentials are valid', async () => {
    const service = new AuthService()
    const password = 'valid-password'
    const user = await createUserFactory({
      password,
    })

    const result = await service.login({
      email: user.email,
      password,
    })

    expect(result.token).toBeTypeOf('string')
    expect(result.refreshToken).toBeTypeOf('string')
    expect(result.user.email).toBe(user.email)

    const tokenPayload = verifyJwt(result.token)
    const refreshTokenPayload = verifyJwt(result.refreshToken)

    expect(tokenPayload.email).toBe(user.email)
    expect(refreshTokenPayload.id).toBe(user.id)
  })

  it('throws when credentials are invalid', async () => {
    const service = new AuthService()

    const user = await createUserFactory()
    await expect(
      service.login({
        email: user.email,
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid password')
  })
})
