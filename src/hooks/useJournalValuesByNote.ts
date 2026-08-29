import { useEffect, useState } from "react";
import { journalService } from "../di/container";
import { usePropertyStore } from "../store/usePropertyStore";

/**
 * Bulk journal-date map (noteId -> local-midnight timestamp), refetched on
 * property-store refreshes.
 */
export const useJournalValuesByNote = (): Map<string, number> => {
  const [map, setMap] = useState<Map<string, number>>(new Map());
  const propertyVersion = usePropertyStore((s) => s.version);

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    let alive = true;
    journalService
      .journalValuesByNote()
      .then((values) => {
        if (!alive) return;
        const next = new Map<string, number>();
        for (const [noteId, value] of values) {
          if (value.type === "date") next.set(noteId, value.timestamp);
        }
        setMap(next);
      })
      .catch(() => {
        if (alive) setMap(new Map());
      });
    return () => {
      alive = false;
    };
  }, [propertyVersion]);

  return map;
};
