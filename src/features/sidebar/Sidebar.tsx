import { motion } from "framer-motion";
import { CalendarCheck, ChevronDown, Library, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Kbd } from "../../components/ui/kbd";
import { TooltipProvider } from "../../components/ui/tooltip";
import { MESSAGES } from "../../constants/messages";
import { useNotes } from "../../hooks/useNotes";
import { noteActions } from "../../store/noteActions";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { CollectionsSection } from "./CollectionsSection";
import { FavoritesSection } from "./FavoritesSection";
import { RecentSection } from "./RecentSection";
import { TagsSection } from "./TagsSection";
import { TemplatesSection } from "./TemplatesSection";
import { WorkspaceRail } from "./WorkspaceRail";

const navRow =
  "flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-[13px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDeleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const { workspaces, activeWorkspaceId, deleteWorkspace } = useWorkspaceStore();
  const setQuickSearchOpen = useUIStore((s) => s.setQuickSearchOpen);
  const setCreateModalOpen = useUIStore((s) => s.setCreateModalOpen);
  const activePage = useUIStore((s) => s.activePage);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const createNote = noteActions.createNote;
  const notes = useNotes();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const noteCount = notes.filter((n) => n.workspaceId === activeWorkspace?.id).length;

  const handleDeleteWorkspace = () => {
    if (activeWorkspace) deleteWorkspace(activeWorkspace.id);
    setDeleteWorkspaceOpen(false);
  };

  const handleNewNote = () => {
    if (activeWorkspaceId) createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE);
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

            {/* Search + new-page row, then flat nav links above the
                scrollable accordion area. The search trigger is the quiet
                first row of the nav: inset fill, nav-row radius, one
                shortcut chip — not a floating white capsule. */}
            <div className="flex items-center gap-1.5 px-3 pt-3">
              <button
                type="button"
                aria-label="Quick Search"
                onClick={() => setQuickSearchOpen(true)}
                className="flex h-8 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-transparent bg-muted/60 pl-2 pr-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate leading-4">Search</span>
                </span>
                <Kbd className="h-4 border-border/60 bg-background/70 px-1 text-[10px] leading-4">
                  ⌘K
                </Kbd>
              </button>
              <button
                type="button"
                aria-label={MESSAGES.CREATE_NEW_NOTE}
                title={MESSAGES.CREATE_NEW_NOTE}
                onClick={handleNewNote}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-0.5 px-3 pt-2">
              <button
                type="button"
                aria-current={activePage === "library" ? "page" : undefined}
                onClick={() => setActivePage("library")}
                className={`${navRow} ${
                  activePage === "library"
                    ? "border-border bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <Library className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{MESSAGES.NAV_LIBRARY}</span>
              </button>
              <button
                type="button"
                aria-current={activePage === "journals" ? "page" : undefined}
                onClick={() => setActivePage("journals")}
                className={`${navRow} ${
                  activePage === "journals"
                    ? "border-border bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{MESSAGES.NAV_JOURNALS}</span>
              </button>
            </div>

            {/* The ONLY scrolling element in the sidebar: bounded accordions,
                never a nested list scroller (that was the double-scrollbar
                bug). */}
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <RecentSection />
              <FavoritesSection />
              <CollectionsSection />
              <TemplatesSection />
              <TagsSection />
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
