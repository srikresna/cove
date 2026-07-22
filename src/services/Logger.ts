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

function emit(entry: LogEntry): void {
  const payload = {
    ...entry,
    error: entry.error ? serializeError(entry.error) : undefined,
  };

  const jsonStr = JSON.stringify(payload);

  // biome-ignore lint/suspicious/noConsole: Logger is the single console sink
  console.log(jsonStr);
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
