import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { ArrowRight, Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import type { NoteSearchHit } from "../../domain/note/NoteSearchHit";
import { presentError } from "../../services/errorPresenter";
import { useNoteStore } from "../../store/useNoteStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

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
    <Dialog.Root open={isQuickSearchOpen} onOpenChange={setQuickSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-cream-paper rounded-[16px] border-[1.5px] border-charcoal shadow-card-subtle overflow-hidden outline-none">
          <Command className="w-full" shouldFilter={false}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-charcoal/20">
              <Search className="w-5 h-5 text-marker-orange" aria-hidden="true" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder={MESSAGES.QUICK_SEARCH_PLACEHOLDER}
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-cocoa-ink placeholder-slate-400"
              />
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close search modal"
                  className="p-1 rounded-lg text-charcoal hover:bg-dew-drop outline-none"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
              {!trimmed && (
                <div className="p-8 text-center text-xs text-slate-400">
                  {MESSAGES.QUICK_SEARCH_PLACEHOLDER}
                </div>
              )}
              {trimmed && loading && (
                <div className="p-8 text-center text-xs text-slate-400">Searching…</div>
              )}
              {trimmed && !loading && hits.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
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
                    className="w-full flex items-start gap-3 p-3 rounded-[12px] hover:bg-dew-drop border border-transparent hover:border-charcoal text-left cursor-pointer outline-none aria-selected:bg-dew-drop aria-selected:border-charcoal"
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">
                      {hit.icon || "📝"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-cocoa-ink truncate">
                        {hit.title || MESSAGES.UNTITLED_NOTE}
                      </div>
                      {hit.snippet && (
                        <div className="text-[11px] text-slate-500 truncate">{hit.snippet}</div>
                      )}
                      <div className="mt-0.5">
                        <span className="px-1.5 py-0.5 rounded-[6px] bg-cream-paper border border-charcoal text-[10px] font-semibold">
                          {ws?.emoji || "🚀"} {ws?.name || "Workspace"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-marker-orange opacity-40"
                      aria-hidden="true"
                    />
                  </Command.Item>
                );
              })}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
