import { isValidElement } from 'react';

import { DEFAULT_AUTO_CLOSE } from '../constants';
import { eventManager } from './event-manager';
import { toastStore } from './store';
import { ToastEvent } from '../types';
import type {
  ToastContent,
  ToastFn,
  ToastId,
  ToastMessageOptions,
  ToastOptions,
  ToastPromiseMessages,
  ToastShorthand,
  ToastType,
} from '../types';

/**
 * `toast({ text })` vs `toast(<b>node</b>)`: options are a plain object —
 * one whose prototype is `Object.prototype` — that is not a React element.
 * Arrays, iterables, promises and elements all carry their own prototype,
 * and a plain object is never a renderable node, so nothing that could have
 * been content is mistaken for options.
 */
export function isToastOptions(value: ToastContent): value is ToastOptions {
  if (value === null || typeof value !== 'object' || isValidElement(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value) as object | null;
  return proto === Object.prototype || proto === null;
}

function toOptions(
  content: ToastContent,
  options?: ToastMessageOptions
): ToastOptions {
  return isToastOptions(content)
    ? { ...options, ...content }
    : { ...options, text: content };
}

function resolveContent<T>(
  message: ToastContent | ((value: T) => ToastContent),
  value: T
): ToastContent {
  return typeof message === 'function' ? message(value) : message;
}

function show(content: ToastContent, options?: ToastMessageOptions): ToastId {
  const resolved = toOptions(content, options);
  const id = resolved.id ?? toastStore.nextId();
  eventManager.emit(ToastEvent.Add, { ...resolved, id });
  return id;
}

const shorthand =
  (type: ToastType): ToastShorthand =>
  (content, options) =>
    show(content, { ...options, type });

function promise<T>(
  promise: Promise<T>,
  messages: ToastPromiseMessages<T>,
  options?: ToastMessageOptions
): Promise<T> {
  const loading = toOptions(messages.loading);
  const id = show(
    { ...options, type: 'loading', ...loading, autoClose: false },
    undefined
  );
  // Keys set by the loading phase (e.g. a custom spinner) are cleared unless
  // the settled phase sets them again.
  const clear = Object.fromEntries(
    Object.keys(loading).map((key) => [key, undefined])
  ) as Partial<ToastOptions>;
  const settle = (type: ToastType, content: ToastContent) => {
    // The user closed it while the promise was in flight: respect that
    // instead of popping a new toast into an unrelated moment.
    if (!toastStore.get(id)) return;
    eventManager.emit(ToastEvent.Add, {
      ...clear,
      ...options,
      autoClose: options?.autoClose ?? DEFAULT_AUTO_CLOSE,
      type,
      ...toOptions(content),
      id,
    });
  };
  promise.then(
    (value) => settle('success', resolveContent(messages.success, value)),
    (error: unknown) => settle('error', resolveContent(messages.error, error))
  );
  return promise;
}

/**
 * Show a toast notification.
 *
 * ```ts
 * toast('Saved');
 * toast('Saved', { position: 'topRight' });
 * toast.success('Saved');
 * const id = toast.loading('Uploading…');
 * toast.update(id, { type: 'success', text: 'Done', autoClose: 3000 });
 * toast.dismiss(id);
 * ```
 *
 * A `ToastContainer` must be mounted somewhere in the tree for toasts to be
 * displayed; toasts created before it mounts are shown once it does.
 */
export const toast: ToastFn = Object.assign(show, {
  success: shorthand('success'),
  error: shorthand('error'),
  info: shorthand('info'),
  warning: shorthand('warning'),
  loading: shorthand('loading'),
  dismiss: (id?: ToastId) => eventManager.emit(ToastEvent.Dismiss, id),
  remove: (id?: ToastId) => eventManager.emit(ToastEvent.Delete, id),
  update: (id: ToastId, options: Partial<Omit<ToastOptions, 'id'>>) =>
    eventManager.emit(ToastEvent.Update, id, options),
  isActive: (id: ToastId) => toastStore.get(id) !== undefined,
  promise,
});
