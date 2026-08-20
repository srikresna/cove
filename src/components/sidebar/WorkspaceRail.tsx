import { PanelLeftClose, PanelLeftOpen, Plus, Settings, Trash2 } from "lucide-react";
import type React from "react";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface WorkspaceRailProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

const tile =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const WorkspaceRail: React.FC<WorkspaceRailProps> = ({ isCollapsed, onToggleCollapsed }) => {
  const { workspaces, activeWorkspaceId, setActiveWorkspace } = useWorkspaceStore();
  const setCreateModalOpen = useUIStore((s) => s.setCreateModalOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const isTrashOpen = useUIStore((s) => s.isTrashOpen);
  const setTrashOpen = useUIStore((s) => s.setTrashOpen);

  return (
    <div className="flex h-full w-[52px] flex-shrink-0 flex-col items-center gap-2 py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={isCollapsed ? MESSAGES.EXPAND_SIDEBAR : MESSAGES.COLLAPSE_SIDEBAR}
            onClick={onToggleCollapsed}
            className={cn(tile, "text-muted-foreground hover:bg-accent hover:text-foreground")}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isCollapsed ? MESSAGES.EXPAND_SIDEBAR : MESSAGES.COLLAPSE_SIDEBAR}
        </TooltipContent>
      </Tooltip>
      <div className="h-px w-6 bg-border" aria-hidden="true" />

      <div className="flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto py-0.5">
        {workspaces.map((ws) => {
          const isActive = ws.id === activeWorkspaceId;
          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`Workspace: ${ws.name}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={cn(
                    tile,
                    "text-lg",
                    isActive
                      ? "border bg-card shadow-sm ring-1 ring-ring/20"
                      : "border border-transparent opacity-70 hover:border-border hover:bg-card hover:opacity-100",
                  )}
                >
                  <span aria-hidden="true">{ws.emoji}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{ws.name}</TooltipContent>
            </Tooltip>
          );
        })}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={MESSAGES.CREATE_WORKSPACE_TITLE}
              onClick={() => setCreateModalOpen(true)}
              className={cn(
                tile,
                "border bg-card text-muted-foreground shadow-sm hover:text-foreground",
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{MESSAGES.CREATE_WORKSPACE_TITLE}</TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={MESSAGES.TRASH_TITLE}
            aria-pressed={isTrashOpen}
            onClick={() => setTrashOpen(!isTrashOpen)}
            className={cn(
              tile,
              isTrashOpen
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{MESSAGES.TRASH_TITLE}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={MESSAGES.SETTINGS_TITLE}
            onClick={() => setSettingsOpen(true)}
            className={cn(tile, "text-muted-foreground hover:bg-accent hover:text-foreground")}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{MESSAGES.SETTINGS_TITLE}</TooltipContent>
      </Tooltip>
    </div>
  );
};
