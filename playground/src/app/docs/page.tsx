import Link from 'next/link';
import type { Metadata } from 'next';

import CodeBlock from '../components/CodeBlock';

export const metadata: Metadata = {
  title: 'Documentation · React Compact Toast',
  description:
    'API reference for react-compact-toast: options, container props, styling, accessibility and server rendering.',
};

type Row = [option: string, type: string, fallback: string, description: string];

const TOAST_OPTIONS: Row[] = [
  [
    'id',
    'string',
    'generated',
    'Reuse an id to update a toast in place instead of stacking duplicates.',
  ],
  ['text', 'ReactNode', '—', 'The message.'],
  [
    'type',
    "'success' | 'error' | 'info' | 'warning' | 'loading'",
    '—',
    'Adds a built-in icon and a data-rct-type hook.',
  ],
  ['icon', 'ReactNode', 'from type', 'A custom icon. null removes it.'],
  [
    'autoClose',
    'number | false',
    '3000',
    'Milliseconds before it closes. false (or 0) keeps it open.',
  ],
  [
    'closeOnClick',
    'boolean',
    'true',
    'Click, Enter, Space or Escape dismisses the toast.',
  ],
  [
    'pauseOnHover',
    'boolean',
    'true',
    'Hovering pauses the timer. Focus always does.',
  ],
  [
    'closeButton',
    'boolean',
    'auto',
    'Shown automatically when nothing else can dismiss the toast.',
  ],
  ['closeButtonLabel', 'string', "'Close'", 'Accessible name of that button.'],
  [
    'action',
    '{ label, onClick }',
    '—',
    'A button inside the toast. Such a toast does not close on its own.',
  ],
  [
    'role',
    "'status' | 'alert'",
    "'status'",
    "'alert' interrupts the screen reader; type 'error' uses it by default.",
  ],
  [
    'position',
    'ToastPosition',
    "container's",
    'topLeft, topCenter, topRight, bottomLeft, bottomCenter, bottomRight.',
  ],
  [
    'className',
    'string',
    '—',
    'Your classes. Replaces the built-in look, keeps the layout.',
  ],
  [
    'unstyled',
    'boolean',
    'false',
    'Drops the layout too: only positioning and animation remain.',
  ],
  ['style', 'CSSProperties', '—', 'Inline styles for the toast.'],
  [
    'onClick',
    '(event) => void',
    '—',
    'Called when the toast itself is activated.',
  ],
  [
    'onClose',
    '() => void',
    '—',
    'Called when the toast leaves, for any reason.',
  ],
];

const CONTAINER_PROPS: Row[] = [
  [
    'position',
    'ToastPosition',
    "'bottomCenter'",
    'Default position for toasts that do not set one.',
  ],
  [
    'limit',
    'number',
    '6',
    'Toasts shown at once. Extra ones queue and appear as others leave.',
  ],
  [
    'toastOptions',
    'Partial<ToastOptions>',
    '—',
    'Defaults merged under every toast.',
  ],
  ['newestOnTop', 'boolean', 'false', 'Reverses the stacking order.'],
  [
    'offset',
    'number | string | { x, y }',
    '{ x: 20, y: 30 }',
    'Distance from the screen edges. Safe-area insets are added on top.',
  ],
  ['containerClassName', 'string', '—', 'Classes for each position group.'],
  [
    'containerStyle',
    'CSSProperties',
    '—',
    'Inline styles for each position group.',
  ],
  [
    'label',
    'string',
    "'Notifications'",
    'Accessible name of the toast regions.',
  ],
  [
    'hotkey',
    'string[]',
    "['altKey', 'KeyT']",
    'Focuses the newest toast. [] disables it.',
  ],
  [
    'pauseOnFocusLoss',
    'boolean',
    'true',
    'Pauses timers while the tab is hidden or the window is blurred.',
  ],
  [
    'portal',
    'boolean | Element',
    'false',
    'Renders toasts into document.body, or an element you pass.',
  ],
  [
    'injectStyles',
    'boolean',
    'true',
    'Set to false to import the stylesheet yourself.',
  ],
  ['nonce', 'string', '—', 'CSP nonce for the injected <style>.'],
];

const VARIABLES: [name: string, value: string][] = [
  ['--rct-bg', '#282828'],
  ['--rct-fg', '#fafafa'],
  ['--rct-radius', '16px'],
  ['--rct-padding', '16px 24px'],
  ['--rct-min-width', '280px'],
  ['--rct-max-width', '320px'],
  ['--rct-min-height', '44px'],
  ['--rct-font-size', '14px'],
  ['--rct-shadow', '0 0 6px rgb(0 0 0 / 0.15)'],
  ['--rct-action-bg', 'rgb(128 128 128 / 0.2)'],
  ['--rct-gap', '10px'],
  ['--rct-gap-inline', '8px'],
  ['--rct-offset-x', '20px'],
  ['--rct-offset-y', '30px'],
  ['--rct-z-index', '9999'],
  ['--rct-enter-duration', '0.4s'],
  ['--rct-exit-duration', '0.3s'],
  ['--rct-success', '#22c55e'],
  ['--rct-error', '#ef4444'],
  ['--rct-info', '#3b82f6'],
  ['--rct-warning', '#f59e0b'],
  ['--rct-focus-ring', 'currentColor'],
];

const SELECTORS: [selector: string, meaning: string][] = [
  ['[data-rct-container]', 'One position group'],
  ['[data-rct-toast]', 'A toast'],
  ['[data-rct-position="topRight"]', 'On both, the resolved position'],
  ['[data-rct-state="entering" | "exiting"]', 'Animation state'],
  ['[data-rct-type="success"]', 'Semantic kind'],
  ['[data-rct-styled]', 'Present while the built-in look applies'],
  ['[data-rct-base]', 'Present unless unstyled'],
  ['[data-rct-text]', 'The message'],
  ['[data-rct-icon]', 'The icon slot'],
  ['[data-rct-action]', 'The action button'],
  ['[data-rct-close]', 'The close button'],
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-medium text-neutral-900 mb-4">
        <a href={`#${id}`} className="hover:text-blue-600">
          {title}
        </a>
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-neutral-700">
        {children}
      </div>
    </section>
  );
}

function OptionTable({ caption, rows }: { caption: string; rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-neutral-50 text-neutral-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Default</th>
            <th className="px-4 py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, type, fallback, description]) => (
            <tr key={name} className="border-t border-neutral-200 align-top">
              <td className="px-4 py-3 font-mono text-[13px] text-neutral-900 whitespace-nowrap">
                {name}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-blue-700">
                {type}
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-neutral-500 whitespace-nowrap">
                {fallback}
              </td>
              <td className="px-4 py-3 text-neutral-600">{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const NAV = [
  ['install', 'Install'],
  ['showing', 'Showing toasts'],
  ['options', 'Toast options'],
  ['container', 'ToastContainer'],
  ['styling', 'Styling'],
  ['ssr', 'Server rendering'],
  ['a11y', 'Accessibility'],
  ['headless', 'Headless'],
] as const;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-12">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← React Compact Toast
          </Link>
          <h1 className="mt-4 text-4xl font-semibold">Documentation</h1>
          <p className="mt-3 text-neutral-600">
            Everything the library does, on one page. The same reference lives
            in the{' '}
            <a
              className="text-blue-600 hover:underline"
              href="https://github.com/m2na7/react-compact-toast#readme"
            >
              README
            </a>
            .
          </p>
        </header>

        <nav
          aria-label="On this page"
          className="mb-12 rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a className="text-neutral-600 hover:text-blue-600" href={`#${id}`}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-16">
          <Section id="install" title="Install">
            <CodeBlock language="bash">npm install react-compact-toast</CodeBlock>
            <p>
              Mount the container once, near the root of your app, then call{' '}
              <code>toast()</code> from anywhere. The stylesheet is injected
              automatically; there is nothing else to import.
            </p>
            <CodeBlock language="tsx">{`import { ToastContainer, toast } from 'react-compact-toast';

export default function App() {
  return (
    <>
      <button onClick={() => toast.success('Saved')}>Save</button>
      <ToastContainer />
    </>
  );
}`}</CodeBlock>
          </Section>

          <Section id="showing" title="Showing toasts">
            <CodeBlock language="ts">{`toast('Copied to clipboard');
toast('Copied', { position: 'topRight', autoClose: 5000 });
toast({ text: 'Copied', icon: '📋' });

toast.success('Saved');
toast.error('Could not save');
toast.info('A new version is available');
toast.warning('Your session expires soon');
toast.loading('Uploading…'); // stays until you dismiss or update it`}</CodeBlock>
            <p>Every call returns an id you can act on later.</p>
            <CodeBlock language="ts">{`const id = toast.loading('Uploading…');
toast.update(id, { type: 'success', text: 'Uploaded', autoClose: 3000 });
toast.dismiss(id);  // play the exit animation, then remove
toast.remove(id);   // remove at once
toast.dismiss();    // all of them
toast.isActive(id); // true while it is on screen or queued`}</CodeBlock>
            <p>
              Passing your own <code>id</code> makes a toast idempotent, which
              is what you want for an action a user can repeat quickly.
            </p>
            <CodeBlock language="ts">{`const copy = () => {
  navigator.clipboard.writeText(link);
  toast('Link copied', { id: 'copy-link' }); // replaces itself, timer restarts
};`}</CodeBlock>
            <h3 className="pt-2 text-lg font-medium text-neutral-900">
              Promises
            </h3>
            <CodeBlock language="ts">{`toast.promise(saveDraft(), {
  loading: 'Saving…',
  success: (draft) => \`Saved as “\${draft.title}”\`,
  error: (err) => \`Could not save: \${err.message}\`,
});`}</CodeBlock>
            <p>
              The loading toast stays open until the promise settles, then turns
              into a success or error toast. The original promise is returned
              untouched, so rejections still reach your own <code>catch</code>.
            </p>
            <h3 className="pt-2 text-lg font-medium text-neutral-900">
              Actions
            </h3>
            <CodeBlock language="ts">{`toast('Message archived', {
  action: { label: 'Undo', onClick: () => restore() },
});`}</CodeBlock>
            <p>
              A toast with an action does not close on its own, so the action
              stays reachable. Call <code>event.preventDefault()</code> inside{' '}
              <code>onClick</code> to keep it open.
            </p>
          </Section>

          <Section id="options" title="Toast options">
            <p>
              <code>toast(content, options?)</code> takes a string, a React
              node, or an options object with a <code>text</code> key. The
              shorthands take the same arguments and set <code>type</code>.
            </p>
            <OptionTable caption="Toast options" rows={TOAST_OPTIONS} />
            <p className="text-sm text-neutral-500">
              <code>highlightText</code>, <code>highlightColor</code>,{' '}
              <code>offset</code> and <code>containerStyle</code> still work on
              a single toast but are deprecated and will be removed in 1.0.
            </p>
          </Section>

          <Section id="container" title="ToastContainer">
            <OptionTable caption="Container props" rows={CONTAINER_PROPS} />
            <p>
              Render exactly one container. Two would show every toast twice,
              and the second one warns in development.
            </p>
          </Section>

          <Section id="styling" title="Styling">
            <h3 className="text-lg font-medium text-neutral-900">
              Custom properties
            </h3>
            <p>
              Set them on <code>:root</code>, on a wrapper, or on the toast
              itself.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">CSS custom properties</caption>
                <tbody>
                  {VARIABLES.map(([name, value]) => (
                    <tr
                      key={name}
                      className="border-b border-neutral-200 last:border-0"
                    >
                      <td className="px-4 py-2 font-mono text-[13px] text-neutral-900">
                        {name}
                      </td>
                      <td className="px-4 py-2 font-mono text-[13px] text-neutral-500">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="pt-2 text-lg font-medium text-neutral-900">
              Selectors
            </h3>
            <p>
              Every part carries a <code>data-rct-*</code> attribute. The
              library&apos;s own rules are wrapped in <code>:where()</code>, so
              any single class of yours overrides them.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">Styling selectors</caption>
                <tbody>
                  {SELECTORS.map(([selector, meaning]) => (
                    <tr
                      key={selector}
                      className="border-b border-neutral-200 last:border-0"
                    >
                      <td className="px-4 py-2 font-mono text-[13px] text-neutral-900">
                        {selector}
                      </td>
                      <td className="px-4 py-2 text-neutral-600">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="pt-2 text-lg font-medium text-neutral-900">
              Your own classes
            </h3>
            <CodeBlock language="ts">{`toast('Deployed', {
  className: 'rounded-xl bg-emerald-600 px-5 py-3 text-white shadow-lg',
});`}</CodeBlock>
            <p>
              <code>className</code> removes the built-in look but keeps the
              layout, so icon and text stay aligned. Add{' '}
              <code>unstyled: true</code> to remove the layout as well.
            </p>

            <h3 className="pt-2 text-lg font-medium text-neutral-900">
              Tailwind CSS v4
            </h3>
            <p>
              Tailwind puts utilities in <code>@layer utilities</code>, and
              unlayered CSS always wins over layered CSS. Import the stylesheet
              into a layer so your utilities keep the upper hand.
            </p>
            <CodeBlock language="css">{`@import 'tailwindcss';
@import 'react-compact-toast/styles.css' layer(components);`}</CodeBlock>
            <CodeBlock language="tsx">{`<ToastContainer injectStyles={false} />`}</CodeBlock>
          </Section>

          <Section id="ssr" title="Server rendering and Next.js">
            <p>
              The package is a client module. Call <code>toast()</code> from
              client code only: an event handler, an effect, or a promise
              callback, never during render or on the server.
            </p>
            <p>
              <code>&lt;ToastContainer /&gt;</code> may be rendered from a
              server layout as long as its props are serializable. This site
              does exactly that.
            </p>
            <CodeBlock language="tsx">{`// app/layout.tsx — a server component
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
}`}</CodeBlock>
            <p>
              Under a strict Content Security Policy, pass <code>nonce</code>,
              or set <code>injectStyles={'{false}'}</code> and import{' '}
              <code>react-compact-toast/styles.css</code> yourself.
            </p>
          </Section>

          <Section id="a11y" title="Accessibility">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Toasts are announced through a live region that exists before
                the first toast, so nothing is missed. <code>role: alert</code>{' '}
                and <code>type: error</code> interrupt; everything else waits
                politely.
              </li>
              <li>
                Auto-close pauses on hover, on focus, and while the tab is
                hidden, which is what WCAG 2.2.1 asks of a time limit.
              </li>
              <li>
                A toast that cannot be dismissed any other way always gets a
                close button.
              </li>
              <li>
                Enter and Space activate a toast, Escape dismisses it, and{' '}
                <kbd>Alt</kbd> + <kbd>T</kbd> jumps to the newest one. A
                dismissible toast carries{' '}
                <code>aria-keyshortcuts=&quot;Escape&quot;</code> so the
                shortcut is announced, and the hotkey is ignored while you are
                typing in a field.
              </li>
              <li>
                Under <code>prefers-reduced-motion</code> the slide is replaced
                by a fade.
              </li>
              <li>
                Focus moves to the next toast, or back where it came from, when
                a focused toast disappears.
              </li>
            </ul>
          </Section>

          <Section id="headless" title="Headless usage">
            <p>Build your own toast component on the same behaviour.</p>
            <CodeBlock language="tsx">{`import { useToast, useToastContainer } from 'react-compact-toast';

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
    <div key={position} className={\`my-group my-group--\${position}\`}>
      {toasts.map((record) => (
        <MyToast key={record.id} toast={record} />
      ))}
    </div>
  ));
}`}</CodeBlock>
            <p>
              <code>toastProps</code> carries the ref, ARIA attributes, keyboard
              handlers and hover tracking. Style the exit with{' '}
              <code>[data-rct-state=&quot;exiting&quot;]</code> using a CSS
              animation or transition; the toast is removed once it finishes.
            </p>
          </Section>
        </div>

        <footer className="mt-20 border-t border-neutral-200 pt-8 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">
            ← Back to the demo
          </Link>
          <span className="mx-3">·</span>
          <a
            className="hover:text-neutral-900"
            href="https://github.com/m2na7/react-compact-toast"
          >
            GitHub
          </a>
        </footer>
      </div>
    </div>
  );
}
