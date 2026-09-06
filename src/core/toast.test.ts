import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { toastStore } from './store';
import { toast } from './toast';

const latest = () => {
  const list = toastStore.getSnapshot();
  return list[list.length - 1];
};

describe('toast()', () => {
  beforeEach(() => {
    toastStore.reset();
  });

  describe('call forms', () => {
    it('accepts a string', () => {
      toast('Saved');
      expect(latest()?.text).toBe('Saved');
    });

    it('accepts a React node', () => {
      const node = createElement('b', null, 'Saved');
      toast(node);
      expect(latest()?.text).toBe(node);
    });

    it('accepts a message plus options', () => {
      toast('Saved', { position: 'topRight' });
      expect(latest()).toMatchObject({ text: 'Saved', position: 'topRight' });
    });

    it('accepts an options object', () => {
      toast({ text: 'Saved', autoClose: 1000 });
      expect(latest()).toMatchObject({ text: 'Saved', autoClose: 1000 });
    });

    it('lets the options object win over trailing options', () => {
      toast({ text: 'Saved', position: 'topLeft' }, { position: 'topRight' });
      expect(latest()?.position).toBe('topLeft');
    });

    it('does not mistake an element with a text prop for options', () => {
      const node = createElement('span', { text: 'not options' } as never);
      toast(node);
      expect(latest()?.text).toBe(node);
    });

    it('treats an array of nodes as content', () => {
      toast(['a', 'b']);
      expect(latest()?.text).toEqual(['a', 'b']);
    });

    it('accepts an options object with no text', () => {
      toast({ type: 'success' });
      expect(latest()).toMatchObject({ type: 'success' });
      expect(latest()?.text).toBeUndefined();
    });

    it('treats a promise as content, not as options', () => {
      const promise = Promise.resolve('x');
      toast(promise as never);
      expect(latest()?.text).toBe(promise);
    });
  });

  describe('shorthands', () => {
    it.each(['success', 'error', 'info', 'warning', 'loading'] as const)(
      'toast.%s sets the type',
      (type) => {
        toast[type]('hi');
        expect(latest()).toMatchObject({ text: 'hi', type });
      }
    );

    it('still accepts options', () => {
      toast.success('hi', { position: 'topRight' });
      expect(latest()).toMatchObject({ type: 'success', position: 'topRight' });
    });
  });

  describe('helpers', () => {
    it('reports whether a toast is active', () => {
      const id = toast('a');
      expect(toast.isActive(id)).toBe(true);

      toast.remove(id);
      expect(toast.isActive(id)).toBe(false);
    });

    it('counts queued toasts as active', () => {
      toastStore.setLimit(1);
      toast('a');
      const queued = toast('b');
      expect(toast.isActive(queued)).toBe(true);
    });

    it('dismisses and updates by id', () => {
      const id = toast('a');

      toast.update(id, { text: 'b' });
      expect(toastStore.get(id)?.text).toBe('b');

      toast.dismiss(id);
      expect(toastStore.get(id)?.dismissed).toBe(true);
    });
  });

  describe('promise()', () => {
    it('shows a non-closing loading toast and returns the same promise', async () => {
      const promise = Promise.resolve('done');
      const returned = toast.promise(promise, {
        loading: 'Saving…',
        success: 'Saved',
        error: 'Failed',
      });

      expect(returned).toBe(promise);
      expect(latest()).toMatchObject({
        text: 'Saving…',
        type: 'loading',
        autoClose: false,
      });

      await promise;
      expect(toastStore.getSnapshot()).toHaveLength(1);
      expect(latest()).toMatchObject({
        text: 'Saved',
        type: 'success',
        autoClose: 3000,
      });
    });

    it('derives the success message from the resolved value', async () => {
      const promise = Promise.resolve({ name: 'report.pdf' });
      toast.promise(promise, {
        loading: 'Uploading…',
        success: (file) => `Uploaded ${file.name}`,
        error: 'Failed',
      });

      await promise;
      expect(latest()?.text).toBe('Uploaded report.pdf');
    });

    it('shows the error message and keeps the rejection', async () => {
      const promise = Promise.reject(new Error('nope'));
      toast.promise(promise, {
        loading: 'Saving…',
        success: 'Saved',
        error: (error) => `Failed: ${(error as Error).message}`,
      });

      await expect(promise).rejects.toThrow('nope');
      await Promise.resolve();
      expect(latest()).toMatchObject({
        text: 'Failed: nope',
        type: 'error',
      });
    });

    it('clears options that only the loading phase set', async () => {
      const promise = Promise.resolve(1);
      toast.promise(promise, {
        loading: { text: 'Saving…', icon: '⏳' },
        success: 'Saved',
        error: 'Failed',
      });
      expect(latest()?.icon).toBe('⏳');

      await promise;
      expect(latest()?.icon).toBeUndefined();
    });

    it('honours an explicit autoClose for the settled toast', async () => {
      const promise = Promise.resolve(1);
      toast.promise(
        promise,
        { loading: 'Saving…', success: 'Saved', error: 'Failed' },
        { autoClose: 8000 }
      );

      await promise;
      expect(latest()?.autoClose).toBe(8000);
    });

    it('brings the toast back if it was dismissed before settling', async () => {
      const promise = Promise.resolve(1);
      toast.promise(promise, {
        loading: 'Saving…',
        success: 'Saved',
        error: 'Failed',
      });
      toast.dismiss();
      expect(latest()?.dismissed).toBe(true);

      await promise;
      expect(latest()).toMatchObject({ text: 'Saved', dismissed: false });
    });

    it('does not resurrect a toast that was removed before settling', async () => {
      const promise = Promise.resolve(1);
      toast.promise(promise, {
        loading: 'Saving…',
        success: 'Saved',
        error: 'Failed',
      });
      toast.remove();

      await promise;
      expect(toastStore.getSnapshot()).toHaveLength(0);
    });
  });

  it('does nothing on the server but still returns an id', async () => {
    const add = vi.spyOn(toastStore, 'add');
    vi.stubGlobal('document', undefined);
    try {
      const id = toast('server');
      expect(id).toMatch(/^rct-/);
      expect(add).toHaveBeenCalled();
      expect(toastStore.getSnapshot()).toHaveLength(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
