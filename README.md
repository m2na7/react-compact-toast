<div align="center">
  <img src="https://github.com/user-attachments/assets/e709a9fc-de08-4f64-9312-9c2011a6e17f" alt="React Compact Toast logo" width="64" />
  <h1>React Compact Toast</h1>

![npm](https://img.shields.io/npm/v/react-compact-toast.svg?logo=npm)
[![npm downloads](https://img.shields.io/npm/dt/react-compact-toast.svg?color=yellow)](https://npmjs.com/package/react-compact-toast)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/m2na7/react-compact-toast/graph/badge.svg?token=YWV9W9GTVN)](https://codecov.io/gh/m2na7/react-compact-toast)
![minzip](https://badgen.net/bundlephobia/minzip/react-compact-toast)

  <p>Small, accessible toast notifications for React.</p>
  <p><a href="https://react-compact-toast.vercel.app">🍞 Live demo and docs</a></p>
</div>

## Features

- **Small.** 6.5 kB gzipped with the stylesheet included, 2.8 kB from
  `react-compact-toast/headless`, and 1.3 kB in a file that only calls
  `toast()`. No dependencies.
- **Accessible.** Announced to screen readers, operable by keyboard, pauses on hover and focus, respects reduced motion.
- **Yours to style.** Plain CSS custom properties, `data-*` selectors, your own class names, or a fully headless hook.
- **Works where you do.** React 18 and 19, server rendering, Next.js App Router, TypeScript.

## Install

```bash
npm install react-compact-toast
# pnpm add react-compact-toast   ·   yarn add react-compact-toast
```

## Quick start

Mount the container once, near the root of your app, then call `toast()` from anywhere.

```jsx
'use client'; // only needed in the Next.js App Router
import { ToastContainer, toast } from 'react-compact-toast';

export default function App() {
  return (
    <>
      <button onClick={() => toast.success('Saved')}>Save</button>
      <ToastContainer />
    </>
  );
}
```

The stylesheet is injected automatically. There is nothing else to import.

## Showing toasts

```js
toast('Copied to clipboard');
toast('Copied', { position: 'topRight', autoClose: 5000 });
toast({ text: 'Copied', icon: '📋' });

toast.success('Saved');
toast.error('Could not save');
toast.info('A new version is available');
toast.warning('Your session expires soon');
toast.loading('Uploading…'); // stays until you dismiss or update it
```

Every call returns an id you can act on later.

```js
const id = toast.loading('Uploading…');
toast.update(id, { type: 'success', text: 'Uploaded', autoClose: 3000 });
toast.dismiss(id); // play the exit animation, then remove
toast.remove(id); // remove at once
toast.dismiss(); // all of them
toast.isActive(id); // true while it is on screen or queued
```

Passing an `id` yourself makes a toast idempotent, which is what you want for
an action a user can repeat quickly:

```js
const copy = () => {
  navigator.clipboard.writeText(link);
  toast('Link copied', { id: 'copy-link' }); // replaces itself, timer restarts
};
```

### Promises

```js
toast.promise(saveDraft(), {
  loading: 'Saving…',
  success: (draft) => `Saved as “${draft.title}”`,
  error: (err) => `Could not save: ${err.message}`,
});
```

The loading toast stays open until the promise settles, then turns into a
success or error toast. The original promise is returned untouched, so
rejections still reach your own `catch`.

### Actions

```js
toast('Message archived', {
  action: { label: 'Undo', onClick: () => restore() },
});
```

A toast with an action does not close on its own, so the action stays
reachable. Call `event.preventDefault()` inside `onClick` to keep it open.

## API

### `toast(content, options?)`

`content` is a string, a React node, or an options object with a `text` key.
Shorthands `toast.success` / `error` / `info` / `warning` / `loading` take the
same arguments and set `type`.

| Option             | Type                                                       | Default     | Description                                                                      |
| ------------------ | ---------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `id`               | `string`                                                   | generated   | Reuse an id to update a toast in place instead of stacking duplicates.           |
| `text`             | `ReactNode`                                                | —           | The message.                                                                     |
| `type`             | `'success' \| 'error' \| 'info' \| 'warning' \| 'loading'` | —           | Adds a built-in icon and `data-rct-type`.                                        |
| `icon`             | `ReactNode`                                                | from `type` | A custom icon. `null` removes it.                                                |
| `autoClose`        | `number \| false`                                          | `3000`      | Milliseconds before it closes. `false` (or `0`) keeps it open.                   |
| `closeOnClick`     | `boolean`                                                  | `true`      | Click, Enter, Space or Escape dismisses.                                         |
| `pauseOnHover`     | `boolean`                                                  | `true`      | Hovering pauses the timer. Focus always does.                                    |
| `closeButton`      | `boolean`                                                  | auto        | Shown automatically when nothing else can dismiss the toast.                     |
| `closeButtonLabel` | `string`                                                   | `'Close'`   | Accessible name of that button.                                                  |
| `action`           | `{ label, onClick }`                                       | —           | A button rendered inside the toast.                                              |
| `role`             | `'status' \| 'alert'`                                      | `'status'`  | `'alert'` interrupts the screen reader. `type: 'error'` uses it by default.      |
| `position`         | `ToastPosition`                                            | container's | `topLeft`, `topCenter`, `topRight`, `bottomLeft`, `bottomCenter`, `bottomRight`. |
| `className`        | `string`                                                   | —           | Your classes. Replaces the built-in look, keeps the layout.                      |
| `unstyled`         | `boolean`                                                  | `false`     | Drops layout too: only positioning and animation remain.                         |
| `style`            | `CSSProperties`                                            | —           | Inline styles for the toast.                                                     |
| `onClick`          | `(event) => void`                                          | —           | Called when the toast itself is activated.                                       |
| `onClose`          | `() => void`                                               | —           | Called when the toast leaves, for any reason.                                    |

`highlightText`, `highlightColor`, `offset` and `containerStyle` still work but
are deprecated; see [Migrating from 0.2](#migrating-from-02).

### `<ToastContainer />`

| Prop                 | Type                           | Default              | Description                                                        |
| -------------------- | ------------------------------ | -------------------- | ------------------------------------------------------------------ |
| `position`           | `ToastPosition`                | `'bottomCenter'`     | Default position for toasts that do not set one.                   |
| `limit`              | `number`                       | `6`                  | Toasts shown at once. Extra ones queue and appear as others leave. |
| `toastOptions`       | `Partial<ToastOptions>`        | —                    | Defaults merged under every toast.                                 |
| `newestOnTop`        | `boolean`                      | `false`              | Reverses the stacking order.                                       |
| `offset`             | `number \| string \| { x, y }` | `{ x: 20, y: 30 }`   | Distance from the screen edges. Safe-area insets are added on top. |
| `containerClassName` | `string`                       | —                    | Classes for each position group.                                   |
| `containerStyle`     | `CSSProperties`                | —                    | Inline styles for each position group.                             |
| `label`              | `string`                       | `'Notifications'`    | Accessible name of the toast regions.                              |
| `hotkey`             | `string[]`                     | `['altKey', 'KeyT']` | Focuses the newest toast. `[]` disables it.                        |
| `pauseOnFocusLoss`   | `boolean`                      | `true`               | Pauses timers while the tab is hidden or the window is blurred.    |
| `portal`             | `boolean \| Element`           | `false`              | Renders the toasts into `document.body`, or an element you pass.   |
| `injectStyles`       | `boolean`                      | `true`               | Set to `false` to import the stylesheet yourself.                  |
| `nonce`              | `string`                       | —                    | CSP nonce for the injected `<style>`.                              |

Render exactly one container. Two containers would show every toast twice, and
the second one warns.

## Styling

### CSS custom properties

Set them on `:root`, on a wrapper, or on the toast itself.

```css
/* the defaults, for reference — set only what you want to change */
:root {
  --rct-bg: #282828;
  --rct-fg: #fafafa;
  --rct-radius: 16px;
  --rct-padding: 16px 24px;
  --rct-min-width: 280px;
  --rct-max-width: 320px;
  --rct-min-height: 44px;
  --rct-font-size: 14px;
  --rct-shadow: 0 0 6px rgb(0 0 0 / 0.15);
  --rct-gap: 10px; /* between stacked toasts */
  --rct-gap-inline: 8px; /* between icon, text and buttons */
  --rct-offset-x: 20px;
  --rct-offset-y: 30px;
  --rct-z-index: 9999;
  --rct-enter-duration: 0.4s;
  --rct-exit-duration: 0.3s;
  --rct-success: #22c55e;
  --rct-error: #ef4444;
  --rct-info: #3b82f6;
  --rct-warning: #f59e0b;
  --rct-action-bg: rgb(128 128 128 / 0.2);
  --rct-focus-ring: currentColor;
}
```

### Selectors

Every part carries a `data-rct-*` attribute. The library's own rules are
wrapped in `:where()`, so any single class of yours overrides them.

| Selector                                                                      | What it is                              |
| ----------------------------------------------------------------------------- | --------------------------------------- |
| `[data-rct-container]`                                                        | One position group                      |
| `[data-rct-toast]`                                                            | A toast                                 |
| `[data-rct-position="topRight"]`                                              | On both, the resolved position          |
| `[data-rct-state="entering" \| "exiting"]`                                    | Animation state                         |
| `[data-rct-type="success"]`                                                   | Semantic kind                           |
| `[data-rct-styled]`                                                           | Present while the built-in look applies |
| `[data-rct-base]`                                                             | Present unless `unstyled`               |
| `[data-rct-text]`, `[data-rct-icon]`, `[data-rct-action]`, `[data-rct-close]` | Parts of a toast                        |

### Your own classes

```js
toast('Deployed', {
  className: 'rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-lg',
});
```

`className` removes the built-in look but keeps the layout, so icon and text
stay aligned. Add `unstyled: true` to remove the layout as well.

### Tailwind CSS v4

Tailwind puts utilities in `@layer utilities`, and unlayered CSS always wins
over layered CSS. Import the stylesheet into a layer so your utilities keep
the upper hand:

```css
@import 'tailwindcss';
@import 'react-compact-toast/styles.css' layer(components);
```

```jsx
<ToastContainer injectStyles={false} />
```

## Listening to toasts

Every toast travels through `eventManager`, the publish–subscribe hub that
lets `toast()` reach the container without a context or a provider. You can
subscribe to it too — for analytics, logging, or a renderer of your own.

```ts
import { eventManager, ToastEvent } from 'react-compact-toast';

const off = () => eventManager.off(ToastEvent.Delete, log);
function log(id) {
  console.log('closed', id);
}

eventManager.on(ToastEvent.Delete, log);
```

| Member                 | What it does                                               |
| ---------------------- | ---------------------------------------------------------- |
| `on(event, cb)`        | Subscribe. Returns the hub, so calls chain.                |
| `off(event, cb?)`      | Unsubscribe one callback, or every callback for the event. |
| `emit(event, ...args)` | Publish. Applied at once, announced on the next tick.      |
| `cancelEmit(event)`    | Drop notifications scheduled but not yet delivered.        |
| `list`                 | The registered callbacks, by event.                        |
| `emitQueue`            | Notifications waiting for the next tick, by event.         |
| `activeToastCount`     | Toasts on screen. Read-only, derived from the list.        |

Events are `ToastEvent.Add`, `Dismiss`, `Delete` and `Update`. Callbacks run
a tick after the change is applied, so a subscriber never runs inside the
publisher's stack.

Call `toast()` from an event handler, an effect, or a promise callback.
Calling it while a component renders makes React warn about updating one
component during another's render; the toast still appears.

## Headless

`react-compact-toast/headless` is the same store and the same hooks without
the built-in component, its icons or the stylesheet: **2.8 kB gzipped**.
Reach for it when you render your own toast anyway.

```jsx
import {
  toast,
  useToastContainer,
  useToast,
} from 'react-compact-toast/headless';
```

It exports `toast`, `useToast` and `useToastContainer` plus the types. The
store lives on `globalThis`, so mixing the two entry points in one app still
gives you a single queue: a `toast()` from either side reaches whichever
container is mounted.

See [Headless usage](#headless-usage) for what to build with them.

## Server rendering and Next.js

The package is a client module (`'use client'`). Call `toast()` from client
code only: an event handler, an effect, or a promise callback, never during
render or on the server.

`<ToastContainer />` may be rendered from a server layout as long as its props
are serializable. If you need callbacks in `toastOptions`, wrap it in your own
`'use client'` component.

```tsx
// app/layout.tsx — a server component
import { ToastContainer } from 'react-compact-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastContainer position="topRight" />
      </body>
    </html>
  );
}
```

Under a strict Content Security Policy, pass `nonce`, or set
`injectStyles={false}` and import `react-compact-toast/styles.css` yourself.

## Accessibility

- Toasts are announced through a live region that exists before the first
  toast, so nothing is missed. `role: 'alert'` and `type: 'error'` interrupt;
  everything else waits politely.
- The toast itself is a `role="status"` element that never announces twice.
- Auto-close pauses on hover, on focus, and while the tab is hidden, which is
  what WCAG 2.2.1 asks of a time limit.
- A toast that cannot be dismissed any other way always gets a close button.
- Enter and Space activate a toast, Escape dismisses it, and <kbd>Alt</kbd> +
  <kbd>T</kbd> jumps to the newest one. A dismissible toast carries
  `aria-keyshortcuts="Escape"`, so the shortcut is announced rather than
  hidden. The hotkey is ignored while you are typing in a field.
- Under `prefers-reduced-motion` the slide is replaced by a fade.
- Focus moves to the next toast, or back where it came from, when a focused
  toast disappears.

## Headless usage

<a id="headless-usage"></a>

Build your own toast component on the same behaviour.

```tsx
import { useToast, useToastContainer } from 'react-compact-toast/headless';

function MyToast({ toast: record }) {
  const { toastProps, dismiss } = useToast(record.id);
  return (
    <div {...toastProps} className="my-toast">
      {record.text}
      <button onClick={dismiss}>Close</button>
    </div>
  );
}

function MyContainer() {
  const { groups } = useToastContainer({ limit: 3 });
  return Array.from(groups, ([position, toasts]) => (
    <div key={position} className={`my-group my-group--${position}`}>
      {toasts.map((record) => (
        <MyToast key={record.id} toast={record} />
      ))}
    </div>
  ));
}
```

`toastProps` carries the ref, ARIA attributes, keyboard handlers and hover
tracking. Style the exit with `[data-rct-state="exiting"]` using a CSS
animation or transition; the toast is removed once it finishes.

## Migrating from 0.2

Nothing about `toast('…')` and `<ToastContainer />` changes. The rest:

- **Import the stylesheet no more.** 0.2.3 shipped without the injected CSS by
  mistake. If you added `import 'react-compact-toast/styles.css'` as a
  workaround, you can drop it, or keep it with `injectStyles={false}`.
- **Class names became data attributes.** `.toast` → `[data-rct-toast]`,
  `.toast-container` → `[data-rct-container]`, `.toast-position-topRight` →
  `[data-rct-position="topRight"]`, `.toast-text` → `[data-rct-text]`,
  `.toast-highlight-text` → `[data-rct-highlight]`, `.toast-enter-*` /
  `.toast-exit-*` → `[data-rct-state]`.
- **`limit` is enforced.** At most six toasts are shown at once; the rest queue.
  Raise it with `<ToastContainer limit={10} />`.
- **Timers pause** on hover, on focus and while the tab is hidden.
- **Toasts are focusable** when they respond to clicks, so they join the tab
  order.
- **The text is a `<div>`, not a `<p>`,** because it now accepts any node.
- **`eventManager`, `ToastEvent`, `EventManager`, `EventCallbacks` and
  `TimeoutId` are gone.** They were unusable from TypeScript. Use
  `toast.update` / `toast.dismiss` / `useToastContainer` instead.
- **Deprecated, still working:** `highlightText` and `highlightColor` (put a
  node in `text`), per-toast `offset` and `containerStyle` (use the container
  props), `useToast(id, autoClose, closeOnClick)` (pass an options object),
  `toastId` on `<Toast>` (use `id`), and
  `useToastContainer().getToastPositionGroupToRender()` (use `groups`).

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © m2na7
