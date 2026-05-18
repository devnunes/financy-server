import { describe, expect, it } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { createUserFactory } from '@/test/factories/user.factory'
import { isLeft, isRight, unwrapEither } from '@/utils/either'

describe('AuthService.signUp', () => {
  it('throws when user already exists', async () => {
    const service = new AuthService()
    const existingUser = await createUserFactory()
    const result = await service.getValidUser({
      name: existingUser.name,
      email: existingUser.email,
      password: 'any-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })
})

describe('AuthService.signIn', () => {
  it('returns the user when credentials are valid', async () => {
    const service = new AuthService()
    const password = 'valid-password'
    const user = await createUserFactory({
      password,
    })

    const result = await service.getValidUser({
      email: user.email,
      password,
    })

    expect(isRight(result)).toBe(true)

    const authOutput = result.right
    expect(authOutput).toHaveProperty('id')
    expect(authOutput).toHaveProperty('email')
    expect(authOutput?.name).toBe(user.name)
    expect(authOutput?.email).toBe(user.email)
  })

  it('throws when credentials are invalid', async () => {
    const service = new AuthService()
    const user = await createUserFactory()
    const result = await service.getValidUser({
      email: user.email,
      password: 'wrong-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })

  it('throws when user does not exist', async () => {
    const service = new AuthService()
    const result = await service.getValidUser({
      email: `not-found-${Date.now()}@mail.com`,
      password: 'any-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })
})
