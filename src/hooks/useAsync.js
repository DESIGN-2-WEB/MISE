import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async task and tracks its status. Pass a memoised task (useCallback /
 * useMemo); it re-runs whenever the task identity changes. Pass `null` to stay
 * idle. Results always belong to the current task: while a new task is
 * starting it reports "loading", and results from superseded runs are ignored.
 */
export function useAsync(task) {
  const [state, setState] = useState({ task: null, status: 'idle', data: undefined, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!task) return undefined;

    let cancelled = false;
    setState({ task, status: 'loading', data: undefined, error: null });
    task().then(
      (data) => {
        if (!cancelled) setState({ task, status: 'success', data, error: null });
      },
      (error) => {
        if (!cancelled) setState({ task, status: 'error', data: undefined, error });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [task, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  if (!task) return { status: 'idle', data: undefined, error: null, retry };
  if (state.task !== task) return { status: 'loading', data: undefined, error: null, retry };
  return { status: state.status, data: state.data, error: state.error, retry };
}
