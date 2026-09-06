import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/**',
    'coverage/**',
    'node_modules/**',
    // the playground ships its own eslint.config.js (eslint-config-next)
    'playground/**',
    'cypress/screenshots/**',
    'cypress/videos/**',
    'cypress/downloads/**',
  ]),

  js.configs.recommended,
  tseslint.configs.recommended,

  // Library source: browser globals + React / hooks / a11y rules.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Root config files, scripts and Cypress support run under Node (or the
  // Cypress runner) and are plain TypeScript/ESM.
  {
    files: [
      '*.{js,mjs,cjs,ts,mts,cts}',
      'scripts/**/*.{js,mjs,ts}',
      'cypress/**/*.ts',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Cypress augments the global `Cypress` namespace; that is the documented way.
  {
    files: ['cypress/**/*.ts', 'src/**/*.cy.tsx'],
    rules: {
      '@typescript-eslint/no-namespace': 'off',
    },
  },
]);
