import { Field, Float, GraphQLISODateTime, ID, ObjectType } from 'type-graphql'
import { CategoryModel } from './category.model'
import { UserModel } from './user.model'

@ObjectType()
export class TransactionModel {
  @Field(() => ID)
  id!: string

  @Field(() => Float)
  amount!: number

  @Field(() => String)
  description!: string

  @Field(() => String)
  type!: string

  @Field(() => GraphQLISODateTime)
  date!: Date

  @Field(() => String)
  userId!: string

  @Field(() => String)
  categoryId!: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date

  @Field(() => UserModel, { nullable: true })
  user?: UserModel

  @Field(() => CategoryModel, { nullable: true })
  category?: CategoryModel
}
