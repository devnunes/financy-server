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

type TransactionResolverDeps = {
  transactionService?: Pick<
    TransactionService,
    | 'createTransaction'
    | 'getTransactions'
    | 'getTransactionSummary'
    | 'updateTransaction'
    | 'deleteTransaction'
  >
  userService?: Pick<UserService, 'getUserById'>
  categoryService?: Pick<CategoryService, 'getCategoryById'>
}

@Resolver(() => TransactionModel)
// @UseMiddleware(authMiddleware)
export class TransactionResolver {
  private transactionService: Pick<
    TransactionService,
    | 'createTransaction'
    | 'getTransactions'
    | 'getTransactionSummary'
    | 'updateTransaction'
    | 'deleteTransaction'
  >
  private userService: Pick<UserService, 'getUserById'>
  private categoryService: Pick<CategoryService, 'getCategoryById'>

  constructor(deps?: TransactionResolverDeps) {
    this.transactionService =
      deps?.transactionService ?? new TransactionService()
    this.userService = deps?.userService ?? new UserService()
    this.categoryService = deps?.categoryService ?? new CategoryService()
  }

  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.createTransaction(data, context.userId)
  }

  @Query(() => [TransactionModel])
  async getTransactions(
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel[]> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.getTransactions(context.userId)
  }

  @Query(() => TransactionSummaryModel)
  async getTransactionSummary(
    @Ctx() context: GraphQLContext
  ): Promise<TransactionSummaryModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.getTransactionSummary(context.userId)
  }

  @Mutation(() => TransactionModel)
  async updateTransaction(
    @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.updateTransaction(data, context.userId)
  }

  @Mutation(() => Boolean)
  async deleteTransaction(
    @Arg('id', () => String) id: string,
    @Ctx() context: GraphQLContext
  ): Promise<boolean> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.deleteTransaction(id, context.userId)
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() transaction: TransactionModel): Promise<UserModel | null> {
    return this.userService.getUserById(transaction.userId)
  }

  @FieldResolver(() => CategoryModel, { nullable: true })
  async category(
    @Root() transaction: TransactionModel
  ): Promise<CategoryModel | null> {
    return this.categoryService.getCategoryById(transaction.categoryId)
  }
}
