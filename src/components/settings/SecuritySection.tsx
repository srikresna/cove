import { KeyRound, Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { notifyError } from "../../store/notify";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useUIStore } from "../../store/useUIStore";
import { useVaultStore } from "../../store/useVaultStore";
import { ChangePassphraseDialog } from "../modals/ChangePassphraseDialog";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { SectionHeading, SettingRow } from "./SettingRow";

export const SecuritySection: React.FC = () => {
  const autoUnlockOnLaunch = useSettingsStore((s) => s.autoUnlockOnLaunch);
  const setTrustDevice = useVaultStore((s) => s.setTrustDevice);
  const lockManually = useVaultStore((s) => s.lockManually);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const [isChangePassOpen, setChangePassOpen] = useState(false);

  const handleTrustDeviceToggle = async () => {
    try {
      await setTrustDevice(!autoUnlockOnLaunch);
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div className="space-y-3">
      <SectionHeading title={MESSAGES.SETTINGS_CATEGORY_SECURITY} />
      <SettingRow
        label={MESSAGES.SETTINGS_AUTO_UNLOCK_LABEL}
        description={MESSAGES.SETTINGS_AUTO_UNLOCK_DESC}
        control={
          <Switch
            checked={autoUnlockOnLaunch}
            onCheckedChange={handleTrustDeviceToggle}
            aria-label={MESSAGES.SETTINGS_AUTO_UNLOCK_LABEL}
          />
        }
      />
      <SettingRow
        label={MESSAGES.SETTINGS_LOCK_NOW}
        description={MESSAGES.SETTINGS_LOCK_NOW_DESC}
        control={
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await lockManually();
                setSettingsOpen(false);
              } catch (err) {
                notifyError(err);
              }
            }}
          >
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Lock
          </Button>
        }
      />
      <SettingRow
        label={MESSAGES.SETTINGS_CHANGE_PASSPHRASE}
        description={MESSAGES.CHANGE_PASS_DESC}
        control={
          <Button variant="outline" size="sm" onClick={() => setChangePassOpen(true)}>
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            Change
          </Button>
        }
      />
      <ChangePassphraseDialog open={isChangePassOpen} onOpenChange={setChangePassOpen} />
    </div>
  );
};
