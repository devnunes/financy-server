import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { env } from './src/env'

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  migrations: {
    path: 'src/prisma/migrations',
    seed: 'tsx src/prisma/seed.ts',
  },
  datasource: {
    url: env.DATABASE_URL,
  },
})
