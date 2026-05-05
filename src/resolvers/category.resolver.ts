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

type CategoryResolverDeps = {
  categoryService?: Pick<
    CategoryService,
    | 'createCategory'
    | 'getCategories'
    | 'updateCategory'
    | 'deleteCategory'
    | 'getCategoriesSummary'
  >
  userService?: Pick<UserService, 'getUserById'>
}

@Resolver(() => CategoryModel)
@UseMiddleware(authMiddleware)
export class CategoryResolver {
  private categoryService: Pick<
    CategoryService,
    | 'createCategory'
    | 'getCategories'
    | 'updateCategory'
    | 'deleteCategory'
    | 'getCategoriesSummary'
  >
  private userService: Pick<UserService, 'getUserById'>
  constructor(deps?: CategoryResolverDeps) {
    this.categoryService = deps?.categoryService ?? new CategoryService()
    this.userService = deps?.userService ?? new UserService()
  }

  @Mutation(() => CategoryModel)
  async createCategory(
    @Arg('data', () => CreateCategoryInput) data: CreateCategoryInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    try {
      const validated = CreateCategoryInputSchema.parse(data)
      return this.categoryService.createCategory(
        validated,
        context.currentUserId
      )
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(
          `Validation error: ${err.issues.map(e => e.message).join(', ')}`
        )
      }
      throw err
    }
  }

  @Query(() => [CategoryModel])
  async getCategories(
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel[]> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    return this.categoryService.getCategories(context.currentUserId)
  }

  @Mutation(() => CategoryModel)
  async updateCategory(
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')
    try {
      const validated = UpdateCategoryInputSchema.parse(data)
      return this.categoryService.updateCategory(
        validated,
        context.currentUserId
      )
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

    return this.categoryService.deleteCategory(id, context.currentUserId)
  }

  @Query(() => CategoriesSummaryModel)
  async getCategoriesSummary(
    @Ctx() context: GraphQLContext
  ): Promise<CategoriesSummaryModel> {
    if (!context.currentUserId) throw new Error('Unauthorized')

    return this.categoryService.getCategoriesSummary(context.currentUserId)
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() category: CategoryModel): Promise<UserModel | null> {
    return this.userService.getUserById(category.userId)
  }
}
