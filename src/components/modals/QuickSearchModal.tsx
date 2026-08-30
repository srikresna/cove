import { Command } from "cmdk";
import { ArrowRight, CalendarDays, FileText, Search } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { journalService, noteService } from "../../di/container";
import type { Note } from "../../domain/note/Note";
import type { NoteSearchHit } from "../../domain/note/NoteSearchHit";
import { suggestJournalDate } from "../../services/suggestJournalDate";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { extractParagraphs } from "../../utils/plainText";
import { formatFullTimestamp } from "../../utils/time";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

const SEARCH_DEBOUNCE_MS = 250;
const PREVIEW_PARAGRAPH_LIMIT = 30;

interface PreviewData {
  note: Note;
  paragraphs: string[];
}

const PreviewPane: React.FC<{ preview: PreviewData | null; hasHits: boolean }> = ({
  preview,
  hasHits,
}) => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  if (!preview) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        {hasHits ? MESSAGES.SEARCH_PREVIEW_HINT : ""}
      </div>
    );
  }
  const { note, paragraphs } = preview;
  const ws = workspaces.find((w) => w.id === note.workspaceId);
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center text-lg"
            aria-hidden="true"
          >
            {note.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
          </span>
          <span className="truncate font-display text-[15px] font-semibold text-foreground">
            {note.title || MESSAGES.UNTITLED_NOTE}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="rounded-sm bg-muted px-1.5 py-0.5">
            {ws?.emoji} {ws?.name}
          </span>
          <span>{formatFullTimestamp(note.updatedAt)}</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {paragraphs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{MESSAGES.SEARCH_PREVIEW_EMPTY_NOTE}</p>
        ) : (
          paragraphs.slice(0, PREVIEW_PARAGRAPH_LIMIT).map((paragraph, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: read-only excerpt list with no reordering
            <p key={index} className="text-[13px] leading-relaxed text-foreground/90">
              {paragraph}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export const QuickSearchModal: React.FC = () => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const isQuickSearchOpen = useUIStore((s) => s.isQuickSearchOpen);
  const setQuickSearchOpen = useUIStore((s) => s.setQuickSearchOpen);
  const pickerResolve = useUIStore((s) => s.pickerResolve);
  const resolvePicker = useUIStore((s) => s.resolvePicker);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<NoteSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedId, setHighlightedId] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const previewCache = useRef(new Map<string, PreviewData>());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickSearchOpen(!isQuickSearchOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuickSearchOpen, setQuickSearchOpen]);

  useEffect(() => {
    if (!isQuickSearchOpen) {
      setQuery("");
      setHits([]);
      setHighlightedId("");
      setPreview(null);
      previewCache.current.clear();
    }
  }, [isQuickSearchOpen]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits([]);
      setPreview(null);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const results = await noteService.searchAcrossWorkspaces(q);
        if (!cancelled) setHits(results);
      } catch (err) {
        if (!cancelled) {
          setHits([]);
          notifyError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    if (!highlightedId) {
      setPreview(null);
      return;
    }
    const cached = previewCache.current.get(highlightedId);
    if (cached) {
      setPreview(cached);
      return;
    }
    let stale = false;
    void noteService
      .getNote(highlightedId)
      .then((note) => {
        if (stale || !note) return;
        const data: PreviewData = { note, paragraphs: extractParagraphs(note.content) };
        previewCache.current.set(note.id, data);
        setPreview(data);
      })
      .catch(() => {
        if (!stale) setPreview(null);
      });
    return () => {
      stale = true;
    };
  }, [highlightedId]);

  const openHit = (hit: NoteSearchHit) => {
    if (pickerResolve) {
      resolvePicker(hit.id);
      return;
    }
    const ws = workspaces.find((w) => w.id === hit.workspaceId);
    if (ws) setActiveWorkspace(ws.id);
    setActiveNoteId(hit.id);
    setQuickSearchOpen(false);
  };

  const onOpenChange = (open: boolean) => {
    setQuickSearchOpen(open);
  };

  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  const openJournal = (timestamp: number) => {
    if (!activeWorkspaceId) return;
    journalService
      .ensureJournalByDate(activeWorkspaceId, timestamp)
      .then(async (noteId) => {
        await useNoteStore.getState().refreshNotesInPlace(activeWorkspaceId);
        if (pickerResolve) {
          resolvePicker(noteId);
          return;
        }
        setActiveNoteId(noteId);
        setQuickSearchOpen(false);
      })
      .catch(notifyError);
  };

  const trimmed = query.trim();

  const journalSuggestion = useMemo(
    () => (trimmed ? suggestJournalDate(trimmed) : null),
    [trimmed],
  );

  const suggestionLabel = useMemo(() => {
    if (!journalSuggestion) return null;
    const date = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(journalSuggestion.timestamp));
    return journalSuggestion.alias ? `${journalSuggestion.alias}, ${date}` : date;
  }, [journalSuggestion]);

  return (
    <Dialog open={isQuickSearchOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12%] max-w-3xl -translate-y-0 gap-0 overflow-hidden p-0"
        hideClose
      >
        <DialogTitle className="sr-only">{MESSAGES.QUICK_SEARCH_PLACEHOLDER}</DialogTitle>
        <Command
          className="w-full"
          shouldFilter={false}
          value={highlightedId}
          onValueChange={setHighlightedId}
        >
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={MESSAGES.QUICK_SEARCH_PLACEHOLDER}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid h-[380px] grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <Command.List className="h-full overflow-y-auto border-r p-2">
              {!trimmed && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {MESSAGES.QUICK_SEARCH_PLACEHOLDER}
                </div>
              )}
              {!loading && (journalSuggestion || trimmed) && (
                <Command.Group
                  heading={MESSAGES.JOURNAL_FIELD}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {journalSuggestion && suggestionLabel && (
                    <Command.Item
                      value={`journal-${journalSuggestion.timestamp}`}
                      onSelect={() => openJournal(journalSuggestion.timestamp)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors aria-selected:bg-accent"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <CalendarDays
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="truncate text-sm text-foreground">{suggestionLabel}</span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground/50"
                        aria-hidden="true"
                      />
                    </Command.Item>
                  )}
                  <Command.Item
                    value="journal-pick-date"
                    onSelect={() => openJournal(Date.now())}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors aria-selected:bg-accent"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                    <span className="truncate text-sm text-foreground">
                      {MESSAGES.JOURNAL_PICK_DATE}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </Command.Item>
                </Command.Group>
              )}
              {trimmed && loading && (
                <div className="p-8 text-center text-sm text-muted-foreground">Searching…</div>
              )}
              {trimmed && !loading && hits.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {MESSAGES.QUICK_SEARCH_EMPTY}
                </div>
              )}
              {trimmed &&
                hits.map((hit) => {
                  const ws = workspaces.find((w) => w.id === hit.workspaceId);
                  return (
                    <Command.Item
                      key={hit.id}
                      value={hit.id}
                      onSelect={() => openHit(hit)}
                      className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-left outline-none transition-colors aria-selected:bg-accent"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-base"
                        aria-hidden="true"
                      >
                        {hit.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {hit.title || MESSAGES.UNTITLED_NOTE}
                        </div>
                        {hit.snippet && (
                          <div className="truncate text-xs text-muted-foreground">
                            {hit.snippet}
                          </div>
                        )}
                        <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {ws?.emoji || "🚀"} {ws?.name || "Workspace"}
                        </span>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground/50"
                        aria-hidden="true"
                      />
                    </Command.Item>
                  );
                })}
            </Command.List>

            <PreviewPane preview={preview} hasHits={hits.length > 0} />
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};
