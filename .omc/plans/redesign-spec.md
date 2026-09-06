# react-compact-toast — redesign spec (v0.3.0 target)

Repo: /Users/m2na/orca/workspaces/react-compact-toast/seasnake (git worktree, branch m2na7/seasnake). Do NOT commit.
Current published version: 0.2.3. Goal: a production-quality, "1k-star" React toast library that stays tiny (< ~2.5 KB gz JS + < 1 KB gz CSS).
Peer deps: react ^18 || ^19. Target: modern evergreen browsers (2022+). Node for tooling: 20+.

## 0. Problems being fixed (all verified against the real code / npm tarballs)

1. 0.2.3 dropped runtime CSS injection when migrating tsup -> tsdown (tsdown has no `injectStyle`). README never says to import CSS. Result: unstyled toasts.
2. Toast removal depends solely on `animationend`; with no CSS / reduced-motion / `animate-none` the toast never leaves and the global counter jams at 6.
3. `TOAST_MAX_COUNT` check happens synchronously but the counter increments inside `setTimeout(0)` -> 20 sync calls render 20 toasts; count drifts negative on unknown ids; leaks on unmount; double-counts with 2 containers.
4. `crypto.randomUUID()` throws outside secure contexts (http://192.168.x.x).
5. No `"use client"` directive -> Next.js App Router server components can't import `ToastContainer` directly.
6. `exports.types` points ESM importers at the CJS `.d.ts` (attw: "Masquerading as CJS").
7. Zero accessibility: no live region, no keyboard path, clickable `<div>`, no close button, no reduced-motion handling, no hover/focus pause.
8. CSS: container is `width:100vw` with no `pointer-events:none` -> blocks clicks in a full-width strip; `left:20px + 100vw` overflows horizontally; inner `z-index:9999` trapped inside container's stacking context; generic class names (`.toast`, `.toast-container`) collide with Bootstrap; `transition: all` fights keyframes.
9. API gaps: no dismiss/update/clear/promise, no onClick/onClose, no custom id, no container props (limit, default position, defaults), `icon:'default'` renders the literal string "default", `text` string-only, `autoClose: 0` means "never".
10. `eventManager`/`ToastEvent`/`EventManager`/`EventCallbacks`/`TimeoutId` are exported but `ToastEvent` is a type-only `const enum` so the emitter is unusable from outside.
11. Tests are coupled to internals, one test asserts the bug (-1), Cypress offset tests assert nothing, playground imports `../../../src` so packaging regressions are invisible, coverage config contradicts itself.
12. Tooling debt: react-scripts 5 (160 vulns), CRA leftovers, .npmignore ignored by `files`, fake commit-msg hook, unused lint-staged, no ESLint, `engines` forced on consumers, deprecated `@testing-library/react-hooks`, outdated majors everywhere.

## 1. Public API (TypeScript)

```ts
export type ToastPosition =
  | 'topLeft' | 'topCenter' | 'topRight'
  | 'bottomLeft' | 'bottomCenter' | 'bottomRight';

export type ToastId = string;

export interface ToastOptions {
  /** Custom id. If a toast with this id already exists it is updated in place (deduplication). */
  id?: ToastId;
  /** Main content. Strings are announced to screen readers verbatim; nodes are flattened to text for the announcer. */
  text: React.ReactNode;
  /** Optional leading icon (string/emoji or any node). String icons are aria-hidden. */
  icon?: React.ReactNode;
  /** Bold prefix rendered before `text` (kept for compat; it is a *prefix*, not an in-text match). */
  highlightText?: React.ReactNode;
  /** CSS color for `highlightText`. */
  highlightColor?: string;
  /** ms before auto-dismiss. `false` disables. `0` is treated like `false`. Default 3000. */
  autoClose?: number | false;
  /** Click (or Enter/Space/Escape when focused) dismisses. Default true. */
  closeOnClick?: boolean;
  /** Pause the auto-close timer while hovered or focused. Default true. */
  pauseOnHover?: boolean;
  /** Render an explicit close button. Default false (opt-in; it changes layout). */
  closeButton?: boolean;
  /** Accessible label for the close button. Default 'Close'. */
  closeButtonLabel?: string;
  /** 'status' -> polite announcement (default). 'alert' -> assertive announcement. */
  role?: 'status' | 'alert';
  position?: ToastPosition;                 // default: container `position` prop, else 'bottomCenter'
  /** Distance from the screen edge for this position group (number = px). Container prop wins if set. */
  offset?: number | string;
  /** Extra classes. When given, the built-in look (`data-rct-styled`) is NOT applied (compat with 0.2.x). */
  className?: string;
  /** Force headless look even without `className`. */
  unstyled?: boolean;
  /** Inline style for the toast element. */
  style?: React.CSSProperties;
  /** Inline style for the position group container (first toast in the group wins; container prop wins over it). */
  containerStyle?: React.CSSProperties;
  /** Called on click before dismissal. */
  onClick?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
  /** Called after the toast has been removed from the DOM (any reason). */
  onClose?: () => void;
}

/** Props of the built-in <Toast/>: options + the id. Kept for 0.2.x compat (`toastId`). */
export interface ToastProps extends Omit<ToastOptions, 'id'> { toastId: ToastId }

export interface ToastContainerProps {
  /** Default position for toasts that don't specify one. Default 'bottomCenter'. */
  position?: ToastPosition;
  /** Max simultaneously visible toasts (exiting ones count). Extra toasts queue and appear as others leave. Default 6. `Infinity` = unlimited. */
  limit?: number;
  /** Defaults merged under every toast's options (per-toast options win). */
  toastOptions?: Partial<Omit<ToastOptions, 'id' | 'text'>>;
  /** Newest toast first in DOM order (default false = append). */
  newestOnTop?: boolean;
  /** Edge offset for every position group (number = px). Overrides per-toast `offset`. */
  offset?: number | string;
  /** Applied to every position-group element. */
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  /** Inject the built-in stylesheet into <head> on mount (idempotent, SSR-safe). Default true. Set false and `import 'react-compact-toast/styles.css'` yourself (CSP / cascade-layer setups). */
  injectStyles?: boolean;
  /** CSP nonce for the injected <style>. */
  nonce?: string;
}

export interface ToastPromiseMessages<T> {
  loading: React.ReactNode | Omit<ToastOptions, 'id'>;
  success: React.ReactNode | Omit<ToastOptions, 'id'> | ((value: T) => React.ReactNode | Omit<ToastOptions, 'id'>);
  error:   React.ReactNode | Omit<ToastOptions, 'id'> | ((error: unknown) => React.ReactNode | Omit<ToastOptions, 'id'>);
}

export interface ToastFn {
  (textOrOptions: React.ReactNode | ToastOptions): ToastId;   // string form kept: toast('Hi')
  /** Play exit animation then remove. No id = all (visible + queued). */
  dismiss(id?: ToastId): void;
  /** Remove immediately without animation. No id = all. */
  remove(id?: ToastId): void;
  /** Patch options of a live (or queued) toast. Changing `autoClose` restarts the timer. */
  update(id: ToastId, options: Partial<Omit<ToastOptions, 'id'>>): void;
  /** loading -> success/error, returns the same promise. Loading state has autoClose:false. */
  promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>, options?: Omit<ToastOptions, 'id' | 'text'>): Promise<T>;
  /** true if the id is visible or queued. */
  isActive(id: ToastId): boolean;
}
export const toast: ToastFn;

export const ToastContainer: React.FC<ToastContainerProps>;   // no longer memo()'d (memo on a prop-less component is pointless)
export const Toast: React.FC<ToastProps>;                      // built-in toast, usable headlessly

// Headless hooks (kept exported; shapes extended, old fields kept as deprecated aliases)
export function useToastContainer(options?: { limit?: number; position?: ToastPosition; newestOnTop?: boolean }): {
  toasts: readonly ToastRecord[];                         // visible (incl. exiting), in render order
  groups: ReadonlyMap<ToastPosition, readonly ToastRecord[]>;
  dismiss: ToastFn['dismiss']; remove: ToastFn['remove'];
  /** @deprecated 0.2.x shape: Map<position, { toasts, containerStyle }> */
  getToastPositionGroupToRender(): Map<ToastPosition, { toasts: ToastRecord[]; containerStyle?: React.CSSProperties }>;
};
export interface UseToastOptions extends Pick<ToastOptions, 'autoClose' | 'closeOnClick' | 'pauseOnHover' | 'onClick' | 'onClose'> {}
export function useToast(toastId: ToastId, options?: UseToastOptions): UseToastResult;
/** @deprecated positional form from 0.2.x */
export function useToast(toastId: ToastId, autoClose?: number | false, closeOnClick?: boolean): UseToastResult;
export interface UseToastResult {
  isExiting: boolean;
  dismiss(): void; pause(): void; resume(): void;
  /** Spread onto the root element: ref, tabIndex, onClick, onKeyDown, onAnimationEnd, onAnimationCancel, onMouseEnter, onMouseLeave, onFocus, onBlur, data-rct-state */
  toastProps: { ref: React.RefCallback<HTMLElement>; tabIndex?: number; 'data-rct-state': 'entering' | 'exiting'; onClick(e): void; onKeyDown(e): void; onAnimationEnd(e): void; onAnimationCancel(e): void; onMouseEnter(): void; onMouseLeave(): void; onFocus(): void; onBlur(): void };
  /** @deprecated use toastProps.onClick */ handleClick(): void;
  /** @deprecated use toastProps.onAnimationEnd */ handleAnimationEnd(): void;
}
export type ToastRecord = ToastOptions & { id: ToastId; dismissed: boolean; createdAt: number };
```

REMOVED exports (breaking, documented in CHANGELOG): `eventManager`, `ToastEvent`, `EventManager`, `EventCallbacks`, `TimeoutId`. They were internal and unusable from TypeScript (type-only const enum).

Behavioral changes vs 0.2.3 (documented): limit is actually enforced (excess toasts queue instead of rendering), hover/focus pauses the timer, toasts are keyboard-focusable when interactive, class names replaced by `data-rct-*` attributes, z-index default 9999 via `--rct-z-index`, CSS is injected at *top* of `<head>` on container mount so user stylesheets win ties.

## 2. Core: external store (replaces event emitter)

`src/core/store.ts` — framework-agnostic singleton:
- state: `{ visible: ToastRecord[]; queue: ToastRecord[]; limit: number }` immutable updates, `snapshot` = frozen `visible` array (new reference on change), `getServerSnapshot()` = constant empty array.
- `subscribe(listener)`, `getSnapshot()`, `add(record)`, `dismiss(id?)`, `remove(id?)`, `update(id, patch)`, `setLimit(n)`, `has(id)`, `reset()` (tests).
- `add`: if id exists (visible or queued) -> `update` + un-dismiss; else if `visible.length < limit` push visible else push queue. Synchronous — no setTimeout. (The old setTimeout(0) hid "setState during render"; useSyncExternalStore handles that correctly.)
- `remove(id)`: drop from visible/queue, then promote from queue while `visible.length < limit`; fire `onClose` for removed records (deferred via queueMicrotask? No — call synchronously after state commit; keep simple).
- `dismiss(id)`: set `dismissed: true` (visible) or drop (queued). `dismiss()` = all visible dismissed + queue cleared.
- ids: `` `rct-${++counter}` `` — no crypto, no secure-context requirement.
- Timestamps: `Date.now()` for `createdAt` (used for stable ordering / tests).
- React binding: `useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)`.

## 3. Components / DOM

```
<ToastContainer>
  <div data-rct-announcer role="status" aria-live="polite" aria-atomic="true" style={srOnly}>{latest polite text}</div>
  <div data-rct-announcer role="alert"  aria-live="assertive" aria-atomic="true" style={srOnly}>{latest assertive text}</div>
  {groups: <div key=pos data-rct-container data-rct-position="bottomCenter" class={containerClassName} style={offset+containerStyle}>
      <Toast .../> ...
  </div>}
```
- Announcers are ALWAYS mounted (live regions must pre-exist to be announced reliably). Visually hidden (sr-only inline style). Content: `getNodeText(highlightText) + getNodeText(text)` of the most recent toast for that politeness, keyed by toast id so the node is recreated (forces re-announce of identical text).
- Position groups are mounted only while they have toasts (same as today).

Built-in `<Toast/>`:
```
<div data-rct-toast data-rct-position={pos} data-rct-state="entering|exiting" data-rct-styled={styled ? '' : undefined}
     class={className} style={style} tabIndex={interactive ? 0 : undefined} {...handlers}>
  {icon != null && <span data-rct-icon aria-hidden={typeof icon === 'string' || undefined}>{icon}</span>}
  <div data-rct-text>{highlightText != null && <span data-rct-highlight style={{color}}>{highlightText}</span>}{text}</div>
  {closeButton && <button type="button" data-rct-close aria-label={closeButtonLabel} onClick={stopPropagation + dismiss}>×(svg)</button>}
</div>
```
- `interactive = closeOnClick || !!onClick`.
- Keyboard: Enter/Space -> onClick? then dismiss if closeOnClick; Escape -> dismiss if closeOnClick. Events only when target is the toast itself (not the close button).
- Focus restore: on focus, remember `relatedTarget`; on unmount, if `document.activeElement` is inside the toast or is `body`, focus the remembered element (if still connected).
- `onAnimationEnd`/`onAnimationCancel`: ignore when `e.target !== e.currentTarget`. When `isExiting` -> `store.remove(id)`.
- Exit fallback: when `isExiting` becomes true, read `getComputedStyle(el)` animationDuration/animationDelay (comma lists, `s`/`ms`), total = max(duration+delay). If total === 0 -> remove now; else `setTimeout(remove, total + 50)` (cleared on unmount). Guarantees removal without CSS, under reduced motion, and when `animationend` is swallowed.
- Auto-close timer: `autoClose > 0` -> timer; hover/focus pause (`pauseOnHover`) with remaining-time bookkeeping; restart when `autoClose` changes (so `update()` / `promise()` can start it).
- `Toast` and `ToastContainer` both call `useInjectStyles(enabled, nonce)` -> `useInsertionEffect` -> `injectStyles()`.

## 4. CSS (`src/styles.css`, injected + shipped as `react-compact-toast/styles.css`)

- Selectors are attribute-based: `[data-rct-container]`, `[data-rct-toast]`, `[data-rct-toast][data-rct-styled]`, `[data-rct-text]`, `[data-rct-highlight]`, `[data-rct-icon]`, `[data-rct-close]`, `[data-rct-position^="top"]`… Specificity = 1 class, same as before. No cascade layers (unlayered library CSS would otherwise lose to global element resets like `p { font-size }`).
- Keyframes namespaced: `rct-enter-top/bottom`, `rct-exit-top/bottom`.
- CSS custom properties (read with fallbacks, so they can be set on `:root` or any ancestor): `--rct-z-index (9999)`, `--rct-gap (10px)`, `--rct-offset-x (20px)`, `--rct-offset-y (30px)`, `--rct-bg (rgb(40 40 40))`, `--rct-fg (rgb(250 250 250))`, `--rct-radius (16px)`, `--rct-padding (16px 24px)`, `--rct-shadow`, `--rct-font-size (14px)`, `--rct-min-width (280px)`, `--rct-max-width (320px)`, `--rct-enter-duration (0.4s)`, `--rct-exit-duration (0.3s)`.
- Container: `position: fixed; display:flex; flex-direction:column; gap; pointer-events:none; z-index: var(--rct-z-index)`; horizontal placement via `left/right/inset` WITHOUT `width:100vw` (center: `left:0; right:0; align-items:center`; left: `left: var(--rct-offset-x)`; right: `right: var(--rct-offset-x)`). Vertical: `top/bottom: var(--rct-offset-y)` plus iOS safe area: `bottom: calc(var(--rct-offset-y) + env(safe-area-inset-bottom, 0px))`.
- Toast: `pointer-events:auto; position:relative` (no z-index), `cursor:pointer` only when interactive (`[tabindex]`), `:focus-visible { outline: 2px solid …; outline-offset: 2px }`, no `transition: all`.
- Text: `white-space: pre-line; overflow-wrap: anywhere; max-width: var(--rct-max-width)`.
- `@media (prefers-reduced-motion: reduce) { [data-rct-toast] { animation: none } }` (fallback removal handles the exit).
- Close button reset styles (no bg/border, inherits color, 24×24 hit area, focus-visible outline).
- sr-only announcer styles are inline (they must work even with `injectStyles={false}`).

## 5. Style injection (`src/core/inject-styles.ts`)

```ts
import css from '../styles.css?inline';          // Vite/Vitest native; tsdown via small plugin (see §7)
const ATTR = 'data-rct-styles';
export function injectStyles(nonce?: string): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`style[${ATTR}]`)) return;      // idempotent across HMR / dual-package copies
  const el = document.createElement('style');
  el.setAttribute(ATTR, ''); if (nonce) el.setAttribute('nonce', nonce);
  el.textContent = css;
  document.head.prepend(el);                                  // top of <head> so user stylesheets win equal-specificity ties
}
```
`declare module '*.css?inline' { const css: string; export default css }` in `src/types/css.d.ts`.

## 6. Files

```
src/index.ts                 public exports + 'use client' handled by build banner
src/types.ts                 all public types (single file; remove src/types/index.ts + core/index.ts re-export soup)
src/constants.ts             DEFAULTS (autoClose 3000, limit 6, position, closeButtonLabel 'Close')
src/core/store.ts            external store
src/core/toast.ts            toast() + dismiss/remove/update/promise/isActive
src/core/inject-styles.ts
src/core/get-node-text.ts    ReactNode -> string for the announcer
src/core/animation.ts        getAnimationTotalMs(el)
src/hooks/use-toast.ts       timer/pause/exit/keyboard/focus logic (headless)
src/hooks/use-toast-container.ts
src/hooks/use-inject-styles.ts
src/components/toast.tsx
src/components/toast-container.tsx
src/styles.css
src/**/*.test.ts(x)          vitest + RTL, behavior-level, against public API
src/**/*.cy.tsx              Cypress component tests, real-browser-only assertions
```

## 7. Packaging / build (tsdown latest)

- `tsdown.config.ts`: entry `src/index.ts`, formats esm+cjs, `dts: true`, `sourcemap: true`, `minify: true`, `platform: 'browser'`, `target: 'es2020'`, `external: [react, react-dom, react/jsx-runtime]`, `outputOptions: { banner: "'use client';" }` (verify directive survives minify and is the first statement in BOTH outputs), `plugins: [inlineCss()]` (resolveId/load for `*.css?inline`, minify via esbuild `transform(css, {loader:'css', minify:true})`), `copy: [{ from: 'src/styles.css', to: 'dist/styles.css' }]`, `attw: true`, `publint: true`. No second CSS entry (removes the stray `styles.mjs`).
- package.json: `exports` with per-condition `types` (`.d.mts` for import, `.d.ts` for require), `./styles.css`, `./package.json`; `sideEffects: ["**/*.css"]`; keep `main/module/types`; remove `engines` (browser lib), keep `packageManager`; `files: ["dist"]`; delete `.npmignore`.
- Scripts: `build` (=tsdown), `dev`, `test` (vitest run), `test:watch`, `test:coverage`, `test:browser` (cypress run --component), `test:package` (pack -> install in tmp -> ESM/CJS import smoke, checks `'use client'`, no `.css` import in JS, `dist/styles.css` exists, attw + publint), `lint`, `lint:fix`, `format`, `format:check`, `type-check`, `check` (all of the above), `playground:*`.
- Delete: react-scripts, CRA scripts, `browserslist`, `public/`, `.npmignore`, `lint-staged`, `@testing-library/react-hooks`, `@cypress/code-coverage`, `nyc`, `.nycrc.json`, `vite-plugin-istanbul`, `@istanbuljs/nyc-config-typescript`, `cypress/support/commands.ts` fake `toastManager`.
- Add: eslint 9 flat config (typescript-eslint, react-hooks, jsx-a11y, react-refresh not needed), prettier for ts/tsx/css/md/json/yml (playground excluded via .prettierignore for now), lefthook: pre-commit prettier+eslint on staged, pre-push type-check+test; remove fake commit-msg hook.
- Update EVERY devDependency to latest (typescript 7 if the toolchain works — fall back to newest 5.x/6.x and say why; vitest 5; vite 8; cypress 16; jsdom 30; @testing-library/* latest; user-event 14; lefthook 2; tsdown 0.23; prettier 3.9; next 16 in playground; tailwind 4.x latest; eslint 9.x latest; typescript-eslint 8.x latest; motion latest…). Regenerate lockfile.
- tsconfig: `target: es2020`, `module: esnext`, `moduleResolution: bundler`, `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, `jsx: react-jsx`, `types: ["vitest/globals"?]` — keep vitest globals off; import from vitest explicitly. Separate `cypress/tsconfig.json`.
- Workspace: `pnpm-workspace.yaml` (`packages: ['playground']`), playground depends on `react-compact-toast: workspace:*`, imports `react-compact-toast` (NOT `../../../src`), no manual CSS import (dogfoods injection), delete `playground/pnpm-lock.yaml`. Vercel: root `vercel.json` -> `installCommand: pnpm install --frozen-lockfile`, `buildCommand: pnpm build && pnpm --filter playground build`, `outputDirectory: playground/.next`; `playground/package.json` `build:vercel` mirrors it for a playground-rooted Vercel project.

## 8. CI / release

- `ci.yml`: lint, type-check, unit tests (matrix react 18 & 19 via `pnpm add react@18 react-dom@18` step), build + `test:package`, cypress component tests (binary cached), bundle size on PRs (`compressed-size-action`, pattern `dist/index.{js,mjs}` + `dist/styles.css`), coverage upload (vitest lcov, single flag). No `continue-on-error`. Delete `test-coverage.yml` (merged).
- `release.yml`: validate `version` input against semver regex, `--frozen-lockfile`, run `pnpm check`, `npm version`, push, GitHub release with notes from CHANGELOG section, `npm publish --provenance --access public` (permissions: `id-token: write`).
- codecov.yml: single flag, no component ignores, target 85%.

## 9. Tests (behavior-level)

Vitest (jsdom, fake timers):
- store: add/limit/queue promotion/dismiss all/remove/update/dedup-by-id/setLimit/reset; onClose fires once.
- toast(): string & object forms, ids unique & non-crypto, dismiss/remove/update/promise/isActive.
- useToast: auto-close timing, pause on hover/focus with remaining time, autoClose false/0, restart on change, dismissed-from-store, exit fallback removes without animationend, keyboard handlers, focus restore, onClick/onClose.
- ToastContainer: renders announcers always, groups by position, default position prop, `toastOptions` merge, `limit` queue visible behavior, newestOnTop, offset precedence, injectStyles once (+ nonce, + false), unmount cleanup, StrictMode double-mount, two containers do not double-count.
- SSR: `renderToString(<ToastContainer/>)` in node env produces announcers only, no window access at import.
- Public entry: every documented export exists; removed exports are absent.
Cypress (real browser): exit animation then DOM removal; click-through outside toast works (pointer-events); no horizontal overflow for left positions; hover pauses; reduced-motion emulation? (skip if not feasible); close button; keyboard Escape.
Package smoke (`scripts/check-package.mjs`): pack, install into tmp dir with react, `import()` and `require()`, assert exports, `'use client'` first line, `dist/styles.css` present, no `import "./index.css"` in JS, attw + publint clean.

## 10. Docs

- README: full API reference tables (toast options, container props, `toast.*` methods, hooks), CSS/customization (className, `data-rct-*` selectors, CSS variables, Tailwind v4 note, `injectStyles={false}` + manual import, CSP nonce), SSR/Next.js note, accessibility section, headless usage, migration notes 0.2 -> 0.3, contributing link. Fix logo alt.
- CHANGELOG.md (Keep a Changelog; "Unreleased" grouped by area with a Breaking subsection).
- CONTRIBUTING.md (setup, scripts, test layers, PR conventions, release).
- Playground `/docs` page: real content mirroring README API reference.
- JSDoc on every public symbol.

## 11. PR split plan (user will ask later; keep in mind, do not commit)

1. fix/packaging: style injection back, `use client`, exports/types, sideEffects, tsdown config, package smoke test.
2. feat/core: store, toast API (dismiss/remove/update/promise/isActive/id), fallback removal, limit queue, CSS rewrite (data attrs, vars, pointer-events, overflow), hooks/component rewrite.
3. feat/a11y: announcers, keyboard, focus restore, close button, reduced motion, pause on hover/focus.
4. test: vitest + cypress rewrite, React 18/19 matrix, playground on workspace package, coverage config.
5. chore: dependency upgrades, remove CRA/dead tooling, ESLint, lefthook, CI/release workflows, docs (README/CHANGELOG/CONTRIBUTING).
