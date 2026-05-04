import { describe, expect, it } from 'vitest'
import { isLeft, isRight, makeLeft, makeRight, unwrapEither } from './either'

describe('either helpers', () => {
  it('identifies and unwraps left values', () => {
    const value = makeLeft(new Error('left-error'))

    expect(isLeft(value)).toBe(true)
    expect(isRight(value)).toBe(false)
    expect(unwrapEither(value)).toBeInstanceOf(Error)
  })

  it('identifies and unwraps right values', () => {
    const value = makeRight({ ok: true })

    expect(isRight(value)).toBe(true)
    expect(isLeft(value)).toBe(false)
    expect(unwrapEither(value)).toEqual({ ok: true })
  })

  it('throws when both left and right are present', () => {
    expect(() =>
      unwrapEither({
        left: 'left',
        right: 'right',
      } as never)
    ).toThrow('Received both left and right values')
  })

  it('throws when neither left nor right are present', () => {
    expect(() => unwrapEither({} as never)).toThrow(
      'Received no left or right values at runtime when opening Either'
    )
  })
})
