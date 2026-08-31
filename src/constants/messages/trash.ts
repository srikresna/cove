import { TRASH_RETENTION_DAYS } from "../../domain/note/notePolicy";

export const TrashMessages = {
  TRASH_TITLE: "Trash",
  TRASH_SEARCH_PLACEHOLDER: "Search deleted notes…",
  TRASH_NO_RESULTS: "No deleted notes match your search.",
  TRASH_EMPTY: "Trash is empty.",
  TRASH_RESTORE: "Restore",
  TRASH_DELETE_FOREVER: "Delete forever",
  TRASH_RETENTION_NOTE: `Notes in Trash are deleted forever after ${TRASH_RETENTION_DAYS} days.`,
  TRASH_MOVED_TOAST: "Moved to Trash",
  TRASH_MOVED_DESC: "Restore it anytime from Trash.",
  TRASH_DELETED_PREFIX: "Deleted ",
  DELETE_NOTE_CONFIRM_TITLE: "Delete this note forever?",
  DELETE_NOTE_CONFIRM_DESC: "It will be permanently deleted. This cannot be undone.",
  DELETE_NOTE_CONFIRM_BUTTON: "Delete forever",
} as const;
