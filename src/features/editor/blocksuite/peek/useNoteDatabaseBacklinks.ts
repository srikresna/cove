import { useQueries } from "@tanstack/react-query";
import { noteService } from "../../../../di/container";
import { useNotes } from "../../../../hooks/useNotes";
import type { DatabaseBacklinkRef } from "../../../../services/blocksuite/IBlockSuiteEditorService";
import { scanNoteRows } from "../../../../services/editor/backlinkScan";
import { backlinkScanKey } from "../../../../store/queryClient";

export function useNoteDatabaseBacklinks(noteId: string | null): DatabaseBacklinkRef[] {
  const notes = useNotes();
  const scans = useQueries({
    queries: notes.map((note) => ({
      queryKey: backlinkScanKey(note.id),
      queryFn: () =>
        scanNoteRows((nid) => noteService.getNote(nid).then((n) => n?.content), note.id),
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    })),
  });

  const backlinks: DatabaseBacklinkRef[] = [];
  if (!noteId) return backlinks;
  const seen = new Set<string>();
  for (let i = 0; i < notes.length; i += 1) {
    const rows = scans[i]?.data;
    if (!rows) continue;
    const sourceId = notes[i]?.id;
    if (!sourceId) continue;
    for (const row of rows) {
      if (row.refDocId !== noteId) continue;
      const key = `${row.databaseId}:${row.databaseRowId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      backlinks.push({
        databaseDocId: sourceId,
        databaseId: row.databaseId,
        databaseRowId: row.databaseRowId,
      });
    }
  }
  return backlinks;
}

export default useNoteDatabaseBacklinks;
