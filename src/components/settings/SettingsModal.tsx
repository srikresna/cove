import type { LucideIcon } from "lucide-react";
import { Database, Info, Palette, PenLine, ShieldCheck, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../store/useUIStore";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "../ui/dialog";
import { Kbd } from "../ui/kbd";
import { AboutSection } from "./AboutSection";
import { AppearanceSection } from "./AppearanceSection";
import { BackupSection } from "./BackupSection";
import { EditorSection } from "./EditorSection";
import { SecuritySection } from "./SecuritySection";

type SettingsCategoryId = "appearance" | "editor" | "security" | "backup" | "about";

interface SettingsCategory {
  id: SettingsCategoryId;
  label: string;
  icon: LucideIcon;
}

const SETTINGS_CATEGORIES: readonly SettingsCategory[] = [
  { id: "appearance", label: MESSAGES.SETTINGS_CATEGORY_APPEARANCE, icon: Palette },
  { id: "editor", label: MESSAGES.SETTINGS_CATEGORY_EDITOR, icon: PenLine },
  { id: "security", label: MESSAGES.SETTINGS_CATEGORY_SECURITY, icon: ShieldCheck },
  { id: "backup", label: MESSAGES.SETTINGS_CATEGORY_BACKUP, icon: Database },
  { id: "about", label: MESSAGES.SETTINGS_CATEGORY_ABOUT, icon: Info },
];

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const [active, setActive] = useState<SettingsCategoryId>("appearance");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setSettingsOpen(!isSettingsOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, setSettingsOpen]);

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent
        className="top-[8%] h-[min(620px,86vh)] w-[min(920px,94vw)] max-w-none -translate-y-0 gap-0 overflow-hidden p-0"
        hideClose
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between py-3 pr-3 pl-6">
            <DialogTitle className="text-base">{MESSAGES.SETTINGS_TITLE}</DialogTitle>
            <DialogClose
              aria-label={MESSAGES.SETTINGS_CLOSE}
              className="rounded-sm p-1 text-muted-foreground opacity-70 transition-opacity hover:bg-accent hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </DialogClose>
          </div>
          <div aria-hidden="true" className="waterline w-full shrink-0 opacity-70" />

          <div className="grid min-h-0 flex-1 grid-cols-[210px_1fr]">
            <nav
              className="flex min-h-0 flex-col gap-1 border-r bg-muted/30 p-2"
              aria-label={MESSAGES.SETTINGS_TITLE}
            >
              {SETTINGS_CATEGORIES.map((item) => {
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActive(item.id)}
                    className={cn(
                      "relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive && "bg-accent text-foreground",
                    )}
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute top-1/2 left-0 flex h-[28px] w-[6px] -translate-y-1/2 items-center justify-center overflow-hidden"
                      >
                        <span className="waterline w-[28px] rotate-90" />
                      </span>
                    )}
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
              <div className="mt-auto flex items-center gap-2 px-3 py-2 text-[11px] text-muted-foreground">
                <Kbd>Ctrl/⌘ ,</Kbd>
                <span>{MESSAGES.SETTINGS_SHORTCUT_HINT}</span>
              </div>
            </nav>

            <div className="min-h-0 min-w-0">
              <div className={active === "appearance" ? "h-full overflow-y-auto p-6" : "hidden"}>
                <AppearanceSection />
              </div>
              <div className={active === "editor" ? "h-full overflow-y-auto p-6" : "hidden"}>
                <EditorSection />
              </div>
              <div className={active === "security" ? "h-full overflow-y-auto p-6" : "hidden"}>
                <SecuritySection />
              </div>
              <div className={active === "backup" ? "h-full overflow-y-auto p-6" : "hidden"}>
                <BackupSection />
              </div>
              <div className={active === "about" ? "h-full overflow-y-auto p-6" : "hidden"}>
                <AboutSection />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
