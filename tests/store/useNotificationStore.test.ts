import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNotificationStore } from "@/store/useNotificationStore";

describe("useNotificationStore", () => {
  beforeEach(() => {
    useNotificationStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pushToast adds a toast with a generated id", () => {
    useNotificationStore.getState().pushToast({ kind: "info", title: "Hello" });

    const toasts = useNotificationStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.id).toBeTruthy();
    expect(toasts[0]?.title).toBe("Hello");
  });

  it("identical toasts are deduplicated", () => {
    useNotificationStore.getState().pushToast({ kind: "error", title: "Boom", description: "d" });
    useNotificationStore.getState().pushToast({ kind: "error", title: "Boom", description: "d" });

    expect(useNotificationStore.getState().toasts).toHaveLength(1);
  });

  it("keeps only the last five toasts", () => {
    for (let i = 0; i < 7; i++) {
      useNotificationStore.getState().pushToast({ kind: "info", title: `t${i}` });
    }

    const titles = useNotificationStore.getState().toasts.map((t) => t.title);
    expect(titles).toEqual(["t2", "t3", "t4", "t5", "t6"]);
  });

  it("dismissToast removes a specific toast", () => {
    useNotificationStore.getState().pushToast({ kind: "info", title: "A" });
    const id = useNotificationStore.getState().toasts[0]?.id ?? "";

    useNotificationStore.getState().dismissToast(id);

    expect(useNotificationStore.getState().toasts).toHaveLength(0);
  });

  it("auto-dismisses after the duration", () => {
    vi.useFakeTimers();
    useNotificationStore.getState().pushToast({ kind: "success", title: "Saved", durationMs: 100 });

    expect(useNotificationStore.getState().toasts).toHaveLength(1);
    vi.advanceTimersByTime(150);
    expect(useNotificationStore.getState().toasts).toHaveLength(0);
  });

  it("durationMs 0 keeps the toast until dismissed", () => {
    vi.useFakeTimers();
    useNotificationStore.getState().pushToast({ kind: "warning", title: "Stay", durationMs: 0 });

    vi.advanceTimersByTime(10_000);
    expect(useNotificationStore.getState().toasts).toHaveLength(1);
  });
});
