import type { ToastType } from '../types';

/** Paths of the built-in icons, drawn on a 24×24 grid. */
const PATHS = {
  success: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-3 10 2 2 4-4',
  error: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3 7-6 6m0-6 6 6',
  info: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 14v-4m0-4h.01',
  warning: 'M12 3 2 20h20zm0 6v4m0 4h.01',
  close: 'M18 6 6 18M6 6l12 12',
} satisfies Record<Exclude<ToastType, 'loading'> | 'close', string>;

/**
 * One of the built-in icons. Always decorative: the toast text carries the
 * meaning, and the close button carries its own label.
 */
export function Icon({ name }: { name: ToastType | 'close' }) {
  if (name === 'loading') return <span data-rct-spinner="" />;
  return (
    <svg
      width={name === 'close' ? '1em' : '1.25em'}
      height={name === 'close' ? '1em' : '1.25em'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
