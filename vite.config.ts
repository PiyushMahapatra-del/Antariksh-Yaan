import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';

let commitHash = 'dev-build';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (_e) {
  // fallback if git command fails
}

export default defineConfig({
  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(commitHash),
  },
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
  worker: {
    format: 'es',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  server: {
    open: true,
  },
});
