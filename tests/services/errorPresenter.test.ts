import {
  BusinessRuleError,
  ConcurrencyError,
  EncryptionError,
  NotFoundError,
  PersistenceError,
  ValidationError,
} from "@/errors/AppError";
import { presentError } from "@/services/errorPresenter";
import { describe, expect, it } from "vitest";

describe("errorPresenter", () => {
  it("presents not_found error", () => {
    const res = presentError(new NotFoundError("Note", "n-1"));
    expect(res.kind).toBe("warning");
    expect(res.toastTitle).toBe("Resource Not Found");
  });

  it("presents validation error", () => {
    const res = presentError(new ValidationError("Invalid title"));
    expect(res.kind).toBe("warning");
    expect(res.toastTitle).toBe("Validation Error");
  });

  it("presents business_rule error", () => {
    const res = presentError(new BusinessRuleError("Cannot delete"));
    expect(res.kind).toBe("warning");
    expect(res.toastTitle).toBe("Action Restricted");
  });

  it("presents persistence error", () => {
    const res = presentError(new PersistenceError("save", "DB lock"));
    expect(res.kind).toBe("error");
    expect(res.toastTitle).toBe("Database Error");
  });

  it("presents encryption error", () => {
    const res = presentError(new EncryptionError("decrypt_failed", "Bad key"));
    expect(res.kind).toBe("error");
    expect(res.toastTitle).toBe("Security Error");
  });

  it("presents concurrency error", () => {
    const res = presentError(new ConcurrencyError("Conflict"));
    expect(res.kind).toBe("warning");
    expect(res.toastTitle).toBe("Conflict Detected");
  });

  it("presents generic error", () => {
    const res = presentError(new Error("Unknown error"));
    expect(res.kind).toBe("error");
    expect(res.toastTitle).toBe("Operation Failed");
  });
});
