import { FileText, RotateCcw, Trash2 } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { MESSAGES } from "../../constants/messages";
import { useTrash } from "../../hooks/useNotes";
import { noteActions } from "../../store/noteActions";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { formatRelativeDay } from "../../utils/time";
import { ConfirmDialog } from "../modals/ConfirmDialog";

export const TrashPage: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const trashedNotes = useTrash();
  const restoreNote = noteActions.restoreNote;
  const deleteNotePermanently = noteActions.deleteNotePermanently;

  const [query, setQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const trimmed = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      trimmed ? trashedNotes.filter((n) => n.title.toLowerCase().includes(trimmed)) : trashedNotes,
    [trashedNotes, trimmed],
  );

  const confirming = trashedNotes.find((n) => n.id === confirmingId);

  return (
    <>
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-6 pt-12 pb-16">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
            {MESSAGES.TRASH_TITLE}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{MESSAGES.TRASH_RETENTION_NOTE}</p>

          <Input
            type="search"
            className="mt-6 max-w-sm"
            placeholder={MESSAGES.TRASH_SEARCH_PLACEHOLDER}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div aria-hidden="true" className="waterline mt-8 w-full opacity-70" />

          {trashedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg border bg-card text-3xl shadow-sm"
                aria-hidden="true"
              >
                🗑️
              </div>
              <p className="max-w-sm text-sm text-muted-foreground">{MESSAGES.TRASH_EMPTY}</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {MESSAGES.TRASH_NO_RESULTS}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((note) => {
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
                      <div className="truncate text-[13px] font-medium leading-4 text-foreground">
                        {note.title || MESSAGES.UNTITLED_NOTE}
                      </div>
                      <div className="truncate font-mono text-[10px] leading-4 text-muted-foreground">
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
        </div>
      </div>

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
