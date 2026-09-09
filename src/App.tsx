import { Plus } from "lucide-react";
import type React from "react";
import { lazy, Suspense, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import { Button } from "./components/ui/button";
import { TooltipProvider } from "./components/ui/tooltip";
import { MESSAGES } from "./constants/messages";
import { propertyService, savedViewService } from "./di/container";
import type { Note } from "./domain/note/Note";
import { BlockSuiteDialogs } from "./features/editor/BlockSuiteDialogs";
import { PeekViewModal } from "./features/editor/blocksuite/peek/PeekViewModal";
import { JournalsPage } from "./features/journals/JournalsPage";
import { LibraryPage } from "./features/library/LibraryPage";
import { CreateWorkspaceModal } from "./features/modals/CreateWorkspaceModal";
import { QuickSearchModal } from "./features/modals/QuickSearchModal";
import { SettingsModal } from "./features/settings/SettingsModal";
import { Sidebar } from "./features/sidebar/Sidebar";
import { TrashPage } from "./features/trash/TrashPage";
import { VaultGate } from "./features/vault/VaultGate";
import { useNotes } from "./hooks/useNotes";
import { noteActions } from "./store/noteActions";
import { useCustomIconStore } from "./store/useCustomIconStore";
import { useNoteUiStore } from "./store/useNoteUiStore";
import { useUIStore } from "./store/useUIStore";
import { useViewStore } from "./store/useViewStore";
import { useWorkspaceStore } from "./store/useWorkspaceStore";

const BlockSuiteNoteEditor = lazy(
  () => import("./features/editor/blocksuite/BlockSuiteNoteEditor"),
);

export const AppContent: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const fetchCustomIcons = useCustomIconStore((s) => s.fetchCustomIcons);
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const activePage = useUIStore((s) => s.activePage);
  const setCreateModalOpen = useUIStore((s) => s.setCreateModalOpen);
  const notes = useNotes();
  const activeNoteId = useNoteUiStore((s) => s.activeNoteId);
  const createNote = noteActions.createNote;

  useEffect(() => {
    fetchWorkspaces();
    fetchCustomIcons();
    void noteActions.purgeExpiredTrash();
    void propertyService
      .listDefinitions()
      .then(async (defs) => {
        const deleted = await savedViewService.healRules(defs);
        useViewStore.getState().healDrafts(defs);
        useViewStore.setState((s) =>
          s.activeViewId && deleted.includes(s.activeViewId)
            ? { activeViewId: null, draftRules: [], version: s.version + 1 }
            : { version: s.version + 1 },
        );
      })
      .catch(() => {});
  }, [fetchWorkspaces, fetchCustomIcons]);

  useEffect(() => {
    if (activeWorkspaceId) {
      void noteActions.fetchNotes(activeWorkspaceId);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    if (activeNoteId) {
      void noteActions.loadActiveNoteContent(activeNoteId);
    }
  }, [activeNoteId]);

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
          {activePage === "trash" ? (
            <TrashPage />
          ) : activePage === "library" ? (
            <LibraryPage />
          ) : activePage === "journals" ? (
            <JournalsPage />
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
