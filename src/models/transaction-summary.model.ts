import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class TransactionSummaryModel {
  @Field(() => Number)
  balance!: number

  @Field(() => Number)
  income!: number

  @Field(() => Number)
  expense!: number
}
