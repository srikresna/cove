import {
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { getJournalTemplateId, setJournalTemplateId } from "../../services/journalTemplateSetting";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const OPEN_KEY = "cove-templates-open";

const TemplateRow: React.FC<{
  note: Note;
  isActive: boolean;
  isJournalTemplate: boolean;
  onSelect: () => void;
  onUse: () => void;
  onSetJournalTemplate: () => void;
  onRemoveFlag: () => void;
}> = ({
  note,
  isActive,
  isJournalTemplate,
  onSelect,
  onUse,
  onSetJournalTemplate,
  onRemoveFlag,
}) => (
  <div className="group/tpl flex items-center">
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-border bg-card font-medium text-foreground shadow-sm"
          : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      )}
    >
      <span aria-hidden="true" className="shrink-0 text-sm">
        {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
      </span>
      <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
      {isJournalTemplate && (
        <Star
          className="h-3 w-3 shrink-0 fill-primary text-primary"
          aria-label={MESSAGES.TPL_JOURNAL_ACTIVE}
        />
      )}
    </button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${note.title || MESSAGES.UNTITLED_NOTE}: ${MESSAGES.TPL_HEADER}`}
          className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/tpl:opacity-100"
        >
          <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onSelect={onUse}>
          <Plus aria-hidden="true" />
          {MESSAGES.TPL_USE}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSetJournalTemplate} disabled={isJournalTemplate}>
          <Star aria-hidden="true" />
          {MESSAGES.TPL_SET_JOURNAL}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onRemoveFlag}>
          <Trash2 aria-hidden="true" />
          {MESSAGES.TPL_REMOVE_FLAG}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export const TemplatesSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(OPEN_KEY) !== "false");
  const notes = useNoteStore((s) => s.notes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const createNote = useNoteStore((s) => s.createNote);
  const duplicateNote = useNoteStore((s) => s.duplicateNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [journalTemplateId, setJournalTemplateIdState] = useState(() =>
    activeWorkspaceId ? getJournalTemplateId(activeWorkspaceId) : null,
  );

  const templates = notes.filter(
    (n) => n.workspaceId === activeWorkspaceId && n.isTemplate === true,
  );

  const toggleOpen = () => {
    const next = !isOpen;
    localStorage.setItem(OPEN_KEY, String(next));
    setIsOpen(next);
  };

  const handleCreate = () => {
    if (!activeWorkspaceId) return;
    void createNote(activeWorkspaceId, MESSAGES.TPL_DEFAULT_TITLE).then((note) => {
      if (note) void updateNote(note.id, { isTemplate: true });
    });
  };

  return (
    <div className="space-y-1 pb-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleOpen}
          aria-expanded={isOpen}
          className="flex w-full items-center gap-1 rounded px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          )}
          {MESSAGES.TPL_HEADER}
          <span className="font-mono">({templates.length})</span>
        </button>
        <button
          type="button"
          aria-label={MESSAGES.TPL_NEW}
          title={MESSAGES.TPL_NEW}
          onClick={handleCreate}
          className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="space-y-0.5">
          {templates.length === 0 ? (
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-muted-foreground/70">
              <LayoutTemplate className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.TPL_EMPTY}
            </div>
          ) : (
            templates.map((note) => (
              <TemplateRow
                key={note.id}
                note={note}
                isActive={note.id === activeNoteId}
                isJournalTemplate={note.id === journalTemplateId}
                onSelect={() => setActiveNoteId(note.id)}
                onUse={() => void duplicateNote(note.id)}
                onSetJournalTemplate={() => {
                  if (!activeWorkspaceId) return;
                  setJournalTemplateId(activeWorkspaceId, note.id);
                  setJournalTemplateIdState(note.id);
                }}
                onRemoveFlag={() => {
                  if (activeWorkspaceId && note.id === journalTemplateId) {
                    setJournalTemplateId(activeWorkspaceId, null);
                    setJournalTemplateIdState(null);
                  }
                  void updateNote(note.id, { isTemplate: false });
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
