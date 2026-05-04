import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { makeLeft, makeRight } from '@/utils/either'
import { jwtUtils } from '@/utils/jwt'
import { AuthResolver } from './auth.resolver'

type SignUpSetup = {
  input: SignUpInput
}

type SignInSetup = {
  input: SignInInput
}

function makeContext(): GraphQLContext {
  return {
    currentUserId: undefined,
    request: {} as GraphQLContext['request'],
    reply: {
      header: vi.fn(),
      setCookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as GraphQLContext['reply'],
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
        validateUser: vi.fn(),
      },
    })

    const result = await resolver.signUp(input, context)

    expect(signUp).toHaveBeenCalledWith(input)
    expect(context.reply.header).toHaveBeenCalledWith(
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

  it('should throw when signUp returns an error', async () => {
    const { input } = makeResolverSetup('signUp') as SignUpSetup
    const context = makeContext()
    const signUp = vi.fn().mockResolvedValue(makeLeft(new Error('boom')))

    const resolver = new AuthResolver({
      authService: {
        signUp,
        validateUser: vi.fn(),
      },
    })

    await expect(resolver.signUp(input, context)).rejects.toThrow('boom')
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
    expect(context.reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(result.user.email).toBe(input.email)
  })
})

describe('AuthResolver.validateUser', () => {
  it('should validate a user', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()
    const userId = faker.string.uuid()

    const validateUser = vi.fn().mockResolvedValue(
      makeRight({
        user: {
          id: userId,
          name: faker.person.fullName(),
          email: input.email,
          password: input.password,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )

    const resolver = new AuthResolver({
      authService: {
        signUp: vi.fn(),
        validateUser: validateUser,
      },
    })

    const result = await resolver.signIn(input, context)

    expect(validateUser).toHaveBeenCalledWith(input)
    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      })
    )
    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      })
    )
    expect(result).toMatchObject({
      user: {
        id: userId,
        email: input.email,
      },
    })
  })

  it('should throw when validateUser returns an error', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()
    const validateUser = vi
      .fn()
      .mockResolvedValue(makeLeft(new Error('invalid credentials')))

    const resolver = new AuthResolver({
      authService: {
        signUp: vi.fn(),
        validateUser,
      },
    })

    await expect(resolver.signIn(input, context)).rejects.toThrow(
      'invalid credentials'
    )
  })

  it('should use AuthService.validateUser when no dependency is injected', async () => {
    const { input } = makeResolverSetup('signIn') as SignInSetup
    const context = makeContext()
    const validateUserSpy = vi.spyOn(AuthService.prototype, 'validateUser')
    validateUserSpy.mockResolvedValue(
      makeRight({
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

    expect(validateUserSpy).toHaveBeenCalledWith(input)
    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      })
    )
    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
      })
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
    expect(context.reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=')
    )
    expect(context.reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('Max-Age=0')
    )
  })
})

describe('AuthResolver.refreshToken', () => {
  it('should issue a new access token when refresh token is valid', async () => {
    const context = makeContext()
    context.request = {
      cookies: { refreshToken: 'valid-refresh' },
    } as unknown as GraphQLContext['request']

    vi.spyOn(jwtUtils, 'verifyTokenEither').mockReturnValue(
      makeRight({
        userId: faker.string.uuid(),
        email: faker.internet.email(),
        type: 'refresh',
      })
    )
    vi.spyOn(jwtUtils, 'signAccessToken').mockReturnValue('new-access-token')

    const resolver = new AuthResolver()

    const result = await resolver.refreshToken(context)

    expect(result).toBe(true)
    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'accessToken',
      'new-access-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
      })
    )
  })

  it('should throw when refresh token is missing', async () => {
    const context = makeContext()
    context.request = { cookies: {} } as unknown as GraphQLContext['request']

    const resolver = new AuthResolver()

    await expect(resolver.refreshToken(context)).rejects.toThrow(
      'No refresh token provided'
    )
  })

  it('should clear cookies and throw when refresh token is invalid', async () => {
    const context = makeContext()
    context.request = {
      cookies: { refreshToken: 'invalid-refresh' },
    } as unknown as GraphQLContext['request']

    vi.spyOn(jwtUtils, 'verifyTokenEither').mockReturnValue(
      makeLeft(new Error('invalid'))
    )

    const resolver = new AuthResolver()

    await expect(resolver.refreshToken(context)).rejects.toThrow(
      'Session expired. Please log in again.'
    )
    expect(context.reply.clearCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.objectContaining({ path: '/' })
    )
    expect(context.reply.clearCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.objectContaining({ path: '/graphql' })
    )
  })
})
