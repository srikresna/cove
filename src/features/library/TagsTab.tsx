import { MoreHorizontal, Pencil, Tag as TagIcon, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { PromptDialog } from "../../components/ui/prompt-dialog";
import { MESSAGES } from "../../constants/messages";
import { TAG_COLORS } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { useTagStore } from "../../store/useTagStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";

/**
 * The Tags directory: every workspace tag with rename/recolor/delete
 * management; clicking a tag filters the Docs list. Rows share the
 * Collections tab anatomy (h-11, quiet hover, sans meta) so the sibling
 * tabs read as one surface.
 */
export const TagsTab: React.FC<{ onOpenTag: (tagId: string) => void }> = ({ onOpenTag }) => {
  const tags = useTagStore((s) => s.tags);
  const tagCounts = useTagStore((s) => s.tagCounts);
  const renameTag = useTagStore((s) => s.renameTag);
  const setTagColor = useTagStore((s) => s.setTagColor);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const tagVersion = useTagStore((s) => s.version);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tagVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    if (activeWorkspaceId) void fetchTags(activeWorkspaceId);
  }, [fetchTags, activeWorkspaceId, tagVersion]);

  const countOf = (tagId: string): number =>
    tagCounts.find((c) => c.tagId === tagId)?.noteCount ?? 0;
  const deleteTarget = tags.find((t) => t.id === deleting) ?? null;
  const renameTarget = tags.find((t) => t.id === renaming) ?? null;

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pt-6">
      <h2 className="pb-4 text-lg font-semibold text-foreground">{MESSAGES.LIBRARY_TAGS_TITLE}</h2>

      {tags.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <TagIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-medium text-foreground">{MESSAGES.LIBRARY_TAGS_EMPTY}</p>
          <p className="max-w-64 text-[13px] text-muted-foreground">
            {MESSAGES.LIBRARY_TAGS_EMPTY_HINT}
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {tags.map((tag) => (
            <div key={tag.id} className="group/tag flex items-center">
              <button
                type="button"
                onClick={() => onOpenTag(tag.id)}
                className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-md border border-transparent px-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                </span>
                <span className="truncate text-[13px] font-medium text-foreground">{tag.name}</span>
                <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                  {countOf(tag.id)} {countOf(tag.id) === 1 ? "note" : "notes"}
                </span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${tag.name}: ${MESSAGES.TAGS_HEADER}`}
                    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/tag:opacity-100 data-[state=open]:opacity-100"
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => setRenaming(tag.id)}>
                    <Pencil aria-hidden="true" />
                    {MESSAGES.PROP_RENAME}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{MESSAGES.PROP_ICON_LABEL}</DropdownMenuLabel>
                  <div className="grid grid-cols-5 gap-0.5 px-1 pb-1">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={color}
                        title={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          void setTagColor(tag.id, color);
                        }}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          tag.color === color && "ring-2 ring-ring ring-offset-1",
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onSelect={() => setDeleting(tag.id)}
                  >
                    <Trash2 aria-hidden="true" />
                    {MESSAGES.TAG_DELETE}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <PromptDialog
        open={renaming !== null}
        title={MESSAGES.PROP_RENAME}
        label={renameTarget?.name ?? ""}
        placeholder={renameTarget?.name ?? ""}
        confirmLabel={MESSAGES.PROP_RENAME}
        onConfirm={async (value) => {
          const next = value.trim();
          if (renaming && next && next !== renameTarget?.name) await renameTag(renaming, next);
          setRenaming(null);
        }}
        onCancel={() => setRenaming(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title={MESSAGES.TAG_DELETE}
        description={`"${deleteTarget?.name ?? ""}" will be removed from every note.`}
        confirmLabel={MESSAGES.TAG_DELETE}
        danger
        onConfirm={() => {
          if (deleting && activeWorkspaceId) void deleteTag(deleting);
          setDeleting(null);
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
};
