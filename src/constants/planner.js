/** Days of the meal plan, Monday first. `jsDay` matches Date#getDay(). */
export const DAYS = [
  { id: 'mon', label: 'Monday', short: 'Mon', jsDay: 1 },
  { id: 'tue', label: 'Tuesday', short: 'Tue', jsDay: 2 },
  { id: 'wed', label: 'Wednesday', short: 'Wed', jsDay: 3 },
  { id: 'thu', label: 'Thursday', short: 'Thu', jsDay: 4 },
  { id: 'fri', label: 'Friday', short: 'Fri', jsDay: 5 },
  { id: 'sat', label: 'Saturday', short: 'Sat', jsDay: 6 },
  { id: 'sun', label: 'Sunday', short: 'Sun', jsDay: 0 },
];

export function getTodayId() {
  const today = new Date().getDay();
  return DAYS.find((day) => day.jsDay === today).id;
}

export function getDayLabel(dayId) {
  return DAYS.find((day) => day.id === dayId)?.label ?? dayId;
}
