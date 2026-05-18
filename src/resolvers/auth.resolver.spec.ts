import { faker } from '@faker-js/faker'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthInput } from '@/dtos/input/auth.input'
import type { GraphQLContext } from '@/graphql/context'
import { prismaClient } from '@/prisma/prisma'
import { createMockContext, globalMockAuthService } from '@/test/utils'
import { globalMockUserService } from '@/test/utils/index'
import { makeLeft, makeRight } from '@/utils/either'
import { jwtUtils } from '@/utils/jwt'
import { AuthResolver } from './auth.resolver'

beforeEach(async () => {
  // Order matters if you have foreign keys!
  await prismaClient.transaction.deleteMany({})
  await prismaClient.category.deleteMany({})
  await prismaClient.user.deleteMany({})
})

function makeResolverSetup(overrides?: Partial<AuthInput>): AuthInput {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...(overrides as Partial<AuthInput>),
  } as AuthInput
}

describe('AuthResolver.signUp', () => {
  it('should sign up a user', async () => {
    const resolverInput = makeResolverSetup()
    const context = createMockContext()

    const mockAuthService = {
      getValidUser: vi
        .fn()
        .mockResolvedValue(makeLeft(new Error('User not found'))),
    }

    const newUser = { ...resolverInput, id: faker.string.uuid() }
    const mockUserService = {
      ...globalMockUserService,
      createUser: vi.fn().mockResolvedValue(newUser),
    }
    const resolver = new AuthResolver(mockUserService, mockAuthService)

    const result = await resolver.signUp(resolverInput, context)

    expect(mockUserService.createUser).toHaveBeenCalledWith({
      name: resolverInput.name,
      email: resolverInput.email,
      password: resolverInput.password,
    })

    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    )
    expect(context.reply.setCookie).toHaveBeenCalledWith(
      'refreshToken',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/graphql',
      })
    )
    expect(result).toMatchObject({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    })
  })

  it('should throw when signUp returns an error', async () => {
    const input = makeResolverSetup()
    const context = createMockContext()
    const mockAuthService = {
      getValidUser: vi.fn().mockResolvedValueOnce(makeRight(new Error('boom'))),
    }

    const resolver = new AuthResolver(globalMockUserService, mockAuthService)

    await expect(resolver.signUp(input, context)).rejects.toThrow(
      'User already exists'
    )
  })
})

describe('AuthResolver.signOut', () => {
  it('should clear session cookie', async () => {
    const context = createMockContext()
    const resolver = new AuthResolver(
      globalMockUserService,
      globalMockAuthService
    )

    const result = await resolver.signOut(context)

    expect(result).toBe(true)
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

describe('AuthResolver.refreshToken', () => {
  it('should issue a new access token when refresh token is valid', async () => {
    const context = createMockContext()
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

    const resolver = new AuthResolver(
      globalMockUserService,
      globalMockAuthService
    )

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
    const context = createMockContext()

    const resolver = new AuthResolver(
      globalMockUserService,
      globalMockAuthService
    )

    await expect(resolver.refreshToken(context)).rejects.toThrow(
      'No refresh token provided'
    )
  })

  it('should clear cookies and throw when refresh token is invalid', async () => {
    const context = createMockContext()
    context.request = {
      cookies: { refreshToken: 'invalid-refresh' },
    } as unknown as GraphQLContext['request']

    vi.spyOn(jwtUtils, 'verifyTokenEither').mockReturnValue(
      makeLeft(new Error('invalid'))
    )

    const resolver = new AuthResolver(
      globalMockUserService,
      globalMockAuthService
    )

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
