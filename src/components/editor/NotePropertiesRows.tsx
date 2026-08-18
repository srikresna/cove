import {
  CalendarDays,
  CircleDot,
  FileText,
  Hash,
  Link,
  Link2,
  List,
  ListChecks,
  Paperclip,
  Plus,
  ToggleLeft,
  Trash2,
  Type,
  User,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { propertyService } from "../../di/container";
import type {
  PropertyDefinition,
  PropertyOption,
  PropertyType,
  PropertyValue,
} from "../../domain/property/Property";
import { hasOptions, PROPERTY_TYPES } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { useNoteStore } from "../../store/useNoteStore";
import type { Note } from "../../types";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { InfoRow } from "./NoteInfoPanel";

const TYPE_META: Record<PropertyType, { label: string; icon: React.ReactNode }> = {
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
        className="hidden shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground group-hover/opt:block"
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

export const NotePropertiesRows: React.FC<{ note: Note }> = ({ note }) => {
  const [definitions, setDefinitions] = useState<PropertyDefinition[]>([]);
  const [values, setValues] = useState<Map<string, PropertyValue>>(new Map());
  const [deletingDef, setDeletingDef] = useState<PropertyDefinition | null>(null);
  const [newName, setNewName] = useState("");
  const notes = useNoteStore((s) => s.notes);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);

  const reload = useCallback(() => {
    Promise.all([propertyService.listDefinitions(), propertyService.valuesForNote(note.id)])
      .then(([defs, vals]) => {
        setDefinitions(defs);
        setValues(vals);
      })
      .catch(notifyError);
  }, [note.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = (propertyId: string, value: PropertyValue) => {
    setValues((prev) => new Map(prev).set(propertyId, value));
    propertyService.setValue(note.id, propertyId, value).catch((err) => {
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
    propertyService.removeValue(note.id, propertyId).catch((err) => {
      notifyError(err);
      reload();
    });
  };

  const createDefinition = (type: PropertyType) => {
    const name = newName.trim() || TYPE_META[type].label;
    setNewName("");
    propertyService
      .createDefinition(name, type)
      .then(() => reload())
      .catch(notifyError);
  };

  const createOption = (def: PropertyDefinition, name: string, thenPick: boolean) => {
    propertyService
      .addOption(def.id, name)
      .then((option) => {
        if (!thenPick) return reload();
        const current = values.get(def.id);
        if (def.type === "multiSelect") {
          const ids = current?.type === "multiSelect" ? current.optionIds : [];
          save(def.id, { type: "multiSelect", optionIds: [...ids, option.id] });
        } else {
          save(def.id, { type: def.type as "select" | "status", optionId: option.id });
        }
        reload();
      })
      .catch(notifyError);
  };

  const noteTitle = (id: string): string => {
    const found = notes.find((n) => n.id === id);
    return found ? found.title || MESSAGES.UNTITLED_NOTE : MESSAGES.UNTITLED_NOTE;
  };

  const renderValue = (def: PropertyDefinition) => {
    const value = values.get(def.id);
    switch (def.type) {
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
      {definitions.map((def) => (
        <div key={def.id} className="group/prop relative">
          <InfoRow icon={TYPE_META[def.type].icon} label={def.name}>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-1">
              <div className="min-w-0 flex-1">{renderValue(def)}</div>
              <button
                type="button"
                aria-label={`${MESSAGES.PROP_DELETE}: ${def.name}`}
                onClick={() => setDeletingDef(def)}
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive focus-visible:opacity-100 group-hover/prop:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </InfoRow>
        </div>
      ))}

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
            {PROPERTY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => createDefinition(type)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-muted-foreground"
              >
                {TYPE_META[type].icon}
                <span>{TYPE_META[type].label}</span>
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
              .then(() => reload())
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
