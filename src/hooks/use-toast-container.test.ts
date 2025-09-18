import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToastContainer } from './use-toast-container';
import { eventManager } from '../core/event-manager';
import { ToastEvent, ToastProps } from '../types';

vi.mock('../core/event-manager', () => ({
  eventManager: {
    on: vi.fn(),
    off: vi.fn(),
    cancelEmit: vi.fn(),
  },
}));

vi.mock('../constants', () => ({
  TOAST_DEFAULT_POSITION: 'bottomCenter',
}));

describe('useToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty toast list', () => {
      const { result } = renderHook(() => useToastContainer());

      const positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.size).toBe(0);
    });

    it('should register event listeners on mount', () => {
      renderHook(() => useToastContainer());

      expect(eventManager.on).toHaveBeenCalledTimes(3);
      expect(eventManager.on).toHaveBeenCalledWith(
        ToastEvent.Add,
        expect.any(Function)
      );
      expect(eventManager.on).toHaveBeenCalledWith(
        ToastEvent.Delete,
        expect.any(Function)
      );
      expect(eventManager.on).toHaveBeenCalledWith(
        ToastEvent.Update,
        expect.any(Function)
      );
    });

    it('should unregister event listeners and cancel emits on unmount', () => {
      const { unmount } = renderHook(() => useToastContainer());

      unmount();

      expect(eventManager.off).toHaveBeenCalledTimes(3);
      expect(eventManager.off).toHaveBeenCalledWith(
        ToastEvent.Add,
        expect.any(Function)
      );
      expect(eventManager.off).toHaveBeenCalledWith(
        ToastEvent.Delete,
        expect.any(Function)
      );
      expect(eventManager.off).toHaveBeenCalledWith(
        ToastEvent.Update,
        expect.any(Function)
      );

      expect(eventManager.cancelEmit).toHaveBeenCalledTimes(3);
      expect(eventManager.cancelEmit).toHaveBeenCalledWith(ToastEvent.Add);
      expect(eventManager.cancelEmit).toHaveBeenCalledWith(ToastEvent.Delete);
      expect(eventManager.cancelEmit).toHaveBeenCalledWith(ToastEvent.Update);
    });
  });

  describe('addToast functionality', () => {
    it('should add toast to the list', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const toastProps: ToastProps = {
        toastId: 'test-1',
        text: 'Test message',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toastProps);
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(1);
      expect(positionGroups.get('topRight')!.toasts[0]).toEqual(toastProps);
    });

    it('should add multiple toasts to the list', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const toast1: ToastProps = {
        toastId: 'test-1',
        text: 'Test message 1',
        position: 'topRight',
      };

      const toast2: ToastProps = {
        toastId: 'test-2',
        text: 'Test message 2',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toast1);
        addToastCallback(toast2);
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(2);
    });
  });

  describe('deleteToast functionality', () => {
    it('should remove toast from the list', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];
      const deleteToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Delete
      )[1];

      const toastProps: ToastProps = {
        toastId: 'test-1',
        text: 'Test message',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toastProps);
      });

      let positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(1);

      act(() => {
        deleteToastCallback('test-1');
      });

      positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.has('topRight')).toBe(false);
    });

    it('should not affect list when deleting non-existent toast', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];
      const deleteToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Delete
      )[1];

      const toastProps: ToastProps = {
        toastId: 'test-1',
        text: 'Test message',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toastProps);
      });

      let positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(1);

      act(() => {
        deleteToastCallback('non-existent-id');
      });

      positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(1);
    });
  });

  describe('updateToast functionality', () => {
    it('should update toast text', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];
      const updateToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Update
      )[1];

      const toastProps: ToastProps = {
        toastId: 'test-1',
        text: 'Original message',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toastProps);
      });

      act(() => {
        updateToastCallback('test-1', 'Updated message');
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      const updatedToast = positionGroups.get('topRight')!.toasts[0];
      expect(updatedToast.text).toBe('Updated message');
      expect(updatedToast.toastId).toBe('test-1');
      expect(updatedToast.position).toBe('topRight');
    });

    it('should not affect list when updating non-existent toast', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];
      const updateToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Update
      )[1];

      const toastProps: ToastProps = {
        toastId: 'test-1',
        text: 'Original message',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toastProps);
      });

      act(() => {
        updateToastCallback('non-existent-id', 'Updated message');
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      const toast = positionGroups.get('topRight')!.toasts[0];
      expect(toast.text).toBe('Original message');
    });
  });

  describe('getToastPositionGroupToRender functionality', () => {
    it('should group toasts by position', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const toasts: ToastProps[] = [
        { toastId: '1', text: 'Top Right 1', position: 'topRight' },
        { toastId: '2', text: 'Top Right 2', position: 'topRight' },
        { toastId: '3', text: 'Bottom Left 1', position: 'bottomLeft' },
        { toastId: '4', text: 'Top Center 1', position: 'topCenter' },
      ];

      act(() => {
        toasts.forEach((toast) => addToastCallback(toast));
      });

      const positionGroups = result.current.getToastPositionGroupToRender();

      expect(positionGroups.size).toBe(3);
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(2);
      expect(positionGroups.get('bottomLeft')?.toasts).toHaveLength(1);
      expect(positionGroups.get('topCenter')?.toasts).toHaveLength(1);
    });

    it('should include containerStyle from toast props', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const toastWithContainerStyle: ToastProps = {
        toastId: '1',
        text: 'Toast with container style',
        position: 'topRight',
        containerStyle: { right: '100px', top: '50px' },
      };

      act(() => {
        addToastCallback(toastWithContainerStyle);
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      const topRightGroup = positionGroups.get('topRight');

      expect(topRightGroup?.containerStyle).toEqual({
        right: '100px',
        top: '50px',
      });
      expect(topRightGroup?.toasts).toHaveLength(1);
    });

    it('should merge containerStyle when multiple toasts have same position', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const firstToast: ToastProps = {
        toastId: '1',
        text: 'First toast',
        position: 'topRight',
        containerStyle: { right: '100px', top: '50px' },
      };

      const secondToast: ToastProps = {
        toastId: '2',
        text: 'Second toast',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(firstToast);
        addToastCallback(secondToast);
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      const topRightGroup = positionGroups.get('topRight');

      expect(topRightGroup?.containerStyle).toEqual({
        right: '100px',
        top: '50px',
      });
      expect(topRightGroup?.toasts).toHaveLength(2);
    });

    it('should handle containerStyle with different position groups', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const topRightToast: ToastProps = {
        toastId: '1',
        text: 'Top right toast',
        position: 'topRight',
        containerStyle: { right: '100px', top: '50px' },
      };

      const bottomLeftToast: ToastProps = {
        toastId: '2',
        text: 'Bottom left toast',
        position: 'bottomLeft',
        containerStyle: { left: '80px', bottom: '60px' },
      };

      act(() => {
        addToastCallback(topRightToast);
        addToastCallback(bottomLeftToast);
      });

      const positionGroups = result.current.getToastPositionGroupToRender();

      const topRightGroup = positionGroups.get('topRight');
      const bottomLeftGroup = positionGroups.get('bottomLeft');

      expect(topRightGroup?.containerStyle).toEqual({
        right: '100px',
        top: '50px',
      });
      expect(bottomLeftGroup?.containerStyle).toEqual({
        left: '80px',
        bottom: '60px',
      });
      expect(topRightGroup?.toasts).toHaveLength(1);
      expect(bottomLeftGroup?.toasts).toHaveLength(1);
    });

    it('should use default position when position is not specified', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const toastWithoutPosition: ToastProps = {
        toastId: 'test-1',
        text: 'Test message',
      };

      act(() => {
        addToastCallback(toastWithoutPosition);
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('bottomCenter')?.toasts).toHaveLength(1);
    });

    it('should return empty map when no toasts exist', () => {
      const { result } = renderHook(() => useToastContainer());

      const positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.size).toBe(0);
    });

    it('should preserve toast order within position groups', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];

      const toasts: ToastProps[] = [
        { toastId: '1', text: 'First', position: 'topRight' },
        { toastId: '2', text: 'Second', position: 'topRight' },
        { toastId: '3', text: 'Third', position: 'topRight' },
      ];

      act(() => {
        toasts.forEach((toast) => addToastCallback(toast));
      });

      const positionGroups = result.current.getToastPositionGroupToRender();
      const topRightToasts = positionGroups.get('topRight')!.toasts;

      expect(topRightToasts[0].text).toBe('First');
      expect(topRightToasts[1].text).toBe('Second');
      expect(topRightToasts[2].text).toBe('Third');
    });
  });

  describe('integration tests', () => {
    it('should handle complete toast lifecycle', () => {
      const { result } = renderHook(() => useToastContainer());

      const addToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Add
      )[1];
      const updateToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Update
      )[1];
      const deleteToastCallback = (eventManager.on as any).mock.calls.find(
        (call: any) => call[0] === ToastEvent.Delete
      )[1];

      const toastProps: ToastProps = {
        toastId: 'lifecycle-test',
        text: 'Original message',
        position: 'topRight',
      };

      act(() => {
        addToastCallback(toastProps);
      });

      let positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')?.toasts).toHaveLength(1);
      expect(positionGroups.get('topRight')!.toasts[0].text).toBe(
        'Original message'
      );

      act(() => {
        updateToastCallback('lifecycle-test', 'Updated message');
      });

      positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.get('topRight')!.toasts[0].text).toBe(
        'Updated message'
      );

      act(() => {
        deleteToastCallback('lifecycle-test');
      });

      positionGroups = result.current.getToastPositionGroupToRender();
      expect(positionGroups.has('topRight')).toBe(false);
    });
  });
});
