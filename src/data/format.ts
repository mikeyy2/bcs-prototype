/**
 * REQ-BKG-3 — times are held in UTC and displayed in BCS local time
 * (America/Chicago), regardless of where the browser is.
 */
export const BCS_TIMEZONE = 'America/Chicago'

/** Midnight UTC today, the anchor every seeded day offset is measured from. */
function todayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

/** Resolves a seeded (dayOffset, hour) pair to a real UTC instant. */
export function resolveDate(dayOffset: number, hour = 0): Date {
  const base = todayUtc()
  base.setUTCDate(base.getUTCDate() + dayOffset)
  base.setUTCHours(hour)
  return base
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BCS_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BCS_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: BCS_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export function hoursBetween(startHour: number, endHour: number): number {
  return Math.max(0, endHour - startHour)
}

/** Hours until an instant; negative once it has passed. */
export function hoursUntil(date: Date): number {
  return (date.getTime() - Date.now()) / 3_600_000
}
