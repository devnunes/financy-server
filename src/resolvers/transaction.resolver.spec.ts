import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'

import type { GraphQLContext } from '@/graphql/context'
import {
  createMockContext,
  globalMockCategoryService,
  globalMockTransactionService,
  globalMockUserService,
} from '@/test/utils'
import { TransactionResolver } from './transaction.resolver'

describe('TransactionResolver.createTransaction', () => {
  it('should delegate creation to TransactionService', async () => {
    const input = {
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      categoryId: faker.string.uuid(),
      date: faker.date.recent(),
    }
    const context = createMockContext()
    const createTransaction = vi
      .fn()
      .mockImplementation((inputArg, userIdArg) => ({
        id: 'transaction-id',
        amount: inputArg.amount,
        description: inputArg.description,
        type: inputArg.type,
        currentUserId: userIdArg,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))

    const transactionService = {
      ...globalMockTransactionService,
      createTransaction,
    }

    const categoryService = {
      ...globalMockCategoryService,
      categoryBelongsToUser: vi.fn().mockResolvedValue(true),
    }

    const resolver = new TransactionResolver(
      transactionService,
      globalMockUserService,
      categoryService
    )

    const result = await resolver.createTransaction(input, context)

    expect(createTransaction).toHaveBeenCalledWith(input, context.currentUserId)
    expect(result).toMatchObject({
      id: 'transaction-id',
      currentUserId: context.currentUserId,
      amount: input.amount,
      description: input.description,
      type: input.type,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const transactionService = {
      ...globalMockTransactionService,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )
    const input = {
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      categoryId: faker.string.uuid(),
      date: faker.date.recent(),
    }
    const context = createMockContext({ currentUserId: undefined })
    await expect(resolver.createTransaction(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.getTransactions', () => {
  it('should delegate fetching to TransactionService', async () => {
    const context = {
      currentUserId: faker.string.uuid(),
    } as GraphQLContext

    const transactions = [
      {
        id: faker.string.uuid(),
        amount: faker.number.int({ min: 1, max: 1000 }),
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['income', 'expense']),
        category: faker.lorem.word(),
        date: faker.date.recent(),
        currentUserId: context.currentUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const getTransactions = vi.fn().mockResolvedValue(transactions)

    const transactionService = {
      ...globalMockTransactionService,
      getTransactions,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )

    const result = await resolver.transactions(context)

    expect(getTransactions).toHaveBeenCalledWith(context.currentUserId)
    expect(result).toEqual(transactions)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const transactionService = {
      ...globalMockTransactionService,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )
    const context = {
      currentUserId: undefined,
    } as GraphQLContext

    await expect(resolver.transactions(context)).rejects.toThrow('Unauthorized')
  })
})

describe('TransactionResolver.getTransactionSummary', () => {
  it('should delegate summary fetching to TransactionService', async () => {
    const context = {
      currentUserId: faker.string.uuid(),
    } as GraphQLContext

    const getTransactionSummary = vi.fn().mockResolvedValue({
      balance: 170,
      income: 250,
      expense: 80,
    })

    const transactionService = {
      ...globalMockTransactionService,
      getTransactionSummary,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )

    const result = await resolver.transactionSummary(context)

    expect(getTransactionSummary).toHaveBeenCalledWith(context.currentUserId)
    expect(result).toEqual({
      balance: 170,
      income: 250,
      expense: 80,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const transactionService = {
      ...globalMockTransactionService,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )
    const context = {
      currentUserId: undefined,
    } as GraphQLContext

    await expect(resolver.transactionSummary(context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.updateTransaction', () => {
  it('should delegate update to TransactionService', async () => {
    const input = {
      id: faker.string.uuid(),
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      category: faker.lorem.word(),
      date: faker.date.recent(),
    }
    const context = createMockContext()

    const updateTransaction = vi.fn().mockResolvedValue({
      ...input,
      currentUserId: context.currentUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const transactionService = {
      ...globalMockTransactionService,
      updateTransaction,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )

    const result = await resolver.updateTransaction(input, context)

    expect(updateTransaction).toHaveBeenCalledWith(input, context.currentUserId)
    expect(result).toMatchObject({
      id: input.id,
      currentUserId: context.currentUserId,
      amount: input.amount,
      description: input.description,
      type: input.type,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const transactionService = {
      ...globalMockTransactionService,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )
    const input = {
      id: faker.string.uuid(),
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      category: faker.lorem.word(),
      date: faker.date.recent(),
    }
    const context = createMockContext({ currentUserId: undefined })
    await expect(resolver.updateTransaction(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.deleteTransaction', () => {
  it('should delegate deletion to TransactionService', async () => {
    const input = {
      id: faker.string.uuid(),
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      category: faker.lorem.word(),
      date: faker.date.recent(),
    }
    const context = createMockContext()

    const deleteTransaction = vi.fn().mockResolvedValue(true)

    const transactionService = {
      ...globalMockTransactionService,
      deleteTransaction,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )

    const result = await resolver.deleteTransaction(input.id, context)

    expect(transactionService.deleteTransaction).toHaveBeenCalledWith(
      input.id,
      context.currentUserId
    )
    expect(result).toBe(true)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const transactionService = {
      ...globalMockTransactionService,
    }
    const categoryService = {
      ...globalMockCategoryService,
    }
    const userService = {
      ...globalMockUserService,
    }
    const resolver = new TransactionResolver(
      transactionService,
      userService,
      categoryService
    )

    const input = {
      id: faker.string.uuid(),
    }
    const context = createMockContext({ currentUserId: undefined })

    await expect(resolver.deleteTransaction(input.id, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})
