import { CalendarCheck, CalendarPlus, FileText, Plus, X } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";
import { WeekDatePicker } from "../../components/ui/WeekDatePicker";
import { MESSAGES } from "../../constants/messages";
import { journalService } from "../../di/container";
import { useJournalValuesByNote } from "../../hooks/useJournalValuesByNote";
import { useNotes } from "../../hooks/useNotes";
import { useOpenJournal } from "../../hooks/useOpenJournal";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { dayKey, MonthGrid } from "./MonthGrid";

const keyOf = (timestamp: number): string => dayKey(new Date(timestamp));

/**
 * The Journals page: week strip + Today shortcut, month grid with journal
 * dots, and the selected day's journals (conflict block when several).
 */
export const JournalsPage: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNotes();
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const [selectedDate, setSelectedDate] = useState(() => Date.now());
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const openJournal = useOpenJournal();
  const journalByNoteId = useJournalValuesByNote();

  const selectedKey = keyOf(selectedDate);
  const isToday = selectedKey === keyOf(Date.now());

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );

  // Journal day keys + the selected day's journal notes (a day can hold
  // several — the conflict block resolves them).
  const journalsByDay = useMemo(() => {
    const byDay = new Map<string, typeof workspaceNotes>();
    for (const note of workspaceNotes) {
      const ts = journalByNoteId.get(note.id);
      if (ts == null) continue;
      const key = keyOf(ts);
      const list = byDay.get(key) ?? [];
      list.push(note);
      byDay.set(key, list);
    }
    return byDay;
  }, [workspaceNotes, journalByNoteId]);

  const selectedJournals = journalsByDay.get(selectedKey) ?? [];

  const selectDay = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    const date = new Date(y ?? 0, m ?? 0, d ?? 1);
    setSelectedDate(date.getTime());
    setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const goToday = () => {
    const now = new Date();
    setSelectedDate(now.getTime());
    setMonthCursor(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Week-strip picks must sync the month grid too — the strip can walk into
  // an adjacent month whose cells the grid isn't showing.
  const selectFromStrip = (timestamp: number) => {
    setSelectedDate(timestamp);
    const date = new Date(timestamp);
    setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const removeJournalMark = (noteId: string) => {
    journalService
      .removeJournalDate(noteId)
      .then(() => {})
      .catch(notifyError);
  };

  const selectedLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(selectedDate));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b bg-background/50">
        <div className="mx-auto w-full max-w-2xl px-6 pt-8 pb-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
              {MESSAGES.JOURNALS_PAGE_TITLE}
            </h2>
            {!isToday && (
              <Button
                variant="secondary"
                size="sm"
                aria-label={MESSAGES.JOURNAL_TODAY}
                onClick={goToday}
                className="gap-1.5"
              >
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {MESSAGES.JOURNAL_TODAY}
              </Button>
            )}
          </div>
          <div className="mt-3">
            <WeekDatePicker value={selectedDate} onChange={selectFromStrip} />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-6 pt-6 pb-16">
          <MonthGrid
            month={monthCursor}
            selectedKey={selectedKey}
            journalDays={new Set(journalsByDay.keys())}
            onSelectDay={selectDay}
            onShiftMonth={(delta) =>
              setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
            }
          />

          <div className="mt-8">
            <p className="pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {selectedLabel}
            </p>

            {selectedJournals.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <CalendarPlus className="h-4.5 w-4.5 text-muted-foreground" />
                </span>
                <p className="text-sm text-muted-foreground">{MESSAGES.JOURNAL_NONE_DESC}</p>
                <Button onClick={() => openJournal(selectedDate)} className="gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{MESSAGES.JOURNAL_CREATE}</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {selectedJournals.map((note, index) => (
                  <div key={note.id} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveNoteId(note.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span aria-hidden="true" className="shrink-0 text-sm">
                        {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
                      </span>
                      <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
                      {index > 0 && (
                        <span
                          className={cn(
                            "ml-1 shrink-0 rounded border border-destructive/40 bg-destructive/10 px-1.5 text-[10px] text-destructive",
                          )}
                        >
                          {MESSAGES.JOURNAL_CONFLICT}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={MESSAGES.JOURNAL_REMOVE_MARK}
                      title={MESSAGES.JOURNAL_REMOVE_MARK}
                      onClick={() => removeJournalMark(note.id)}
                      className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
