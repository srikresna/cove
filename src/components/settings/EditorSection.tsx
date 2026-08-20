import type React from "react";
import { MESSAGES } from "../../constants/messages";
import { useSettingsStore } from "../../store/useSettingsStore";
import { Switch } from "../ui/switch";
import { SectionHeading, SettingRow } from "./SettingRow";

export const EditorSection: React.FC = () => {
  const canvasPrefs = useSettingsStore((s) => s.canvasPrefs);
  const setCanvasPref = useSettingsStore((s) => s.setCanvasPref);

  return (
    <div className="space-y-3">
      <SectionHeading
        title={MESSAGES.SETTINGS_CATEGORY_EDITOR}
        description={MESSAGES.SETTINGS_EDITOR_HINT}
      />
      <SettingRow
        label="Scribbled style"
        description="Unlocks the General / Scribbled toggle in the shape toolbar for a hand-drawn look."
        control={
          <Switch
            checked={canvasPrefs.scribbledStyle}
            onCheckedChange={(v) => setCanvasPref("scribbledStyle", v)}
            aria-label="Scribbled style"
          />
        }
      />
      <SettingRow
        label="Shape shadow"
        description="Adds a soft drop shadow to shapes."
        control={
          <Switch
            checked={canvasPrefs.shapeShadowBlur}
            onCheckedChange={(v) => setCanvasPref("shapeShadowBlur", v)}
            aria-label="Shape shadow"
          />
        }
      />
      <SettingRow
        label="Turbo renderer (experimental)"
        description="Speeds up very dense canvases during zoom via an off-main-thread painter worker. May cause elements to briefly show as placeholders while zooming on normal-size notes."
        control={
          <Switch
            checked={canvasPrefs.turboRenderer}
            onCheckedChange={(v) => setCanvasPref("turboRenderer", v)}
            aria-label="Turbo renderer"
          />
        }
      />
      <SettingRow
        label="DOM renderer (fallback)"
        description="Render the canvas with DOM elements instead of the default canvas. Different performance profile — mainly a fallback if canvas rendering misbehaves."
        control={
          <Switch
            checked={canvasPrefs.domRenderer}
            onCheckedChange={(v) => setCanvasPref("domRenderer", v)}
            aria-label="DOM renderer"
          />
        }
      />
    </div>
  );
};
