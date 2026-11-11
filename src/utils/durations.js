/**
 * Finds cooking times in recipe steps ("cook for 12 mins", "simmer 1 hour 30
 * minutes", "bake 20–25 minutes", "rest for five minutes") so cooking mode
 * can offer a one-tap timer.
 */
const NUMBER_WORDS = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, 'forty-five': 45,
  fifty: 50, sixty: 60, ninety: 90,
};

const NUMBER = `(\\d+(?:[.,]\\d+)?|${Object.keys(NUMBER_WORDS).sort((a, b) => b.length - a.length).join('|')})`;
const UNIT = '(hours?|hrs?|minutes?|mins?|seconds?|secs?)';

const HOURS_AND_MINUTES = /\b(\d+)\s*(?:hours?|hrs?)\s*(?:and\s*)?(\d+)\s*(?:minutes?|mins?)\b/gi;
const HALF_AN_HOUR = /\bhalf an? hour\b/gi;
const SIMPLE = new RegExp(`\\b${NUMBER}(?:\\s*(?:-|–|to)\\s*${NUMBER})?\\s*${UNIT}\\b`, 'gi');

const MIN_MS = 5 * 1000;
const MAX_MS = 24 * 60 * 60 * 1000;

function toNumber(text) {
  const lower = text.toLowerCase();
  return NUMBER_WORDS[lower] ?? Number.parseFloat(lower.replace(',', '.'));
}

function unitMs(unit) {
  const lower = unit.toLowerCase();
  if (lower.startsWith('h')) return 60 * 60 * 1000;
  if (lower.startsWith('m')) return 60 * 1000;
  return 1000;
}

function formatDuration(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours) parts.push(`${hours} hr`);
  if (minutes) parts.push(`${minutes} min`);
  if (seconds && !hours) parts.push(`${seconds} sec`);
  return parts.join(' ') || '0 sec';
}

/** Countdown display: 1:05:09, 12:00, 0:42. */
export function formatClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}` : `${minutes}:${seconds}`;
}

/** Returns [{ ms, label }] for every distinct duration mentioned in the text. */
export function findDurations(text) {
  if (!text) return [];
  const found = [];
  const taken = [];
  const overlaps = (start, end) => taken.some(([s, e]) => start < e && end > s);
  const add = (match, ms, label) => {
    const start = match.index;
    const end = start + match[0].length;
    if (overlaps(start, end)) return;
    taken.push([start, end]);
    if (ms >= MIN_MS && ms <= MAX_MS) found.push({ ms, label });
  };

  for (const match of text.matchAll(HOURS_AND_MINUTES)) {
    const ms = Number(match[1]) * 3600000 + Number(match[2]) * 60000;
    add(match, ms, formatDuration(ms));
  }
  for (const match of text.matchAll(HALF_AN_HOUR)) add(match, 30 * 60000, '30 min');
  for (const match of text.matchAll(SIMPLE)) {
    const low = toNumber(match[1]);
    const high = match[2] ? toNumber(match[2]) : null;
    if (!Number.isFinite(low)) continue;
    const ms = Math.round(low * unitMs(match[3]));
    const isRange = high !== null && high > low;
    // For ranges ("20–25 minutes") time the lower bound so the cook can check early.
    add(match, ms, isRange ? formatRangeLabel(low, high, match[3]) : formatDuration(ms));
  }

  const unique = new Map();
  for (const duration of found) if (!unique.has(duration.ms)) unique.set(duration.ms, duration);
  return [...unique.values()];
}

function formatRangeLabel(low, high, unit) {
  const lower = unit.toLowerCase();
  const short = lower.startsWith('h') ? 'hr' : lower.startsWith('m') ? 'min' : 'sec';
  return `${low}–${high} ${short}`;
}
