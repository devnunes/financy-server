import type { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { isLeft } from '@/utils/either'
import { jwtUtils } from '@/utils/jwt'

export type GraphQLContext = {
  request: FastifyRequest
  reply: FastifyReply
  currentUserId: string | undefined
}

export const buildContext: ApolloFastifyContextFunction<
  GraphQLContext
> = async (request, reply) => {
  const fowardResponse = { request, reply, currentUserId: undefined }
  const token = request.cookies?.accessToken
  if (!token) {
    return fowardResponse
  }
  const decodedResult = jwtUtils.verifyTokenEither(token)
  if (isLeft(decodedResult)) {
    return fowardResponse
  }
  const decoded = decodedResult.right
  if (decoded.type === 'access') {
    Object.assign(fowardResponse, { currentUserId: decoded.userId })
  }
  return fowardResponse
}
