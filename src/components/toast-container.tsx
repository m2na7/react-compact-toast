import { memo, useMemo, Fragment } from 'react';

import Toast from './toast';
import { useToastContainer } from '../hooks/use-toast-container';
import { getToastOffsetStyle } from '../utils/get-toast-offset-style';
import '../styles.css';

const ToastContainer = () => {
  const { getToastPositionGroupToRender } = useToastContainer();
  const positionGroup = useMemo(
    () => getToastPositionGroupToRender(),
    [getToastPositionGroupToRender]
  );

  return (
    <Fragment>
      {Array.from(positionGroup).map(
        ([position, { toasts, containerStyle }]) => {
          const className = `toast-container toast-position-${position}`;

          const combinedStyle = {
            ...getToastOffsetStyle(toasts, position),
            ...containerStyle,
          };

          return (
            <div key={position} className={className} style={combinedStyle}>
              {toasts.map((toastProps) => (
                <Toast key={toastProps.toastId} {...toastProps} />
              ))}
            </div>
          );
        }
      )}
    </Fragment>
  );
};

export default memo(ToastContainer);
