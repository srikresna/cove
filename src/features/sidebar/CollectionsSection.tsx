import { Layers, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useUIStore } from "../../store/useUIStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { CollapsibleSection } from "./CollapsibleSection";

export const CollectionsSection: React.FC = () => {
  const views = useViewStore((s) => s.views);
  const activeViewId = useViewStore((s) => s.activeViewId);
  const fetchViews = useViewStore((s) => s.fetchViews);
  const setActiveView = useViewStore((s) => s.setActiveView);
  const renameView = useViewStore((s) => s.renameView);
  const deleteView = useViewStore((s) => s.deleteView);
  const viewVersion = useViewStore((s) => s.version);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [deleting, setDeleting] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: viewVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    if (activeWorkspaceId) void fetchViews(activeWorkspaceId);
  }, [fetchViews, activeWorkspaceId, viewVersion]);

  if (views.length === 0) return null;

  const deleteTarget = views.find((v) => v.id === deleting) ?? null;

  return (
    <CollapsibleSection
      storageKey="cove-collections-open"
      label={MESSAGES.VIEW_HEADER}
      count={views.length}
    >
      <div className="space-y-0.5">
        {views.map((view) => (
          <ViewRow
            key={view.id}
            name={view.name}
            ruleCount={view.rules.length}
            isActive={view.id === activeViewId}
            onSelect={() => {
              setActiveView(view.id === activeViewId ? null : view.id);
              if (view.id !== activeViewId) {
                useUIStore.getState().setActivePage("library");
              }
            }}
            onRename={(next) => void renameView(view.id, next)}
            onDelete={() => setDeleting(view.id)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={MESSAGES.COLLECTION_DELETE_CONFIRM_TITLE}
        description={`"${deleteTarget?.name ?? ""}" — ${MESSAGES.COLLECTION_DELETE_CONFIRM_DESC}`}
        confirmLabel={MESSAGES.VIEW_DELETE}
        danger
        onConfirm={() => {
          if (deleting) void deleteView(deleting);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </CollapsibleSection>
  );
};

const ViewRow: React.FC<{
  name: string;
  ruleCount: number;
  isActive: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}> = ({ name, ruleCount, isActive, onSelect, onRename, onDelete }) => {
  const [renaming, setRenaming] = useState(false);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  if (renaming) {
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={name}
        aria-label={`${MESSAGES.PROP_RENAME}: ${name}`}
        onBlur={(e) => {
          if (cancelRef.current) {
            cancelRef.current = false;
            setRenaming(false);
            return;
          }
          const next = e.target.value.trim();
          setRenaming(false);
          if (next && next !== name) onRename(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            e.stopPropagation();
            cancelRef.current = true;
            e.currentTarget.blur();
          }
        }}
        className="h-7 w-full rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  return (
    <div className="group/viewrow flex items-center">
      <button
        type="button"
        aria-pressed={isActive}
        onClick={onSelect}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "border-border bg-card font-medium text-foreground shadow-sm"
            : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
      >
        <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{name}</span>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground/70">
          {ruleCount}
        </span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${name}: ${MESSAGES.VIEW_HEADER}`}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group/viewrow:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setRenaming(true)}>
            <Pencil aria-hidden="true" />
            {MESSAGES.PROP_RENAME}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={onDelete}
          >
            <Trash2 aria-hidden="true" />
            {MESSAGES.VIEW_DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
