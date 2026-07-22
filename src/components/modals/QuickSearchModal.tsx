import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { ArrowRight, Search, X } from "lucide-react";
import type React from "react";
import { useEffect } from "react";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

function extractPlainText(content: string): string {
  if (!content) return "";
  try {
    const trimmed = content.trim();
    if (trimmed.startsWith("[")) {
      const blocks = JSON.parse(trimmed);
      let text = "";
      if (Array.isArray(blocks)) {
        for (const block of blocks) {
          if (block.content && Array.isArray(block.content)) {
            for (const inline of block.content) {
              if (
                inline &&
                typeof inline === "object" &&
                "text" in inline &&
                typeof inline.text === "string"
              ) {
                text += `${inline.text} `;
              }
            }
          }
        }
      }
      return text;
    }
  } catch (err) {
    console.error("extractPlainText parse error:", err);
  }
  return content.replace(/<[^>]*>/g, " ");
}

export const QuickSearchModal: React.FC = () => {
  const { isQuickSearchOpen, setQuickSearchOpen, workspaces, setActiveWorkspace } =
    useWorkspaceStore();
  const { notes, setActiveNoteId } = useNoteStore();

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

  return (
    <Dialog.Root open={isQuickSearchOpen} onOpenChange={setQuickSearchOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-cream-paper rounded-[16px] border-[1.5px] border-charcoal shadow-card-subtle overflow-hidden outline-none">
          <Command className="w-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-charcoal/20">
              <Search className="w-5 h-5 text-marker-orange" />
              <Command.Input
                placeholder="Type to search notes across all workspaces..."
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-cocoa-ink placeholder-slate-400"
              />
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 rounded-lg text-charcoal hover:bg-dew-drop outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
              <Command.Empty className="p-8 text-center text-xs text-slate-400">
                No notes found matching your search.
              </Command.Empty>

              {notes.map((note) => {
                const ws = workspaces.find((w) => w.id === note.workspaceId);
                const plainText = extractPlainText(note.content);
                return (
                  <Command.Item
                    key={note.id}
                    value={`${note.title} ${plainText}`}
                    onSelect={() => {
                      if (ws) setActiveWorkspace(ws.id);
                      setActiveNoteId(note.id);
                      setQuickSearchOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-[12px] hover:bg-dew-drop border border-transparent hover:border-charcoal text-left transition-colors cursor-pointer group outline-none aria-selected:bg-dew-drop aria-selected:border-charcoal"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl flex-shrink-0">{note.icon || "📝"}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-cocoa-ink truncate">
                          {note.title || "Untitled Note"}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-[6px] bg-cream-paper border border-charcoal text-[10px] font-semibold">
                            {ws?.emoji || "🚀"} {ws?.name || "Workspace"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-marker-orange opacity-0 group-hover:opacity-100 transition-opacity" />
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
