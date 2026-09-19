import { ArrowRight, CalendarPlus, House, NotebookPen, Plus, Video } from "lucide-react";
import type React from "react";
import { Fragment, useMemo } from "react";
import { NoteIcon } from "../../components/NoteIcon";
import { Button } from "../../components/ui/button";
import { MESSAGES } from "../../constants/messages";
import type { GcalAgendaEvent } from "../../domain/gcal/GcalTypes";
import { useGcalWindowEvents } from "../../hooks/useGcalWindowEvents";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { openExternal } from "../../services/blocksuite/externalLinks";
import { noteActions } from "../../store/noteActions";
import { notifyError } from "../../store/notify";
import { useGcalStore } from "../../store/useGcalStore";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const greetingFor = (hour: number): string => {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const relativeTime = (timestamp: number): string => {
  const minutes = Math.round((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(timestamp),
  );
};

const eventTimeLabel = (event: GcalAgendaEvent): string => {
  if (!event.start.dateTime) return MESSAGES.GCAL_EVENT_ALL_DAY;
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(event.start.dateTime),
  );
};

const startMs = (event: GcalAgendaEvent): number =>
  event.start.dateTime ? Date.parse(event.start.dateTime) : 0;

export const HomePage: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNotes();
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const gcalStatus = useGcalStore((s) => s.status);
  const gcalShowEvents = useSettingsStore((s) => s.gcalShowEvents);

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const { events } = useGcalWindowEvents(dayStart, dayEnd);

  const upcoming = useMemo(
    () =>
      events
        .filter((event) => startMs(event) >= now.getTime() - 30 * 60_000)
        .sort((a, b) => startMs(a) - startMs(b))
        .slice(0, 5),
    // biome-ignore lint/correctness/useExhaustiveDependencies: "now" is captured once per mount on purpose — the page refreshes on navigation
    [events],
  );

  const recentNotes = useMemo(
    () =>
      notes
        .filter((note) => note.workspaceId === activeWorkspaceId && !note.isTemplate)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5),
    [notes, activeWorkspaceId],
  );

  const eyebrow = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(now);

  const handleNewNote = () => {
    if (!activeWorkspaceId) return;
    try {
      void noteActions.createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE);
    } catch (err) {
      notifyError(err);
    }
  };

  const openNote = (noteId: string) => {
    setActiveNoteId(noteId);
    setActivePage("editor");
  };

  const nowLabel = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);

  const firstUpcomingIndex = upcoming.findIndex((event) => startMs(event) > now.getTime());

  return (
    <div className="cove-doc-scroll overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col px-8 pt-16 pb-20">
        <p className="font-mono text-[11px] uppercase leading-4 tracking-widest text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-foreground">
          {greetingFor(now.getHours())}
        </h1>

        <div className="mt-6 flex items-center gap-2">
          <Button size="sm" onClick={handleNewNote}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {MESSAGES.HOME_NEW_NOTE}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setActivePage("calendar")}>
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
            {MESSAGES.HOME_NEW_EVENT}
          </Button>
        </div>

        <section className="mt-12">
          <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-widest text-muted-foreground">
            {MESSAGES.HOME_UP_NEXT}
          </h2>

          {gcalStatus !== "connected" ? (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-dashed p-4">
              <p className="text-[13px] leading-5 text-muted-foreground">
                {MESSAGES.HOME_CONNECT_CALENDAR}
              </p>
              <Button size="sm" variant="outline" onClick={() => setActivePage("calendar")}>
                {MESSAGES.HOME_OPEN_CALENDAR}
              </Button>
            </div>
          ) : upcoming.length === 0 ? (
            <p className="mt-3 px-1 text-[13px] leading-5 text-muted-foreground">
              {MESSAGES.HOME_NOTHING_NEXT}
            </p>
          ) : (
            <ul className="mt-3">
              {upcoming.map((event, index) => {
                const showNowLine =
                  gcalShowEvents &&
                  firstUpcomingIndex === index &&
                  now.getHours() >= 6 &&
                  now.getHours() < 22;
                return (
                  <Fragment key={`${event.calendarId}:${event.id}`}>
                    {showNowLine && (
                      <li aria-hidden="true" className="my-2 flex items-center gap-3 first:mt-0">
                        <span className="w-14 shrink-0 text-right font-mono text-[11px] leading-4 text-primary">
                          {nowLabel}
                        </span>
                        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary motion-reduce:hidden" />
                        <span className="h-px flex-1 bg-primary/40" />
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={() =>
                          event.hangoutLink
                            ? void openExternal(event.hangoutLink)
                            : setActivePage("calendar")
                        }
                        className="flex w-full items-center gap-3 rounded-md px-1 py-2 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span
                          className="w-14 shrink-0 text-right font-mono text-[11px] leading-4"
                          style={{ color: event.calendarColor ?? undefined }}
                        >
                          {eventTimeLabel(event)}
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full border border-border"
                          style={{ backgroundColor: event.calendarColor ?? "transparent" }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-foreground">
                          {event.summary || MESSAGES.GCAL_EVENT_UNTITLED}
                        </span>
                        {event.hangoutLink && (
                          <Video
                            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase leading-4 tracking-widest text-muted-foreground">
              {MESSAGES.HOME_CONTINUE}
            </h2>
            <button
              type="button"
              onClick={() => setActivePage("library")}
              className="flex items-center gap-1 rounded p-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {MESSAGES.HOME_ALL_NOTES}
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed p-4">
              <NotebookPen className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-[13px] leading-5 text-muted-foreground">
                {MESSAGES.HOME_NO_NOTES}
              </p>
            </div>
          ) : (
            <ul className="mt-3">
              {recentNotes.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => openNote(note.id)}
                    className="flex w-full items-center gap-3 rounded-md px-1 py-2 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span aria-hidden="true" className="shrink-0 text-sm">
                      <NoteIcon icon={note.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] leading-5 text-foreground">
                      {note.title || MESSAGES.UNTITLED_NOTE}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] leading-4 text-muted-foreground/70">
                      {relativeTime(note.updatedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p
          aria-hidden="true"
          className={cn(
            "mt-16 flex items-center gap-2 font-mono text-[10px] uppercase leading-4 tracking-widest text-muted-foreground/40",
          )}
        >
          <House className="h-3 w-3" aria-hidden="true" />
          Cove
        </p>
      </div>
    </div>
  );
};
