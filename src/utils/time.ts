import { APP_LOCALE } from "../constants/app";
import { MESSAGES } from "../constants/messages";

const DAY_MS = 24 * 60 * 60 * 1000;

function localStartOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function formatRelativeDay(timestamp: number, now = Date.now()): string {
  const days = Math.round((localStartOfDay(now) - localStartOfDay(timestamp)) / DAY_MS);
  if (days <= 0) return MESSAGES.TIME_TODAY;
  if (days === 1) return MESSAGES.TIME_YESTERDAY;
  if (days < 7) return `${days} ${MESSAGES.TIME_DAYS_AGO_SUFFIX}`;
  return new Intl.DateTimeFormat(APP_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function formatFullTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}
