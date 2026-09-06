# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## 0.3.0

A rewrite of the runtime around an external store, with accessibility, a
larger API and a build that ships the stylesheet again.

### Fixed

- **The stylesheet is shipped again.** 0.2.3 migrated from tsup to tsdown and
  silently lost `injectStyle`, so every install since had unstyled toasts and
  the README never mentioned importing the CSS. The stylesheet is now embedded
  in the bundle and injected on mount, and `pnpm test:package` fails the build
  if it ever goes missing again.
- **Toasts always leave.** Removal used to depend on an `animationend` event.
  Without the stylesheet, with `prefers-reduced-motion`, or with a class such
  as `animate-none`, that event never arrived, the toast stayed forever, and
  the six-toast limit jammed. Removal now waits on the element's real
  animations and gives up after five seconds.
- **The limit is enforced.** The counter was incremented inside a `setTimeout`,
  so twenty synchronous `toast()` calls rendered twenty toasts. It also drifted
  negative on unknown ids, leaked on unmount, and double-counted with two
  containers. Visible toasts are now counted directly and extras wait in a
  queue.
- **No more secure-context crash.** Ids came from `crypto.randomUUID()`, which
  throws on plain HTTP origins such as a phone testing against a dev server.
- **Next.js App Router.** The bundle now carries `'use client'`, so importing
  it from a server component no longer fails.
- **TypeScript resolution.** ESM importers were pointed at the CJS
  declarations, which `arethetypeswrong` reported as "masquerading as CJS".
- **Clicks pass through.** The position group was a full-width fixed element
  with no `pointer-events: none`, so an invisible band across the screen ate
  clicks while a toast was up. Left- and right-anchored groups also caused
  horizontal scrolling.
- **`z-index` works.** The toast's `z-index: 9999` was trapped inside the
  container's own stacking context, so toasts hid behind modals.

### Added

- `toast.success`, `toast.error`, `toast.info`, `toast.warning` and
  `toast.loading`, each with a built-in icon and a `data-rct-type` hook.
- `toast.promise(promise, { loading, success, error })`.
- `toast.dismiss`, `toast.remove`, `toast.update` and `toast.isActive`.
- A custom `id` that updates a toast in place instead of stacking duplicates,
  and restarts its timer.
- `toast(message, options)` alongside the existing object form; `text` and
  `icon` accept any React node.
- `action: { label, onClick }` for a real button inside the toast, and
  `onClick` / `onClose` callbacks.
- Screen-reader announcements through polite and assertive live regions that
  exist before the first toast, so a batch of toasts is fully announced.
- Keyboard support: Enter and Space activate, Escape dismisses,
  <kbd>Alt</kbd> + <kbd>T</kbd> focuses the newest toast, and focus is restored
  when a focused toast disappears.
- Timers pause on hover, on focus, and while the window is blurred or the tab
  is hidden, including a page that loads in a background tab.
- A dismissible toast carries `aria-keyshortcuts="Escape"`, so assistive
  technology announces how to close it.
- A close button, rendered automatically when nothing else could dismiss the
  toast, with a localizable `closeButtonLabel`.
- `ToastContainer` props: `position`, `limit`, `toastOptions`, `newestOnTop`,
  `offset` (with per-axis values and safe-area insets), `containerClassName`,
  `containerStyle`, `label`, `hotkey`, `pauseOnFocusLoss`, `portal`,
  `injectStyles` and `nonce`.
- CSS custom properties for every colour, dimension and duration, and
  `data-rct-*` selectors for every part.
- `unstyled` for a bare element, next to `className` which now keeps the
  layout.
- `react-compact-toast/headless`: the store and the hooks without the
  built-in component, its icons or the stylesheet, at 2.8 kB gzipped against
  the default entry's 6.5 kB. It is built separately rather than as a second
  entry of one bundle, so the default import pays nothing for it.
- `injectStyles()` is exported for manual control.
- Reduced-motion and forced-colors handling.
- `toastOptions` is applied in the store, so its defaults (including
  `onClose`) reach toasts that are queued and never rendered.

### Changed

- **Breaking — class names are gone.** `.toast` → `[data-rct-toast]`,
  `.toast-container` → `[data-rct-container]`, `.toast-position-topRight` →
  `[data-rct-position="topRight"]`, `.toast-text` → `[data-rct-text]`,
  `.toast-highlight-text` → `[data-rct-highlight]`, `.toast-enter-*` /
  `.toast-exit-*` → `[data-rct-state]`. The generic old names collided with
  Bootstrap and other frameworks.
- **`ToastEvent` is a real enum.** It was exported as a type-only
  `const enum`, so `eventManager.on(ToastEvent.Add, …)` did not compile and
  the hub could not be used from TypeScript at all. A `Dismiss` event is
  added alongside `Add`, `Delete` and `Update`.
- **`activeToastCount` is read-only and derived.** It used to be a separate
  integer the hub incremented inside a `setTimeout`, while the toast list
  lived in the container's React state. The two drifted: unmounting leaked
  the count, two containers double-counted, and removing an unknown id drove
  it negative. It now reads the list, so it cannot disagree with the screen.
- **`emit` applies the change at once and announces it a tick later.** The
  delay is why 0.2.x deferred its callbacks and it is kept; what moved is the
  state change, which now happens immediately so the limit is decided against
  the real list.
- **Breaking — at most six toasts are shown at once.** The rest queue and
  appear as others leave. Raise it with `<ToastContainer limit={10} />`.
- **Breaking — the message is a `<div>`, not a `<p>`,** because it accepts
  block content now. Toast height changes slightly without a CSS reset.
- **Breaking — toasts join the tab order** when they respond to clicks.
- **Breaking — toasts created before the container mounts are kept** and shown
  once it mounts, instead of being dropped.
- **Breaking — two live-region elements are always rendered.** Snapshot tests
  containing `<ToastContainer />` will change.
- **Breaking — toasts paint above `z-index: 9999`** rather than being confined
  to the container's stacking context, so they may now cover elements that
  used to cover them.
- `className` no longer removes the layout, only the built-in look. Use
  `unstyled` for the old all-or-nothing behaviour.
- `icon: 'default'` used to render the literal word "default"; it is now
  treated as no icon.
- Ids look like `rct-1` instead of a UUID.
- `toast.promise` no longer creates a toast when the loading toast was
  removed while the promise was in flight.
- Lowering `limit` drops toasts that were already dismissed instead of
  pushing them back into the queue.
- The hotkey requires an exact modifier combination and is ignored while the
  user is typing in a field.
- The deprecated per-toast `offset` and `containerStyle` are read from the
  oldest toast of a group that sets one, so `newestOnTop` no longer changes
  which value applies.
- Screen-reader announcements are taken from the text a toast actually
  rendered, so content produced by a component is announced without being
  mounted a second time.

### Deprecated

Still working, to be removed in 1.0:

- `highlightText` and `highlightColor` — put a React node in `text`.
- Per-toast `offset` and `containerStyle` — use the `ToastContainer` props.
- `useToast(id, autoClose, closeOnClick)` — pass an options object.
- `toastId` on `<Toast>` — use `id`.
- `useToastContainer().getToastPositionGroupToRender()` — use `groups`.

### Internal

- `eventManager` keeps the publish–subscribe role it has always had; the
  toast list moved out of the container's React state into a store the hub
  reads and writes, so there is one source of truth instead of two. The store
  lives on `globalThis` under a version-scoped symbol so the ESM and CJS
  builds share one instance.
- Tests were rewritten against the public API: unit and integration tests in
  Vitest (including server rendering and hydration) and browser tests in
  Cypress for animation, layout, pointer-events and focus.
- `pnpm test:package` packs the tarball, installs it into a throwaway project
  and checks the exports, the `'use client'` banner, `attw` and `publint`.
- Dependencies were updated across the board and the leftover Create React App
  toolchain, `nyc` and `istanbul` setup were removed. ESLint replaced them.

## 0.2.3 — 2025-09-20

- Migrated the build from tsup to tsdown.

## 0.2.2 and earlier

See the [releases page](https://github.com/m2na7/react-compact-toast/releases).
