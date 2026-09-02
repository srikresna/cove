import type React from "react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { MESSAGES } from "../../constants/messages";
import { applyZoomFactor } from "../../lib/appZoom";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useUIStore } from "../../store/useUIStore";
import { SectionHeading, SettingRow } from "./SettingRow";

export const AppearanceSection: React.FC = () => {
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const toggleDarkMode = useUIStore((s) => s.toggleDarkMode);
  const zoomFactor = useSettingsStore((s) => s.zoomFactor);
  const setZoomFactor = useSettingsStore((s) => s.setZoomFactor);
  // The slider itself lives inside the zoomed webview: applying per drag
  // tick would rescale the track under the pointer and fight the drag, so
  // the factor is committed once, on release.
  const [dragPercent, setDragPercent] = useState<number | null>(null);

  const changeZoom = (factor: number) => {
    setDragPercent(null);
    setZoomFactor(factor);
    void applyZoomFactor(factor);
  };

  const commitDrag = () => {
    if (dragPercent === null) return;
    const factor = dragPercent / 100;
    setDragPercent(null);
    if (factor !== zoomFactor) changeZoom(factor);
  };

  // A cancelled drag (gesture takeover, capture loss) discards rather
  // than committing later as a surprise zoom.
  const cancelDrag = () => setDragPercent(null);

  const shownPercent = dragPercent ?? Math.round(zoomFactor * 100);

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
      <SettingRow
        label={MESSAGES.SETTINGS_ZOOM_LABEL}
        description={MESSAGES.SETTINGS_ZOOM_DESC}
        control={
          <div className="flex shrink-0 items-center gap-2">
            <input
              type="range"
              min={50}
              max={200}
              step={5}
              value={Math.round(shownPercent / 5) * 5}
              onChange={(e) => setDragPercent(Number(e.target.value))}
              onPointerUp={commitDrag}
              onPointerCancel={cancelDrag}
              onLostPointerCapture={cancelDrag}
              onKeyUp={commitDrag}
              onBlur={commitDrag}
              aria-label={MESSAGES.SETTINGS_ZOOM_LABEL}
              className="w-36 accent-primary"
            />
            <span className="w-11 text-right text-sm tabular-nums text-muted-foreground">
              {shownPercent}%
            </span>
            {zoomFactor !== 1 && (
              <Button variant="ghost" size="sm" onClick={() => changeZoom(1)}>
                {MESSAGES.SETTINGS_ZOOM_RESET}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
};
