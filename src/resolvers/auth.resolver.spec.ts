import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { makeRight } from '@/utils/either'
import { AuthResolver } from './auth.resolver'

type SignUpSetup = {
  input: SignUpInput
}

type SignInSetup = {
  input: SignInInput
}

function makeContext(): GraphQLContext {
  return {
    userId: undefined,
    token: undefined,
    req: {} as GraphQLContext['req'],
    res: {
      header: vi.fn(),
    } as unknown as GraphQLContext['res'],
  }
}

function makeResolverSetup(
  type: 'signIn' | 'signUp',
  overrides?: Partial<SignInSetup | SignUpSetup>
): SignInSetup | SignUpSetup {
  if (type === 'signUp') {
    const data: SignUpSetup = {
      input: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...(overrides?.input as Partial<SignUpInput>),
      },
    }
    return data
  } else {
    const data: SignInSetup = {
      input: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...(overrides?.input as Partial<SignInInput>),
      },
    }
    return data
  }
}

describe('AuthResolver.signUp', () => {
  it('should sign up a user', async () => {
    const { input } = makeResolverSetup('signUp') as SignUpSetup
    const context = makeContext()

    const signUp = vi.fn().mockResolvedValue(
      makeRight({
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
    )

    const resolver = new AuthResolver({
      authService: {
        signUp,
        signIn: vi.fn(),
      },
    })

    const result = await resolver.signUp(input, context)

    expect(signUp).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        name: input.name,
        email: input.email,
      },
    })
  })

  it('should use AuthService.signUp when no dependency is injected', async () => {
    const { input } = makeResolverSetup('signUp') as SignUpSetup
    const context = makeContext()
    const signUpSpy = vi.spyOn(AuthService.prototype, 'signUp')
    signUpSpy.mockResolvedValue(
      makeRight({
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
    )

    const resolver = new AuthResolver()

    const result = await resolver.signUp(input, context)

    expect(signUpSpy).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result.user.email).toBe(input.email)
  })
})

describe('AuthResolver.signIn', () => {
  it('should sign in a user', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()

    const signIn = vi.fn().mockResolvedValue(
      makeRight({
        token: faker.internet.jwt(),
        refreshToken: faker.internet.jwt(),
        user: {
          email: input.email,
          password: input.password,
        },
      })
    )

    const resolver = new AuthResolver({
      authService: {
        signUp: vi.fn(),
        signIn,
      },
    })

    const result = await resolver.signIn(input, context)

    expect(signIn).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result).toMatchObject({
      token: expect.any(String),
      refreshToken: expect.any(String),
      user: {
        email: input.email,
        password: input.password,
      },
    })
  })

  it('should use AuthService.signIn when no dependency is injected', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()
    const signInSpy = vi.spyOn(AuthService.prototype, 'signIn')
    signInSpy.mockResolvedValue(
      makeRight({
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
    )

    const resolver = new AuthResolver()

    const result = await resolver.signIn(input, context)

    expect(signInSpy).toHaveBeenCalledWith(input)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result.user.email).toBe(input.email)
  })
})

describe('AuthResolver.signOut', () => {
  it('should clear session cookie', async () => {
    const context = makeContext()
    const resolver = new AuthResolver()

    const result = await resolver.signOut(context)

    expect(result).toBe(true)
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(context.res.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('Max-Age=0')
    )
  })
})
