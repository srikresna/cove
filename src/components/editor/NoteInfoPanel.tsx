import { Calendar, ChevronDown, FolderOpen, History, Plus, Tag as TagIcon, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { tagService } from "../../di/container";
import type { Tag } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { presentError } from "../../services/errorPresenter";
import { useNoteStore } from "../../store/useNoteStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { formatFullTimestamp, formatRelativeDay } from "../../utils/time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const OPEN_KEY = "cove-info-open";

const TagChip: React.FC<{ tag: Tag; onRemove?: () => void }> = ({ tag, onRemove }) => (
  <span className="group/tag inline-flex h-[22px] max-w-32 items-center gap-1.5 rounded-full border bg-card px-2 text-xs text-foreground">
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: tag.color }}
    />
    <span className="truncate">{tag.name}</span>
    {onRemove && (
      <button
        type="button"
        aria-label={`Remove tag ${tag.name}`}
        onClick={onRemove}
        className="hidden shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground group-hover/tag:block"
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    )}
  </span>
);

const Row: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
  icon,
  label,
  children,
}) => (
  <div className="flex min-h-[30px] flex-wrap gap-1">
    <div className="flex w-[150px] shrink-0 items-center gap-1.5 self-start rounded p-1 text-sm text-muted-foreground">
      <span aria-hidden="true" className="[&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </div>
    <div className="flex min-w-0 flex-1 items-center rounded p-1 text-sm">{children}</div>
  </div>
);

const DateValue: React.FC<{ timestamp: number }> = ({ timestamp }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="cursor-default">{formatRelativeDay(timestamp)}</span>
    </TooltipTrigger>
    <TooltipContent side="top" align="start">
      {formatFullTimestamp(timestamp)}
    </TooltipContent>
  </Tooltip>
);

export const NoteInfoPanel: React.FC<{ note: Note }> = ({ note }) => {
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(OPEN_KEY) === "true");
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState("");
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const updateNote = useNoteStore((s) => s.updateNote);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const pushToast = useNotificationStore((s) => s.pushToast);

  const workspace = workspaces.find((w) => w.id === note.workspaceId);

  const notifyError = useCallback(
    (err: unknown) => {
      const p = presentError(err);
      pushToast({ kind: p.kind, title: p.toastTitle, description: p.toastDescription });
    },
    [pushToast],
  );

  const refreshTags = useCallback(() => {
    tagService.tagsForNote(note.id).then(setTags).catch(notifyError);
  }, [note.id, notifyError]);

  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(OPEN_KEY, String(next));
  };

  const loadAllTags = () => {
    tagService.listTags().then(setAllTags).catch(notifyError);
  };

  const addTag = async (name: string) => {
    try {
      await tagService.addTag(note.id, name);
      setQuery("");
      refreshTags();
      loadAllTags();
    } catch (err) {
      notifyError(err);
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      await tagService.removeTag(note.id, tagId);
      refreshTags();
    } catch (err) {
      notifyError(err);
    }
  };

  const moveToWorkspace = (workspaceId: string) => {
    if (workspaceId === note.workspaceId) return;
    void updateNote(note.id, { workspaceId }).then(() => {
      setActiveWorkspace(workspaceId);
      setActiveNoteId(note.id);
    });
  };

  const trimmed = query.trim();
  const attachedIds = new Set(tags.map((t) => t.id));
  const suggestions = allTags.filter(
    (t) =>
      !attachedIds.has(t.id) && (!trimmed || t.name.toLowerCase().includes(trimmed.toLowerCase())),
  );
  const exactExists = allTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());

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

      {isOpen && (
        <div className="mt-2 space-y-1 pb-2">
          <Row icon={<TagIcon />} label={MESSAGES.INFO_TAGS_LABEL}>
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
                        <span className="truncate">Create "{trimmed}"</span>
                      </button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </Row>

          <Row icon={<FolderOpen />} label={MESSAGES.INFO_WORKSPACE_LABEL}>
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
          </Row>

          <Row icon={<History />} label={MESSAGES.INFO_CREATED_LABEL}>
            <DateValue timestamp={note.createdAt} />
          </Row>

          <Row icon={<Calendar />} label={MESSAGES.INFO_UPDATED_LABEL}>
            <DateValue timestamp={note.updatedAt} />
          </Row>
        </div>
      )}
    </div>
  );
};
