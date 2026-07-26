import { motion } from "framer-motion";
import { ChevronDown, Plus, Search, Settings, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Kbd } from "../ui/kbd";
import { TooltipProvider } from "../ui/tooltip";
import { NoteList } from "./NoteList";
import { WorkspaceRail } from "./WorkspaceRail";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const {
    workspaces,
    activeWorkspaceId,
    setQuickSearchOpen,
    setSettingsOpen,
    setCreateModalOpen,
    deleteWorkspace,
  } = useWorkspaceStore();
  const notes = useNoteStore((s) => s.notes);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const noteCount = notes.filter((n) => n.workspaceId === activeWorkspace?.id).length;

  const handleDeleteWorkspace = () => {
    if (activeWorkspace) deleteWorkspace(activeWorkspace.id);
    setDeleteWorkspaceOpen(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="relative z-20 flex h-full flex-shrink-0">
        <WorkspaceRail
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((v) => !v)}
        />

        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 0 : 232 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full overflow-hidden bg-card"
        >
          <div className="flex h-full w-[232px] flex-col border-r">
            <div className="border-b p-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Current workspace: ${activeWorkspace?.name || "Workspace"}`}
                    className="flex w-full min-w-0 items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-lg"
                      aria-hidden="true"
                    >
                      {activeWorkspace?.emoji || "🚀"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {activeWorkspace?.name || "Workspace"}
                      </span>
                      <span className="block font-mono text-[10px] text-muted-foreground">
                        {noteCount} {noteCount === 1 ? "note" : "notes"}
                      </span>
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onSelect={() => setCreateModalOpen(true)}>
                    <Plus className="text-muted-foreground" aria-hidden="true" />
                    <span>{MESSAGES.CREATE_WORKSPACE_TITLE}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={workspaces.length <= 1}
                    onSelect={() => setDeleteWorkspaceOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 aria-hidden="true" />
                    <span>{MESSAGES.DELETE_WORKSPACE}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="p-3 pb-0">
              <button
                type="button"
                aria-label="Quick Search"
                onClick={() => setQuickSearchOpen(true)}
                className="flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 truncate">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Search</span>
                </span>
                <Kbd>⌘K</Kbd>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <NoteList />
            </div>

            <div className="border-t p-3">
              <Button
                variant="ghost"
                aria-label={MESSAGES.SETTINGS_TITLE}
                onClick={() => setSettingsOpen(true)}
                className="w-full justify-start"
              >
                <Settings className="text-muted-foreground" aria-hidden="true" />
                <span>{MESSAGES.SETTINGS_TITLE}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </aside>

      <ConfirmDialog
        open={isDeleteWorkspaceOpen}
        title={MESSAGES.DELETE_WORKSPACE_CONFIRM_TITLE}
        description={`"${activeWorkspace?.name ?? ""}" — ${MESSAGES.DELETE_WORKSPACE_CONFIRM_DESC}`}
        confirmLabel={MESSAGES.DELETE_WORKSPACE_CONFIRM_BUTTON}
        danger
        onConfirm={handleDeleteWorkspace}
        onCancel={() => setDeleteWorkspaceOpen(false)}
      />
    </TooltipProvider>
  );
};
