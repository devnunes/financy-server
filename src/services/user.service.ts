import z from 'zod/v4'
import type {
  CreateUserInput,
  GetUserInput,
  UpdateUserInput,
} from '@/dtos/input/user.input'
import type { UserModel } from '@/models/user.model'
import { prismaClient } from '@/prisma/prisma'
import { type Either, makeLeft, makeRight } from '@/utils/either'
import { hashPassword } from '@/utils/hash'

const userSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
})
export class UserService {
  async createUser(data: CreateUserInput): Promise<UserModel> {
    const validData = await userSchema.parseAsync(data).catch(err => {
      if (err instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${err.issues.map(e => e.message).join(', ')}`
        )
      }
    })
    if (!validData) throw new Error('Invalid input')

    // Hash the password before saving
    const hashedPassword = await hashPassword(validData.password)
    const userCreated = await prismaClient.user.create({
      data: {
        ...validData,
        password: hashedPassword,
      },
    })
    return userCreated
  }

  async getUser({
    id,
    email,
  }: GetUserInput): Promise<Either<Error, UserModel>> {
    if (id) {
      const user = await prismaClient.user.findUnique({
        where: {
          id,
        },
      })
      if (!user) return makeLeft(new Error('User not found'))
      return makeRight(user)
    }

    if (email) {
      const user = await prismaClient.user.findUnique({
        where: {
          email,
        },
      })
      if (!user) return makeLeft(new Error('User not found'))
      return makeRight(user)
    }
    return makeLeft(new Error('Invalid input'))
  }

  async updateUser(
    data: UpdateUserInput,
    userId: string
  ): Promise<Either<Error, boolean>> {
    if (!userId) return makeLeft(new Error('Unauthorized'))
    if (data.id !== userId) return makeLeft(new Error('Unauthorized'))
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) return makeLeft(new Error('User not found'))

    const password = data.password
      ? await hashPassword(data.password)
      : user.password

    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        password,
      },
    })

    return makeRight(true)
  }

  async monthIncome(userId: string): Promise<Either<Error, number>> {
    if (!userId) return makeLeft(new Error('Unauthorized'))
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) return makeLeft(new Error('User not found'))

    const income = await prismaClient.transaction.aggregate({
      where: { userId, type: 'income' },
      _sum: { amount: true },
    })

    const incomeValue = income._sum.amount ?? 0
    const formattedIncome = Number((incomeValue / 100).toFixed(2))
    return makeRight(formattedIncome)
  }

  async monthExpense(userId: string): Promise<Either<Error, number>> {
    if (!userId) return makeLeft(new Error('Unauthorized'))
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    })
    if (!user) return makeLeft(new Error('User not found'))

    const expenses = await prismaClient.transaction.aggregate({
      where: { userId, type: 'expense' },
      _sum: { amount: true },
    })

    const expensesValue = expenses._sum.amount ?? 0
    const formattedExpenses = Number((expensesValue / 100).toFixed(2))

    return makeRight(formattedExpenses)
  }
}
