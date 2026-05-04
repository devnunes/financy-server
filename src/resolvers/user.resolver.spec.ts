import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type { CreateUserInput, UpdateUserInput } from '@/dtos/input/user.input'
import type { GraphQLContext } from '@/graphql/context'
import { UserResolver } from './user.resolver'

type createSetup = {
  input: CreateUserInput
  context: GraphQLContext
}

type updateSetup = {
  input: UpdateUserInput
  context: GraphQLContext
}

function makeResolverSetup(
  method: 'update' | 'get',
  overrides?: Partial<createSetup | updateSetup>
): createSetup | updateSetup {
  const data = {
    input: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      ...overrides?.input,
    },
    context: {
      currentUserId: faker.string.uuid(),
      ...overrides?.context,
    } as GraphQLContext,
  }
  if (method === 'update') {
    Object.assign(data.input, { id: faker.string.uuid() })
    return data
  }
  return data
}

describe('UserResolver.updateUser', () => {
  it('should delegate update to UserService', async () => {
    const { input, context } = makeResolverSetup('update') as updateSetup

    const updateUser = vi.fn().mockResolvedValue({
      ...input,
      currentUserId: context.currentUserId,
    })

    const resolver = new UserResolver({
      userService: {
        createUser: vi.fn(),
        getUserById: vi.fn(),
        updateUser,
      },
    })

    const result = await resolver.updateUser(input, context)

    expect(updateUser).toHaveBeenCalledWith(input, context.currentUserId)
    expect(result).toMatchObject({
      id: input.id,
      currentUserId: context.currentUserId,
      name: input.name,
      email: input.email,
      password: input.password,
    })
  })

  it('should throw Unauthorized when context has no currentUserId', async () => {
    const resolver = new UserResolver()
    const { input, context } = makeResolverSetup('update', {
      context: {
        currentUserId: undefined,
      } as GraphQLContext,
    }) as updateSetup

    await expect(resolver.updateUser(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('UserResolver.getUser', () => {
  it('should delegate getUser to UserService', async () => {
    const userId = faker.string.uuid()
    const getUserById = vi.fn().mockResolvedValue({
      id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    const resolver = new UserResolver({
      userService: {
        createUser: vi.fn(),
        getUserById,
        updateUser: vi.fn(),
      },
    })

    const result = await resolver.getUser(userId)

    expect(getUserById).toHaveBeenCalledWith(userId)
    expect(result.id).toBe(userId)
  })
})

describe('UserResolver.me', () => {
  it('should return current user from context.currentUserId', async () => {
    const currentUserId = faker.string.uuid()
    const getUserById = vi.fn().mockResolvedValue({
      id: currentUserId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    const resolver = new UserResolver({
      userService: {
        createUser: vi.fn(),
        getUserById,
        updateUser: vi.fn(),
      },
    })

    const result = await resolver.me({ currentUserId } as GraphQLContext)

    expect(getUserById).toHaveBeenCalledWith(currentUserId)
    expect(result.id).toBe(currentUserId)
  })

  it('should throw Unauthorized when context has no currentUserId', async () => {
    const resolver = new UserResolver()

    await expect(
      resolver.me({ currentUserId: undefined } as GraphQLContext)
    ).rejects.toThrow('Unauthorized')
  })
})
