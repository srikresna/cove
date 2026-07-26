import { BlockNoteView } from "@blocknote/mantine";
import { SuggestionMenuController, useCreateBlockNote } from "@blocknote/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { Logger } from "../../services/Logger";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { extractPlainText } from "../../utils/plainText";
import { TooltipProvider } from "../ui/tooltip";
import { EditorHeader } from "./EditorHeader";
import { EditorRightBar } from "./EditorRightBar";
import { EditorTopbar } from "./EditorTopbar";
import { coveSchema } from "./noteLinkSpec";

interface BlockNoteEditorProps {
  note: Note;
}

const RIGHTBAR_KEY = "cove-rightbar-open";

function countWordsAndChars(contentStr: string): { wordCount: number; characterCount: number } {
  const cleanText = extractPlainText(contentStr).trim();
  const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
  return { wordCount: words.length, characterCount: cleanText.length };
}

export const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({ note }) => {
  const { updateNote } = useNoteStore();
  const { isDarkMode } = useWorkspaceStore();
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRightBarOpen, setRightBarOpen] = useState(
    () => localStorage.getItem(RIGHTBAR_KEY) === "true",
  );
  const lastLoadedContentRef = useRef<string>("");
  const contentTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingContentRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const editor = useCreateBlockNote({ schema: coveSchema });

  useEffect(() => {
    const loadInitialContent = async () => {
      if (!editor || !note.content) return;
      if (lastLoadedContentRef.current === note.content) return;

      lastLoadedContentRef.current = note.content;

      try {
        const trimmed = note.content.trim();
        if (trimmed.startsWith("[")) {
          const parsedBlocks = JSON.parse(trimmed);
          if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
            editor.replaceBlocks(editor.document, parsedBlocks);
          }
        } else {
          const blocks = await editor.tryParseHTMLToBlocks(note.content);
          if (Array.isArray(blocks) && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          }
        }
      } catch (err) {
        // Name only — V8 SyntaxError messages embed excerpts of the parsed
        // source, which here is decrypted note content.
        Logger.error("loadInitialContent error", undefined, {
          errorName: err instanceof Error ? err.name : typeof err,
        });
      }
    };

    loadInitialContent();
  }, [note.content, editor]);

  useEffect(() => {
    return () => {
      if (contentTimer.current) clearTimeout(contentTimer.current);
      // Flush a pending debounced save so switching notes never loses input.
      const pending = pendingContentRef.current;
      if (pending) updateNote(note.id, { content: pending });
    };
  }, [note.id, updateNote]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        Logger.error("requestFullscreen error", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        Logger.error("exitFullscreen error", err);
      });
      setIsFullscreen(false);
    }
  };

  const toggleRightBar = () => {
    setRightBarOpen((open) => {
      localStorage.setItem(RIGHTBAR_KEY, String(!open));
      return !open;
    });
  };

  const getLinkSuggestions = async (query: string) => {
    const q = query.trim().toLowerCase();
    return useNoteStore
      .getState()
      .notes.filter((n) => n.id !== note.id)
      .filter((n) => !q || (n.title || MESSAGES.UNTITLED_NOTE).toLowerCase().includes(q))
      .slice(0, 10)
      .map((n) => ({
        title: n.title || MESSAGES.UNTITLED_NOTE,
        icon: <span aria-hidden="true">{n.icon || "📝"}</span>,
        onItemClick: () => {
          editor.insertInlineContent([
            {
              type: "noteLink",
              props: { noteId: n.id, title: n.title || MESSAGES.UNTITLED_NOTE },
            },
            " ",
          ]);
        },
      }));
  };

  const { wordCount, characterCount } = useMemo(
    () => countWordsAndChars(note.content),
    [note.content],
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full flex-col">
        <EditorTopbar
          note={note}
          wordCount={wordCount}
          characterCount={characterCount}
          isFullWidth={isFullWidth}
          isFullscreen={isFullscreen}
          isRightBarOpen={isRightBarOpen}
          onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
          onToggleFullscreen={toggleFullscreen}
          onToggleRightBar={toggleRightBar}
        />

        <div className="flex min-h-0 w-full flex-1">
          <div className="relative h-full min-w-0 flex-1">
            <div ref={scrollRef} className="h-full w-full overflow-y-auto">
              <EditorHeader note={note} isFullWidth={isFullWidth} />

              <div
                className={cn("min-h-[500px] w-full pb-24", !isFullWidth && "mx-auto max-w-3xl")}
              >
                <BlockNoteView
                  editor={editor}
                  theme={isDarkMode ? "dark" : "light"}
                  onChange={() => {
                    const blocksJson = JSON.stringify(editor.document);
                    lastLoadedContentRef.current = blocksJson;
                    pendingContentRef.current = blocksJson;
                    if (contentTimer.current) clearTimeout(contentTimer.current);
                    contentTimer.current = setTimeout(() => {
                      pendingContentRef.current = null;
                      updateNote(note.id, { content: blocksJson });
                    }, 500);
                  }}
                >
                  <SuggestionMenuController triggerCharacter="@" getItems={getLinkSuggestions} />
                </BlockNoteView>
              </div>
            </div>
          </div>

          {isRightBarOpen && (
            <EditorRightBar note={note} scrollRef={scrollRef} onClose={toggleRightBar} />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
