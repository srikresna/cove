import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/errors/AppError";
import { processCoverImage } from "@/utils/coverImage";

class StubImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 0;
  naturalHeight = 0;
  set src(_value: string) {
    queueMicrotask(() => this.onload?.());
  }
}

describe("processCoverImage guards", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects non-image files", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });

    await expect(processCoverImage(file)).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects files above the size cap", async () => {
    const bytes = new Uint8Array(15 * 1024 * 1024 + 1);
    const file = new File([bytes], "huge.png", { type: "image/png" });

    await expect(processCoverImage(file)).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects images without decodable dimensions", async () => {
    vi.stubGlobal("Image", StubImage);
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:mock"),
      revokeObjectURL: vi.fn(),
    });

    const bytes = new Uint8Array([1, 2, 3, 4]);
    const file = new File([bytes], "broken.png", { type: "image/png" });

    await expect(processCoverImage(file)).rejects.toBeInstanceOf(ValidationError);
  });
});
