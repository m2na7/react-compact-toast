# Contributing

Thanks for taking the time. Bug reports, questions and pull requests are all
welcome.

## Getting set up

You need Node 20 or newer and pnpm 10.

```bash
git clone https://github.com/m2na7/react-compact-toast.git
cd react-compact-toast
pnpm install          # also installs Git hooks
pnpm playground       # http://localhost:3000
```

The playground is a Next.js app that consumes the library through the
workspace, exactly as a published install would. Run `pnpm build` once so it
has something to import, or `pnpm dev` to rebuild on change.

## Scripts

| Command                             | What it does                                           |
| ----------------------------------- | ------------------------------------------------------ |
| `pnpm build`                        | Bundles to `dist/` and runs `attw` and `publint`       |
| `pnpm dev`                          | Same, in watch mode                                    |
| `pnpm test`                         | Vitest: unit, integration, server rendering, hydration |
| `pnpm test:watch`                   | Vitest in watch mode                                   |
| `pnpm test:coverage`                | Vitest with coverage into `coverage/`                  |
| `pnpm test:browser`                 | Cypress component tests, headless                      |
| `pnpm test:browser:open`            | The same in the Cypress UI                             |
| `pnpm test:package`                 | Packs the tarball and checks it as a consumer would    |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                                 |
| `pnpm format` / `pnpm format:check` | Prettier                                               |
| `pnpm type-check`                   | TypeScript, for the library and for Cypress            |
| `pnpm check`                        | Everything above, in the order CI runs it              |

## Where tests go

Three layers, each for what only it can answer:

- **Vitest** (`src/**/*.test.ts[x]`, jsdom) covers state, timers, the public
  API and the rendered DOM. It is the default; write here first.
- **Cypress** (`src/**/*.cy.tsx`, a real browser) covers what jsdom cannot:
  CSS animations, computed layout, `pointer-events`, scrollbars and focus.
- **`scripts/check-package.mjs`** covers the published artifact: the export
  map, the `'use client'` banner, the embedded stylesheet, `attw`, `publint`.

Test behaviour a user could observe, not internals. If a bug reaches `main`,
add the test that would have caught it in the layer that could have.

## Making a change

1. Branch off `main`.
2. Keep public API changes in sync with three places: the JSDoc in
   `src/types.ts`, the tables in `README.md`, and `CHANGELOG.md`.
3. Run `pnpm check`. The pre-push hook runs the type check and the unit tests;
   CI runs everything, on React 18 and 19.
4. Watch the bundle size. A pull request comments the compressed size of
   `dist/`. Growth is fine when it buys something; say what in the description.
5. Write the commit subject as `type(scope): summary`, for example
   `fix(store): keep the queue in order when the limit shrinks`.

## Reporting a bug

A runnable reproduction saves the most time: a StackBlitz, a CodeSandbox, or a
minimal repository. Please include the versions of the library, React, and
your bundler or framework, plus whether you use `injectStyles={false}`, a
`className`, or your own CSS on any `data-rct-*` selector.

## Deploying the playground

Vercel builds the demo site from the repository root, and it detects the
framework from the root `package.json` — which is the only reason `next`
appears in the root `devDependencies`. It is not used to build or test the
library, and pnpm resolves it to the same copy the playground already
installs, so it costs nothing but the entry.

The cleaner setup is to point the Vercel project's **Root Directory** at
`playground`. Detection then happens against `playground/package.json`,
`playground/vercel.json` takes over the build, and `next` can be dropped
from the root.

## Releasing

Maintainers only. The `Release` workflow takes a version, runs `pnpm check`,
tags, publishes to npm with provenance and creates the GitHub release from the
matching `CHANGELOG.md` section. Move entries out of `Unreleased` into a
version heading before running it.
