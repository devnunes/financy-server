import { Field, GraphQLISODateTime, ID, InputType } from 'type-graphql'

@InputType()
export class CreateTransactionInput {
  @Field(() => Number)
  amount!: number

  @Field(() => String)
  description!: string

  @Field(() => String)
  type!: string

  @Field(() => String, { nullable: true })
  categoryId?: string

  @Field(() => GraphQLISODateTime)
  date!: Date
}

@InputType()
export class UpdateTransactionInput {
  @Field(() => ID)
  id!: string

  @Field(() => Number, { nullable: true })
  amount?: number

  @Field(() => String, { nullable: true })
  description?: string

  @Field(() => String, { nullable: true })
  type?: string

  @Field(() => String, { nullable: true })
  categoryId?: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  date?: Date
}
