import { useEffect, useState } from 'react';

const isSupported = () => typeof navigator !== 'undefined' && 'wakeLock' in navigator;

/**
 * Keeps the screen on while `enabled` (Screen Wake Lock API). The browser
 * releases the lock when the page is hidden, so it is re-requested when the
 * page becomes visible again. Returns 'active', 'pending', 'unsupported' or 'denied'.
 */
export function useWakeLock(enabled) {
  const [status, setStatus] = useState(() => (isSupported() ? 'pending' : 'unsupported'));

  useEffect(() => {
    if (!enabled || !isSupported()) return undefined;
    let sentinel = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (cancelled) {
          lock.release();
          return;
        }
        sentinel = lock;
        setStatus('active');
        lock.addEventListener('release', () => {
          if (!cancelled) setStatus('pending');
        });
      } catch {
        if (!cancelled) setStatus('denied');
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && (!sentinel || sentinel.released)) request();
    };

    request();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      sentinel?.release();
    };
  }, [enabled]);

  return status;
}
