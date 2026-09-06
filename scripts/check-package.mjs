#!/usr/bin/env node
/**
 * Package smoke test.
 *
 * Packs the library with `pnpm pack`, installs the tarball into a throwaway
 * project next to React, and verifies the published surface the way a consumer
 * sees it:
 *
 *   - ESM `import()` and CJS `require()` both resolve and expose the public API
 *   - both JS entries start with the `'use client'` directive
 *   - neither JS entry imports/requires a `.css` file (styles are injected at
 *     runtime; the stylesheet is an optional subpath export)
 *   - `react-compact-toast/styles.css` and `react-compact-toast/package.json`
 *     resolve from ESM and CJS
 *   - `attw` (Are The Types Wrong) and `publint` pass on the tarball
 *
 * `pnpm pack` runs the package's `prepack` script, so the tarball is always
 * built from the current source and the current version. Uses Node built-ins only.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const NAME = pkg.name;
const EXPECTED_EXPORTS = [
  'toast',
  'ToastContainer',
  'Toast',
  'useToast',
  'useToastContainer',
];
const USE_CLIENT = /^(['"])use client\1;?$/;
const CSS_IMPORT =
  /\b(?:import\s*(?:[\w${},*\s]+from\s*)?|require\s*\(\s*)['"][^'"]+\.css['"]/;

const failures = [];
function check(ok, message, detail) {
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${message}`);
  if (!ok) {
    if (detail)
      console.log(`        ${String(detail).split('\n').join('\n        ')}`);
    failures.push(message);
  }
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.error) throw result.error;
  return result;
}

function runOrThrow(cmd, args, options = {}) {
  const result = run(cmd, args, options);
  if (result.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(' ')} failed (exit ${result.status})\n${result.stdout}\n${result.stderr}`
    );
  }
  return result;
}

const tmp = mkdtempSync(path.join(tmpdir(), 'rct-package-'));
try {
  // 1. pack ------------------------------------------------------------------
  console.log(`\n> pnpm pack (${tmp})`);
  runOrThrow('pnpm', ['pack', '--pack-destination', tmp], { cwd: root });
  const tarball = readdirSync(tmp)
    .filter((f) => f.endsWith('.tgz'))
    .map((f) => path.join(tmp, f))[0];
  check(Boolean(tarball), 'pnpm pack produced a tarball');
  if (!tarball) throw new Error('no tarball produced');

  // 2. install into a throwaway consumer ------------------------------------
  const consumer = path.join(tmp, 'consumer');
  mkdirSync(consumer);
  writeFileSync(
    path.join(consumer, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true }, null, 2)
  );
  console.log('> npm install react react-dom @types/react <tarball>');
  runOrThrow(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--no-package-lock',
      '--loglevel=error',
      'react@19',
      'react-dom@19',
      '@types/react@19',
      '@types/react-dom@19',
      tarball,
    ],
    { cwd: consumer }
  );

  // 3. resolve + import from inside the consumer ----------------------------
  const smoke = `
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const NAME = ${JSON.stringify(NAME)};
const require = createRequire(import.meta.url);
const out = { errors: {} };
const attempt = (key, fn) => { try { out[key] = fn(); } catch (e) { out.errors[key] = String(e && e.message || e); } };
const url = (specifier) => fileURLToPath(import.meta.resolve(specifier));

await (async () => {
  try { out.esmExports = Object.keys(await import(NAME)); } catch (e) { out.errors.esmExports = String(e && e.stack || e); }
})();
attempt('cjsExports', () => Object.keys(require(NAME)));
attempt('esmEntry', () => url(NAME));
attempt('cjsEntry', () => require.resolve(NAME));
attempt('esmPackageJson', () => url(NAME + '/package.json'));
attempt('cjsPackageJson', () => require.resolve(NAME + '/package.json'));
attempt('esmHeadless', () => url(NAME + '/headless'));
attempt('cjsHeadless', () => require.resolve(NAME + '/headless'));
attempt('cjsHeadlessExports', () => Object.keys(require(NAME + '/headless')));
await (async () => {
  try { out.headlessExports = Object.keys(await import(NAME + '/headless')); } catch (e) { out.errors.headlessExports = String(e && e.stack || e); }
})();
if (out.esmHeadless) out.headlessSource = readFileSync(out.esmHeadless, 'utf8');
attempt('esmStyles', () => url(NAME + '/styles.css'));
attempt('cjsStyles', () => require.resolve(NAME + '/styles.css'));
for (const key of ['esmEntry', 'cjsEntry']) {
  if (!out[key]) continue;
  const code = readFileSync(out[key], 'utf8');
  out[key + 'FirstLine'] = code.split(/\\r?\\n/)[0].trim();
  out[key + 'Source'] = code;
}
out.stylesExists = Boolean(out.esmStyles && existsSync(out.esmStyles));
process.stdout.write('\\n__RESULT__' + JSON.stringify(out));
`;
  writeFileSync(path.join(consumer, 'smoke.mjs'), smoke);
  console.log('> node smoke.mjs');
  const smokeRun = run(process.execPath, ['smoke.mjs'], { cwd: consumer });
  const marker = smokeRun.stdout.lastIndexOf('__RESULT__');
  if (smokeRun.status !== 0 || marker === -1) {
    throw new Error(
      `smoke.mjs failed (exit ${smokeRun.status})\n${smokeRun.stdout}\n${smokeRun.stderr}`
    );
  }
  const r = JSON.parse(smokeRun.stdout.slice(marker + '__RESULT__'.length));

  const missing = (list = []) =>
    EXPECTED_EXPORTS.filter((e) => !list.includes(e));
  check(
    r.esmExports && missing(r.esmExports).length === 0,
    `ESM import() exposes ${EXPECTED_EXPORTS.join(', ')}`,
    r.errors.esmExports ?? `missing: ${missing(r.esmExports).join(', ')}`
  );
  check(
    r.cjsExports && missing(r.cjsExports).length === 0,
    `CJS require() exposes ${EXPECTED_EXPORTS.join(', ')}`,
    r.errors.cjsExports ?? `missing: ${missing(r.cjsExports).join(', ')}`
  );
  check(
    r.esmEntry?.endsWith(path.join('dist', 'index.mjs')),
    'ESM entry resolves to dist/index.mjs',
    r.errors.esmEntry ?? r.esmEntry
  );
  check(
    r.cjsEntry?.endsWith(path.join('dist', 'index.js')),
    'CJS entry resolves to dist/index.js',
    r.errors.cjsEntry ?? r.cjsEntry
  );
  check(
    USE_CLIENT.test(r.esmEntryFirstLine ?? ''),
    `dist/index.mjs starts with 'use client'`,
    JSON.stringify(r.esmEntryFirstLine)
  );
  check(
    USE_CLIENT.test(r.cjsEntryFirstLine ?? ''),
    `dist/index.js starts with 'use client'`,
    JSON.stringify(r.cjsEntryFirstLine)
  );
  check(
    r.esmEntrySource != null && !CSS_IMPORT.test(r.esmEntrySource),
    'dist/index.mjs does not import a .css file',
    r.esmEntrySource?.match(CSS_IMPORT)?.[0]
  );
  check(
    r.cjsEntrySource != null && !CSS_IMPORT.test(r.cjsEntrySource),
    'dist/index.js does not require a .css file',
    r.cjsEntrySource?.match(CSS_IMPORT)?.[0]
  );
  check(
    r.esmStyles && r.cjsStyles && r.stylesExists,
    `${NAME}/styles.css resolves (ESM + CJS) and exists`,
    r.errors.esmStyles ?? r.errors.cjsStyles
  );
  check(
    r.esmPackageJson && r.cjsPackageJson,
    `${NAME}/package.json resolves (ESM + CJS)`,
    r.errors.esmPackageJson ?? r.errors.cjsPackageJson
  );

  const headlessMissing = ['toast', 'useToast', 'useToastContainer'].filter(
    (e) => !(r.headlessExports ?? []).includes(e)
  );
  check(
    headlessMissing.length === 0,
    `${NAME}/headless exposes toast, useToast, useToastContainer`,
    r.errors.headlessExports ?? `missing: ${headlessMissing.join(', ')}`
  );
  const cjsHeadlessMissing = ['toast', 'useToast', 'useToastContainer'].filter(
    (e) => !(r.cjsHeadlessExports ?? []).includes(e)
  );
  check(
    cjsHeadlessMissing.length === 0,
    `${NAME}/headless loads through require() too`,
    r.errors.cjsHeadlessExports ?? `missing: ${cjsHeadlessMissing.join(', ')}`
  );
  check(
    !(r.headlessExports ?? []).includes('ToastContainer'),
    `${NAME}/headless does not pull in the built-in components`
  );
  check(
    r.headlessSource != null &&
      !r.headlessSource.includes('@keyframes rct-') &&
      !r.headlessSource.includes('data-rct-styled'),
    `${NAME}/headless carries no stylesheet`,
    'the CSS string leaked into the headless bundle'
  );

  // 4. the stylesheet must travel inside the JS ------------------------------
  // 0.2.3 shipped a bundle with no styles at all; this is the guard.
  for (const [file, source] of [
    ['dist/index.mjs', r.esmEntrySource],
    ['dist/index.js', r.cjsEntrySource],
  ]) {
    check(
      source?.includes('[data-rct-toast]') &&
        source.includes('@keyframes rct-'),
      `${file} embeds the stylesheet`,
      'the injected CSS string is missing or empty'
    );
  }

  // 5. declaration files must stay valid ambient TypeScript ------------------
  // A `'use client'` banner leaking into a .d.ts is TS1036 for consumers that
  // do not skip lib checks.
  const installed = path.dirname(r.esmEntry ?? '');
  for (const file of ['index.d.ts', 'index.d.mts']) {
    const declaration = path.join(installed, file);
    const firstLine = existsSync(declaration)
      ? readFileSync(declaration, 'utf8').split(/\r?\n/)[0].trim()
      : null;
    check(
      firstLine !== null && !USE_CLIENT.test(firstLine),
      `dist/${file} has no 'use client' directive`,
      JSON.stringify(firstLine)
    );
  }

  // Two files: `valid.tsx` must compile with no errors at all, so a broken
  // public type shows up; `invalid.tsx` must fail, so we know the check can
  // still see errors.
  writeFileSync(
    path.join(consumer, 'valid.tsx'),
    `import { ToastContainer, Toast, toast, useToast, useToastContainer,\n` +
      `  type ToastOptions, type ToastContainerProps } from '${NAME}';\n` +
      `import { toast as headlessToast } from '${NAME}/headless';\n` +
      `const options: ToastOptions = { text: 'hi', type: 'success' };\n` +
      `const props: ToastContainerProps = { position: 'topRight', limit: 3 };\n` +
      `export const App = () => <ToastContainer {...props} />;\n` +
      `export const Custom = () => <Toast id="a" text="b" />;\n` +
      `export const go = () => {\n` +
      `  const id = toast(options);\n` +
      `  toast.success('ok', { position: 'topLeft' });\n` +
      `  toast.promise(Promise.resolve(1), { loading: 'l', success: 's', error: 'e' });\n` +
      `  toast.update(id, { text: 'x' });\n` +
      `  headlessToast('hi');\n` +
      `  return toast.isActive(id);\n` +
      `};\n` +
      `export const hooks = () => [useToast('a'), useToastContainer()];\n`
  );
  writeFileSync(
    path.join(consumer, 'invalid.tsx'),
    `import { ToastContainer } from '${NAME}';\n` +
      `export const Bad = () => <ToastContainer onlyForTypeCheck={1} />;\n`
  );
  writeFileSync(
    path.join(consumer, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          target: 'es2020',
          lib: ['dom', 'es2020'],
          jsx: 'react-jsx',
        },
        include: ['valid.tsx'],
      },
      null,
      2
    )
  );
  console.log('> tsc (consumer, skipLibCheck: false)');
  const validRun = run('pnpm', ['exec', 'tsc', '-p', consumer], { cwd: root });
  const validOut = validRun.stdout + validRun.stderr;
  check(
    validRun.status === 0 && !validOut.includes('error'),
    'a realistic consumer type-checks with skipLibCheck disabled',
    validOut
  );

  writeFileSync(
    path.join(consumer, 'tsconfig.invalid.json'),
    JSON.stringify({ extends: './tsconfig.json', include: ['invalid.tsx'] })
  );
  const invalidRun = run(
    'pnpm',
    ['exec', 'tsc', '-p', path.join(consumer, 'tsconfig.invalid.json')],
    { cwd: root }
  );
  check(
    invalidRun.status !== 0 &&
      (invalidRun.stdout + invalidRun.stderr).includes('onlyForTypeCheck'),
    'unknown props on ToastContainer are still rejected',
    invalidRun.stdout + invalidRun.stderr
  );

  // 6. attw + publint on the tarball ----------------------------------------
  console.log('> attw');
  // `./styles.css` is a stylesheet export, not a JS entrypoint.
  const attw = run(
    'pnpm',
    [
      'exec',
      'attw',
      tarball,
      '--format',
      'ascii',
      '--exclude-entrypoints',
      'styles.css',
    ],
    { cwd: root }
  );
  check(
    attw.status === 0,
    'attw reports no problems',
    attw.stdout + attw.stderr
  );

  console.log('> publint');
  const publint = run('pnpm', ['exec', 'publint', 'run', tarball, '--strict'], {
    cwd: root,
  });
  check(
    publint.status === 0,
    'publint reports no problems',
    publint.stdout + publint.stderr
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\n${failures.length} package check(s) failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nPackage checks passed.');
