import { z } from 'zod/v4'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string().startsWith('file:'),
  JWT_SECRET: z.string().min(1),
  WEB_URL: z.url().optional(),
})

export const env = envSchema.parse(process.env)
