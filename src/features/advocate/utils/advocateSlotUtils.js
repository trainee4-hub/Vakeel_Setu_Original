/**
 * Timezone-safe slot generator for Advocate Bookings.
 * Timezone is strictly Asia/Kolkata (UTC + 05:30).
 * Working window: 10:00 to 18:00 IST with a 13:00 to 14:00 IST lunch break.
 */

const IST_OFFSET_STR = "+05:30";

/**
 * Pads a single-digit number with leading zero.
 */
function pad(num) {
  return String(num).padStart(2, "0");
}

/**
 * Formats 24h hour & minute to 12h display string e.g. "10:15 AM".
 */
export function formatTime12h(hour, minute) {
  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${pad(displayHour)}:${pad(minute)} ${meridiem}`;
}

/**
 * Determines the period for grouping:
 * Morning: < 12:00 IST
 * Afternoon: 12:00 - 15:00 IST
 * Evening: >= 15:00 IST
 */
export function getPeriodForHour(hour) {
  if (hour < 12) return "Morning";
  if (hour < 15) return "Afternoon";
  return "Evening";
}

/**
 * Generates all time slots for a given date string (YYYY-MM-DD) in Asia/Kolkata.
 * 
 * @param {Object} options
 * @param {string} options.dateString - 'YYYY-MM-DD'
 * @param {number} [options.durationMinutes=15] - Slot duration in minutes (e.g. 15 for voice/video, 60 for in-person)
 * @param {Array<{startAt: string, endAt: string}>} [options.busySlots=[]] - Array of busy intervals
 * @param {number} [options.minLeadMinutes=15] - Minimum minutes in advance a slot must start
 * @param {number} [options.currentEpochMs=Date.now()] - Current epoch ms (injectable for testing)
 * 
 * @returns {Array<{
 *   startAt: string,
 *   endAt: string,
 *   startEpochMs: number,
 *   endEpochMs: number,
 *   label: string,
 *   period: 'Morning' | 'Afternoon' | 'Evening',
 *   isBusy: boolean,
 *   isPastOrLead: boolean,
 *   disabled: boolean,
 *   reason?: string
 * }>}
 */
export function generateAdvocateSlots({
  dateString,
  durationMinutes = 15,
  busySlots = [],
  minLeadMinutes = 15,
  currentEpochMs = Date.now(),
}) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return [];
  }

  const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 15;
  const leadLimitEpochMs = currentEpochMs + minLeadMinutes * 60 * 1000;

  // Convert busy intervals to absolute epoch milliseconds
  const parsedBusyIntervals = (Array.isArray(busySlots) ? busySlots : []).map((b) => ({
    startMs: Date.parse(b.startAt),
    endMs: Date.parse(b.endAt),
  })).filter((b) => !isNaN(b.startMs) && !isNaN(b.endMs));

  // Sessions in minutes from start of IST day
  // Morning session: 10:00 (600m) to 13:00 (780m)
  // Afternoon/Evening session: 14:00 (840m) to 18:00 (1080m)
  const sessions = [
    { startM: 10 * 60, endM: 13 * 60 },
    { startM: 14 * 60, endM: 18 * 60 },
  ];

  const slots = [];

  for (const session of sessions) {
    let currentSlotStartM = session.startM;

    while (currentSlotStartM + duration <= session.endM) {
      const startHour = Math.floor(currentSlotStartM / 60);
      const startMin = currentSlotStartM % 60;

      const currentSlotEndM = currentSlotStartM + duration;
      const endHour = Math.floor(currentSlotEndM / 60);
      const endMin = currentSlotEndM % 60;

      // Construct canonical ISO string with +05:30 IST offset
      const startAt = `${dateString}T${pad(startHour)}:${pad(startMin)}:00${IST_OFFSET_STR}`;
      const endAt = `${dateString}T${pad(endHour)}:${pad(endMin)}:00${IST_OFFSET_STR}`;

      const startEpochMs = Date.parse(startAt);
      const endEpochMs = Date.parse(endAt);

      // Label: e.g. "10:00 AM – 10:15 AM IST"
      const label = `${formatTime12h(startHour, startMin)} – ${formatTime12h(endHour, endMin)} IST`;
      const period = getPeriodForHour(startHour);

      // Overlap rule: slotStart < busyEnd && slotEnd > busyStart
      const isBusy = parsedBusyIntervals.some(
        (b) => startEpochMs < b.endMs && endEpochMs > b.startMs
      );

      // Lead time / past rule
      const isPastOrLead = startEpochMs < leadLimitEpochMs;

      const disabled = isBusy || isPastOrLead;
      let reason = null;
      if (isBusy) reason = "Already booked";
      else if (isPastOrLead) reason = "Past slot or inside lead time";

      slots.push({
        startAt,
        endAt,
        startEpochMs,
        endEpochMs,
        label,
        period,
        isBusy,
        isPastOrLead,
        disabled,
        reason,
      });

      currentSlotStartM += duration;
    }
  }

  return slots;
}

/**
 * Groups slots by Morning, Afternoon, Evening.
 */
export function groupAdvocateSlots(slots) {
  const groups = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };

  for (const slot of slots) {
    if (groups[slot.period]) {
      groups[slot.period].push(slot);
    }
  }

  return groups;
}

/**
 * Gets date range array from today to maxDaysAhead in Asia/Kolkata calendar.
 */
export function getAvailableDatesList(maxDaysAhead = 30) {
  const dates = [];
  const now = new Date();

  // Get current date string in Asia/Kolkata
  const istFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayISTStr = istFormatter.format(now); // "YYYY-MM-DD"
  const [todayY, todayM, todayD] = todayISTStr.split("-").map(Number);

  for (let i = 0; i <= maxDaysAhead; i++) {
    // Construct each date incrementing day from today IST base
    const d = new Date(Date.UTC(todayY, todayM - 1, todayD + i, 12, 0, 0));
    const dateStr = d.toISOString().split("T")[0];

    const displayFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    dates.push({
      dateString: dateStr,
      display: displayFormatter.format(d),
      isToday: i === 0,
    });
  }

  return dates;
}
