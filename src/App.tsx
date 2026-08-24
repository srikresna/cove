import { Plus } from "lucide-react";
import type React from "react";
import { lazy, Suspense, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BlockSuiteDialogs } from "./components/editor/BlockSuiteDialogs";
import { PeekViewModal } from "./components/editor/blocksuite/peek/PeekViewModal";
import { CreateWorkspaceModal } from "./components/modals/CreateWorkspaceModal";
import { QuickSearchModal } from "./components/modals/QuickSearchModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ToastContainer } from "./components/ToastContainer";
import { TrashPage } from "./components/trash/TrashPage";
import { Button } from "./components/ui/button";
import { TooltipProvider } from "./components/ui/tooltip";
import { VaultGate } from "./components/vault/VaultGate";
import { MESSAGES } from "./constants/messages";
import { propertyService, savedViewService } from "./di/container";
import type { Note } from "./domain/note/Note";
import { useNoteStore } from "./store/useNoteStore";
import { useUIStore } from "./store/useUIStore";
import { useViewStore } from "./store/useViewStore";
import { useWorkspaceStore } from "./store/useWorkspaceStore";

const BlockSuiteNoteEditor = lazy(
  () => import("./components/editor/blocksuite/BlockSuiteNoteEditor"),
);

export const AppContent: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const isTrashOpen = useUIStore((s) => s.isTrashOpen);
  const setCreateModalOpen = useUIStore((s) => s.setCreateModalOpen);
  const notes = useNoteStore((s) => s.notes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const createNote = useNoteStore((s) => s.createNote);
  const fetchNotes = useNoteStore((s) => s.fetchNotes);
  const loadActiveNoteContent = useNoteStore((s) => s.loadActiveNoteContent);
  const purgeExpiredTrash = useNoteStore((s) => s.purgeExpiredTrash);

  useEffect(() => {
    fetchWorkspaces();
    void purgeExpiredTrash();
    // Startup self-heal: saved-view rules referencing property defs or
    // options deleted by older builds (or by an interrupted prune) are
    // rewritten/deleted before any view is applied. Best-effort — a failure
    // here never blocks the app. The version bump afterwards is required:
    // the initial fetchViews races the heal transaction and can snapshot
    // pre-heal rows; if the user clicked a doomed view in that window, its
    // active selection and drafts are cleared with it.
    void propertyService
      .listDefinitions()
      .then(async (defs) => {
        const deleted = await savedViewService.healRules(defs);
        // Prune drafts of dead references unconditionally (rewritten and
        // deselected views strand drafts just like deleted ones — drafts are
        // the note list's only filter input), then clear a deleted ACTIVE
        // selection; the fetchViews reconcile covers any straggler clicks.
        useViewStore.getState().healDrafts(defs);
        useViewStore.setState((s) =>
          s.activeViewId && deleted.includes(s.activeViewId)
            ? { activeViewId: null, draftRules: [], version: s.version + 1 }
            : { version: s.version + 1 },
        );
      })
      .catch(() => {});
  }, [fetchWorkspaces, purgeExpiredTrash]);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchNotes(activeWorkspaceId);
    }
  }, [activeWorkspaceId, fetchNotes]);

  useEffect(() => {
    if (activeNoteId) {
      loadActiveNoteContent(activeNoteId);
    }
  }, [activeNoteId, loadActiveNoteContent]);

  const workspaceNotes: Note[] = notes.filter((n) => n.workspaceId === activeWorkspaceId);
  const firstWorkspaceNote = workspaceNotes[0];
  const activeNote =
    notes.find((n) => n.id === activeNoteId && n.workspaceId === activeWorkspaceId) ||
    firstWorkspaceNote ||
    null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);

    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative flex h-screen w-screen overflow-hidden bg-background font-sans">
        <Sidebar />

        <main className="relative z-10 flex h-full flex-1 flex-col overflow-hidden bg-card">
          {isTrashOpen ? (
            <TrashPage />
          ) : activeNote ? (
            activeNote.content === "" ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Loading editor…
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    Loading editor…
                  </div>
                }
              >
                <BlockSuiteNoteEditor key={activeNote.id} note={activeNote} />
              </Suspense>
            )
          ) : workspaces.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border bg-card text-3xl shadow-sm"
                aria-hidden="true"
              >
                🗂️
              </div>
              <h2 className="mb-2 font-display text-2xl font-medium tracking-tight text-foreground">
                {MESSAGES.NO_WORKSPACE_TITLE}
              </h2>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                {MESSAGES.NO_WORKSPACE_DESC}
              </p>
              <Button
                aria-label={MESSAGES.CREATE_WORKSPACE_TITLE}
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{MESSAGES.CREATE_WORKSPACE_TITLE}</span>
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border bg-card text-3xl shadow-sm"
                aria-hidden="true"
              >
                📝
              </div>
              <h2 className="mb-2 font-display text-2xl font-medium tracking-tight text-foreground">
                {MESSAGES.NO_NOTE_SELECTED_TITLE}
              </h2>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                {MESSAGES.NO_NOTE_SELECTED_DESC}
              </p>
              <Button
                aria-label={MESSAGES.CREATE_NEW_NOTE}
                onClick={() => {
                  if (activeWorkspaceId) {
                    createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE);
                  }
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{MESSAGES.CREATE_NEW_NOTE}</span>
              </Button>
            </div>
          )}
        </main>

        <CreateWorkspaceModal />
        <QuickSearchModal />
        <SettingsModal />
        <ToastContainer />
        <PeekViewModal />
        <BlockSuiteDialogs />
      </div>
    </TooltipProvider>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary>
    <VaultGate>
      <AppContent />
    </VaultGate>
  </ErrorBoundary>
);

export default App;
