import { ImageUp, X } from "lucide-react";
import type React from "react";
import { useRef } from "react";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import { useCustomIconStore } from "../../store/useCustomIconStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { SectionHeading } from "./SettingRow";

export const IconsSection: React.FC = () => {
  const icons = useCustomIconStore((s) => s.icons);
  const addCustomIcon = useCustomIconStore((s) => s.addCustomIcon);
  const removeCustomIcon = useCustomIconStore((s) => s.removeCustomIcon);
  const pushToast = useNotificationStore((s) => s.pushToast);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = Object.entries(icons);

  return (
    <div className="space-y-4">
      <SectionHeading title={MESSAGES.SETTINGS_CATEGORY_ICONS} />
      <p className="text-sm leading-relaxed text-muted-foreground">{MESSAGES.ICON_PACK_DESC}</p>

      <div>
        <Button variant="outline" onClick={() => inputRef.current?.click()}>
          <ImageUp className="h-4 w-4" aria-hidden="true" />
          <span>{MESSAGES.ICON_PACK_UPLOAD}</span>
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          hidden
          style={{ display: "none" }}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            for (const file of files) void addCustomIcon(file);
          }}
        />
      </div>

      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {MESSAGES.ICON_PACK_EMPTY}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-3">
          {entries.map(([id, entry]) => (
            <div
              key={id}
              className="group relative flex flex-col items-center gap-2 rounded-lg border bg-card p-3"
            >
              <img
                src={entry.dataUrl}
                alt={entry.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="w-full truncate text-center text-xs text-muted-foreground">
                {entry.name}
              </span>
              <Button
                variant="ghost"
                size="iconSm"
                aria-label={`${MESSAGES.ICON_PACK_REMOVE}: ${entry.name}`}
                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                onClick={() => {
                  void removeCustomIcon(id).then((removed) => {
                    if (removed) {
                      pushToast({
                        kind: "info",
                        title: MESSAGES.ICON_PACK_REMOVE,
                        description: MESSAGES.ICON_PACK_REMOVED,
                      });
                    }
                  });
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
