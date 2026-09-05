import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toastStore } from '../core/store';
import { toast } from '../core/toast';
import type { ToastProps } from '../types';
import { Toast } from './toast';

const renderToast = (props: Partial<ToastProps> = {}) => {
  const id = toast(props.text ?? 'Message', props);
  const record = toastStore.get(id)!;
  return { id, ...render(<Toast {...record} />) };
};

const root = () => document.querySelector('[data-rct-toast]')!;

describe('<Toast>', () => {
  beforeEach(() => {
    toastStore.reset();
  });

  describe('content', () => {
    it('renders the text', () => {
      renderToast({ text: 'Saved' });
      expect(screen.getByText('Saved')).toBeInTheDocument();
    });

    it('renders a React node as text', () => {
      renderToast({ text: <b>Bold</b> });
      expect(screen.getByText('Bold').tagName).toBe('B');
    });

    it('renders the highlight prefix with its colour', () => {
      renderToast({
        text: ' was updated',
        highlightText: 'Project',
        highlightColor: 'rgb(255, 0, 0)',
      });

      const highlight = screen.getByText('Project');
      expect(highlight).toHaveAttribute('data-rct-highlight');
      expect(highlight).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });

    it('omits the highlight element when there is none', () => {
      renderToast({ text: 'plain' });
      expect(document.querySelector('[data-rct-highlight]')).toBeNull();
    });
  });

  describe('icons', () => {
    it('marks a string icon as decorative', () => {
      renderToast({ icon: '🎉' });
      const icon = document.querySelector('[data-rct-icon]')!;
      expect(icon).toHaveTextContent('🎉');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders a custom node without hiding it from assistive tech', () => {
      renderToast({ icon: <span aria-label="star">*</span> });
      expect(document.querySelector('[data-rct-icon]')).not.toHaveAttribute(
        'aria-hidden'
      );
    });

    it('renders a built-in icon for a semantic type', () => {
      renderToast({ type: 'success' });
      expect(document.querySelector('[data-rct-icon] svg')).toBeInTheDocument();
      expect(root()).toHaveAttribute('data-rct-type', 'success');
    });

    it('renders a spinner for a loading toast', () => {
      renderToast({ type: 'loading' });
      expect(document.querySelector('[data-rct-spinner]')).toBeInTheDocument();
    });

    it('lets an explicit icon win over the type icon', () => {
      renderToast({ type: 'success', icon: '✅' });
      expect(document.querySelector('[data-rct-icon]')).toHaveTextContent('✅');
      expect(document.querySelector('svg')).toBeNull();
    });

    it('hides the icon when it is null', () => {
      renderToast({ type: 'success', icon: null });
      expect(document.querySelector('[data-rct-icon]')).toBeNull();
    });

    it('ignores the never-implemented "default" icon from 0.2.x', () => {
      renderToast({ icon: 'default' });
      expect(screen.queryByText('default')).toBeNull();
    });
  });

  describe('styling hooks', () => {
    it('applies the built-in look by default', () => {
      renderToast();
      expect(root()).toHaveAttribute('data-rct-styled');
      expect(root()).toHaveAttribute('data-rct-base');
    });

    it('keeps the layout but drops the look when className is given', () => {
      renderToast({ className: 'my-toast' });
      expect(root()).toHaveClass('my-toast');
      expect(root()).not.toHaveAttribute('data-rct-styled');
      expect(root()).toHaveAttribute('data-rct-base');
    });

    it('drops layout and look when unstyled', () => {
      renderToast({ unstyled: true });
      expect(root()).not.toHaveAttribute('data-rct-base');
      expect(root()).toHaveAttribute('data-rct-unstyled');
    });

    it('applies inline styles and the position attribute', () => {
      renderToast({ style: { opacity: 0.5 }, position: 'topRight' });
      expect(root()).toHaveStyle({ opacity: '0.5' });
      expect(root()).toHaveAttribute('data-rct-position', 'topRight');
    });
  });

  describe('buttons', () => {
    it('runs the action and dismisses without triggering the root click', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRootClick = vi.fn();
      const { id } = renderToast({
        autoClose: false,
        action: { label: 'Undo', onClick },
        onClick: onRootClick,
      });

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onRootClick).not.toHaveBeenCalled();
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('keeps the toast when the action prevents the default', async () => {
      const user = userEvent.setup();
      const { id } = renderToast({
        autoClose: false,
        action: {
          label: 'Undo',
          onClick: (event) => event.preventDefault(),
        },
      });

      await user.click(screen.getByRole('button', { name: 'Undo' }));

      expect(toastStore.get(id)?.dismissed).toBe(false);
    });

    it('renders a labelled close button on request', async () => {
      const user = userEvent.setup();
      const { id } = renderToast({ closeButton: true, autoClose: false });

      const button = screen.getByRole('button', { name: 'Close' });
      await user.click(button);

      expect(toastStore.get(id)).toBeUndefined();
    });

    it('uses a custom close-button label', () => {
      renderToast({ closeButton: true, closeButtonLabel: '닫기' });
      expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    });

    it('adds a close button when the toast is otherwise undismissable', () => {
      renderToast({ autoClose: false, closeOnClick: false });
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('dismisses on click', async () => {
      const user = userEvent.setup();
      const { id } = renderToast({ autoClose: false });

      await user.click(root());

      expect(toastStore.get(id)).toBeUndefined();
    });

    it('is reachable and operable from the keyboard', async () => {
      const user = userEvent.setup();
      const { id } = renderToast({ autoClose: false });

      await user.tab();
      expect(root()).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(toastStore.get(id)).toBeUndefined();
    });

    it('exposes a non-announcing status role', () => {
      renderToast();
      expect(root()).toHaveAttribute('role', 'status');
      expect(root()).toHaveAttribute('aria-live', 'off');
    });

    it('advertises the Escape shortcut while it can be dismissed', () => {
      renderToast();
      expect(root()).toHaveAttribute('aria-keyshortcuts', 'Escape');
    });

    it('advertises no shortcut when nothing can dismiss the toast', () => {
      renderToast({ autoClose: 3000, closeOnClick: false, closeButton: false });
      expect(root()).not.toHaveAttribute('aria-keyshortcuts');
    });
  });

  it('accepts the deprecated toastId prop', () => {
    const id = toast('Legacy');

    render(<Toast toastId={id} text="Legacy" autoClose={false} />);
    expect(root()).toHaveAttribute('data-rct-id', id);
  });
});
