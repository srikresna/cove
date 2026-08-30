import { useQuery } from "@tanstack/react-query";
import { noteService } from "../di/container";
import type { Note } from "../domain/note/Note";
import { fetchNotes, notesKey, queryClient, trashKey } from "../store/queryClient";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

/** The active workspace's note list, served from the query cache. */
export function useNotes(): Note[] {
  const ws = useWorkspaceStore((s) => s.activeWorkspaceId);
  const query = useQuery({
    queryKey: notesKey(ws ?? ""),
    queryFn: () => fetchNotes(ws ?? ""),
    enabled: ws != null,
    // A workspace switch keeps the previous list on screen until the new one
    // lands (the old store swapped in one render; this is no worse).
    placeholderData: (previous) => previous,
  });
  return ws != null ? (query.data ?? []) : [];
}

/** All trashed notes across workspaces (the Trash page). */
export function useTrash(): Note[] {
  const query = useQuery({
    queryKey: trashKey,
    queryFn: () => noteService.listTrash(),
    placeholderData: (previous) => previous,
  });
  return query.data ?? [];
}

/** Imperative trash read for non-React code. */
export const currentTrash = (): Note[] => queryClient.getQueryData(trashKey) ?? [];
