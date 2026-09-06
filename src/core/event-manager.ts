import { toastStore } from './store';
import type {
  EventCallbacks,
  EventManager,
  TimeoutId,
  ToastId,
  ToastOptions,
} from '../types';
import { ToastEvent } from '../types';

/**
 * The publish–subscribe hub every toast travels through.
 *
 * `toast()` publishes from anywhere in the app and `ToastContainer`
 * subscribes, so neither needs a context or a hook to reach the other.
 *
 * Two rules keep it honest:
 *
 * 1. It owns no state of its own. The toast list lives in the store, and
 *    `activeToastCount` reads from it, so the count can never drift from
 *    what is on screen.
 * 2. The state change is applied as soon as `emit` is called, but
 *    subscribers are notified on the next tick. Applying immediately means
 *    the limit is decided against the real list; notifying later means a
 *    `toast()` raised during a render never updates a component mid-render.
 */
export const eventManager: EventManager = {
  list: new Map(),
  emitQueue: new Map(),

  /** Toasts currently on screen. Derived, never counted separately. */
  get activeToastCount() {
    return toastStore.getSnapshot().length;
  },

  on<E extends ToastEvent>(event: E, callback: EventCallbacks[E]) {
    const callbacks = this.list.get(event);
    if (callbacks) callbacks.push(callback as EventCallbacks[ToastEvent]);
    else this.list.set(event, [callback as EventCallbacks[ToastEvent]]);
    return this;
  },

  off<E extends ToastEvent>(event: E, callback?: EventCallbacks[E]) {
    if (!callback) {
      this.list.delete(event);
      return this;
    }
    const callbacks = this.list.get(event);
    if (callbacks) {
      this.list.set(
        event,
        callbacks.filter((registered) => registered !== callback)
      );
    }
    return this;
  },

  emit<E extends ToastEvent>(event: E, ...args: Parameters<EventCallbacks[E]>) {
    // Apply now, so `toast.isActive` and the limit see the real list.
    switch (event) {
      case ToastEvent.Add:
        toastStore.add(args[0] as ToastOptions);
        break;
      case ToastEvent.Dismiss:
        toastStore.dismiss(args[0] as ToastId | undefined);
        break;
      case ToastEvent.Delete:
        toastStore.remove(args[0] as ToastId | undefined);
        break;
      case ToastEvent.Update:
        toastStore.update(
          args[0] as ToastId,
          args[1] as Partial<Omit<ToastOptions, 'id'>>
        );
        break;
    }

    // Notify next tick. React forbids updating one component while another
    // is rendering, and `toast()` is often called from exactly there.
    const callbacks = this.list.get(event);
    if (!callbacks || callbacks.length === 0) return;

    const timer: TimeoutId = setTimeout(() => {
      this.emitQueue.set(
        event,
        (this.emitQueue.get(event) ?? []).filter((queued) => queued !== timer)
      );
      callbacks.forEach((callback) => {
        (callback as (...rest: unknown[]) => void)(...args);
      });
    }, 0);

    this.emitQueue.set(event, [...(this.emitQueue.get(event) ?? []), timer]);
  },

  cancelEmit(event: ToastEvent) {
    const timers = this.emitQueue.get(event);
    if (timers) {
      timers.forEach(clearTimeout);
      this.emitQueue.delete(event);
    }
    return this;
  },
};

const ALL_EVENTS = [
  ToastEvent.Add,
  ToastEvent.Dismiss,
  ToastEvent.Delete,
  ToastEvent.Update,
] as const;

/**
 * Subscribe to every toast event at once, in the shape
 * `useSyncExternalStore` wants.
 *
 * Both paths are listened to. The hub announces a tick late, which is what
 * `on()` subscribers see; the store announces at once, so the toast is on
 * screen in the same frame it was raised. React de-duplicates the two by
 * snapshot identity.
 */
export function subscribeToToasts(listener: () => void): () => void {
  ALL_EVENTS.forEach((event) =>
    eventManager.on(event, listener as EventCallbacks[typeof event])
  );
  const unsubscribeFromStore = toastStore.subscribe(listener);
  return () => {
    ALL_EVENTS.forEach((event) =>
      eventManager.off(event, listener as EventCallbacks[typeof event])
    );
    unsubscribeFromStore();
  };
}

/** Drop every notification that has been scheduled but not yet delivered. */
export function cancelPendingEmits(): void {
  ALL_EVENTS.forEach((event) => eventManager.cancelEmit(event));
}
