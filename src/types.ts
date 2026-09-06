import type {
  CSSProperties,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefCallback,
} from 'react';

/** Where a toast is anchored on the screen. */
export type ToastPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

/** Semantic kind of a toast. Selects a default icon and can be themed via `[data-rct-type]`. */
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

/** Identifier returned by {@link toast} and accepted by `toast.dismiss` / `toast.update`. */
export type ToastId = string;

/**
 * The events every toast travels through. Exported as a real enum, not a
 * `const enum`, so `ToastEvent.Add` can be used as a value — in 0.2.x it was
 * type-only and `eventManager` could not actually be called from TypeScript.
 */
export enum ToastEvent {
  /** A toast was raised. */
  Add,
  /** A toast started its exit animation. */
  Dismiss,
  /** A toast left the screen. */
  Delete,
  /** A toast's options changed. */
  Update,
}

/** The callback signature of each event. */
export interface EventCallbacks {
  [ToastEvent.Add]: (options: ToastOptions) => void;
  [ToastEvent.Dismiss]: (id?: ToastId) => void;
  [ToastEvent.Delete]: (id?: ToastId) => void;
  [ToastEvent.Update]: (
    id: ToastId,
    options: Partial<Omit<ToastOptions, 'id'>>
  ) => void;
}

/** Handle returned by `setTimeout`, whatever the host calls it. */
export type TimeoutId = ReturnType<typeof setTimeout>;

/** The publish-subscribe hub `toast()` and `ToastContainer` talk through. */
export interface EventManager {
  /** Registered callbacks, by event. */
  list: Map<ToastEvent, EventCallbacks[ToastEvent][]>;
  /** Notifications scheduled for the next tick, by event. */
  emitQueue: Map<ToastEvent, TimeoutId[]>;
  /** Toasts currently on screen. Read-only: derived from the toast list. */
  readonly activeToastCount: number;
  /** Subscribe to an event. */
  on<E extends ToastEvent>(event: E, callback: EventCallbacks[E]): EventManager;
  /** Unsubscribe one callback, or every callback for the event. */
  off<E extends ToastEvent>(
    event: E,
    callback?: EventCallbacks[E]
  ): EventManager;
  /** Publish an event: applied at once, announced on the next tick. */
  emit<E extends ToastEvent>(
    event: E,
    ...args: Parameters<EventCallbacks[E]>
  ): void;
  /** Drop notifications scheduled for an event but not yet delivered. */
  cancelEmit(event: ToastEvent): EventManager;
}

/** Distance from a screen edge; numbers are pixels. */
export type ToastOffset = number | string;

/** An explicit action button rendered inside a toast. */
export interface ToastAction {
  label: ReactNode;
  /**
   * Called when the button is activated. The toast is dismissed afterwards
   * unless `event.preventDefault()` is called.
   */
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Options accepted by {@link toast} and by
 * {@link ToastContainerProps.toastOptions} as defaults.
 */
export interface ToastOptions {
  /**
   * Custom id. When a toast with the same id is already visible or queued,
   * it is updated in place (and its auto-close timer restarts) instead of
   * creating a duplicate.
   */
  id?: ToastId;
  /**
   * Main content. Strings are announced to screen readers verbatim; other
   * nodes are flattened to their text content for the announcement.
   */
  text?: ReactNode;
  /**
   * Semantic kind. Renders a matching built-in icon unless `icon` is set,
   * and exposes `data-rct-type` for styling. `'loading'` defaults
   * `autoClose` to `false`; `'error'` defaults `role` to `'alert'`.
   */
  type?: ToastType;
  /**
   * Leading icon: an emoji/string or any React node. `null` hides the icon
   * (including the built-in one selected by `type`). String icons are
   * treated as decorative (`aria-hidden`).
   */
  icon?: ReactNode;
  /**
   * Emphasised text rendered *before* `text`.
   * @deprecated Put a React node in `text` instead, e.g.
   * `text: <><b>Saved</b> to the cloud</>`. Will be removed in 1.0.
   */
  highlightText?: ReactNode;
  /**
   * CSS color applied to `highlightText`.
   * @deprecated See `highlightText`. Will be removed in 1.0.
   */
  highlightColor?: string;
  /**
   * Milliseconds before the toast dismisses itself. `false` (or `0`) keeps
   * it open until dismissed.
   * @default 3000 (`false` for `type: 'loading'` and for toasts with an `action`)
   */
  autoClose?: number | false;
  /**
   * Dismiss when the toast is clicked, or when Enter / Space / Escape is
   * pressed while it has focus.
   * @default true
   */
  closeOnClick?: boolean;
  /**
   * Pause the auto-close timer while the pointer is over the toast. Focus
   * always pauses it.
   * @default true
   */
  pauseOnHover?: boolean;
  /**
   * Render an explicit close button. When omitted, the button is shown only
   * for toasts that could not be dismissed otherwise (`autoClose: false`
   * together with `closeOnClick: false`).
   */
  closeButton?: boolean;
  /**
   * Accessible label of the close button.
   * @default 'Close'
   */
  closeButtonLabel?: string;
  /** An explicit action button, rendered after the text. */
  action?: ToastAction;
  /**
   * How the toast is announced to assistive technology: `'status'` is
   * polite (waits for the user to be idle), `'alert'` interrupts.
   * @default 'status' (`'alert'` for `type: 'error'`)
   */
  role?: 'status' | 'alert';
  /**
   * Screen position. Falls back to the container's `position` prop, then
   * `'bottomCenter'`.
   */
  position?: ToastPosition;
  /**
   * Vertical distance between this toast's position group and the screen
   * edge.
   * @deprecated Use the `offset` prop of `ToastContainer`. When several
   * toasts of a group set it, the first one wins. Will be removed in 1.0.
   */
  offset?: ToastOffset;
  /**
   * Extra class names for the toast element. When given, the built-in look
   * (background, colour, radius, padding) is not applied so your classes
   * control the appearance; layout and animations are kept.
   */
  className?: string;
  /**
   * Render a bare element: no built-in look and no layout rules, only
   * positioning and animations. For fully custom designs.
   * @default false
   */
  unstyled?: boolean;
  /** Inline styles for the toast element. */
  style?: CSSProperties;
  /**
   * Inline styles for the position group element.
   * @deprecated Use the `containerStyle` prop of `ToastContainer`. When
   * several toasts of a group set it, the first one wins. Will be removed
   * in 1.0.
   */
  containerStyle?: CSSProperties;
  /**
   * Called when the toast itself is clicked or activated from the keyboard.
   * A pointer convenience: put real actions in `action` so they are
   * reachable by everyone.
   */
  onClick?: (
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
  ) => void;
  /**
   * Called when the toast leaves the store for any reason (dismissed,
   * removed, or dropped from the queue). The DOM node unmounts in the
   * following render.
   */
  onClose?: () => void;
}

/** Options accepted alongside a message: everything except the content. */
export type ToastMessageOptions = Omit<ToastOptions, 'text'>;

/** Props of the built-in {@link Toast} component. A {@link ToastRecord} can be spread onto it. */
export interface ToastProps extends ToastOptions {
  /** @deprecated Use `id`. */
  toastId?: ToastId;
  /** External pause signal (the container sets it while the page is hidden or its group has focus). */
  paused?: boolean;
  /** The pointer is over this toast's position group. Honoured only when `pauseOnHover` is on. */
  groupHovered?: boolean;
}

/** A toast as stored: its options plus bookkeeping fields. */
export interface ToastRecord extends ToastOptions {
  id: ToastId;
  /** `true` once the toast is on its way out (exit animation playing). */
  dismissed: boolean;
  /** Increases whenever the auto-close timer should restart (re-`toast()` with the same id, `autoClose` updated). */
  version: number;
  /** `Date.now()` at creation. */
  createdAt: number;
}

/** Props of {@link ToastContainer}. */
export interface ToastContainerProps {
  /**
   * Default position for toasts that do not set one.
   * @default 'bottomCenter'
   */
  position?: ToastPosition;
  /**
   * Maximum number of toasts shown at once (toasts that are animating out
   * still count). Additional toasts wait in a queue and appear as others
   * leave. Use `Infinity` for no limit.
   * @default 6
   */
  limit?: number;
  /** Defaults merged under every toast's own options. */
  toastOptions?: Partial<Omit<ToastOptions, 'id' | 'text'>>;
  /**
   * Put the newest toast first in DOM order.
   * @default false
   */
  newestOnTop?: boolean;
  /**
   * Distance between position groups and the screen edges. A single value
   * applies to both axes; use `{ x, y }` to set them separately. Safe-area
   * insets are added on top.
   * @default { x: 20, y: 30 }
   */
  offset?: ToastOffset | { x?: ToastOffset; y?: ToastOffset };
  /** Class names applied to every position group element. */
  containerClassName?: string;
  /** Inline styles applied to every position group element. */
  containerStyle?: CSSProperties;
  /**
   * Accessible name of the position groups (landmark regions).
   * @default 'Notifications'
   */
  label?: string;
  /**
   * Keyboard shortcut that focuses the newest toast, as `KeyboardEvent`
   * modifier names and/or a `code`. `[]` disables it.
   * @default ['altKey', 'KeyT']
   */
  hotkey?: readonly string[];
  /**
   * Pause every auto-close timer while the window is not focused or the
   * tab is hidden.
   * @default true
   */
  pauseOnFocusLoss?: boolean;
  /**
   * Render the position groups into `document.body` (or the given element)
   * instead of in place. Use it when an ancestor has `transform`, `filter`
   * or `overflow` that would trap the fixed-position groups.
   * @default false
   */
  portal?: boolean | Element;
  /**
   * Inject the built-in stylesheet into `<head>` on mount. Disable it if you
   * import `react-compact-toast/styles.css` yourself (for example under a
   * strict CSP or to control cascade layers).
   * @default true
   */
  injectStyles?: boolean;
  /** CSP nonce added to the injected `<style>` element. */
  nonce?: string;
}

/** A message, or full options, for one phase of {@link ToastFn.promise}. */
export type ToastContent = ReactNode | ToastOptions;

/** Messages for {@link ToastFn.promise}. */
export interface ToastPromiseMessages<T> {
  loading: ToastContent;
  success: ToastContent | ((value: T) => ToastContent);
  error: ToastContent | ((error: unknown) => ToastContent);
}

/** A `toast.success`-style shorthand. */
export type ToastShorthand = (
  textOrOptions: ToastContent,
  options?: ToastMessageOptions
) => ToastId;

/** The {@link toast} function and its helpers. */
export interface ToastFn {
  /** Show a toast: `toast('Saved')`, `toast('Saved', { position: 'topRight' })` or `toast({ text: 'Saved' })`. Returns its id. */
  (textOrOptions: ToastContent, options?: ToastMessageOptions): ToastId;
  success: ToastShorthand;
  error: ToastShorthand;
  info: ToastShorthand;
  warning: ToastShorthand;
  /** A `type: 'loading'` toast; it stays until dismissed or updated. */
  loading: ToastShorthand;
  /** Play the exit animation, then remove. Without an id, every toast (visible and queued) is dismissed. */
  dismiss: (id?: ToastId) => void;
  /** Remove immediately without an exit animation. Without an id, every toast is removed. */
  remove: (id?: ToastId) => void;
  /** Change the options of a visible or queued toast. Passing `autoClose` restarts its timer. */
  update: (id: ToastId, options: Partial<Omit<ToastOptions, 'id'>>) => void;
  /**
   * Show a loading toast that turns into a success or error toast when the
   * promise settles. Returns the same promise.
   */
  promise: <T>(
    promise: Promise<T>,
    messages: ToastPromiseMessages<T>,
    options?: ToastMessageOptions
  ) => Promise<T>;
  /** `true` while the toast is visible or queued. */
  isActive: (id: ToastId) => boolean;
}

/** Overrides for the headless {@link useToast} hook, merged over the stored options. */
export interface UseToastOptions extends Partial<Omit<ToastOptions, 'id'>> {
  /** External pause signal for the auto-close timer, regardless of `pauseOnHover`. */
  paused?: boolean;
  /** External hover signal, honoured only when `pauseOnHover` is on. */
  groupHovered?: boolean;
}

/** Props to spread onto the root element of a custom toast. */
export interface ToastRootProps {
  ref: RefCallback<HTMLElement>;
  role: 'status';
  'aria-live': 'off';
  'aria-atomic': true;
  tabIndex?: number;
  /** Announces that Escape dismisses, when it does. */
  'aria-keyshortcuts'?: string;
  'data-rct-state': 'entering' | 'exiting';
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
}

/** Return value of {@link useToast}. */
export interface UseToastResult {
  /** The effective options: store record merged with the overrides. */
  toast: ToastRecord | (UseToastOptions & { id: ToastId });
  /** `true` while the exit animation plays. */
  isExiting: boolean;
  /** Whether a close button should be rendered. */
  closeButton: boolean;
  /** Start dismissing this toast. */
  dismiss: () => void;
  /** Pause the auto-close timer. */
  pause: () => void;
  /** Resume the auto-close timer. */
  resume: () => void;
  /** Spread onto the root element (`<div {...toastProps}>`). */
  toastProps: ToastRootProps;
  /** @deprecated Use `toastProps.onClick`. */
  handleClick: () => void;
  /** @deprecated Removal is automatic; this is a no-op kept for 0.2.x code. */
  handleAnimationEnd: () => void;
}

/** Options for the headless {@link useToastContainer} hook. */
export interface UseToastContainerOptions {
  limit?: number;
  position?: ToastPosition;
  newestOnTop?: boolean;
}

/** A position group as returned by the deprecated `getToastPositionGroupToRender`. */
export interface ToastPositionGroup {
  toasts: (ToastRecord & { toastId: ToastId })[];
  containerStyle?: CSSProperties;
}

/** Return value of {@link useToastContainer}. */
export interface UseToastContainerResult {
  /** Visible toasts (including exiting ones) in render order. */
  toasts: readonly ToastRecord[];
  /** Visible toasts grouped by resolved position, in render order. */
  groups: ReadonlyMap<ToastPosition, readonly ToastRecord[]>;
  dismiss: ToastFn['dismiss'];
  remove: ToastFn['remove'];
  /** @deprecated Use `groups`. Kept for 0.2.x compatibility. */
  getToastPositionGroupToRender: () => Map<ToastPosition, ToastPositionGroup>;
}
