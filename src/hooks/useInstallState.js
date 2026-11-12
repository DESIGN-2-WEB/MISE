import { useSyncExternalStore } from 'react';
import { getInstallState, getServerInstallState, subscribeToInstallState } from '../utils/pwa';

/** 'prompt' | 'ios' | 'installed' | 'unsupported' (see utils/pwa.js). */
export function useInstallState() {
  return useSyncExternalStore(subscribeToInstallState, getInstallState, getServerInstallState);
}

/** True when an "Install app" button would work in this browser. */
export function useCanInstall() {
  const state = useInstallState();
  return state === 'prompt' || state === 'ios';
}
