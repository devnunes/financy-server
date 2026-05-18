import { Field, Float, ID, Int, ObjectType } from 'type-graphql'
@ObjectType()
export class CategoriesSummaryModel {
  @Field(() => [CategoriesAggregatedModel])
  categories!: CategoriesAggregatedModel[]

  @Field(() => Float)
  transactionCountByUser!: number

  @Field(() => Float)
  categoryCount!: number

  @Field(() => CategoriesAggregatedModel)
  mostUsedCategory!: CategoriesAggregatedModel
}

@ObjectType()
export class CategoriesAggregatedModel {
  @Field(() => ID)
  id!: string

  @Field(() => String)
  title!: string

  @Field(() => String)
  color!: string

  @Field(() => String)
  icon!: string

  @Field(() => Float)
  totalAmount!: number

  @Field(() => Int)
  transactionCountByCategory!: number
}
