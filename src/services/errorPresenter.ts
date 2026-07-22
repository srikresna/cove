import { AppError } from "../errors/AppError";

export interface PresentedError {
  kind: "info" | "success" | "warning" | "error";
  toastTitle: string;
  toastDescription: string;
  userMessage: string;
}

export function presentError(cause: unknown): PresentedError {
  if (cause instanceof AppError) {
    switch (cause.category) {
      case "not_found":
        return {
          kind: "warning",
          toastTitle: "Resource Not Found",
          toastDescription: cause.message,
          userMessage: "Requested item was not found.",
        };
      case "validation":
        return {
          kind: "warning",
          toastTitle: "Validation Error",
          toastDescription: cause.message,
          userMessage: cause.message,
        };
      case "business_rule":
        return {
          kind: "warning",
          toastTitle: "Action Restricted",
          toastDescription: cause.message,
          userMessage: cause.message,
        };
      case "persistence":
        return {
          kind: "error",
          toastTitle: "Database Error",
          toastDescription: cause.message,
          userMessage: "Failed to save or read data from disk.",
        };
      case "encryption":
        return {
          kind: "error",
          toastTitle: "Security Error",
          toastDescription: cause.message,
          userMessage: "Could not encrypt or decrypt note data.",
        };
      case "concurrency":
        return {
          kind: "warning",
          toastTitle: "Conflict Detected",
          toastDescription: cause.message,
          userMessage: "Data was modified elsewhere.",
        };
      default:
        return {
          kind: "error",
          toastTitle: "Unexpected Error",
          toastDescription: cause.message,
          userMessage: "An unexpected error occurred.",
        };
    }
  }

  const msg = cause instanceof Error ? cause.message : String(cause);
  return {
    kind: "error",
    toastTitle: "Operation Failed",
    toastDescription: msg,
    userMessage: msg,
  };
}
