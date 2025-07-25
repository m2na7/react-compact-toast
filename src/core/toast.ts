import { eventManager } from './event-manager';
import { ToastEvent, ToastProps } from '../types';

type ToastOptions = Omit<ToastProps, 'toastId'>;

const emitAddToast = (toastProps: ToastOptions) => {
  const id = crypto.randomUUID();

  eventManager.emit(ToastEvent.Add, {
    ...toastProps,
    toastId: id,
  });
  return id;
};

/**
 * Creates and displays a toast notification.
 *
 * @param {ToastOptions | string} options - Toast configuration options or a simple text message
 *   - If a string is provided, it will be converted to `{ text: options }`
 *   - If an object is provided, it should contain toast configuration properties:
 * @param {string} options.text - The text content to display in the toast
 * @param {React.JSX.Element | string | 'default'} [options.icon] - Icon to display in the toast:
 *   - JSX Element: Custom React component
 *   - string: Text/emoji icon
 *   - 'default': Default icon
 *   - undefined: No icon
 * @param {string} [options.highlightText] - Text to highlight with a different color
 * @param {string} [options.highlightColor] - Custom color for the highlighted text (CSS color value)
 * @param {false | number} [options.autoClose=3000] - Auto-close behavior:
 *   - `false`: Toast will not close automatically
 *   - `number`: Time in milliseconds before the toast closes automatically
 * @param {boolean} [options.closeOnClick=true] - Whether the toast should close when clicked
 * @param {ToastPosition} [options.position='bottomCenter'] - Position where the toast appears:
 *   - 'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight'
 * @param {string} [options.className] - Custom CSS classes to apply to the toast
 * @param {string | number} [options.offset] - Custom offset from screen edge:
 *   - `string`: CSS value like '50px', '2rem', '5vh'
 *   - `number`: Pixel value (e.g., 50 becomes '50px')
 * @returns {string} The unique ID of the created toast
 *
 * @example
 * // Simple text toast
 * toast('Hello, world!');
 *
 * @example
 * // Toast with custom options
 * toast({
 *   text: 'Custom notification',
 *   icon: '🚀',
 *   highlightText: 'Custom',
 *   highlightColor: '#ff6b6b',
 *   autoClose: 5000,
 *   closeOnClick: true,
 *   position: 'topRight',
 *   className: 'bg-blue-500 text-white rounded-lg',
 *   offset: 50, // 50px from screen edge
 * });
 *
 * @example
 * // Toast with custom offset
 * toast({
 *   text: 'Far from edge',
 *   position: 'topCenter',
 *   offset: '100px', // 100px from top
 * });
 */
export const toast = (options: ToastOptions | string): string => {
  const toastOptions: ToastOptions =
    typeof options === 'string' ? { text: options } : options;

  return emitAddToast(toastOptions);
};
