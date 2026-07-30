import { Download, KeyRound, Lock, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { backupService } from "../../di/container";
import { notifyError } from "../../store/notify";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useUIStore } from "../../store/useUIStore";
import { useVaultStore } from "../../store/useVaultStore";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { ChangePassphraseDialog } from "./ChangePassphraseDialog";
import { ConfirmDialog } from "./ConfirmDialog";

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    isDarkMode,
    toggleDarkMode,
    editorEngine,
    setEditorEngine,
  } = useUIStore();
  const autoUnlockOnLaunch = useSettingsStore((s) => s.autoUnlockOnLaunch);
  const setTrustDevice = useVaultStore((s) => s.setTrustDevice);
  const lock = useVaultStore((s) => s.lock);
  const pushToast = useNotificationStore((s) => s.pushToast);
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving">("idle");
  const [isChangePassOpen, setChangePassOpen] = useState(false);
  const [pendingRestorePath, setPendingRestorePath] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

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

  const handlePickRestore = async () => {
    try {
      const path = await backupService.pickBackupFile();
      if (path) setPendingRestorePath(path);
    } catch (err) {
      notifyError(err);
    }
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestorePath) return;
    setRestoring(true);
    try {
      await backupService.restoreFromFile(pendingRestorePath);
      // The DB file was swapped, so every in-memory store is now stale and the
      // connection pool was just suspended. A full reload is the only correct
      // recovery — it reopens the pool against the restored file and rebuilds
      // state from scratch.
      setPendingRestorePath(null);
      window.location.reload();
    } catch (err) {
      notifyError(err);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{MESSAGES.SETTINGS_TITLE}</DialogTitle>
        </DialogHeader>

        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">{MESSAGES.SETTINGS_DARK_MODE_LABEL}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {MESSAGES.SETTINGS_DARK_MODE_DESC}
            </p>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            aria-label={MESSAGES.SETTINGS_DARK_MODE_LABEL}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">{MESSAGES.SETTINGS_EDITOR_ENGINE_LABEL}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {MESSAGES.SETTINGS_EDITOR_ENGINE_DESC}
            </p>
          </div>
          <Switch
            checked={editorEngine === "blocksuite"}
            onCheckedChange={(next) => setEditorEngine(next ? "blocksuite" : "blocknote")}
            aria-label={MESSAGES.SETTINGS_EDITOR_ENGINE_LABEL}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">{MESSAGES.SETTINGS_AUTO_UNLOCK_LABEL}</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {MESSAGES.SETTINGS_AUTO_UNLOCK_DESC}
            </p>
          </div>
          <Switch
            checked={autoUnlockOnLaunch}
            onCheckedChange={handleTrustDeviceToggle}
            aria-label={MESSAGES.SETTINGS_AUTO_UNLOCK_LABEL}
          />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              await lock();
              setSettingsOpen(false);
            }}
          >
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{MESSAGES.SETTINGS_LOCK_NOW}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setChangePassOpen(true)}
          >
            <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>{MESSAGES.SETTINGS_CHANGE_PASSPHRASE}</span>
          </Button>

          <div>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={backupStatus === "saving"}
              onClick={handleExportBackup}
            >
              <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>
                {backupStatus === "saving"
                  ? MESSAGES.SETTINGS_EXPORT_IN_PROGRESS
                  : MESSAGES.SETTINGS_EXPORT_BACKUP}
              </span>
            </Button>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              {MESSAGES.SETTINGS_EXPORT_BACKUP_HINT}
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={restoring}
              onClick={handlePickRestore}
            >
              <Upload className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>
                {restoring
                  ? MESSAGES.SETTINGS_RESTORE_IN_PROGRESS
                  : MESSAGES.SETTINGS_RESTORE_BACKUP}
              </span>
            </Button>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              {MESSAGES.SETTINGS_RESTORE_BACKUP_HINT}
            </p>
          </div>
        </div>

        <ChangePassphraseDialog open={isChangePassOpen} onOpenChange={setChangePassOpen} />
        <ConfirmDialog
          open={pendingRestorePath !== null}
          title={MESSAGES.RESTORE_CONFIRM_TITLE}
          description={`${pendingRestorePath ?? ""} — ${MESSAGES.RESTORE_CONFIRM_DESC}`}
          confirmLabel={MESSAGES.RESTORE_CONFIRM_BUTTON}
          danger
          busy={restoring}
          onConfirm={handleConfirmRestore}
          onCancel={() => {
            if (!restoring) setPendingRestorePath(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
