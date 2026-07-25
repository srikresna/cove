import { Plus } from "lucide-react";
import type React from "react";
import { Suspense, lazy, useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastContainer } from "./components/ToastContainer";
import { CreateWorkspaceModal } from "./components/modals/CreateWorkspaceModal";
import { QuickSearchModal } from "./components/modals/QuickSearchModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { Sidebar } from "./components/sidebar/Sidebar";
import { VaultGate } from "./components/vault/VaultGate";
import { MESSAGES } from "./constants/messages";
import type { Note } from "./domain/note/Note";
import { useNoteStore } from "./store/useNoteStore";
import { useWorkspaceStore } from "./store/useWorkspaceStore";

// BlockNote (+ its Shiki syntax-highlighter dependency, which pulls many language
// grammars) is by far the heaviest part of the app. Lazy-load it so it is excluded
// from the initial bundle and only fetched when a note is actually opened.
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

  // When the active note changes, load its FULL decrypted content from the DB.
  // fetchNotes returns metadata-only (content=""); this replaces it with the
  // decrypted body so the editor has something to render.
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
    <div className="flex h-screen w-screen bg-cream-paper overflow-hidden relative font-gelica">
      <Sidebar />

      <main className="flex-1 h-full flex flex-col relative z-10 overflow-hidden bg-cream-paper">
        {activeNote ? (
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center text-sm font-medium text-slate-400">
                Loading editor…
              </div>
            }
          >
            <BlockNoteEditor key={activeNote.id} note={activeNote} />
          </Suspense>
        ) : workspaces.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div
              className="w-16 h-16 rounded-[20px] bg-dew-drop border-[1.5px] border-charcoal text-cocoa-ink flex items-center justify-center text-3xl shadow-card-subtle mb-4"
              aria-hidden="true"
            >
              🗂️
            </div>
            <h2 className="text-2xl font-extrabold text-cocoa-ink mb-2">
              {MESSAGES.NO_WORKSPACE_TITLE}
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mb-6">{MESSAGES.NO_WORKSPACE_DESC}</p>
            <button
              type="button"
              aria-label={MESSAGES.CREATE_WORKSPACE_TITLE}
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-cocoa-ink text-sm font-bold shadow-paper-lift hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 text-marker-orange" aria-hidden="true" />
              <span>{MESSAGES.CREATE_WORKSPACE_TITLE}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div
              className="w-16 h-16 rounded-[20px] bg-dew-drop border-[1.5px] border-charcoal text-cocoa-ink flex items-center justify-center text-3xl shadow-card-subtle mb-4"
              aria-hidden="true"
            >
              📝
            </div>
            <h2 className="text-2xl font-extrabold text-cocoa-ink mb-2">
              {MESSAGES.NO_NOTE_SELECTED_TITLE}
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mb-6">{MESSAGES.NO_NOTE_SELECTED_DESC}</p>
            <button
              type="button"
              aria-label={MESSAGES.CREATE_NEW_NOTE}
              onClick={() => {
                if (activeWorkspaceId) {
                  createNote(
                    activeWorkspaceId,
                    MESSAGES.UNTITLED_NOTE,
                    '[{"type":"paragraph","content":[]}]',
                    "📝",
                  );
                }
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-cocoa-ink text-sm font-bold shadow-paper-lift hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 text-marker-orange" aria-hidden="true" />
              <span>{MESSAGES.CREATE_NEW_NOTE}</span>
            </button>
          </div>
        )}
      </main>

      <CreateWorkspaceModal />
      <QuickSearchModal />
      <SettingsModal />
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
