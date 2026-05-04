import type { FastifyReply } from 'fastify'
import { env } from '@/env'

export const SESSION_COOKIE_NAME = 'session_token'
const SESSION_COOKIE_MAX_AGE_SECONDS = 15 * 60

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

function isSecureCookieEnabled(): boolean {
  if (env.NODE_ENV === 'production') return true
  return (env.WEB_URL ?? '').startsWith('https://')
}

function serializeCookie(name: string, value: string): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ]

  if (isSecureCookieEnabled()) {
    parts.push('Secure')
  }

  return parts.join('; ')
}

export function setSessionCookie(
  reply: FastifyReply,
  token: string,
  options?: { maxAge?: number }
): void {
  if (options?.maxAge !== undefined) {
    const parts = [
      `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
      'Path=/',
      `Max-Age=${options.maxAge}`,
      'HttpOnly',
      'SameSite=Lax',
    ]

    if (isSecureCookieEnabled()) {
      parts.push('Secure')
    }

    reply.header('Set-Cookie', parts.join('; '))
    return
  }

  reply.header('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, token))
}

export function clearSessionCookie(reply: FastifyReply): void {
  setSessionCookie(reply, '', { maxAge: 0 })
}

export function getCookieFromHeader(
  cookieHeader: string | undefined,
  cookieName: string
): string | undefined {
  if (!cookieHeader) return undefined

  const cookies = cookieHeader.split(';')

  for (const cookie of cookies) {
    const [name, ...rawValue] = cookie.trim().split('=')
    if (name !== cookieName || rawValue.length === 0) continue

    const value = rawValue.join('=')
    return decodeURIComponent(value)
  }

  return undefined
}
