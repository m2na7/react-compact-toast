import { useSyncExternalStore } from 'react';

let pageFocused = true;
let bound = false;
const listeners = new Set<() => void>();

function setPageFocused(next: boolean): void {
  if (next === pageFocused) return;
  pageFocused = next;
  listeners.forEach((listener) => listener());
}

function bind(): void {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  // Seed from the document: a page that loads in a background tab starts
  // paused, and would otherwise never receive a change event to correct it.
  pageFocused = document.visibilityState === 'visible' && document.hasFocus();
  window.addEventListener('focus', () => setPageFocused(true));
  window.addEventListener('blur', () => setPageFocused(false));
  document.addEventListener('visibilitychange', () =>
    setPageFocused(document.visibilityState === 'visible')
  );
}

function subscribe(listener: () => void): () => void {
  bind();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => pageFocused;
const getServerSnapshot = () => true;

/**
 * `true` while the window is focused and the tab is visible. Starts as
 * `true` and follows `focus` / `blur` / `visibilitychange` from then on.
 */
export function usePageFocus(enabled = true): boolean {
  const focused = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return enabled ? focused : true;
}
