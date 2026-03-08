import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    include: ['src/**/*.spec.ts'],
    globalSetup: ['./src/test/global-setup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text-summary', 'text', 'html'],
      skipFull: true,
      include: [
        'src/resolvers/**/*.ts',
        'src/services/**/*.ts',
        'src/middlewares/**/*.ts',
        'src/utils/**/*.ts',
        'src/prisma/prisma.ts',
      ],
      exclude: [
        'src/**/*.spec.ts',
        'src/test/**',
        'src/index.ts',
        'src/env.ts',
        'src/resolvers/index.ts',
        'src/dtos/**',
        'src/models/**',
        'src/prisma/generated/**',
      ],
    },
  },
})
