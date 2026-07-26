import { DEFAULT_NOTE_CONTENT, DEFAULT_NOTE_TITLE } from "../../constants/app";
import type { Note } from "./Note";

export { DEFAULT_NOTE_TITLE, DEFAULT_NOTE_CONTENT as EMPTY_NOTE_CONTENT };

export const makeNoteId = (): string => crypto.randomUUID();

// AAD namespace for cover payloads — must differ from note-content AAD (the
// bare note id) so a cover ciphertext can never be replayed as note content.
export const coverAad = (noteId: string): string => `cover:${noteId}`;

export const duplicateNoteProps = (note: Pick<Note, "title" | "content" | "icon">) => ({
  title: `${note.title} (Copy)`,
  content: note.content,
  icon: note.icon,
});

export const canDeleteLastWorkspace = (count: number): boolean => count > 1;
