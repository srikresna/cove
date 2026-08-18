import { useEffect, useState } from "react";
import { noteService } from "../../../../di/container";
import type { DatabaseBacklinkRef } from "../../../../services/blocksuite/IBlockSuiteEditorService";
import {
  hasBacklinkScan,
  scanNoteForDatabaseRows,
  scannedBacklinksOf,
} from "../../../../services/editor/backlinkScan";
import { useNoteStore } from "../../../../store/useNoteStore";

export function useNoteDatabaseBacklinks(noteId: string | null): DatabaseBacklinkRef[] {
  const noteIds = useNoteStore((s) => s.notes.map((n) => n.id).join(","));
  const [backlinks, setBacklinks] = useState<DatabaseBacklinkRef[]>([]);

  useEffect(() => {
    if (!noteId) {
      setBacklinks([]);
      return;
    }
    let cancelled = false;

    const scanAll = async () => {
      const ids = noteIds ? noteIds.split(",") : [];
      for (const id of ids) {
        if (cancelled) return;
        if (hasBacklinkScan(id)) continue;
        await scanNoteForDatabaseRows(
          (nid) => noteService.getNote(nid).then((n) => n?.content),
          id,
        );
      }
      if (!cancelled) setBacklinks(scannedBacklinksOf(noteId));
    };

    setBacklinks(scannedBacklinksOf(noteId));
    void scanAll();
    return () => {
      cancelled = true;
    };
  }, [noteId, noteIds]);

  return backlinks;
}

export default useNoteDatabaseBacklinks;
