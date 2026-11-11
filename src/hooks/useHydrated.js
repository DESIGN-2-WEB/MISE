import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False on the server and while hydrating, true afterwards. Use it for output
 * that depends on the visitor's clock or device, such as "today".
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
