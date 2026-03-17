import { AuthResolver } from './auth.resolver'
import { CategoryResolver } from './category.resolver'
import { TransactionResolver } from './transaction.resolver'
import { UserResolver } from './user.resolver'

export const resolvers = [
  AuthResolver,
  UserResolver,
  TransactionResolver,
  CategoryResolver,
] as const
