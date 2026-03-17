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

  async getTransactions(userId: string) {
    const transactions = await prismaClient.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })

    return transactions
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
      groupedTransactions.find((transaction) => transaction.type === 'income')
        ?._sum.amount ?? 0
    const expense =
      groupedTransactions.find((transaction) => transaction.type === 'expense')
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
