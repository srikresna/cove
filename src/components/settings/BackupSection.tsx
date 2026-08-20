import { Download, Upload } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { backupService } from "../../di/container";
import { notifyError } from "../../store/notify";
import { useNotificationStore } from "../../store/useNotificationStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { Button } from "../ui/button";
import { SectionHeading, SettingRow } from "./SettingRow";

export const BackupSection: React.FC = () => {
  const pushToast = useNotificationStore((s) => s.pushToast);
  const [backupStatus, setBackupStatus] = useState<"idle" | "saving">("idle");
  const [pendingRestorePath, setPendingRestorePath] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

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
    <div className="space-y-3">
      <SectionHeading title={MESSAGES.SETTINGS_CATEGORY_BACKUP} />
      <SettingRow
        label={MESSAGES.SETTINGS_EXPORT_BACKUP}
        description={MESSAGES.SETTINGS_EXPORT_BACKUP_HINT}
        control={
          <Button
            variant="outline"
            size="sm"
            disabled={backupStatus === "saving"}
            onClick={handleExportBackup}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {backupStatus === "saving" ? MESSAGES.SETTINGS_EXPORT_IN_PROGRESS : "Export"}
          </Button>
        }
      />
      <SettingRow
        label={MESSAGES.SETTINGS_RESTORE_BACKUP}
        description={MESSAGES.SETTINGS_RESTORE_BACKUP_HINT}
        control={
          <Button variant="outline" size="sm" disabled={restoring} onClick={handlePickRestore}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            {restoring ? MESSAGES.SETTINGS_RESTORE_IN_PROGRESS : "Restore"}
          </Button>
        }
      />
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
    </div>
  );
};
