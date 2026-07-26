import { FileText, RotateCcw, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { formatRelativeDay } from "../../utils/time";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ConfirmDialog } from "./ConfirmDialog";

export const TrashDialog: React.FC = () => {
  const { isTrashOpen, setTrashOpen, workspaces } = useWorkspaceStore();
  const trashedNotes = useNoteStore((s) => s.trashedNotes);
  const fetchTrash = useNoteStore((s) => s.fetchTrash);
  const restoreNote = useNoteStore((s) => s.restoreNote);
  const deleteNotePermanently = useNoteStore((s) => s.deleteNotePermanently);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (isTrashOpen) {
      void fetchTrash();
    }
  }, [isTrashOpen, fetchTrash]);

  const confirming = trashedNotes.find((n) => n.id === confirmingId);

  return (
    <>
      <Dialog open={isTrashOpen} onOpenChange={setTrashOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{MESSAGES.TRASH_TITLE}</DialogTitle>
            <DialogDescription>{MESSAGES.TRASH_RETENTION_NOTE}</DialogDescription>
          </DialogHeader>

          {trashedNotes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{MESSAGES.TRASH_EMPTY}</p>
          ) : (
            <div className="-mx-1 max-h-80 space-y-0.5 overflow-y-auto px-1">
              {trashedNotes.map((note) => {
                const ws = workspaces.find((w) => w.id === note.workspaceId);
                return (
                  <div
                    key={note.id}
                    className="group flex items-center gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-accent/50"
                  >
                    <span
                      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center text-lg"
                      aria-hidden="true"
                    >
                      {note.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-foreground">
                        {note.title || MESSAGES.UNTITLED_NOTE}
                      </div>
                      <div className="truncate font-mono text-[10px] text-muted-foreground">
                        {ws ? `${ws.emoji} ${ws.name} · ` : ""}
                        {note.deletedAt
                          ? `${MESSAGES.TRASH_DELETED_PREFIX}${formatRelativeDay(note.deletedAt)}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            aria-label={MESSAGES.TRASH_RESTORE}
                            onClick={() => restoreNote(note.id)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{MESSAGES.TRASH_RESTORE}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            aria-label={MESSAGES.TRASH_DELETE_FOREVER}
                            onClick={() => setConfirmingId(note.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{MESSAGES.TRASH_DELETE_FOREVER}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmingId !== null}
        title={MESSAGES.DELETE_NOTE_CONFIRM_TITLE}
        description={`"${confirming?.title || MESSAGES.UNTITLED_NOTE}" — ${MESSAGES.DELETE_NOTE_CONFIRM_DESC}`}
        confirmLabel={MESSAGES.DELETE_NOTE_CONFIRM_BUTTON}
        danger
        onConfirm={() => {
          if (confirmingId) void deleteNotePermanently(confirmingId);
          setConfirmingId(null);
        }}
        onCancel={() => setConfirmingId(null)}
      />
    </>
  );
};
