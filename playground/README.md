# React Compact Toast Playground

A [Next.js](https://nextjs.org) (App Router) playground for `react-compact-toast`. It doubles as the
public demo site.

## Quick start

```bash
# from the repository root
pnpm install
pnpm build          # builds the library into dist/
pnpm playground     # next dev

# or directly inside playground/
pnpm dev
```

## How it consumes the library

The playground depends on the library through the pnpm workspace
(`"react-compact-toast": "workspace:*"`), so it imports the **built** package
exactly like a real consumer would:

```tsx
import { ToastContainer, toast } from 'react-compact-toast';
```

Consequences:

- Run `pnpm build` (or `pnpm dev` for watch mode) at the root after changing
  library source. The playground picks up whatever the last build wrote.
- No manual stylesheet import is needed. `<ToastContainer />` injects the
  built-in styles, and the playground relies on that on purpose to catch
  packaging regressions.

## Scripts

| Script               | What it does                                             |
| -------------------- | -------------------------------------------------------- |
| `pnpm dev`           | Start the Next.js dev server                             |
| `pnpm build`         | Production build (`next build`)                          |
| `pnpm start`         | Serve the production build                               |
| `pnpm lint`          | ESLint (flat config via `eslint-config-next`)            |
| `pnpm build:vercel`  | Build the library, then the playground, for Vercel       |

## Deploying

Vercel builds from the repository root (`vercel.json`), which runs
`pnpm build && pnpm --filter playground build`. `playground/vercel.json` mirrors
that through `build:vercel` for a Vercel project rooted at `playground/`.
