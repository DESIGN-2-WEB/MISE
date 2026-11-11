import { useEffect, useRef } from 'react';

/**
 * Opens a native <dialog> as a modal on mount, moves focus into it and
 * returns focus to the previously focused element on unmount. The dialog is
 * never closed from the cleanup: unmounting removes it from the top layer,
 * and closing it manually would queue a stray `close` event under StrictMode.
 */
export function useModalDialog(initialFocusRef) {
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    returnFocusRef.current ??= document.activeElement;
    if (!dialog.open) dialog.showModal();
    initialFocusRef.current?.focus();

    return () => {
      const returnTarget = returnFocusRef.current;
      if (returnTarget instanceof HTMLElement && returnTarget.isConnected) {
        returnTarget.focus({ preventScroll: true });
      }
    };
    // Ref objects never change, so this runs once per mount.
  }, [initialFocusRef]);

  return dialogRef;
}
