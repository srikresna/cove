import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { TAG_COLORS } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { useTagStore } from "../../store/useTagStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

/**
 * The Tags directory (AFFI NE /tag equivalent): every workspace tag with
 * rename/recolor/delete management; clicking a tag filters the Docs list.
 */
export const TagsTab: React.FC<{ onOpenTag: (tagId: string) => void }> = ({ onOpenTag }) => {
  const tags = useTagStore((s) => s.tags);
  const tagCounts = useTagStore((s) => s.tagCounts);
  const renameTag = useTagStore((s) => s.renameTag);
  const setTagColor = useTagStore((s) => s.setTagColor);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef(false);

  useEffect(() => {
    if (renamingId) inputRef.current?.focus();
  }, [renamingId]);

  const countOf = (tagId: string): number =>
    tagCounts.find((c) => c.tagId === tagId)?.noteCount ?? 0;
  const deleteTarget = tags.find((t) => t.id === deleting) ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-8 pt-8">
      <h2 className="pb-4 text-lg font-semibold text-foreground">{MESSAGES.LIBRARY_TAGS_TITLE}</h2>

      {tags.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {MESSAGES.LIBRARY_TAGS_EMPTY}
        </p>
      ) : (
        <div className="space-y-0.5">
          {tags.map((tag) =>
            renamingId === tag.id ? (
              <input
                key={tag.id}
                ref={inputRef}
                type="text"
                defaultValue={tag.name}
                aria-label={`${MESSAGES.PROP_RENAME}: ${tag.name}`}
                onBlur={(e) => {
                  if (cancelRef.current) {
                    cancelRef.current = false;
                    setRenamingId(null);
                    return;
                  }
                  const next = e.target.value.trim();
                  setRenamingId(null);
                  if (next && next !== tag.name) void renameTag(tag.id, next);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") {
                    e.stopPropagation();
                    cancelRef.current = true;
                    e.currentTarget.blur();
                  }
                }}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            ) : (
              <div key={tag.id} className="group/tag flex items-center">
                <button
                  type="button"
                  onClick={() => onOpenTag(tag.id)}
                  className="flex h-[54px] min-w-0 flex-1 items-center gap-3 rounded-md px-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  </span>
                  <span className="truncate text-sm font-semibold text-foreground">{tag.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground/70">
                    {countOf(tag.id)}
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
                    <DropdownMenuItem onSelect={() => setRenamingId(tag.id)}>
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
            ),
          )}
        </div>
      )}

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
