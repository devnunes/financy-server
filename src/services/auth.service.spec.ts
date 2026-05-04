import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { createUserFactory } from '@/test/factories/user.factory'
import { isLeft, isRight, unwrapEither } from '@/utils/either'

describe('AuthService.signUp', () => {
  it('creates a new user and returns signed tokens', async () => {
    const service = new AuthService()
    const password = 'sign-up-password'
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
    }
    const result = await service.signUp(user)

    expect(isRight(result)).toBe(true)
    expect(result.right).toEqual(
      expect.objectContaining({
        token: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          name: user.name,
          email: user.email,
        }),
      })
    )
  })

  it('throws when user already exists', async () => {
    const service = new AuthService()
    const existingUser = await createUserFactory()
    const result = await service.signUp({
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

    const result = await service.validateUser({
      email: user.email,
      password,
    })

    expect(isRight(result)).toBe(true)
    if (!isRight(result)) throw result.left

    expect(result.right).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          id: expect.any(String),
          email: user.email,
        }),
      })
    )
  })

  it('throws when credentials are invalid', async () => {
    const service = new AuthService()
    const user = await createUserFactory()
    const result = await service.validateUser({
      email: user.email,
      password: 'wrong-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })

  it('throws when user does not exist', async () => {
    const service = new AuthService()
    const result = await service.validateUser({
      email: `not-found-${Date.now()}@mail.com`,
      password: 'any-password',
    })
    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
  })
})
