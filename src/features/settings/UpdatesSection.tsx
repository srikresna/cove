import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater";
import { Download, RefreshCw } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import { useNotificationStore } from "../../store/useNotificationStore";
import { SectionHeading } from "./SettingRow";

type UpdateStatus = "idle" | "checking" | "current" | "available" | "installing" | "error";

export const UpdatesSection: React.FC = () => {
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [currentVersion, setCurrentVersion] = useState("—");
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState(0);
  const checkInFlight = useRef(false);
  const startupCheckDone = useRef(false);
  const updateRef = useRef<Update | null>(null);

  const checkForUpdates = useCallback(async (automatic = false) => {
    if (checkInFlight.current) return;
    checkInFlight.current = true;
    setStatus("checking");
    try {
      const version = await getVersion();
      setCurrentVersion(version);
      const available = await check();
      if (updateRef.current && updateRef.current !== available) {
        await updateRef.current.close();
      }
      updateRef.current = available;
      setUpdate(available);
      setStatus(available ? "available" : "current");
      if (available && automatic) {
        useNotificationStore.getState().pushToast({
          kind: "info",
          title: MESSAGES.SETTINGS_UPDATE_AUTO_TOAST,
          description: `Version ${available.version} is ready. Open Settings → Updates to install it.`,
          durationMs: 10_000,
        });
      }
    } catch (error) {
      setStatus("error");
      if (!automatic) {
        useNotificationStore.getState().pushToast({
          kind: "error",
          title: MESSAGES.SETTINGS_UPDATE_ERROR,
        });
      }
      console.warn("Cove update check failed.", error);
    } finally {
      checkInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (startupCheckDone.current) return;
    startupCheckDone.current = true;
    const isDevelopmentHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (isTauri() && !isDevelopmentHost) {
      void checkForUpdates(true);
    } else {
      void getVersion()
        .then(setCurrentVersion)
        .catch(() => {});
    }
  }, [checkForUpdates]);

  const installUpdate = async () => {
    if (!update) return;
    setStatus("installing");
    setProgress(0);
    let downloaded = 0;
    let total = 0;
    const handleProgress = (event: DownloadEvent) => {
      if (event.event === "Started") {
        total = event.data.contentLength ?? 0;
      } else if (event.event === "Progress") {
        downloaded += event.data.chunkLength;
        if (total > 0) setProgress(Math.min(100, Math.round((downloaded / total) * 100)));
      } else {
        setProgress(100);
      }
    };

    try {
      await update.downloadAndInstall(handleProgress);
      await relaunch();
    } catch (error) {
      setStatus("error");
      useNotificationStore.getState().pushToast({
        kind: "error",
        title: "Could not install the update",
      });
      console.warn("Cove update installation failed.", error);
    }
  };

  const statusText =
    status === "checking"
      ? MESSAGES.SETTINGS_UPDATE_CHECKING
      : status === "current"
        ? MESSAGES.SETTINGS_UPDATE_CURRENT
        : status === "available" && update
          ? MESSAGES.SETTINGS_UPDATE_AVAILABLE.replace("{version}", update.version)
          : status === "installing"
            ? `${MESSAGES.SETTINGS_UPDATE_INSTALLING} ${progress}%`
            : status === "error"
              ? MESSAGES.SETTINGS_UPDATE_ERROR
              : `Current version: ${currentVersion}`;

  return (
    <section className="space-y-4">
      <SectionHeading
        title={MESSAGES.SETTINGS_CATEGORY_UPDATES}
        description={MESSAGES.SETTINGS_UPDATES_DESC}
      />
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Cove Notes</p>
            <p aria-live="polite" className="mt-1 text-xs leading-5 text-muted-foreground">
              {statusText}
            </p>
            {status === "available" && update?.body && (
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                {update.body}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {status === "available" ? (
              <Button onClick={() => void installUpdate()}>
                <Download aria-hidden="true" />
                {MESSAGES.SETTINGS_UPDATE_INSTALL}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => void checkForUpdates()}
                disabled={status === "checking" || status === "installing"}
              >
                <RefreshCw aria-hidden="true" />
                {status === "checking"
                  ? MESSAGES.SETTINGS_UPDATE_CHECKING
                  : MESSAGES.SETTINGS_UPDATE_CHECK}
              </Button>
            )}
          </div>
        </div>
        {status === "installing" && (
          <div
            role="progressbar"
            aria-label={MESSAGES.SETTINGS_UPDATE_INSTALLING}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
};
