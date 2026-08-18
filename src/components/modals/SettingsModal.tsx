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
  const { isSettingsOpen, setSettingsOpen, isDarkMode, toggleDarkMode } = useUIStore();
  const autoUnlockOnLaunch = useSettingsStore((s) => s.autoUnlockOnLaunch);
  const canvasPrefs = useSettingsStore((s) => s.canvasPrefs);
  const setCanvasPref = useSettingsStore((s) => s.setCanvasPref);
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

        <p className="pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Canvas
        </p>
        <p className="-mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Changes apply the next time you open a note.
        </p>
        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">Scribbled style</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Unlocks the General / Scribbled toggle in the shape toolbar for a hand-drawn look.
            </p>
          </div>
          <Switch
            checked={canvasPrefs.scribbledStyle}
            onCheckedChange={(v) => setCanvasPref("scribbledStyle", v)}
            aria-label="Scribbled style"
          />
        </div>
        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">Shape shadow</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Adds a soft drop shadow to shapes.
            </p>
          </div>
          <Switch
            checked={canvasPrefs.shapeShadowBlur}
            onCheckedChange={(v) => setCanvasPref("shapeShadowBlur", v)}
            aria-label="Shape shadow"
          />
        </div>
        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">Turbo renderer (experimental)</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Speeds up very dense canvases during zoom via an off-main-thread painter worker. May
              cause elements to briefly show as placeholders while zooming on normal-size notes.
            </p>
          </div>
          <Switch
            checked={canvasPrefs.turboRenderer}
            onCheckedChange={(v) => setCanvasPref("turboRenderer", v)}
            aria-label="Turbo renderer"
          />
        </div>
        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">DOM renderer (fallback)</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Render the canvas with DOM elements instead of the default canvas. Different
              performance profile — mainly a fallback if canvas rendering misbehaves.
            </p>
          </div>
          <Switch
            checked={canvasPrefs.domRenderer}
            onCheckedChange={(v) => setCanvasPref("domRenderer", v)}
            aria-label="DOM renderer"
          />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              try {
                await lock();
                setSettingsOpen(false);
              } catch (err) {
                notifyError(err);
              }
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
