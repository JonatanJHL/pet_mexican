import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/src/__tests__/**/*.test.ts'],
    reporters: ['verbose'],
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/__tests__/**', 'packages/vscode/**'],
      reporter: ['text', 'html'],
      thresholds: {
        lines:     80,
        functions: 80,
        branches:  70,
      },
    },
  },
});
