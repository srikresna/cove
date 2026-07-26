import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen, Search, Settings } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { NoteList } from "./NoteList";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setQuickSearchOpen, setSettingsOpen } = useWorkspaceStore();

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full bg-card border-r flex flex-col relative z-20 overflow-hidden flex-shrink-0"
      >
        <div className="border-b p-4 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-primary font-display text-sm font-semibold text-primary-foreground"
                  aria-hidden="true"
                >
                  C
                </div>
                <span className="font-display text-lg font-medium tracking-tight text-foreground">
                  {MESSAGES.APP_NAME}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                aria-label={isCollapsed ? MESSAGES.EXPAND_SIDEBAR : MESSAGES.COLLAPSE_SIDEBAR}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? MESSAGES.EXPAND_SIDEBAR : MESSAGES.COLLAPSE_SIDEBAR}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="p-3 space-y-3">
          <WorkspaceSwitcher />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Quick Search"
                onClick={() => setQuickSearchOpen(true)}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-4 h-4" aria-hidden="true" />
                  {!isCollapsed && <span>Quick Search...</span>}
                </div>
                {!isCollapsed && <Kbd>⌘K</Kbd>}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Quick Search (Cmd+K)</TooltipContent>
          </Tooltip>
        </div>

        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto p-3">
            <NoteList />
          </div>
        )}

        <div className="p-3 border-t">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                aria-label={MESSAGES.SETTINGS_TITLE}
                onClick={() => setSettingsOpen(true)}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                {!isCollapsed && <span>{MESSAGES.SETTINGS_TITLE}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{MESSAGES.SETTINGS_TITLE}</TooltipContent>
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};
