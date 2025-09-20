import { defineConfig } from 'tsdown';

export default defineConfig([
  // Main bundle with injected styles
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom'],
    minify: true,
    outDir: 'dist',
    target: 'es2018',
  },
  // CSS file
  {
    entry: ['src/styles.css'],
    outDir: 'dist',
    clean: false,
  },
]);
