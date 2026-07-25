import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Search, Settings } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { NoteList } from "./NoteList";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setQuickSearchOpen, setSettingsOpen } = useWorkspaceStore();

  return (
    <Tooltip.Provider delayDuration={300}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-cream-paper border-r-[1.5px] border-charcoal flex flex-col relative z-20 overflow-hidden shadow-card-subtle flex-shrink-0"
      >
        <div className="p-4 flex items-center justify-between border-b border-charcoal/10">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div
                  className="w-7 h-7 rounded-[10px] bg-marker-orange text-cream-paper font-black text-sm flex items-center justify-center border border-charcoal shadow-sm"
                  aria-hidden="true"
                >
                  C
                </div>
                <span className="font-extrabold text-lg text-cocoa-ink tracking-tight">
                  {MESSAGES.APP_NAME}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label={isCollapsed ? MESSAGES.EXPAND_SIDEBAR : MESSAGES.COLLAPSE_SIDEBAR}
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 rounded-[10px] bg-cream-paper border border-charcoal text-charcoal shadow-paper-lift hover:scale-105 transition-transform outline-none"
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="z-50 px-2.5 py-1 rounded-[8px] bg-charcoal text-cream-paper text-[10px] font-bold shadow-md outline-none"
              >
                {isCollapsed ? MESSAGES.EXPAND_SIDEBAR : MESSAGES.COLLAPSE_SIDEBAR}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        <div className="p-3 space-y-3">
          <WorkspaceSwitcher />

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label="Quick Search"
                onClick={() => setQuickSearchOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal text-xs font-semibold text-cocoa-ink hover:bg-cream-paper transition-all outline-none"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-4 h-4 text-marker-orange" aria-hidden="true" />
                  {!isCollapsed && <span>Quick Search...</span>}
                </div>
                {!isCollapsed && (
                  <kbd className="px-1.5 py-0.5 rounded-[6px] bg-cream-paper border border-charcoal text-[9px] font-extrabold text-charcoal">
                    ⌘K
                  </kbd>
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="z-50 px-2.5 py-1 rounded-[8px] bg-charcoal text-cream-paper text-[10px] font-bold shadow-md outline-none"
              >
                Quick Search (Cmd+K)
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-3">
            <NoteList />
          </div>
        )}

        <div className="p-3 border-t border-charcoal/10">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label={MESSAGES.SETTINGS_TITLE}
                onClick={() => setSettingsOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-[12px] text-xs font-semibold text-charcoal hover:bg-dew-drop transition-all outline-none"
              >
                <Settings className="w-4 h-4 text-marker-orange" aria-hidden="true" />
                {!isCollapsed && <span>{MESSAGES.SETTINGS_TITLE}</span>}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="z-50 px-2.5 py-1 rounded-[8px] bg-charcoal text-cream-paper text-[10px] font-bold shadow-md outline-none"
              >
                {MESSAGES.SETTINGS_TITLE}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </motion.aside>
    </Tooltip.Provider>
  );
};
