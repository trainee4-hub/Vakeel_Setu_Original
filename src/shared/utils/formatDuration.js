/**
 * Formats a duration in minutes into a human-readable hours & minutes string.
 * Examples:
 * - 105 -> "1 hour 45 minutes"
 * - 60  -> "1 hour"
 * - 120 -> "2 hours"
 * - 55  -> "55 minutes" (or "55 min" when subHourUnit is "min")
 */
export function formatDurationHuman(totalMinutes, { subHourUnit = "minutes" } = {}) {
  const mins = Math.round(Number(totalMinutes));
  if (!Number.isFinite(mins) || mins <= 0) return "";
  if (mins < 60) {
    return `${mins} ${mins === 1 ? "minute" : subHourUnit}`;
  }
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  const hrLabel = `${hrs} ${hrs === 1 ? "hour" : "hours"}`;
  if (rem === 0) return hrLabel;
  return `${hrLabel} ${rem} ${rem === 1 ? "minute" : "minutes"}`;
}

