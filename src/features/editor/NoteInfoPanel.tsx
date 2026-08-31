import { ChevronDown, Link2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { propertyService, tagService } from "../../di/container";
import type { Note } from "../../domain/note/Note";
import { summarizePropertyValue } from "../../domain/property/format";
import type { Tag } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { DatabaseBacklinkSection } from "./blocksuite/peek/PeekDatabaseBacklink";
import { useNoteDatabaseBacklinks } from "./blocksuite/peek/useNoteDatabaseBacklinks";
import { NotePropertiesRows, TagChip } from "./NotePropertiesRows";

const OPEN_KEY = "cove-info-open";

export const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: React.ReactNode;
  handle?: React.ReactNode;
  /** Editors that carry their own 5/6px padding (text/number) sit flush. */
  flush?: boolean;
  /** Radio/segmented rows don't highlight on hover. */
  noHover?: boolean;
  children: React.ReactNode;
}> = ({ icon, label, handle, flush = false, noHover = false, children }) => (
  <div className="flex min-h-[30px] flex-wrap gap-1">
    <div className="flex h-[30px] w-[160px] shrink-0 items-center gap-1.5 self-start rounded p-1 text-sm leading-[22px] text-muted-foreground">
      {handle}
      <span aria-hidden="true" className="[&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start self-start rounded text-sm leading-[22px]",
        !flush && "p-1",
        !noHover && "hover:bg-accent/50 focus-within:bg-accent/50",
      )}
    >
      {children}
    </div>
  </div>
);

export const NoteInfoPanel: React.FC<{
  note: Note;
  /** In the peek view, the row the doc was opened from starts expanded. */
  defaultOpenBacklinkRef?: { databaseId: string; databaseRowId: string } | null;
}> = ({ note, defaultOpenBacklinkRef = null }) => {
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(OPEN_KEY) === "true");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsHidden, setTagsHidden] = useState(false);
  const [propertySummaries, setPropertySummaries] = useState<
    Array<{ id: string; name: string; text: string }>
  >([]);
  const backlinks = useNoteDatabaseBacklinks(note.id);
  const tagVersion = useTagStore((s) => s.version);
  const propertyVersion = usePropertyStore((s) => s.version);

  const refreshTags = useCallback(
    (version: number) => {
      tagService
        .tagsForNote(note.id)
        .then((next) => {
          if (useTagStore.getState().version === version) setTags(next);
        })
        .catch(notifyError);
    },
    [note.id],
  );

  useEffect(() => {
    refreshTags(tagVersion);
  }, [refreshTags, tagVersion]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(OPEN_KEY, String(next));
  };

  // Collapsed state shows a one-line summary instead of nothing.
  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    if (isOpen) return;
    let alive = true;
    Promise.all([propertyService.listDefinitions(), propertyService.valuesForNote(note.id)])
      .then(([defs, vals]) => {
        if (!alive) return;
        setTagsHidden(defs.find((d) => d.id === "system:tags")?.show === "always-hide");
        const rows: Array<{ id: string; name: string; text: string }> = [];
        const defById = new Map(defs.map((d) => [d.id, d]));
        const visible = (id: string) => defById.get(id)?.show !== "always-hide";
        // Note-field-backed rows (no note_properties value) summarize from the note.
        const derived: Array<[string, string | undefined]> = [
          ["system:doc-mode", note.docMode === "edgeless" ? "Edgeless" : "Page"],
          ["system:page-width", note.pageWidth === "fullWidth" ? "Full width" : "Standard"],
          [
            "system:edgeless-theme",
            note.edgelessTheme === "light" || note.edgelessTheme === "dark"
              ? note.edgelessTheme === "light"
                ? "Light"
                : "Dark"
              : undefined,
          ],
          ["system:template", note.isTemplate ? "Template" : undefined],
        ];
        for (const [id, text] of derived) {
          const def = defById.get(id);
          if (!def || !text || !visible(id)) continue;
          rows.push({ id, name: def.name, text });
        }
        for (const def of defs) {
          if (def.show === "always-hide") continue;
          const value = vals.get(def.id);
          if (!value) continue;
          const text = summarizePropertyValue(def, value);
          if (text) rows.push({ id: def.id, name: def.name, text });
        }
        setPropertySummaries(rows);
      })
      .catch(() => {
        if (alive) setPropertySummaries([]);
      });
    return () => {
      alive = false;
    };
  }, [isOpen, note.id, propertyVersion]);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className="flex h-[30px] w-full items-center justify-between rounded p-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{MESSAGES.INFO_TITLE}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform duration-200", !isOpen && "-rotate-90")}
        />
      </button>
      <div className="h-px w-full bg-border" aria-hidden="true" />

      {!isOpen &&
        ((!tagsHidden && tags.length > 0) ||
          propertySummaries.length > 0 ||
          backlinks.length > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-1 pb-2">
            {!tagsHidden && tags.map((tag) => <TagChip key={tag.id} tag={tag} />)}
            {propertySummaries.slice(0, 8).map((row) => (
              <span
                key={row.id}
                className="inline-flex h-[22px] max-w-56 items-center gap-1 truncate rounded-full border bg-card px-2 text-xs text-foreground"
              >
                <span className="shrink-0 text-muted-foreground">{row.name}</span>
                <span className="truncate">{row.text}</span>
              </span>
            ))}
            {propertySummaries.length > 8 && (
              <span className="text-xs text-muted-foreground">+{propertySummaries.length - 8}</span>
            )}
            {backlinks.length > 0 && (
              <span className="inline-flex h-[22px] items-center gap-1 rounded-full border bg-card px-2 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" aria-hidden="true" />
                {MESSAGES.INFO_BACKLINKS_COUNT.replace("{n}", String(backlinks.length))}
              </span>
            )}
          </div>
        )}

      {/* Stays mounted while collapsed (hidden via CSS) so expand/collapse
          choices inside the rows and backlink sections survive Info toggles. */}
      <div className={cn("mt-2 space-y-2 pb-2", !isOpen && "hidden")}>
        <NotePropertiesRows note={note} />
        {backlinks.length > 0 && (
          <div className="mt-2 space-y-1 border-t pt-1">
            {backlinks.map((ref) => (
              <DatabaseBacklinkSection
                key={`${ref.databaseId}:${ref.databaseRowId}`}
                {...ref}
                defaultOpen={
                  defaultOpenBacklinkRef !== null &&
                  defaultOpenBacklinkRef.databaseId === ref.databaseId &&
                  defaultOpenBacklinkRef.databaseRowId === ref.databaseRowId
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
