import { ANNOUNCEMENT_MS } from '../constants';
import type { ToastId } from '../types';

/** One screen-reader announcement, appended to a live region. */
export interface Announcement {
  key: number;
  assertive: boolean;
  text: string;
}

const EMPTY: readonly Announcement[] = Object.freeze([]);

type Listener = () => void;

// --- announcements -------------------------------------------------------
//
// Toasts report the text they actually rendered, so anything the user can
// read is announced, including content produced by a component that a static
// walk of the React tree could not resolve. Each announcement is a plain
// string appended to a live region, which is what screen readers read
// reliably; the toast itself is never duplicated into the region.

const announced = new Map<ToastId, string>();
let announcements: readonly Announcement[] = EMPTY;
let sequence = 0;
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Queue an announcement for a toast, unless the same text was already
 * announced for it under the same revision.
 */
export function announce(
  id: ToastId,
  revision: number,
  text: string,
  assertive: boolean
): void {
  const trimmed = text.trim();
  if (!trimmed) return;
  // The revision is part of the marker so that re-issuing a toast with the
  // same id announces it again, which is what a repeated action (copying a
  // link, say) should do.
  const marker = `${revision}:${trimmed}`;
  if (announced.get(id) === marker) return;
  announced.set(id, marker);

  const key = ++sequence;
  announcements = [...announcements, { key, assertive, text: trimmed }];
  notify();
  setTimeout(() => {
    announcements = announcements.filter((item) => item.key !== key);
    notify();
  }, ANNOUNCEMENT_MS);
}

/** Forget a toast that has left, so a later toast reusing its id is announced. */
export function forgetAnnouncement(id: ToastId): void {
  announced.delete(id);
}

export function subscribeAnnouncements(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const getAnnouncements = (): readonly Announcement[] => announcements;
export const getServerAnnouncements = (): readonly Announcement[] => EMPTY;

// --- owner election: only one mounted container renders the live regions ---

const owners = new Set<symbol>();
const ownerListeners = new Set<Listener>();

function notifyOwners(): void {
  ownerListeners.forEach((listener) => listener());
}

export function claimAnnouncer(token: symbol): void {
  owners.add(token);
  notifyOwners();
}

export function releaseAnnouncer(token: symbol): void {
  owners.delete(token);
  notifyOwners();
}

export function isAnnouncerOwner(token: symbol): boolean {
  const [first] = owners;
  return first === token;
}

export function subscribeOwners(listener: Listener): () => void {
  ownerListeners.add(listener);
  return () => {
    ownerListeners.delete(listener);
  };
}

/** Tests only. */
export function resetAnnouncer(): void {
  announced.clear();
  announcements = EMPTY;
  owners.clear();
  notify();
  notifyOwners();
}
