import type { Secret, SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'
import { env } from '@/env'

export type JwtPayload = {
  id: string
  email: string
}

export const singJwt = (payload: JwtPayload, expiresIn?: string): string => {
  const secret: Secret = env.JWT_SECRET as unknown as Secret
  const options: SignOptions = expiresIn
    ? {
        expiresIn: expiresIn as unknown as NonNullable<
          SignOptions['expiresIn']
        >,
      }
    : {}

  return jwt.sign(payload, secret, options)
}

export const verifyJwt = (token: string): JwtPayload => {
  const secret: Secret = env.JWT_SECRET as unknown as Secret
  return jwt.verify(token, secret) as JwtPayload
}
