import { useEffect, useState, useSyncExternalStore } from 'react';

import {
  claimAnnouncer,
  getAnnouncements,
  getServerAnnouncements,
  isAnnouncerOwner,
  releaseAnnouncer,
  subscribeAnnouncements,
  subscribeOwners,
} from '../core/announcer';
import type { Announcement } from '../core/announcer';

/**
 * The pending screen-reader announcements, or `null` when another mounted
 * container is responsible for rendering the live regions.
 */
export function useAnnouncements(): readonly Announcement[] | null {
  const [token] = useState(() => Symbol('rct-announcer'));

  useEffect(() => {
    claimAnnouncer(token);
    return () => releaseAnnouncer(token);
  }, [token]);

  const isOwner = useSyncExternalStore(
    subscribeOwners,
    () => isAnnouncerOwner(token),
    // Server rendering happens once, so the live regions are always part of
    // the markup; the client's first container claims them on hydration.
    () => true
  );
  const announcements = useSyncExternalStore(
    subscribeAnnouncements,
    getAnnouncements,
    getServerAnnouncements
  );

  return isOwner ? announcements : null;
}
