import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { SignInInput, SignUpInput } from '@/dtos/input/auth.input'
import { SignInOutput, SignUpOutput } from '@/dtos/output/auth.output'
import type { GraphQLContext } from '@/graphql/context'
import { AuthService } from '@/services/auth.service'
import { clearSessionCookie, setSessionCookie } from '@/utils/cookie'
import { isLeft } from '@/utils/either'

type AuthResolverDeps = {
  authService?: Pick<AuthService, 'signUp' | 'signIn'>
}
@Resolver()
export class AuthResolver {
  private authService: Pick<AuthService, 'signUp' | 'signIn'>
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

    return result.right
  }

  @Mutation(() => SignInOutput)
  async signIn(
    @Arg('data', () => SignInInput) data: SignInInput,
    @Ctx() context: GraphQLContext
  ): Promise<SignInOutput> {
    const result = await this.authService.signIn(data)
    if (isLeft(result)) throw result.left

    setSessionCookie(context.res, result.right.token)

    return result.right
  }

  @Mutation(() => Boolean)
  async signOut(@Ctx() context: GraphQLContext): Promise<boolean> {
    clearSessionCookie(context.res)
    return true
  }
}
