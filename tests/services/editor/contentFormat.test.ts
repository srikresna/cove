import { describe, expect, it } from "vitest";
import {
  isBlockSuiteContent,
  packBlockSuiteContent,
  unpackBlockSuiteContent,
} from "@/services/editor/contentFormat";

describe("contentFormat", () => {
  it("round-trips a BlockSuite update through the envelope", () => {
    const packed = packBlockSuiteContent("AAECAw==");
    expect(isBlockSuiteContent(packed)).toBe(true);
    expect(unpackBlockSuiteContent(packed)).toBe("AAECAw==");
  });

  it("rejects BlockNote JSON and arbitrary strings", () => {
    expect(isBlockSuiteContent('[{"type":"paragraph","content":[]}]')).toBe(false);
    expect(isBlockSuiteContent("")).toBe(false);
    expect(isBlockSuiteContent("plain text")).toBe(false);
    expect(unpackBlockSuiteContent('{"format":"other","update":"x"}')).toBeNull();
  });

  it("rejects a truncated envelope", () => {
    const packed = packBlockSuiteContent("AAECAw==");
    expect(unpackBlockSuiteContent(packed.slice(0, packed.length - 2))).toBeNull();
  });
});
