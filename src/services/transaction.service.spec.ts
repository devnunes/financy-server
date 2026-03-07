import { describe, expect, it } from 'vitest'
import { prismaClient } from '@/prisma/prisma'
import { TransactionService } from '@/services/transaction.service'
import { hashPassword } from '@/utils/hash'

function makeTestEmail() {
  return `test-${crypto.randomUUID()}@email.com`
}

describe('TransactionService.createTransaction', () => {
  it('should create a transaction', async () => {
    const service = new TransactionService()
    const password = '123456'
    const email = makeTestEmail()

    const user = await prismaClient.user.create({
      data: {
        name: 'Test User',
        email,
        password: await hashPassword(password),
      },
    })

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
