import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { PropertyCalendar } from "../../../components/ui/PropertyCalendar";
import { PropertyCheckbox } from "../../../components/ui/PropertyCheckbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../components/ui/tooltip";
import { MESSAGES } from "../../../constants/messages";
import { journalService, tagService } from "../../../di/container";
import type { Note } from "../../../domain/note/Note";
import type { Tag } from "../../../domain/tag/Tag";
import { cn } from "../../../lib/utils";
import { noteActions } from "../../../store/noteActions";
import { notifyError } from "../../../store/notify";
import { usePropertyStore } from "../../../store/usePropertyStore";
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

/**
 * Journal row editor: a 24px checkbox marks the note as a journal note; when
 * checked, the localized date opens the calendar popover, and a red conflict
 * pill appears when another note shares the date.
 */
export const JournalValue: React.FC<{
  noteId: string;
  value: { timestamp: number } | undefined;
  onSet: (timestamp: number) => void;
  onClear: () => void;
}> = ({ noteId, value, onSet, onClear }) => {
  const [open, setOpen] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  const propertyVersion = usePropertyStore((s) => s.version);
  const todayTimestamp = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  };
  const onSetOrClear = () => (value === undefined ? onSet(todayTimestamp()) : onClear());

  const sameDay = (a: number, b: number) => {
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    if (value === undefined) {
      setConflictCount(0);
      return;
    }
    let alive = true;
    journalService
      .journalValuesByNote()
      .then((values) => {
        if (!alive) return;
        let count = 0;
        for (const [nid, v] of values) {
          if (nid === noteId) continue;
          if (v.type === "date" && sameDay(v.timestamp, value.timestamp)) count += 1;
        }
        setConflictCount(count);
      })
      .catch(() => {
        if (alive) setConflictCount(0);
      });
    return () => {
      alive = false;
    };
  }, [noteId, value, propertyVersion]);

  return (
    // The hidden input inside PropertyCheckbox covers the whole cell, so
    // clicking anywhere toggles; the date trigger and the conflict pill are
    // buttons that naturally stop the label activation.
    <PropertyCheckbox
      checked={value !== undefined}
      onChange={() => onSetOrClear()}
      ariaLabel={MESSAGES.JOURNAL_TOGGLE}
      className="flex h-full min-h-[24px] w-full items-center gap-0.5"
    >
      {value !== undefined && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded px-1 text-sm leading-[22px] text-foreground transition-colors hover:bg-accent/60"
            >
              {new Date(value.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={10} className="w-auto p-2">
            <PropertyCalendar
              value={value.timestamp}
              onChange={(ts) => {
                onSet(ts);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      )}
      {conflictCount > 0 && (
        <button
          type="button"
          title={MESSAGES.JOURNAL_CONFLICT_HINT.replace("{n}", String(conflictCount))}
          className="ml-1 rounded border border-destructive/40 bg-destructive/10 px-2 text-sm text-destructive"
        >
          {MESSAGES.JOURNAL_CONFLICT}
        </button>
      )}
    </PropertyCheckbox>
  );
};

/** System row: tags chips + create/pick popover, backed by the tag service. */
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

/** System row: workspace picker, derived from the note's workspaceId. */
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
