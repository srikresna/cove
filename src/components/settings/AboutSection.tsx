import { getVersion } from "@tauri-apps/api/app";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { SectionHeading } from "./SettingRow";

const FALLBACK_APP_VERSION = "0.1.0";
const APP_IDENTIFIER = "com.cove.notes";

const AboutRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4 border-b py-3 text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-mono text-[13px] text-foreground">{value}</span>
  </div>
);

export const AboutSection: React.FC = () => {
  const [appVersion, setAppVersion] = useState<string | null>(null);

  useEffect(() => {
    getVersion()
      .then(setAppVersion)
      .catch(() => {
        setAppVersion(FALLBACK_APP_VERSION);
      });
  }, []);

  return (
    <div>
      <SectionHeading
        title={MESSAGES.SETTINGS_CATEGORY_ABOUT}
        description={MESSAGES.SETTINGS_ABOUT_DESC}
      />
      <AboutRow label={MESSAGES.SETTINGS_ABOUT_VERSION_LABEL} value={appVersion ?? "…"} />
      <AboutRow label={MESSAGES.SETTINGS_ABOUT_IDENTIFIER_LABEL} value={APP_IDENTIFIER} />
    </div>
  );
};
