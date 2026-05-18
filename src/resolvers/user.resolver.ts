import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql'
import { UpdateUserInput } from '@/dtos/input/user.input'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { UserBalanceModel, UserModel } from '@/models/user.model'
import { UserService } from '@/services/user.service'
import { isLeft } from '@/utils/either'

@Resolver(() => UserModel)
@UseMiddleware(authMiddleware)
export class UserResolver {
  constructor(private readonly userService: UserService = new UserService()) {}

  @Query(() => UserModel)
  async user(@Arg('id', () => String) id: string): Promise<UserModel> {
    const user = await this.userService.getUser({ id })
    if (isLeft(user)) throw user.left
    return user.right
  }

  @Query(() => UserBalanceModel)
  async userBalance(@Ctx() context: GraphQLContext): Promise<UserBalanceModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    const income = await this.userService.monthIncome(context.currentUserId)
    const expenses = await this.userService.monthExpense(context.currentUserId)
    if (isLeft(income)) throw income.left
    if (isLeft(expenses)) throw expenses.left
    const balance = Number((income.right - expenses.right).toFixed(2))

    return { balance, income: income.right, expenses: expenses.right }
  }

  @Query(() => UserModel)
  async me(@Ctx() context: GraphQLContext): Promise<UserModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    const user = await this.userService.getUser({ id: context.currentUserId })
    if (isLeft(user)) throw user.left
    return user.right
  }

  @Mutation(() => Boolean)
  async updateUser(
    @Arg('data', () => UpdateUserInput) data: UpdateUserInput,
    @Ctx() context: GraphQLContext
  ): Promise<boolean> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    const result = await this.userService.updateUser(
      data,
      context.currentUserId
    )
    if (isLeft(result)) throw result.left
    return result.right
  }
}
