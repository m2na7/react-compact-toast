import type { ToastPosition } from './types';

/** Default `autoClose` in milliseconds. */
export const DEFAULT_AUTO_CLOSE = 3000;
/** Default maximum number of simultaneously visible toasts. */
export const DEFAULT_LIMIT = 6;
/** Default position for toasts that do not set one. */
export const DEFAULT_POSITION: ToastPosition = 'bottomCenter';
/** Default accessible label of the close button. */
export const DEFAULT_CLOSE_BUTTON_LABEL = 'Close';
/** Default accessible name of the position groups. */
export const DEFAULT_REGION_LABEL = 'Notifications';
/** Default hotkey that focuses the newest toast (Alt+T). */
export const DEFAULT_HOTKEY: readonly string[] = ['altKey', 'KeyT'];
/**
 * Upper bound (ms) for waiting on exit animations before a dismissed toast
 * is force-removed (guards against paused or never-ending animations).
 */
export const MAX_EXIT_MS = 5000;
/** How long (ms) an announcement stays in the live region. */
export const ANNOUNCEMENT_MS = 7000;
