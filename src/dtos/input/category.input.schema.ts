import { z } from 'zod'

export const CreateCategoryInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z
    .string()
    .trim()
    .max(255, 'Description must have at most 255 characters')
    .optional()
    .nullable()
    .transform(description => description ?? ''),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().min(1, 'Color is required'),
})

export const UpdateCategoryInputSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  title: z.string().trim().min(1, 'Title is required').optional(),
  description: z
    .string()
    .trim()
    .max(255, 'Description must have at most 255 characters')
    .optional()
    .nullable()
    .transform(description => {
      if (description === undefined) return undefined
      return description ?? ''
    }),
  icon: z.string().optional(),
  color: z.string().optional(),
  userId: z.uuid().optional(),
})
