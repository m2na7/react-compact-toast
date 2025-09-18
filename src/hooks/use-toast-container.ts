import { useCallback, useEffect, useState } from 'react';

import { TOAST_DEFAULT_POSITION } from '../constants';
import { eventManager, ToastEvent, ToastPosition, ToastProps } from '../core';

type ToastPositionGroup = {
  toasts: ToastProps[];
  containerStyle?: React.CSSProperties;
};

export const useToastContainer = () => {
  const [toastList, setToastList] = useState(new Map<string, ToastProps>());

  const addToast = useCallback((props: ToastProps) => {
    setToastList((prev) => {
      const newMap = new Map(prev);
      newMap.set(props.toastId, props);
      return newMap;
    });
  }, []);

  const deleteToast = useCallback((id: string) => {
    setToastList((prev) => {
      if (!prev.has(id)) return prev;

      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const updateToast = useCallback((id: string, text: string) => {
    setToastList((prev) => {
      if (!prev.has(id)) return prev;

      const newMap = new Map(prev);
      const toast = prev.get(id)!;
      newMap.set(id, { ...toast, text });
      return newMap;
    });
  }, []);

  useEffect(() => {
    eventManager.on(ToastEvent.Add, addToast);
    eventManager.on(ToastEvent.Delete, deleteToast);
    eventManager.on(ToastEvent.Update, updateToast);

    return () => {
      eventManager.off(ToastEvent.Add, addToast);
      eventManager.off(ToastEvent.Delete, deleteToast);
      eventManager.off(ToastEvent.Update, updateToast);

      eventManager.cancelEmit(ToastEvent.Add);
      eventManager.cancelEmit(ToastEvent.Delete);
      eventManager.cancelEmit(ToastEvent.Update);
    };
  }, [addToast, deleteToast, updateToast]);

  const getToastPositionGroupToRender = useCallback(() => {
    const positionGroup = new Map<ToastPosition, ToastPositionGroup>();

    toastList.forEach((toast) => {
      const position = toast.position || TOAST_DEFAULT_POSITION;

      if (!positionGroup.has(position)) {
        positionGroup.set(position, {
          toasts: [],
          containerStyle: toast.containerStyle,
        });
      } else {
        const existing = positionGroup.get(position)!;
        if (toast.containerStyle && !existing.containerStyle) {
          existing.containerStyle = toast.containerStyle;
        }
      }
      positionGroup.get(position)!.toasts.push(toast);
    });

    return positionGroup;
  }, [toastList]);

  return { getToastPositionGroupToRender };
};
