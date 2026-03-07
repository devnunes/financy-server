import type { CreateTransactionInput } from '@/dtos/input/transaction.input'
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
}
