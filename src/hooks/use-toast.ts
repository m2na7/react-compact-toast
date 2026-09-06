import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent } from 'react';

import { DEFAULT_AUTO_CLOSE, MAX_EXIT_MS } from '../constants';
import { definedOnly } from '../core/defined-only';
import { eventManager, subscribeToToasts } from '../core/event-manager';
import { toastStore } from '../core/store';
import { ToastEvent } from '../types';
import type {
  ToastId,
  ToastRecord,
  ToastRootProps,
  UseToastOptions,
  UseToastResult,
} from '../types';

const useIsomorphicLayoutEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;

const getNoRecord = (): ToastRecord | undefined => undefined;

/** Running animations/transitions of the element that will actually finish. */
function getFiniteAnimations(element: HTMLElement | null): Animation[] {
  if (!element || typeof element.getAnimations !== 'function') return [];
  return element.getAnimations().filter((animation) => {
    if (animation.playState === 'paused') return false;
    const timing = animation.effect?.getComputedTiming();
    return !timing || timing.iterations !== Infinity;
  });
}

/**
 * Headless toast behaviour: auto-close timer with pause on hover/focus,
 * dismissal (click, Enter, Space, Escape, `toast.dismiss()`), exit
 * animation tracking, focus restoration and the ARIA attributes of the root
 * element. Used by the built-in `Toast`; spread `toastProps` onto the root
 * of your own component to reuse it.
 *
 * The options of the toast are read from the store by id and merged with
 * `overrides`, so `toast.update()` and `toast.promise()` work for custom
 * components too.
 */
export function useToast(
  toastId: ToastId,
  overrides?: UseToastOptions
): UseToastResult;
/** @deprecated Pass an options object instead of positional arguments. */
export function useToast(
  toastId: ToastId,
  autoClose?: number | false,
  closeOnClick?: boolean
): UseToastResult;
export function useToast(
  toastId: ToastId,
  overridesOrAutoClose?: UseToastOptions | number | false,
  legacyCloseOnClick?: boolean
): UseToastResult {
  const overrides: UseToastOptions =
    typeof overridesOrAutoClose === 'object' && overridesOrAutoClose !== null
      ? overridesOrAutoClose
      : { autoClose: overridesOrAutoClose, closeOnClick: legacyCloseOnClick };

  const getRecord = useCallback(() => toastStore.get(toastId), [toastId]);
  const record = useSyncExternalStore(
    subscribeToToasts,
    getRecord,
    getNoRecord
  );

  const options = { ...record, ...definedOnly(overrides), id: toastId };
  const {
    type,
    action,
    closeOnClick = true,
    pauseOnHover = true,
    onClick,
    onClose,
    paused: externalPaused = false,
    groupHovered = false,
  } = options;
  const autoClose =
    options.autoClose ??
    (type === 'loading' || action ? false : DEFAULT_AUTO_CLOSE);
  const duration = autoClose ? autoClose : 0;
  const closeButton = options.closeButton ?? (duration === 0 && !closeOnClick);
  const interactive = closeOnClick || Boolean(onClick);
  const escapeDismisses = closeOnClick || closeButton;

  // --- exiting state: the store record is the source of truth when the
  // toast lives in the store; local state covers standalone usage.
  const [localExiting, setLocalExiting] = useState(false);
  const isExiting = record ? record.dismissed : localExiting;
  const version = record?.version ?? 0;

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  const dismiss = useCallback(() => {
    if (toastStore.get(toastId)) eventManager.emit(ToastEvent.Dismiss, toastId);
    else setLocalExiting(true);
  }, [toastId]);

  const remove = useCallback(() => {
    if (toastStore.get(toastId)) eventManager.emit(ToastEvent.Delete, toastId);
    else onCloseRef.current?.();
  }, [toastId]);

  // --- auto-close timer with pause bookkeeping
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const paused =
    isExiting ||
    externalPaused ||
    manuallyPaused ||
    focused ||
    (pauseOnHover && (hovered || groupHovered));

  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  useEffect(() => {
    remainingRef.current = duration;
  }, [duration, version]);

  useEffect(() => {
    if (duration === 0 || paused) return;
    startedAtRef.current = Date.now();
    const timer = setTimeout(dismiss, Math.max(0, remainingRef.current));
    return () => {
      clearTimeout(timer);
      remainingRef.current -= Date.now() - startedAtRef.current;
    };
  }, [duration, paused, version, dismiss]);

  // --- exit: wait for the root element's animations/transitions, then remove
  const elementRef = useRef<HTMLElement | null>(null);
  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    if (!isExiting) return;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      remove();
    };
    const animations = getFiniteAnimations(elementRef.current);
    if (animations.length === 0) {
      finish();
      return;
    }
    const cap = setTimeout(finish, MAX_EXIT_MS);
    Promise.allSettled(animations.map((animation) => animation.finished)).then(
      finish
    );
    return () => {
      settled = true;
      clearTimeout(cap);
    };
  }, [isExiting, remove]);

  // --- focus management
  const focusWithinRef = useRef(false);
  const lastOutsideRef = useRef<Element | null>(null);

  const handleFocus = (event: FocusEvent<HTMLElement>) => {
    focusWithinRef.current = true;
    setFocused(true);
    const from = event.relatedTarget;
    if (from && !event.currentTarget.contains(from)) {
      lastOutsideRef.current = from;
    }
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const to = event.relatedTarget;
    if (!to || !event.currentTarget.contains(to)) {
      focusWithinRef.current = false;
      setFocused(false);
    }
  };

  // Runs before the node is detached, so `focusWithinRef` is still accurate.
  useIsomorphicLayoutEffect(
    () => () => {
      const element = elementRef.current;
      if (!element || !focusWithinRef.current) return;
      const sibling = (element.nextElementSibling ??
        element.previousElementSibling) as HTMLElement | null;
      const outside = lastOutsideRef.current as HTMLElement | null;
      const target = sibling?.hasAttribute('data-rct-toast')
        ? sibling
        : outside?.isConnected
          ? outside
          : (element.parentElement as HTMLElement | null);
      target?.focus?.({ preventScroll: true });
    },
    []
  );

  // --- activation
  const activate = (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => {
    onClick?.(event);
    if (closeOnClick) dismiss();
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (event.defaultPrevented) return;
    activate(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      if (escapeDismisses) {
        event.preventDefault();
        dismiss();
      }
      return;
    }
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate(event);
    }
  };

  // `role="status"` with `aria-live="off"`, focusable when it responds to
  // activation: the same shape Radix Toast uses. The root stays a generic
  // live-region element rather than a `button` so that the close and action
  // buttons inside it remain valid and separately reachable; announcements
  // are handled by the container's own live regions.
  const toastProps: ToastRootProps = {
    ref: setElement,
    role: 'status',
    'aria-live': 'off',
    'aria-atomic': true,
    tabIndex: interactive ? 0 : undefined,
    // Without this a screen-reader user lands on a bare "status" with no hint
    // that the toast can be closed from the keyboard.
    'aria-keyshortcuts': escapeDismisses ? 'Escape' : undefined,
    'data-rct-state': isExiting ? 'exiting' : 'entering',
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: handleFocus,
    onBlur: handleBlur,
  };

  return {
    toast: options,
    isExiting,
    closeButton,
    dismiss,
    pause: () => setManuallyPaused(true),
    resume: () => setManuallyPaused(false),
    toastProps,
    handleClick: () => {
      if (closeOnClick) dismiss();
    },
    handleAnimationEnd: () => {},
  };
}
