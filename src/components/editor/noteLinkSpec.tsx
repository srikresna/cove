import { BlockNoteSchema, defaultInlineContentSpecs } from "@blocknote/core";
import { createReactInlineContentSpec } from "@blocknote/react";
import { FileText } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import type { NoteMeta } from "../../services/INoteService";
import { Logger } from "../../services/Logger";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

// Short TTL: dedupes lookups across the chips of one document without pinning
// a renamed cross-workspace target to its old title for the whole session.
const META_TTL_MS = 30_000;
const metaCache = new Map<string, { meta: NoteMeta | null; at: number }>();

function cachedMeta(noteId: string): NoteMeta | null | undefined {
  const entry = metaCache.get(noteId);
  if (!entry || Date.now() - entry.at > META_TTL_MS) return undefined;
  return entry.meta;
}

const NoteLinkChip: React.FC<{ noteId: string; fallbackTitle: string }> = ({
  noteId,
  fallbackTitle,
}) => {
  const storeNote = useNoteStore((s) => s.notes.find((n) => n.id === noteId));
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [fetched, setFetched] = useState<NoteMeta | null | undefined>(cachedMeta(noteId));

  useEffect(() => {
    if (storeNote || cachedMeta(noteId) !== undefined) return;
    let cancelled = false;
    noteService
      .getLinkTargets([noteId])
      .then((metas) => {
        const meta = metas[0] ?? null;
        metaCache.set(noteId, { meta, at: Date.now() });
        if (!cancelled) setFetched(meta);
      })
      .catch((err) => {
        // No toast: many chips can fail at once (e.g. right after a lock).
        Logger.warn("noteLink: could not resolve link target", err, { noteId });
        if (!cancelled) setFetched(null);
      });
    return () => {
      cancelled = true;
    };
  }, [noteId, storeNote]);

  const meta: NoteMeta | null = storeNote
    ? {
        id: storeNote.id,
        workspaceId: storeNote.workspaceId,
        title: storeNote.title,
        icon: storeNote.icon,
      }
    : (fetched ?? null);

  const missing = !storeNote && fetched === null;
  const title = meta?.title || fallbackTitle || MESSAGES.UNTITLED_NOTE;

  const open = () => {
    if (!meta) return;
    if (meta.workspaceId !== activeWorkspaceId) setActiveWorkspace(meta.workspaceId);
    setActiveNoteId(meta.id);
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={missing}
      contentEditable={false}
      className="inline-flex max-w-64 items-center gap-1 rounded px-1 align-baseline text-primary transition-colors hover:bg-accent disabled:text-muted-foreground disabled:line-through"
    >
      {meta?.icon ? (
        <span aria-hidden="true" className="text-[0.9em] leading-none">
          {meta.icon}
        </span>
      ) : (
        <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      <span className="truncate underline decoration-primary/30 underline-offset-2">
        {missing ? MESSAGES.LINKED_NOTE_MISSING : title}
      </span>
    </button>
  );
};

export const noteLinkInlineSpec = createReactInlineContentSpec(
  {
    type: "noteLink",
    propSchema: {
      noteId: { default: "" },
      title: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => (
      <NoteLinkChip
        noteId={props.inlineContent.props.noteId}
        fallbackTitle={props.inlineContent.props.title}
      />
    ),
  },
);

export const coveSchema = BlockNoteSchema.create({
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    noteLink: noteLinkInlineSpec,
  },
});

export type CoveEditor = typeof coveSchema.BlockNoteEditor;
