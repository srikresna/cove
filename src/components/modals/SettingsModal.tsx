import * as Dialog from "@radix-ui/react-dialog";
import { Download, Lock, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { backupService } from "../../di/container";
import { presentError } from "../../services/errorPresenter";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useVaultStore } from "../../store/useVaultStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen } = useWorkspaceStore();
  const autoUnlockOnLaunch = useSettingsStore((s) => s.autoUnlockOnLaunch);
  const setTrustDevice = useVaultStore((s) => s.setTrustDevice);
  const lock = useVaultStore((s) => s.lock);
  const pushToast = useNotificationStore((s) => s.pushToast);
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving">("idle");

  const notifyError = (err: unknown) => {
    const p = presentError(err);
    pushToast({ kind: p.kind, title: p.toastTitle, description: p.toastDescription });
  };

  const handleTrustDeviceToggle = async () => {
    try {
      await setTrustDevice(!autoUnlockOnLaunch);
    } catch (err) {
      notifyError(err);
    }
  };

  const handleExportBackup = async () => {
    setBackupStatus("saving");
    try {
      const path = await backupService.exportBackup();
      if (path) {
        pushToast({
          kind: "success",
          title: MESSAGES.BACKUP_SAVED_TITLE,
          description: path,
        });
      }
    } catch (err) {
      notifyError(err);
    } finally {
      setBackupStatus("idle");
    }
  };

  return (
    <Dialog.Root open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-cream-paper rounded-[16px] border-[1.5px] border-charcoal shadow-card-subtle p-6 space-y-5 outline-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-cocoa-ink">{MESSAGES.SETTINGS_TITLE}</h2>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close settings"
                className="p-1.5 rounded-[12px] text-charcoal hover:bg-dew-drop outline-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal p-4">
            <div className="min-w-0">
              <div className="text-xs font-bold text-cocoa-ink">
                {MESSAGES.SETTINGS_AUTO_UNLOCK_LABEL}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                {MESSAGES.SETTINGS_AUTO_UNLOCK_DESC}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoUnlockOnLaunch}
              aria-label={MESSAGES.SETTINGS_AUTO_UNLOCK_LABEL}
              onClick={handleTrustDeviceToggle}
              className={`relative h-6 w-11 flex-shrink-0 rounded-full border-[1.5px] border-charcoal transition-colors ${
                autoUnlockOnLaunch ? "bg-marker-orange" : "bg-cream-paper"
              }`}
            >
              <span
                className={`absolute top-[1px] h-4 w-4 rounded-full border border-charcoal bg-cream-paper transition-transform ${
                  autoUnlockOnLaunch ? "translate-x-[22px]" : "translate-x-[2px]"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              await lock();
              setSettingsOpen(false);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-[20px] border-[1.5px] border-charcoal bg-cream-paper px-4 py-2.5 text-xs font-bold text-cocoa-ink shadow-paper-lift transition-transform hover:scale-105"
          >
            <Lock className="h-4 w-4 text-marker-orange" aria-hidden="true" />
            <span>{MESSAGES.SETTINGS_LOCK_NOW}</span>
          </button>

          <div>
            <button
              type="button"
              disabled={backupStatus === "saving"}
              onClick={handleExportBackup}
              className="flex w-full items-center justify-center gap-2 rounded-[20px] border-[1.5px] border-charcoal bg-cream-paper px-4 py-2.5 text-xs font-bold text-cocoa-ink shadow-paper-lift transition-transform hover:scale-105 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-marker-orange" aria-hidden="true" />
              <span>
                {backupStatus === "saving" ? "Exporting…" : MESSAGES.SETTINGS_EXPORT_BACKUP}
              </span>
            </button>
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
              {MESSAGES.SETTINGS_EXPORT_BACKUP_HINT}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
