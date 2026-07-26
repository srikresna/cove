import { describe, expect, it } from "vitest";
import {
  BusinessRuleError,
  EncryptionError,
  NotFoundError,
  PersistenceError,
  ValidationError,
} from "./AppError";
import { toAppError, toPersistenceError } from "./errorMappers";

describe("AppError hierarchy", () => {
  it("preserves categories and stack trace", () => {
    const notFound = new NotFoundError("Note", "n-1");
    expect(notFound.category).toBe("not_found");
    expect(notFound.message).toBe("Note not found: n-1");
    expect(notFound.name).toBe("NotFoundError");

    const validation = new ValidationError("Title is required");
    expect(validation.category).toBe("validation");

    const biz = new BusinessRuleError("Cannot delete last workspace");
    expect(biz.category).toBe("business_rule");

    const enc = new EncryptionError("decrypt_failed", "Bad key");
    expect(enc.category).toBe("encryption");
    expect(enc.reason).toBe("decrypt_failed");
  });

  it("serializes to JSON correctly", () => {
    const errObj = new PersistenceError("save", "Disk full", {
      context: { path: "/cove.db" },
    });
    const json = errObj.toJSON();
    expect(json.name).toBe("PersistenceError");
    expect(json.category).toBe("persistence");
    expect(json.message).toBe("Disk full");
    expect(json.context).toEqual({ path: "/cove.db" });
  });

  it("mappers wrap generic errors into AppErrors", () => {
    const pErr = toPersistenceError("create", new Error("Constraint failed"));
    expect(pErr).toBeInstanceOf(PersistenceError);
    expect(pErr.operation).toBe("create");

    const appErr = toAppError("Random string error");
    expect(appErr).toBeInstanceOf(PersistenceError);
  });
});
