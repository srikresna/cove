import * as Popover from "@radix-ui/react-popover";
import EmojiPicker from "emoji-picker-react";
import { ArrowRightLeft, Copy, Maximize2, Minimize2, Pin, Star, Trash2 } from "lucide-react";
import type React from "react";
import { useNoteStore } from "../../store/useNoteStore";
import type { Note } from "../../types";

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
                className="px-3 py-1 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-xs font-semibold text-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform outline-none"
              >
                Change Accent
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
              onClick={onToggleFullWidth}
              title={isFullWidth ? "Standard Width" : "Wide Width"}
              className="p-1.5 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform text-xs flex items-center gap-1 font-semibold px-2.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isFullWidth ? "Standard" : "Wide"}</span>
            </button>

            <button
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-1.5 rounded-[20px] bg-cream-paper border-[1.5px] border-charcoal text-charcoal shadow-paper-lift hover:scale-105 active:scale-95 transition-transform text-xs flex items-center gap-1 font-semibold px-2.5"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span>{isFullscreen ? "Exit" : "Full Window"}</span>
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
            onClick={() => togglePinNote(note.id)}
            title={note.isPinned ? "Unpin Note" : "Pin Note"}
            className={`p-2 rounded-[14px] transition-all hover:scale-105 active:scale-95 ${
              note.isPinned
                ? "bg-marker-orange text-cream-paper font-bold"
                : "text-charcoal hover:bg-cream-paper"
            }`}
          >
            <Pin className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => toggleFavoriteNote(note.id)}
            title={note.isFavorite ? "Unfavorite" : "Favorite"}
            className={`p-2 rounded-[14px] transition-all hover:scale-105 active:scale-95 ${
              note.isFavorite
                ? "bg-marker-orange text-cream-paper font-bold"
                : "text-charcoal hover:bg-cream-paper"
            }`}
          >
            <Star className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => duplicateNote(note.id)}
            title="Duplicate Note"
            className="p-2 rounded-[14px] text-charcoal hover:bg-cream-paper transition-all hover:scale-105 active:scale-95"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => deleteNote(note.id)}
            title="Delete Note"
            className="p-2 rounded-[14px] text-charcoal hover:text-red-600 hover:bg-red-50 transition-all hover:scale-105 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pl-[54px] pr-0">
        <input
          type="text"
          value={note.title}
          onChange={(e) => updateNote(note.id, { title: e.target.value })}
          placeholder="Untitled Note"
          className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent outline-none border-b-[2px] border-transparent focus:border-marker-orange transition-colors py-1 text-cocoa-ink placeholder-slate-300"
        />
        <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{characterCount} characters</span>
          <span>•</span>
          <span>
            Updated{" "}
            {new Date(note.updatedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
