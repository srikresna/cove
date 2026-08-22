import {
  Bookmark,
  BookOpen,
  Briefcase,
  Calendar,
  CalendarDays,
  CircleDot,
  Clock,
  FileText,
  Flag,
  FolderOpen,
  Hash,
  Heart,
  History,
  Link,
  Link2,
  List,
  ListChecks,
  Paperclip,
  Plus,
  Star,
  Tag as TagIcon,
  Target,
  ToggleLeft,
  Type,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
} from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { useNoteStore } from "../../store/useNoteStore";
import type { Note } from "../../types";
import { PropertyCalendar } from "../ui/PropertyCalendar";
import { PropertyCheckbox } from "../ui/PropertyCheckbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const INPUT_CLASS =
  "w-full rounded-[4px] border border-transparent bg-transparent px-[5px] py-[6px] text-sm leading-[22px] outline-none placeholder:text-muted-foreground/70 focus:border-[#1e96eb] focus:shadow-[0_0_0_2px_rgba(30,150,235,0.30)]";

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
  return custom ? <Icon icon={custom} /> : PROPERTY_TYPE_META[def.type].icon;
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
  createOption: (def: PropertyDefinition, name: string, thenPick: boolean) => void;
}

/**
 * AFFiNE text editor: an auto-growing textarea over a hidden mirror div,
 * multiline (Enter = newline), committed once on blur with trim. The blue
 * focus treatment lives on the wrapper (focus-within), not the textarea.
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
        "relative w-full rounded-[4px] focus-within:shadow-[0_0_0_2px_rgba(30,150,235,0.30)]",
        def.type === "url" && current && "text-primary",
      )}
    >
      <div className="invisible whitespace-pre-wrap break-words px-[5px] py-[6px] text-sm leading-[22px]">
        {temp}
        {(temp.endsWith("\n") || !temp) && <br />}
      </div>
      <textarea
        value={temp}
        rows={1}
        onChange={(e) => setTemp(e.target.value)}
        onBlur={commit}
        placeholder={MESSAGES.INFO_EMPTY_VALUE}
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none whitespace-pre-wrap break-words border-none bg-transparent px-[5px] py-[6px] text-sm leading-[22px] outline-none placeholder:text-muted-foreground/70"
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
    // toggles through the hidden native input (AFFI NE pattern).
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
      <PopoverContent align="start" className="w-auto p-1">
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
        onCreate={(name) => void createOption(def, name, true)}
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
          onPick={(id) => onSet({ type: "multiSelect", optionIds: [...ids, id] })}
          onCreate={(name) => void createOption(def, name, true)}
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
 * Declarative per-type value editor registry (AFFI NE WorkspacePropertyTypes
 * pattern): the Info panel renderValue path and any future surface (doc-list
 * columns, filters) resolve editors from here instead of a switch statement.
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
