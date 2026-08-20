import { beforeEach, describe, expect, it } from "vitest";
import { notifyError, notifyErrorWithSaveStatus } from "@/store/notify";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useSaveStatusStore } from "@/store/useSaveStatusStore";

describe("notify helpers", () => {
  beforeEach(() => {
    useNotificationStore.setState({ toasts: [] });
    useSaveStatusStore.setState({ status: "idle", lastSavedAt: null, errorMessage: null });
  });

  it("notifyError pushes a toast without touching the save status", () => {
    notifyError(new Error("plain failure"));

    expect(useNotificationStore.getState().toasts).toHaveLength(1);
    expect(useSaveStatusStore.getState().status).toBe("idle");
    expect(useSaveStatusStore.getState().errorMessage).toBeNull();
  });

  it("notifyErrorWithSaveStatus defaults to recording the save error", () => {
    notifyErrorWithSaveStatus(new Error("plain failure"));

    expect(useNotificationStore.getState().toasts).toHaveLength(1);
    expect(useSaveStatusStore.getState().status).toBe("error");
    expect(useSaveStatusStore.getState().errorMessage).toBeTruthy();
  });

  it("notifyErrorWithSaveStatus can skip the save status", () => {
    notifyErrorWithSaveStatus(new Error("plain failure"), { saveStatus: false });

    expect(useNotificationStore.getState().toasts).toHaveLength(1);
    expect(useSaveStatusStore.getState().status).toBe("idle");
  });

  it("duplicate notifications are deduplicated by the toast store", () => {
    const err = new Error("same");
    notifyError(err);
    notifyError(err);

    expect(useNotificationStore.getState().toasts).toHaveLength(1);
  });
});

describe("notify save-status accounting", () => {
  beforeEach(() => {
    useNotificationStore.setState({ toasts: [] });
    useSaveStatusStore.setState({ status: "idle", lastSavedAt: null, errorMessage: null });
  });

  it("a save that begins then fails ends in the error status", () => {
    useSaveStatusStore.getState().setSaving();
    expect(useSaveStatusStore.getState().status).toBe("saving");

    notifyErrorWithSaveStatus(new Error("flush failed"));

    expect(useSaveStatusStore.getState().status).toBe("error");
  });
});
