import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToastContainer } from './components/toast-container';
import { toast } from './core/toast';

const roots: { unmount: () => void }[] = [];

afterEach(() => {
  roots.splice(0).forEach((root) => act(() => root.unmount()));
});

describe('hydration', () => {
  it('matches the server markup without warnings', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const container = document.createElement('div');
    container.innerHTML = renderToString(<ToastContainer />);
    document.body.append(container);

    act(() => {
      roots.push(hydrateRoot(container, <ToastContainer />));
    });

    expect(error).not.toHaveBeenCalled();
    expect(container.querySelectorAll('[data-rct-announcer]')).toHaveLength(2);
  });

  it('shows toasts created after hydration', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<ToastContainer />);
    document.body.append(container);
    act(() => {
      roots.push(hydrateRoot(container, <ToastContainer />));
    });

    act(() => {
      toast('after hydration');
    });

    expect(container.querySelector('[data-rct-toast]')).toHaveTextContent(
      'after hydration'
    );
  });
});
