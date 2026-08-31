import { Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { PromptDialog } from "../../components/ui/prompt-dialog";
import { MESSAGES } from "../../constants/messages";
import { useViewStore } from "../../store/useViewStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";

/**
 * The Collections directory: every saved view with rename/edit/delete
 * management and one-click apply.
 */
export const CollectionsTab: React.FC<{
  onOpenInDocs: () => void;
  onEditView: (viewId: string) => void;
}> = ({ onOpenInDocs, onEditView }) => {
  const views = useViewStore((s) => s.views);
  const activeViewId = useViewStore((s) => s.activeViewId);
  const setActiveView = useViewStore((s) => s.setActiveView);
  const renameView = useViewStore((s) => s.renameView);
  const deleteView = useViewStore((s) => s.deleteView);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const renameTarget = views.find((v) => v.id === renaming) ?? null;
  const deleteTarget = views.find((v) => v.id === deleting) ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-8 pt-8">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {MESSAGES.LIBRARY_COLLECTIONS_TITLE}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1 px-3 text-xs"
          onClick={() => onEditView("create")}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {MESSAGES.LIBRARY_COLLECTIONS_NEW}
        </Button>
      </div>

      {views.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {MESSAGES.LIBRARY_COLLECTIONS_EMPTY}
        </p>
      ) : (
        <div className="space-y-0.5">
          {views.map((view) => (
            <div key={view.id} className="group/crow flex items-center">
              <button
                type="button"
                aria-pressed={view.id === activeViewId}
                onClick={() => {
                  setActiveView(view.id === activeViewId ? null : view.id);
                  onOpenInDocs();
                }}
                className={
                  "flex min-w-0 flex-1 items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (view.id === activeViewId
                    ? "border-border bg-card font-medium text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground")
                }
              >
                <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{view.name}</span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground/70">
                  {view.rules.length} {MESSAGES.LIBRARY_TAGS_RULES}
                </span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${view.name}: ${MESSAGES.LIBRARY_COLLECTIONS_TITLE}`}
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/crow:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onSelect={() => onEditView(view.id)}>
                    <Pencil aria-hidden="true" />
                    Edit rules
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setRenaming(view.id)}>
                    <Pencil aria-hidden="true" />
                    {MESSAGES.PROP_RENAME}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={() => setDeleting(view.id)}
                  >
                    <Trash2 aria-hidden="true" />
                    {MESSAGES.VIEW_DELETE}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <PromptDialog
        open={renaming !== null}
        title={MESSAGES.PROP_RENAME}
        label={MESSAGES.COLLECTION_NAME_LABEL}
        placeholder={MESSAGES.COLLECTION_NAME_PLACEHOLDER}
        confirmLabel={MESSAGES.PROP_RENAME}
        initialValue={renameTarget?.name}
        onConfirm={(name) => {
          if (renaming) void renameView(renaming, name);
          setRenaming(null);
        }}
        onCancel={() => setRenaming(null)}
      />

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
    </div>
  );
};
