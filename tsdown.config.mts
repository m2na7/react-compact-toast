import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'esbuild';
import { defineConfig, type TsdownPlugin } from 'tsdown';

const INLINE_QUERY = '?inline';
// Virtual module ids for inlined stylesheets. The `\0` prefix marks them as
// virtual (rollup/rolldown convention) and the suffix keeps them from matching
// any `*.css` / `?inline` filters of other CSS plugins.
const VIRTUAL_PREFIX = '\0inline-css:';
const VIRTUAL_SUFFIX = '~text';

/**
 * Resolves `import css from './x.css?inline'` to a default-exported string of
 * the esbuild-minified stylesheet, and emits the same minified CSS as a
 * sibling asset. Vite and Vitest support `?inline` natively; this plugin gives
 * tsdown (rolldown) the same behaviour, so the runtime style injector can
 * embed the stylesheet without emitting a CSS chunk or a CSS import, and
 * consumers who opt out of injection still get the minified file.
 */
function inlineCss({ emitAs }: { emitAs?: string } = {}): TsdownPlugin {
  return {
    name: 'inline-css',
    resolveId: {
      // Run before tsdown's optional CSS plugin, which also claims `?inline`.
      order: 'pre',
      handler(source, importer) {
        if (!source.endsWith(`.css${INLINE_QUERY}`) || !importer) return null;
        const file = path.resolve(
          path.dirname(importer),
          source.slice(0, -INLINE_QUERY.length)
        );
        return `${VIRTUAL_PREFIX}${file}${VIRTUAL_SUFFIX}`;
      },
    },
    load: {
      order: 'pre',
      async handler(id) {
        if (!id.startsWith(VIRTUAL_PREFIX)) return null;
        const file = id.slice(VIRTUAL_PREFIX.length, -VIRTUAL_SUFFIX.length);
        this.addWatchFile(file);
        const source = await readFile(file, 'utf8');
        const { code } = await transform(source, {
          loader: 'css',
          minify: true,
        });
        const css = code.trim();
        if (emitAs) {
          this.emitFile({ type: 'asset', fileName: emitAs, source: css });
        }
        return {
          code: `export default ${JSON.stringify(css)};`,
          map: null,
          moduleType: 'js',
        };
      },
    },
  };
}

const pkg = JSON.parse(
  await readFile(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string };

const shared = {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'browser',
  target: 'es2020',
  dts: true,
  sourcemap: true,
  minify: true,

  // The store is registered on globalThis under a version-scoped symbol, and
  // the injected <style> is tagged with the version, so two copies of the same
  // version share state while different versions stay independent.
  define: { __RCT_VERSION__: JSON.stringify(pkg.version) },
  deps: {
    neverBundle: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
  },
  // React Server Components: both bundles are client modules. The directive
  // must be the very first statement of each JS output (checked by
  // scripts/check-package.mjs).
  banner: { js: "'use client';" },
  // `./styles.css` is a stylesheet export, not a JS entrypoint; attw would
  // otherwise report it as an unresolvable module.
  attw: { excludeEntrypoints: ['./styles.css'] },
  publint: true,
} as const;

export default defineConfig([
  {
    ...shared,
    entry: ['src/index.ts'],
    // Also writes dist/styles.css for consumers that opt out of runtime
    // injection (`import 'react-compact-toast/styles.css'`).
    plugins: [inlineCss({ emitAs: 'styles.css' })],
  },
  {
    // Built separately, not as a second entry of the bundle above: a shared
    // chunk would make the default import pay ~0.6 kB for a split it never
    // uses. The two bundles duplicate the store's code, but the store itself
    // is a single instance registered on globalThis, so state stays shared.
    ...shared,
    entry: ['src/headless.ts'],
    attw: false,
    publint: false,
    plugins: [inlineCss()],
  },
]);
