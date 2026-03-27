import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import { SignInOutput, SignUpOutput } from '@/dtos/output/auth.output'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { REFRESH_TOKEN_COOKIE_OPTIONS, setSessionCookie } from '@/utils/cookie'
import { isLeft } from '@/utils/either'

type AuthResolverDeps = {
  authService?: Pick<AuthService, 'signIn' | 'signUp'>
}
@Resolver()
export class AuthResolver {
  private authService: Pick<AuthService, 'signIn' | 'signUp'>
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

    setSessionCookie(context.res, result.right.token)
    context.res.setCookie('refreshToken', result.right.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })
    return result.right
  }

  @Mutation(() => SignInOutput)
  async signIn(
    @Arg('data', () => SignInInput) data: SignInInput,
    @Ctx() context: GraphQLContext
  ): Promise<SignInOutput> {
    const result = await this.authService.signIn(data)
    if (isLeft(result)) throw result.left
    context.res.setCookie('refreshToken', result.right.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)

    return result.right
  }

  @Mutation(() => Boolean)
  async signout(@Ctx() context: GraphQLContext): Promise<boolean> {
    setSessionCookie(context.res, '', { maxAge: -1 })
    context.res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' })
    return true
  }
}
