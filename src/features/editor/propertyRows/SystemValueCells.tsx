import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { MESSAGES } from "../../../constants/messages";
import { tagService } from "../../../di/container";
import type { Note } from "../../../domain/note/Note";
import type { Tag } from "../../../domain/tag/Tag";
import { cn } from "../../../lib/utils";
import { noteActions } from "../../../store/noteActions";
import { notifyError } from "../../../store/notify";
import { useTagStore } from "../../../store/useTagStore";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import { formatFullTimestamp, formatRelativeDay } from "../../../utils/time";
import { TagChip } from "./TagChip";

export const DateValue: React.FC<{ timestamp: number }> = ({ timestamp }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="cursor-default">{formatRelativeDay(timestamp)}</span>
    </TooltipTrigger>
    <TooltipContent side="top" align="end">
      {formatFullTimestamp(timestamp)}
    </TooltipContent>
  </Tooltip>
);

export const TagsValue: React.FC<{ noteId: string; workspaceId: string }> = ({
  noteId,
  workspaceId,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState("");
  const tagVersion = useTagStore((s) => s.version);

  const refreshTags = useCallback(
    (version: number) => {
      tagService
        .tagsForNote(noteId)
        .then((next) => {
          if (useTagStore.getState().version === version) setTags(next);
        })
        .catch(notifyError);
    },
    [noteId],
  );

  useEffect(() => {
    refreshTags(tagVersion);
  }, [refreshTags, tagVersion]);

  const loadAllTags = () => {
    tagService.listTags(workspaceId).then(setAllTags).catch(notifyError);
  };

  const addTag = async (name: string) => {
    try {
      await tagService.addTag(noteId, name);
      setQuery("");
      refreshTags(tagVersion);
      loadAllTags();
    } catch (err) {
      notifyError(err);
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      await tagService.removeTag(noteId, tagId);
      refreshTags(tagVersion);
    } catch (err) {
      notifyError(err);
    }
  };

  const trimmed = query.trim();
  const attachedIds = new Set(tags.map((t) => t.id));
  const suggestions = allTags.filter(
    (t) =>
      !attachedIds.has(t.id) && (!trimmed || t.name.toLowerCase().includes(trimmed.toLowerCase())),
  );
  const exactExists = allTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <TagChip key={tag.id} tag={tag} onRemove={() => removeTag(tag.id)} />
      ))}
      <Popover
        onOpenChange={(open) => {
          if (open) loadAllTags();
          else setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={MESSAGES.INFO_ADD_TAG_PLACEHOLDER}
            className={cn(
              "inline-flex h-[22px] items-center gap-1 rounded-full px-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              tags.length === 0 && "px-1",
            )}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            {tags.length === 0 && <span>{MESSAGES.INFO_EMPTY_VALUE}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={MESSAGES.INFO_ADD_TAG_PLACEHOLDER}
            onKeyDown={(e) => {
              if (e.key === "Enter" && trimmed) void addTag(trimmed);
            }}
            className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => void addTag(tag.name)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="truncate">{tag.name}</span>
              </button>
            ))}
            {trimmed && !exactExists && (
              <button
                type="button"
                onClick={() => void addTag(trimmed)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="truncate">
                  {MESSAGES.INFO_CREATE_TAG_PREFIX} "{trimmed}"
                </span>
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const WorkspaceValue: React.FC<{ note: Note }> = ({ note }) => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const moveNoteToWorkspace = noteActions.moveNoteToWorkspace;
  const workspace = workspaces.find((w) => w.id === note.workspaceId);

  const moveToWorkspace = (workspaceId: string) => {
    if (workspaceId === note.workspaceId) return;
    void moveNoteToWorkspace(note.id, workspaceId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded px-1 py-0.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">{workspace?.emoji}</span>
          <span className="truncate">{workspace?.name ?? MESSAGES.INFO_EMPTY_VALUE}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {workspaces.map((ws) => (
          <DropdownMenuItem key={ws.id} onSelect={() => moveToWorkspace(ws.id)}>
            <span aria-hidden="true">{ws.emoji}</span>
            <span className="truncate">{ws.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
