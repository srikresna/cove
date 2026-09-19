import { CalendarCheck, ExternalLink, Plug, PlugZap } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import { GCAL_REMINDER_LEAD_OPTIONS } from "../../config/gcal";
import { MESSAGES } from "../../constants/messages";
import { gcalService } from "../../di/container";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { SectionHeading, SettingRow } from "./SettingRow";

export const ConnectionsSection: React.FC = () => {
  const status = useGcalStore((s) => s.status);
  const accountEmail = useGcalStore((s) => s.accountEmail);
  const gcalClientId = useSettingsStore((s) => s.gcalClientId);
  const setGcalClientId = useSettingsStore((s) => s.setGcalClientId);
  const gcalClientSecret = useSettingsStore((s) => s.gcalClientSecret);
  const setGcalClientSecret = useSettingsStore((s) => s.setGcalClientSecret);
  const gcalShowEvents = useSettingsStore((s) => s.gcalShowEvents);
  const setGcalShowEvents = useSettingsStore((s) => s.setGcalShowEvents);
  const gcalReminders = useSettingsStore((s) => s.gcalReminders);
  const setGcalReminders = useSettingsStore((s) => s.setGcalReminders);
  const gcalReminderLead = useSettingsStore((s) => s.gcalReminderLead);
  const setGcalReminderLead = useSettingsStore((s) => s.setGcalReminderLead);
  const wideScopeMissing = useGcalStore((s) => s.wideScopeMissing);
  const connectedAt = useGcalStore((s) => s.connectedAt);
  const daysSinceConnect = connectedAt ? Math.floor((Date.now() - connectedAt) / 86_400_000) : 0;
  const [clientIdDraft, setClientIdDraft] = useState(gcalClientId);
  const [clientSecretDraft, setClientSecretDraft] = useState(gcalClientSecret);

  useEffect(() => {
    void gcalService.ensureLoaded().catch(() => {});
  }, []);

  const handleConnect = async () => {
    setGcalClientId(clientIdDraft.trim());
    setGcalClientSecret(clientSecretDraft.trim());
    try {
      await gcalService.connect();
    } catch (err) {
      notifyError(err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await gcalService.disconnect();
    } catch (err) {
      notifyError(err);
    }
  };

  const connected = status === "connected";

  return (
    <div className="space-y-3">
      <SectionHeading
        title={MESSAGES.SETTINGS_CATEGORY_CONNECTIONS}
        description={MESSAGES.GCAL_SECTION_DESC}
      />

      <SettingRow
        label={MESSAGES.GCAL_TITLE}
        description={
          status === "reauth"
            ? MESSAGES.GCAL_REAUTH_DESC
            : connected
              ? `${MESSAGES.GCAL_CONNECTED_AS} ${accountEmail ?? MESSAGES.UNNAMED}`
              : MESSAGES.GCAL_DISCONNECTED_DESC
        }
        control={
          status === "connecting" ? (
            <Button variant="outline" size="sm" disabled>
              {MESSAGES.GCAL_CONNECTING}
            </Button>
          ) : connected || status === "reauth" ? (
            <div className="flex gap-2">
              {status === "reauth" && (
                <Button variant="outline" size="sm" onClick={() => void handleConnect()}>
                  <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
                  {MESSAGES.GCAL_RECONNECT}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => void handleDisconnect()}>
                {MESSAGES.GCAL_DISCONNECT}
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => void handleConnect()}>
              <Plug className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.GCAL_CONNECT}
            </Button>
          )
        }
      />

      {connected && (
        <SettingRow
          label={MESSAGES.GCAL_SHOW_EVENTS_LABEL}
          description={MESSAGES.GCAL_SHOW_EVENTS_DESC}
          control={
            <Switch
              checked={gcalShowEvents}
              onCheckedChange={setGcalShowEvents}
              aria-label={MESSAGES.GCAL_SHOW_EVENTS_LABEL}
            />
          }
        />
      )}

      {connected && (
        <SettingRow
          label={MESSAGES.GCAL_REMINDERS_LABEL}
          description={MESSAGES.GCAL_REMINDERS_DESC}
          control={
            <Switch
              checked={gcalReminders}
              onCheckedChange={setGcalReminders}
              aria-label={MESSAGES.GCAL_REMINDERS_LABEL}
            />
          }
        />
      )}

      {connected && gcalReminders && (
        <SettingRow
          label={MESSAGES.GCAL_REMINDER_LEAD_LABEL}
          description={MESSAGES.GCAL_REMINDER_LEAD_DESC}
          control={
            <div className="flex items-center gap-1 rounded-lg border bg-muted/60 p-0.5">
              {GCAL_REMINDER_LEAD_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  aria-pressed={gcalReminderLead === minutes}
                  onClick={() => setGcalReminderLead(minutes)}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    gcalReminderLead === minutes
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          }
        />
      )}

      {connected && daysSinceConnect >= 5 && (
        <SettingRow
          label={MESSAGES.GCAL_EXPIRY_WARNING_LABEL}
          description={MESSAGES.GCAL_EXPIRY_WARNING_DESC}
          control={
            <Button variant="outline" size="sm" onClick={() => void handleConnect()}>
              <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.GCAL_RECONNECT}
            </Button>
          }
        />
      )}

      {connected && wideScopeMissing && (
        <SettingRow
          label={MESSAGES.GCAL_CALENDARS_PICKER}
          description={MESSAGES.GCAL_WIDE_SCOPE_HINT}
          control={
            <Button variant="outline" size="sm" onClick={() => void handleConnect()}>
              <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.GCAL_RECONNECT}
            </Button>
          }
        />
      )}

      <SettingRow
        label={MESSAGES.GCAL_CLIENT_ID_LABEL}
        description={MESSAGES.GCAL_CLIENT_ID_DESC}
        control={
          <div className="flex w-[240px] shrink-0 items-center gap-2">
            <Input
              value={clientIdDraft}
              onChange={(e) => setClientIdDraft(e.target.value)}
              onBlur={() => setGcalClientId(clientIdDraft.trim())}
              placeholder="########-xxxx.apps.googleusercontent.com"
              aria-label={MESSAGES.GCAL_CLIENT_ID_LABEL}
              className="font-mono text-xs"
            />
          </div>
        }
      />

      <SettingRow
        label={MESSAGES.GCAL_CLIENT_SECRET_LABEL}
        description={MESSAGES.GCAL_CLIENT_SECRET_DESC}
        control={
          <div className="flex w-[240px] shrink-0 items-center gap-2">
            <Input
              value={clientSecretDraft}
              onChange={(e) => setClientSecretDraft(e.target.value)}
              onBlur={() => setGcalClientSecret(clientSecretDraft.trim())}
              placeholder="GOCSPX-…"
              aria-label={MESSAGES.GCAL_CLIENT_SECRET_LABEL}
              className="font-mono text-xs"
            />
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-dashed p-4 text-xs leading-relaxed text-muted-foreground">
        <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          {MESSAGES.GCAL_SETUP_HINT}
          <div className="mt-1">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-foreground underline-offset-2 hover:underline"
              onClick={() =>
                window.open(
                  "https://console.cloud.google.com/apis/credentials",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              console.cloud.google.com
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
