import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Pin, Star, Trash2 } from 'lucide-react'
import { useWorkspaceStore } from '../../store/useWorkspaceStore'
import { useNoteStore } from '../../store/useNoteStore'

export const NoteList: React.FC = () => {
  const { activeWorkspaceId } = useWorkspaceStore()
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    deleteNote,
    togglePinNote,
    toggleFavoriteNote
  } = useNoteStore()

  const workspaceNotes = notes.filter((n) => n.workspaceId === activeWorkspaceId)
  const pinnedNotes = workspaceNotes.filter((n) => n.isPinned)
  const favoriteNotes = workspaceNotes.filter((n) => n.isFavorite && !n.isPinned)
  const otherNotes = workspaceNotes.filter((n) => !n.isPinned && !n.isFavorite)

  const handleCreateNote = () => {
    createNote(activeWorkspaceId, 'Untitled Note', '<p></p>', '📝')
  }

  const renderNoteItem = (n: typeof notes[0]) => {
    const isActive = n.id === activeNoteId
    return (
      <motion.div
        key={n.id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        className={`group relative flex items-center justify-between p-2.5 rounded-[12px] cursor-pointer transition-all duration-150 border-[1.5px] ${
          isActive
            ? 'bg-dew-drop border-charcoal text-cocoa-ink font-bold shadow-paper-lift'
            : 'border-transparent hover:border-charcoal/30 text-charcoal'
        }`}
        onClick={() => setActiveNoteId(n.id)}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <span className="text-base flex-shrink-0">{n.icon || '📝'}</span>
          <span className="text-xs truncate">{n.title || 'Untitled Note'}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-charcoal">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              togglePinNote(n.id)
            }}
            className="p-1 rounded hover:bg-marker-orange/20"
            title="Pin Note"
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggleFavoriteNote(n.id)
            }}
            className="p-1 rounded hover:bg-marker-orange/20"
            title="Favorite Note"
          >
            <Star className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              deleteNote(n.id)
            }}
            className="p-1 rounded hover:bg-red-100 text-red-600"
            title="Delete Note"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Notes ({workspaceNotes.length})
        </span>
        <button
          type="button"
          onClick={handleCreateNote}
          className="flex items-center gap-1 px-2.5 py-1 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal text-xs font-bold shadow-paper-lift hover:scale-105 transition-transform"
        >
          <Plus className="w-3.5 h-3.5 text-marker-orange" />
          <span>New Note</span>
        </button>
      </div>

      {workspaceNotes.length === 0 && (
        <div className="p-4 rounded-[12px] bg-dew-drop border-[1.5px] border-dashed border-charcoal text-center">
          <FileText className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-bold text-cocoa-ink">No notes in workspace</p>
          <button
            type="button"
            onClick={handleCreateNote}
            className="mt-3 px-3 py-1.5 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal text-xs font-bold shadow-paper-lift hover:scale-105 transition-transform"
          >
            Create first note
          </button>
        </div>
      )}

      {pinnedNotes.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-marker-orange">
            <Pin className="w-3 h-3" />
            <span>Pinned</span>
          </div>
          <div className="space-y-1">
            <AnimatePresence>
              {pinnedNotes.map(renderNoteItem)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {favoriteNotes.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-marker-orange">
            <Star className="w-3 h-3" />
            <span>Favorites</span>
          </div>
          <div className="space-y-1">
            <AnimatePresence>
              {favoriteNotes.map(renderNoteItem)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {otherNotes.length > 0 && (
        <div className="space-y-1">
          {pinnedNotes.length > 0 || favoriteNotes.length > 0 ? (
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              All Notes
            </div>
          ) : null}
          <div className="space-y-1">
            <AnimatePresence>
              {otherNotes.map(renderNoteItem)}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
