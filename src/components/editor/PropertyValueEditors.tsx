import {
  ArrowRightLeft,
  Bookmark,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  Check,
  CircleDot,
  Clock,
  FileText,
  Flag,
  FolderOpen,
  Hash,
  Heart,
  History,
  LayoutTemplate,
  Link,
  Link2,
  List,
  ListChecks,
  MoreHorizontal,
  Palette,
  Paperclip,
  Pencil,
  Plus,
  Star,
  Tag as TagIcon,
  Target,
  ToggleLeft,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { propertyService } from "../../di/container";
import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
} from "../../domain/property/Property";
import { TAG_COLORS } from "../../domain/tag/Tag";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useViewStore } from "../../store/useViewStore";
import type { Note } from "../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PropertyCalendar } from "../ui/PropertyCalendar";
import { PropertyCheckbox } from "../ui/PropertyCheckbox";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../ui/popover";

export const INPUT_CLASS =
  "w-full rounded-[4px] border border-transparent bg-transparent px-[5px] py-[6px] text-sm outline-none placeholder:text-muted-foreground/70 focus:border-[#1e96eb] focus:shadow-[0_0_0_2px_rgba(30,150,235,0.30)]";

const formatDay = (ts: number): string =>
  new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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

/** Selectable custom icons (PROPERTY_ICON_NAMES in the domain, one component each). */
export const PROPERTY_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  type: Type,
  hash: Hash,
  list: List,
  "list-checks": ListChecks,
  "circle-dot": CircleDot,
  calendar: CalendarDays,
  user: User,
  paperclip: Paperclip,
  toggle: ToggleLeft,
  link: Link,
  link2: Link2,
  tag: TagIcon,
  star: Star,
  flag: Flag,
  bookmark: Bookmark,
  clock: Clock,
  target: Target,
  briefcase: Briefcase,
  book: BookOpen,
  heart: Heart,
};

/** Custom icon when set, the type's default icon otherwise. */
export const resolvePropertyIcon = (def: PropertyDefinition): React.ReactNode => {
  const custom = def.icon != null ? PROPERTY_ICONS[def.icon] : undefined;
  if (custom) return <Icon icon={custom} />;
  if (def.id === "system:doc-mode") return <FolderOpen />;
  if (def.id === "system:page-width") return <ArrowRightLeft />;
  if (def.id === "system:edgeless-theme") return <Palette />;
  if (def.id === "system:template") return <LayoutTemplate />;
  return PROPERTY_TYPE_META[def.type].icon;
};

const Icon: React.FC<{ icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ icon: Svg }) => (
  <Svg />
);

export function toLocalDateString(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const OptionChip: React.FC<{ option: PropertyOption; onRemove?: () => void }> = ({
  option,
  onRemove,
}) => (
  <span className="group/opt inline-flex h-[22px] max-w-40 items-center gap-1 rounded-[10px] border bg-card px-2 text-sm text-foreground">
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

/**
 * Option-picker popover: keyboard Up/Down/Enter navigation with a focused
 * row, Backspace on empty input removes the last selected chip, and a
 * hover-revealed "..." per-option menu (rename / recolor / delete).
 */
const OptionPicker: React.FC<{
  def: PropertyDefinition;
  selectedIds: string[];
  multi: boolean;
  onPick: (optionId: string) => void;
  onCreate: (name: string, color: string) => void;
}> = ({ def, selectedIds, multi, onPick, onCreate }) => {
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const trimmed = query.trim();
  const exactExists = def.options.some((o) => o.name.toLowerCase() === trimmed.toLowerCase());
  const visible = def.options.filter(
    (o) =>
      (!trimmed || o.name.toLowerCase().includes(trimmed.toLowerCase())) &&
      (multi ? !selectedIds.includes(o.id) : true),
  );
  // The Create row participates in keyboard navigation as the last row.
  const showCreate = trimmed.length > 0 && !exactExists;
  const rowCount = visible.length + (showCreate ? 1 : 0);
  const listRef = useRef<HTMLDivElement>(null);

  // Random-start rotating palette index.
  const colorOffset = useRef(Math.floor(Math.random() * TAG_COLORS.length));

  // biome-ignore lint/correctness/useExhaustiveDependencies: trimmed is the intentional reset signal; listing query would re-run on every keystroke anyway
  useEffect(() => {
    setFocusedIndex(0);
  }, [trimmed]);

  const nextCreateColor = () => {
    const color = TAG_COLORS[colorOffset.current % TAG_COLORS.length] as string;
    colorOffset.current += 1;
    return color;
  };

  const activateRow = (index: number) => {
    if (index < visible.length) {
      onPick(visible[index]?.id ?? "");
    } else if (showCreate) {
      onCreate(trimmed, nextCreateColor());
      setQuery("");
    }
  };

  const focusRow = (index: number) => {
    const next = ((index % rowCount) + rowCount) % rowCount;
    setFocusedIndex(next);
    listRef.current
      ?.querySelector(`[data-option-index="${next}"]`)
      ?.scrollIntoView({ block: "nearest" });
  };

  return (
    <PopoverContent align="start" className="w-[400px] max-w-[calc(100vw-2rem)] p-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={MESSAGES.PROP_OPTION_PLACEHOLDER}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            focusRow(focusedIndex + 1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            focusRow(focusedIndex - 1);
          } else if (e.key === "Enter") {
            e.preventDefault();
            activateRow(focusedIndex);
          } else if (e.key === "Backspace" && query === "" && multi && selectedIds.length > 0) {
            e.preventDefault();
            // Remove the last selected chip.
            onPick(selectedIds[selectedIds.length - 1] ?? "");
          }
        }}
        className="mb-2 h-8 w-full rounded-md border bg-background px-2 text-sm outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div ref={listRef} className="max-h-48 space-y-0.5 overflow-y-auto">
        {visible.map((option, index) => (
          <OptionRow
            key={option.id}
            option={option}
            index={index}
            focused={index === focusedIndex}
            selected={selectedIds.includes(option.id)}
            multi={multi}
            onHover={() => setFocusedIndex(index)}
            onPick={() => onPick(option.id)}
            defId={def.id}
          />
        ))}
        {showCreate && (
          <button
            type="button"
            data-option-index={visible.length}
            onMouseEnter={() => setFocusedIndex(visible.length)}
            onClick={() => {
              onCreate(trimmed, nextCreateColor());
              setQuery("");
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              focusedIndex === visible.length && "bg-accent",
            )}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">
              {MESSAGES.PROP_CREATE_OPTION_PREFIX} "{trimmed}"
            </span>
          </button>
        )}
        {rowCount === 0 && (
          <p className="px-2 py-1.5 text-xs text-muted-foreground/70">
            {MESSAGES.PROP_OPTION_EMPTY}
          </p>
        )}
      </div>
      <PopoverClose asChild>
        <button
          type="button"
          className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {MESSAGES.PROP_OPTION_DONE}
        </button>
      </PopoverClose>
    </PopoverContent>
  );
};

const OptionRow: React.FC<{
  option: PropertyOption;
  index: number;
  focused: boolean;
  selected: boolean;
  multi: boolean;
  onHover: () => void;
  onPick: () => void;
  defId: string;
}> = ({ option, index, focused, selected, multi, onHover, onPick, defId }) => {
  const [renaming, setRenaming] = useState(false);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) inputRef.current?.focus();
  }, [renaming]);

  // Option mutations write through PropertyService, which has no reactive
  // layer of its own — bumping the property store is what makes every
  // mounted surface (this picker, the Info chips, filters, sidebar) refetch.
  const commitRename = (name: string) => {
    const next = name.trim();
    if (next && next !== option.name) {
      void propertyService
        .renameOption(defId, option.id, next)
        .then(() => usePropertyStore.getState().refresh())
        .catch(notifyError);
    }
  };

  if (renaming) {
    return (
      <input
        ref={inputRef}
        type="text"
        defaultValue={option.name}
        aria-label={`${MESSAGES.PROP_RENAME}: ${option.name}`}
        onBlur={(e) => {
          if (cancelRef.current) {
            cancelRef.current = false;
            setRenaming(false);
            return;
          }
          setRenaming(false);
          commitRename(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            e.stopPropagation();
            cancelRef.current = true;
            e.currentTarget.blur();
          }
        }}
        className="h-7 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover tracking for visual focus only; the inner button is the interactive element
    // biome-ignore lint/a11y/useKeyWithMouseEvents: keyboard users navigate via ArrowUp/Down on the picker input
    <div
      data-option-index={index}
      className={cn(
        "group/optrow flex items-center rounded px-2 py-1 text-left text-sm transition-colors",
        focused && "bg-accent",
      )}
      onMouseOver={onHover}
    >
      <button type="button" onClick={onPick} className="flex min-w-0 flex-1 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: option.color }}
        />
        <span className="truncate">{option.name}</span>
        {selected && !multi && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${option.name}: ${MESSAGES.PROP_OPTION_MANAGE}`}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/optrow:opacity-100"
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
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={color}
                title={color}
                onClick={(e) => {
                  e.stopPropagation();
                  void propertyService
                    .setOptionColor(defId, option.id, color)
                    .then(() => usePropertyStore.getState().refresh())
                    .catch(notifyError);
                }}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  option.color === color && "ring-2 ring-ring ring-offset-1",
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() =>
              void propertyService
                .deleteOption(defId, option.id)
                .then(async () => {
                  // Saved views + draft rules may filter on the deleted
                  // option; prune them so no view silently goes empty.
                  await useViewStore.getState().syncAfterOptionDelete(defId, option.id);
                  usePropertyStore.getState().refresh();
                })
                .catch(notifyError)
            }
          >
            <Trash2 aria-hidden="true" />
            {MESSAGES.PROP_DELETE}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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

export interface PropertyValueEditorProps {
  def: PropertyDefinition;
  value: PropertyValue | undefined;
  noteId: string;
  onSet: (value: PropertyValue) => void;
  onClear: () => void;
  createOption: (def: PropertyDefinition, name: string, thenPick: boolean, color?: string) => void;
}

/**
 * An auto-growing textarea over a hidden mirror div; multiline, committed on
 * blur with trim. Focus styling lives on the wrapper (focus-within).
 */
const TextLikeValue: React.FC<PropertyValueEditorProps> = ({ def, value, onSet, onClear }) => {
  const current =
    value?.type === "text"
      ? value.text
      : value?.type === "person"
        ? value.name
        : value?.type === "url"
          ? value.url
          : "";
  const [temp, setTemp] = useState(current);
  useEffect(() => setTemp(current), [current]);

  const commit = () => {
    const text = temp.trim();
    if (text === current) return;
    if (!text) return onClear();
    if (def.type === "text") onSet({ type: "text", text });
    else if (def.type === "person") onSet({ type: "person", name: text });
    else onSet({ type: "url", url: text });
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-[4px] border border-transparent focus-within:border-[#1e96eb] focus-within:shadow-[0_0_0_2px_rgba(30,150,235,0.30)]",
        def.type === "url" && current && "text-primary",
      )}
    >
      <div className="invisible [overflow-wrap:anywhere] [white-space:break-spaces] px-[5px] py-[6px] text-sm leading-[22px]">
        {temp}
        {(temp.endsWith("\n") || !temp) && <br />}
      </div>
      <textarea
        value={temp}
        rows={1}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={commit}
        placeholder={MESSAGES.INFO_EMPTY_VALUE}
        className="absolute inset-0 h-full w-full resize-none [overflow-wrap:anywhere] [white-space:break-spaces] border-none bg-transparent px-[5px] py-[6px] text-sm leading-[22px] outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
};

const NumberValue: React.FC<PropertyValueEditorProps> = ({ value, onSet, onClear }) => {
  const current = value?.type === "number" ? String(value.number) : "";
  const [temp, setTemp] = useState(current);
  useEffect(() => setTemp(current), [current]);

  return (
    <input
      type="number"
      inputMode="decimal"
      value={temp}
      onChange={(e) => setTemp(e.target.value)}
      onBlur={() => {
        const raw = temp.trim();
        if (raw === current) return;
        if (!raw) return onClear();
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) onSet({ type: "number", number: parsed });
      }}
      placeholder={MESSAGES.INFO_EMPTY_VALUE}
      className={INPUT_CLASS}
    />
  );
};

const CheckboxValue: React.FC<PropertyValueEditorProps> = ({ def, value, onSet }) => {
  const checked = value?.type === "checkbox" && value.checked;
  return (
    // The label stretches across the whole value cell, so the entire cell
    // toggles through the hidden native input.
    <PropertyCheckbox
      checked={checked}
      onChange={(next) => onSet({ type: "checkbox", checked: next })}
      ariaLabel={def.name}
      className="w-full py-[2px]"
    />
  );
};

const DateValueEditor: React.FC<PropertyValueEditorProps> = ({ value, onSet, onClear }) => {
  const [open, setOpen] = useState(false);
  const timestamp = value?.type === "date" ? value.timestamp : null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="cursor-pointer text-left text-sm text-foreground">
          {timestamp != null ? (
            formatDay(timestamp)
          ) : (
            <span className="text-muted-foreground/70">{MESSAGES.INFO_EMPTY_VALUE}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-auto p-2">
        <PropertyCalendar
          value={timestamp}
          onChange={(ts) => {
            onSet({ type: "date", timestamp: ts });
            setOpen(false);
          }}
        />
        {timestamp != null && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="mb-1 w-full rounded px-2 py-1 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {MESSAGES.PROP_CLEAR}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

const SelectValue: React.FC<PropertyValueEditorProps> = ({
  def,
  value,
  onClear,
  onSet,
  createOption,
}) => {
  const optionId = value?.type === "select" || value?.type === "status" ? value.optionId : null;
  const selected = def.options.find((o) => o.id === optionId);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="flex flex-wrap items-center gap-1.5">
          {selected ? (
            <OptionChip option={selected} onRemove={onClear} />
          ) : (
            <span className="text-muted-foreground/60">{MESSAGES.INFO_EMPTY_VALUE}</span>
          )}
        </button>
      </PopoverTrigger>
      <OptionPicker
        def={def}
        selectedIds={optionId ? [optionId] : []}
        multi={false}
        onPick={(id) => onSet({ type: def.type as "select" | "status", optionId: id })}
        onCreate={(name, color) => void createOption(def, name, true, color)}
      />
    </Popover>
  );
};

const MultiSelectValue: React.FC<PropertyValueEditorProps> = ({
  def,
  value,
  onClear,
  onSet,
  createOption,
}) => {
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
            if (next.length > 0) onSet({ type: "multiSelect", optionIds: next });
            else onClear();
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
          onPick={(id) =>
            onSet({
              type: "multiSelect",
              optionIds: ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id],
            })
          }
          onCreate={(name, color) => void createOption(def, name, true, color)}
        />
      </Popover>
    </div>
  );
};

const FilesValue: React.FC<PropertyValueEditorProps> = ({ value, onClear, onSet }) => {
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
        onChange={(next) => (next.length > 0 ? onSet({ type: "files", entries: next }) : onClear())}
      />
    </Popover>
  );
};

const RelationValue: React.FC<PropertyValueEditorProps> = ({ value, noteId, onClear, onSet }) => {
  const notes = useNoteStore((s) => s.notes);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const ids = value?.type === "relation" ? value.noteIds : [];
  const noteTitle = (id: string): string => {
    const found: Note | undefined = notes.find((n) => n.id === id);
    return found ? found.title || MESSAGES.UNTITLED_NOTE : MESSAGES.UNTITLED_NOTE;
  };
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
          excluded={[noteId, ...ids]}
          onPick={(id) => onSet({ type: "relation", noteIds: [...ids, id] })}
        />
      </Popover>
      {ids.length > 0 && (
        <button
          type="button"
          aria-label={MESSAGES.PROP_CLEAR}
          onClick={onClear}
          className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

/**
 * Declarative per-type value editor registry: every surface (Info panel,
 * doc-list columns, filters) resolves editors from here, not a switch.
 */
export const PROPERTY_VALUE_EDITORS: Record<PropertyType, React.FC<PropertyValueEditorProps>> = {
  text: TextLikeValue,
  number: NumberValue,
  select: SelectValue,
  multiSelect: MultiSelectValue,
  status: SelectValue,
  date: DateValueEditor,
  person: TextLikeValue,
  files: FilesValue,
  checkbox: CheckboxValue,
  url: TextLikeValue,
  relation: RelationValue,
  // System rows own their renderers inside the Info panel; these entries
  // exist only to satisfy the Record and are never reached.
  tags: TextLikeValue,
  workspace: TextLikeValue,
  created: TextLikeValue,
  updated: TextLikeValue,
};
