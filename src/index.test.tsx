import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import * as api from './index';

describe('public entry point', () => {
  beforeEach(() => {
    api.toast.remove();
  });

  it('exports exactly the documented surface', () => {
    expect(Object.keys(api).sort()).toEqual([
      'Toast',
      'ToastContainer',
      'ToastEvent',
      'eventManager',
      'injectStyles',
      'toast',
      'useToast',
      'useToastContainer',
    ]);
  });

  it('keeps the 0.2.x event hub, and makes ToastEvent usable as a value', () => {
    expect(typeof api.eventManager.on).toBe('function');
    expect(typeof api.eventManager.off).toBe('function');
    expect(typeof api.eventManager.emit).toBe('function');
    expect(typeof api.eventManager.cancelEmit).toBe('function');
    // 0.2.3 exported this as a type-only `const enum`, so it could not be
    // referenced at runtime and the hub was uncallable from TypeScript.
    expect(api.ToastEvent.Add).toBe(0);
  });

  it('carries the toast helpers', () => {
    expect(
      [
        'success',
        'error',
        'info',
        'warning',
        'loading',
        'dismiss',
        'remove',
        'update',
        'promise',
        'isActive',
      ].every(
        (key) =>
          typeof (api.toast as unknown as Record<string, unknown>)[key] ===
          'function'
      )
    ).toBe(true);
  });

  it('keeps the deprecated position-group getter working', () => {
    let groups: ReturnType<
      api.UseToastContainerResult['getToastPositionGroupToRender']
    > = new Map();

    function Probe() {
      const container = api.useToastContainer();

      groups = container.getToastPositionGroupToRender();
      return null;
    }

    render(<Probe />);
    act(() => {
      api.toast('a', {
        position: 'topLeft',
        containerStyle: { zIndex: 3 },
      });
    });

    const group = groups.get('topLeft');
    expect(group?.toasts[0]?.toastId).toBe(group?.toasts[0]?.id);
    expect(group?.containerStyle).toEqual({ zIndex: 3 });
  });
});
