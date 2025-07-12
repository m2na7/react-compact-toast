import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventManager } from './event-manager';
import { ToastEvent, ToastProps } from '../types';

describe('eventManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    eventManager.list.clear();
    eventManager.emitQueue.clear();
    eventManager.activeToastCount = 0;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('on method', () => {
    it('should register event listener', () => {
      const callback = vi.fn();

      eventManager.on(ToastEvent.Add, callback);

      expect(eventManager.list.has(ToastEvent.Add)).toBe(true);
      expect(eventManager.list.get(ToastEvent.Add)).toContain(callback);
    });

    it('should register multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventManager.on(ToastEvent.Add, callback1);
      eventManager.on(ToastEvent.Add, callback2);

      const callbacks = eventManager.list.get(ToastEvent.Add);
      expect(callbacks).toHaveLength(2);
      expect(callbacks).toContain(callback1);
      expect(callbacks).toContain(callback2);
    });

    it('should return eventManager instance for chaining', () => {
      const callback = vi.fn();

      const result = eventManager.on(ToastEvent.Add, callback);

      expect(result).toBe(eventManager);
    });
  });

  describe('off method', () => {
    it('should remove specific callback', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventManager.on(ToastEvent.Add, callback1);
      eventManager.on(ToastEvent.Add, callback2);

      eventManager.off(ToastEvent.Add, callback1);

      const callbacks = eventManager.list.get(ToastEvent.Add);
      expect(callbacks).toHaveLength(1);
      expect(callbacks).toContain(callback2);
      expect(callbacks).not.toContain(callback1);
    });

    it('should remove all callbacks when no callback specified', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      eventManager.on(ToastEvent.Add, callback1);
      eventManager.on(ToastEvent.Add, callback2);

      eventManager.off(ToastEvent.Add);

      expect(eventManager.list.has(ToastEvent.Add)).toBe(false);
    });

    it('should handle removing callback from non-existent event', () => {
      const callback = vi.fn();

      expect(() => {
        eventManager.off(ToastEvent.Add, callback);
      }).not.toThrow();
    });

    it('should return eventManager instance for chaining', () => {
      const callback = vi.fn();

      const result = eventManager.off(ToastEvent.Add, callback);

      expect(result).toBe(eventManager);
    });
  });

  describe('emit method', () => {
    describe('Add event', () => {
      it('should emit Add event and call registered callbacks', () => {
        const callback = vi.fn();
        const toastProps: ToastProps = {
          toastId: 'test-id',
          text: 'Test message',
        };

        eventManager.on(ToastEvent.Add, callback);
        eventManager.emit(ToastEvent.Add, toastProps);

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledWith(toastProps);
        expect(eventManager.activeToastCount).toBe(1);
      });

      it('should not emit when max toast count reached', () => {
        const callback = vi.fn();
        const toastProps: ToastProps = {
          toastId: 'test-id',
          text: 'Test message',
        };

        eventManager.activeToastCount = 10;

        eventManager.on(ToastEvent.Add, callback);
        eventManager.emit(ToastEvent.Add, toastProps);

        vi.runAllTimers();

        expect(callback).not.toHaveBeenCalled();
        expect(eventManager.activeToastCount).toBe(10);
      });

      it('should call multiple callbacks for Add event', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        const toastProps: ToastProps = {
          toastId: 'test-id',
          text: 'Test message',
        };

        eventManager.on(ToastEvent.Add, callback1);
        eventManager.on(ToastEvent.Add, callback2);
        eventManager.emit(ToastEvent.Add, toastProps);

        vi.runAllTimers();

        expect(callback1).toHaveBeenCalledWith(toastProps);
        expect(callback2).toHaveBeenCalledWith(toastProps);
        expect(eventManager.activeToastCount).toBe(2);
      });
    });

    describe('Delete event', () => {
      it('should emit Delete event and call registered callbacks', () => {
        const callback = vi.fn();
        const toastId = 'test-id';

        eventManager.activeToastCount = 2;
        eventManager.on(ToastEvent.Delete, callback);
        eventManager.emit(ToastEvent.Delete, toastId);

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledWith(toastId);
        expect(eventManager.activeToastCount).toBe(1);
      });

      it('should not decrease count below zero', () => {
        const callback = vi.fn();
        const toastId = 'test-id';

        eventManager.activeToastCount = 0;
        eventManager.on(ToastEvent.Delete, callback);
        eventManager.emit(ToastEvent.Delete, toastId);

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledWith(toastId);
        expect(eventManager.activeToastCount).toBe(-1);
      });
    });

    describe('Update event', () => {
      it('should emit Update event and call registered callbacks', () => {
        const callback = vi.fn();
        const toastId = 'test-id';
        const newText = 'Updated message';

        eventManager.on(ToastEvent.Update, callback);
        eventManager.emit(ToastEvent.Update, toastId, newText);

        vi.runAllTimers();

        expect(callback).toHaveBeenCalledWith(toastId, newText);
        expect(eventManager.activeToastCount).toBe(0);
      });
    });

    it('should handle emitting non-existent event', () => {
      const toastProps: ToastProps = {
        toastId: 'test-id',
        text: 'Test message',
      };

      expect(() => {
        eventManager.emit(ToastEvent.Add, toastProps);
      }).not.toThrow();
    });

    it('should store timers in emitQueue', () => {
      const callback = vi.fn();
      const toastProps: ToastProps = {
        toastId: 'test-id',
        text: 'Test message',
      };

      eventManager.on(ToastEvent.Add, callback);
      eventManager.emit(ToastEvent.Add, toastProps);

      expect(eventManager.emitQueue.has(ToastEvent.Add)).toBe(true);
      expect(eventManager.emitQueue.get(ToastEvent.Add)).toHaveLength(1);
    });
  });

  describe('cancelEmit method', () => {
    it('should cancel pending emit timers', () => {
      const callback = vi.fn();
      const toastProps: ToastProps = {
        toastId: 'test-id',
        text: 'Test message',
      };

      eventManager.on(ToastEvent.Add, callback);
      eventManager.emit(ToastEvent.Add, toastProps);

      eventManager.cancelEmit(ToastEvent.Add);
      vi.runAllTimers();

      expect(callback).not.toHaveBeenCalled();
      expect(eventManager.emitQueue.has(ToastEvent.Add)).toBe(false);
    });

    it('should handle canceling non-existent event', () => {
      expect(() => {
        eventManager.cancelEmit(ToastEvent.Add);
      }).not.toThrow();
    });

    it('should return eventManager instance for chaining', () => {
      const result = eventManager.cancelEmit(ToastEvent.Add);

      expect(result).toBe(eventManager);
    });

    it('should cancel multiple timers for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const toastProps: ToastProps = {
        toastId: 'test-id',
        text: 'Test message',
      };

      eventManager.on(ToastEvent.Add, callback1);
      eventManager.on(ToastEvent.Add, callback2);
      eventManager.emit(ToastEvent.Add, toastProps);

      expect(eventManager.emitQueue.get(ToastEvent.Add)).toHaveLength(2);

      eventManager.cancelEmit(ToastEvent.Add);
      vi.runAllTimers();

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(eventManager.emitQueue.has(ToastEvent.Add)).toBe(false);
    });
  });

  describe('activeToastCount management', () => {
    it('should track active toast count correctly', () => {
      const addCallback = vi.fn();
      const deleteCallback = vi.fn();

      eventManager.on(ToastEvent.Add, addCallback);
      eventManager.on(ToastEvent.Delete, deleteCallback);

      eventManager.emit(ToastEvent.Add, { toastId: '1', text: 'Test 1' });
      eventManager.emit(ToastEvent.Add, { toastId: '2', text: 'Test 2' });

      vi.runAllTimers();
      expect(eventManager.activeToastCount).toBe(2);

      eventManager.emit(ToastEvent.Delete, '1');

      vi.runAllTimers();
      expect(eventManager.activeToastCount).toBe(1);
    });
  });

  describe('integration tests', () => {
    it('should handle complex event flow', () => {
      const addCallback = vi.fn();
      const deleteCallback = vi.fn();
      const updateCallback = vi.fn();

      eventManager.on(ToastEvent.Add, addCallback);
      eventManager.on(ToastEvent.Delete, deleteCallback);
      eventManager.on(ToastEvent.Update, updateCallback);

      eventManager.emit(ToastEvent.Add, { toastId: '1', text: 'Test' });
      vi.runAllTimers();

      eventManager.emit(ToastEvent.Update, '1', 'Updated text');
      vi.runAllTimers();

      eventManager.emit(ToastEvent.Delete, '1');
      vi.runAllTimers();

      expect(addCallback).toHaveBeenCalledTimes(1);
      expect(updateCallback).toHaveBeenCalledTimes(1);
      expect(deleteCallback).toHaveBeenCalledTimes(1);
      expect(eventManager.activeToastCount).toBe(0);
    });
  });
});
