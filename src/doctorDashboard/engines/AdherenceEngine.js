import { ASSESSMENT_INTERVAL_DAYS } from '../config/operationalConfig.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// 2026-08-27 BUGFIX (Detection Assessment date/time audit -- same issue as
// app_page's WeeklyAdherenceEngine.js, this is the doctor-facing mirror of
// it). `new Date('2026-08-08')` parses a date-only string as UTC midnight,
// not local midnight -- comparing that against a real local `now` (and
// formatting a result with .toISOString(), which converts BACK to UTC
// before slicing) could shift "days since last" and "next due" by a day
// for any patient/doctor not in UTC, exactly the "correct date... or it
// can't be presented to the doctor properly" gap this audit was checking
// for. Both the input parse and the output format now stay in local
// calendar terms throughout, never round-tripping through UTC.
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Computes how many days since the last completed session and whether the
// patient is overdue for their next assessment under NEUROMORPH's standard
// cadence. Pure function of (lastSessionDate, now) so it's trivially
// testable with a fixed "now".
export const AdherenceEngine = {
  evaluate(lastSessionDateStr, now = new Date(), intervalDays = ASSESSMENT_INTERVAL_DAYS) {
    if (!lastSessionDateStr) {
      return { daysSinceLast: undefined, overdue: false, nextDueDate: undefined };
    }
    const lastDate = parseLocalDate(lastSessionDateStr);
    const daysSinceLast = Math.round((startOfLocalDay(now).getTime() - lastDate.getTime()) / MS_PER_DAY);
    const nextDue = new Date(lastDate.getTime() + intervalDays * MS_PER_DAY);
    return {
      daysSinceLast,
      overdue: daysSinceLast > intervalDays,
      nextDueDate: toLocalIsoDate(nextDue),
    };
  },
};
