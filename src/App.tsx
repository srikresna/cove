import React, { useEffect } from 'react'
import { useWorkspaceStore } from './store/useWorkspaceStore'
import { useNoteStore } from './store/useNoteStore'
import { Sidebar } from './components/sidebar/Sidebar'
import { BlockNoteEditor } from './components/editor/BlockNoteEditor'
import { CreateWorkspaceModal } from './components/modals/CreateWorkspaceModal'
import { QuickSearchModal } from './components/modals/QuickSearchModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Plus } from 'lucide-react'

export const AppContent: React.FC = () => {
  const { activeWorkspaceId, isDarkMode, fetchWorkspaces } = useWorkspaceStore()
  const { notes, activeNoteId, setActiveNoteId, createNote, fetchNotes } = useNoteStore()

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchNotes(activeWorkspaceId)
    }
  }, [activeWorkspaceId, fetchNotes])

  const workspaceNotes = notes.filter((n) => n.workspaceId === activeWorkspaceId)
  const activeNote = notes.find((n) => n.id === activeNoteId && n.workspaceId === activeWorkspaceId) || workspaceNotes[0] || null

  useEffect(() => {
    if (!activeNote && workspaceNotes.length > 0) {
      setActiveNoteId(workspaceNotes[0].id)
    }
  }, [activeWorkspaceId, activeNote, workspaceNotes, setActiveNoteId])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="flex h-screen w-screen bg-cream-paper overflow-hidden relative font-gelica">
      <Sidebar />

      <main className="flex-1 h-full flex flex-col relative z-10 overflow-hidden bg-cream-paper">
        {activeNote ? (
          <BlockNoteEditor key={activeNote.id} note={activeNote} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-[20px] bg-dew-drop border-[1.5px] border-charcoal text-cocoa-ink flex items-center justify-center text-3xl shadow-card-subtle mb-4">
              📝
            </div>
            <h2 className="text-2xl font-extrabold text-cocoa-ink mb-2">
              No Note Selected
            </h2>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Select a note from the left sidebar or create a fresh one to start capturing your thoughts!
            </p>
            <button
              type="button"
              onClick={() => createNote(activeWorkspaceId, 'Untitled Note', '[{"type":"paragraph","content":[]}]', '📝')}
              className="flex items-center gap-2 px-6 py-3 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-cocoa-ink text-sm font-bold shadow-paper-lift hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 text-marker-orange" />
              <span>Create New Note</span>
            </button>
          </div>
        )}
      </main>

      <CreateWorkspaceModal />
      <QuickSearchModal />
    </div>
  )
}

export const App: React.FC = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
)

export default App
