import { motion } from "framer-motion";
import { ChevronDown, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Kbd } from "../ui/kbd";
import { TooltipProvider } from "../ui/tooltip";
import { LibrarySection } from "./LibrarySection";
import { NoteList } from "./NoteList";
import { TagsSection } from "./TagsSection";
import { WorkspaceRail } from "./WorkspaceRail";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const { workspaces, activeWorkspaceId, deleteWorkspace } = useWorkspaceStore();
  const setQuickSearchOpen = useUIStore((s) => s.setQuickSearchOpen);
  const setCreateModalOpen = useUIStore((s) => s.setCreateModalOpen);
  const notes = useNoteStore((s) => s.notes);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const noteCount = notes.filter((n) => n.workspaceId === activeWorkspace?.id).length;

  const handleDeleteWorkspace = () => {
    if (activeWorkspace) deleteWorkspace(activeWorkspace.id);
    setDeleteWorkspaceOpen(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="relative z-20 flex h-full flex-shrink-0 border-r bg-background">
        <WorkspaceRail
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((v) => !v)}
        />

        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 0 : 224 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="h-full overflow-hidden"
        >
          <div
            aria-hidden={isCollapsed}
            className="flex h-full w-[224px] flex-col"
            {...(isCollapsed ? ({ inert: true } as Record<string, boolean>) : {})}
          >
            <div className="px-4 pb-1 pt-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Current workspace: ${activeWorkspace?.name || "Workspace"}`}
                    className="flex w-full min-w-0 items-center justify-between gap-2 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold tracking-tight text-foreground">
                        {activeWorkspace?.name || "Workspace"}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
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

            <div className="px-3 pt-3">
              <button
                type="button"
                aria-label="Quick Search"
                onClick={() => setQuickSearchOpen(true)}
                className="flex w-full items-center justify-between rounded-full border bg-card py-1.5 pl-3 pr-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-2 truncate">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  <span>Search</span>
                </span>
                <span className="flex items-center gap-1">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <LibrarySection />
              <TagsSection />
              <NoteList />
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
