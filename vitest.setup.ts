import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { resetAnnouncer } from './src/core/announcer';
import { toastStore } from './src/core/store';

afterEach(() => {
  if (typeof document !== 'undefined') {
    cleanup();
    // Page-focus state is module-level and sticky; a test that blurred the
    // window would otherwise pause every later test's auto-close timers.
    window.dispatchEvent(new Event('focus'));
    document
      .querySelectorAll('style[data-rct-styles]')
      .forEach((element) => element.remove());
  }
  toastStore.reset();
  resetAnnouncer();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
