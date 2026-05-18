import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import { createMockContext } from '@/test/utils'
import {
  globalMockCategoryService,
  globalMockUserService,
} from '@/test/utils/index'
import { makeRight } from '@/utils/either'
import { CategoryResolver } from './category.resolver'

describe('CategoryResolver.createCategory', () => {
  it('should delegate creation to CategoryService', async () => {
    const context = createMockContext()

    const input = {
      title: faker.lorem.words(1),
      description: faker.lorem.sentence(),
      icon: faker.word.noun(),
      color: faker.color.human(),
    }

    const createCategory = vi.fn().mockResolvedValue({
      id: 'category-id',
      ...input,
      currentUserId: context.currentUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockCategoryService = {
      ...globalMockCategoryService,
      createCategory,
    }

    const resolver = new CategoryResolver(
      mockCategoryService,
      globalMockUserService
    )

    const result = await resolver.createCategory(input, context)

    expect(createCategory).toHaveBeenCalledWith(input, context.currentUserId)
    expect(result).toMatchObject({
      id: 'category-id',
      currentUserId: context.currentUserId,
      title: input.title,
      description: input.description,
      icon: input.icon,
      color: input.color,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver(
      globalMockCategoryService,
      globalMockUserService
    )

    const input = {
      title: faker.lorem.words(1),
      description: faker.lorem.sentence(),
      icon: faker.word.noun(),
      color: faker.color.human(),
    }

    const context = createMockContext({ currentUserId: undefined })

    await expect(resolver.createCategory(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.getCategories', () => {
  it('should delegate fetching to CategoryService', async () => {
    const context = createMockContext()

    const categories = [
      {
        id: faker.string.uuid(),
        title: faker.lorem.words(1),
        description: faker.lorem.sentence(),
        icon: faker.helpers.arrayElement(['income', 'expense']),
        color: faker.color.human(),
        currentUserId: context.currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const getCategories = vi.fn().mockResolvedValue(categories)
    const mockCategoryService = {
      ...globalMockCategoryService,
      getCategories,
    }

    const resolver = new CategoryResolver(
      mockCategoryService,
      globalMockUserService
    )

    const result = await resolver.categories({}, context)
    expect(getCategories).toHaveBeenCalledWith(context.currentUserId, undefined)
    expect(result).toEqual(categories)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver(
      globalMockCategoryService,
      globalMockUserService
    )
    const context = createMockContext({ currentUserId: undefined })

    await expect(resolver.categories({}, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.updateCategory', () => {
  it('should delegate update to CategoryService', async () => {
    const context = createMockContext()
    const input = {
      id: faker.string.uuid(),
      title: faker.lorem.words(1),
      description: faker.lorem.sentence(),
      icon: faker.word.noun(),
      color: faker.color.human(),
      userId: context.currentUserId,
    }

    const updateCategory = vi.fn().mockResolvedValue({
      ...input,
      currentUserId: context.currentUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockCategoryService = {
      ...globalMockCategoryService,
      updateCategory,
    }
    const resolver = new CategoryResolver(
      mockCategoryService,
      globalMockUserService
    )

    const result = await resolver.updateCategory(input, context)

    expect(updateCategory).toHaveBeenCalledWith(input, context.currentUserId)
    expect(result).toMatchObject({
      id: input.id,
      currentUserId: context.currentUserId,
      title: input.title,
      description: input.description,
      icon: input.icon,
      color: input.color,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver(
      globalMockCategoryService,
      globalMockUserService
    )
    const input = {
      id: faker.string.uuid(),
    }
    const context = createMockContext({ currentUserId: undefined })

    await expect(resolver.updateCategory(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.deleteCategory', () => {
  it('should delegate deletion to CategoryService', async () => {
    const input = {
      id: faker.string.uuid(),
    }
    const context = createMockContext()

    const deleteCategory = vi.fn().mockResolvedValue(makeRight(true))
    const mockCategoryService = {
      ...globalMockCategoryService,
      deleteCategory,
    }

    const resolver = new CategoryResolver(
      mockCategoryService,
      globalMockUserService
    )
    const result = await resolver.deleteCategory(input.id, context)

    expect(deleteCategory).toHaveBeenCalledWith(input.id, context.currentUserId)
    expect(result).toBe(true)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver(
      globalMockCategoryService,
      globalMockUserService
    )
    const context = createMockContext({ currentUserId: undefined })
    await expect(
      resolver.deleteCategory(faker.string.uuid(), context)
    ).rejects.toThrow('Unauthorized')
  })
})
