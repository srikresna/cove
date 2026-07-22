import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { EditorHeader } from "./EditorHeader";
import { TableOfContents } from "./TableOfContents";

interface BlockNoteEditorProps {
  note: Note;
}

export const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({ note }) => {
  const { updateNote } = useNoteStore();
  const { isDarkMode } = useWorkspaceStore();
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const editor = useCreateBlockNote();

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
    };

    const container = editorRef.current;
    if (container) {
      container.addEventListener("dragover", handleDragOver);
    }
    return () => {
      if (container) {
        container.removeEventListener("dragover", handleDragOver);
      }
    };
  }, []);

  const handleEditorChange = useCallback(() => {
    if (!editor) return;

    let fullText = "";
    for (const block of editor.document) {
      if (block.content && Array.isArray(block.content)) {
        for (const inline of block.content) {
          if ("text" in inline) {
            fullText += `${inline.text} `;
          }
        }
      }
    }

    const trimmed = fullText.trim();
    setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
    setCharacterCount(trimmed.length);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const jsonContent = JSON.stringify(editor.document);
      updateNote(note.id, { content: jsonContent });
    }, 300);
  }, [editor, note.id, updateNote]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadInitialContent = async () => {
      if (!editor) return;
      if (!note.content || note.content === "<p></p>") {
        return;
      }

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
        console.error("loadInitialContent error:", err);
      }
    };

    loadInitialContent();
  }, [note.content, editor]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("requestFullscreen error:", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("exitFullscreen error:", err);
      });
      setIsFullscreen(false);
    }
  };

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

        <TableOfContents editorRef={editorRef} contentHtml={note.content || ""} />

        <div ref={editorRef} className="relative min-h-[500px] mt-4">
          {editor && (
            <BlockNoteView
              editor={editor}
              onChange={handleEditorChange}
              theme={isDarkMode ? "dark" : "light"}
            />
          )}
        </div>
      </div>
    </div>
  );
};
