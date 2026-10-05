import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['services/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'references/**'],
    environment: 'node',
  },
});
