import { beforeEach, describe, expect, it } from "vitest";
import { useSaveStatusStore } from "@/store/useSaveStatusStore";

describe("useSaveStatusStore", () => {
  beforeEach(() => {
    useSaveStatusStore.setState({ status: "idle", lastSavedAt: null, errorMessage: null });
  });

  it("transitions idle -> saving -> saved", () => {
    useSaveStatusStore.getState().setSaving();
    expect(useSaveStatusStore.getState().status).toBe("saving");

    useSaveStatusStore.getState().setSaved();
    expect(useSaveStatusStore.getState().status).toBe("saved");
    expect(useSaveStatusStore.getState().lastSavedAt).not.toBeNull();
    expect(useSaveStatusStore.getState().errorMessage).toBeNull();
  });

  it("overlapping saves stay saving until the last one finishes", () => {
    useSaveStatusStore.getState().setSaving();
    useSaveStatusStore.getState().setSaving();

    useSaveStatusStore.getState().setSaved();
    expect(useSaveStatusStore.getState().status).toBe("saving");

    useSaveStatusStore.getState().setSaved();
    expect(useSaveStatusStore.getState().status).toBe("saved");
  });

  it("setError records the message once in-flight saves drain", () => {
    useSaveStatusStore.getState().setSaving();
    useSaveStatusStore.getState().setSaving();

    useSaveStatusStore.getState().setSaved();
    useSaveStatusStore.getState().setError("disk full");

    expect(useSaveStatusStore.getState().status).toBe("error");
    expect(useSaveStatusStore.getState().errorMessage).toBe("disk full");
  });

  it("terminal calls without a matching saving are clamped, not negative", () => {
    useSaveStatusStore.getState().setSaved();
    useSaveStatusStore.getState().setError("x");

    expect(useSaveStatusStore.getState().status).toBe("error");
  });
});
