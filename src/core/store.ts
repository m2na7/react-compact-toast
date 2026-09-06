import { DEFAULT_LIMIT } from '../constants';
import type { ToastId, ToastOptions, ToastRecord } from '../types';

type Listener = () => void;

const EMPTY: readonly ToastRecord[] = Object.freeze([]);

/**
 * Framework-agnostic toast state. React binds to it with
 * `useSyncExternalStore`; everything else (the `toast()` API, tests) talks to
 * it directly. All updates are synchronous and immutable: `getSnapshot()`
 * returns a new array reference whenever the visible list changes.
 */
export interface ToastStore {
  subscribe: (listener: Listener) => () => void;
  /** Visible toasts (including ones playing their exit animation). */
  getSnapshot: () => readonly ToastRecord[];
  /** Always empty: toasts are never server-rendered. */
  getServerSnapshot: () => readonly ToastRecord[];
  /** Toasts waiting for a free slot. */
  getQueue: () => readonly ToastRecord[];
  getLimit: () => number;
  /**
   * Add a toast. When its id already exists the toast is updated in place,
   * brought back if it was exiting, and its timer version is bumped.
   * Outside the browser this is a no-op that still returns an id.
   */
  add: (options: ToastOptions) => ToastId;
  /** Mark visible toasts as exiting; drop queued ones. No id = all. */
  dismiss: (id?: ToastId) => void;
  /** Remove immediately, promote queued toasts, run `onClose`. No id = all. */
  remove: (id?: ToastId) => void;
  /** Patch a visible or queued toast. Unknown ids are ignored. A patch containing `autoClose` bumps the timer version. */
  update: (id: ToastId, patch: Partial<Omit<ToastOptions, 'id'>>) => void;
  /** Look up a visible or queued toast. */
  get: (id: ToastId) => ToastRecord | undefined;
  /** The next generated id. Callers that publish through the event hub need one up front. */
  nextId: () => ToastId;
  /**
   * Change the visible limit. Growing it promotes queued toasts; shrinking
   * it moves the newest visible toasts back to the front of the queue.
   */
  setLimit: (limit: number) => void;
  /**
   * Options merged *under* every toast added from now on. The container sets
   * these from its `toastOptions` prop so that defaults apply even to toasts
   * that are queued and never rendered.
   */
  setDefaults: (defaults: Partial<ToastOptions> | undefined) => void;
  getDefaults: () => Partial<ToastOptions> | undefined;
  /** Forget everything (tests). Does not run `onClose`. */
  reset: () => void;
}

function runOnClose(records: readonly ToastRecord[]): void {
  records.forEach((record) => {
    try {
      record.onClose?.();
    } catch (error) {
      // Never let one callback break removal of the others.
      setTimeout(() => {
        throw error;
      });
    }
  });
}

export function createToastStore(initialLimit = DEFAULT_LIMIT): ToastStore {
  let visible: readonly ToastRecord[] = EMPTY;
  let queue: readonly ToastRecord[] = EMPTY;
  let limit = initialLimit;
  let counter = 0;
  let defaults: Partial<ToastOptions> | undefined;
  const listeners = new Set<Listener>();

  const commit = (
    nextVisible: readonly ToastRecord[],
    nextQueue: readonly ToastRecord[]
  ) => {
    visible = nextVisible;
    queue = nextQueue;
    listeners.forEach((listener) => listener());
  };

  /** Toasts that `rebalance` dropped; their callbacks run after the commit. */
  const pendingClose: ToastRecord[] = [];

  /** Move queued toasts into free visible slots, or excess visible toasts back to the queue. */
  const rebalance = (
    nextVisible: readonly ToastRecord[],
    nextQueue: readonly ToastRecord[]
  ): [readonly ToastRecord[], readonly ToastRecord[]] => {
    const free = limit - nextVisible.length;
    if (free > 0 && nextQueue.length > 0) {
      return [
        [...nextVisible, ...nextQueue.slice(0, free)],
        nextQueue.slice(free),
      ];
    }
    if (free < 0) {
      // Toasts the user already dismissed are dropped rather than pushed back
      // into the queue, so a closed toast never reappears.
      const overflow = nextVisible.slice(limit);
      const dropped = overflow.filter((t) => t.dismissed);
      if (dropped.length > 0) pendingClose.push(...dropped);
      return [
        nextVisible.slice(0, limit),
        [...overflow.filter((t) => !t.dismissed), ...nextQueue],
      ];
    }
    return [nextVisible, nextQueue];
  };

  const get: ToastStore['get'] = (id) =>
    visible.find((t) => t.id === id) ?? queue.find((t) => t.id === id);

  const patch = (
    id: ToastId,
    changes: Partial<ToastRecord>,
    bumpVersion: boolean
  ) => {
    const apply = (t: ToastRecord): ToastRecord =>
      t.id === id
        ? {
            ...t,
            ...changes,
            id,
            version: bumpVersion ? t.version + 1 : t.version,
          }
        : t;
    commit(visible.map(apply), queue.map(apply));
  };

  const update: ToastStore['update'] = (id, changes) => {
    if (get(id)) patch(id, changes, 'autoClose' in changes);
  };

  const add: ToastStore['add'] = (options) => {
    const id = options.id ?? `rct-${++counter}`;
    if (typeof document === 'undefined') {
      // Server: nothing can display a toast, and keeping it would leak.
      return id;
    }
    if (get(id)) {
      patch(id, { ...options, dismissed: false }, true);
      return id;
    }
    const record: ToastRecord = {
      ...defaults,
      ...options,
      id,
      dismissed: false,
      version: 0,
      createdAt: Date.now(),
    };
    if (visible.length < limit) {
      commit([...visible, record], queue);
    } else {
      commit(visible, [...queue, record]);
    }
    return id;
  };

  const dismiss: ToastStore['dismiss'] = (id) => {
    if (id === undefined) {
      if (visible.length === 0 && queue.length === 0) return;
      const dropped = queue;
      commit(
        visible.map((t) => (t.dismissed ? t : { ...t, dismissed: true })),
        EMPTY
      );
      runOnClose(dropped);
      return;
    }
    const shown = visible.find((t) => t.id === id);
    if (shown) {
      if (!shown.dismissed) {
        commit(
          visible.map((t) => (t.id === id ? { ...t, dismissed: true } : t)),
          queue
        );
      }
      return;
    }
    const queued = queue.find((t) => t.id === id);
    if (queued) {
      commit(
        visible,
        queue.filter((t) => t.id !== id)
      );
      runOnClose([queued]);
    }
  };

  const remove: ToastStore['remove'] = (id) => {
    let removed: readonly ToastRecord[];
    if (id === undefined) {
      removed = [...visible, ...queue];
      if (removed.length === 0) return;
      commit(EMPTY, EMPTY);
    } else {
      removed = [...visible, ...queue].filter((t) => t.id === id);
      if (removed.length === 0) return;
      commit(
        ...rebalance(
          visible.filter((t) => t.id !== id),
          queue.filter((t) => t.id !== id)
        )
      );
    }
    runOnClose(removed);
  };

  const setLimit: ToastStore['setLimit'] = (nextLimit) => {
    limit = nextLimit;
    const [nextVisible, nextQueue] = rebalance(visible, queue);
    if (nextVisible !== visible) commit(nextVisible, nextQueue);
    runOnClose(pendingClose.splice(0));
  };

  const setDefaults: ToastStore['setDefaults'] = (next) => {
    defaults = next;
  };

  const reset: ToastStore['reset'] = () => {
    counter = 0;
    limit = initialLimit;
    defaults = undefined;
    commit(EMPTY, EMPTY);
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => visible,
    getServerSnapshot: () => EMPTY,
    getQueue: () => queue,
    getLimit: () => limit,
    add,
    dismiss,
    remove,
    update,
    get,
    nextId: () => `rct-${++counter}`,
    setLimit,
    setDefaults,
    getDefaults: () => defaults,
    reset,
  };
}

/**
 * The store shared by `toast()`, `ToastContainer` and the hooks. It is
 * registered on `globalThis` so that the ESM and CJS builds of the same
 * version (or HMR re-evaluations) share one instance instead of silently
 * splitting toasts across copies.
 */
const STORE_KEY = Symbol.for(`react-compact-toast/store@${__RCT_VERSION__}`);
const registry = globalThis as { [STORE_KEY]?: ToastStore };
export const toastStore: ToastStore = (registry[STORE_KEY] ??=
  createToastStore());
