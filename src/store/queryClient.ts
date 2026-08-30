import { QueryClient } from "@tanstack/react-query";
import { blockSuiteEditorService, noteService, vaultService } from "../di/container";
import type { Note } from "../domain/note/Note";

/** The notes-list cache key — per workspace. */
export const notesKey = (workspaceId: string) => ["notes", workspaceId] as const;
export const trashKey = ["trash"] as const;

/**
 * Fetches a workspace's note list and mirrors it into the editor's doc
 * registry (the doc-registry side effect kept at the cache boundary).
 */
export async function fetchNotes(workspaceId: string): Promise<Note[]> {
  const notes = await noteService.listMetadataByWorkspace(workspaceId);
  blockSuiteEditorService.registerExistingNotes(notes.map((n) => ({ id: n.id, title: n.title })));
  return notes;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Local DB: data only changes through this app's own mutations, so
      // refetching happens on explicit invalidation, not on staleness timers.
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      gcTime: 5 * 60_000,
    },
  },
});

// Vault lock wipes the caches; the unlock remount refetches through the
// vault gate.
vaultService.onLock(() => {
  void queryClient.cancelQueries();
  queryClient.clear();
});
