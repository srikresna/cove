import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logger } from "../../services/Logger";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { extractPlainText } from "../../utils/plainText";
import { EditorHeader } from "./EditorHeader";
import "@blocknote/mantine/style.css";

interface BlockNoteEditorProps {
  note: Note;
}

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
  const lastLoadedContentRef = useRef<string>("");

  const editor = useCreateBlockNote({});

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

  const { wordCount, characterCount } = useMemo(
    () => countWordsAndChars(note.content),
    [note.content],
  );

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-6">
      <div
        className={`transition-all duration-200 ${
          isFullWidth ? "max-w-full px-6" : "max-w-4xl mx-auto w-full"
        }`}
      >
        <EditorHeader
          note={note}
          wordCount={wordCount}
          characterCount={characterCount}
          isFullWidth={isFullWidth}
          isFullscreen={isFullscreen}
          onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
          onToggleFullscreen={toggleFullscreen}
        />

        <div className="w-full min-h-[500px]">
          <BlockNoteView
            editor={editor}
            theme={isDarkMode ? "dark" : "light"}
            onChange={() => {
              const blocksJson = JSON.stringify(editor.document);
              lastLoadedContentRef.current = blocksJson;
              updateNote(note.id, { content: blocksJson });
            }}
          />
        </div>
      </div>
    </div>
  );
};
