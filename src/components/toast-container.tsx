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
      {Array.from(positionGroup).map(([position, toasts]) => (
        <div
          key={position}
          className={`toast-container toast-position-${position}`}
          style={getToastOffsetStyle(toasts, position)}
        >
          {toasts.map((toastProps) => (
            <Toast key={toastProps.toastId} {...toastProps} />
          ))}
        </div>
      ))}
    </Fragment>
  );
};

export default memo(ToastContainer);
