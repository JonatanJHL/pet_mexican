import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/*/src/__tests__/**/*.test.ts'],
    globals: true,
    environment: 'node',
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/__tests__/**', 'packages/vscode/**'],
      reporter: ['text', 'html'],
    },
  },
});