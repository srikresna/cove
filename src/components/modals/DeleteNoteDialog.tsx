import type React from "react";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import { ConfirmDialog } from "./ConfirmDialog";

export const DeleteNoteDialog: React.FC = () => {
  const pendingDeleteId = useNoteStore((s) => s.pendingDeleteId);
  const cancelDeleteNote = useNoteStore((s) => s.cancelDeleteNote);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const notes = useNoteStore((s) => s.notes);

  const note = notes.find((n) => n.id === pendingDeleteId);
  const title = note?.title || MESSAGES.UNTITLED_NOTE;

  const handleConfirm = () => {
    if (pendingDeleteId) void deleteNote(pendingDeleteId);
    cancelDeleteNote();
  };

  return (
    <ConfirmDialog
      open={pendingDeleteId !== null}
      title={MESSAGES.DELETE_NOTE_CONFIRM_TITLE}
      description={`"${title}" — ${MESSAGES.DELETE_NOTE_CONFIRM_DESC}`}
      confirmLabel={MESSAGES.DELETE_NOTE_CONFIRM_BUTTON}
      danger
      onConfirm={handleConfirm}
      onCancel={cancelDeleteNote}
    />
  );
};
