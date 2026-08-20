import { create } from "zustand";
import { vaultService } from "../di/container";
import type { VaultStatus } from "../services/IVaultService";
import { Logger } from "../services/Logger";
import { useSettingsStore } from "./useSettingsStore";

interface VaultState {
  status: VaultStatus;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setupPassphrase: (passphrase: string) => Promise<void>;
  unlock: (passphrase: string) => Promise<void>;
  recover: (passphrase: string) => Promise<void>;
  tryAutoUnlock: () => Promise<boolean>;
  lock: () => Promise<void>;
  lockManually: () => Promise<void>;
  setTrustDevice: (enabled: boolean) => Promise<void>;
  changePassphrase: (oldPassphrase: string, newPassphrase: string) => Promise<void>;
}

const MANUAL_LOCK_KEY = "cove-manual-lock";

function manualLockBarrier(): boolean {
  return localStorage.getItem(MANUAL_LOCK_KEY) === "1";
}

function clearManualLockBarrier(): void {
  localStorage.removeItem(MANUAL_LOCK_KEY);
}

const refreshStatus = async (): Promise<VaultStatus> => {
  try {
    return await vaultService.computeStatus();
  } catch {
    return "uninitialized";
  }
};

let initInFlight: Promise<void> | null = null;

const AUTO_UNLOCK_RETRY_MS = 400;

async function attemptAutoUnlock(): Promise<boolean> {
  try {
    return await vaultService.tryAutoUnlock();
  } catch (err) {
    Logger.warn("vault: auto-unlock attempt rejected", err);
    return false;
  }
}

export const useVaultStore = create<VaultState>((set) => ({
  status: "uninitialized",
  init: () => {
    if (initInFlight) return initInFlight;
    const attempt = (async () => {
      const auto = useSettingsStore.getState().autoUnlockOnLaunch;
      if (auto && !manualLockBarrier()) {
        let ok = await attemptAutoUnlock();
        if (!ok) {
          await new Promise((r) => setTimeout(r, AUTO_UNLOCK_RETRY_MS));
          ok = await attemptAutoUnlock();
        }
        if (ok) {
          set({ status: "unlocked" });
          return;
        }
        Logger.warn("vault: trusted-device auto-unlock unavailable at launch");
      }
      set({ status: await refreshStatus() });
    })();
    initInFlight = attempt;
    void attempt.then(
      () => {
        initInFlight = null;
      },
      () => {
        initInFlight = null;
      },
    );
    return attempt;
  },
  refresh: async () => {
    set({ status: await refreshStatus() });
  },
  setupPassphrase: async (passphrase) => {
    await vaultService.setupPassphrase(passphrase);
    set({ status: await refreshStatus() });
  },
  unlock: async (passphrase) => {
    await vaultService.unlock(passphrase);
    clearManualLockBarrier();
    if (useSettingsStore.getState().autoUnlockOnLaunch) {
      try {
        await vaultService.setKeychainEscrow(true);
      } catch (err) {
        Logger.warn("vault: escrow refresh after unlock failed", err);
      }
    }
    set({ status: await refreshStatus() });
  },
  recover: async (passphrase) => {
    await vaultService.recoverViaKeychain(passphrase);
    clearManualLockBarrier();
    set({ status: await refreshStatus() });
  },
  tryAutoUnlock: async () => {
    const ok = await vaultService.tryAutoUnlock();
    set({ status: await refreshStatus() });
    return ok;
  },
  lock: async () => {
    await vaultService.lock();
    set({ status: await refreshStatus() });
  },
  lockManually: async () => {
    localStorage.setItem(MANUAL_LOCK_KEY, "1");
    await vaultService.lock();
    set({ status: await refreshStatus() });
  },
  setTrustDevice: async (enabled) => {
    await vaultService.setKeychainEscrow(enabled);
    useSettingsStore.getState().setAutoUnlockOnLaunch(enabled);
  },
  changePassphrase: async (oldPassphrase, newPassphrase) => {
    await vaultService.changePassphrase(oldPassphrase, newPassphrase);
    set({ status: await refreshStatus() });
  },
}));

vaultService.onLock(() => {
  useVaultStore.setState({ status: "locked" });
});
