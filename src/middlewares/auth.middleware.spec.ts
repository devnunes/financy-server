import { describe, expect, it, vi } from 'vitest'
import type { GraphQLContext } from '@/graphql/context'
import { authMiddleware } from './auth.middleware'

describe('authMiddleware', () => {
  it('throws Unauthorized when context has no userId', async () => {
    const next = vi.fn()

    await expect(
      authMiddleware(
        {
          context: {
            userId: undefined,
          } as GraphQLContext,
        } as never,
        next
      )
    ).rejects.toThrow('Unauthorized')

    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when user is authenticated', async () => {
    const next = vi.fn().mockResolvedValue('ok')

    const result = await authMiddleware(
      {
        context: {
          userId: 'user-id',
        } as GraphQLContext,
      } as never,
      next
    )

    expect(next).toHaveBeenCalledTimes(1)
    expect(result).toBe('ok')
  })
})
