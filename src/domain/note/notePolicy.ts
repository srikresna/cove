import {
  DEFAULT_COVER_COLOR,
  DEFAULT_NOTE_CONTENT,
  DEFAULT_NOTE_ICON,
  DEFAULT_NOTE_TITLE,
} from "../../constants/app";
import type { Note } from "./Note";

export {
  DEFAULT_NOTE_TITLE,
  DEFAULT_NOTE_ICON,
  DEFAULT_COVER_COLOR as DEFAULT_NOTE_COVER_COLOR,
  DEFAULT_NOTE_CONTENT as EMPTY_NOTE_CONTENT,
};

export const makeNoteId = (): string => crypto.randomUUID();

export const duplicateNoteProps = (note: Pick<Note, "title" | "content" | "icon">) => ({
  title: `${note.title} (Copy)`,
  content: note.content,
  icon: note.icon,
});

export const canDeleteLastWorkspace = (count: number): boolean => count > 1;
