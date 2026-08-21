import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
  Calendar,
  CalendarDays,
  Check,
  CircleDot,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  GripVertical,
  Hash,
  History,
  Link,
  Link2,
  List,
  ListChecks,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Tag as TagIcon,
  ToggleLeft,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { propertyService, tagService } from "../../di/container";
import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
  PropertyVisibility,
} from "../../domain/property/Property";
import {
  CREATABLE_PROPERTY_TYPES,
  hasOptions,
  isSystemPropertyId,
  JOURNAL_PROPERTY_ID,
  PROPERTY_VISIBILITY,
} from "../../domain/property/Property";
import type { Tag } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import type { Note } from "../../types";
import { formatFullTimestamp, formatRelativeDay } from "../../utils/time";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { InfoRow } from "./NoteInfoPanel";

export const PROPERTY_TYPE_META: Record<PropertyType, { label: string; icon: React.ReactNode }> = {
  text: { label: "Text", icon: <Type /> },
  number: { label: "Number", icon: <Hash /> },
  select: { label: "Select", icon: <List /> },
  multiSelect: { label: "Multi-select", icon: <ListChecks /> },
  status: { label: "Status", icon: <CircleDot /> },
  date: { label: "Date", icon: <CalendarDays /> },
  person: { label: "Person", icon: <User /> },
  files: { label: "Files & media", icon: <Paperclip /> },
  checkbox: { label: "Checkbox", icon: <ToggleLeft /> },
  url: { label: "URL", icon: <Link /> },
  relation: { label: "Relation", icon: <Link2 /> },
  tags: { label: "Tags", icon: <TagIcon /> },
  workspace: { label: "Workspace", icon: <FolderOpen /> },
  created: { label: "Created", icon: <History /> },
  updated: { label: "Updated", icon: <Calendar /> },
};

const inputClass =
  "h-7 w-full max-w-56 rounded-md border border-transparent bg-transparent px-1 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring";

function toLocalDateString(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const OptionChip: React.FC<{ option: PropertyOption; onRemove?: () => void }> = ({
  option,
  onRemove,
}) => (
  <span className="group/opt inline-flex h-[22px] max-w-40 items-center gap-1.5 rounded-full border bg-card px-2 text-xs text-foreground">
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: option.color }}
    />
    <span className="truncate">{option.name}</span>
    {onRemove && (
      <button
        type="button"
        aria-label={`Remove ${option.name}`}
        onClick={onRemove}
        className="shrink-0 rounded-full p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/opt:opacity-100"
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    )}
  </span>
);

const OptionPicker: React.FC<{
  def: PropertyDefinition;
  selectedIds: string[];
  multi: boolean;
  onPick: (optionId: string) => void;
  onCreate: (name: string) => void;
}> = ({ def, selectedIds, multi, onPick, onCreate }) => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const visible = def.options.filter(
    (o) =>
      (!trimmed || o.name.toLowerCase().includes(trimmed.toLowerCase())) &&
      (multi ? !selectedIds.includes(o.id) : true),
  );
  const exactExists = def.options.some((o) => o.name.toLowerCase() === trimmed.toLowerCase());
  return (
    <PopoverContent align="start" className="w-60 p-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={MESSAGES.PROP_OPTION_PLACEHOLDER}
        onKeyDown={(e) => {
          if (e.key === "Enter" && trimmed && !exactExists) {
            onCreate(trimmed);
            setQuery("");
          }
        }}
        className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {visible.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onPick(option.id)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: option.color }}
            />
            <span className="truncate">{option.name}</span>
            {!multi && selectedIds.includes(option.id) && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </button>
        ))}
        {trimmed && !exactExists && (
          <button
            type="button"
            onClick={() => {
              onCreate(trimmed);
              setQuery("");
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">
              {MESSAGES.PROP_CREATE_OPTION_PREFIX} "{trimmed}"
            </span>
          </button>
        )}
      </div>
    </PopoverContent>
  );
};

const ListEditor: React.FC<{
  entries: string[];
  placeholder: string;
  renderEntry?: (entry: string) => React.ReactNode;
  onChange: (entries: string[]) => void;
}> = ({ entries, placeholder, renderEntry, onChange }) => {
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();
  return (
    <PopoverContent align="start" className="w-64 p-2">
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && trimmed) {
            onChange([...entries, trimmed]);
            setDraft("");
          }
        }}
        className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {entries.map((entry, index) => (
          <div
            key={`${entry}-${
              // biome-ignore lint/suspicious/noArrayIndexKey: duplicate entries are legal in this list
              index
            }`}
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm"
          >
            <span className="truncate">{renderEntry ? renderEntry(entry) : entry}</span>
            <button
              type="button"
              aria-label={`Remove ${entry}`}
              onClick={() => onChange(entries.filter((_, i) => i !== index))}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </PopoverContent>
  );
};

const VISIBILITY_LABEL: Record<PropertyVisibility, string> = {
  "always-show": MESSAGES.PROP_VIS_ALWAYS_SHOW,
  "hide-when-empty": MESSAGES.PROP_VIS_HIDE_WHEN_EMPTY,
  "always-hide": MESSAGES.PROP_VIS_ALWAYS_HIDE,
};

export const TagChip: React.FC<{ tag: Tag; onRemove?: () => void }> = ({ tag, onRemove }) => (
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
        className="shrink-0 rounded-full p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/tag:opacity-100"
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    )}
  </span>
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

/**
 * Journal row editor (AFFiNE pattern): a checkbox marks the note as a journal
 * note for the picked day; unchecking clears it. Checking without an existing
 * date defaults to today.
 */
const JournalValue: React.FC<{
  value: { timestamp: number } | undefined;
  onSet: (timestamp: number) => void;
  onClear: () => void;
}> = ({ value, onSet, onClear }) => {
  const todayTimestamp = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value !== undefined}
        aria-label={MESSAGES.JOURNAL_TOGGLE}
        onChange={(e) =>
          e.target.checked ? onSet(value?.timestamp ?? todayTimestamp()) : onClear()
        }
        className="h-4 w-4 accent-[hsl(var(--primary))]"
      />
      {value !== undefined && (
        <input
          type="date"
          value={toLocalDateString(value.timestamp)}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) return;
            const [y, m, d] = raw.split("-").map(Number);
            if (y && m && d) onSet(new Date(y, m - 1, d).getTime());
          }}
          className={cn(inputClass, "max-w-40")}
        />
      )}
    </div>
  );
};

/** System row: tags chips + create/pick popover, backed by the tag service. */
const TagsValue: React.FC<{ noteId: string }> = ({ noteId }) => {
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
    tagService.listTags().then(setAllTags).catch(notifyError);
  };

  const addTag = async (name: string) => {
    try {
      await tagService.addTag(noteId, name);
      setQuery("");
      refreshTags(tagVersion);
      loadAllTags();
      void useTagStore.getState().refresh();
    } catch (err) {
      notifyError(err);
    }
  };

  const removeTag = async (tagId: string) => {
    try {
      await tagService.removeTag(noteId, tagId);
      refreshTags(tagVersion);
      void useTagStore.getState().refresh();
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
const WorkspaceValue: React.FC<{ note: Note }> = ({ note }) => {
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const moveNoteToWorkspace = useNoteStore((s) => s.moveNoteToWorkspace);
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

/** Compact value rendering used by the collapsed Info summary chips. */
export const summarizePropertyValue = (
  def: PropertyDefinition,
  value: PropertyValue,
): string | null => {
  switch (value.type) {
    case "text":
      return value.text || null;
    case "number":
      return String(value.number);
    case "select":
    case "status":
      return def.options.find((o) => o.id === value.optionId)?.name ?? null;
    case "multiSelect": {
      const names = def.options.filter((o) => value.optionIds.includes(o.id)).map((o) => o.name);
      return names.length > 0 ? names.join(", ") : null;
    }
    case "date":
      return formatRelativeDay(value.timestamp);
    case "person":
      return value.name || null;
    case "files": {
      const first = value.entries[0];
      if (!first) return null;
      return value.entries.length === 1 ? first : `${first} +${value.entries.length - 1}`;
    }
    case "checkbox":
      return value.checked ? "✓" : null;
    case "url":
      if (!value.url) return null;
      try {
        return new URL(value.url).hostname;
      } catch {
        return value.url;
      }
    case "relation":
      return value.noteIds.length > 0 ? `${value.noteIds.length} linked` : null;
    default:
      return null;
  }
};

interface PropertyRowProps {
  def: PropertyDefinition;
  renaming: boolean;
  onStartRename: (id: string) => void;
  onCommitRename: (def: PropertyDefinition, name: string) => void;
  onCancelRename: () => void;
  onVisibility: (def: PropertyDefinition, show: PropertyVisibility) => void;
  onDelete: (def: PropertyDefinition) => void;
  onReorder: (id: string, targetId: string, position: "before" | "after") => void;
  children: React.ReactNode;
}

const PropertyRow: React.FC<PropertyRowProps> = ({
  def,
  renaming,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onVisibility,
  onDelete,
  onReorder,
  children,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const cancelRenameRef = useRef(false);
  // Radix returns focus to the menu trigger when the dropdown closes; when the
  // close was caused by picking "Rename", that would steal focus from the
  // rename input (after its exit animation) and blur-cancel it immediately.
  const suppressTriggerFocusRef = useRef(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;
    return draggable({
      element,
      dragHandle: handleRef.current ?? undefined,
      getInitialData: () => ({ propertyId: def.id, from: "note-info" }),
    });
  }, [def.id]);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;
    return dropTargetForElements({
      element,
      // The edge must live on the drop-target data: attachClosestEdge returns
      // a fresh object and never writes into self.data, so without getData
      // the edge computed for the indicator would be lost by drop time.
      getData: (args) =>
        attachClosestEdge(
          {},
          {
            input: args.input,
            element: args.element,
            allowedEdges: ["top", "bottom"],
          },
        ),
      canDrop: ({ source }) =>
        source.data.from === "note-info" &&
        typeof source.data.propertyId === "string" &&
        source.data.propertyId !== def.id,
      getIsSticky: () => true,
      onDragEnter: (event) => setClosestEdge(extractClosestEdge(event.self.data)),
      onDrag: (event) => setClosestEdge(extractClosestEdge(event.self.data)),
      onDragLeave: () => setClosestEdge(null),
      onDrop: ({ source, self }) => {
        setClosestEdge(null);
        const propertyId = source.data.propertyId;
        const edge = extractClosestEdge(self.data);
        if (
          typeof propertyId === "string" &&
          propertyId !== def.id &&
          (edge === "top" || edge === "bottom")
        ) {
          onReorder(propertyId, def.id, edge === "bottom" ? "after" : "before");
        }
      },
    });
  }, [def.id, onReorder]);

  const isSystem = isSystemPropertyId(def.id);

  const label = renaming ? (
    <input
      ref={renameInputRef}
      type="text"
      defaultValue={def.name}
      placeholder={MESSAGES.PROP_RENAME_PLACEHOLDER}
      onBlur={(e) => {
        if (cancelRenameRef.current) {
          cancelRenameRef.current = false;
          onCancelRename();
          return;
        }
        const name = e.target.value.trim();
        if (!name || name === def.name) onCancelRename();
        else onCommitRename(def, name);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          e.stopPropagation();
          cancelRenameRef.current = true;
          e.currentTarget.blur();
        }
      }}
      className="h-6 w-full rounded border border-border bg-background px-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  ) : (
    def.name
  );

  return (
    <div ref={rowRef} className="group/prop relative">
      {closestEdge === "top" && (
        <div
          aria-hidden="true"
          className="absolute -top-1 left-0 right-0 z-10 h-0.5 rounded-full bg-primary"
        />
      )}
      {closestEdge === "bottom" && (
        <div
          aria-hidden="true"
          className="absolute -bottom-1 left-0 right-0 z-10 h-0.5 rounded-full bg-primary"
        />
      )}
      <InfoRow
        handle={
          <button
            type="button"
            ref={handleRef}
            aria-label={MESSAGES.PROP_DRAG_LABEL}
            title={MESSAGES.PROP_DRAG_LABEL}
            className="flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-hover/prop:opacity-100"
          >
            <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        }
        icon={PROPERTY_TYPE_META[def.type].icon}
        label={label}
      >
        <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
          <div className="min-w-0 flex-1">{children}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`${def.name}: ${MESSAGES.PROP_VISIBILITY_LABEL}`}
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/prop:opacity-100"
              >
                <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48"
              onCloseAutoFocus={(e) => {
                if (suppressTriggerFocusRef.current) {
                  suppressTriggerFocusRef.current = false;
                  e.preventDefault();
                }
              }}
            >
              {!isSystem && (
                <DropdownMenuItem
                  onSelect={() => {
                    suppressTriggerFocusRef.current = true;
                    onStartRename(def.id);
                  }}
                >
                  <Pencil aria-hidden="true" />
                  {MESSAGES.PROP_RENAME}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{MESSAGES.PROP_VISIBILITY_LABEL}</DropdownMenuLabel>
              {(isSystem && def.id !== JOURNAL_PROPERTY_ID
                ? (["always-show", "always-hide"] as const)
                : PROPERTY_VISIBILITY
              ).map((visibility) => (
                <DropdownMenuItem key={visibility} onSelect={() => onVisibility(def, visibility)}>
                  <span className="flex h-4 w-4 items-center justify-center">
                    {def.show === visibility ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : null}
                  </span>
                  {VISIBILITY_LABEL[visibility]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {!isSystem && (
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onSelect={() => onDelete(def)}
                >
                  <Trash2 aria-hidden="true" />
                  {MESSAGES.PROP_DELETE}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </InfoRow>
    </div>
  );
};

export const NotePropertiesRows: React.FC<{ note: Note }> = ({ note }) => {
  const [definitions, setDefinitions] = useState<PropertyDefinition[]>([]);
  const [values, setValues] = useState<Map<string, PropertyValue>>(new Map());
  const [deletingDef, setDeletingDef] = useState<PropertyDefinition | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  // A freshly created property stays visible on this note until it gains a
  // value, so the user always has a row through which to set one.
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const notes = useNoteStore((s) => s.notes);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const propertyVersion = usePropertyStore((s) => s.version);
  const bumpProperties = usePropertyStore((s) => s.refresh);

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  const reload = useCallback(() => {
    Promise.all([propertyService.listDefinitions(), propertyService.valuesForNote(note.id)])
      .then(([defs, vals]) => {
        setDefinitions(defs);
        setValues(vals);
      })
      .catch(notifyError);
  }, [note.id, propertyVersion]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = (propertyId: string, value: PropertyValue) => {
    setValues((prev) => new Map(prev).set(propertyId, value));
    return propertyService
      .setValue(note.id, propertyId, value)
      .then(() => bumpProperties())
      .catch((err) => {
        notifyError(err);
        reload();
      });
  };

  const clear = (propertyId: string) => {
    setValues((prev) => {
      const next = new Map(prev);
      next.delete(propertyId);
      return next;
    });
    propertyService
      .removeValue(note.id, propertyId)
      .then(() => bumpProperties())
      .catch((err) => {
        notifyError(err);
        reload();
      });
  };

  const createDefinition = (type: PropertyType) => {
    const name = newName.trim() || PROPERTY_TYPE_META[type].label;
    setNewName("");
    propertyService
      .createDefinition(name, type)
      .then((def) => {
        setJustCreatedId(def.id);
        bumpProperties();
      })
      .catch(notifyError);
  };

  const createOption = (def: PropertyDefinition, name: string, thenPick: boolean) => {
    propertyService
      .addOption(def.id, name)
      .then(async (option) => {
        if (!thenPick) return bumpProperties();
        const current = values.get(def.id);
        if (def.type === "multiSelect") {
          const ids = current?.type === "multiSelect" ? current.optionIds : [];
          await save(def.id, { type: "multiSelect", optionIds: [...ids, option.id] });
        } else {
          await save(def.id, { type: def.type as "select" | "status", optionId: option.id });
        }
        bumpProperties();
      })
      .catch(notifyError);
  };

  const noteTitle = (id: string): string => {
    const found = notes.find((n) => n.id === id);
    return found ? found.title || MESSAGES.UNTITLED_NOTE : MESSAGES.UNTITLED_NOTE;
  };

  const handleReorder = useCallback(
    (id: string, targetId: string, position: "before" | "after") => {
      setDefinitions((prev) => {
        const from = prev.findIndex((d) => d.id === id);
        const to = prev.findIndex((d) => d.id === targetId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        if (!moved) return prev;
        const insertAt =
          position === "before" ? (from < to ? to - 1 : to) : from < to ? to : to + 1;
        next.splice(insertAt, 0, moved);
        return next;
      });
      propertyService
        .reorderDefinition(id, targetId, position)
        .then(() => bumpProperties())
        .catch((err) => {
          notifyError(err);
          reload();
        });
    },
    [bumpProperties, reload],
  );

  const commitRename = (def: PropertyDefinition, name: string) => {
    setRenamingId(null);
    if (name === def.name) return;
    propertyService
      .renameDefinition(def.id, name)
      .then(() => bumpProperties())
      .catch((err) => {
        notifyError(err);
        reload();
      });
  };

  const handleVisibility = (def: PropertyDefinition, show: PropertyVisibility) => {
    propertyService
      .setDefinitionVisibility(def.id, show)
      .then(() => bumpProperties())
      .catch((err) => {
        notifyError(err);
        reload();
      });
  };

  useEffect(() => {
    if (justCreatedId && values.has(justCreatedId)) setJustCreatedId(null);
  }, [values, justCreatedId]);

  const isVisible = (def: PropertyDefinition): boolean =>
    def.id === justCreatedId ||
    (def.show !== "always-hide" && (def.show !== "hide-when-empty" || values.has(def.id)));

  const visibleDefinitions = definitions.filter(isVisible);
  const hiddenDefinitions = definitions.filter((def) => !isVisible(def));

  const renderValue = (def: PropertyDefinition) => {
    const value = values.get(def.id);
    if (def.id === JOURNAL_PROPERTY_ID) {
      return (
        <JournalValue
          value={value?.type === "date" ? value : undefined}
          onSet={(timestamp) => save(def.id, { type: "date", timestamp })}
          onClear={() => clear(def.id)}
        />
      );
    }
    switch (def.type) {
      case "tags":
        return <TagsValue noteId={note.id} />;
      case "workspace":
        return <WorkspaceValue note={note} />;
      case "created":
        return <DateValue timestamp={note.createdAt} />;
      case "updated":
        return <DateValue timestamp={note.updatedAt} />;
      case "text":
      case "person":
      case "url": {
        const current =
          value?.type === "text"
            ? value.text
            : value?.type === "person"
              ? value.name
              : value?.type === "url"
                ? value.url
                : "";
        return (
          <input
            key={`${note.id}-${def.id}-${current}`}
            type="text"
            defaultValue={current}
            placeholder={MESSAGES.INFO_EMPTY_VALUE}
            onBlur={(e) => {
              const text = e.target.value.trim();
              if (text === current) return;
              if (!text) return clear(def.id);
              if (def.type === "text") save(def.id, { type: "text", text });
              else if (def.type === "person") save(def.id, { type: "person", name: text });
              else save(def.id, { type: "url", url: text });
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className={cn(inputClass, def.type === "url" && current && "text-primary underline")}
          />
        );
      }
      case "number": {
        const current = value?.type === "number" ? String(value.number) : "";
        return (
          <input
            key={`${note.id}-${def.id}-${current}`}
            type="number"
            defaultValue={current}
            placeholder={MESSAGES.INFO_EMPTY_VALUE}
            onBlur={(e) => {
              const raw = e.target.value.trim();
              if (raw === current) return;
              if (!raw) return clear(def.id);
              const parsed = Number(raw);
              if (Number.isFinite(parsed)) save(def.id, { type: "number", number: parsed });
            }}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className={inputClass}
          />
        );
      }
      case "checkbox": {
        const checked = value?.type === "checkbox" && value.checked;
        return (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => save(def.id, { type: "checkbox", checked: e.target.checked })}
            aria-label={def.name}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
        );
      }
      case "date": {
        const current = value?.type === "date" ? toLocalDateString(value.timestamp) : "";
        return (
          <input
            key={`${note.id}-${def.id}-${current}`}
            type="date"
            defaultValue={current}
            onChange={(e) => {
              const raw = e.target.value;
              if (!raw) return clear(def.id);
              const [y, m, d] = raw.split("-").map(Number);
              if (y && m && d) {
                save(def.id, { type: "date", timestamp: new Date(y, m - 1, d).getTime() });
              }
            }}
            className={cn(inputClass, "max-w-40")}
          />
        );
      }
      case "select":
      case "status": {
        const optionId =
          value?.type === "select" || value?.type === "status" ? value.optionId : null;
        const selected = def.options.find((o) => o.id === optionId);
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="flex flex-wrap items-center gap-1.5">
                {selected ? (
                  <OptionChip option={selected} onRemove={() => clear(def.id)} />
                ) : (
                  <span className="text-muted-foreground/60">{MESSAGES.INFO_EMPTY_VALUE}</span>
                )}
              </button>
            </PopoverTrigger>
            <OptionPicker
              def={def}
              selectedIds={optionId ? [optionId] : []}
              multi={false}
              onPick={(id) => save(def.id, { type: def.type as "select" | "status", optionId: id })}
              onCreate={(name) => createOption(def, name, true)}
            />
          </Popover>
        );
      }
      case "multiSelect": {
        const ids = value?.type === "multiSelect" ? value.optionIds : [];
        const selected = def.options.filter((o) => ids.includes(o.id));
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {selected.map((option) => (
              <OptionChip
                key={option.id}
                option={option}
                onRemove={() => {
                  const next = ids.filter((id) => id !== option.id);
                  next.length > 0
                    ? save(def.id, { type: "multiSelect", optionIds: next })
                    : clear(def.id);
                }}
              />
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={MESSAGES.PROP_OPTION_PLACEHOLDER}
                  className="inline-flex h-[22px] items-center gap-1 rounded-full px-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  {selected.length === 0 && <span>{MESSAGES.INFO_EMPTY_VALUE}</span>}
                </button>
              </PopoverTrigger>
              <OptionPicker
                def={def}
                selectedIds={ids}
                multi
                onPick={(id) => save(def.id, { type: "multiSelect", optionIds: [...ids, id] })}
                onCreate={(name) => createOption(def, name, true)}
              />
            </Popover>
          </div>
        );
      }
      case "files": {
        const entries = value?.type === "files" ? value.entries : [];
        return (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded px-1 py-0.5 text-left transition-colors hover:bg-accent"
              >
                {entries.length === 0 ? (
                  <span className="text-muted-foreground/60">{MESSAGES.INFO_EMPTY_VALUE}</span>
                ) : (
                  <span className="truncate">
                    {entries[0]}
                    {entries.length > 1 && (
                      <span className="text-muted-foreground"> +{entries.length - 1}</span>
                    )}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <ListEditor
              entries={entries}
              placeholder={MESSAGES.PROP_FILES_PLACEHOLDER}
              onChange={(next) =>
                next.length > 0 ? save(def.id, { type: "files", entries: next }) : clear(def.id)
              }
            />
          </Popover>
        );
      }
      case "relation": {
        const ids = value?.type === "relation" ? value.noteIds : [];
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {ids.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveNoteId(id)}
                className="inline-flex h-[22px] max-w-40 items-center gap-1 rounded-full border bg-card px-2 text-xs text-foreground transition-colors hover:bg-accent"
              >
                <FileText className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{noteTitle(id)}</span>
              </button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={MESSAGES.PROP_RELATION_PLACEHOLDER}
                  className="inline-flex h-[22px] items-center gap-1 rounded-full px-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  {ids.length === 0 && <span>{MESSAGES.INFO_EMPTY_VALUE}</span>}
                </button>
              </PopoverTrigger>
              <RelationPicker
                excluded={[note.id, ...ids]}
                onPick={(id) => save(def.id, { type: "relation", noteIds: [...ids, id] })}
              />
            </Popover>
            {ids.length > 0 && (
              <button
                type="button"
                aria-label={MESSAGES.PROP_CLEAR}
                onClick={() => clear(def.id)}
                className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
        );
      }
    }
  };

  return (
    <>
      {visibleDefinitions.map((def) => (
        <PropertyRow
          key={def.id}
          def={def}
          renaming={renamingId === def.id}
          onStartRename={setRenamingId}
          onCommitRename={commitRename}
          onCancelRename={() => setRenamingId(null)}
          onVisibility={handleVisibility}
          onDelete={setDeletingDef}
          onReorder={handleReorder}
        >
          {renderValue(def)}
        </PropertyRow>
      ))}

      {hiddenDefinitions.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-[26px] w-full items-center gap-1.5 rounded p-1 text-xs text-muted-foreground/80 transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.PROP_HIDDEN_COUNT.replace("{n}", String(hiddenDefinitions.length))}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-2">
            <div className="max-h-56 space-y-0.5 overflow-y-auto">
              {hiddenDefinitions.map((def) => (
                <div
                  key={def.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground [&_svg]:h-4 [&_svg]:w-4"
                  >
                    {PROPERTY_TYPE_META[def.type].icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{def.name}</span>
                  <button
                    type="button"
                    aria-label={MESSAGES.PROP_VIS_ALWAYS_SHOW}
                    title={MESSAGES.PROP_VIS_ALWAYS_SHOW}
                    onClick={() => handleVisibility(def, "always-show")}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {!isSystemPropertyId(def.id) && (
                    <button
                      type="button"
                      aria-label={MESSAGES.PROP_DELETE}
                      title={MESSAGES.PROP_DELETE}
                      onClick={() => setDeletingDef(def)}
                      className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <Popover onOpenChange={(open) => !open && setNewName("")}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-[30px] w-full items-center gap-1.5 rounded p-1 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {MESSAGES.PROP_ADD}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={MESSAGES.PROP_NAME_PLACEHOLDER}
            className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="grid max-h-56 grid-cols-1 gap-0.5 overflow-y-auto">
            {CREATABLE_PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => createDefinition(type)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-muted-foreground"
              >
                {PROPERTY_TYPE_META[type].icon}
                <span>{PROPERTY_TYPE_META[type].label}</span>
                {hasOptions(type) && (
                  <span className="ml-auto text-[10px] uppercase text-muted-foreground">
                    {MESSAGES.PROP_OPTIONS_BADGE}
                  </span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        open={deletingDef !== null}
        title={MESSAGES.PROP_DELETE_CONFIRM_TITLE}
        description={`"${deletingDef?.name ?? ""}" — ${MESSAGES.PROP_DELETE_CONFIRM_DESC}`}
        confirmLabel={MESSAGES.PROP_DELETE}
        danger
        onConfirm={() => {
          if (deletingDef) {
            propertyService
              .deleteDefinition(deletingDef.id)
              .then(() => bumpProperties())
              .catch(notifyError);
          }
          setDeletingDef(null);
        }}
        onCancel={() => setDeletingDef(null)}
      />
    </>
  );
};

const RelationPicker: React.FC<{
  excluded: string[];
  onPick: (noteId: string) => void;
}> = ({ excluded, onPick }) => {
  const notes = useNoteStore((s) => s.notes);
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const candidates = notes
    .filter((n) => !excluded.includes(n.id))
    .filter((n) => !trimmed || (n.title || MESSAGES.UNTITLED_NOTE).toLowerCase().includes(trimmed))
    .slice(0, 12);
  return (
    <PopoverContent align="start" className="w-64 p-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={MESSAGES.PROP_RELATION_PLACEHOLDER}
        className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {candidates.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onPick(n.id)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden="true" className="shrink-0 text-sm">
              {n.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
            </span>
            <span className="truncate">{n.title || MESSAGES.UNTITLED_NOTE}</span>
          </button>
        ))}
      </div>
    </PopoverContent>
  );
};
