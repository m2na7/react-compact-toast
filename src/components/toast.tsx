import { TOAST_DEFAULT_POSITION } from '../constants';
import { ToastProps } from '../core';
import { useToast } from '../hooks';

import '../styles.css';

const Toast = ({
  toastId,
  text,
  icon,
  highlightText,
  highlightColor,
  autoClose = 3000,
  closeOnClick = true,
  position = TOAST_DEFAULT_POSITION,
  className,
}: ToastProps) => {
  const { isExiting, handleAnimationEnd, handleClick } = useToast(
    toastId,
    autoClose,
    closeOnClick
  );

  const isTopPosition = position.startsWith('top');

  const renderIcon = () => {
    if (!icon) return null;

    switch (icon) {
      case 'default':
        return icon;
      case undefined:
        return null;
      default:
        return icon;
    }
  };

  const getToastClasses = () => {
    let classes = 'toast';

    if (!className) {
      classes += ' toast-default-style toast-default-size';
    }

    if (isTopPosition) {
      classes += ' toast-top-position';
    }

    if (isExiting) {
      classes += isTopPosition ? ' toast-exit-top' : ' toast-exit-bottom';
    } else {
      classes += isTopPosition ? ' toast-enter-top' : ' toast-enter-bottom';
    }

    if (className) {
      classes += ` ${className}`;
    }

    return classes;
  };

  return (
    <div
      className={getToastClasses()}
      onClick={handleClick}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="toast-content">
        {renderIcon()}
        <p className="toast-text">
          <span
            className="toast-highlight-text"
            style={highlightColor ? { color: highlightColor } : undefined}
          >
            {highlightText}
          </span>
          {text}
        </p>
      </div>
    </div>
  );
};

export default Toast;
