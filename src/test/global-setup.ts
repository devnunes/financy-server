import { execSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { env } from '@/env'

function getSqlitePathFromUrl(databaseUrl: string) {
  return databaseUrl.replace(/^file:/, '')
}

export default async function globalSetup() {
  const dbPath = path.resolve(
    process.cwd(),
    getSqlitePathFromUrl(env.DATABASE_URL)
  )

  if (existsSync(dbPath)) rmSync(dbPath)

  // Recreate the test schema from existing migrations before running tests.
  execSync('pnpm exec prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: env.DATABASE_URL,
    },
  })

  return async () => {
    if (existsSync(dbPath)) rmSync(dbPath)
  }
}
