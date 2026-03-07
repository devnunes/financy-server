import { AuthResolver } from './auth.resolver'
import { TransactionResolver } from './transaction.resolver'
import { UserResolver } from './user.resolver'

export const resolvers = [
  AuthResolver,
  UserResolver,
  TransactionResolver,
] as const
