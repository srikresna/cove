import type React from "react";
import { MESSAGES } from "../../constants/messages";
import { useUIStore } from "../../store/useUIStore";
import { Switch } from "../ui/switch";
import { SectionHeading, SettingRow } from "./SettingRow";

export const AppearanceSection: React.FC = () => {
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);

  return (
    <div className="space-y-3">
      <SectionHeading title={MESSAGES.SETTINGS_CATEGORY_APPEARANCE} />
      <SettingRow
        label={MESSAGES.SETTINGS_DARK_MODE_LABEL}
        description={MESSAGES.SETTINGS_DARK_MODE_DESC}
        control={
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            aria-label={MESSAGES.SETTINGS_DARK_MODE_LABEL}
          />
        }
      />
    </div>
  );
};
