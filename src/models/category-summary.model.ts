import { Field, ID, Int, ObjectType } from 'type-graphql'
@ObjectType()
export class CategoriesSummaryModel {
  @Field(() => [CategoriesAggregatedModel])
  categories!: CategoriesAggregatedModel[]

  @Field(() => Int)
  transactionCountByUser!: number

  @Field(() => Int)
  categoryCount!: number
}

@ObjectType()
export class CategoriesAggregatedModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  title!: string

  @Field(() => String)
  color!: string

  @Field(() => Int)
  totalAmount!: number

  @Field(() => Int)
  transactionCountByCategory!: number
}
