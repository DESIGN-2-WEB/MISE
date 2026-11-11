import { useCallback, useEffect, useRef, useState } from 'react';
import { TOAST_DURATION_MS } from '../constants/config';

export function useToast(duration = TOAST_DURATION_MS) {
  const [toast, setToast] = useState({ message: '', visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback(
    (message) => {
      window.clearTimeout(timerRef.current);
      setToast({ message, visible: true });
      timerRef.current = window.setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, duration);
    },
    [duration],
  );

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { toast, showToast };
}
