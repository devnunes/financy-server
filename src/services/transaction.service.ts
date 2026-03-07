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
}
