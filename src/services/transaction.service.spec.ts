import { describe, expect, it } from 'vitest'
import { TransactionService } from '@/services/transaction.service'
import { createTransactionFactory } from '@/test/factories/transaction.factory'
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
        category: 'salary',
        date: new Date(),
      },
      user.id
    )

    expect(transaction).toHaveProperty('id')
    expect(transaction.amount).toBe(100)
    expect(transaction.description).toBe('Test transaction')
    expect(transaction.type).toBe('income')
    expect(transaction.category).toBe('salary')
    expect(transaction.date).toBeInstanceOf(Date)
    expect(transaction.userId).toBe(user.id)
  })

  // it('throws when credentials are invalid', async () => {
  //   const service = new TransactionService()

  //   await expect(
  //     service.createTransaction(
  //       {
  //         amount: 100,
  //         description: 'Test transaction',
  //         type: 'income',
  //         category: 'salary',
  //         date: new Date(),
  //       },
  //       'invalid-user-id'
  //     )
  //   ).rejects.toThrow('User not found')
  // })
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
        category: 'food',
        date: new Date(),
      },
      user.id
    )

    expect(updatedTransaction.id).toBe(transaction.id)
    expect(updatedTransaction.amount).toBe(200)
    expect(updatedTransaction.description).toBe('Updated transaction')
    expect(updatedTransaction.type).toBe('expense')
    expect(updatedTransaction.category).toBe('food')
    expect(updatedTransaction.date).toBeInstanceOf(Date)
    expect(updatedTransaction.userId).toBe(user.id)
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
})
