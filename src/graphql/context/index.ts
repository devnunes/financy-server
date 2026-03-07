import type { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { type JwtPayload, verifyJwt } from '@/utils/jwt'

export type GraphQLContext = {
  userId: string | undefined
  token: string | undefined
  req: FastifyRequest
  res: FastifyReply
}

function getUserIdFromToken(token: string | undefined): string | undefined {
  if (!token) return undefined
  try {
    const { id } = verifyJwt(token) as JwtPayload
    return id
  } catch (_error) {
    return undefined
  }
}

export const buildContext: ApolloFastifyContextFunction<
  GraphQLContext
> = async (req, res) => {
  const rawAuthorization = req.headers.authorization
  const authHeader = Array.isArray(rawAuthorization)
    ? (rawAuthorization[0] ?? '')
    : (rawAuthorization ?? '')
  const token = authHeader.replace('Bearer ', '')
  const userId = getUserIdFromToken(token)

  return { userId, token, req, res }
}
