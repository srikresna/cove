import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoteIcon } from "@/components/NoteIcon";
import { useCustomIconStore } from "@/store/useCustomIconStore";

vi.mock("@/di/container", () => ({
  customIconService: {
    list: vi.fn(async () => []),
    add: vi.fn(),
    remove: vi.fn(),
  },
}));

const seedPack = () =>
  useCustomIconStore.setState({
    icons: {
      "abc-123": { name: "logo", dataUrl: "data:image/webp;base64,AAAA" },
    },
  });

describe("NoteIcon", () => {
  afterEach(() => {
    cleanup();
    useCustomIconStore.setState({ icons: {} });
  });

  it("renders an emoji string as-is", () => {
    const { container } = render(<NoteIcon icon="📝" className="h-4 w-4" />);
    expect(container.textContent).toBe("📝");
  });

  it("renders the encrypted pack image when the token resolves", () => {
    seedPack();
    const { container } = render(<NoteIcon icon="cove-icon:abc-123" className="h-4 w-4" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe("data:image/webp;base64,AAAA");
    expect(img?.className).toContain("h-4");
    expect(container.textContent).toBe("");
  });

  it("resolves tokens case-insensitively", () => {
    seedPack();
    const { container } = render(<NoteIcon icon="cove-icon:ABC-123" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("data:image/webp;base64,AAAA");
  });

  it("falls back to FileText when the token is missing from the pack", () => {
    const { container } = render(<NoteIcon icon="cove-icon:gone" className="h-3.5 w-3.5" />);
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.textContent).toBe("");
  });

  it("falls back to FileText when the icon is empty", () => {
    const { container } = render(<NoteIcon icon={null} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders nothing for an unresolved token when fallback is disabled", () => {
    const { container } = render(<NoteIcon icon="cove-icon:gone" fallback={false} />);
    expect(container.textContent).toBe("");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("FileText fallback keeps the muted color class", () => {
    const { container } = render(<NoteIcon icon={null} className="h-4 w-4" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("text-muted-foreground");
  });
});
