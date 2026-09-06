// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ToastContainer } from './components/toast-container';
import { injectStyles } from './core/inject-styles';
import { toastStore } from './core/store';
import { toast } from './core/toast';

describe('server rendering', () => {
  it('renders the live regions and no toasts', () => {
    const html = renderToString(<ToastContainer />);

    expect(html).toContain('data-rct-announcer');
    expect(html).not.toContain('data-rct-toast');
    expect(html).not.toContain('data-rct-container');
  });

  it('renders with a portal requested, since there is nothing to portal into', () => {
    expect(() => renderToString(<ToastContainer portal />)).not.toThrow();
  });

  it('accepts toast() without throwing and stores nothing', () => {
    expect(() => toast('from the server')).not.toThrow();
    expect(toastStore.getSnapshot()).toHaveLength(0);
  });

  it('does not touch the DOM when styles are injected', () => {
    expect(() => injectStyles()).not.toThrow();
  });
});
