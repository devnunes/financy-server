import { describe, expect, it } from 'vitest'
import { createCategoryFactory } from '@/test/factories/category.factory'
import { createUserFactory } from '@/test/factories/user.factory'
import { CategoryService } from './category.service'

describe('CategoryService.createCategory', () => {
  it('should create a category', async () => {
    const user = await createUserFactory()

    const service = new CategoryService()

    const category = await service.createCategory(
      {
        title: 'Test category',
        description: 'Test description',
        icon: 'test-icon',
        color: '#ff0000',
      },
      user.id
    )

    expect(category).toHaveProperty('id')
    expect(category.title).toBe('Test category')
    expect(category.userId).toBe(user.id)
  })
})

// it('throws when credentials are invalid', async () => {
//   const service = new TransactionService()

//   await expect(
//     service.createTransaction(
//       {
//         amount: 100,
//         description: 'Test transaction',
//         type: 'income',
//         category: 'salary',
//         date: new Date(),
//       },
//       'invalid-user-id'
//     )
//   ).rejects.toThrow('User not found')
// })

describe('CategoryService.getCategories', () => {
  it('should get categories for a user', async () => {
    const user = await createUserFactory()

    const service = new CategoryService()
    const category1 = await createCategoryFactory(user.id)
    const category2 = await createCategoryFactory(user.id)

    const categories = await service.getCategories(user.id)

    expect(categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining(category1),
        expect.objectContaining(category2),
      ])
    )
  })
})

describe('CategoryService.updateCategory', () => {
  it('should update a category', async () => {
    const user = await createUserFactory()
    const category = await createCategoryFactory(user.id)

    const service = new CategoryService()

    const updatedCategory = await service.updateCategory(
      {
        id: category.id,
        title: 'Updated category',
      },
      user.id
    )

    expect(updatedCategory.id).toBe(category.id)
    expect(updatedCategory.title).toBe('Updated category')
    expect(updatedCategory.userId).toBe(user.id)
  })
})

describe('CategoryService.deleteCategory', () => {
  it('should delete a category', async () => {
    const user = await createUserFactory()
    const category = await createCategoryFactory(user.id)

    const service = new CategoryService()

    const result = await service.deleteCategory(category.id, user.id)

    expect(result).toBe(true)
    const deletedCategory = await service.getCategories(user.id)
    expect(deletedCategory).not.toEqual(
      expect.arrayContaining([expect.objectContaining(category)])
    )
  })
})
