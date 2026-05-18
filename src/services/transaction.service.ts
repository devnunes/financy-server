import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '@/dtos/input/transaction.input'
import { prismaClient } from '@/prisma/prisma'

export class TransactionService {
  async createTransaction(data: CreateTransactionInput, userId: string) {
    return prismaClient.transaction.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async getOneTransaction(transactionId: string, userId: string) {
    const transaction = await prismaClient.transaction.findUnique({
      where: { id: transactionId, userId },
    })
    ;('')
    if (!transaction) throw new Error('Transaction not found')

    return transaction
  }

  async getTransactions(userId: string, max?: number) {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: max,
    })
    const parsedTransactions = transactions.map(transaction => ({
      ...transaction,
      amount: Number((transaction.amount / 100).toFixed(2)),
    }))
    return parsedTransactions
  }

  async getTransactionSummary(userId: string) {
    const groupedTransactions = await prismaClient.transaction.groupBy({
      by: ['type'],
      where: { userId },
      _sum: {
        amount: true,
      },
    })

    const income =
      groupedTransactions.find(transaction => transaction.type === 'income')
        ?._sum.amount ?? 0
    const expense =
      groupedTransactions.find(transaction => transaction.type === 'expense')
        ?._sum.amount ?? 0

    return {
      balance: income - expense,
      income,
      expense,
    }
  }

  async updateTransaction(data: UpdateTransactionInput, userId: string) {
    const transaction = await prismaClient.transaction.findUnique({
      where: { id: data.id },
    })

    if (!transaction) throw new Error('Transaction not found')
    if (transaction.userId !== userId) throw new Error('Unauthorized')

    return prismaClient.transaction.update({
      where: { id: data.id },
      data,
    })
  }

  async deleteTransaction(id: string, userId: string) {
    const transaction = await prismaClient.transaction.findUnique({
      where: { id },
    })

    if (!transaction) throw new Error('Transaction not found')
    if (transaction.userId !== userId) throw new Error('Unauthorized')

    await prismaClient.transaction.delete({
      where: { id },
    })

    return true
  }
}
