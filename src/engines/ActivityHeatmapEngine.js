import { DailyTaskEngine } from './DailyTaskEngine.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDateOnly(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Turns completion fraction into a 0-4 intensity bucket for the calendar
// heatmap -- same 5-step scale a GitHub-style contribution graph uses, so
// it reads instantly without a legend.
function intensityFor(fraction) {
  if (fraction <= 0) return 0;
  if (fraction < 0.5) return 1;
  if (fraction < 0.75) return 2;
  if (fraction < 1) return 3;
  return 4;
}

// Builds a calendar-style activity heatmap (like the streak/momentum
// engines, reads raw {date, completion} day records -- never invents a day
// that isn't in the log). Weeks run Sunday -> Saturday; any calendar day in
// range with no matching log entry renders as an empty (hasData: false)
// cell rather than a fabricated zero, so a gap in the data is visibly a
// gap, not indistinguishable from "did nothing that day".
export const ActivityHeatmapEngine = {
  build(activityLog = [], { weeks = 12, asOf } = {}) {
    const byDate = new Map(activityLog.filter((d) => d?.date).map((d) => [d.date, d]));

    let end;
    if (asOf) {
      end = toDateOnly(new Date(asOf));
    } else if (activityLog.length > 0) {
      const latest = activityLog.reduce((max, d) => (d.date > max ? d.date : max), activityLog[0].date);
      end = toDateOnly(new Date(latest));
    } else {
      end = toDateOnly(new Date());
    }
    // Extend to the end of that week (Saturday) so the grid always ends on
    // a full week boundary.
    end = new Date(end.getTime() + (6 - end.getUTCDay()) * MS_PER_DAY);

    const totalDays = weeks * 7;
    const start = new Date(end.getTime() - (totalDays - 1) * MS_PER_DAY);

    const cells = [];
    for (let i = 0; i < totalDays; i++) {
      const day = new Date(start.getTime() + i * MS_PER_DAY);
      const dateStr = isoDate(day);
      const entry = byDate.get(dateStr);
      if (!entry) {
        cells.push({ date: dateStr, hasData: false, intensity: 0, completionPct: 0 });
        continue;
      }
      const fraction = DailyTaskEngine.completionFraction(entry.completion);
      cells.push({ date: dateStr, hasData: true, intensity: intensityFor(fraction), completionPct: Math.round(fraction * 100) });
    }

    const weeksGrid = [];
    for (let w = 0; w < weeks; w++) {
      weeksGrid.push(cells.slice(w * 7, w * 7 + 7));
    }

    const activeDays = cells.filter((c) => c.hasData && c.intensity > 0).length;
    const trackedDays = cells.filter((c) => c.hasData).length;

    return { weeks: weeksGrid, activeDays, trackedDays, startDate: isoDate(start), endDate: isoDate(end) };
  },

  // A full calendar-year view for the Activity page. Future dates remain
  // visibly unrecorded rather than being represented as missed activity,
  // so a patient can see the runway through December without fabricated
  // results.
  buildCalendarYear(activityLog = [], { year = new Date().getUTCFullYear() } = {}) {
    const byDate = new Map(activityLog.filter((d) => d?.date).map((d) => [d.date, d]));
    const firstDay = new Date(Date.UTC(year, 0, 1));
    const lastDay = new Date(Date.UTC(year, 11, 31));
    const start = new Date(firstDay.getTime() - firstDay.getUTCDay() * MS_PER_DAY);
    const end = new Date(lastDay.getTime() + (6 - lastDay.getUTCDay()) * MS_PER_DAY);
    const cells = [];
    for (let day = new Date(start); day <= end; day = new Date(day.getTime() + MS_PER_DAY)) {
      const date = isoDate(day);
      const entry = byDate.get(date);
      const withinYear = day >= firstDay && day <= lastDay;
      if (!withinYear || !entry) {
        cells.push({ date, hasData: false, intensity: 0, completionPct: 0, withinYear });
        continue;
      }
      const fraction = DailyTaskEngine.completionFraction(entry.completion);
      cells.push({ date, hasData: true, intensity: intensityFor(fraction), completionPct: Math.round(fraction * 100), withinYear: true });
    }
    const weeks = [];
    for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
    const inYearCells = cells.filter((cell) => cell.withinYear);
    const tracked = inYearCells.filter((cell) => cell.hasData);
    const activeDays = tracked.filter((cell) => cell.intensity > 0).length;
    const averageCompletionPct = tracked.length
      ? Math.round(tracked.reduce((sum, cell) => sum + cell.completionPct, 0) / tracked.length)
      : 0;
    return { weeks, activeDays, trackedDays: tracked.length, averageCompletionPct, startDate: isoDate(firstDay), endDate: isoDate(lastDay), calendarYear: year };
  },
};
