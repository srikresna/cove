import { Copy, LayoutTemplate, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../components/ui/context-menu";
import { PromptDialog } from "../../components/ui/prompt-dialog";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { noteActions } from "../../store/noteActions";
import { ConfirmDialog } from "../modals/ConfirmDialog";

export const NoteContextMenu: React.FC<{
  note: Note;
  variant?: "note" | "template";
  children: React.ReactElement;
}> = ({ note, variant = "note", children }) => {
  const [renaming, setRenaming] = useState(false);
  const [trashing, setTrashing] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        {variant === "template" && (
          <>
            <ContextMenuItem onSelect={() => void noteActions.duplicateNote(note.id)}>
              <Plus aria-hidden="true" />
              {MESSAGES.TPL_USE}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onSelect={() => void noteActions.toggleFavoriteNote(note.id)}>
          <Star aria-hidden="true" />
          {note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => void noteActions.duplicateNote(note.id)}>
          <Copy aria-hidden="true" />
          {MESSAGES.DUPLICATE_NOTE}
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => setRenaming(true)}>
          <Pencil aria-hidden="true" />
          {MESSAGES.PROP_RENAME}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => void noteActions.updateNote(note.id, { isTemplate: !note.isTemplate })}
        >
          <LayoutTemplate aria-hidden="true" />
          {note.isTemplate ? MESSAGES.TPL_REMOVE_FLAG : MESSAGES.TEMPLATE_TOGGLE}
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          onSelect={() => setTrashing(true)}
        >
          <Trash2 aria-hidden="true" />
          {MESSAGES.MOVE_TO_TRASH}
        </ContextMenuItem>
      </ContextMenuContent>

      <PromptDialog
        open={renaming}
        title={MESSAGES.PROP_RENAME}
        label={MESSAGES.NOTE_NAME_LABEL}
        placeholder={MESSAGES.UNTITLED_NOTE}
        confirmLabel={MESSAGES.PROP_RENAME}
        initialValue={note.title}
        onConfirm={(name) => {
          void noteActions.updateNote(note.id, { title: name });
          setRenaming(false);
        }}
        onCancel={() => setRenaming(false)}
      />

      <ConfirmDialog
        open={trashing}
        title={MESSAGES.MOVE_TO_TRASH}
        description={`"${note.title ?? ""}" — ${MESSAGES.TRASH_MOVED_DESC}`}
        confirmLabel={MESSAGES.MOVE_TO_TRASH}
        danger
        onConfirm={() => {
          void noteActions.trashNote(note.id);
          setTrashing(false);
        }}
        onCancel={() => setTrashing(false)}
      />
    </ContextMenu>
  );
};
