import { act, render } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastContainer } from '../components/toast-container';
import { ToastEvent } from '../types';
import { eventManager } from './event-manager';
import { toastStore } from './store';
import { toast } from './toast';

describe('eventManager', () => {
  beforeEach(() => {
    toastStore.reset();
    eventManager.off(ToastEvent.Add);
    eventManager.off(ToastEvent.Dismiss);
    eventManager.off(ToastEvent.Delete);
    eventManager.off(ToastEvent.Update);
  });

  describe('subscribing', () => {
    it('registers and chains', () => {
      const callback = vi.fn();
      expect(eventManager.on(ToastEvent.Add, callback)).toBe(eventManager);
      expect(eventManager.list.get(ToastEvent.Add)).toContain(callback);
    });

    it('keeps several callbacks for one event', () => {
      const first = vi.fn();
      const second = vi.fn();
      eventManager.on(ToastEvent.Add, first).on(ToastEvent.Add, second);
      expect(eventManager.list.get(ToastEvent.Add)).toHaveLength(2);
    });

    it('removes one callback, or all of them', () => {
      const first = vi.fn();
      const second = vi.fn();
      eventManager.on(ToastEvent.Add, first).on(ToastEvent.Add, second);

      eventManager.off(ToastEvent.Add, first);
      expect(eventManager.list.get(ToastEvent.Add)).toEqual([second]);

      eventManager.off(ToastEvent.Add);
      expect(eventManager.list.has(ToastEvent.Add)).toBe(false);
    });

    it('ignores an unsubscribe for an event nobody listens to', () => {
      expect(() => eventManager.off(ToastEvent.Update, vi.fn())).not.toThrow();
    });
  });

  describe('publishing', () => {
    it('applies the change at once and announces it a tick later', () => {
      vi.useFakeTimers();
      const listener = vi.fn();
      eventManager.on(ToastEvent.Add, listener);

      eventManager.emit(ToastEvent.Add, { id: 'a', text: 'hi' });

      // Applied straight away, so `isActive` and the limit are never stale.
      expect(toastStore.get('a')?.text).toBe('hi');
      expect(listener).not.toHaveBeenCalled();

      vi.runAllTimers();
      expect(listener).toHaveBeenCalledWith({ id: 'a', text: 'hi' });
    });

    it('carries the payload of every event', () => {
      vi.useFakeTimers();
      const onUpdate = vi.fn();
      const onDismiss = vi.fn();
      const onDelete = vi.fn();
      eventManager
        .on(ToastEvent.Update, onUpdate)
        .on(ToastEvent.Dismiss, onDismiss)
        .on(ToastEvent.Delete, onDelete);

      eventManager.emit(ToastEvent.Add, { id: 'a', text: 'hi' });
      eventManager.emit(ToastEvent.Update, 'a', { text: 'bye' });
      eventManager.emit(ToastEvent.Dismiss, 'a');
      eventManager.emit(ToastEvent.Delete, 'a');
      vi.runAllTimers();

      expect(onUpdate).toHaveBeenCalledWith('a', { text: 'bye' });
      expect(onDismiss).toHaveBeenCalledWith('a');
      expect(onDelete).toHaveBeenCalledWith('a');
    });

    it('does nothing when nobody is listening', () => {
      vi.useFakeTimers();
      eventManager.emit(ToastEvent.Add, { id: 'a', text: 'hi' });
      expect(eventManager.emitQueue.get(ToastEvent.Add) ?? []).toHaveLength(0);
      expect(toastStore.get('a')).toBeDefined();
    });
  });

  describe('cancelEmit', () => {
    it('drops notifications that have not been delivered', () => {
      vi.useFakeTimers();
      const listener = vi.fn();
      eventManager.on(ToastEvent.Add, listener);
      eventManager.emit(ToastEvent.Add, { id: 'a', text: 'hi' });

      expect(eventManager.cancelEmit(ToastEvent.Add)).toBe(eventManager);
      vi.runAllTimers();

      expect(listener).not.toHaveBeenCalled();
      expect(eventManager.emitQueue.has(ToastEvent.Add)).toBe(false);
    });

    it('clears the queue once a notification is delivered', () => {
      vi.useFakeTimers();
      eventManager.on(ToastEvent.Add, vi.fn());
      eventManager.emit(ToastEvent.Add, { id: 'a', text: 'hi' });
      vi.runAllTimers();
      expect(eventManager.emitQueue.get(ToastEvent.Add)).toEqual([]);
    });

    it('is safe for an event with nothing queued', () => {
      expect(() => eventManager.cancelEmit(ToastEvent.Delete)).not.toThrow();
    });
  });

  describe('activeToastCount', () => {
    it('is derived from the toasts on screen, so it cannot drift', () => {
      expect(eventManager.activeToastCount).toBe(0);

      const id = toast('a');
      expect(eventManager.activeToastCount).toBe(1);

      toast.remove(id);
      expect(eventManager.activeToastCount).toBe(0);
    });

    it('never goes negative when an unknown toast is removed', () => {
      toast.remove('never-existed');
      expect(eventManager.activeToastCount).toBe(0);
    });

    it('counts a burst against the real list, not a separate tally', () => {
      // 0.2.3 checked the limit before a `setTimeout` incremented the count,
      // so twenty calls in one tick all passed the check.
      for (let index = 0; index < 20; index += 1) toast(`t${index}`);

      expect(eventManager.activeToastCount).toBe(6);
      expect(toastStore.getQueue()).toHaveLength(14);
    });
  });

  it('still shows the toast when one is raised during a render', () => {
    // React warns about this — updating one component while another renders
    // is the caller's mistake, and the library does not hide it. What it does
    // guarantee is that the toast is not lost.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let bump: (value: number) => void = () => {};

    function Sibling() {
      const [count, setCount] = useState(0);
      bump = setCount;
      if (count > 0) toast('raised while rendering');
      return null;
    }

    render(
      <>
        <Sibling />
        <ToastContainer />
      </>
    );
    act(() => bump(1));

    expect(toastStore.getSnapshot()).toHaveLength(1);
    expect(document.querySelector('[data-rct-toast]')).toHaveTextContent(
      'raised while rendering'
    );
  });
});
