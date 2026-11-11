import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Carrot,
  ChevronLeft,
  ChevronRight,
  Monitor,
  MonitorOff,
  Pause,
  Play,
  PartyPopper,
  RotateCcw,
  Timer,
  X,
} from 'lucide-react';
import { useTimers } from '../../hooks/useTimers';
import { useWakeLock } from '../../hooks/useWakeLock';
import { findDurations, formatClock } from '../../utils/durations';
import IngredientList from './IngredientList';

const SWIPE_THRESHOLD_PX = 60;

const WAKE_LOCK_TEXT = {
  active: { icon: Monitor, text: 'Screen stays on' },
  pending: { icon: Monitor, text: 'Keeping screen on…' },
  unsupported: { icon: MonitorOff, text: 'Keep your screen on manually' },
  denied: { icon: MonitorOff, text: "Couldn't keep the screen on" },
};

function TimerTray({ timers, onToggle, onRemove }) {
  return (
    <section className="timer-tray" aria-label="Timers">
      {timers.map((timer) => (
        <div key={timer.id} className={`timer timer--${timer.status}`} role="timer">
          <Timer size={18} aria-hidden="true" />
          <span className="timer__label">
            Step {timer.stepIndex + 1} · {timer.label}
          </span>
          <span className="timer__clock" aria-live={timer.status === 'done' ? 'assertive' : 'off'}>
            {timer.status === 'done' ? "Time's up!" : formatClock(timer.remainingMs)}
          </span>
          {timer.status !== 'done' && (
            <button
              type="button"
              className="timer__button"
              aria-label={timer.status === 'running' ? 'Pause timer' : 'Resume timer'}
              onClick={() => onToggle(timer.id)}
            >
              {timer.status === 'running' ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>
          )}
          <button type="button" className="timer__button" aria-label="Dismiss timer" onClick={() => onRemove(timer.id)}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </section>
  );
}

/**
 * Full-screen, step-by-step cooking view: large text, swipe or arrow keys to
 * move between steps, one-tap timers for any times mentioned in a step, and
 * the screen kept awake while it is open.
 */
function CookingMode({ recipe, checkedIngredients, onToggleIngredient, onExit }) {
  const steps = recipe.steps;
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const { timers, hasRunning, startTimer, toggleTimer, removeTimer } = useTimers();
  const wakeLock = WAKE_LOCK_TEXT[useWakeLock(true)];
  const pointerStartRef = useRef(null);

  const step = steps[stepIndex];
  const durations = useMemo(() => findDurations(step), [step]);
  const isLastStep = stepIndex === steps.length - 1;

  const goNext = () => {
    if (finished) return;
    if (isLastStep) setFinished(true);
    else setStepIndex((index) => index + 1);
  };
  const goPrevious = () => {
    if (finished) setFinished(false);
    else setStepIndex((index) => Math.max(0, index - 1));
  };

  const requestExit = () => {
    if (hasRunning && !window.confirm('You have timers running. Leave cooking mode and stop them?')) return;
    onExit();
  };

  // Latest handlers for the keyboard listener, without re-subscribing every render.
  const handlersRef = useRef(null);
  useEffect(() => {
    handlersRef.current = { goNext, goPrevious, requestExit };
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!handlersRef.current || event.target.matches?.('input[type="text"], input[type="search"], textarea')) return;
      if (event.key === 'ArrowRight') handlersRef.current.goNext();
      else if (event.key === 'ArrowLeft') handlersRef.current.goPrevious();
      else if (event.key === 'Escape') handlersRef.current.requestExit();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show the nearest running timer in the tab title, so it is visible from other tabs.
  const nextTimer = timers
    .filter((timer) => timer.status === 'running')
    .sort((a, b) => a.remainingMs - b.remainingMs)[0];
  const tabTitle = nextTimer ? `⏱ ${formatClock(nextTimer.remainingMs)} · ${recipe.title}` : null;
  useEffect(() => {
    if (!tabTitle) return undefined;
    const previousTitle = document.title;
    document.title = tabTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [tabTitle]);

  const WakeIcon = wakeLock.icon;
  const progress = finished ? 100 : ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="cooking">
      <header className="cooking__header">
        <button type="button" className="cooking__icon-button" aria-label="Exit cooking mode" onClick={requestExit}>
          <X size={22} aria-hidden="true" />
        </button>
        <div className="cooking__heading">
          <p className="cooking__eyebrow">Cooking mode</p>
          <h2 className="cooking__title" id="recipe-modal-title">
            {recipe.title}
          </h2>
        </div>
        <button
          type="button"
          className={`btn btn--ghost btn--sm${showIngredients ? ' is-active' : ''}`}
          aria-expanded={showIngredients}
          aria-controls="cooking-ingredients"
          onClick={() => setShowIngredients((open) => !open)}
        >
          <Carrot size={16} aria-hidden="true" />
          Ingredients
        </button>
      </header>

      <div
        className="cooking__progress"
        role="progressbar"
        aria-label="Recipe progress"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={finished ? steps.length : stepIndex + 1}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="cooking__body">
        {showIngredients && (
          <aside className="cooking__ingredients" id="cooking-ingredients" aria-label="Ingredients">
            <IngredientList
              ingredients={recipe.ingredients}
              checked={checkedIngredients}
              onToggle={onToggleIngredient}
              compact
            />
          </aside>
        )}

        <div
          className="cooking__stage"
          onPointerDown={(event) => {
            pointerStartRef.current = event.clientX;
          }}
          onPointerUp={(event) => {
            if (pointerStartRef.current === null) return;
            const distance = event.clientX - pointerStartRef.current;
            pointerStartRef.current = null;
            if (distance <= -SWIPE_THRESHOLD_PX) goNext();
            else if (distance >= SWIPE_THRESHOLD_PX) goPrevious();
          }}
        >
          {finished ? (
            <div className="cooking__finished">
              <PartyPopper size={48} aria-hidden="true" />
              <p className="cooking__step">All done — enjoy your meal!</p>
              <div className="cooking__timer-actions">
                <button type="button" className="btn btn--primary" onClick={requestExit}>
                  Back to recipe
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setFinished(false);
                    setStepIndex(0);
                  }}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Start again
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="cooking__step-count">
                Step {stepIndex + 1} of {steps.length}
              </p>
              <p className="cooking__step" key={stepIndex} aria-live="polite">
                {step}
              </p>
              {durations.length > 0 && (
                <div className="cooking__timer-actions">
                  {durations.map((duration) => (
                    <button
                      key={duration.ms}
                      type="button"
                      className="btn btn--primary"
                      onClick={() => startTimer({ ms: duration.ms, label: duration.label, stepIndex })}
                    >
                      <Timer size={18} aria-hidden="true" />
                      Start {duration.label} timer
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {timers.length > 0 && <TimerTray timers={timers} onToggle={toggleTimer} onRemove={removeTimer} />}

      <footer className="cooking__nav">
        <button
          type="button"
          className="btn btn--ghost cooking__nav-button"
          onClick={goPrevious}
          disabled={stepIndex === 0 && !finished}
        >
          <ChevronLeft size={20} aria-hidden="true" />
          Previous
        </button>
        <p className="cooking__wake">
          <WakeIcon size={14} aria-hidden="true" />
          {wakeLock.text}
        </p>
        <button
          type="button"
          className="btn btn--primary cooking__nav-button"
          onClick={goNext}
          disabled={finished}
          // Focus lands here when cooking mode opens, ready for Enter / Space.
          autoFocus
        >
          {isLastStep ? 'Finish' : 'Next'}
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </footer>
    </div>
  );
}

export default CookingMode;
