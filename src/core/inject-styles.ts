import css from '../styles.css?inline';

/** Attribute that marks the injected `<style>` element (its value is the library version). */
export const STYLE_ATTRIBUTE = 'data-rct-styles';

/**
 * `true` when the built-in stylesheet is already active in the document,
 * whether injected by this function or imported manually — the stylesheet
 * declares `--rct-css` on `:root` as a marker.
 */
export function hasStyles(): boolean {
  if (typeof document === 'undefined') return true;
  if (document.querySelector(`style[${STYLE_ATTRIBUTE}]`)) return true;
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--rct-css')
      .trim() !== ''
  );
}

/**
 * Insert the built-in stylesheet into `<head>` once. It goes to the *top*
 * of `<head>` so that stylesheets loaded by the application come later and
 * win ties on specificity. No-op outside the browser and when the
 * stylesheet is already present (injected by another copy of the library,
 * or imported as `react-compact-toast/styles.css`).
 */
export function injectStyles(nonce?: string): void {
  if (hasStyles()) return;
  const style = document.createElement('style');
  style.setAttribute(STYLE_ATTRIBUTE, __RCT_VERSION__);
  if (nonce) style.setAttribute('nonce', nonce);
  style.textContent = css;
  document.head.prepend(style);
}
