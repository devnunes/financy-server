import { Arg, Query, Resolver, UseMiddleware } from 'type-graphql'
import { CreateUserInput } from '@/dtos/input/user.input'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { UserModel } from '@/models/user.model'
import { UserService } from '@/services/user.service'

@Resolver(() => UserModel)
export class UserResolver {
  private userService: UserService
  constructor() {
    this.userService = new UserService()
  }

  @Query(() => String)
  async createUser(
    @Arg('data', () => CreateUserInput) data: CreateUserInput
  ): Promise<string> {
    const user = await this.userService.createUser(
      data.name,
      data.email,
      data.password
    )
    return user.id
  }

  @Query(() => UserModel)
  @UseMiddleware(authMiddleware)
  async getUser(@Arg('id', () => String) id: string): Promise<UserModel> {
    return this.userService.getUserById(id)
  }
}
