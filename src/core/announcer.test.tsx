import { act, cleanup, render, screen } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastContainer } from '../components/toast-container';
import { flushToasts } from '../test-utils';
import { resetAnnouncer } from './announcer';
import { toastStore } from './store';
import { toast } from './toast';

const polite = () =>
  document.querySelector('[data-rct-announcer][aria-live="polite"]')!;
const assertive = () =>
  document.querySelector('[data-rct-announcer][aria-live="assertive"]')!;
const announced = (region: Element) =>
  Array.from(region.children).map((child) => child.textContent);

const show = (...args: Parameters<typeof toast>) => {
  act(() => {
    toast(...args);
  });
  flushToasts();
};

describe('screen-reader announcements', () => {
  beforeEach(() => {
    toastStore.reset();
    render(<ToastContainer />);
  });

  it('mounts both live regions before any toast exists', () => {
    expect(polite()).toHaveAttribute('role', 'log');
    expect(polite()).toHaveAttribute('aria-relevant', 'additions');
    expect(assertive()).toBeInTheDocument();
    expect(announced(polite())).toEqual([]);
  });

  it('announces every toast of a batch, not just the last', () => {
    act(() => {
      toast('first');
      toast('second');
    });

    expect(announced(polite())).toEqual(['first', 'second']);
  });

  it('announces a toast once under StrictMode', () => {
    cleanup();
    resetAnnouncer();
    render(
      <StrictMode>
        <ToastContainer />
      </StrictMode>
    );
    show('once');

    expect(announced(polite())).toEqual(['once']);
  });

  it('announces identical text again when the toast is re-issued', () => {
    show('Copied', { id: 'copy' });
    show('Copied', { id: 'copy' });

    expect(announced(polite())).toEqual(['Copied', 'Copied']);
  });

  it('routes errors and explicit alerts to the assertive region', () => {
    show('boom', { type: 'error' });
    show('urgent', { role: 'alert' });
    show('calm');

    expect(announced(assertive())).toEqual(['boom', 'urgent']);
    expect(announced(polite())).toEqual(['calm']);
  });

  it('announces rich content as the text it renders', () => {
    show({ text: <span>saved to the cloud</span>, highlightText: 'File ' });
    expect(announced(polite())).toEqual(['File saved to the cloud']);
  });

  it('announces text a component produced', () => {
    const Message = () => <span>from a component</span>;
    show(<Message />);

    expect(announced(polite())).toEqual(['from a component']);
  });

  it('mounts the toast content only once', () => {
    let mounts = 0;
    const Message = () => {
      mounts += 1;
      return <span>counted</span>;
    };
    show(<Message />);

    expect(mounts).toBe(1);
    expect(announced(polite())).toEqual(['counted']);
  });

  it('announces a toast created by a sibling that mounts first', () => {
    cleanup();
    resetAnnouncer();
    const Greeter = () => {
      useEffect(() => {
        toast('Welcome back');
      }, []);
      return null;
    };
    render(
      <>
        <Greeter />
        <ToastContainer />
      </>
    );

    expect(announced(polite())).toEqual(['Welcome back']);
  });

  it('announces a toast created before the container mounted', () => {
    cleanup();
    resetAnnouncer();
    act(() => {
      toast('early bird');
    });
    render(<ToastContainer />);

    expect(announced(polite())).toEqual(['early bird']);
  });

  it('announces nothing for a toast with no text', () => {
    show({ text: undefined });
    expect(announced(polite())).toEqual([]);
  });

  it('does not announce a toast that is still queued', () => {
    act(() => {
      toastStore.setLimit(1);
    });
    show('visible');
    show('queued');

    expect(announced(polite())).toEqual(['visible']);
  });

  it('clears announcements after a few seconds', () => {
    vi.useFakeTimers();
    show('gone soon');
    expect(announced(polite())).toEqual(['gone soon']);

    act(() => vi.advanceTimersByTime(7000));

    expect(announced(polite())).toEqual([]);
  });

  it('keeps a single pair of regions when two containers are mounted', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ToastContainer />);
    show('once');

    expect(screen.getAllByRole('log', { hidden: true })).toHaveLength(2);
    expect(announced(polite())).toEqual(['once']);
  });
});
