import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toastStore } from '../core/store';
import { toast } from '../core/toast';
import type { UseToastOptions, UseToastResult } from '../types';
import { useToast } from './use-toast';

/**
 * jsdom implements no Web Animations API, so a dismissed toast is removed
 * right away. These tests install a controllable stand-in to exercise the
 * "wait for the exit animation" path that real browsers take.
 */
function stubAnimations() {
  let resolve!: () => void;
  const finished = new Promise<void>((r) => {
    resolve = r;
  });
  const animation = {
    playState: 'running',
    effect: { getComputedTiming: () => ({ iterations: 1 }) },
    finished,
  };
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.getAnimations = () => [animation];
  return { finish: resolve };
}

afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>)
    .getAnimations;
});

describe('useToast', () => {
  beforeEach(() => {
    toastStore.reset();
    vi.useFakeTimers();
  });

  /** Renders a minimal custom toast so the hook sees a real root element. */
  function setup(options?: UseToastOptions, text = 'a') {
    const id = toast(text, options);
    const box = { current: null as unknown as UseToastResult };

    function Harness() {
      const result = useToast(id, options);
      box.current = result;
      return <div {...result.toastProps}>content</div>;
    }

    const view = render(<Harness />);
    return { id, result: box, ...view };
  }

  describe('auto close', () => {
    it('dismisses after the default duration', () => {
      const { id } = setup();

      act(() => vi.advanceTimersByTime(2999));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => vi.advanceTimersByTime(1));
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('never dismisses when autoClose is false', () => {
      const { id } = setup({ autoClose: false });
      act(() => vi.advanceTimersByTime(60_000));
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('treats autoClose 0 as "stay open"', () => {
      const { id } = setup({ autoClose: 0 });
      act(() => vi.advanceTimersByTime(60_000));
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('stays open for a loading toast', () => {
      const id = toast.loading('working');
      renderHook(() => useToast(id));
      act(() => vi.advanceTimersByTime(60_000));
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('stays open when the toast carries an action', () => {
      const id = toast('a', { action: { label: 'Undo', onClick: () => {} } });
      renderHook(() => useToast(id));
      act(() => vi.advanceTimersByTime(60_000));
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });
  });

  describe('pausing', () => {
    it('keeps the remaining time across a hover', () => {
      const { id, result } = setup({ autoClose: 3000 });

      act(() => vi.advanceTimersByTime(1000));
      act(() => result.current.toastProps.onMouseEnter());
      act(() => vi.advanceTimersByTime(10_000));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => result.current.toastProps.onMouseLeave());
      act(() => vi.advanceTimersByTime(1999));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => vi.advanceTimersByTime(1));
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('does not pause on hover when pauseOnHover is false', () => {
      const { id, result } = setup({ autoClose: 1000, pauseOnHover: false });

      act(() => result.current.toastProps.onMouseEnter());
      act(() => vi.advanceTimersByTime(1000));

      expect(toastStore.get(id)).toBeUndefined();
    });

    it('pauses on focus even when pauseOnHover is false', () => {
      const { id, result } = setup({ autoClose: 1000, pauseOnHover: false });

      act(() =>
        result.current.toastProps.onFocus({
          relatedTarget: null,
          currentTarget: document.body,
        } as never)
      );
      act(() => vi.advanceTimersByTime(5000));

      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('pauses while the container reports the page as inactive', () => {
      const id = toast('a', { autoClose: 1000 });
      const { rerender } = renderHook(
        ({ paused }) => useToast(id, { paused }),
        { initialProps: { paused: true } }
      );

      act(() => vi.advanceTimersByTime(5000));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      rerender({ paused: false });
      act(() => vi.advanceTimersByTime(1000));
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('resumes when focus leaves the toast', () => {
      const { id, result } = setup({ autoClose: 1000 });
      const root = document.querySelector('[data-rct-state]') as HTMLElement;

      act(() =>
        result.current.toastProps.onFocus({
          relatedTarget: document.body,
          currentTarget: root,
        } as never)
      );
      act(() => vi.advanceTimersByTime(5000));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() =>
        result.current.toastProps.onBlur({
          relatedTarget: document.body,
          currentTarget: root,
        } as never)
      );
      act(() => vi.advanceTimersByTime(1000));
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('stays paused while focus moves inside the toast', () => {
      const { id, result } = setup({ autoClose: 1000 });
      const root = document.createElement('div');
      const child = document.createElement('button');
      root.append(child);

      act(() =>
        result.current.toastProps.onFocus({
          relatedTarget: document.body,
          currentTarget: root,
        } as never)
      );
      act(() =>
        result.current.toastProps.onBlur({
          relatedTarget: child,
          currentTarget: root,
        } as never)
      );

      act(() => vi.advanceTimersByTime(5000));
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('exposes manual pause and resume', () => {
      const { id, result } = setup({ autoClose: 1000 });

      act(() => result.current.pause());
      act(() => vi.advanceTimersByTime(5000));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => result.current.resume());
      act(() => vi.advanceTimersByTime(1000));
      expect(toastStore.get(id)).toBeUndefined();
    });
  });

  describe('restarting the timer', () => {
    it('restarts when the toast is re-issued with the same id', () => {
      const id = toast({ id: 'x', text: 'a', autoClose: 1000 });
      renderHook(() => useToast(id));

      act(() => vi.advanceTimersByTime(900));
      act(() => {
        toast({ id: 'x', text: 'again', autoClose: 1000 });
      });

      act(() => vi.advanceTimersByTime(900));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => vi.advanceTimersByTime(100));
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('restarts when autoClose is updated', () => {
      const id = toast('a', { autoClose: false });
      renderHook(() => useToast(id));

      act(() => {
        toast.update(id, { autoClose: 1000 });
      });
      act(() => vi.advanceTimersByTime(1000));

      expect(toastStore.get(id)).toBeUndefined();
    });

    it('does not start a paused toast when autoClose is updated', () => {
      const id = toast('a', { autoClose: false });
      const { result } = renderHook(() => useToast(id));
      act(() => result.current.toastProps.onMouseEnter());

      act(() => {
        toast.update(id, { autoClose: 1000 });
      });
      act(() => vi.advanceTimersByTime(5000));
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => result.current.toastProps.onMouseLeave());
      act(() => vi.advanceTimersByTime(1000));
      expect(toastStore.get(id)).toBeUndefined();
    });
  });

  describe('activation', () => {
    it('dismisses on click and calls onClick first', () => {
      const onClick = vi.fn();
      const { id, result } = setup({ onClick });

      act(() => result.current.toastProps.onClick({} as never));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('keeps the toast when closeOnClick is false', () => {
      const onClick = vi.fn();
      const { id, result } = setup({ closeOnClick: false, onClick });

      act(() => result.current.toastProps.onClick({} as never));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('ignores a click that was already handled', () => {
      const { id, result } = setup();
      act(() =>
        result.current.toastProps.onClick({ defaultPrevented: true } as never)
      );
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('activates on Enter and Space from the root only', () => {
      const { id, result } = setup();
      const preventDefault = vi.fn();
      const root = document.createElement('div');

      act(() =>
        result.current.toastProps.onKeyDown({
          key: 'Enter',
          target: document.createElement('button'),
          currentTarget: root,
          preventDefault,
        } as never)
      );
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() =>
        result.current.toastProps.onKeyDown({
          key: ' ',
          target: root,
          currentTarget: root,
          preventDefault,
        } as never)
      );
      expect(preventDefault).toHaveBeenCalled();
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('dismisses on Escape from anywhere inside the toast', () => {
      const { id, result } = setup();
      act(() =>
        result.current.toastProps.onKeyDown({
          key: 'Escape',
          target: document.createElement('button'),
          currentTarget: document.createElement('div'),
          preventDefault: () => {},
        } as never)
      );
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('ignores Escape when nothing can dismiss the toast', () => {
      const { id, result } = setup({ closeOnClick: false, closeButton: false });
      act(() =>
        result.current.toastProps.onKeyDown({
          key: 'Escape',
          target: document.body,
          currentTarget: document.body,
          preventDefault: () => {},
        } as never)
      );
      expect(toastStore.get(id)?.dismissed).toBe(false);
    });
  });

  describe('accessibility props', () => {
    it('marks the root as a non-announcing status region', () => {
      const { result } = setup();
      expect(result.current.toastProps).toMatchObject({
        role: 'status',
        'aria-live': 'off',
        'aria-atomic': true,
        tabIndex: 0,
      });
    });

    it('is not focusable when nothing responds to activation', () => {
      const { result } = setup({ closeOnClick: false });
      expect(result.current.toastProps.tabIndex).toBeUndefined();
    });

    it('reports the entering and exiting state', () => {
      stubAnimations();
      const { id, result } = setup({ autoClose: false });
      expect(result.current.toastProps['data-rct-state']).toBe('entering');

      act(() => toastStore.dismiss(id));
      expect(result.current.toastProps['data-rct-state']).toBe('exiting');
    });
  });

  describe('exiting', () => {
    it('removes the toast once its animations finish', async () => {
      const { finish } = stubAnimations();
      const { id, result } = setup({ autoClose: false });

      act(() => result.current.dismiss());
      expect(toastStore.get(id)?.dismissed).toBe(true);

      await act(async () => {
        finish();
        await Promise.resolve();
      });
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('removes immediately when there is no animation', () => {
      const { id, result } = setup({ autoClose: false });
      act(() => result.current.dismiss());
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('force-removes when an animation never finishes', () => {
      stubAnimations();
      const { id, result } = setup({ autoClose: false });

      act(() => result.current.dismiss());
      expect(toastStore.get(id)?.dismissed).toBe(true);

      act(() => vi.advanceTimersByTime(5000));
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('keeps a re-issued toast alive instead of removing it mid-exit', () => {
      stubAnimations();
      const id = toast({ id: 'x', text: 'a', autoClose: false });
      const box = { current: null as unknown as UseToastResult };
      function Harness() {
        const result = useToast(id);
        box.current = result;
        return <div {...result.toastProps} />;
      }
      render(<Harness />);

      act(() => toastStore.dismiss(id));
      act(() => {
        toast({ id: 'x', text: 'again', autoClose: false });
      });

      act(() => vi.advanceTimersByTime(10_000));
      expect(toastStore.get(id)).toMatchObject({
        text: 'again',
        dismissed: false,
      });
    });

    it('calls onClose once the toast is gone', () => {
      const onClose = vi.fn();
      const { result } = setup({ autoClose: false, onClose });

      act(() => result.current.dismiss());

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('standalone usage', () => {
    it('exits without a store record and reports onClose', () => {
      const onClose = vi.fn();
      const { result } = renderHook(() =>
        useToast('not-in-store', { autoClose: false, onClose })
      );

      act(() => result.current.dismiss());

      expect(result.current.isExiting).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('auto-closes from overrides alone', () => {
      const onClose = vi.fn();
      renderHook(() => useToast('not-in-store', { autoClose: 500, onClose }));

      act(() => vi.advanceTimersByTime(500));

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('close button', () => {
    it('is hidden by default', () => {
      const { result } = setup();
      expect(result.current.closeButton).toBe(false);
    });

    it('appears when the toast cannot be dismissed any other way', () => {
      const { result } = setup({ autoClose: false, closeOnClick: false });
      expect(result.current.closeButton).toBe(true);
    });

    it('respects an explicit value', () => {
      const { result } = setup({ closeButton: true });
      expect(result.current.closeButton).toBe(true);
    });
  });

  describe('options merging', () => {
    it('reads the stored options so updates reach custom components', () => {
      const id = toast('a', { position: 'topLeft' });
      const { result } = renderHook(() => useToast(id));
      expect(result.current.toast.position).toBe('topLeft');

      act(() => {
        toast.update(id, { position: 'bottomRight' });
      });
      expect(result.current.toast.position).toBe('bottomRight');
    });

    it('lets explicit overrides win but ignores undefined ones', () => {
      const id = toast('a', { position: 'topLeft', closeOnClick: false });
      const { result } = renderHook(() =>
        useToast(id, { position: undefined, closeOnClick: true })
      );

      expect(result.current.toast.position).toBe('topLeft');
      expect(result.current.toast.closeOnClick).toBe(true);
    });

    it('keeps the deprecated 0.2.x handlers working', () => {
      const { id, result } = setup({ autoClose: false });

      act(() => result.current.handleAnimationEnd());
      expect(toastStore.get(id)?.dismissed).toBe(false);

      act(() => result.current.handleClick());
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('supports the deprecated positional signature', () => {
      const id = toast('a');

      const { result } = renderHook(() => useToast(id, 1000, false));

      expect(result.current.toastProps.tabIndex).toBeUndefined();
      act(() => vi.advanceTimersByTime(1000));
      expect(toastStore.get(id)).toBeUndefined();
    });
  });
});
