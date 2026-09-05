## What this changes

<!-- One or two sentences. Link the issue it closes, if any. -->

## Why

<!-- The problem this solves, or the behaviour it corrects. -->

## Checklist

- [ ] `pnpm check` passes
- [ ] Tests cover the change, in the layer that could have caught it
      (Vitest for state and DOM, Cypress for animation, layout or focus,
      `pnpm test:package` for the published artifact)
- [ ] Public API changes are reflected in the JSDoc in `src/types.ts`,
      the tables in `README.md`, and `CHANGELOG.md`
- [ ] Bundle size change is expected, or explained below
