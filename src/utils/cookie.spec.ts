import { describe, expect, it, vi } from 'vitest'
import { cookieUtils } from './cookie'

type ReplyWithSetCookie = {
  setCookie: ReturnType<typeof vi.fn>
}

type ReplyWithClearCookie = {
  clearCookie: ReturnType<typeof vi.fn>
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
