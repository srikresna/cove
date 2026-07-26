import { Command } from "cmdk";
import { ArrowRight, FileText, Search } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import type { NoteSearchHit } from "../../domain/note/NoteSearchHit";
import { presentError } from "../../services/errorPresenter";
import { useNoteStore } from "../../store/useNoteStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

const SEARCH_DEBOUNCE_MS = 250;

export const QuickSearchModal: React.FC = () => {
  const { isQuickSearchOpen, setQuickSearchOpen, workspaces, setActiveWorkspace } =
    useWorkspaceStore();
  const { setActiveNoteId } = useNoteStore();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<NoteSearchHit[]>([]);
  const [loading, setLoading] = useState(false);

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
    }
  }, [isQuickSearchOpen]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        setHits(await noteService.searchAcrossWorkspaces(q));
      } catch (err) {
        setHits([]);
        const p = presentError(err);
        useNotificationStore.getState().pushToast({
          kind: p.kind,
          title: p.toastTitle,
          description: p.toastDescription,
        });
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  const openHit = (hit: NoteSearchHit) => {
    const ws = workspaces.find((w) => w.id === hit.workspaceId);
    if (ws) setActiveWorkspace(ws.id);
    setActiveNoteId(hit.id);
    setQuickSearchOpen(false);
  };

  const trimmed = query.trim();

  return (
    <Dialog open={isQuickSearchOpen} onOpenChange={setQuickSearchOpen}>
      <DialogContent
        className="top-[18%] max-w-lg -translate-y-0 gap-0 overflow-hidden p-0"
        hideClose
      >
        <DialogTitle className="sr-only">{MESSAGES.QUICK_SEARCH_PLACEHOLDER}</DialogTitle>
        <Command className="w-full" shouldFilter={false}>
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder={MESSAGES.QUICK_SEARCH_PLACEHOLDER}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            {!trimmed && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {MESSAGES.QUICK_SEARCH_PLACEHOLDER}
              </div>
            )}
            {trimmed && loading && (
              <div className="p-8 text-center text-sm text-muted-foreground">Searching…</div>
            )}
            {trimmed && !loading && hits.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {MESSAGES.QUICK_SEARCH_EMPTY}
              </div>
            )}
            {hits.map((hit) => {
              const ws = workspaces.find((w) => w.id === hit.workspaceId);
              return (
                <Command.Item
                  key={hit.id}
                  value={`${hit.title} ${hit.snippet}`}
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
                      <div className="truncate text-xs text-muted-foreground">{hit.snippet}</div>
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
        </Command>
      </DialogContent>
    </Dialog>
  );
};
