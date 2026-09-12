import { useQuery } from "@tanstack/react-query";
import { noteService } from "../di/container";
import type { Note } from "../domain/note/Note";
import { fetchNotes, notesKey, trashKey } from "../store/queryClient";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

export function useNotes(): Note[] {
  const ws = useWorkspaceStore((s) => s.activeWorkspaceId);
  const query = useQuery({
    queryKey: notesKey(ws ?? ""),
    queryFn: () => fetchNotes(ws ?? ""),
    enabled: ws != null,
    placeholderData: (previous) => previous,
  });
  return ws != null ? (query.data ?? []) : [];
}

export function useTrash(): Note[] {
  const query = useQuery({
    queryKey: trashKey,
    queryFn: () => noteService.listTrash(),
    placeholderData: (previous) => previous,
  });
  return query.data ?? [];
}
