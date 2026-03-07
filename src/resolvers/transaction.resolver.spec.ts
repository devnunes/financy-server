import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/dtos/input/transaction.input'
import type { GraphQLContext } from '@/graphql/context'
import { TransactionResolver } from './transaction.resolver'

type createSetup = {
  input: CreateTransactionInput
  context: GraphQLContext
}

type updateSetup = {
  input: UpdateTransactionInput
  context: GraphQLContext
}

function makeResolverSetup(
  method: 'create' | 'update',
  overrides?: Partial<createSetup | updateSetup>
): createSetup | updateSetup {
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
    return data as updateSetup
  }
  return data as createSetup
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
        updateTransaction: vi.fn(),
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
      category: input.category,
    })
  })

  it('should throw Unauthorized when context has no userId', async () => {
    const resolver = new TransactionResolver()
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
        updateTransaction,
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
      category: input.category,
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
