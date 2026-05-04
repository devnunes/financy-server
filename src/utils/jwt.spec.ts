import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { isLeft, isRight } from './either'
import { jwtUtils } from './jwt'

describe('jwtUtils', () => {
  it('signs and verifies access tokens', () => {
    const userId = faker.string.uuid()
    const token = jwtUtils.signAccessToken(userId)

    const payload = jwtUtils.verifyToken(token)

    expect(payload.userId).toBe(userId)
    expect(payload.type).toBe('access')
  })

  it('signs and verifies refresh tokens', () => {
    const userId = faker.string.uuid()
    const token = jwtUtils.signRefreshToken(userId)

    const payload = jwtUtils.verifyToken(token)

    expect(payload.userId).toBe(userId)
    expect(payload.type).toBe('refresh')
  })

  it('returns right for valid token in Either verifier', () => {
    const userId = faker.string.uuid()
    const token = jwtUtils.signAccessToken(userId)

    const result = jwtUtils.verifyTokenEither(token)

    expect(isRight(result)).toBe(true)
    if (isRight(result)) {
      expect(result.right.userId).toBe(userId)
    }
  })

  it('returns left for invalid token in Either verifier', () => {
    const result = jwtUtils.verifyTokenEither('not-a-valid-token')

    expect(isLeft(result)).toBe(true)
    if (isLeft(result)) {
      expect(result.left).toBeInstanceOf(Error)
    }
  })
})
