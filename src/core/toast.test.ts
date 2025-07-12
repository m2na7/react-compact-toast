import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from './toast';
import { eventManager } from './event-manager';
import { ToastEvent } from '../types';

vi.mock('./event-manager', () => ({
  eventManager: {
    emit: vi.fn(),
  },
}));

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-123'),
  },
});

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a toast with string input', () => {
    const result = toast('Hello World');

    expect(eventManager.emit).toHaveBeenCalledWith(ToastEvent.Add, {
      text: 'Hello World',
      toastId: 'test-uuid-123',
    });
    expect(result).toBe('test-uuid-123');
  });

  it('should create a toast with object input', () => {
    const options = {
      text: 'Test message',
      icon: '🚀',
      position: 'topRight' as const,
      autoClose: 5000,
    };

    const result = toast(options);

    expect(eventManager.emit).toHaveBeenCalledWith(ToastEvent.Add, {
      ...options,
      toastId: 'test-uuid-123',
    });
    expect(result).toBe('test-uuid-123');
  });

  it('should create a toast with custom styling', () => {
    const options = {
      text: 'Styled toast',
      highlightText: 'Styled',
      highlightColor: '#ff6b6b',
      className: 'custom-class',
    };

    toast(options);

    expect(eventManager.emit).toHaveBeenCalledWith(ToastEvent.Add, {
      ...options,
      toastId: 'test-uuid-123',
    });
  });

  it('should generate unique IDs for multiple toasts', () => {
    const mockUUID = vi
      .fn()
      .mockReturnValueOnce('uuid-1')
      .mockReturnValueOnce('uuid-2');

    global.crypto.randomUUID = mockUUID;

    const id1 = toast('First toast');
    const id2 = toast('Second toast');

    expect(id1).toBe('uuid-1');
    expect(id2).toBe('uuid-2');
    expect(mockUUID).toHaveBeenCalledTimes(2);
  });
});
