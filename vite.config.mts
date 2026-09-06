import { readFileSync } from 'node:fs';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
) as { version: string };

/** Dev-server config for the Cypress component runner. */
export default defineConfig({
  plugins: [react()],
  define: { __RCT_VERSION__: JSON.stringify(version) },
});
