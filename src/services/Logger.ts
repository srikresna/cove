export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  error?: unknown;
  context?: Record<string, unknown>;
}

function serializeError(err: unknown): Record<string, unknown> | string {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  }
  return String(err);
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// Gate noisy debug logs (which can leak internal ids) below info, and route each
// level to its matching console sink so severity is preserved for tooling.
const MIN_LEVEL: LogLevel = "info";

function emit(entry: LogEntry): void {
  if (LEVEL_ORDER[entry.level] < LEVEL_ORDER[MIN_LEVEL]) return;
  const payload = {
    ...entry,
    error: entry.error ? serializeError(entry.error) : undefined,
  };

  const jsonStr = JSON.stringify(payload);
  const sink =
    entry.level === "error"
      ? console.error
      : entry.level === "warn"
        ? console.warn
        : entry.level === "info"
          ? console.info
          : console.debug;

  sink(jsonStr);
}

export const Logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    emit({ level: "debug", message, timestamp: new Date().toISOString(), context });
  },
  info: (message: string, context?: Record<string, unknown>) => {
    emit({ level: "info", message, timestamp: new Date().toISOString(), context });
  },
  warn: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    emit({ level: "warn", message, timestamp: new Date().toISOString(), error, context });
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    emit({ level: "error", message, timestamp: new Date().toISOString(), error, context });
  },
} as const;
