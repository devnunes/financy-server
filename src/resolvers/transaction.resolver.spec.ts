import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/dtos/input/transaction.input'
import type { GraphQLContext } from '@/graphql/context'
import { TransactionService } from '@/services/transaction.service'
import { TransactionResolver } from './transaction.resolver'

type createSetup = {
  input: CreateTransactionInput
  context: GraphQLContext
}

type getSetup = {
  input: { userId: string }
  context: GraphQLContext
}

type updateSetup = {
  input: UpdateTransactionInput
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
      amount: faker.number.int({ min: 1, max: 1000 }),
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['income', 'expense']),
      category: faker.lorem.word(),
      date: faker.date.recent(),
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

describe('TransactionResolver.createTransaction', () => {
  it('should delegate creation to TransactionService', async () => {
    const { input, context } = makeResolverSetup('create') as createSetup

    const createTransaction = vi.fn().mockResolvedValue({
      id: 'transaction-id',
      ...input,
      userId: context.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const resolver = new TransactionResolver({
      transactionService: {
        createTransaction,
        getTransactions: vi.fn(),
        getTransactionSummary: vi.fn(),
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
      },
    })

    const result = await resolver.createTransaction(input, context)

    expect(createTransaction).toHaveBeenCalledWith(input, context.userId)
    expect(result).toMatchObject({
      id: 'transaction-id',
      userId: context.userId,
      amount: input.amount,
      description: input.description,
      type: input.type,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const transactionService = new TransactionService()
    const resolver = new TransactionResolver({
      transactionService,
    })
    const { input, context } = makeResolverSetup('create', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as createSetup

    await expect(resolver.createTransaction(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.getTransactions', () => {
  it('should delegate fetching to TransactionService', async () => {
    const context = {
      userId: faker.string.uuid(),
    } as GraphQLContext

    const transactions = [
      {
        id: faker.string.uuid(),
        amount: faker.number.int({ min: 1, max: 1000 }),
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['income', 'expense']),
        category: faker.lorem.word(),
        date: faker.date.recent(),
        userId: context.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const getTransactions = vi.fn().mockResolvedValue(transactions)

    const resolver = new TransactionResolver({
      transactionService: {
        createTransaction: vi.fn(),
        getTransactions,
        getTransactionSummary: vi.fn(),
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
      },
    })

    const result = await resolver.getTransactions(context)

    expect(getTransactions).toHaveBeenCalledWith(context.userId)
    expect(result).toEqual(transactions)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new TransactionResolver()
    const context = {
      userId: undefined,
    } as GraphQLContext

    await expect(resolver.getTransactions(context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.getTransactionSummary', () => {
  it('should delegate summary fetching to TransactionService', async () => {
    const context = {
      userId: faker.string.uuid(),
    } as GraphQLContext

    const getTransactionSummary = vi.fn().mockResolvedValue({
      balance: 170,
      income: 250,
      expense: 80,
    })

    const resolver = new TransactionResolver({
      transactionService: {
        createTransaction: vi.fn(),
        getTransactions: vi.fn(),
        getTransactionSummary,
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
      },
    })

    const result = await resolver.getTransactionSummary(context)

    expect(getTransactionSummary).toHaveBeenCalledWith(context.userId)
    expect(result).toEqual({
      balance: 170,
      income: 250,
      expense: 80,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new TransactionResolver()
    const context = {
      userId: undefined,
    } as GraphQLContext

    await expect(resolver.getTransactionSummary(context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.updateTransaction', () => {
  it('should delegate update to TransactionService', async () => {
    const { input, context } = makeResolverSetup('update') as updateSetup

    const updateTransaction = vi.fn().mockResolvedValue({
      ...input,
      userId: context.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const resolver = new TransactionResolver({
      transactionService: {
        createTransaction: vi.fn(),
        getTransactions: vi.fn(),
        getTransactionSummary: vi.fn(),
        updateTransaction,
        deleteTransaction: vi.fn(),
      },
    })

    const result = await resolver.updateTransaction(input, context)

    expect(updateTransaction).toHaveBeenCalledWith(input, context.userId)
    expect(result).toMatchObject({
      id: input.id,
      userId: context.userId,
      amount: input.amount,
      description: input.description,
      type: input.type,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new TransactionResolver()
    const { input, context } = makeResolverSetup('update', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as updateSetup

    await expect(resolver.updateTransaction(input, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.deleteTransaction', () => {
  it('should delegate deletion to TransactionService', async () => {
    const { input, context } = makeResolverSetup('update') as deleteSetup

    const deleteTransaction = vi.fn().mockResolvedValue(true)

    const resolver = new TransactionResolver({
      transactionService: {
        createTransaction: vi.fn(),
        getTransactions: vi.fn(),
        getTransactionSummary: vi.fn(),
        updateTransaction: vi.fn(),
        deleteTransaction,
      },
    })

    const result = await resolver.deleteTransaction(input.id, context)

    expect(deleteTransaction).toHaveBeenCalledWith(input.id, context.userId)
    expect(result).toBe(true)
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new TransactionResolver()
    const { input, context } = makeResolverSetup('update', {
      context: {
        userId: undefined,
      } as GraphQLContext,
    }) as deleteSetup

    await expect(resolver.deleteTransaction(input.id, context)).rejects.toThrow(
      'Unauthorized'
    )
  })
})

describe('TransactionResolver.user', () => {
  it('should resolve user from UserService', async () => {
    const userId = faker.string.uuid()
    const getUserById = vi.fn().mockResolvedValue({
      id: userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })

    const resolver = new TransactionResolver({
      userService: {
        getUserById,
      },
      transactionService: {
        createTransaction: vi.fn(),
        getTransactions: vi.fn(),
        getTransactionSummary: vi.fn(),
        updateTransaction: vi.fn(),
        deleteTransaction: vi.fn(),
      },
    })

    const result = await resolver.user({ userId } as never)

    expect(getUserById).toHaveBeenCalledWith(userId)
    expect(result.id).toBe(userId)
  })
})
