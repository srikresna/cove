import {
  Copy,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { getJournalTemplateId, setJournalTemplateId } from "../../services/journalTemplateSetting";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PromptDialog } from "../ui/prompt-dialog";
import { CollapsibleSection } from "./CollapsibleSection";

const TemplateRow: React.FC<{
  note: Note;
  isActive: boolean;
  isJournalTemplate: boolean;
  onSelect: () => void;
  onUse: () => void;
  onSetJournalTemplate: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onRemoveFlag: () => void;
  onTrash: () => void;
}> = ({
  note,
  isActive,
  isJournalTemplate,
  onSelect,
  onUse,
  onSetJournalTemplate,
  onRename,
  onDuplicate,
  onRemoveFlag,
  onTrash,
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
        <DropdownMenuItem onSelect={onRename}>
          <Pencil aria-hidden="true" />
          {MESSAGES.PROP_RENAME}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy aria-hidden="true" />
          {MESSAGES.DUPLICATE_NOTE}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onRemoveFlag}>
          <Trash2 aria-hidden="true" />
          {MESSAGES.TPL_REMOVE_FLAG}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={onTrash}
        >
          <Trash2 aria-hidden="true" />
          {MESSAGES.MOVE_TO_TRASH}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

export const TemplatesSection: React.FC = () => {
  const notes = useNoteStore((s) => s.notes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const createNote = useNoteStore((s) => s.createNote);
  const duplicateNote = useNoteStore((s) => s.duplicateNote);
  const trashNote = useNoteStore((s) => s.trashNote);
  const updateNote = useNoteStore((s) => s.updateNote);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [journalTemplateId, setJournalTemplateIdState] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [trashingId, setTrashingId] = useState<string | null>(null);

  // The setting is per workspace and the workspace id arrives async at launch
  // (and changes on switch without remount), so resync instead of capturing
  // once in a lazy initializer.
  useEffect(() => {
    setJournalTemplateIdState(activeWorkspaceId ? getJournalTemplateId(activeWorkspaceId) : null);
  }, [activeWorkspaceId]);

  const templates = notes.filter(
    (n) => n.workspaceId === activeWorkspaceId && n.isTemplate === true,
  );

  const handleCreate = () => {
    if (!activeWorkspaceId) return;
    void createNote(activeWorkspaceId, MESSAGES.TPL_DEFAULT_TITLE).then((note) => {
      if (note) void updateNote(note.id, { isTemplate: true });
    });
  };

  const renameTarget = templates.find((n) => n.id === renamingId) ?? null;
  const trashTarget = templates.find((n) => n.id === trashingId) ?? null;

  return (
    <CollapsibleSection
      storageKey="cove-templates-open"
      label={MESSAGES.TPL_HEADER}
      count={templates.length}
      action={
        <button
          type="button"
          aria-label={MESSAGES.TPL_NEW}
          title={MESSAGES.TPL_NEW}
          onClick={handleCreate}
          className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      }
    >
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
            onRename={() => setRenamingId(note.id)}
            onDuplicate={() => void duplicateNote(note.id)}
            onRemoveFlag={() => {
              if (activeWorkspaceId && note.id === journalTemplateId) {
                setJournalTemplateId(activeWorkspaceId, null);
                setJournalTemplateIdState(null);
              }
              void updateNote(note.id, { isTemplate: false });
            }}
            onTrash={() => setTrashingId(note.id)}
          />
        ))
      )}

      <PromptDialog
        open={renamingId !== null}
        title={MESSAGES.PROP_RENAME}
        label="Template name"
        placeholder={MESSAGES.TPL_DEFAULT_TITLE}
        confirmLabel={MESSAGES.PROP_RENAME}
        initialValue={renameTarget?.title}
        onConfirm={(name) => {
          if (renamingId) void updateNote(renamingId, { title: name });
          setRenamingId(null);
        }}
        onCancel={() => setRenamingId(null)}
      />

      <ConfirmDialog
        open={trashingId !== null}
        title={MESSAGES.MOVE_TO_TRASH}
        description={`"${trashTarget?.title ?? ""}" — ${MESSAGES.TRASH_MOVED_DESC}`}
        confirmLabel={MESSAGES.MOVE_TO_TRASH}
        danger
        onConfirm={() => {
          if (trashingId) {
            if (activeWorkspaceId && trashingId === journalTemplateId) {
              setJournalTemplateId(activeWorkspaceId, null);
              setJournalTemplateIdState(null);
            }
            void trashNote(trashingId);
          }
          setTrashingId(null);
        }}
        onCancel={() => setTrashingId(null)}
      />
    </CollapsibleSection>
  );
};
