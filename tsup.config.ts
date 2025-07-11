import { defineConfig } from 'tsup';

export default defineConfig([
  // Main bundle with injected styles
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
    injectStyle: true,
    minify: true,
    outDir: 'dist',
    treeshake: true,
    target: 'es2018',
  },
  // CSS file
  {
    entry: ['src/styles.css'],
    outDir: 'dist',
    clean: false,
  },
]);
