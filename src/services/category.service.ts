import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/dtos/input/category.input'
import type { CategoryModel } from '@/models/category.model'
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
    })

    return categories
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
}
