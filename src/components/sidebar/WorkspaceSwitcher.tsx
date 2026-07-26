import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { MESSAGES } from "../../constants/messages";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, activeWorkspaceId, setActiveWorkspace, setCreateModalOpen, deleteWorkspace } =
    useWorkspaceStore();

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Current workspace: ${activeWorkspace?.name || "Workspace"}`}
          className="flex w-full items-center gap-2.5 rounded-md border bg-background px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-base"
            aria-hidden="true"
          >
            {activeWorkspace?.emoji || "🚀"}
          </span>
          <span className="flex-1 truncate text-sm font-medium">
            {activeWorkspace?.name || "Workspace"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>

        <div className="max-h-60 overflow-y-auto">
          {workspaces.map((ws) => {
            const isActive = ws.id === activeWorkspaceId;
            return (
              <DropdownMenuItem key={ws.id} onSelect={() => setActiveWorkspace(ws.id)}>
                <span className="text-base shrink-0" aria-hidden="true">
                  {ws.emoji}
                </span>
                <span className="min-w-0 flex-1 truncate">{ws.name}</span>
                {isActive && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
                {workspaces.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Delete workspace ${ws.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWorkspace(ws.id);
                    }}
                    className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span>{MESSAGES.CREATE_WORKSPACE_TITLE}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
