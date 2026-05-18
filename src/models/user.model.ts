import { Field, Float, GraphQLISODateTime, ID, ObjectType } from 'type-graphql'

@ObjectType()
export class UserModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  name!: string

  @Field(() => String)
  email!: string

  @Field(() => GraphQLISODateTime)
  createdAt!: Date

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date
}

@ObjectType()
export class UserBalanceModel {
  @Field(() => Float)
  balance!: number

  @Field(() => Float)
  income!: number

  @Field(() => Float)
  expenses!: number
}
