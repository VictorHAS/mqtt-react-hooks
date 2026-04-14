import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.spec.{ts,tsx}'],
    setupFiles: ['./lib/setupTest.tsx'],
    globals: true,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.tsx'],
      exclude: ['lib/setupTest.tsx'],
      reporter: ['json', 'lcov', 'text'],
      thresholds: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
