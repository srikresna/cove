import { Layers, MoreHorizontal, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
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

export const CollectionsTab: React.FC<{
  onOpenInDocs: () => void;
  onEditView: (viewId: string) => void;
  onCreateView: () => void;
}> = ({ onOpenInDocs, onEditView, onCreateView }) => {
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
    <div className="mx-auto w-full max-w-2xl px-6 pt-6">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {MESSAGES.LIBRARY_COLLECTIONS_TITLE}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 gap-1 px-3 text-[13px] leading-4"
          onClick={onCreateView}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {MESSAGES.LIBRARY_COLLECTIONS_NEW}
        </Button>
      </div>

      {views.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="max-w-72 text-[13px] text-muted-foreground">
            {MESSAGES.LIBRARY_COLLECTIONS_EMPTY}
          </p>
          <Button variant="outline" size="sm" onClick={onCreateView}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {MESSAGES.LIBRARY_COLLECTIONS_NEW}
          </Button>
        </div>
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
                  "flex h-11 min-w-0 flex-1 items-center gap-3 rounded-md border px-3 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (view.id === activeViewId
                    ? "border-border bg-card font-medium text-foreground shadow-sm"
                    : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground")
                }
              >
                <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate font-medium leading-4 text-foreground">{view.name}</span>
                <span className="ml-auto shrink-0 text-[11px] leading-4 text-muted-foreground">
                  {view.rules.length} {view.rules.length === 1 ? "rule" : "rules"}
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
                    <SlidersHorizontal aria-hidden="true" />
                    {MESSAGES.FILTER_EDIT_RULES}
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
