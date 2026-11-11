import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 250;

/** Three short beeps using Web Audio, so no sound file is needed. */
function playAlarm(context) {
  if (!context) return;
  const start = context.currentTime;
  for (let i = 0; i < 3; i++) {
    const at = start + i * 0.6;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.4, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.45);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.5);
  }
}

/**
 * Kitchen timers. Remaining time is derived from an end timestamp, so timers
 * stay accurate even if the browser throttles the page in the background.
 */
export function useTimers() {
  const [timers, setTimers] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const timersRef = useRef(timers);
  const audioRef = useRef(null);
  const nextIdRef = useRef(1);

  useEffect(() => {
    timersRef.current = timers;
  });

  const hasRunning = timers.some((timer) => timer.status === 'running');

  useEffect(() => {
    if (!hasRunning) return undefined;
    const interval = window.setInterval(() => {
      const current = Date.now();
      const due = timersRef.current.filter((timer) => timer.status === 'running' && timer.endAt <= current);
      if (due.length > 0) {
        const dueIds = new Set(due.map((timer) => timer.id));
        setTimers((previous) =>
          previous.map((timer) => (dueIds.has(timer.id) ? { ...timer, status: 'done', remainingMs: 0 } : timer)),
        );
        playAlarm(audioRef.current);
        navigator.vibrate?.([300, 150, 300, 150, 300]);
      }
      setNow(current);
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [hasRunning]);

  useEffect(
    () => () => {
      audioRef.current?.close?.();
    },
    [],
  );

  const startTimer = useCallback(({ ms, label, stepIndex }) => {
    // Audio can only start after a user gesture; starting a timer is one.
    if (!audioRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioRef.current = AudioContext ? new AudioContext() : null;
    }
    audioRef.current?.resume?.();

    const current = Date.now();
    setNow(current);
    setTimers((previous) => {
      const existing = previous.find(
        (timer) => timer.stepIndex === stepIndex && timer.durationMs === ms && timer.status !== 'done',
      );
      if (existing) return previous;
      const id = nextIdRef.current++;
      return [...previous, { id, label, stepIndex, durationMs: ms, endAt: current + ms, remainingMs: ms, status: 'running' }];
    });
  }, []);

  const toggleTimer = useCallback((id) => {
    const current = Date.now();
    setNow(current);
    setTimers((previous) =>
      previous.map((timer) => {
        if (timer.id !== id || timer.status === 'done') return timer;
        return timer.status === 'running'
          ? { ...timer, status: 'paused', remainingMs: Math.max(0, timer.endAt - current) }
          : { ...timer, status: 'running', endAt: current + timer.remainingMs };
      }),
    );
  }, []);

  const removeTimer = useCallback((id) => {
    setTimers((previous) => previous.filter((timer) => timer.id !== id));
  }, []);

  const withRemaining = timers.map((timer) => ({
    ...timer,
    remainingMs: timer.status === 'running' ? Math.max(0, timer.endAt - now) : timer.remainingMs,
  }));

  return { timers: withRemaining, hasRunning, startTimer, toggleTimer, removeTimer };
}
