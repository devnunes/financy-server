import { describe, expect, it, vi } from 'vitest'
import {
  clearSessionCookie,
  cookieUtils,
  getCookieFromHeader,
  setSessionCookie,
} from './cookie'

type ReplyWithSetCookie = {
  setCookie: ReturnType<typeof vi.fn>
}

type ReplyWithClearCookie = {
  clearCookie: ReturnType<typeof vi.fn>
}

type ReplyWithHeader = {
  header: ReturnType<typeof vi.fn>
}

describe('cookieUtils', () => {
  it('sets an http-only cookie with defaults', () => {
    const reply: ReplyWithSetCookie = {
      setCookie: vi.fn(),
    }

    cookieUtils.setHttpOnlyCookie(reply as never, 'accessToken', 'token-value')

    expect(reply.setCookie).toHaveBeenCalledWith(
      'accessToken',
      'token-value',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      })
    )
  })

  it('clears cookie using default options', () => {
    const reply: ReplyWithClearCookie = {
      clearCookie: vi.fn(),
    }

    cookieUtils.clearCookie(reply as never, 'accessToken')

    expect(reply.clearCookie).toHaveBeenCalledWith(
      'accessToken',
      expect.objectContaining({
        path: '/',
        maxAge: 0,
      })
    )
  })
})

describe('setSessionCookie', () => {
  it('serializes default session cookie', () => {
    const reply: ReplyWithHeader = {
      header: vi.fn(),
    }

    setSessionCookie(reply as never, 'session-token')

    expect(reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=session-token')
    )
    expect(reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('Max-Age=900')
    )
  })

  it('serializes session cookie with custom maxAge', () => {
    const reply: ReplyWithHeader = {
      header: vi.fn(),
    }

    setSessionCookie(reply as never, 'token=value', { maxAge: 10 })

    expect(reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('session_token=token%3Dvalue')
    )
    expect(reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('Max-Age=10')
    )
  })

  it('clears session cookie', () => {
    const reply: ReplyWithHeader = {
      header: vi.fn(),
    }

    clearSessionCookie(reply as never)

    expect(reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('Max-Age=0')
    )
  })
})

describe('getCookieFromHeader', () => {
  it('returns undefined when cookie header is missing', () => {
    expect(getCookieFromHeader(undefined, 'session_token')).toBeUndefined()
  })

  it('returns decoded cookie value when found', () => {
    const header = 'foo=bar; session_token=token%3Dvalue%3Dabc; another=value'

    const value = getCookieFromHeader(header, 'session_token')

    expect(value).toBe('token=value=abc')
  })

  it('returns undefined when cookie does not exist', () => {
    const header = 'foo=bar; another=value'

    expect(getCookieFromHeader(header, 'session_token')).toBeUndefined()
  })
})
