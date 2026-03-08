import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/dtos/input/category.input'
import type { GraphQLContext } from '@/graphql/context'
import { CategoryResolver } from './category.resolver'

type createSetup = {
  input: CreateCategoryInput
  context: GraphQLContext
}

type getSetup = {
  input: { userId: string }
  context: GraphQLContext
}

type updateSetup = {
  input: UpdateCategoryInput
  context: GraphQLContext
}

type deleteSetup = {
  input: { id: string }
  context: GraphQLContext
}

function makeResolverSetup(
  method: 'create' | 'update' | 'delete' | 'get',
  overrides?: Partial<createSetup | updateSetup | deleteSetup | getSetup>
): createSetup | updateSetup | deleteSetup | getSetup {
  const data = {
    input: {
      title: faker.lorem.words(1),
      description: faker.lorem.sentence(),
      icon: faker.word.noun(),
      color: faker.color.human(),
      ...overrides?.input,
    },
    context: {
      userId: faker.string.uuid(),
      ...overrides?.context,
    } as GraphQLContext,
  }
  if (method === 'update') {
    Object.assign(data.input, { id: faker.string.uuid() })
    return data
  }
  return data
}

describe('CategoryResolver.createCategory', () => {
  it('should delegate creation to CategoryService', async () => {
    const { input, context } = makeResolverSetup('create') as createSetup

    const createCategory = vi.fn().mockResolvedValue({
      id: 'category-id',
      ...input,
      userId: context.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const resolver = new CategoryResolver({
      categoryService: {
        createCategory,
        getCategories: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
      },
    })

    const result = await resolver.createCategory(input, context)

    expect(createCategory).toHaveBeenCalledWith(input, context.userId)
    expect(result).toMatchObject({
      id: 'category-id',
      userId: context.userId,
      title: input.title,
      description: input.description,
      icon: input.icon,
      color: input.color,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver()
    const { input, context } = makeResolverSetup('create', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as createSetup

    await expect(resolver.createCategory(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.getCategories', () => {
  it('should delegate fetching to CategoryService', async () => {
    const context = {
      userId: faker.string.uuid(),
    } as GraphQLContext

    const categorys = [
      {
        id: faker.string.uuid(),
        title: faker.lorem.words(1),
        description: faker.lorem.sentence(),
        icon: faker.helpers.arrayElement(['income', 'expense']),
        color: faker.color.human(),
        userId: context.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const getCategories = vi.fn().mockResolvedValue(categorys)

    const resolver = new CategoryResolver({
      categoryService: {
        createCategory: vi.fn(),
        getCategories,
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
      },
    })

    const result = await resolver.getCategories(context)

    expect(getCategories).toHaveBeenCalledWith(context.userId)
    expect(result).toEqual(categorys)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver()
    const context = {
      userId: undefined,
    } as GraphQLContext

    await expect(resolver.getCategories(context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.updateCategory', () => {
  it('should delegate update to CategoryService', async () => {
    const { input, context } = makeResolverSetup('update') as updateSetup

    const updateCategory = vi.fn().mockResolvedValue({
      ...input,
      userId: context.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const resolver = new CategoryResolver({
      categoryService: {
        createCategory: vi.fn(),
        getCategories: vi.fn(),
        updateCategory,
        deleteCategory: vi.fn(),
      },
    })

    const result = await resolver.updateCategory(input, context)

    expect(updateCategory).toHaveBeenCalledWith(input, context.userId)
    expect(result).toMatchObject({
      id: input.id,
      userId: context.userId,
      title: input.title,
      description: input.description,
      icon: input.icon,
      color: input.color,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver()
    const { input, context } = makeResolverSetup('update', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as updateSetup

    await expect(resolver.updateCategory(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.deleteCategory', () => {
  it('should delegate deletion to CategoryService', async () => {
    const { input, context } = makeResolverSetup('update') as deleteSetup

    const deleteCategory = vi.fn().mockResolvedValue(true)

    const resolver = new CategoryResolver({
      categoryService: {
        createCategory: vi.fn(),
        getCategories: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory,
      },
    })

    const result = await resolver.deleteCategory(input.id, context)

    expect(deleteCategory).toHaveBeenCalledWith(input.id, context.userId)
    expect(result).toBe(true)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new CategoryResolver()
    const { input, context } = makeResolverSetup('update', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as deleteSetup

    await expect(resolver.deleteCategory(input.id, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('CategoryResolver.user', () => {
  it('should resolve user from UserService', async () => {
    const userId = faker.string.uuid()
    const getUserById = vi.fn().mockResolvedValue({
      id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    const resolver = new CategoryResolver({
      userService: {
        getUserById,
      },
      categoryService: {
        createCategory: vi.fn(),
        getCategories: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
      },
    })

    const result = await resolver.user({ userId } as never)

    expect(getUserById).toHaveBeenCalledWith(userId)
    expect(result.id).toBe(userId)
  })
})
