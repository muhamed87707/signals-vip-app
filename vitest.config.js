import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
});
