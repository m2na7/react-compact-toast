import { useCallback, useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';

import { DEFAULT_CLOSE_BUTTON_LABEL, DEFAULT_POSITION } from '../constants';
import { announce, forgetAnnouncement } from '../core/announcer';
import { toastStore } from '../core/store';
import { useToast } from '../hooks/use-toast';
import type { ToastProps } from '../types';
import { Icon } from './icons';

/**
 * The built-in toast. Rendered by `ToastContainer`; can also be used from a
 * custom container built on `useToastContainer` — spread a `ToastRecord`
 * onto it: `<Toast key={record.id} {...record} />`.
 */
export function Toast(props: ToastProps) {
  const { id: idProp, toastId, paused, groupHovered, ...overrides } = props;
  const id = idProp ?? toastId ?? '';
  const {
    toast: options,
    closeButton,
    dismiss,
    toastProps,
  } = useToast(id, { ...overrides, paused, groupHovered });
  const setToastRef = toastProps.ref;

  const {
    type,
    text,
    highlightText,
    highlightColor,
    action,
    className,
    unstyled,
    style,
  } = options;
  const position = options.position ?? DEFAULT_POSITION;
  const styled = !unstyled && !className;

  // `icon: 'default'` was documented but never implemented in 0.2; treat it as "not set".
  const icon =
    options.icon === undefined || options.icon === 'default'
      ? type && <Icon name={type} />
      : options.icon;
  const decorativeIcon = typeof icon === 'string' || options.icon == null;

  const handleAction = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    action?.onClick(event);
    if (!event.defaultPrevented) dismiss();
  };

  const handleClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dismiss();
  };

  // Announce what was actually rendered, once it is on screen. Reading the
  // DOM covers content a component produced, which no static walk of the
  // React tree could resolve.
  const element = useRef<HTMLElement | null>(null);
  const setRef = useCallback(
    (node: HTMLElement | null) => {
      element.current = node;
      setToastRef(node);
    },
    [setToastRef]
  );
  const revision = 'version' in options ? options.version : 0;
  const assertive =
    (options.role ?? (type === 'error' ? 'alert' : 'status')) === 'alert';
  useEffect(() => {
    const text = element.current?.textContent;
    if (text) announce(id, revision, text, assertive);
  }, [id, revision, assertive, text, highlightText]);
  // Only when the toast has really left the store — StrictMode replays this
  // cleanup while the toast is still there, and dropping the marker then
  // would announce the same text twice.
  useEffect(
    () => () => {
      if (!toastStore.get(id)) forgetAnnouncement(id);
    },
    [id]
  );

  return (
    <div
      {...toastProps}
      ref={setRef}
      data-rct-toast=""
      data-rct-id={id}
      data-rct-position={position}
      data-rct-type={type}
      data-rct-base={unstyled ? undefined : ''}
      data-rct-styled={styled ? '' : undefined}
      data-rct-unstyled={unstyled ? '' : undefined}
      className={className}
      style={style}
    >
      {icon != null && icon !== false && (
        <span data-rct-icon="" aria-hidden={decorativeIcon || undefined}>
          {icon}
        </span>
      )}
      <div data-rct-text="">
        {highlightText != null && (
          <span
            data-rct-highlight=""
            style={highlightColor ? { color: highlightColor } : undefined}
          >
            {highlightText}
          </span>
        )}
        {text}
      </div>
      {action && (
        <button type="button" data-rct-action="" onClick={handleAction}>
          {action.label}
        </button>
      )}
      {closeButton && (
        <button
          type="button"
          data-rct-close=""
          aria-label={options.closeButtonLabel ?? DEFAULT_CLOSE_BUTTON_LABEL}
          onClick={handleClose}
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
