import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToast } from './use-toast';
import { eventManager } from '../core/event-manager';
import { ToastEvent } from '../types';

vi.mock('../core/event-manager', () => ({
  eventManager: {
    emit: vi.fn(),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with isExiting false', () => {
    const { result } = renderHook(() => useToast('test-id', 3000, true));

    expect(result.current.isExiting).toBe(false);
    expect(typeof result.current.handleAnimationEnd).toBe('function');
    expect(typeof result.current.handleClick).toBe('function');
  });

  it('should set isExiting to true after autoClose timeout', () => {
    const { result } = renderHook(() => useToast('test-id', 1000, true));

    expect(result.current.isExiting).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isExiting).toBe(true);
  });

  it('should not set timeout when autoClose is false', () => {
    const { result } = renderHook(() => useToast('test-id', false, true));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isExiting).toBe(false);
  });

  it('should set isExiting to true when clicked and closeOnClick is true', () => {
    const { result } = renderHook(() => useToast('test-id', false, true));

    act(() => {
      result.current.handleClick();
    });

    expect(result.current.isExiting).toBe(true);
  });

  it('should not set isExiting when clicked and closeOnClick is false', () => {
    const { result } = renderHook(() => useToast('test-id', false, false));

    act(() => {
      result.current.handleClick();
    });

    expect(result.current.isExiting).toBe(false);
  });

  it('should emit delete event when animation ends and isExiting is true', () => {
    const { result } = renderHook(() => useToast('test-id', 1000, true));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.handleAnimationEnd();
    });

    expect(eventManager.emit).toHaveBeenCalledWith(
      ToastEvent.Delete,
      'test-id'
    );
  });

  it('should not emit delete event when animation ends and isExiting is false', () => {
    const { result } = renderHook(() => useToast('test-id', false, true));

    act(() => {
      result.current.handleAnimationEnd();
    });

    expect(eventManager.emit).not.toHaveBeenCalled();
  });

  it('should cleanup timeout on unmount', () => {
    const { unmount } = renderHook(() => useToast('test-id', 1000, true));

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
