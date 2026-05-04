import { Field, GraphQLISODateTime, ID, Int, ObjectType } from 'type-graphql'
import { UserModel } from './user.model'

@ObjectType()
export class CategoryTransactionAmount {
  @Field(() => Int)
  amount!: number
}

@ObjectType()
export class CategoriesSummaryModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  title!: string

  @Field(() => String)
  description!: string

  @Field(() => String)
  icon!: string

  @Field(() => String)
  color!: string

  @Field(() => String)
  userId!: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date

  @Field(() => UserModel, { nullable: true })
  user?: UserModel

  @Field(() => [CategoryTransactionAmount], { nullable: true })
  transactions?: CategoryTransactionAmount[]

  @Field(() => Int)
  totalAmount!: number

  @Field(() => Int)
  transactionCount!: number
}
