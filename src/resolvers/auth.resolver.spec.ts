import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { LoginInput, RegisterInput } from '@/dtos/input/auth.input'
import { AuthService } from '@/services/auth.service'
import { AuthResolver } from './auth.resolver'

type RegisterSetup = {
  input: RegisterInput
}

type LoginSetup = {
  input: LoginInput
}

function makeResolverSetup(
  type: 'register' | 'login',
  overrides?: Partial<RegisterSetup | LoginSetup>
): RegisterSetup | LoginSetup {
  const data = {
    input: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      ...overrides?.input,
    },
  }
  if (type === 'register') {
    Object.assign(data.input, {
      password: faker.internet.password(),
    })
    return data
  }
  return data
}

describe('AuthResolver', () => {
  it('should register a user', async () => {
    const { input } = makeResolverSetup('register') as RegisterSetup

    const register = vi.fn().mockResolvedValue(input)

    const resolver = new AuthResolver({
      authService: {
        register,
        login: vi.fn(),
      },
    })

    const result = await resolver.register(input)

    expect(register).toHaveBeenCalledWith(input)
    expect(result).toMatchObject({
      name: input.name,
      email: input.email,
    })
  })

  it('should login a user', async () => {
    const { input } = makeResolverSetup('login') as LoginSetup

    const login = vi.fn().mockResolvedValue({
      token: faker.internet.jwt(),
      refreshToken: faker.internet.jwt(),
      user: {
        email: input.email,
        password: input.password,
      },
    })

    const resolver = new AuthResolver({
      authService: {
        register: vi.fn(),
        login,
      },
    })

    const result = await resolver.login(input)

    expect(login).toHaveBeenCalledWith(input)
    expect(result).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: input.email,
        password: input.password,
      },
    })
  })

  it('should use AuthService.register when no dependency is injected', async () => {
    const { input } = makeResolverSetup('register') as RegisterSetup
    const registerSpy = vi.spyOn(AuthService.prototype, 'register')
    registerSpy.mockResolvedValue({
      token: faker.internet.jwt(),
      refreshToken: faker.internet.jwt(),
      user: {
        id: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: input.name,
        email: input.email,
        password: input.password,
      },
    })

    const resolver = new AuthResolver()

    const result = await resolver.register(input)

    expect(registerSpy).toHaveBeenCalledWith(input)
    expect(result.user.email).toBe(input.email)
  })

  it('should use AuthService.login when no dependency is injected', async () => {
    const { input } = makeResolverSetup('login') as LoginSetup
    const loginSpy = vi.spyOn(AuthService.prototype, 'login')
    loginSpy.mockResolvedValue({
      token: faker.internet.jwt(),
      refreshToken: faker.internet.jwt(),
      user: {
        id: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        name: faker.person.fullName(),
        email: input.email,
        password: input.password,
      },
    })

    const resolver = new AuthResolver()

    const result = await resolver.login(input)

    expect(loginSpy).toHaveBeenCalledWith(input)
    expect(result.user.email).toBe(input.email)
  })
})
