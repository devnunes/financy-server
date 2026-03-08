import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { UserService } from '@/services/user.service'
import { createUserFactory } from '@/test/factories/user.factory'

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

    const result = await service.getUserById(user.id)

    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('password')
    expect(result.name).toBe(user.name)
    expect(result.email).toBe(user.email)
  })

  it('should throw when user does not exist', async () => {
    const service = new UserService()

    await expect(service.getUserById(faker.string.uuid())).rejects.toThrow(
      'User not found'
    )
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

    expect(result).toBe(true)
    const updatedUser = await service.getUserById(user.id)
    expect(updatedUser.name).toBe('Updated Name')
  })

  it('should throw when userId is missing', async () => {
    const service = new UserService()
    const user = await createUserFactory()

    await expect(
      service.updateUser({ id: user.id, name: 'Any Name' }, '')
    ).rejects.toThrow('Unauthorized')
  })

  it('should throw when input id differs from userId', async () => {
    const service = new UserService()
    const user = await createUserFactory()

    await expect(
      service.updateUser({ id: faker.string.uuid(), name: 'Any Name' }, user.id)
    ).rejects.toThrow('Unauthorized')
  })

  it('should throw when user is not found', async () => {
    const service = new UserService()
    const missingUserId = faker.string.uuid()

    await expect(
      service.updateUser({ id: missingUserId, name: 'Any Name' }, missingUserId)
    ).rejects.toThrow('User not found')
  })

  it('should keep existing email and password when not provided', async () => {
    const user = await createUserFactory()
    const service = new UserService()

    await service.updateUser({ id: user.id, name: 'Name Only' }, user.id)

    const updatedUser = await service.getUserById(user.id)
    expect(updatedUser.name).toBe('Name Only')
    expect(updatedUser.email).toBe(user.email)
    expect(updatedUser.password).toBe(user.password)
  })
})
