import type { Note } from "./Note";

export const DEFAULT_NOTE_TITLE = "Untitled Note";
export const DEFAULT_NOTE_ICON = "📝";
export const DEFAULT_NOTE_COVER_COLOR = "#ff6f1e";
export const EMPTY_NOTE_CONTENT = '[{"type":"paragraph","content":[]}]';

export const makeNoteId = (): string => crypto.randomUUID();

export const duplicateNoteProps = (note: Pick<Note, "title" | "content" | "icon">) => ({
  title: `${note.title} (Copy)`,
  content: note.content,
  icon: note.icon,
});

export const canDeleteLastWorkspace = (count: number): boolean => count > 1;
