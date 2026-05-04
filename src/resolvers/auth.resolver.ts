import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import { SignInOutput, SignUpOutput } from '@/dtos/output/auth.output'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { cookieUtils } from '@/utils/cookie'
import { isLeft } from '@/utils/either'
import { jwtUtils } from '@/utils/jwt'

type AuthResolverDeps = {
  authService?: Pick<AuthService, 'signUp' | 'validateUser'>
}
@Resolver()
export class AuthResolver {
  private authService: Pick<AuthService, 'signUp' | 'validateUser'>
  constructor(deps?: AuthResolverDeps) {
    this.authService = deps?.authService ?? new AuthService()
  }

  @Mutation(() => SignUpOutput)
  async signUp(
    @Arg('data', () => SignUpInput) data: SignUpInput,
    @Ctx() context: GraphQLContext
  ): Promise<SignUpOutput> {
    const result = await this.authService.signUp(data)
    if (isLeft(result)) throw result.left
    const userId = result.right.user.id
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

    return result.right
  }

  @Mutation(() => SignInOutput)
  async signIn(
    @Arg('data', () => SignInInput) data: SignInInput,
    @Ctx() context: GraphQLContext
  ): Promise<SignInOutput> {
    const result = await this.authService.validateUser(data)
    if (isLeft(result)) throw result.left
    const user = result.right.user

    const accessToken = jwtUtils.signAccessToken(user.id)
    const refreshToken = jwtUtils.signRefreshToken(user.id)

    cookieUtils.setHttpOnlyCookie(context.reply, 'accessToken', accessToken, {
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    })

    cookieUtils.setHttpOnlyCookie(context.reply, 'refreshToken', refreshToken, {
      maxAge: 14 * 24 * 60 * 60, // 14 days in seconds
      path: '/graphql',
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      } as SignInOutput['user'],
    }
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
