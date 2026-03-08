import { describe, expect, it } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { createUserFactory } from '@/test/factories/user.factory'
import { verifyJwt } from '@/utils/jwt'

describe('AuthService.register', () => {
  it('creates a new user and returns signed tokens', async () => {
    const service = new AuthService()
    const password = 'register-password'

    const result = await service.register({
      name: 'Register User',
      email: `register-${Date.now()}@mail.com`,
      password,
    })

    expect(result.token).toBeTypeOf('string')
    expect(result.refreshToken).toBeTypeOf('string')
    expect(result.user.email).toContain('register-')

    const tokenPayload = verifyJwt(result.token)
    expect(tokenPayload.id).toBe(result.user.id)
    expect(tokenPayload.email).toBe(result.user.email)
  })

  it('throws when user already exists', async () => {
    const service = new AuthService()
    const existingUser = await createUserFactory()

    await expect(
      service.register({
        name: existingUser.name,
        email: existingUser.email,
        password: 'any-password',
      })
    ).rejects.toThrow('User already exists')
  })
})

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

  it('throws when user does not exist', async () => {
    const service = new AuthService()

    await expect(
      service.login({
        email: `not-found-${Date.now()}@mail.com`,
        password: 'any-password',
      })
    ).rejects.toThrow('User not found')
  })
})
