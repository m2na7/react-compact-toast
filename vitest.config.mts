import { readFileSync } from 'node:fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string };

export default defineConfig({
  plugins: [react()],
  define: { __RCT_VERSION__: JSON.stringify(`${version}-test`) },
  test: {
    environment: 'jsdom',
    globals: false,
    // The runtime style injector imports `styles.css?inline`; without this
    // Vitest would stub it to an empty string and the injection tests would
    // pass while shipping no CSS.
    css: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.cy.tsx',
        'src/env.d.ts',
        'src/index.ts',
      ],
    },
  },
});
