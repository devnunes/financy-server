import jwt from 'jsonwebtoken'
import { env } from '@/env'
import { type Either, isLeft, isRight, makeLeft, makeRight } from './either'

export type TokenPayload = {
  userId: string
  email: string
  type: 'access' | 'refresh'
}

type JwtVerificationError = Error

function verifyWithSecret(
  token: string,
  secret: string
): Either<JwtVerificationError, TokenPayload> {
  try {
    return makeRight(jwt.verify(token, secret) as TokenPayload)
  } catch (error) {
    return makeLeft(
      error instanceof Error ? error : new Error('Invalid or expired token')
    )
  }
}

export const jwtUtils = {
  signAccessToken: (userId: string): string => {
    return jwt.sign({ userId, type: 'access' }, env.JWT_SECRET, {
      expiresIn: '7d',
    })
  },
  signRefreshToken: (userId: string): string => {
    return jwt.sign({ userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    })
  },
  verifyTokenEither: (
    token: string
  ): Either<JwtVerificationError, TokenPayload> => {
    const accessResult = verifyWithSecret(token, env.JWT_SECRET)
    if (isRight(accessResult)) return accessResult

    const refreshResult = verifyWithSecret(token, env.JWT_REFRESH_SECRET)
    if (isRight(refreshResult)) return refreshResult

    return makeLeft(refreshResult.left)
  },
  verifyToken: (token: string): TokenPayload => {
    const result = jwtUtils.verifyTokenEither(token)
    if (isLeft(result)) throw result.left

    return result.right
  },
}
