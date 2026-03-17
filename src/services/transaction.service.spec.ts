import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { TransactionService } from '@/services/transaction.service'
import {
  createManyTransactionsFactory,
  createTransactionFactory,
} from '@/test/factories/transaction.factory'
import { createUserFactory } from '@/test/factories/user.factory'

describe('TransactionService.createTransaction', () => {
  it('should create a transaction', async () => {
    const user = await createUserFactory()

    const service = new TransactionService()

    const transaction = await service.createTransaction(
      {
        amount: 100,
        description: 'Test transaction',
        type: 'income',
        date: new Date(),
      },
      user.id
    )

    expect(transaction).toHaveProperty('id')
    expect(transaction.amount).toBe(100)
    expect(transaction.description).toBe('Test transaction')
    expect(transaction.type).toBe('income')
    expect(transaction.date).toBeInstanceOf(Date)
    expect(transaction.userId).toBe(user.id)
  })
})

describe('TransactionService.getTransactions', () => {
  it('should get transactions for a user', async () => {
    const user = await createUserFactory()

    const service = new TransactionService()
    const transaction1 = await createTransactionFactory(user.id)
    const transaction2 = await createTransactionFactory(user.id)

    const transactions = await service.getTransactions(user.id)

    expect(transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining(transaction1),
        expect.objectContaining(transaction2),
      ])
    )
  })
})

describe('TransactionService.getTransactionSummary', () => {
  it('should return balance, income and expense for the user', async () => {
    const user = await createUserFactory()
    const anotherUser = await createUserFactory()

    await createManyTransactionsFactory([
      {
        amount: 200,
        description: 'Salary',
        type: 'income',
        date: new Date(),
        userId: user.id,
      },
      {
        amount: 50,
        description: 'Bonus',
        type: 'income',
        date: new Date(),
        userId: user.id,
      },
      {
        amount: 80,
        description: 'Groceries',
        type: 'expense',
        date: new Date(),
        userId: user.id,
      },
      {
        amount: 500,
        description: 'Another user income',
        type: 'income',
        date: new Date(),
        userId: anotherUser.id,
      },
    ])

    const service = new TransactionService()

    const summary = await service.getTransactionSummary(user.id)

    expect(summary).toEqual({
      balance: 170,
      income: 250,
      expense: 80,
    })
  })

  it('should return zeroed values when user has no transactions', async () => {
    const user = await createUserFactory()
    const service = new TransactionService()

    const summary = await service.getTransactionSummary(user.id)

    expect(summary).toEqual({
      balance: 0,
      income: 0,
      expense: 0,
    })
  })
})

describe('TransactionService.updateTransaction', () => {
  it('should update a transaction', async () => {
    const user = await createUserFactory()
    const transaction = await createTransactionFactory(user.id)

    const service = new TransactionService()

    const updatedTransaction = await service.updateTransaction(
      {
        id: transaction.id,
        amount: 200,
        description: 'Updated transaction',
        type: 'expense',
        date: new Date(),
      },
      user.id
    )

    expect(updatedTransaction.id).toBe(transaction.id)
    expect(updatedTransaction.amount).toBe(200)
    expect(updatedTransaction.description).toBe('Updated transaction')
    expect(updatedTransaction.type).toBe('expense')
    expect(updatedTransaction.date).toBeInstanceOf(Date)
    expect(updatedTransaction.userId).toBe(user.id)
  })

  it('should throw when transaction does not exist', async () => {
    const user = await createUserFactory()
    const service = new TransactionService()

    await expect(
      service.updateTransaction(
        {
          id: faker.string.uuid(),
          amount: 200,
          description: 'Updated transaction',
          type: 'expense',
          date: new Date(),
        },
        user.id
      )
    ).rejects.toThrow('Transaction not found')
  })

  it('should throw when transaction belongs to another user', async () => {
    const owner = await createUserFactory()
    const anotherUser = await createUserFactory()
    const transaction = await createTransactionFactory(owner.id)
    const service = new TransactionService()

    await expect(
      service.updateTransaction(
        {
          id: transaction.id,
          amount: 200,
          description: 'Updated transaction',
          type: 'expense',
          date: new Date(),
        },
        anotherUser.id
      )
    ).rejects.toThrow('Unauthorized')
  })
})

describe('TransactionService.deleteTransaction', () => {
  it('should delete a transaction', async () => {
    const user = await createUserFactory()
    const transaction = await createTransactionFactory(user.id)

    const service = new TransactionService()

    const result = await service.deleteTransaction(transaction.id, user.id)

    expect(result).toBe(true)
    const deletedTransaction = await service.getTransactions(user.id)
    expect(deletedTransaction).not.toEqual(
      expect.arrayContaining([expect.objectContaining(transaction)])
    )
  })

  it('should throw when transaction does not exist', async () => {
    const user = await createUserFactory()
    const service = new TransactionService()

    await expect(
      service.deleteTransaction(faker.string.uuid(), user.id)
    ).rejects.toThrow('Transaction not found')
  })

  it('should throw when transaction belongs to another user', async () => {
    const owner = await createUserFactory()
    const anotherUser = await createUserFactory()
    const transaction = await createTransactionFactory(owner.id)
    const service = new TransactionService()

    await expect(
      service.deleteTransaction(transaction.id, anotherUser.id)
    ).rejects.toThrow('Unauthorized')
  })
})
