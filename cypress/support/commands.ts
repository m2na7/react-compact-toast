export {};
declare global {
  interface Window {
    toastManager?: {
      clear: () => void;
    };
  }
}
