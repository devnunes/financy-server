import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/dtos/input/category.input'
import type { CategoryModel } from '@/models/category.model'
import type { CategoriesSummaryModel } from '@/models/category-summary.model'
import { prismaClient } from '@/prisma/prisma'

export class CategoryService {
  async createCategory(
    data: CreateCategoryInput,
    userId: string
  ): Promise<CategoryModel> {
    return prismaClient.category.create({
      data: {
        ...data,
        userId,
      },
    })
  }

  async getCategories(userId: string): Promise<CategoryModel[]> {
    const categories = await prismaClient.category.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    return categories.map(category => ({
      ...category,
      transactionCount: category._count.transactions,
    }))
  }

  async getCategoryById(id: string): Promise<CategoryModel | null> {
    return await prismaClient.category.findUnique({
      where: { id },
    })
  }

  async updateCategory(
    data: UpdateCategoryInput,
    userId: string
  ): Promise<CategoryModel> {
    const category = await prismaClient.category.findUnique({
      where: { id: data.id },
    })

    if (!category) throw new Error('Category not found')
    if (category.userId !== userId) throw new Error('Unauthorized')

    return prismaClient.category.update({
      where: { id: data.id },
      data,
    })
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const category = await prismaClient.category.findUnique({
      where: { id },
    })

    if (!category) throw new Error('Category not found')
    if (category.userId !== userId) throw new Error('Unauthorized')

    await prismaClient.category.delete({
      where: { id },
    })

    return true
  }

  async categoryBelongsToUser(
    categoryId: string,
    userId: string
  ): Promise<boolean> {
    const category = await prismaClient.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) return false
    return category.userId === userId
  }

  async getCategoriesSummary(userId: string): Promise<CategoriesSummaryModel> {
    const categories = await prismaClient.category.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        color: true,
        icon: true,
      },
    })
    const transactionCountByUser = await prismaClient.transaction.aggregate({
      where: { userId },
      _count: { id: true },
    })

    const categoriesAggregated = await Promise.all(
      categories.map(async category => {
        const result = await prismaClient.transaction.aggregate({
          where: { categoryId: category.id },
          _sum: { amount: true },
          _count: { id: true },
        })

        return {
          ...category,
          transactionCountByCategory: result._count.id,
          totalAmount: result._sum.amount || 0,
        }
      })
    )

    return {
      transactionCountByUser: transactionCountByUser._count.id,
      categoryCount: categories.length,
      mostUsedCategory: categoriesAggregated.reduce((prev, current) =>
        prev.transactionCountByCategory > current.transactionCountByCategory
          ? prev
          : current
      ),
      categories: categoriesAggregated,
    }
  }
}
