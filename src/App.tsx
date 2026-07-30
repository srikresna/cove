import { Plus } from "lucide-react";
import type React from "react";
import { Suspense, lazy, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import { CreateWorkspaceModal } from "./components/modals/CreateWorkspaceModal";
import { QuickSearchModal } from "./components/modals/QuickSearchModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { TrashDialog } from "./components/modals/TrashDialog";
import { Sidebar } from "./components/sidebar/Sidebar";
import { Button } from "./components/ui/button";
import { VaultGate } from "./components/vault/VaultGate";
import { MESSAGES } from "./constants/messages";
import type { Note } from "./domain/note/Note";
import { isBlockSuiteContent } from "./services/editor/contentFormat";
import { useNoteStore } from "./store/useNoteStore";
import { useUIStore } from "./store/useUIStore";
import { useWorkspaceStore } from "./store/useWorkspaceStore";

const BlockNoteEditor = lazy(() =>
  import("./components/editor/BlockNoteEditor").then((m) => ({ default: m.BlockNoteEditor })),
);
const BlockSuiteNoteEditor = lazy(
  () => import("./components/editor/blocksuite/BlockSuiteNoteEditor"),
);

export const AppContent: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const fetchWorkspaces = useWorkspaceStore((s) => s.fetchWorkspaces);
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const editorEngine = useUIStore((s) => s.editorEngine);
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
    // BlockSuite's ThemeObserver watches the data-theme attribute.
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
  }, [isDarkMode]);

  const useBlockSuite =
    activeNote != null &&
    (editorEngine === "blocksuite" || isBlockSuiteContent(activeNote.content));

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background font-sans">
      <Sidebar />

      <main className="relative z-10 flex h-full flex-1 flex-col overflow-hidden bg-card">
        {activeNote ? (
          useBlockSuite && activeNote.content === "" ? (
            // Content arrives async (metadata list returns content=""); never mount
            // the BlockSuite editor against an empty doc — it would seed blank and,
            // once initializedDocs locks it in, the real snapshot could be lost on
            // the first debounced save.
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
              {useBlockSuite ? (
                <BlockSuiteNoteEditor key={activeNote.id} note={activeNote} />
              ) : (
                <BlockNoteEditor key={activeNote.id} note={activeNote} />
              )}
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
      <TrashDialog />
      <ToastContainer />
    </div>
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
