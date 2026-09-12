import { MoreHorizontal, Pencil, Tag, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MESSAGES } from "../../constants/messages";
import { TAG_COLORS } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { useTagStore } from "../../store/useTagStore";
import { useUIStore } from "../../store/useUIStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { CollapsibleSection } from "./CollapsibleSection";

const TagRow: React.FC<{
  tagId: string;
  name: string;
  color: string;
  noteCount: number;
  isActive: boolean;
  onSelect: () => void;
}> = ({ tagId, name, color, noteCount, isActive, onSelect }) => {
  const renameTag = useTagStore((s) => s.renameTag);
  const setTagColor = useTagStore((s) => s.setTagColor);
  const deleteTag = useTagStore((s) => s.deleteTag);
  const [renaming, setRenaming] = useState(false);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  if (renaming) {
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={name}
        aria-label={`${MESSAGES.PROP_RENAME}: ${name}`}
        onBlur={(e) => {
          if (cancelRef.current) {
            cancelRef.current = false;
            setRenaming(false);
            return;
          }
          const next = e.target.value.trim();
          setRenaming(false);
          if (next && next !== name) void renameTag(tagId, next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            e.stopPropagation();
            cancelRef.current = true;
            e.currentTarget.blur();
          }
        }}
        className="h-7 w-full rounded-md border border-border bg-background px-2 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  return (
    <div className="group/tagrow flex items-center">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            aria-pressed={isActive}
            onClick={onSelect}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-transparent font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
            )}
            style={
              isActive
                ? {
                    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                  }
                : undefined
            }
          >
            <Tag className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden="true" />
            <span className="truncate leading-4">{name}</span>
            <span className="ml-auto shrink-0 text-[11px] leading-4 text-muted-foreground/70">
              {noteCount}
            </span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setRenaming(true)}>
            <Pencil aria-hidden="true" />
            {MESSAGES.PROP_RENAME}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>{MESSAGES.PROP_ICON_LABEL}</ContextMenuLabel>
          <div className="grid grid-cols-5 gap-0.5 px-1 pb-1">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                title={c}
                onClick={(e) => {
                  e.stopPropagation();
                  void setTagColor(tagId, c);
                }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  color === c && "ring-2 ring-ring ring-offset-1",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() => void deleteTag(tagId)}
          >
            <Trash2 aria-hidden="true" />
            {MESSAGES.TAG_DELETE}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${name}: ${MESSAGES.TAGS_HEADER}`}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/tagrow:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setRenaming(true)}>
            <Pencil aria-hidden="true" />
            {MESSAGES.PROP_RENAME}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{MESSAGES.PROP_ICON_LABEL}</DropdownMenuLabel>
          <div className="grid grid-cols-5 gap-0.5 px-1 pb-1">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                title={c}
                onClick={(e) => {
                  e.stopPropagation();
                  void setTagColor(tagId, c);
                }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  color === c && "ring-2 ring-ring ring-offset-1",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() => void deleteTag(tagId)}
          >
            <Trash2 aria-hidden="true" />
            {MESSAGES.TAG_DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const TagsSection: React.FC = () => {
  const tags = useTagStore((s) => s.tags);
  const tagCounts = useTagStore((s) => s.tagCounts);
  const tagVersion = useTagStore((s) => s.version);
  const activeTagId = useTagStore((s) => s.activeTagId);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const setTagFilter = useTagStore((s) => s.setTagFilter);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tagVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    if (activeWorkspaceId) void fetchTags(activeWorkspaceId);
  }, [fetchTags, activeWorkspaceId, tagVersion]);

  if (tags.length === 0) return null;

  const countOf = (tagId: string): number =>
    tagCounts.find((c) => c.tagId === tagId)?.noteCount ?? 0;

  return (
    <CollapsibleSection
      storageKey="cove-tags-open"
      label={MESSAGES.TAGS_HEADER}
      count={tags.length}
    >
      <div className="space-y-0.5">
        {tags.map((tag) => (
          <TagRow
            key={tag.id}
            tagId={tag.id}
            name={tag.name}
            color={tag.color}
            noteCount={countOf(tag.id)}
            isActive={tag.id === activeTagId}
            onSelect={() => {
              const next = tag.id === activeTagId ? null : tag.id;
              void setTagFilter(next);
              if (next !== null) {
                useUIStore.getState().setActivePage("library");
              }
            }}
          />
        ))}
      </div>
    </CollapsibleSection>
  );
};
