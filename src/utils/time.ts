import { MESSAGES } from "../constants/messages";

const DAY_MS = 24 * 60 * 60 * 1000;

export function formatRelativeDay(timestamp: number, now = Date.now()): string {
  const startOfDay = (t: number) => Math.floor(t / DAY_MS);
  const days = startOfDay(now) - startOfDay(timestamp);
  if (days <= 0) return MESSAGES.TIME_TODAY;
  if (days === 1) return MESSAGES.TIME_YESTERDAY;
  if (days < 7) return `${days} ${MESSAGES.TIME_DAYS_AGO_SUFFIX}`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(timestamp);
}

export function formatFullTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(timestamp);
}
