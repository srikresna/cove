import { Plus } from "lucide-react";
import type React from "react";
import { Suspense, lazy, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import { CreateWorkspaceModal } from "./components/modals/CreateWorkspaceModal";
import { DeleteNoteDialog } from "./components/modals/DeleteNoteDialog";
import { QuickSearchModal } from "./components/modals/QuickSearchModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { Sidebar } from "./components/sidebar/Sidebar";
import { Button } from "./components/ui/button";
import { VaultGate } from "./components/vault/VaultGate";
import { MESSAGES } from "./constants/messages";
import type { Note } from "./domain/note/Note";
import { useNoteStore } from "./store/useNoteStore";
import { useWorkspaceStore } from "./store/useWorkspaceStore";

const BlockNoteEditor = lazy(() =>
  import("./components/editor/BlockNoteEditor").then((m) => ({ default: m.BlockNoteEditor })),
);

export const AppContent: React.FC = () => {
  const { activeWorkspaceId, isDarkMode, fetchWorkspaces, workspaces, setCreateModalOpen } =
    useWorkspaceStore();
  const { notes, activeNoteId, setActiveNoteId, createNote, fetchNotes, loadActiveNoteContent } =
    useNoteStore();

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

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

  const firstNoteId = firstWorkspaceNote?.id;

  useEffect(() => {
    if (!activeNote && firstNoteId) {
      setActiveNoteId(firstNoteId);
    }
  }, [activeNote, firstNoteId, setActiveNoteId]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background font-sans">
      <Sidebar />

      <main className="relative z-10 flex h-full flex-1 flex-col overflow-hidden bg-card">
        {activeNote ? (
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Loading editor…
              </div>
            }
          >
            <BlockNoteEditor key={activeNote.id} note={activeNote} />
          </Suspense>
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
      <DeleteNoteDialog />
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
