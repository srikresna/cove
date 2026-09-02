import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { MESSAGES } from "../../constants/messages";
import type { FilterRule } from "../../domain/filters/FilterRule";
import { isRuleComplete } from "../../domain/filters/FilterRule";
import type { SavedView } from "../../domain/filters/SavedView";
import { selectNotesForView } from "../../domain/library/query";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { fetchLibraryInputs, libraryInputsKey } from "../../store/queryClient";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { TextSegmentedControl } from "./CollectionEditorSegments";
import { FilterBar } from "./FilterBar";

/**
 * The collection editor: one left pane that reads top-to-bottom — name,
 * rules, and the always-include list behind a segmented switch — plus a
 * live preview. A note is in the collection if it matches the rules OR is
 * on the always-include list.
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

  const [pane, setPane] = useState<"rules" | "docs">("rules");
  const [name, setName] = useState("");
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [allowIds, setAllowIds] = useState<string[]>([]);
  const [docQuery, setDocQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(view?.name ?? "");
    setRules(view ? view.rules.map((r) => ({ ...r })) : []);
    setAllowIds(view ? [...view.allowNoteIds] : []);
    setPane("rules");
    setDocQuery("");
  }, [open, view]);

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );
  const docResults = useMemo(() => {
    const q = docQuery.trim().toLowerCase();
    if (!q) return workspaceNotes;
    // Untitled notes display as "Untitled" — match what the list shows.
    return workspaceNotes.filter((n) =>
      (n.title || MESSAGES.UNTITLED_NOTE).toLowerCase().includes(q),
    );
  }, [workspaceNotes, docQuery]);

  // Live preview: the SAME selection the Library list applies (rules with
  // cache-aware deferral, OR-unioned with the always-include list). With no
  // complete rule yet the preview shows only manually added notes —
  // matching the save gate, which refuses a rule-less view.
  const { data: inputsData } = useQuery({
    queryKey: libraryInputsKey(activeWorkspaceId ?? ""),
    queryFn: () => fetchLibraryInputs(activeWorkspaceId ?? ""),
    enabled: open && activeWorkspaceId != null,
    placeholderData: (previous) => previous,
  });
  const matchedIds = useMemo(() => {
    const complete = rules.filter(isRuleComplete);
    if (complete.length === 0) return new Set<string>(allowIds);
    const selected = selectNotesForView(
      {
        notes: workspaceNotes,
        rules: complete,
        filterable: inputsData?.filterable ?? null,
        allowNoteIds: allowIds,
      },
      "updated-desc",
      { synthesizedPreview: true },
    );
    return new Set(selected.map((n) => n.id));
  }, [rules, allowIds, workspaceNotes, inputsData]);

  const matchedCount = matchedIds.size;
  const nameValid = name.trim().length > 0;
  const hasCompleteRule = rules.some(isRuleComplete);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex h-[80vh] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-[944px]">
        <DialogTitle className="sr-only">
          {view ? MESSAGES.COLLECTION_EDIT_TITLE : MESSAGES.COLLECTION_NEW_TITLE}
        </DialogTitle>

        {/* Header: plain title — the name lives in the body as a normal
            field, like every other form in the app. */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <h2 className="text-base font-semibold text-foreground">
            {view ? MESSAGES.COLLECTION_EDIT_TITLE : MESSAGES.COLLECTION_NEW_TITLE}
          </h2>
        </div>

        {/* Body. */}
        <div className="flex min-h-0 flex-1">
          <div className="flex min-h-0 w-[400px] flex-col gap-3 overflow-y-auto border-r p-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="collection-editor-name" className="text-[13px] text-muted-foreground">
                {MESSAGES.COLLECTION_NAME_LABEL}
              </label>
              <Input
                id="collection-editor-name"
                autoFocus
                value={name}
                placeholder={MESSAGES.COLLECTION_NAME_PLACEHOLDER}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-full text-[13px]"
              />
            </div>

            <TextSegmentedControl
              value={pane}
              onChange={(next) => setPane(next === "docs" ? "docs" : "rules")}
              options={[
                { value: "rules", label: MESSAGES.COLLECTION_PANE_RULES },
                { value: "docs", label: MESSAGES.COLLECTION_PANE_DOCS },
              ]}
            />

            {pane === "rules" ? (
              <FilterBar rules={rules} onChange={setRules} />
            ) : (
              <>
                <p className="text-xs leading-5 text-muted-foreground">
                  {MESSAGES.COLLECTION_DOCS_TIP}
                </p>
                <div className="relative">
                  <Search
                    className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={docQuery}
                    placeholder={MESSAGES.COLLECTION_DOCS_SEARCH}
                    aria-label={MESSAGES.COLLECTION_DOCS_SEARCH}
                    onChange={(e) => setDocQuery(e.target.value)}
                    className="h-8 pl-7 text-[13px]"
                  />
                </div>
                <div className="space-y-0.5">
                  {docResults.map((note) => {
                    const checked = allowIds.includes(note.id);
                    return (
                      <label
                        key={note.id}
                        className="flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-[13px] transition-colors hover:bg-accent"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAllowIds((prev) =>
                              checked ? prev.filter((id) => id !== note.id) : [...prev, note.id],
                            )
                          }
                          className="h-4 w-4 rounded border-border accent-[--primary]"
                        />
                        <span aria-hidden="true" className="shrink-0 text-sm">
                          {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                        </span>
                        <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
                      </label>
                    );
                  })}
                  {docResults.length === 0 && (
                    <p className="py-6 text-center text-[13px] text-muted-foreground">
                      {MESSAGES.COLLECTION_DOCS_NO_MATCH}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Live preview. */}
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 pb-2">
              <span className="text-[13px] font-medium text-foreground">
                {MESSAGES.COLLECTION_PREVIEW}
              </span>
              <span className="rounded-full bg-muted px-2 text-[11px] text-muted-foreground">
                {matchedCount}
              </span>
            </div>
            {matchedCount === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {MESSAGES.LIBRARY_EMPTY_FILTERED}
              </p>
            ) : (
              <div className="space-y-0.5">
                {workspaceNotes
                  .filter((n) => matchedIds.has(n.id))
                  .map((note) => (
                    <div
                      key={note.id}
                      className={cn("flex h-9 items-center gap-2 rounded-md px-2 text-[13px]")}
                    >
                      <span aria-hidden="true" className="shrink-0 text-base">
                        {note.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
                      </span>
                      <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
                      {allowIds.includes(note.id) && (
                        <span className="ml-auto shrink-0 rounded border px-1.5 text-[10px] text-muted-foreground">
                          {MESSAGES.COLLECTION_ADDED_BADGE}
                        </span>
                      )}
                    </div>
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
              disabled={!nameValid || !hasCompleteRule}
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
