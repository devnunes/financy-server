import type { FastifyReply } from 'fastify'
import { env } from '@/env'

export const cookieUtils = {
  /**
   * Sets a secure, HTTP-only cookie on the response.
   * @param reply The Fastify reply object from the GraphQL context
   * @param name The name of the cookie (e.g., 'accessToken')
   * @param value The JWT string
   * @param options Additional cookie options (maxAge, path, etc.)
   */
  setHttpOnlyCookie: (
    reply: FastifyReply,
    name: string,
    value: string,
    options: { maxAge?: number; path?: string } = {}
  ): void => {
    reply.setCookie(name, value, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      ...options,
    })
  },

  /**
   * Clears a cookie from the user's browser. Useful for logging out or expired sessions.
   */
  clearCookie: (
    reply: FastifyReply,
    name: string,
    options: { maxAge?: number; path?: string } = { maxAge: 0 }
  ) => {
    reply.clearCookie(name, { path: '/', ...options })
  },
}
