import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { AuthInput } from '@/dtos/input/auth.input'
import {
  AuthOutput,
  type AuthOutputWithoutPassword,
} from '@/dtos/output/auth.output'
import type { GraphQLContext } from '@/graphql/context'
import type { UserModel } from '@/models/user.model'
import { AuthService } from '@/services/auth.service'
import { UserService } from '@/services/user.service'
import { cookieUtils } from '@/utils/cookie'
import { isLeft, isRight } from '@/utils/either'
import { jwtUtils } from '@/utils/jwt'

@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService = new UserService(),
    private readonly authService: AuthService = new AuthService()
  ) {}

  @Mutation(() => AuthOutput)
  async signUp(
    @Arg('data', () => AuthInput) data: AuthInput,
    @Ctx() context: GraphQLContext
  ): Promise<UserModel> {
    const validUser = await this.authService.getValidUser(data)
    if (isRight(validUser)) throw new Error('User already exists')

    const createUserInput = {
      name: data.name,
      email: data.email,
      password: data.password,
    }

    const user = await this.userService.createUser(createUserInput)
    const userId = user.id
    const accessToken = jwtUtils.signAccessToken(userId)
    const refreshToken = jwtUtils.signRefreshToken(userId)

    cookieUtils.setHttpOnlyCookie(context.reply, 'accessToken', accessToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    })

    cookieUtils.setHttpOnlyCookie(context.reply, 'refreshToken', refreshToken, {
      maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
      path: '/graphql',
    })

    return user
  }

  @Mutation(() => AuthOutput)
  async signIn(
    @Arg('data', () => AuthInput) data: AuthInput,
    @Ctx() context: GraphQLContext
  ): Promise<AuthOutputWithoutPassword> {
    const validUser = await this.authService.getValidUser(data)
    if (isLeft(validUser)) throw validUser.left

    const { id, name, email } = validUser.right

    const accessToken = jwtUtils.signAccessToken(id)
    const refreshToken = jwtUtils.signRefreshToken(id)

    cookieUtils.setHttpOnlyCookie(context.reply, 'accessToken', accessToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    })

    cookieUtils.setHttpOnlyCookie(context.reply, 'refreshToken', refreshToken, {
      maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
      path: '/graphql',
    })

    return { id, name, email }
  }

  @Mutation(() => Boolean)
  async signOut(@Ctx() context: GraphQLContext): Promise<boolean> {
    cookieUtils.clearCookie(context.reply, 'accessToken')
    cookieUtils.clearCookie(context.reply, 'refreshToken', {
      path: '/graphql',
    })
    return true
  }

  @Mutation(() => Boolean)
  async refreshToken(@Ctx() context: GraphQLContext): Promise<boolean> {
    const refreshToken = context.request.cookies?.refreshToken
    if (!refreshToken) throw new Error('No refresh token provided')

    const decodedResult = jwtUtils.verifyTokenEither(refreshToken)
    if (isLeft(decodedResult) || decodedResult.right.type !== 'refresh') {
      cookieUtils.clearCookie(context.reply, 'accessToken')
      cookieUtils.clearCookie(context.reply, 'refreshToken', {
        path: '/graphql',
      })
      throw new Error('Session expired. Please log in again.')
    }

    const newAccessToken = jwtUtils.signAccessToken(decodedResult.right.userId)

    cookieUtils.setHttpOnlyCookie(
      context.reply,
      'accessToken',
      newAccessToken,
      {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      }
    )

    return true
  }
}
