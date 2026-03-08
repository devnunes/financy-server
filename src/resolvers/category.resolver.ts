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
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/dtos/input/category.input'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { CategoryModel } from '@/models/category.model'
import { UserModel } from '@/models/user.model'
import { CategoryService } from '@/services/category.service'
import { UserService } from '@/services/user.service'

type CategoryResolverDeps = {
  categoryService?: Pick<
    CategoryService,
    'createCategory' | 'getCategories' | 'updateCategory' | 'deleteCategory'
  >
  userService?: Pick<UserService, 'getUserById'>
}

@Resolver(() => CategoryModel)
@UseMiddleware(authMiddleware)
export class CategoryResolver {
  private categoryService: Pick<
    CategoryService,
    'createCategory' | 'getCategories' | 'updateCategory' | 'deleteCategory'
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
    if (!context.userId) throw new Error('Unauthorized')

    return this.categoryService.createCategory(data, context.userId)
  }

  @Query(() => [CategoryModel])
  async getCategories(
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel[]> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.categoryService.getCategories(context.userId)
  }

  @Mutation(() => CategoryModel)
  async updateCategory(
    @Arg('data', () => UpdateCategoryInput) data: UpdateCategoryInput,
    @Ctx() context: GraphQLContext
  ): Promise<CategoryModel> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.categoryService.updateCategory(data, context.userId)
  }

  @Mutation(() => Boolean)
  async deleteCategory(
    @Arg('id', () => String) id: string,
    @Ctx() context: GraphQLContext
  ): Promise<boolean> {
    if (!context.userId) throw new Error('Unauthorized')

    return this.categoryService.deleteCategory(id, context.userId)
  }

  @FieldResolver(() => UserModel, { nullable: true })
  async user(@Root() category: CategoryModel): Promise<UserModel | null> {
    return this.userService.getUserById(category.userId)
  }
}
