import type { FastifyReply } from 'fastify'
import { CookieSerializeOptions } from '@fastify/cookie';
import { env } from '@/env'

export const SESSION_COOKIE_NAME = 'session_token'
const SESSION_COOKIE_MAX_AGE_SECONDS = 15 * 60

function isSecureCookieEnabled(): boolean {
  if (env.NODE_ENV === 'production') return true
  return (env.WEB_URL ?? '').startsWith('https://')
}


export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
  path: '/',
  httpOnly: true,
  secure: isSecureCookieEnabled(),
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 7 days
};

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
