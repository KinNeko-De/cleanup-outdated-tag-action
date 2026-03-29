import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['json-summary', 'text', 'lcov'],
      include: ['src/**'],
      reportsDirectory: './coverage'
    }
  }
})
