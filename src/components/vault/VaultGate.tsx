import type React from "react";
import { useEffect, useState } from "react";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useVaultStore } from "../../store/useVaultStore";
import { SetPassphraseScreen } from "./SetPassphraseScreen";
import { UnlockScreen } from "./UnlockScreen";

const IDLE_AUTO_LOCK_MS = 15 * 60 * 1000;

interface VaultGateProps {
  children: React.ReactNode;
}

/**
 * Gates the whole app behind the vault state. Renders setup/unlock/migration
 * screens until the vault is unlocked, then renders the main app (children).
 * Also enforces auto-lock: on window close (beforeunload) and after 15 min idle,
 * the session DEK is wiped from memory (the clear itself is synchronous).
 */
export const VaultGate: React.FC<VaultGateProps> = ({ children }) => {
  const status = useVaultStore((s) => s.status);
  const init = useVaultStore((s) => s.init);
  const [view, setView] = useState<"main" | "recover">("main");
  const autoUnlockOnLaunch = useSettingsStore((s) => s.autoUnlockOnLaunch);
  const tryAutoUnlock = useVaultStore((s) => s.tryAutoUnlock);

  useEffect(() => {
    init();
  }, [init]);

  // After a lock (launch or idle), silently re-unlock from the keychain if the
  // user has trusted this device — so no passphrase prompt unless they opted out.
  useEffect(() => {
    if (status === "locked" && autoUnlockOnLaunch) {
      void tryAutoUnlock();
    }
  }, [status, autoUnlockOnLaunch, tryAutoUnlock]);

  useEffect(() => {
    const lock = () => {
      void useVaultStore.getState().lock();
    };
    const resetIdle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(lock, IDLE_AUTO_LOCK_MS);
    };
    const idleEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    let timer = window.setTimeout(lock, IDLE_AUTO_LOCK_MS);
    for (const ev of idleEvents) {
      window.addEventListener(ev, resetIdle);
    }
    window.addEventListener("beforeunload", lock);
    return () => {
      for (const ev of idleEvents) {
        window.removeEventListener(ev, resetIdle);
      }
      window.removeEventListener("beforeunload", lock);
      window.clearTimeout(timer);
    };
  }, []);

  if (status === "uninitialized") return <SetPassphraseScreen mode="setup" />;
  if (status === "locked") {
    return view === "recover" ? (
      <SetPassphraseScreen mode="recover" onCancel={() => setView("main")} />
    ) : (
      <UnlockScreen onRecover={() => setView("recover")} />
    );
  }
  return <>{children}</>;
};
