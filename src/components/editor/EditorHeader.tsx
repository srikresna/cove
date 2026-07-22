import * as Popover from "@radix-ui/react-popover";
import EmojiPicker from "emoji-picker-react";
import { ArrowRightLeft, Copy, Maximize2, Minimize2, Pin, Star, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import type { Note } from "../../types";
import { SaveStatusBadge } from "./SaveStatusBadge";

interface EditorHeaderProps {
  note: Note;
  wordCount: number;
  characterCount: number;
  isFullWidth: boolean;
  isFullscreen: boolean;
  onToggleFullWidth: () => void;
  onToggleFullscreen: () => void;
}

const COVER_COLORS = ["#ff6f1e", "#a594f9", "#ff70a6", "#ff9770", "#ffd670", "#70d6ff", "#b8f2e6"];

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  note,
  wordCount,
  characterCount,
  isFullWidth,
  isFullscreen,
  onToggleFullWidth,
  onToggleFullscreen,
}) => {
  const { updateNote, deleteNote, duplicateNote, togglePinNote, toggleFavoriteNote } =
    useNoteStore();

  const [title, setTitle] = useState(note.title);
  const titleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (titleTimer.current) {
      clearTimeout(titleTimer.current);
    }

    titleTimer.current = setTimeout(() => {
      updateNote(note.id, { title: newTitle });
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (titleTimer.current) {
        clearTimeout(titleTimer.current);
      }
    };
  }, []);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(note.updatedAt);

  return (
    <div className="mb-6 space-y-4">
      <div
        className="h-24 w-full rounded-[16px] border-[1.5px] border-charcoal transition-all duration-300 relative group overflow-hidden shadow-card-subtle flex items-end p-3"
        style={{
          background: `linear-gradient(135deg, ${note.coverColor || "#ff6f1e"} 0%, #fdfbf9 100%), ${note.coverColor || "#ff6f1e"}`,
        }}
      >
        <div className="flex items-center justify-between w-full">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label={MESSAGES.CHANGE_ACCENT}
                className="px-3 py-1 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-xs font-semibold text-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform outline-none"
              >
                {MESSAGES.CHANGE_ACCENT}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className="z-50 flex gap-2 p-2 rounded-[16px] bg-cream-paper border-[1.5px] border-charcoal shadow-card-subtle outline-none"
              >
                {COVER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select cover accent color ${color}`}
                    onClick={() => updateNote(note.id, { coverColor: color })}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-125 border border-charcoal"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isFullWidth ? "Standard Width" : "Wide Width"}
              onClick={onToggleFullWidth}
              className="p-1.5 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform text-xs flex items-center gap-1 font-semibold px-2.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isFullWidth ? MESSAGES.STANDARD_WIDTH : MESSAGES.WIDE_WIDTH}</span>
            </button>

            <button
              type="button"
              aria-label={isFullscreen ? MESSAGES.EXIT_FULL_WINDOW : MESSAGES.FULL_WINDOW}
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform text-xs flex items-center gap-1 font-semibold px-2.5"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{isFullscreen ? MESSAGES.EXIT_FULL_WINDOW : MESSAGES.FULL_WINDOW}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 pl-[54px] pr-0">
        <div className="relative">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                aria-label="Change Note Emoji Icon"
                className="text-4xl p-2 rounded-[16px] bg-cream-paper border-[1.5px] border-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform flex items-center justify-center min-w-[56px] min-h-[56px] outline-none"
              >
                {note.icon || "📝"}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                sideOffset={8}
                align="start"
                className="z-50 shadow-card-subtle rounded-[16px] overflow-hidden border-[1.5px] border-charcoal bg-cream-paper outline-none"
              >
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    updateNote(note.id, { icon: emojiData.emoji });
                  }}
                  autoFocusSearch={true}
                  width={340}
                  height={400}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        <div className="flex items-center gap-1.5 bg-dew-drop p-1.5 rounded-[20px] border-[1.5px] border-charcoal">
          <button
            type="button"
            aria-label={note.isPinned ? MESSAGES.UNPIN_NOTE : MESSAGES.PIN_NOTE}
            onClick={() => togglePinNote(note.id)}
            className={`p-2 rounded-[14px] transition-all hover:scale-105 active:scale-95 ${
              note.isPinned
                ? "bg-marker-orange text-cream-paper font-bold"
                : "text-charcoal hover:bg-cream-paper"
            }`}
          >
            <Pin className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
            onClick={() => toggleFavoriteNote(note.id)}
            className={`p-2 rounded-[14px] transition-all hover:scale-105 active:scale-95 ${
              note.isFavorite
                ? "bg-marker-orange text-cream-paper font-bold"
                : "text-charcoal hover:bg-cream-paper"
            }`}
          >
            <Star className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={MESSAGES.DUPLICATE_NOTE}
            onClick={() => duplicateNote(note.id)}
            className="p-2 rounded-[14px] text-charcoal hover:bg-cream-paper transition-all hover:scale-105 active:scale-95"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={MESSAGES.DELETE_NOTE}
            onClick={() => deleteNote(note.id)}
            className="p-2 rounded-[14px] text-charcoal hover:text-red-600 hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="pl-[54px] pr-0">
        <label htmlFor="note-title-input" className="sr-only">
          Note Title
        </label>
        <input
          id="note-title-input"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={MESSAGES.UNTITLED_NOTE}
          aria-label="Note Title"
          className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent outline-none border-b-[2px] border-transparent focus:border-marker-orange transition-colors py-1 text-cocoa-ink placeholder-slate-300"
        />
        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500 flex-wrap">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{characterCount} characters</span>
          <span>•</span>
          <span>Updated {formattedDate}</span>
          <span>•</span>
          <SaveStatusBadge />
        </div>
      </div>
    </div>
  );
};
