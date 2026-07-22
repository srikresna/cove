import { AppError, PersistenceError } from "./AppError";

export function toPersistenceError(operation: string, cause: unknown): PersistenceError {
  if (cause instanceof PersistenceError) return cause;
  const msg = cause instanceof Error ? cause.message : String(cause);
  return new PersistenceError(operation, `Database operation failed (${operation}): ${msg}`, {
    cause,
  });
}

export function toAppError(cause: unknown): AppError {
  if (cause instanceof AppError) return cause;
  const msg = cause instanceof Error ? cause.message : String(cause);
  return new PersistenceError("unknown", msg, { cause });
}
