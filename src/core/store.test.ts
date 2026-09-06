import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createToastStore, toastStore } from './store';

const ids = (list: readonly { id: string }[]) => list.map((t) => t.id);

describe('toast store', () => {
  beforeEach(() => {
    toastStore.reset();
  });

  describe('add', () => {
    it('generates sequential ids that do not need a secure context', () => {
      expect(toastStore.add({ text: 'a' })).toBe('rct-1');
      expect(toastStore.add({ text: 'b' })).toBe('rct-2');
    });

    it('honours a custom id', () => {
      expect(toastStore.add({ id: 'mine', text: 'a' })).toBe('mine');
    });

    it('shows toasts up to the limit and queues the rest', () => {
      const store = createToastStore(2);
      store.add({ text: 'a' });
      store.add({ text: 'b' });
      store.add({ text: 'c' });

      expect(ids(store.getSnapshot())).toEqual(['rct-1', 'rct-2']);
      expect(ids(store.getQueue())).toEqual(['rct-3']);
    });

    it('updates in place instead of duplicating an existing id', () => {
      toastStore.add({ id: 'x', text: 'first' });
      toastStore.add({ id: 'x', text: 'second' });

      expect(toastStore.getSnapshot()).toHaveLength(1);
      expect(toastStore.get('x')?.text).toBe('second');
    });

    it('revives a dismissed toast and restarts its timer', () => {
      toastStore.add({ id: 'x', text: 'first' });
      toastStore.dismiss('x');
      expect(toastStore.get('x')?.dismissed).toBe(true);

      toastStore.add({ id: 'x', text: 'again' });

      expect(toastStore.get('x')?.dismissed).toBe(false);
      expect(toastStore.get('x')?.version).toBe(1);
    });
  });

  describe('snapshots', () => {
    it('keeps the same reference until something changes', () => {
      const before = toastStore.getSnapshot();
      expect(toastStore.getSnapshot()).toBe(before);

      toastStore.add({ text: 'a' });
      expect(toastStore.getSnapshot()).not.toBe(before);
    });

    it('is always empty on the server', () => {
      toastStore.add({ text: 'a' });
      expect(toastStore.getServerSnapshot()).toHaveLength(0);
    });

    it('notifies subscribers and stops after unsubscribing', () => {
      const listener = vi.fn();
      const unsubscribe = toastStore.subscribe(listener);

      toastStore.add({ text: 'a' });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      toastStore.add({ text: 'b' });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismiss', () => {
    it('marks a visible toast as exiting without removing it', () => {
      const id = toastStore.add({ text: 'a' });
      toastStore.dismiss(id);

      expect(toastStore.getSnapshot()).toHaveLength(1);
      expect(toastStore.get(id)?.dismissed).toBe(true);
    });

    it('drops a queued toast and runs its onClose', () => {
      const store = createToastStore(1);
      const onClose = vi.fn();
      store.add({ text: 'a' });
      const queued = store.add({ text: 'b', onClose });

      store.dismiss(queued);

      expect(store.getQueue()).toHaveLength(0);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('without an id dismisses every visible toast and clears the queue', () => {
      const store = createToastStore(1);
      store.add({ text: 'a' });
      store.add({ text: 'b' });

      store.dismiss();

      expect(store.getSnapshot()[0]?.dismissed).toBe(true);
      expect(store.getQueue()).toHaveLength(0);
    });

    it('is a no-op for an unknown id', () => {
      const listener = vi.fn();
      toastStore.subscribe(listener);
      toastStore.dismiss('nope');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('promotes a queued toast into the freed slot', () => {
      const store = createToastStore(1);
      const first = store.add({ text: 'a' });
      store.add({ text: 'b' });

      store.remove(first);

      expect(ids(store.getSnapshot())).toEqual(['rct-2']);
      expect(store.getQueue()).toHaveLength(0);
    });

    it('runs onClose exactly once per removed toast', () => {
      const onClose = vi.fn();
      const id = toastStore.add({ text: 'a', onClose });

      toastStore.remove(id);
      toastStore.remove(id);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('keeps removing when one onClose throws', () => {
      vi.useFakeTimers();
      const second = vi.fn();
      toastStore.add({
        text: 'a',
        onClose: () => {
          throw new Error('boom');
        },
      });
      toastStore.add({ text: 'b', onClose: second });

      toastStore.remove();

      expect(toastStore.getSnapshot()).toHaveLength(0);
      expect(second).toHaveBeenCalledTimes(1);
      // The failure is rethrown asynchronously so it reaches error reporting.
      expect(() => vi.runAllTimers()).toThrow('boom');
    });

    it('is a no-op for an unknown id', () => {
      const listener = vi.fn();
      toastStore.subscribe(listener);
      toastStore.remove('nope');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('patches a visible toast', () => {
      const id = toastStore.add({ text: 'a' });
      toastStore.update(id, { text: 'b' });
      expect(toastStore.get(id)?.text).toBe('b');
    });

    it('patches a queued toast', () => {
      const store = createToastStore(1);
      store.add({ text: 'a' });
      const queued = store.add({ text: 'b' });

      store.update(queued, { text: 'c' });

      expect(store.getQueue()[0]?.text).toBe('c');
    });

    it('bumps the timer version only when autoClose is part of the patch', () => {
      const id = toastStore.add({ text: 'a' });

      toastStore.update(id, { text: 'b' });
      expect(toastStore.get(id)?.version).toBe(0);

      toastStore.update(id, { autoClose: 1000 });
      expect(toastStore.get(id)?.version).toBe(1);
    });

    it('ignores an unknown id', () => {
      const listener = vi.fn();
      toastStore.subscribe(listener);
      toastStore.update('nope', { text: 'b' });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('setLimit', () => {
    it('promotes queued toasts when the limit grows', () => {
      const store = createToastStore(1);
      store.add({ text: 'a' });
      store.add({ text: 'b' });

      store.setLimit(2);

      expect(ids(store.getSnapshot())).toEqual(['rct-1', 'rct-2']);
      expect(store.getQueue()).toHaveLength(0);
    });

    it('drops a dismissed toast instead of queueing it for a comeback', () => {
      const onClose = vi.fn();
      const store = createToastStore(2);
      store.add({ text: 'a' });
      const newest = store.add({ text: 'b', onClose });
      store.dismiss(newest);

      store.setLimit(1);

      expect(store.getQueue()).toHaveLength(0);
      expect(store.get(newest)).toBeUndefined();
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('demotes the newest toasts when the limit shrinks', () => {
      const store = createToastStore(3);
      store.add({ text: 'a' });
      store.add({ text: 'b' });
      store.add({ text: 'c' });

      store.setLimit(1);

      expect(ids(store.getSnapshot())).toEqual(['rct-1']);
      expect(ids(store.getQueue())).toEqual(['rct-2', 'rct-3']);
    });
  });

  describe('defaults', () => {
    it('merges under every new toast', () => {
      const onClose = vi.fn();
      toastStore.setDefaults({ position: 'topLeft', onClose });
      const id = toastStore.add({ text: 'a' });

      expect(toastStore.get(id)?.position).toBe('topLeft');

      toastStore.remove(id);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("loses to the toast's own options", () => {
      toastStore.setDefaults({ position: 'topLeft' });
      const id = toastStore.add({ text: 'a', position: 'bottomRight' });
      expect(toastStore.get(id)?.position).toBe('bottomRight');
    });

    it('applies to a queued toast that never renders', () => {
      const onClose = vi.fn();
      const store = createToastStore(1);
      store.setDefaults({ onClose });
      store.add({ text: 'a' });
      const queued = store.add({ text: 'b' });

      store.dismiss(queued);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('exposes one instance across module copies of the same version', async () => {
    const id = toastStore.add({ text: 'shared' });
    vi.resetModules();
    const reimported = await import('./store');

    expect(reimported.toastStore).toBe(toastStore);
    expect(reimported.toastStore.get(id)?.text).toBe('shared');
  });
});
