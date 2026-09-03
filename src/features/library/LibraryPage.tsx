import { Layers as LayersIcon, Save, Tag as TagIcon, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { PromptDialog } from "../../components/ui/prompt-dialog";
import { MESSAGES } from "../../constants/messages";
import { blockSuiteEditorService, propertyService, savedViewService } from "../../di/container";
import { isRuleComplete } from "../../domain/filters/FilterRule";
import { isStackEligibleDef } from "../../domain/library/query";
import type { PropertyDefinition } from "../../domain/property/Property";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { noteActions } from "../../store/noteActions";
import { notifyError } from "../../store/notify";
import { useNotificationStore } from "../../store/useNotificationStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
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
  const notes = useNotes();
  const createNote = noteActions.createNote;
  const updateNote = noteActions.updateNote;
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
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
  }, [activeWorkspaceId]);

  const handleNewEdgeless = useCallback(() => {
    if (!activeWorkspaceId) return;
    void createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE).then((note) => {
      if (note) void updateNote(note.id, { docMode: "edgeless" });
    });
  }, [activeWorkspaceId]);

  // Markdown import: multi-file input → one note per .md (the transformer
  // needs at least one existing doc as its schema donor).
  const importInputRef = useRef<HTMLInputElement>(null);
  const importFolderInputRef = useRef<HTMLInputElement>(null);
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

  const handleImportMarkdownFolder = useCallback(() => {
    if (notes.length === 0) {
      useNotificationStore.getState().pushToast({
        kind: "info",
        title: MESSAGES.LIBRARY_IMPORT_NEEDS_NOTE,
        description: MESSAGES.LIBRARY_IMPORT_NEEDS_NOTE_DESC,
      });
      return;
    }
    importFolderInputRef.current?.click();
  }, [notes.length]);

  /** Folder import (md + assets): one planner run stages every image so
   *  relative ![](assets/x.png) references resolve to real blobs. */
  const handleImportFolder = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !activeWorkspaceId) return;
      const mdCount = Array.from(files).filter((f) => /\.(md)$/i.test(f.name)).length;
      if (mdCount === 0) {
        useNotificationStore.getState().pushToast({
          kind: "info",
          title: MESSAGES.LIBRARY_IMPORT_MD_FOLDER,
          description: MESSAGES.LIBRARY_IMPORT_MD_FOLDER_NO_MD,
        });
        return;
      }
      let imported = 0;
      let failed = 0;
      let notifiedFailed = 0;
      try {
        const docIds = await blockSuiteEditorService.importMarkdownBatch(Array.from(files));
        imported = docIds.length;
        failed = mdCount - imported;
      } catch (err) {
        if (
          err instanceof Error &&
          (err as Error & { coveAlreadyNotified?: boolean }).coveAlreadyNotified
        ) {
          notifiedFailed = mdCount;
        } else {
          failed = mdCount;
        }
      }
      if (imported > 0 || notifiedFailed > 0) {
        await noteActions.refreshNotesInPlace(activeWorkspaceId);
      }
      const totalFailed = failed + notifiedFailed;
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
    },
    [activeWorkspaceId],
  );

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
        await noteActions.refreshNotesInPlace(activeWorkspaceId);
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
    setSaveError(null);
    setSavePromptOpen(true);
  }, [activeViewId, updateActiveViewRules]);

  /** Reset reverts the drafts to the applied collection's saved rules (a
   *  plain clear would silently un-apply the collection); ad-hoc drafts and
   *  tag filters clear outright. */
  const handleResetFilter = useCallback(() => {
    if (activeViewId) {
      setActiveView(activeViewId);
      setFilterEditing(false);
    } else {
      clearDraft();
      setFilterEditing(false);
      void setTagFilter(null);
    }
  }, [activeViewId, setActiveView, clearDraft, setTagFilter]);

  const openTagInDocs = useCallback(
    (tagId: string) => {
      setTab("docs");
      void setTagFilter(tagId);
    },
    [setTagFilter],
  );

  // Simple-typed custom defs are groupable and chip-toggleable.
  const eligibleDefs = useMemo(() => defs.filter(isStackEligibleDef), [defs]);

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
        onImportMarkdownFolder={handleImportMarkdownFolder}
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

      <input
        ref={importFolderInputRef}
        type="file"
        className="hidden"
        // Folder picks keep each file's relative path (md + assets/), which
        // the import planner needs to resolve image references.
        // @ts-expect-error non-standard but universally supported directory picker
        webkitdirectory=""
        directory=""
        multiple
        onChange={(e) => {
          void handleImportFolder(e.target.files);
          e.target.value = "";
        }}
      />

      {tab === "collections" ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CollectionsTab
            onEditView={(viewId) => setEditorOpen(viewId)}
            onOpenInDocs={() => setTab("docs")}
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
                <span
                  key={view.id}
                  className={cn(
                    "flex h-6 max-w-44 min-w-8 items-center gap-1 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveView(isActive ? null : view.id)}
                    className="flex min-w-0 flex-1 items-center rounded-md px-2 py-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-foreground"
                  >
                    <span className="truncate">{view.name}</span>
                  </button>
                  {isActive && (
                    <button
                      type="button"
                      aria-label={`${MESSAGES.TAG_FILTER_CLEAR}: ${view.name}`}
                      onClick={() => setActiveView(null)}
                      className="mr-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  )}
                </span>
              );
            })}
            {!filterAreaVisible && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 shrink-0 gap-1 px-2 text-[13px] leading-4"
                onClick={() => setFilterEditing(true)}
              >
                <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {MESSAGES.LIBRARY_ADD_FILTER}
              </Button>
            )}
          </div>

          {/* Inline filter area. An applied collection collapses to a
              summary row until the user opens the rule editor; rules apply
              live, Save only persists them as a collection. */}
          {filterAreaVisible && (
            <div className="px-6 pt-2">
              <div className="rounded-md bg-muted/60 p-2">
                {activeViewId && !filterEditing ? (
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border bg-card px-2 text-[13px] leading-4 text-foreground">
                      <LayersIcon
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="max-w-40 truncate">
                        {views.find((v) => v.id === activeViewId)?.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] leading-4 text-muted-foreground">
                      {draftRules.length} {draftRules.length === 1 ? "rule" : "rules"}
                    </span>
                    {activeTag && (
                      <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border bg-card px-2 text-[13px] leading-4 text-foreground">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-xs"
                      onClick={() => setFilterEditing(true)}
                    >
                      {MESSAGES.FILTER_EDIT_RULES}
                    </Button>
                    <button
                      type="button"
                      aria-label={MESSAGES.TAG_FILTER_CLEAR}
                      onClick={() => {
                        // Clearing the collection clears its rules too —
                        // setActiveView(null) alone would keep filtering.
                        clearDraft();
                        setFilterEditing(false);
                      }}
                      className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <>
                    {activeTag && (
                      <div className="mb-1.5 flex items-center">
                        <span className="flex h-7 shrink-0 items-center gap-1.5 rounded-md border bg-card px-2 text-[13px] leading-4 text-foreground">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 shrink-0 rounded-full"
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
                      </div>
                    )}
                    <FilterBar />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] leading-4 text-muted-foreground">
                        {MESSAGES.FILTER_LIVE_HINT}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 shrink-0 px-3 text-xs"
                          onClick={handleResetFilter}
                        >
                          {activeViewId ? MESSAGES.COLLECTION_RESET : MESSAGES.COLLECTION_CLEAR}
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 shrink-0 gap-1 px-3 text-xs font-semibold"
                          disabled={!draftRules.some(isRuleComplete)}
                          onClick={handleSaveFilter}
                        >
                          <Save className="h-3.5 w-3.5" aria-hidden="true" />
                          {activeViewId ? MESSAGES.COLLECTION_UPDATE : MESSAGES.VIEW_SAVE}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {docsBody}
        </>
      )}

      <PromptDialog
        open={savePromptOpen}
        title={MESSAGES.COLLECTION_SAVE_NEW}
        placeholder={MESSAGES.COLLECTION_NAME_PLACEHOLDER}
        description={MESSAGES.COLLECTION_SAVE_NEW_TIPS_SHORT}
        confirmLabel={MESSAGES.COLLECTION_SAVE}
        error={saveError}
        busy={saveBusy}
        onConfirm={(name) => {
          if (!activeWorkspaceId) return;
          setSaveBusy(true);
          void (async () => {
            try {
              await saveDraftAsView(activeWorkspaceId, name);
              setSaveError(null);
              setSavePromptOpen(false);
            } catch (err) {
              setSaveError(err instanceof Error ? err.message : MESSAGES.SOMETHING_WENT_WRONG);
            } finally {
              setSaveBusy(false);
            }
          })();
        }}
        onCancel={() => {
          setSaveError(null);
          setSavePromptOpen(false);
        }}
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
