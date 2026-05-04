import { z } from 'zod'

export const CreateCategoryInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
})

export const UpdateCategoryInputSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  userId: z.uuid().optional(),
})
