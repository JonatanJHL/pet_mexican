import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Busca tests en todos los packages
    include: ['packages/*/src/__tests__/**/*.test.ts'],
    // Reporte bonito en la terminal
    reporter: ['verbose'],
    // Cobertura con v8 (más rápido que istanbul)
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/__tests__/**', 'packages/vscode/**'],
      reporter: ['text', 'html'],
      thresholds: {
        // Mínimos que Xolito considera aceptables
        lines:     80,
        functions: 80,
        branches:  70,
      },
    },
    // Variables globales de vitest (describe, it, expect) sin importar
    globals: true,
  },
});
