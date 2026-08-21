import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import { Image as ImageIcon, Smile, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { COVER_COLORS, DEFAULT_COVER_COLOR } from "../../constants/app";
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

interface IconPickerContentProps {
  onPick: (emoji: string) => void;
  onRemove?: () => void;
}

export const IconPickerContent: React.FC<IconPickerContentProps> = ({ onPick, onRemove }) => (
  <PopoverContent align="start" className="w-auto overflow-hidden p-0">
    <EmojiPicker
      emojiStyle={EmojiStyle.NATIVE}
      onEmojiClick={(emojiData) => onPick(emojiData.emoji)}
      autoFocusSearch={true}
      width={340}
      height={400}
    />
    {onRemove && (
      <div className="border-t p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={onRemove}
        >
          {MESSAGES.ICON_REMOVE}
        </Button>
      </div>
    )}
  </PopoverContent>
);

export const EditorHeader: React.FC<EditorHeaderProps> = ({ note, isFullWidth }) => {
  const uploadCoverImage = useNoteStore((s) => s.uploadCoverImage);
  const removeCoverImage = useNoteStore((s) => s.removeCoverImage);
  const coverImage = useNoteStore((s) => s.activeCoverImage);
  const saveStatus = useSaveStatusStore((s) => s.status);

  return (
    <NoteHeaderBody
      note={note}
      coverImage={coverImage}
      isFullWidth={isFullWidth}
      saveStatus={saveStatus}
      uploadCoverImage={uploadCoverImage}
      removeCoverImage={removeCoverImage}
    />
  );
};

export const NoteHeaderBody: React.FC<{
  note: Note;
  coverImage: string | null;
  isFullWidth: boolean;
  saveStatus?: string;
  uploadCoverImage: (id: string, file: File) => Promise<void>;
  removeCoverImage: (id: string) => Promise<void>;
  /** Forwarded to the Info panel so the peek origin backlink starts open. */
  backlinkDefaultOpenRef?: { databaseId: string; databaseRowId: string } | null;
}> = ({
  note,
  coverImage,
  isFullWidth,
  saveStatus,
  uploadCoverImage,
  removeCoverImage,
  backlinkDefaultOpenRef = null,
}) => {
  const updateNote = useNoteStore((s) => s.updateNote);

  const [title, setTitle] = useState(note.title);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingTitleRef = useRef<string | null>(null);
  const commitTitleRef = useRef<() => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    pendingTitleRef.current = newTitle;

    if (titleTimer.current) {
      clearTimeout(titleTimer.current);
    }

    titleTimer.current = setTimeout(() => {
      titleTimer.current = null;
      pendingTitleRef.current = null;
      updateNote(note.id, { title: newTitle });
    }, 300);
  };

  commitTitleRef.current = () => {
    if (titleTimer.current) {
      clearTimeout(titleTimer.current);
      titleTimer.current = null;
    }
    const pending = pendingTitleRef.current;
    if (pending !== null) {
      pendingTitleRef.current = null;
      void updateNote(note.id, { title: pending });
    }
  };

  useEffect(() => {
    return () => {
      commitTitleRef.current?.();
    };
  }, []);

  const hasIcon = Boolean(note.icon);
  const hasCover = Boolean(coverImage || note.coverColor);
  const accent = note.coverColor || DEFAULT_COVER_COLOR;

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) {
      uploadCoverImage(note.id, file);
    }
  };

  const handleRemoveCover = () => {
    if (coverImage) {
      removeCoverImage(note.id);
    }
    if (note.coverColor) {
      updateNote(note.id, { coverColor: "" });
    }
  };

  return (
    <div className="group/header mb-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        hidden
        style={{ display: "none" }}
        aria-label={MESSAGES.COVER_UPLOAD}
        onChange={handleCoverFile}
      />

      {hasCover && (
        <div className="group/cover relative h-56 w-full">
          {coverImage ? (
            <img src={coverImage} alt="" draggable={false} className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(160deg, ${accent}4d 0%, ${accent}14 60%, transparent 100%)`,
              }}
            />
          )}
          <div className="absolute right-3 top-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover/cover:opacity-100">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label={MESSAGES.COVER_CHANGE}
                  className="bg-card/90 backdrop-blur"
                >
                  {MESSAGES.COVER_CHANGE}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-60 p-2">
                <p className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {MESSAGES.COVER_COLOR_LABEL}
                </p>
                <div className="flex gap-2 px-1 pb-2">
                  {COVER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Select cover accent color ${color}`}
                      onClick={() => updateNote(note.id, { coverColor: color })}
                      className={cn(
                        "h-6 w-6 rounded-full border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        !coverImage &&
                          note.coverColor === color &&
                          "ring-2 ring-ring ring-offset-1",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="mb-1 h-px bg-border" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {MESSAGES.COVER_UPLOAD}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleRemoveCover}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {MESSAGES.COVER_REMOVE}
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      <div
        className={cn("w-full px-12", !isFullWidth && "mx-auto max-w-3xl", !hasCover && "pt-10")}
      >
        {hasIcon && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Change Note Emoji Icon"
                className={cn(
                  "relative z-10 flex h-16 w-16 items-center justify-center rounded-xl text-[56px] leading-none transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  hasCover ? "-mt-9" : "mt-2",
                )}
              >
                <span aria-hidden="true">{note.icon}</span>
              </button>
            </PopoverTrigger>
            <IconPickerContent
              onPick={(emoji) => updateNote(note.id, { icon: emoji })}
              onRemove={() => updateNote(note.id, { icon: "" })}
            />
          </Popover>
        )}

        <div
          className={cn(
            "flex items-center gap-1 pt-2",
            !hasIcon && !hasCover
              ? "opacity-0 transition-opacity focus-within:opacity-100 group-hover/header:opacity-100"
              : "",
          )}
        >
          {!hasIcon && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 px-2 text-muted-foreground"
                >
                  <Smile className="h-3.5 w-3.5" aria-hidden="true" />
                  {MESSAGES.ICON_ADD}
                </Button>
              </PopoverTrigger>
              <IconPickerContent onPick={(emoji) => updateNote(note.id, { icon: emoji })} />
            </Popover>
          )}
          {!hasCover && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-muted-foreground"
              onClick={() => updateNote(note.id, { coverColor: DEFAULT_COVER_COLOR })}
            >
              <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.COVER_ADD}
            </Button>
          )}
        </div>

        <label htmlFor="note-title-input" className="sr-only">
          Note Title
        </label>
        <input
          id="note-title-input"
          type="text"
          value={title}
          onChange={handleTitleChange}
          onBlur={() => commitTitleRef.current?.()}
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

        <NoteInfoPanel note={note} defaultOpenBacklinkRef={backlinkDefaultOpenRef} />
      </div>
    </div>
  );
};
