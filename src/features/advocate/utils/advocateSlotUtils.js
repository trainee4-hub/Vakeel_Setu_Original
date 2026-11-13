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
  return `${displayHour}:${pad(minute)} ${meridiem}`;
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
  stepMinutes = 15,
  busySlots = [],
  minLeadMinutes = 15,
  currentEpochMs = Date.now(),
}) {
  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return [];
  }

  const duration = Number(durationMinutes) > 0 ? Number(durationMinutes) : 15;
  const step = Number(stepMinutes) > 0 ? Number(stepMinutes) : 15;
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

    while (currentSlotStartM < session.endM) {
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

      // Label: e.g. "10:00 AM – 10:15 AM"
      const label = `${formatTime12h(startHour, startMin)} – ${formatTime12h(endHour, endMin)}`;
      const period = getPeriodForHour(startHour);

      // Overlap rule: slotStart < busyEnd && slotEnd > busyStart
      const isBusy = parsedBusyIntervals.some(
        (b) => startEpochMs < b.endMs && endEpochMs > b.startMs
      );

      // Lead time / past rule
      const isPastOrLead = startEpochMs < leadLimitEpochMs;

      // Runs past the session working window rule
      const runsPastWindow = currentSlotEndM > session.endM;

      const disabled = isBusy || isPastOrLead || runsPastWindow;
      let reason = null;
      if (isBusy) reason = "Already booked";
      else if (isPastOrLead) reason = "Past slot or inside lead time";
      else if (runsPastWindow) reason = "Runs past working hours";

      slots.push({
        startAt,
        endAt,
        startEpochMs,
        endEpochMs,
        label,
        period,
        isBusy,
        isPastOrLead,
        runsPastWindow,
        disabled,
        reason,
      });

      currentSlotStartM += step;
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

/**
 * Returns today's date in YYYY-MM-DD for Asia/Kolkata timezone.
 */
export function getTodayISTDateString() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Adds N days to a YYYY-MM-DD date string.
 */
export function addDaysToISTDateString(dateStr, days) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return date.toISOString().split("T")[0];
}

/**
 * Formats YYYY-MM-DD to long human-readable date in Asia/Kolkata.
 * E.g. "Tuesday, 27 Oct 2026"
 */
export function formatISTDateLong(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formats slot start time string to 12h display without padding e.g. "5:30 PM".
 */
export function formatSlotStartTime(startAt) {
  if (!startAt) return "";
  const timePart = startAt.split("T")[1];
  if (!timePart) return "";
  const [hourStr, minStr] = timePart.split(":");
  const hour = Number(hourStr);
  const min = Number(minStr);
  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${pad(min)} ${meridiem}`;
}

/**
 * Formats slot range with full start and end time without leading zeros e.g. "4:15 PM – 4:30 PM".
 */
export function formatSlotStartEndTime(startAt, endAt) {
  if (!startAt) return "";
  const startStr = formatSlotStartTime(startAt);
  if (!endAt) return startStr;
  const endStr = formatSlotStartTime(endAt);
  return `${startStr} – ${endStr}`;
}

/**
 * Formats duration in minutes into a clean compact string for steppers/badges:
 * Examples: 15 -> "15 min", 60 -> "1 hr", 75 -> "1 hr 15 min", 120 -> "2 hrs"
 */
export function formatStepperDuration(minutes) {
  const m = Number(minutes) || 15;
  if (m < 60) return `${m} min`;
  const hrs = Math.floor(m / 60);
  const rem = m % 60;
  const hrLabel = `${hrs} hr${hrs > 1 ? "s" : ""}`;
  return rem > 0 ? `${hrLabel} ${rem} min` : hrLabel;
}

/**
 * Extracts IST (Asia/Kolkata) date string and minutes from midnight for an epoch ms.
 */
export function getISTTimeComponents(epochMs) {
  const d = new Date(epochMs);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  const dateStr = `${map.year}-${map.month}-${map.day}`;
  const hour = Number(map.hour);
  const minute = Number(map.minute);
  const minutesFromMidnight = hour * 60 + minute;
  return { dateStr, hour, minute, minutesFromMidnight };
}

/**
 * Formats a slot range in IST (Asia/Kolkata).
 * E.g., "10:00 – 10:30 AM" or "11:45 AM – 12:15 PM"
 * If durationMinutes is given and endAt is not, computes endAt.
 */
export function formatSlotRange(startAt, endAt, durationMinutes) {
  if (!startAt) return "";
  try {
    const startMs = Date.parse(startAt);
    if (isNaN(startMs)) return String(startAt);
    let endMs = endAt ? Date.parse(endAt) : NaN;
    if (isNaN(endMs) && durationMinutes) {
      endMs = startMs + Number(durationMinutes) * 60 * 1000;
    }
    if (isNaN(endMs)) {
      return formatSlotStartTime(startAt);
    }

    const start = new Date(startMs);
    const end = new Date(endMs);

    const startFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const endFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const startParts = startFormatter.formatToParts(start);
    const endParts = endFormatter.formatToParts(end);

    const getPart = (parts, type) => parts.find((p) => p.type === type)?.value || "";
    const startHour = getPart(startParts, "hour");
    const startMin = getPart(startParts, "minute");
    const startDayPeriod = getPart(startParts, "dayPeriod");

    const endHour = getPart(endParts, "hour");
    const endMin = getPart(endParts, "minute");
    const endDayPeriod = getPart(endParts, "dayPeriod");

    if (startDayPeriod && endDayPeriod && startDayPeriod.toUpperCase() === endDayPeriod.toUpperCase()) {
      return `${startHour}:${startMin} – ${endHour}:${endMin} ${endDayPeriod.toUpperCase()}`;
    }

    return `${startHour}:${startMin} ${startDayPeriod.toUpperCase()} – ${endHour}:${endMin} ${endDayPeriod.toUpperCase()}`;
  } catch {
    return String(startAt);
  }
}

/**
 * Evaluates whether extending a booking by stepMinutes (default 15) is allowed.
 * Conditions for +15 to be enabled:
 * 1. The next 15 minutes are free: check the busy-slots intervals with newEnd > busy.startAt && startAt < busy.endAt
 * 2. The new end is inside the working window for that day (10:00-13:00 or 14:00-18:00 IST) and before lunch break
 * 3. The new end is on the same day (not past midnight)
 *
 * Returns { available: true } or { available: false, reason: string }
 */
export function checkNextStepAvailable({
  startAt,
  currentDurationMinutes = 15,
  stepMinutes = 15,
  busySlots = [],
}) {
  if (!startAt) return { available: false, reason: "No slot selected" };

  const startMs = Date.parse(startAt);
  if (isNaN(startMs)) return { available: false, reason: "Invalid slot time" };

  const newDuration = Number(currentDurationMinutes) + Number(stepMinutes);
  if (!Number.isFinite(newDuration) || newDuration > 180) {
    return { available: false, reason: "Maximum consultation duration is 3 hours" };
  }
  const newEndMs = startMs + newDuration * 60 * 1000;

  // Extract IST components
  const startIST = getISTTimeComponents(startMs);
  const newEndIST = getISTTimeComponents(newEndMs);

  // 1. Same day check (not past midnight)
  if (newEndIST.dateStr !== startIST.dateStr) {
    return { available: false, reason: "Outside working hours" };
  }

  // 2. Working window check:
  // Morning session: 10:00 (600m) to 13:00 (780m)
  // Afternoon session: 14:00 (840m) to 18:00 (1080m)
  // Lunch break: 13:00 to 14:00
  const startM = startIST.minutesFromMidnight;
  const newEndM = newEndIST.minutesFromMidnight;

  let sessionEndM = 1080; // default 18:00
  if (startM < 780) {
    // Started in morning session: must end by 13:00 (780m) before lunch
    sessionEndM = 780;
  } else if (startM >= 840) {
    // Started in afternoon session: must end by 18:00 (1080m)
    sessionEndM = 1080;
  } else {
    // Started during lunch or outside standard session
    return { available: false, reason: "Outside working hours" };
  }

  if (newEndM > sessionEndM) {
    return { available: false, reason: "Outside working hours" };
  }

  // 3. Busy slots overlap check: newEnd > busy.startAt && startAt < busy.endAt
  const parsedBusyIntervals = (Array.isArray(busySlots) ? busySlots : [])
    .map((b) => ({
      startAt: b.startAt,
      startMs: Date.parse(b.startAt),
      endMs: Date.parse(b.endAt),
    }))
    .filter((b) => !isNaN(b.startMs) && !isNaN(b.endMs));

  const conflictingBusySlots = parsedBusyIntervals.filter(
    (b) => newEndMs > b.startMs && startMs < b.endMs
  );

  if (conflictingBusySlots.length > 0) {
    // Find the earliest conflicting busy slot
    conflictingBusySlots.sort((a, b) => a.startMs - b.startMs);
    const earliestConflicting = conflictingBusySlots[0];
    const busyStartTime = formatSlotStartTime(earliestConflicting.startAt);
    return {
      available: false,
      reason: `The advocate is busy after ${busyStartTime}`,
    };
  }

  return { available: true, reason: null };
}

/**
 * Generates calendar weeks matrix for a given year & month (0-indexed month).
 */
export function getCalendarMonthMatrix(year, monthIndex) {
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const startingDayOfWeek = firstDay.getUTCDay(); // 0 = Sun ... 6 = Sat
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  const weeks = [];
  let currentWeek = [];

  // Pad beginning of first week
  for (let i = 0; i < startingDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
    currentWeek.push({
      day,
      dateString: dateStr,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad end of last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}
