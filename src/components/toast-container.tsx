import { useEffect, useState } from 'react';
import type { CSSProperties, FocusEvent } from 'react';
import { createPortal } from 'react-dom';

import {
  DEFAULT_HOTKEY,
  DEFAULT_LIMIT,
  DEFAULT_POSITION,
  DEFAULT_REGION_LABEL,
} from '../constants';
import type { Announcement } from '../core/announcer';
import { definedOnly } from '../core/defined-only';
import { useAnnouncements } from '../hooks/use-announcements';
import { useInjectStyles } from '../hooks/use-inject-styles';
import { usePageFocus } from '../hooks/use-page-focus';
import { toastStore } from '../core/store';
import { useToastContainer } from '../hooks/use-toast-container';
import type {
  ToastContainerProps,
  ToastOffset,
  ToastPosition,
  ToastRecord,
} from '../types';
import { Toast } from './toast';

/** Visually hidden but readable by assistive technology. Inline so it works without the stylesheet. */
const srOnly: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
};

const toCssLength = (value: ToastOffset): string =>
  typeof value === 'number' ? `${value}px` : value;

/** Map the `offset` prop to the CSS custom properties the stylesheet reads (keeps safe-area math intact). */
function offsetVariables(
  offset: ToastContainerProps['offset'],
  legacyY: ToastOffset | undefined
): Record<string, string> {
  const { x, y } =
    offset == null
      ? { x: undefined, y: undefined }
      : typeof offset === 'object'
        ? offset
        : { x: offset, y: offset };
  const variables: Record<string, string> = {};
  if (x != null) variables['--rct-offset-x'] = toCssLength(x);
  const vertical = y ?? legacyY;
  if (vertical != null) variables['--rct-offset-y'] = toCssLength(vertical);
  return variables;
}

/** Live regions for screen readers. Always mounted by exactly one container. */
function Announcer({ items }: { items: readonly Announcement[] }) {
  const render = (assertive: boolean) =>
    items
      .filter((item) => item.assertive === assertive)
      .map((item) => <div key={item.key}>{item.text}</div>);
  return (
    <>
      <div
        data-rct-announcer=""
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={srOnly}
      >
        {render(false)}
      </div>
      <div
        data-rct-announcer=""
        role="log"
        aria-live="assertive"
        aria-relevant="additions"
        style={srOnly}
      >
        {render(true)}
      </div>
    </>
  );
}

const MODIFIERS = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'] as const;

/** `true` while the user is typing into a field, where a hotkey must not interfere. */
function isEditing(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element?.tagName) return false;
  return (
    element.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName)
  );
}

/** Focus the newest toast (or its region) when the hotkey is pressed. */
function useHotkey(hotkey: readonly string[], newestId: string | undefined) {
  const combination = hotkey.join('+');
  useEffect(() => {
    if (!combination || !newestId) return;
    const keys = combination.split('+');
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditing(event.target)) return;
      // Every listed modifier must be held and every unlisted one released,
      // so a wider combination never triggers the shortcut.
      const matches =
        MODIFIERS.every((name) => event[name] === keys.includes(name)) &&
        keys.every(
          (key) => MODIFIERS.includes(key as never) || event.code === key
        );
      if (!matches) return;
      const toasts = Array.from(
        document.querySelectorAll<HTMLElement>('[data-rct-toast]')
      );
      const newest = toasts.find(
        (element) => element.getAttribute('data-rct-id') === newestId
      );
      const target =
        newest && newest.tabIndex >= 0
          ? newest
          : newest?.closest<HTMLElement>('[data-rct-container]');
      if (!target) return;
      event.preventDefault();
      target.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [combination, newestId]);
}

interface PositionGroupProps {
  position: ToastPosition;
  toasts: readonly ToastRecord[];
  label: string;
  className?: string;
  style: CSSProperties;
  toastOptions: ToastContainerProps['toastOptions'];
  pageFocused: boolean;
}

/** One fixed-position group. Hovering or focusing anything inside pauses every toast in it. */
function PositionGroup({
  position,
  toasts,
  label,
  className,
  style,
  toastOptions,
  pageFocused,
}: PositionGroupProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Hover is reported separately: each toast decides whether to honour it,
  // because `pauseOnHover` is a per-toast option.
  const paused = focused || !pageFocused;

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={-1}
      data-rct-container=""
      data-rct-position={position}
      className={className}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toastOptions}
          {...definedOnly(toast)}
          position={position}
          paused={paused}
          groupHovered={hovered}
        />
      ))}
    </div>
  );
}

/**
 * Renders the toasts created with `toast()`. Mount exactly one, near the
 * root of your app. Injects the built-in stylesheet on mount unless
 * `injectStyles` is `false`.
 */
export function ToastContainer({
  position = DEFAULT_POSITION,
  limit = DEFAULT_LIMIT,
  toastOptions,
  newestOnTop = false,
  offset,
  containerClassName,
  containerStyle,
  label = DEFAULT_REGION_LABEL,
  hotkey = DEFAULT_HOTKEY,
  pauseOnFocusLoss = true,
  portal = false,
  injectStyles = true,
  nonce,
}: ToastContainerProps) {
  useInjectStyles(injectStyles, nonce);
  // Defaults live in the store so that they reach queued toasts and the
  // `onClose` the store itself calls, not only the toasts React renders.
  useEffect(() => {
    toastStore.setDefaults(toastOptions);
    return () => toastStore.setDefaults(undefined);
  }, [toastOptions]);
  // `toastOptions` is a set of defaults, so a position given there beats the
  // container's own `position` prop for toasts that do not choose one.
  const defaultPosition = toastOptions?.position ?? position;
  const { groups, toasts } = useToastContainer({
    limit,
    position: defaultPosition,
    newestOnTop,
  });
  const announcements = useAnnouncements();
  const pageFocused = usePageFocus(pauseOnFocusLoss);
  // `toasts` is in render order, so the newest is at whichever end
  // `newestOnTop` put it. Insertion order is used rather than `createdAt`,
  // which ties when several toasts are created in the same millisecond.
  const newest = newestOnTop ? toasts[0] : toasts[toasts.length - 1];
  useHotkey(hotkey, newest?.id);

  const rendered = Array.from(groups, ([groupPosition, list]) => {
    // The deprecated per-toast group options are read in creation order, so
    // `newestOnTop` never changes which toast supplies them.
    const oldestFirst = newestOnTop ? [...list].reverse() : list;
    const style: CSSProperties = {
      ...offsetVariables(
        offset,
        oldestFirst.find((toast) => toast.offset != null)?.offset
      ),
      ...oldestFirst.find((toast) => toast.containerStyle)?.containerStyle,
      ...containerStyle,
    };
    return (
      <PositionGroup
        key={groupPosition}
        position={groupPosition}
        toasts={list}
        label={groups.size > 1 ? `${label} (${groupPosition})` : label}
        className={containerClassName}
        style={style}
        toastOptions={toastOptions}
        pageFocused={pageFocused}
      />
    );
  });

  const portalTarget =
    portal === true
      ? typeof document === 'undefined'
        ? null
        : document.body
      : portal || null;

  return (
    <>
      {announcements && <Announcer items={announcements} />}
      {portalTarget ? createPortal(rendered, portalTarget) : rendered}
    </>
  );
}
