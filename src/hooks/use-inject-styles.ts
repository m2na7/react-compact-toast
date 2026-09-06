import { useInsertionEffect } from 'react';

import { injectStyles } from '../core/inject-styles';

/**
 * Inject the built-in stylesheet before the first paint of the component.
 * Runs on the client only, so server rendering never touches the DOM.
 */
export function useInjectStyles(enabled = true, nonce?: string): void {
  useInsertionEffect(() => {
    if (enabled) injectStyles(nonce);
  }, [enabled, nonce]);
}
