import { beforeEach, describe, expect, it, vi } from "vitest";

const { onLockHandlers } = vi.hoisted(() => ({
  onLockHandlers: { lock: null as (() => void) | null },
}));

vi.mock("@/di/container", () => ({
  vaultService: {
    onLock: (fn: () => void) => {
      onLockHandlers.lock = fn;
    },
  },
}));

import { useBlockSuiteDialogStore } from "@/store/useBlockSuiteDialogStore";

describe("useBlockSuiteDialogStore", () => {
  beforeEach(() => {
    useBlockSuiteDialogStore.setState({
      open: false,
      kind: null,
      title: "",
      message: "",
      confirmText: "OK",
      cancelText: "Cancel",
      placeholder: "",
      input: "",
      resolve: null,
    });
  });

  it("confirm resolves true on ok and false on cancel", async () => {
    const okPromise = useBlockSuiteDialogStore.getState().confirm({ title: "T", message: "M" });
    expect(useBlockSuiteDialogStore.getState().open).toBe(true);

    useBlockSuiteDialogStore.getState().ok();
    await expect(okPromise).resolves.toBe(true);
    expect(useBlockSuiteDialogStore.getState().open).toBe(false);

    const cancelPromise = useBlockSuiteDialogStore.getState().confirm({ title: "T", message: "M" });
    useBlockSuiteDialogStore.getState().cancel();
    await expect(cancelPromise).resolves.toBe(false);
  });

  it("prompt resolves the input on ok and null on cancel", async () => {
    const promptPromise = useBlockSuiteDialogStore.getState().prompt({
      title: "T",
      message: "M",
      autofill: "hello",
    });

    useBlockSuiteDialogStore.getState().setInput("world");
    useBlockSuiteDialogStore.getState().ok();

    await expect(promptPromise).resolves.toBe("world");

    const cancelPromise = useBlockSuiteDialogStore.getState().prompt({ title: "T", message: "M" });
    useBlockSuiteDialogStore.getState().cancel();
    await expect(cancelPromise).resolves.toBeNull();
  });

  it("a second confirm settles the previous awaiter with false", async () => {
    const first = useBlockSuiteDialogStore.getState().confirm({ title: "A", message: "M" });
    const second = useBlockSuiteDialogStore.getState().confirm({ title: "B", message: "M" });

    await expect(first).resolves.toBe(false);

    useBlockSuiteDialogStore.getState().ok();
    await expect(second).resolves.toBe(true);
  });

  it("a second prompt settles the previous awaiter with null", async () => {
    const first = useBlockSuiteDialogStore.getState().prompt({ title: "A", message: "M" });
    const second = useBlockSuiteDialogStore.getState().prompt({ title: "B", message: "M" });

    await expect(first).resolves.toBeNull();

    useBlockSuiteDialogStore.getState().ok();
    await expect(second).resolves.toBe("");
  });

  it("vault lock resolves the pending dialog and resets it", async () => {
    const promptPromise = useBlockSuiteDialogStore.getState().prompt({ title: "T", message: "M" });

    onLockHandlers.lock?.();

    await expect(promptPromise).resolves.toBeNull();
    expect(useBlockSuiteDialogStore.getState().open).toBe(false);
    expect(useBlockSuiteDialogStore.getState().resolve).toBeNull();
  });
});
