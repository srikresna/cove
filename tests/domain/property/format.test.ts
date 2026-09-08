import { describe, expect, it } from "vitest";
import { stackValueText, summarizePropertyValue } from "@/domain/property/format";
import type { PropertyDefinition } from "@/domain/property/Property";

const def = (options: PropertyDefinition["options"] = []): PropertyDefinition =>
  ({
    id: "p1",
    name: "P",
    type: "select",
    options,
    createdAt: 1,
    order: "",
    show: "always-show",
    icon: null,
  }) as PropertyDefinition;

describe("stackValueText", () => {
  it("renders option names for select/status and joins multi-select", () => {
    const d = def([
      { id: "o1", name: "One", color: "#111" },
      { id: "o2", name: "Two", color: "#222" },
    ]);
    expect(stackValueText(d, { type: "select", optionId: "o1" })).toBe("One");
    expect(stackValueText(d, { type: "multiSelect", optionIds: ["o2", "o1"] })).toBe("One, Two");
    expect(stackValueText(d, { type: "multiSelect", optionIds: ["gone"] })).toBeNull();
  });

  it("renders unchecked checkbox as null (empty), checked as tick", () => {
    expect(stackValueText(def(), { type: "checkbox", checked: false })).toBeNull();
    expect(stackValueText(def(), { type: "checkbox", checked: true })).toBe("✓");
  });
});

describe("summarizePropertyValue", () => {
  it("summarizes files as first entry with overflow count", () => {
    expect(summarizePropertyValue(def(), { type: "files", entries: ["a.pdf"] })).toBe("a.pdf");
    expect(summarizePropertyValue(def(), { type: "files", entries: ["a.pdf", "b.pdf"] })).toBe(
      "a.pdf +1",
    );
    expect(summarizePropertyValue(def(), { type: "files", entries: [] })).toBeNull();
  });

  it("reduces a URL to its hostname, falling back to the raw string", () => {
    expect(summarizePropertyValue(def(), { type: "url", url: "https://example.com/x" })).toBe(
      "example.com",
    );
    expect(summarizePropertyValue(def(), { type: "url", url: "not a url" })).toBe("not a url");
    expect(summarizePropertyValue(def(), { type: "url", url: "" })).toBeNull();
  });

  it("counts relations", () => {
    expect(summarizePropertyValue(def(), { type: "relation", noteIds: ["a", "b"] })).toBe(
      "2 linked",
    );
    expect(summarizePropertyValue(def(), { type: "relation", noteIds: [] })).toBeNull();
  });
});
