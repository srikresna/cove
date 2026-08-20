import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VaultStatus } from "@/services/IVaultService";

const {
  computeStatus,
  setupPassphrase,
  unlock,
  recoverViaKeychain,
  tryAutoUnlock,
  lock,
  setKeychainEscrow,
  changePassphrase,
  onLockHandlers,
} = vi.hoisted(() => ({
  computeStatus: vi.fn<() => Promise<VaultStatus>>(),
  setupPassphrase: vi.fn<(p: string) => Promise<void>>(),
  unlock: vi.fn<(p: string) => Promise<void>>(),
  recoverViaKeychain: vi.fn<(p: string) => Promise<void>>(),
  tryAutoUnlock: vi.fn<() => Promise<boolean>>(),
  lock: vi.fn<() => Promise<void>>(),
  setKeychainEscrow: vi.fn<(e: boolean) => Promise<void>>(),
  changePassphrase: vi.fn<(o: string, n: string) => Promise<void>>(),
  onLockHandlers: { lock: null as (() => void) | null },
}));

vi.mock("@/di/container", () => ({
  vaultService: {
    computeStatus,
    setupPassphrase,
    unlock,
    recoverViaKeychain,
    tryAutoUnlock,
    lock,
    setKeychainEscrow,
    changePassphrase,
    onLock: (fn: () => void) => {
      onLockHandlers.lock = fn;
    },
  },
  blockSuiteEditorService: {
    provideCanvasPrefs: () => {},
  },
}));

import { useSettingsStore } from "@/store/useSettingsStore";
import { useVaultStore } from "@/store/useVaultStore";

describe("useVaultStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    computeStatus.mockResolvedValue("locked");
    useVaultStore.setState({ status: "uninitialized" });
    useSettingsStore.getState().setAutoUnlockOnLaunch(false);
  });

  it("init auto-unlocks when trusted and possible", async () => {
    useSettingsStore.getState().setAutoUnlockOnLaunch(true);
    tryAutoUnlock.mockResolvedValue(true);

    await useVaultStore.getState().init();

    expect(useVaultStore.getState().status).toBe("unlocked");
    expect(computeStatus).not.toHaveBeenCalled();
  });

  it("init falls back to the computed status otherwise", async () => {
    tryAutoUnlock.mockResolvedValue(false);

    await useVaultStore.getState().init();

    expect(useVaultStore.getState().status).toBe("locked");
  });

  it("init treats a status failure as uninitialized", async () => {
    computeStatus.mockRejectedValue(new Error("kms unavailable"));

    await useVaultStore.getState().init();

    expect(useVaultStore.getState().status).toBe("uninitialized");
  });

  it("unlock refreshes the escrow when the device is trusted", async () => {
    useSettingsStore.getState().setAutoUnlockOnLaunch(true);
    unlock.mockResolvedValue(undefined);
    setKeychainEscrow.mockResolvedValue(undefined);

    await useVaultStore.getState().unlock("pass");

    expect(setKeychainEscrow).toHaveBeenCalledWith(true);
    expect(useVaultStore.getState().status).toBe("locked");
  });

  it("unlock tolerates a failing escrow refresh", async () => {
    useSettingsStore.getState().setAutoUnlockOnLaunch(true);
    unlock.mockResolvedValue(undefined);
    setKeychainEscrow.mockRejectedValue(new Error("keychain down"));

    await useVaultStore.getState().unlock("pass");

    expect(useVaultStore.getState().status).toBe("locked");
  });

  it("recover and changePassphrase refresh the status", async () => {
    recoverViaKeychain.mockResolvedValue(undefined);
    changePassphrase.mockResolvedValue(undefined);

    await useVaultStore.getState().recover("new-pass");
    expect(useVaultStore.getState().status).toBe("locked");

    await useVaultStore.getState().changePassphrase("old", "new");
    expect(changePassphrase).toHaveBeenCalledWith("old", "new");
  });

  it("setTrustDevice persists the preference next to the escrow call", async () => {
    setKeychainEscrow.mockResolvedValue(undefined);

    await useVaultStore.getState().setTrustDevice(true);

    expect(setKeychainEscrow).toHaveBeenCalledWith(true);
    expect(useSettingsStore.getState().autoUnlockOnLaunch).toBe(true);

    await useVaultStore.getState().setTrustDevice(false);
    expect(useSettingsStore.getState().autoUnlockOnLaunch).toBe(false);
  });

  it("skips auto-unlock while a manual lock barrier is set", async () => {
    useSettingsStore.getState().setAutoUnlockOnLaunch(true);
    tryAutoUnlock.mockResolvedValue(true);
    localStorage.setItem("cove-manual-lock", "1");
    useVaultStore.setState({ status: "locked" });

    await useVaultStore.getState().init();

    expect(tryAutoUnlock).not.toHaveBeenCalled();
    expect(useVaultStore.getState().status).toBe("locked");
  });

  it("lockManually sets the barrier; unlock clears it and auto-unlock works again", async () => {
    useSettingsStore.getState().setAutoUnlockOnLaunch(true);
    lock.mockResolvedValue(undefined);
    computeStatus.mockResolvedValue("locked" as VaultStatus);
    unlock.mockResolvedValue(undefined);

    await useVaultStore.getState().lockManually();
    expect(localStorage.getItem("cove-manual-lock")).toBe("1");
    expect(useVaultStore.getState().status).toBe("locked");

    await useVaultStore.getState().unlock("pass");
    expect(localStorage.getItem("cove-manual-lock")).toBeNull();

    tryAutoUnlock.mockResolvedValue(true);
    await useVaultStore.getState().init();
    expect(useVaultStore.getState().status).toBe("unlocked");
  });

  it("lock refreshes the status; the onLock listener forces locked", async () => {
    lock.mockResolvedValue(undefined);
    computeStatus.mockResolvedValue("locked" as VaultStatus);

    await useVaultStore.getState().lock();
    expect(useVaultStore.getState().status).toBe("locked");

    useVaultStore.setState({ status: "unlocked" });
    onLockHandlers.lock?.();
    expect(useVaultStore.getState().status).toBe("locked");
  });
});
