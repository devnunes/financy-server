import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import { createMockContext, globalMockUserService } from '@/test/utils'
import { makeRight } from '@/utils/either'
import { UserResolver } from './user.resolver'

describe('UserResolver.updateUser', () => {
  it('should delegate update to UserService and return the result', async () => {
    const id = faker.string.uuid()
    const input = {
      id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }

    const context = createMockContext({ currentUserId: id })

    const updateUser = vi.fn().mockResolvedValue(makeRight(true))

    const mockUserService = {
      ...globalMockUserService,
      updateUser,
    }

    const resolver = new UserResolver(mockUserService)

    const result = await resolver.updateUser(input, context)

    expect(updateUser).toHaveBeenCalledWith(input, context.currentUserId)
    expect(result).toBe(true)
  })

  it('should throw Unauthorized when context has no currentUserId', async () => {
    const resolver = new UserResolver(globalMockUserService)
    const input = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    const context = createMockContext({ currentUserId: undefined })

    await expect(resolver.updateUser(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('UserResolver.getUser', () => {
  it('should delegate getUser to UserService', async () => {
    const userId = faker.string.uuid()
    const user = {
      id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    }
    const getUser = vi.fn().mockResolvedValue(makeRight(user))

    const resolver = new UserResolver({
      ...globalMockUserService,
      getUser,
    })

    const result = await resolver.user(userId)

    expect(getUser).toHaveBeenCalledWith({ id: userId })
    expect(result.id).toBe(userId)
  })
})

describe('UserResolver.me', () => {
  it('should return current user from context.currentUserId', async () => {
    const currentUserId = faker.string.uuid()

    const getUser = vi.fn().mockResolvedValue(
      makeRight({
        id: currentUserId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    )

    const context = createMockContext({ currentUserId })
    const resolver = new UserResolver({
      ...globalMockUserService,
      getUser,
    })

    const result = await resolver.me(context)
    expect(getUser).toHaveBeenCalledWith({ id: currentUserId })
    expect(result.id).toBe(currentUserId)
  })

  it('should throw Unauthorized when context has no currentUserId', async () => {
    const resolver = new UserResolver({
      ...globalMockUserService,
    })

    const context = createMockContext({ currentUserId: undefined })

    await expect(resolver.me(context)).rejects.toThrow('Unauthorized')
  })
})
