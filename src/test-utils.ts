import { act } from '@testing-library/react';
import { vi } from 'vitest';

/**
 * Deliver the notifications the event hub scheduled for the next tick.
 *
 * `eventManager.emit` applies the change at once but announces it a tick
 * later, so that a `toast()` raised during a render never updates a
 * component mid-render. Tests have to let that tick happen.
 */
export function flushToasts(): void {
  act(() => {
    if (vi.isFakeTimers()) vi.advanceTimersByTime(0);
  });
}
