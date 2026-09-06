import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { STYLE_ATTRIBUTE } from '../core/inject-styles';
import { toastStore } from '../core/store';
import { toast } from '../core/toast';
import type { ToastContainerProps } from '../types';
import { flushToasts } from '../test-utils';
import { ToastContainer } from './toast-container';

const toasts = () => Array.from(document.querySelectorAll('[data-rct-toast]'));
const groups = () =>
  Array.from(document.querySelectorAll('[data-rct-container]'));
const group = (position: string) =>
  document.querySelector(
    `[data-rct-container][data-rct-position="${position}"]`
  ) as HTMLElement | null;
/** Text of the rendered toasts, so the hidden live regions never match. */
const toastTexts = () => toasts().map((element) => element.textContent);
const injected = () => document.querySelectorAll(`style[${STYLE_ATTRIBUTE}]`);

const show = (...args: Parameters<typeof toast>) => {
  act(() => {
    toast(...args);
  });
  flushToasts();
};

const setup = (props: ToastContainerProps = {}) =>
  render(<ToastContainer {...props} />);

describe('<ToastContainer>', () => {
  beforeEach(() => {
    toastStore.reset();
  });

  describe('grouping and ordering', () => {
    it('renders nothing but the announcers while empty', () => {
      setup();
      expect(groups()).toHaveLength(0);
      expect(screen.getAllByRole('log', { hidden: true })).toHaveLength(2);
    });

    it('groups toasts by position', () => {
      setup();
      show('a', { position: 'topLeft' });
      show('b', { position: 'topLeft' });
      show('c', { position: 'bottomRight' });

      expect(groups()).toHaveLength(2);
      expect(within(group('topLeft')!).getAllByText(/^(a|b)$/)).toHaveLength(2);
      expect(within(group('bottomRight')!).getByText('c')).toBeInTheDocument();
    });

    it('uses the container position as the default', () => {
      setup({ position: 'topCenter' });
      show('a');
      expect(group('topCenter')).not.toBeNull();
    });

    it('puts the newest toast first when asked', () => {
      setup({ newestOnTop: true });
      show('first');
      show('second');

      expect(toasts()[0]).toHaveTextContent('second');
    });

    it('appends by default', () => {
      setup();
      show('first');
      show('second');

      expect(toasts()[0]).toHaveTextContent('first');
    });

    it('shows toasts created before it mounted', () => {
      act(() => {
        toast('early');
      });
      setup();
      expect(toastTexts()).toEqual(['early']);
    });
  });

  describe('limit', () => {
    it('keeps extra toasts queued until a slot frees up', async () => {
      setup({ limit: 2 });
      show('a', { autoClose: false });
      show('b', { autoClose: false });
      show('c', { autoClose: false });

      expect(toastTexts()).toEqual(['a', 'b']);

      await act(async () => {
        toast.remove(toastStore.getSnapshot()[0]!.id);
      });

      expect(toastTexts()).toEqual(['b', 'c']);
    });

    it('restores the previous limit when unmounted', () => {
      const { unmount } = setup({ limit: 2 });
      expect(toastStore.getLimit()).toBe(2);
      unmount();
      expect(toastStore.getLimit()).toBe(6);
    });
  });

  describe('defaults and overrides', () => {
    it('applies toastOptions to every toast', () => {
      setup({ toastOptions: { closeButton: true, autoClose: false } });
      show('a');
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('applies a toastOptions callback to a toast that never renders', () => {
      const onClose = vi.fn();
      setup({ limit: 1, toastOptions: { onClose } });
      show('visible', { autoClose: false });
      show('queued', { autoClose: false });

      act(() => {
        toast.dismiss(toastStore.getQueue()[0]!.id);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('lets a per-toast option win over the container default', () => {
      setup({ toastOptions: { position: 'topLeft' } });
      show('a', { position: 'bottomRight' });
      expect(group('bottomRight')).not.toBeNull();
      expect(group('topLeft')).toBeNull();
    });

    it('uses a position given in toastOptions as the default', () => {
      setup({
        position: 'bottomCenter',
        toastOptions: { position: 'topLeft' },
      });
      show('a');
      expect(group('topLeft')).not.toBeNull();
    });
  });

  describe('offset', () => {
    it('maps a number to both axes', () => {
      setup({ offset: 40 });
      show('a');
      expect(group('bottomCenter')).toHaveStyle({
        '--rct-offset-x': '40px',
        '--rct-offset-y': '40px',
      });
    });

    it('accepts a CSS length and per-axis values', () => {
      setup({ offset: { y: '2rem' } });
      show('a');
      const element = group('bottomCenter') as HTMLElement;
      expect(element.style.getPropertyValue('--rct-offset-y')).toBe('2rem');
      expect(element.style.getPropertyValue('--rct-offset-x')).toBe('');
    });

    it('honours the deprecated per-toast offset of the first toast', () => {
      setup();
      show('a', { offset: 100 });
      show('b', { offset: 5 });
      const element = group('bottomCenter') as HTMLElement;
      expect(element.style.getPropertyValue('--rct-offset-y')).toBe('100px');
    });

    it('takes the deprecated offset from the first toast that sets one', () => {
      setup();
      show('a');
      show('b', { offset: 60 });
      const element = group('bottomCenter') as HTMLElement;
      expect(element.style.getPropertyValue('--rct-offset-y')).toBe('60px');
    });

    it('keeps the deprecated offset stable under newestOnTop', () => {
      setup({ newestOnTop: true });
      show('a', { offset: 10 });
      show('b', { offset: 100 });
      const element = group('bottomCenter') as HTMLElement;
      expect(element.style.getPropertyValue('--rct-offset-y')).toBe('10px');
    });

    it('lets the container prop win over the per-toast offset', () => {
      setup({ offset: { y: 10 } });
      show('a', { offset: 100 });
      const element = group('bottomCenter') as HTMLElement;
      expect(element.style.getPropertyValue('--rct-offset-y')).toBe('10px');
    });

    it('merges container styles over the deprecated per-toast ones', () => {
      setup({ containerStyle: { zIndex: 5 }, containerClassName: 'group' });
      show('a', { containerStyle: { zIndex: 1, left: '50px' } });
      const element = group('bottomCenter') as HTMLElement;
      expect(element).toHaveClass('group');
      expect(element).toHaveStyle({ zIndex: '5', left: '50px' });
    });
  });

  describe('accessibility', () => {
    it('exposes each group as a labelled region', () => {
      setup();
      show('a');
      expect(
        screen.getByRole('region', { name: 'Notifications' })
      ).toBeInTheDocument();
    });

    it('suffixes the label when several groups are visible', () => {
      setup();
      show('a', { position: 'topLeft' });
      show('b', { position: 'bottomRight' });

      expect(
        screen.getByRole('region', { name: 'Notifications (topLeft)' })
      ).toBeInTheDocument();
    });

    it('accepts a custom label', () => {
      setup({ label: '알림' });
      show('a');
      expect(screen.getByRole('region', { name: '알림' })).toBeInTheDocument();
    });

    it('focuses the newest toast on the hotkey', async () => {
      const user = userEvent.setup();
      setup();
      show('a', { autoClose: false });
      show('b', { autoClose: false });

      await user.keyboard('{Alt>}t{/Alt}');

      expect(toasts()[1]).toHaveFocus();
    });

    it('ignores a wider combination than the hotkey', async () => {
      const user = userEvent.setup();
      setup();
      show('a', { autoClose: false });

      await user.keyboard('{Alt>}{Shift>}t{/Shift}{/Alt}');

      expect(toasts()[0]).not.toHaveFocus();
    });

    it('leaves the hotkey alone while the user is typing', async () => {
      const user = userEvent.setup();
      const input = document.createElement('input');
      document.body.append(input);
      setup();
      show('a', { autoClose: false });

      input.focus();
      await user.keyboard('{Alt>}t{/Alt}');

      expect(input).toHaveFocus();
      input.remove();
    });

    it('ignores the hotkey when it is disabled', async () => {
      const user = userEvent.setup();
      setup({ hotkey: [] });
      show('a', { autoClose: false });

      await user.keyboard('{Alt>}t{/Alt}');

      expect(toasts()[0]).not.toHaveFocus();
    });
  });

  describe('pausing', () => {
    it('pauses every toast in a group while it is hovered', () => {
      vi.useFakeTimers();
      setup();
      show('a', { autoClose: 1000 });
      show('b', { autoClose: 1000 });

      act(() => {
        fireEvent.mouseEnter(toasts()[0]!);
      });
      act(() => vi.advanceTimersByTime(5000));
      expect(toasts()).toHaveLength(2);

      act(() => {
        fireEvent.mouseLeave(toasts()[0]!);
      });
      act(() => vi.advanceTimersByTime(1000));
      expect(toasts()).toHaveLength(0);
    });

    it('keeps a pauseOnHover:false toast running while the group is hovered', () => {
      vi.useFakeTimers();
      setup();
      show('sticky', { autoClose: 1000 });
      show('ticking', { autoClose: 1000, pauseOnHover: false });

      act(() => {
        fireEvent.mouseEnter(toasts()[0]!);
      });
      act(() => vi.advanceTimersByTime(1000));

      expect(toastTexts()).toEqual(['sticky']);
    });

    it('pauses while anything inside the group has focus', () => {
      vi.useFakeTimers();
      setup();
      show('a', { autoClose: 1000 });

      act(() => {
        fireEvent.focus(toasts()[0]!);
      });
      act(() => vi.advanceTimersByTime(5000));
      expect(toasts()).toHaveLength(1);

      act(() => {
        fireEvent.blur(toasts()[0]!, { relatedTarget: document.body });
      });
      act(() => vi.advanceTimersByTime(1000));
      expect(toasts()).toHaveLength(0);
    });

    it('pauses while the window is blurred', () => {
      vi.useFakeTimers();
      setup();
      show('a', { autoClose: 1000 });

      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      act(() => vi.advanceTimersByTime(5000));
      expect(toasts()).toHaveLength(1);

      act(() => {
        window.dispatchEvent(new Event('focus'));
      });
      act(() => vi.advanceTimersByTime(1000));
      expect(toasts()).toHaveLength(0);
    });

    it('keeps running when pauseOnFocusLoss is off', () => {
      vi.useFakeTimers();
      setup({ pauseOnFocusLoss: false });
      show('a', { autoClose: 1000 });

      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      act(() => vi.advanceTimersByTime(1000));
      expect(toasts()).toHaveLength(0);
    });
  });

  describe('style injection', () => {
    it('injects the stylesheet once, at the top of head', () => {
      setup();
      show('a');

      expect(injected()).toHaveLength(1);
      const style = injected()[0]!;
      expect(document.head.firstChild).toBe(style);
      expect(style.getAttribute(STYLE_ATTRIBUTE)).toMatch(/-test$/);
      expect(style.textContent).toContain('[data-rct-toast]');
      expect(style.textContent).toContain('@keyframes rct-');
    });

    it('does not inject a second copy for a second container', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      setup();
      setup();
      expect(injected()).toHaveLength(1);
    });

    it('adds the CSP nonce', () => {
      setup({ nonce: 'abc123' });
      expect(injected()[0]).toHaveAttribute('nonce', 'abc123');
    });

    it('injects nothing when disabled, even once toasts render', () => {
      setup({ injectStyles: false });
      show('a');
      expect(injected()).toHaveLength(0);
    });
  });

  describe('portal', () => {
    it('renders the groups into document.body while the announcers stay put', () => {
      const { container } = render(<ToastContainer portal />);
      show('a');

      expect(container.querySelector('[data-rct-container]')).toBeNull();
      expect(
        document.body.querySelector('[data-rct-container]')
      ).not.toBeNull();
      expect(container.querySelectorAll('[data-rct-announcer]')).toHaveLength(
        2
      );
    });

    it('accepts an explicit element', () => {
      const target = document.createElement('div');
      document.body.append(target);
      render(<ToastContainer portal={target} />);
      show('a');

      expect(target.querySelector('[data-rct-toast]')).not.toBeNull();
      target.remove();
    });
  });

  describe('resilience', () => {
    it('warns for every extra container that is mounted', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      setup();
      expect(warn).not.toHaveBeenCalled();

      setup();
      setup();

      expect(warn).toHaveBeenCalledTimes(2);
      expect(warn.mock.calls[0]?.[0]).toContain(
        'More than one toast container'
      );
    });

    it('renders each toast once under StrictMode and still auto-closes', () => {
      vi.useFakeTimers();
      render(
        <StrictMode>
          <ToastContainer />
        </StrictMode>
      );
      show('a', { autoClose: 1000 });

      expect(toasts()).toHaveLength(1);
      expect(screen.getAllByRole('log', { hidden: true })).toHaveLength(2);

      act(() => vi.advanceTimersByTime(1000));
      expect(toasts()).toHaveLength(0);
    });

    it('moves focus to the next toast when the focused one is removed', async () => {
      const user = userEvent.setup();
      setup();
      show('a', { autoClose: false });
      show('b', { autoClose: false });

      const [first, second] = toasts() as HTMLElement[];
      first!.focus();
      await user.click(first!);

      expect(second).toHaveFocus();
    });
  });
});
