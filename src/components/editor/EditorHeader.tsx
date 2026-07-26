import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { ArrowRightLeft, Copy, Maximize2, Minimize2, Pin, Star, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { COVER_COLORS } from "../../constants/app";
import { MESSAGES } from "../../constants/messages";
import { cn } from "../../lib/utils";
import { useNoteStore } from "../../store/useNoteStore";
import { useSaveStatusStore } from "../../store/useSaveStatusStore";
import type { Note } from "../../types";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  note,
  wordCount,
  characterCount,
  isFullWidth,
  isFullscreen,
  onToggleFullWidth,
  onToggleFullscreen,
}) => {
  const { updateNote, requestDeleteNote, duplicateNote, togglePinNote, toggleFavoriteNote } =
    useNoteStore();
  const saveStatus = useSaveStatusStore((s) => s.status);

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

  const accent = note.coverColor || "#0e7c66";

  return (
    <div className="mb-2">
      <div
        className="group relative h-36 w-full"
        style={{
          background: `linear-gradient(160deg, ${accent}4d 0%, ${accent}14 60%, transparent 100%)`,
        }}
      >
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md border bg-card/90 p-0.5 opacity-0 shadow-sm backdrop-blur transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" aria-label={MESSAGES.CHANGE_ACCENT}>
                {MESSAGES.CHANGE_ACCENT}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="flex w-auto gap-2 p-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Select cover accent color ${color}`}
                  onClick={() => updateNote(note.id, { coverColor: color })}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    note.coverColor === color && "ring-2 ring-ring ring-offset-1",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="iconSm"
            aria-label={isFullWidth ? MESSAGES.STANDARD_WIDTH : MESSAGES.WIDE_WIDTH}
            onClick={onToggleFullWidth}
            className="text-muted-foreground"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            aria-label={isFullscreen ? MESSAGES.EXIT_FULL_WINDOW : MESSAGES.FULL_WINDOW}
            onClick={onToggleFullscreen}
            className="text-muted-foreground"
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </Button>

          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-border" />

          <Button
            variant="ghost"
            size="iconSm"
            aria-label={note.isPinned ? MESSAGES.UNPIN_NOTE : MESSAGES.PIN_NOTE}
            onClick={() => togglePinNote(note.id)}
            className={cn(note.isPinned ? "text-primary" : "text-muted-foreground")}
          >
            <Pin className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            aria-label={note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
            onClick={() => toggleFavoriteNote(note.id)}
            className={cn(note.isFavorite ? "text-warm" : "text-muted-foreground")}
          >
            <Star className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            aria-label={MESSAGES.DUPLICATE_NOTE}
            onClick={() => duplicateNote(note.id)}
            className="text-muted-foreground"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            size="iconSm"
            aria-label={MESSAGES.DELETE_NOTE}
            onClick={() => requestDeleteNote(note.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className={cn("w-full px-6", !isFullWidth && "mx-auto max-w-3xl")}>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Change Note Emoji Icon"
              className="relative z-10 -mt-9 flex h-16 w-16 items-center justify-center rounded-xl text-[56px] leading-none transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden="true">{note.icon || "📝"}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <EmojiPicker
              emojiStyle={EmojiStyle.NATIVE}
              onEmojiClick={(emojiData) => {
                updateNote(note.id, { icon: emojiData.emoji });
              }}
              autoFocusSearch={true}
              width={340}
              height={400}
            />
          </PopoverContent>
        </Popover>

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
          className="mt-2 w-full bg-transparent font-display text-[40px] font-bold leading-[50px] tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40"
        />
        <div
          aria-hidden="true"
          className={cn(
            "waterline w-full transition-opacity duration-500",
            saveStatus === "saving" ? "animate-ripple opacity-100" : "opacity-50",
          )}
        />
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <span>{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>{characterCount} characters</span>
          <span aria-hidden="true">·</span>
          <span>Updated {formattedDate}</span>
          <SaveStatusBadge />
        </div>
      </div>
    </div>
  );
};
