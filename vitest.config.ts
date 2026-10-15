/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@sim': resolve(__dirname, 'src/sim'),
      '@render': resolve(__dirname, 'src/render'),
      '@fsw': resolve(__dirname, 'src/fsw'),
      '@ai': resolve(__dirname, 'src/ai'),
      '@dtn': resolve(__dirname, 'src/dtn'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@data': resolve(__dirname, 'data'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
    },
  },
});
