import type { Note } from "./Note";

export const DEFAULT_NOTE_TITLE = "Untitled Note";
// A non-empty placeholder so a brand-new note mounts (App gates on content !== "").
// It is NOT a BlockSuite envelope, so engine.openNoteDoc seeds a fresh empty
// BlockSuite doc from it on first open; the first real save persists the envelope.
export const DEFAULT_NOTE_CONTENT = '[{"type":"paragraph","content":[]}]';
export { DEFAULT_NOTE_CONTENT as EMPTY_NOTE_CONTENT };

export const makeNoteId = (): string => crypto.randomUUID();

export const duplicateNoteProps = (note: Pick<Note, "title" | "content" | "icon">) => ({
  title: `${note.title} (Copy)`,
  content: note.content,
  icon: note.icon,
});

export const canDeleteLastWorkspace = (count: number): boolean => count > 1;

export const TRASH_RETENTION_DAYS = 30;

export const trashPurgeCutoff = (now: number): number =>
  now - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
