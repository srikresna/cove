import type React from "react";
import { useEffect, useState } from "react";
import { useVaultStore } from "../../store/useVaultStore";
import { SetPassphraseScreen } from "./SetPassphraseScreen";
import { UnlockScreen } from "./UnlockScreen";

const IDLE_AUTO_LOCK_MS = 15 * 60 * 1000;

interface VaultGateProps {
  children: React.ReactNode;
}

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
