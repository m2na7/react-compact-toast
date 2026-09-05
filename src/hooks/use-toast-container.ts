import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { DEFAULT_LIMIT, DEFAULT_POSITION } from '../constants';
import { cancelPendingEmits, subscribeToToasts } from '../core/event-manager';
import { toastStore } from '../core/store';
import type {
  ToastPosition,
  ToastPositionGroup,
  ToastRecord,
  UseToastContainerOptions,
  UseToastContainerResult,
} from '../types';

let mountedContainers = 0;

/**
 * Headless container behaviour: subscribes to the store, applies the
 * `limit`, and groups visible toasts by position. Render each group's
 * toasts with the built-in `Toast` or your own component.
 */
export function useToastContainer(
  options: UseToastContainerOptions = {}
): UseToastContainerResult {
  const {
    limit = DEFAULT_LIMIT,
    position = DEFAULT_POSITION,
    newestOnTop = false,
  } = options;

  const snapshot = useSyncExternalStore(
    subscribeToToasts,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot
  );

  useEffect(() => {
    const previous = toastStore.getLimit();
    toastStore.setLimit(limit);
    return () => {
      toastStore.setLimit(previous);
    };
  }, [limit]);

  useEffect(() => {
    mountedContainers += 1;
    // Warns in every build. Gating this on `process.env.NODE_ENV` does not
    // work here: the library is bundled once, so the check resolves at *our*
    // build time and the warning would never reach anyone. Mounting two
    // containers is always a mistake, and the warning costs one line.
    if (mountedContainers > 1) {
      console.warn(
        '[react-compact-toast] More than one toast container is mounted. Every toast would render in each of them; render a single <ToastContainer /> near the root of your app.'
      );
    }
    return () => {
      mountedContainers -= 1;
      // Nothing is left to announce to a container that is going away.
      if (mountedContainers === 0) cancelPendingEmits();
    };
  }, []);

  const toasts = useMemo(
    () => (newestOnTop ? [...snapshot].reverse() : snapshot),
    [snapshot, newestOnTop]
  );

  const groups = useMemo(() => {
    const map = new Map<ToastPosition, ToastRecord[]>();
    toasts.forEach((toast) => {
      const key = toast.position ?? position;
      const list = map.get(key);
      if (list) list.push(toast);
      else map.set(key, [toast]);
    });
    return map;
  }, [toasts, position]);

  const getToastPositionGroupToRender = useCallback(() => {
    const map = new Map<ToastPosition, ToastPositionGroup>();
    groups.forEach((list, key) => {
      map.set(key, {
        toasts: list.map((toast) => ({ ...toast, toastId: toast.id })),
        containerStyle: list.find((toast) => toast.containerStyle)
          ?.containerStyle,
      });
    });
    return map;
  }, [groups]);

  return {
    toasts,
    groups,
    dismiss: toastStore.dismiss,
    remove: toastStore.remove,
    getToastPositionGroupToRender,
  };
}
