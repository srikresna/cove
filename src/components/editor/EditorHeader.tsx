import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
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
import { NoteInfoPanel } from "./NoteInfoPanel";

interface EditorHeaderProps {
  note: Note;
  isFullWidth: boolean;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ note, isFullWidth }) => {
  const { updateNote } = useNoteStore();
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

  const accent = note.coverColor || "#0e7c66";

  return (
    <div className="mb-2">
      <div
        className="group relative h-36 w-full"
        style={{
          background: `linear-gradient(160deg, ${accent}4d 0%, ${accent}14 60%, transparent 100%)`,
        }}
      >
        <div className="absolute right-3 top-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label={MESSAGES.CHANGE_ACCENT}
                className="bg-card/90 backdrop-blur"
              >
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

        <NoteInfoPanel note={note} />
      </div>
    </div>
  );
};
