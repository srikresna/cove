import { describe, expect, it } from "vitest";
import { validatePassphrase } from "@/services/vault/vaultPolicy";

describe("validatePassphrase", () => {
  it("accepts any passphrase of 6 characters or more", () => {
    expect(validatePassphrase("abcdef").ok).toBe(true);
    expect(validatePassphrase("123456").ok).toBe(true);
    expect(validatePassphrase("k4t4!").ok).toBe(false);
    expect(validatePassphrase("k4t4!x").ok).toBe(true);
    expect(validatePassphrase("      ").ok).toBe(true);
  });

  it("rejects passphrases shorter than 6 characters with the length error", () => {
    expect(validatePassphrase("abc12")).toEqual({
      ok: false,
      error: "Passphrase must be at least 6 characters.",
    });
    expect(validatePassphrase("")).toEqual({
      ok: false,
      error: "Passphrase must be at least 6 characters.",
    });
  });
});
