import { describe, it, expect } from 'vitest';
import { getToastOffsetStyle } from './get-toast-offset-style';
import { ToastProps } from '../types';

describe('getToastOffsetStyle', () => {
  const createMockToast = (
    overrides: Partial<ToastProps> = {}
  ): ToastProps => ({
    toastId: 'test-id',
    text: 'Test message',
    ...overrides,
  });

  it('should return empty object when toasts array is empty', () => {
    const result = getToastOffsetStyle([], 'topCenter');
    expect(result).toEqual({});
  });

  it('should return empty object when first toast has no offset', () => {
    const toasts = [createMockToast()];
    const result = getToastOffsetStyle(toasts, 'topCenter');
    expect(result).toEqual({});
  });

  it('should return empty object when first toast has undefined offset', () => {
    const toasts = [createMockToast({ offset: undefined })];
    const result = getToastOffsetStyle(toasts, 'topCenter');
    expect(result).toEqual({});
  });

  describe('top positions', () => {
    it('should return top style for topCenter position with number offset', () => {
      const toasts = [createMockToast({ offset: 50 })];
      const result = getToastOffsetStyle(toasts, 'topCenter');
      expect(result).toEqual({ top: '50px' });
    });

    it('should return top style for topLeft position with string offset', () => {
      const toasts = [createMockToast({ offset: '2rem' })];
      const result = getToastOffsetStyle(toasts, 'topLeft');
      expect(result).toEqual({ top: '2rem' });
    });

    it('should return top style for topRight position', () => {
      const toasts = [createMockToast({ offset: 100 })];
      const result = getToastOffsetStyle(toasts, 'topRight');
      expect(result).toEqual({ top: '100px' });
    });
  });

  describe('bottom positions', () => {
    it('should return bottom style for bottomCenter position with number offset', () => {
      const toasts = [createMockToast({ offset: 75 })];
      const result = getToastOffsetStyle(toasts, 'bottomCenter');
      expect(result).toEqual({ bottom: '75px' });
    });

    it('should return bottom style for bottomLeft position with string offset', () => {
      const toasts = [createMockToast({ offset: '3rem' })];
      const result = getToastOffsetStyle(toasts, 'bottomLeft');
      expect(result).toEqual({ bottom: '3rem' });
    });

    it('should return bottom style for bottomRight position', () => {
      const toasts = [createMockToast({ offset: 25 })];
      const result = getToastOffsetStyle(toasts, 'bottomRight');
      expect(result).toEqual({ bottom: '25px' });
    });
  });

  describe('edge cases', () => {
    it('should handle zero offset', () => {
      const toasts = [createMockToast({ offset: 0 })];
      const result = getToastOffsetStyle(toasts, 'topCenter');
      expect(result).toEqual({ top: '0px' });
    });

    it('should handle negative offset', () => {
      const toasts = [createMockToast({ offset: -10 })];
      const result = getToastOffsetStyle(toasts, 'bottomCenter');
      expect(result).toEqual({ bottom: '-10px' });
    });

    it('should handle various CSS units', () => {
      const units = ['px', 'rem', 'em', 'vh', 'vw', '%'];

      units.forEach((unit) => {
        const toasts = [createMockToast({ offset: `10${unit}` })];
        const result = getToastOffsetStyle(toasts, 'topCenter');
        expect(result).toEqual({ top: `10${unit}` });
      });
    });

    it('should handle calc() values', () => {
      const toasts = [createMockToast({ offset: 'calc(100vh - 50px)' })];
      const result = getToastOffsetStyle(toasts, 'bottomCenter');
      expect(result).toEqual({ bottom: 'calc(100vh - 50px)' });
    });

    it('should use first toast offset when multiple toasts exist', () => {
      const toasts = [
        createMockToast({ offset: 50 }),
        createMockToast({ offset: 100 }),
        createMockToast({ offset: 200 }),
      ];
      const result = getToastOffsetStyle(toasts, 'topCenter');
      expect(result).toEqual({ top: '50px' });
    });

    it('should return empty object for unknown position', () => {
      const toasts = [createMockToast({ offset: 50 })];
      const result = getToastOffsetStyle(toasts, 'unknownPosition');
      expect(result).toEqual({});
    });

    it('should handle position that does not start with top or bottom', () => {
      const toasts = [createMockToast({ offset: 50 })];
      const result = getToastOffsetStyle(toasts, 'centerMiddle');
      expect(result).toEqual({});
    });
  });

  it('should accept string offset types', () => {
    const toasts = [createMockToast({ offset: '1.5rem' })];
    const result = getToastOffsetStyle(toasts, 'bottomCenter');
    expect(result).toEqual({ bottom: '1.5rem' });
  });
});
