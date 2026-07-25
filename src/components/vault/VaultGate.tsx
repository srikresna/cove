import type React from "react";
import { useEffect, useState } from "react";
import { useVaultStore } from "../../store/useVaultStore";
import { MigrationScreen } from "./MigrationScreen";
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

  useEffect(() => {
    init();
  }, [init]);

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

  if (status === "migration_in_progress") return <MigrationScreen />;
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
