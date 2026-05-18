// test-utils.ts

import { faker } from '@faker-js/faker'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { vi } from 'vitest'
import type { GraphQLContext } from '@/graphql/context/index.ts'

export const globalMockTransactionService = {
  createTransaction: vi.fn(),
  getTransaction: vi.fn(),
  getTransactions: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  getOneTransaction: vi.fn(),
  getTransactionSummary: vi.fn(),
}

export const globalMockCategoryService = {
  createCategory: vi.fn(),
  getCategory: vi.fn(),
  getCategories: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  categoryBelongsToUser: vi.fn(),
  getCategoriesSummary: vi.fn(),
}

export const globalMockUserService = {
  createUser: vi.fn(),
  getUser: vi.fn(),
  updateUser: vi.fn(),
  monthIncome: vi.fn(),
  monthExpense: vi.fn(),
}

export const globalMockAuthService = {
  getValidUser: vi.fn(),
}

export const createMockContext = (
  overrides?: Partial<GraphQLContext>
): GraphQLContext => {
  const mockReq = {
    cookies: {},
    ip: '127.0.0.1',
  } as unknown as FastifyRequest

  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
    setCookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  } as unknown as FastifyReply

  return {
    request: mockReq,
    reply: mockReply,
    currentUserId: faker.string.uuid(),
    ...overrides,
  }
}
