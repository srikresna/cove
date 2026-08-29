import { Check, Plus, Save, Tag as TagIcon, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { blockSuiteEditorService, propertyService, savedViewService } from "../../di/container";
import type { PropertyDefinition } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PromptDialog } from "../ui/prompt-dialog";
import { CollectionEditorDialog } from "./CollectionEditorDialog";
import { CollectionsTab } from "./CollectionsTab";
import type { LibraryDisplayPrefs } from "./DisplayMenu";
import { ExplorerHeader, type LibraryTab, type LibraryViewMode } from "./ExplorerHeader";
import { FilterBar } from "./FilterBar";
import { LibraryNoteList, type LibrarySort } from "./LibraryNoteList";
import { TagsTab } from "./TagsTab";

const VIEW_MODE_KEY = "cove-library-viewmode";
const DISPLAY_KEY_PREFIX = "cove-library-display:";
const SORT_KEY = "cove-library-sort";

const displayKeyFor = (mode: LibraryViewMode): string => `${DISPLAY_KEY_PREFIX}${mode}`;

const isViewMode = (value: string): value is LibraryViewMode =>
  ["list", "grid", "masonry"].includes(value);
const isLibrarySort = (value: string): value is LibrarySort =>
  [
    "custom",
    "updated-desc",
    "updated-asc",
    "created-desc",
    "created-asc",
    "title-asc",
    "title-desc",
  ].includes(value);

const DEFAULT_PREFS: LibraryDisplayPrefs = {
  groupBy: "none",
  hiddenProps: [],
  showIcon: true,
  showBody: true,
};

const isDisplayPrefs = (value: unknown): value is LibraryDisplayPrefs => {
  if (!value || typeof value !== "object") return false;
  const prefs = value as Partial<LibraryDisplayPrefs>;
  return (
    typeof prefs.groupBy !== "undefined" &&
    Array.isArray(prefs.hiddenProps) &&
    typeof prefs.showIcon === "boolean" &&
    typeof prefs.showBody === "boolean"
  );
};

/**
 * The all-docs page: a 52px header bar with Docs/Collections/Tags navigation,
 * view modes, the Display menu and the New dropdown; below it the collection
 * chip strip and the inline filter area, then the virtualized note list.
 */
export const LibraryPage: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNoteStore((s) => s.notes);
  const createNote = useNoteStore((s) => s.createNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const tags = useTagStore((s) => s.tags);
  const activeTagId = useTagStore((s) => s.activeTagId);
  const setTagFilter = useTagStore((s) => s.setTagFilter);

  const views = useViewStore((s) => s.views);
  const activeViewId = useViewStore((s) => s.activeViewId);
  const setActiveView = useViewStore((s) => s.setActiveView);
  const clearDraft = useViewStore((s) => s.clearDraft);
  const saveDraftAsView = useViewStore((s) => s.saveDraftAsView);
  const updateActiveViewRules = useViewStore((s) => s.updateActiveViewRules);
  const draftRules = useViewStore((s) => s.draftRules);

  const [tab, setTab] = useState<LibraryTab>("docs");
  const [viewMode, setViewMode] = useState<LibraryViewMode>(() => {
    const stored = localStorage.getItem(VIEW_MODE_KEY) ?? "";
    return isViewMode(stored) ? stored : "list";
  });
  const [sort, setSort] = useState<LibrarySort>(() => {
    const stored = localStorage.getItem(SORT_KEY) ?? "";
    return isLibrarySort(stored) ? stored : "updated-desc";
  });
  // Display prefs persist PER VIEW MODE (list/grid/masonry).
  const [prefs, setPrefs] = useState<LibraryDisplayPrefs>(() => {
    const readPrefs = (mode: LibraryViewMode): LibraryDisplayPrefs => {
      try {
        const parsed = JSON.parse(localStorage.getItem(displayKeyFor(mode)) ?? "null");
        return isDisplayPrefs(parsed) ? parsed : DEFAULT_PREFS;
      } catch {
        return DEFAULT_PREFS;
      }
    };
    const initialMode = localStorage.getItem(VIEW_MODE_KEY) ?? "";
    return readPrefs(isViewMode(initialMode) ? initialMode : "list");
  });
  const [filterEditing, setFilterEditing] = useState(false);
  const [savePromptOpen, setSavePromptOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState<"create" | string | null>(null);

  // Stack-eligible defs feed the Display menu (grouping + chip toggles).
  const [defs, setDefs] = useState<PropertyDefinition[]>([]);
  const propertyVersion = usePropertyStore((s) => s.version);

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    propertyService
      .listDefinitions()
      .then(setDefs)
      .catch(() => setDefs([]));
  }, [propertyVersion]);

  const changePrefs = useCallback(
    (next: Partial<LibraryDisplayPrefs>) => {
      setPrefs((prev) => {
        const merged = { ...prev, ...next };
        localStorage.setItem(displayKeyFor(viewMode), JSON.stringify(merged));
        return merged;
      });
    },
    [viewMode],
  );

  const chooseSort = (next: LibrarySort) => {
    setSort(next);
    localStorage.setItem(SORT_KEY, next);
  };
  const chooseViewMode = (next: LibraryViewMode) => {
    // Swap the per-mode prefs alongside the mode itself.
    setViewMode((prevMode) => {
      localStorage.setItem(displayKeyFor(prevMode), JSON.stringify(prefs));
      localStorage.setItem(VIEW_MODE_KEY, next);
      try {
        const parsed = JSON.parse(localStorage.getItem(displayKeyFor(next)) ?? "null");
        setPrefs(isDisplayPrefs(parsed) ? parsed : DEFAULT_PREFS);
      } catch {
        setPrefs(DEFAULT_PREFS);
      }
      return next;
    });
  };

  const handleNewNote = useCallback(() => {
    if (activeWorkspaceId) void createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE);
  }, [activeWorkspaceId, createNote]);

  const handleNewEdgeless = useCallback(() => {
    if (!activeWorkspaceId) return;
    void createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE).then((note) => {
      if (note) void updateNote(note.id, { docMode: "edgeless" });
    });
  }, [activeWorkspaceId, createNote, updateNote]);

  // Markdown import: multi-file input → one note per .md (the transformer
  // needs at least one existing doc as its schema donor).
  const importInputRef = useRef<HTMLInputElement>(null);
  const handleImportMarkdown = useCallback(() => {
    if (notes.length === 0) {
      useNotificationStore.getState().pushToast({
        kind: "info",
        title: MESSAGES.LIBRARY_IMPORT_NEEDS_NOTE,
        description: MESSAGES.LIBRARY_IMPORT_NEEDS_NOTE_DESC,
      });
      return;
    }
    importInputRef.current?.click();
  }, [notes.length]);

  const handleImportFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !activeWorkspaceId) return;
      let imported = 0;
      let failed = 0;
      let notifiedFailed = 0;
      for (const file of Array.from(files)) {
        try {
          const docId = await blockSuiteEditorService.importMarkdownFile(file);
          if (docId) imported += 1;
          else failed += 1;
        } catch (err) {
          // Per-file failures shouldn't abort the batch; the toast reports
          // the counts. Persistence failures were already toasted by the
          // doc-created handler — count them separately.
          if (
            err instanceof Error &&
            (err as Error & { coveAlreadyNotified?: boolean }).coveAlreadyNotified
          ) {
            notifiedFailed += 1;
          } else {
            failed += 1;
          }
        }
      }
      if (imported > 0 || notifiedFailed > 0) {
        await useNoteStore.getState().refreshNotesInPlace(activeWorkspaceId);
      }
      const totalFailed = failed + notifiedFailed;
      if (imported > 0 || totalFailed > 0) {
        const description = [
          MESSAGES.LIBRARY_IMPORTED_DESC.replace("{n}", String(imported)),
          totalFailed > 0 ? `${totalFailed} file(s) failed.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        useNotificationStore.getState().pushToast({
          kind: imported > 0 ? "info" : "error",
          title: imported > 0 ? MESSAGES.LIBRARY_IMPORTED : MESSAGES.SOMETHING_WENT_WRONG,
          description,
        });
      }
    },
    [activeWorkspaceId],
  );

  // An applied tag filter must always be visible and one-click clearable —
  // the tag entry path (Tags tab / sidebar) never opens the rule editor.
  const filterAreaVisible = draftRules.length > 0 || filterEditing || activeTagId !== null;
  const activeTag = tags.find((t) => t.id === activeTagId);

  const handleSaveFilter = useCallback(() => {
    if (activeViewId) {
      void updateActiveViewRules();
      return;
    }
    setSavePromptOpen(true);
  }, [activeViewId, updateActiveViewRules]);

  const handleCancelFilter = useCallback(() => {
    clearDraft();
    setFilterEditing(false);
    void setTagFilter(null);
  }, [clearDraft, setTagFilter]);

  const openTagInDocs = useCallback(
    (tagId: string) => {
      setTab("docs");
      void setTagFilter(tagId);
    },
    [setTagFilter],
  );

  // Simple-typed custom defs are groupable and chip-toggleable.
  const eligibleDefs = useMemo(
    () =>
      defs.filter(
        (d) =>
          d.show !== "always-hide" &&
          !d.id.startsWith("system:") &&
          [
            "text",
            "number",
            "date",
            "select",
            "status",
            "multiSelect",
            "checkbox",
            "person",
            "url",
          ].includes(d.type),
      ),
    [defs],
  );

  const docsBody = useMemo(
    () => <LibraryNoteList sort={sort} viewMode={viewMode} prefs={prefs} defs={eligibleDefs} />,
    [sort, viewMode, prefs, eligibleDefs],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ExplorerHeader
        tab={tab}
        onTabChange={setTab}
        viewMode={viewMode}
        onViewModeChange={chooseViewMode}
        prefs={prefs}
        onPrefsChange={changePrefs}
        orderBy={sort}
        onOrderByChange={chooseSort}
        defs={eligibleDefs}
        onNewNote={handleNewNote}
        onNewEdgeless={handleNewEdgeless}
        onImportMarkdown={handleImportMarkdown}
      />

      <input
        ref={importInputRef}
        type="file"
        multiple
        accept=".md,.markdown,text/markdown"
        className="hidden"
        onChange={(e) => {
          void handleImportFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {tab === "collections" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CollectionsTab
            onEditView={(viewId) => setEditorOpen(viewId)}
            onOpenInDocs={() => {
              setTab("docs");
              setFilterEditing(true);
            }}
          />
        </div>
      ) : tab === "tags" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <TagsTab onOpenTag={openTagInDocs} />
        </div>
      ) : (
        <>
          {/* Collection chip strip. */}
          <div className="flex items-center gap-1 px-6 pt-3">
            <button
              type="button"
              aria-pressed={activeViewId === null}
              onClick={() => setActiveView(null)}
              className={cn(
                "h-6 min-w-11 rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeViewId === null
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {MESSAGES.LIBRARY_COLLECTION_ALL}
            </button>
            {views.map((view) => {
              const isActive = view.id === activeViewId;
              return (
                <button
                  key={view.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveView(isActive ? null : view.id)}
                  className={cn(
                    "flex h-6 max-w-32 min-w-8 items-center gap-1 rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <span className="truncate">{view.name}</span>
                  {isActive && (
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`${MESSAGES.TAG_FILTER_CLEAR}: ${view.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          setActiveView(null);
                        }
                      }}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
            {!filterAreaVisible && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={MESSAGES.VIEW_ADD_RULE}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-44">
                  <DropdownMenuItem onSelect={() => setFilterEditing(true)}>
                    <TagIcon aria-hidden="true" />
                    {MESSAGES.LIBRARY_ADD_FILTER}
                  </DropdownMenuItem>
                  {views.length > 0 && <DropdownMenuSeparator />}
                  {views.map((view) => (
                    <DropdownMenuItem
                      key={view.id}
                      onSelect={() => {
                        setActiveView(view.id);
                        setFilterEditing(true);
                      }}
                    >
                      <Check
                        className={cn(view.id !== activeViewId && "invisible")}
                        aria-hidden="true"
                      />
                      <span className="truncate">{view.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Inline filter area: chips + Save/Cancel. */}
          {filterAreaVisible && (
            <div className="px-6 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-2">
                {activeTag && (
                  <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border bg-card px-2 text-xs text-foreground">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: activeTag.color }}
                    />
                    <span className="max-w-32 truncate">{activeTag.name}</span>
                    <button
                      type="button"
                      aria-label={MESSAGES.TAG_FILTER_CLEAR}
                      onClick={() => void setTagFilter(null)}
                      className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                )}
                <FilterBar />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 shrink-0 px-3 text-xs"
                  onClick={handleCancelFilter}
                >
                  {MESSAGES.COLLECTION_CANCEL_FILTER}
                </Button>
                <Button
                  size="sm"
                  className="h-7 shrink-0 gap-1 px-3 text-xs font-semibold"
                  disabled={draftRules.length === 0}
                  onClick={handleSaveFilter}
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  {activeViewId ? MESSAGES.COLLECTION_UPDATE : MESSAGES.VIEW_SAVE}
                </Button>
              </div>
            </div>
          )}

          {docsBody}
        </>
      )}

      <PromptDialog
        open={savePromptOpen}
        title={MESSAGES.COLLECTION_SAVE_NEW}
        label={MESSAGES.COLLECTION_NAME_LABEL}
        placeholder={MESSAGES.COLLECTION_NAME_PLACEHOLDER}
        description={MESSAGES.COLLECTION_SAVE_NEW_TIPS}
        confirmLabel={MESSAGES.COLLECTION_SAVE}
        onConfirm={(name) => {
          setSavePromptOpen(false);
          if (activeWorkspaceId) void saveDraftAsView(activeWorkspaceId, name);
        }}
        onCancel={() => setSavePromptOpen(false)}
      />

      <CollectionEditorDialog
        open={editorOpen !== null}
        view={
          editorOpen !== null && editorOpen !== "create"
            ? (views.find((v) => v.id === editorOpen) ?? null)
            : null
        }
        onCancel={() => setEditorOpen(null)}
        onSave={({ name, rules, allowNoteIds }) => {
          const editingId = editorOpen !== null && editorOpen !== "create" ? editorOpen : null;
          setEditorOpen(null);
          if (!activeWorkspaceId) return;
          if (editingId) {
            void (async () => {
              try {
                await savedViewService.renameView(editingId, name);
                await savedViewService.updateViewRules(editingId, rules);
                await savedViewService.updateViewAllowIds(editingId, allowNoteIds);
                // Bump AFTER the writes commit — CollectionsSection refetches
                // on version, so the store sees the fully-edited view.
                useViewStore.setState((s) => ({ version: s.version + 1 }));
              } catch (err) {
                notifyError(err);
              }
            })();
          } else {
            // Create: route the editor rules through the store's draft path
            // (validation + fetches), then attach the allow-list.
            useViewStore.getState().setDraftRules(rules);
            void useViewStore
              .getState()
              .saveDraftAsView(activeWorkspaceId, name)
              .then(async (created) => {
                if (created) {
                  await savedViewService.updateViewAllowIds(created.id, allowNoteIds);
                  // The store's last fetch ran inside saveDraftAsView BEFORE
                  // this UPDATE — bump so CollectionsSection refetches the
                  // view WITH its allow-list.
                  useViewStore.setState((s) => ({ version: s.version + 1 }));
                }
                return null;
              })
              .catch(notifyError);
          }
        }}
      />
    </div>
  );
};
