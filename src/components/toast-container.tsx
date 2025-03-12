import { memo, useMemo } from 'react';

import Toast from './toast';
import { useToastContainer } from '../hooks/use-toast-container';
import '../styles.css';

const ToastContainer = () => {
    const { getToastPositionGroupToRender } = useToastContainer();
    const positionGroup = useMemo(
        () => getToastPositionGroupToRender(),
        [getToastPositionGroupToRender],
    );

    return Array.from(positionGroup).map(([position, toasts]) => (
        <div
            key={position}
            className={`toast-container toast-position-${position}`}
        >
            {toasts.map((toastProps) => (
                <Toast key={toastProps.toastId} {...toastProps} />
            ))}
        </div>
    ));
};

export default memo(ToastContainer);