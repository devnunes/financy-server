import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
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
import { TransactionModel } from '@/models/transaction.model'
import { UserModel } from '@/models/user.model'
import { TransactionService } from '@/services/transaction.service'
import { UserService } from '@/services/user.service'

type TransactionResolverDeps = {
  transactionService?: Pick<
    TransactionService,
    'createTransaction' | 'updateTransaction'
  >
  userService?: Pick<UserService, 'getUserById'>
}

@Resolver(() => TransactionModel)
@UseMiddleware(authMiddleware)
export class TransactionResolver {
  private transactionService: Pick<
    TransactionService,
    'createTransaction' | 'updateTransaction'
  >
  private userService: Pick<UserService, 'getUserById'>
  constructor(deps?: TransactionResolverDeps) {
    this.transactionService = deps?.transactionService ?? new TransactionService()
    this.userService = deps?.userService ?? new UserService()
  }

  @Mutation(() => TransactionModel)
  async createTransaction(
    @Arg('data', () => CreateTransactionInput) data: CreateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.createTransaction(data, context.userId)
  }

  @Mutation(() => TransactionModel)
  async updateTransaction(
    @Arg('data', () => UpdateTransactionInput) data: UpdateTransactionInput,
    @Ctx() context: GraphQLContext
  ): Promise<TransactionModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.transactionService.updateTransaction(data, context.userId)
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() transaction: TransactionModel): Promise<UserModel | null> {
    return this.userService.getUserById(transaction.userId)
  }
}
