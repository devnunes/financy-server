import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { UserService } from '@/services/user.service'
import { createUserFactory } from '@/test/factories/user.factory'
import { isRight, unwrapEither } from '@/utils/either'

describe('UserService.createUser', () => {
  it('should create a user', async () => {
    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      // password: await hashPassword(Zfaker.internet.password()),
    }
    const service = new UserService()

    const result = await service.createUser(user)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('password')
    expect(result.name).toBe(user.name)
    expect(result.email).toBe(user.email)
  })
})

describe('UserService.getUserById', () => {
  it('should delete a transaction', async () => {
    const user = await createUserFactory()

    const service = new UserService()

    const result = await service.getUser({ id: user.id })
    expect(isRight(result)).toBe(true)
    expect(result.right).toHaveProperty('id')
    expect(result.right).toHaveProperty('password')
    expect(result.right?.name).toBe(user.name)
    expect(result.right?.email).toBe(user.email)
  })

  it('should throw when user does not exist', async () => {
    const service = new UserService()

    const result = await service.getUser({ id: faker.string.uuid() })
    expect(isRight(result)).toBe(false)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
    expect(result.left?.message).toBe('User not found')
  })
})

describe('UserService.updateUser', () => {
  it('should update a user', async () => {
    const user = await createUserFactory()

    const service = new UserService()

    const result = await service.updateUser(
      { ...user, name: 'Updated Name' },
      user.id
    )

    expect(isRight(result)).toBe(true)
    const updatedUser = await service.getUser({ id: user.id })
    expect(isRight(updatedUser)).toBe(true)
    expect(updatedUser.right?.name).toBe('Updated Name')
  })

  it('should throw when userId is missing', async () => {
    const service = new UserService()
    const user = await createUserFactory()

    const result = await service.updateUser(
      { id: user.id, name: 'Any Name' },
      ''
    )
    expect(isRight(result)).toBe(false)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
    expect(result.left?.message).toBe('Unauthorized')
  })

  it('should throw when input id differs from userId', async () => {
    const service = new UserService()
    const user = await createUserFactory()

    const result = await service.updateUser(
      { id: faker.string.uuid(), name: 'Any Name' },
      user.id
    )

    expect(isRight(result)).toBe(false)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
    expect(result.left?.message).toBe('Unauthorized')
  })

  it('should throw when user is not found', async () => {
    const service = new UserService()
    const missingUserId = faker.string.uuid()
    const result = await service.updateUser(
      { id: missingUserId, name: 'Any Name' },
      missingUserId
    )

    expect(isRight(result)).toBe(false)
    expect(unwrapEither(result)).toBeInstanceOf(Error)
    expect(result.left?.message).toBe('User not found')
  })

  it('should keep existing email and password when not provided', async () => {
    const user = await createUserFactory()
    const service = new UserService()

    await service.updateUser({ id: user.id, name: 'Name Only' }, user.id)

    const updatedUser = await service.getUser({ id: user.id })
    expect(isRight(updatedUser)).toBe(true)
    expect(updatedUser.right?.name).toBe('Name Only')
    expect(updatedUser.right?.email).toBe(user.email)
  })
})
