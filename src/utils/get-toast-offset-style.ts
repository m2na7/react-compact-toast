import { ToastProps } from '../types';

/**
 * Generate inline styles for toast container based on offset configuration
 * @param toasts Array of toast props for the position group
 * @param position Toast position (e.g., 'topCenter', 'bottomLeft')
 * @returns Inline style object for the container
 */
export const getToastOffsetStyle = (
  toasts: ToastProps[],
  position: string
): React.CSSProperties => {
  const firstToast = toasts[0];
  if (!firstToast?.offset) return {};

  const offset =
    typeof firstToast.offset === 'number'
      ? `${firstToast.offset}px`
      : firstToast.offset;

  if (position.startsWith('top')) {
    return { top: offset };
  } else if (position.startsWith('bottom')) {
    return { bottom: offset };
  }
  return {};
};
