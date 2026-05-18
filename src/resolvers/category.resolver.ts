import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { ZodError } from 'zod'
import {
  CategoriesFilterInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/dtos/input/category.input'
import {
  CreateCategoryInputSchema,
  UpdateCategoryInputSchema,
} from '@/dtos/input/category.input.schema'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { CategoryModel } from '@/models/category.model'
import { CategoriesSummaryModel } from '@/models/category-summary.model'
import { UserModel } from '@/models/user.model'
import { CategoryService } from '@/services/category.service'
import { UserService } from '@/services/user.service'
import { isLeft } from '@/utils/either'

@Resolver(() => CategoryModel)
@UseMiddleware(authMiddleware)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService = new CategoryService(),
    private readonly userService: UserService = new UserService()
  ) {}

  @Query(() => CategoriesSummaryModel)
  async categoriesSummary(
    @Arg('data', () => CategoriesFilterInput) data: CategoriesFilterInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoriesSummaryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    const summary = await this.categoryService.getCategoriesSummary(
      context.currentUserId,
      data.max
    )
    return summary
  }

  @Query(() => [CategoryModel])
  async categories(
    @Arg('data', () => CategoriesFilterInput) data: CategoriesFilterInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel[]> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    const categories = await this.categoryService.getCategories(
      context.currentUserId,
      data.max
    )
    return categories
  }

  @Mutation(() => CategoryModel)
  async createCategory(
    @Arg('data', () => CreateCategoryInput) data: CreateCategoryInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    try {
      const validated = CreateCategoryInputSchema.parse(data)
      const category = await this.categoryService.createCategory(
        validated,
        context.currentUserId
      )
      return category
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(
          `Validation error: ${err.issues.map(e => e.message).join(', ')}`
        )
      }
      throw err
    }
  }

  @Mutation(() => CategoryModel)
  async updateCategory(
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    try {
      const validated = UpdateCategoryInputSchema.parse(data)
      const category = await this.categoryService.updateCategory(
        validated,
        context.currentUserId
      )
      return category
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(
          `Validation error: ${err.issues.map(e => e.message).join(', ')}`
        )
      }
      throw err
    }
  }

  @Mutation(() => Boolean)
  async deleteCategory(
    @Arg('id', () => String) id: string,
    @Ctx() context: GraphQLContext
  ): Promise<boolean> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    const result = await this.categoryService.deleteCategory(
      id,
      context.currentUserId
    )
    if (isLeft(result)) throw result.left
    return result.right
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() category: CategoryModel): Promise<UserModel | null> {
    const user = await this.userService.getUser({ id: category.userId })
    if (isLeft(user)) throw user.left
    return user.right
  }
}
