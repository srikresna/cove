import { FileText } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import type { FilterRule } from "../../domain/filters/FilterRule";
import { isRuleComplete } from "../../domain/filters/FilterRule";
import type { SavedView } from "../../domain/filters/SavedView";
import { selectNotesForView } from "../../domain/library/query";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { readListCache } from "../../services/library/libraryListCache";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { FilterBar } from "./FilterBar";

/**
 * A large dialog with Docs/Rules tabs, a live preview of the matching notes,
 * and a footer with match counts + Save/Create. The "Docs" tab is the manual
 * allow-list (a note is in the collection if it matches the rules OR is
 * checked there).
 */
export const CollectionEditorDialog: React.FC<{
  open: boolean;
  /** null = create mode. */
  view: SavedView | null;
  onCancel: () => void;
  onSave: (next: { name: string; rules: FilterRule[]; allowNoteIds: string[] }) => void;
}> = ({ open, view, onCancel, onSave }) => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNotes();
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);

  const [tab, setTab] = useState<"rules" | "docs">("rules");
  const [name, setName] = useState("");
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [allowIds, setAllowIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setName(view?.name ?? "");
    setRules(view ? view.rules.map((r) => ({ ...r })) : []);
    setAllowIds(view ? [...view.allowNoteIds] : []);
    setTab("rules");
  }, [open, view]);

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );

  // Live preview: the SAME selection the Library list applies (rules with
  // cache-aware deferral, OR-unioned with the manual allow-list). With no
  // complete rule yet the preview shows only manually added notes — matching
  // the save gate, which refuses a rule-less view.
  const matchedIds = useMemo(() => {
    const complete = rules.filter(isRuleComplete);
    if (complete.length === 0) return new Set<string>(allowIds);
    const cache = activeWorkspaceId ? readListCache(activeWorkspaceId) : undefined;
    const selected = selectNotesForView(
      {
        notes: workspaceNotes,
        rules: complete,
        filterable: cache?.filterable ?? null,
        knownEmptyIds: cache?.knownEmptyIds,
        allowNoteIds: allowIds,
      },
      "updated-desc",
      { synthesizedPreview: true },
    );
    return new Set(selected.map((n) => n.id));
  }, [rules, allowIds, workspaceNotes, activeWorkspaceId]);

  const matchedCount = matchedIds.size;
  const nameValid = name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex h-[80vh] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-[944px]">
        <DialogTitle className="sr-only">{MESSAGES.LIBRARY_COLLECTIONS_TITLE}</DialogTitle>

        {/* Header: editable name + Docs/Rules tabs. */}
        <div className="flex items-center gap-4 border-b px-6 py-4">
          <Input
            autoFocus
            value={name}
            placeholder={MESSAGES.COLLECTION_NAME_PLACEHOLDER}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-64 text-base font-semibold"
            aria-label={MESSAGES.COLLECTION_NAME_LABEL}
          />
          <div className="ml-auto flex items-center gap-3">
            {(
              [
                ["rules", "Rules"],
                ["docs", "Docs"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-current={tab === value ? "true" : undefined}
                onClick={() => setTab(value)}
                className={cn(
                  "rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  tab === value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body. */}
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 w-[400px] flex-col gap-3 overflow-y-auto border-r p-4">
            {tab === "rules" ? (
              <>
                <p className="text-xs leading-5 text-muted-foreground">
                  {MESSAGES.COLLECTION_SAVE_NEW_TIPS}
                </p>
                <FilterBar rules={rules} onChange={setRules} />
              </>
            ) : (
              <>
                <p className="text-xs leading-5 text-muted-foreground">
                  Checked notes are always in the collection, regardless of the rules.
                </p>
                <div className="space-y-0.5">
                  {workspaceNotes.map((note) => {
                    const checked = allowIds.includes(note.id);
                    return (
                      <label
                        key={note.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAllowIds((prev) =>
                              checked ? prev.filter((id) => id !== note.id) : [...prev, note.id],
                            )
                          }
                          className="h-4 w-4 rounded border-border accent-[--primary] "
                        />
                        <span aria-hidden="true" className="shrink-0 text-sm">
                          {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                        </span>
                        <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Live preview. */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <p className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Preview ({matchedCount})
            </p>
            {matchedCount === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {MESSAGES.LIBRARY_EMPTY_FILTERED}
              </p>
            ) : (
              <div className="space-y-0.5">
                {workspaceNotes
                  .filter((n) => matchedIds.has(n.id))
                  .map((note) => (
                    <button
                      key={note.id}
                      type="button"
                      onClick={() => {
                        onCancel();
                        setActiveNoteId(note.id);
                      }}
                      className="flex h-[42px] w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span aria-hidden="true" className="shrink-0 text-base">
                        {note.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
                      </span>
                      <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
                      {allowIds.includes(note.id) && (
                        <span className="ml-auto shrink-0 rounded border px-1.5 text-[10px] text-muted-foreground">
                          added
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer. */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <span className="text-xs text-muted-foreground">
            {allowIds.length} added · {matchedCount} total
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel}>
              {MESSAGES.CANCEL}
            </Button>
            <Button
              disabled={!nameValid}
              onClick={() => onSave({ name: name.trim(), rules, allowNoteIds: allowIds })}
            >
              {view ? MESSAGES.COLLECTION_UPDATE : MESSAGES.COLLECTION_SAVE}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
