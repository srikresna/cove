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
  Check,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { propertyService, tagService } from "../../di/container";
import type {
  PropertyDefinition,
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
import {
  INPUT_CLASS,
  PROPERTY_ICONS,
  PROPERTY_TYPE_META,
  PROPERTY_VALUE_EDITORS,
  resolvePropertyIcon,
  toLocalDateString,
} from "./PropertyValueEditors";

export { PROPERTY_TYPE_META };

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
          className={cn(INPUT_CLASS, "max-w-40")}
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
  onIcon: (def: PropertyDefinition, icon: string | null) => void;
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
  onIcon,
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
        icon={resolvePropertyIcon(def)}
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
              {!isSystem && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{MESSAGES.PROP_ICON_LABEL}</DropdownMenuLabel>
                  <div className="grid grid-cols-7 gap-0.5 px-1 pb-1">
                    <button
                      type="button"
                      aria-label={MESSAGES.PROP_ICON_DEFAULT}
                      title={MESSAGES.PROP_ICON_DEFAULT}
                      onClick={(e) => {
                        e.stopPropagation();
                        onIcon(def, null);
                      }}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        def.icon == null && "bg-accent text-foreground",
                      )}
                    >
                      {PROPERTY_TYPE_META[def.type].icon}
                    </button>
                    {Object.entries(PROPERTY_ICONS).map(([name, Icon]) => (
                      <button
                        key={name}
                        type="button"
                        aria-label={name}
                        title={name}
                        onClick={(e) => {
                          e.stopPropagation();
                          onIcon(def, name);
                        }}
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-3.5 [&_svg]:w-3.5",
                          def.icon === name && "bg-accent text-foreground",
                        )}
                      >
                        <Icon />
                      </button>
                    ))}
                  </div>
                </>
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

  const handleIcon = (def: PropertyDefinition, icon: string | null) => {
    propertyService
      .setDefinitionIcon(def.id, icon)
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
    }
    const Editor = PROPERTY_VALUE_EDITORS[def.type];
    if (!Editor) return null;
    return (
      <Editor
        def={def}
        value={value}
        noteId={note.id}
        onSet={(next) => save(def.id, next)}
        onClear={() => clear(def.id)}
        createOption={createOption}
      />
    );
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
          onIcon={handleIcon}
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
                    {resolvePropertyIcon(def)}
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
