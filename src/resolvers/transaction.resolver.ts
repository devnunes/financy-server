import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import {
  CreateTransactionInput,
  GetOneTransactionInput,
  TransactionsFilterInput,
  UpdateTransactionInput,
} from '@/dtos/input/transaction.input'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { CategoryModel } from '@/models/category.model'
import { TransactionModel } from '@/models/transaction.model'
import { TransactionSummaryModel } from '@/models/transaction-summary.model'
import { UserModel } from '@/models/user.model'
import { CategoryService } from '@/services/category.service'
import { TransactionService } from '@/services/transaction.service'
import { UserService } from '@/services/user.service'
import { isLeft } from '@/utils/either'

@Resolver(() => TransactionModel)
@UseMiddleware(authMiddleware)
export class TransactionResolver {
  constructor(
    private readonly transactionService: TransactionService = new TransactionService(),
    private readonly userService: UserService = new UserService(),
    private readonly categoryService: CategoryService = new CategoryService()
  ) {}

  @Query(() => [TransactionModel])
  async transactions(
    @Arg('data', () => TransactionsFilterInput) data: TransactionsFilterInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel[]> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    return this.transactionService.getTransactions(
      context.currentUserId,
      data.max
    )
  }

  @Query(() => TransactionModel)
  async transaction(
    @Arg('data', () => GetOneTransactionInput) data: GetOneTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    return this.transactionService.getOneTransaction(
      data.id,
      context.currentUserId
    )
  }

  @Query(() => TransactionSummaryModel)
  async transactionSummary(
    @Ctx() context: GraphQLContext
  ): Promise<TransactionSummaryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    return this.transactionService.getTransactionSummary(context.currentUserId)
  }

  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    const categoryBelongsToUser =
      await this.categoryService.categoryBelongsToUser(
        data.categoryId,
        context.currentUserId
      )
    if (!categoryBelongsToUser) throw new Error('Unauthorized')

    return this.transactionService.createTransaction(
      data,
      context.currentUserId
    )
  }

  @Mutation(() => TransactionModel)
  async updateTransaction(
    @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    if (data.categoryId) {
      const categoryBelongsToUser =
        await this.categoryService.categoryBelongsToUser(
          data.categoryId,
          context.currentUserId
        )
      if (!categoryBelongsToUser) throw new Error('Unauthorized')
    }

    return this.transactionService.updateTransaction(
      data,
      context.currentUserId
    )
  }

  @Mutation(() => Boolean)
  async deleteTransaction(
    @Arg('id', () => String) id: string,
    @Ctx() context: GraphQLContext
  ): Promise<boolean> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    return this.transactionService.deleteTransaction(id, context.currentUserId)
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() transaction: TransactionModel): Promise<UserModel | null> {
    const user = await this.userService.getUser({ id: transaction.userId })
    if (isLeft(user)) throw user.left

    return user.right
  }

  @FieldResolver(() => CategoryModel, { nullable: true })
  async category(
    @Root() transaction: TransactionModel
  ): Promise<CategoryModel | null> {
    return this.categoryService.getCategory(transaction.categoryId)
  }
}
