import Toast from './components/toast';
import ToastContainer from './components/toast-container';
import './styles.css';

export { useToast } from './hooks/use-toast';
export { useToastContainer } from './hooks/use-toast-container';
export { Toast };
export { ToastContainer };

export { eventManager } from './core/event-manager';
export { toast } from './core/toast';

export type {
  ToastPosition,
  ToastProps,
  ToastEvent,
  EventCallbacks,
  TimeoutId,
  EventManager,
} from './types';
