import type { DatabaseBlockModel } from "@blocksuite/affine/model";
import { DatabaseBlockDataSource } from "@blocksuite/affine-block-database";
import {
  Calendar,
  CaseSensitive,
  Check,
  CheckSquare,
  ChevronDown,
  Gauge,
  Hash,
  Link2,
  ListTodo,
  Plus,
  Tag,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { MESSAGES } from "../../../../constants/messages";
import { blockSuiteEditorService, noteService } from "../../../../di/container";
import { cn } from "../../../../lib/utils";
import type { DatabaseBacklinkRef } from "../../../../services/blocksuite/IBlockSuiteEditorService";
import { packBlockSuiteContent } from "../../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../../services/editor/yjsCodec";
import { Logger } from "../../../../services/Logger";
import { useNoteStore } from "../../../../store/useNoteStore";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { InfoRow } from "../../NoteInfoPanel";

interface BacklinkOption {
  id: string;
  value: string;
  color?: unknown;
}

interface BacklinkCell {
  propertyId: string;
  name: string;
  type: string;
  value: string;
  raw: unknown;
  options: BacklinkOption[];
}

function typeIcon(type: string): React.ReactNode {
  switch (type) {
    case "date":
      return <Calendar />;
    case "number":
      return <Hash />;
    case "select":
    case "multi-select":
      return <Tag />;
    case "checkbox":
      return <CheckSquare />;
    case "progress":
      return <Gauge />;
    case "link":
      return <Link2 />;
    default:
      return <CaseSensitive />;
  }
}

function formatCell(raw: unknown, type: string): string {
  if (raw == null) return "";
  if (typeof raw === "number") {
    if (type === "date") {
      return new Date(raw).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    }
    return raw.toLocaleString();
  }
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw
      .map((v) => (typeof v === "string" ? v : ""))
      .filter(Boolean)
      .join(", ");
  }
  if (
    typeof raw === "object" &&
    typeof (raw as { toString?: () => string }).toString === "function"
  ) {
    const s = String(raw);
    if (s !== "[object Object]") return s;
  }
  return "";
}

function toLocalInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Sections for the same backlink can be mounted side by side (header Info
// panel + right-bar Info panel + peek) with independent cell snapshots; a
// shared rev signal makes any instance's edit invalidate every copy.
const backlinkRevListeners = new Set<() => void>();
let backlinkRevCounter = 0;

function bumpBacklinkRev(): void {
  backlinkRevCounter += 1;
  for (const listener of backlinkRevListeners) listener();
}

function useBacklinkRev(): number {
  return useSyncExternalStore(
    (onChange) => {
      backlinkRevListeners.add(onChange);
      return () => {
        backlinkRevListeners.delete(onChange);
      };
    },
    () => backlinkRevCounter,
  );
}

const cellInputClass =
  "h-7 w-full max-w-56 rounded-md border border-transparent bg-transparent px-1 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 hover:border-border focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring";

const OptionChip: React.FC<{
  option: BacklinkOption;
  onRemove?: () => void;
}> = ({ option, onRemove }) => (
  <span className="group/opt inline-flex h-[22px] max-w-40 items-center gap-1.5 rounded-full border bg-card px-2 text-xs text-foreground">
    {typeof option.color === "string" && option.color.length > 0 && (
      <span
        aria-hidden="true"
        className="h-2 w-2 shrink-0 rounded-full"
        // BlockSuite stores theme tokens like var(--affine-v2-chip-label-red);
        // they resolve as inline background-color via the globally imported theme css.
        style={{ backgroundColor: option.color }}
      />
    )}
    <span className="truncate">{option.value}</span>
    {onRemove && (
      <button
        type="button"
        aria-label={`${MESSAGES.PROP_CLEAR}: ${option.value}`}
        onClick={(e) => {
          // The chip can sit inside a popover trigger; clearing must not also open it.
          e.stopPropagation();
          onRemove();
        }}
        className="shrink-0 rounded-full p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/opt:opacity-100"
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    )}
  </span>
);

const OptionPickerPopover: React.FC<{
  options: BacklinkOption[];
  selectedIds: string[];
  multi: boolean;
  onPick: (optionId: string) => void;
  onCreate?: (name: string) => void;
  children: React.ReactNode;
}> = ({ options, selectedIds, multi, onPick, onCreate, children }) => {
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const lowered = trimmed.toLowerCase();
  const visible = options.filter((o) => !lowered || o.value.toLowerCase().includes(lowered));
  const exactExists = options.some((o) => o.value.toLowerCase() === lowered);
  const create = () => {
    if (!trimmed || exactExists || !onCreate) return;
    onCreate(trimmed);
    setQuery("");
  };
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={MESSAGES.PROP_OPTION_PLACEHOLDER}
          onKeyDown={(e) => {
            if (e.key === "Enter") create();
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
              <span className="min-w-0 flex-1 truncate">{option.value}</span>
              {selectedIds.includes(option.id) && (
                <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
            </button>
          ))}
          {trimmed && !exactExists && onCreate && (
            <button
              type="button"
              onClick={create}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {MESSAGES.PROP_CREATE_OPTION_PREFIX} "{trimmed}"
              </span>
            </button>
          )}
          {visible.length === 0 && !trimmed && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              {multi ? MESSAGES.INFO_EMPTY_VALUE : MESSAGES.INFO_EMPTY_VALUE}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Per-type cell editors mirroring the Info panel affordances. Values follow
 * the BlockSuite database raw-value contract per column type (boolean for
 * checkbox, number|null for number/date, option-id string / string[] for
 * select and multi-select, string for text/link); rich-text, title and
 * created-time cells stay read-only (Y.Text / engine-managed values).
 */
const BacklinkCellEditor: React.FC<{
  cell: BacklinkCell;
  onChange: (next: unknown) => void;
  onCreateOption: (name: string) => void;
}> = ({ cell, onChange, onCreateOption }) => {
  const commitNumber = (text: string) => {
    const trimmed = text.trim();
    if (trimmed === "") {
      onChange(cell.type === "progress" ? 0 : null);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) return;
    onChange(cell.type === "progress" ? Math.max(0, Math.min(100, parsed)) : parsed);
  };

  switch (cell.type) {
    case "date":
      return (
        <input
          type="datetime-local"
          value={typeof cell.raw === "number" ? toLocalInputValue(cell.raw) : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const ts = new Date(raw).getTime();
            if (!Number.isNaN(ts)) onChange(ts);
          }}
          className="h-7 rounded border bg-background px-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      );
    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={cell.raw === true}
          aria-label={cell.name}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[hsl(var(--primary))]"
        />
      );
    case "number":
    case "progress":
      return (
        <input
          key={`${cell.propertyId}-${cell.value}`}
          type="number"
          defaultValue={typeof cell.raw === "number" ? String(cell.raw) : ""}
          placeholder={MESSAGES.INFO_EMPTY_VALUE}
          onBlur={(e) => {
            if (e.target.value.trim() !== (typeof cell.raw === "number" ? String(cell.raw) : "")) {
              commitNumber(e.target.value);
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className={cellInputClass}
        />
      );
    case "text":
    case "link":
      return (
        <input
          key={`${cell.propertyId}-${cell.value}`}
          type="text"
          defaultValue={cell.value}
          placeholder={MESSAGES.INFO_EMPTY_VALUE}
          onBlur={(e) => {
            // Only write when the value actually changed: the official text
            // cell stores untrimmed input, so trim-on-no-edit would silently
            // rewrite stored whitespace.
            const next = e.target.value;
            if (next === cell.value) return;
            onChange(next.trim());
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className={cn(
            cellInputClass,
            cell.type === "link" && cell.value && "text-primary underline",
          )}
        />
      );
    case "select": {
      const selectedId = typeof cell.raw === "string" ? cell.raw : null;
      const selected = cell.options.find((o) => o.id === selectedId);
      // A dead option id (deleted in the database view) still is a value:
      // show a removable Unknown chip instead of the Empty affordance.
      if (selectedId && !selected) {
        return (
          <OptionChip
            option={{ id: selectedId, value: MESSAGES.PROP_UNKNOWN_OPTION }}
            onRemove={() => onChange(null)}
          />
        );
      }
      return (
        <div className="flex items-center">
          {/* The chip itself opens the picker, so A -> B is one write. */}
          <OptionPickerPopover
            options={cell.options}
            selectedIds={selectedId ? [selectedId] : []}
            multi={false}
            onPick={(id) => onChange(id)}
            onCreate={onCreateOption}
          >
            {selected ? (
              <OptionChip option={selected} onRemove={() => onChange(null)} />
            ) : (
              <button
                type="button"
                className="text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {MESSAGES.INFO_EMPTY_VALUE}
              </button>
            )}
          </OptionPickerPopover>
        </div>
      );
    }
    case "multi-select": {
      const ids = Array.isArray(cell.raw)
        ? cell.raw.filter((v): v is string => typeof v === "string")
        : [];
      const selected = cell.options.filter((o) => ids.includes(o.id));
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          {selected.map((option) => (
            <OptionChip
              key={option.id}
              option={option}
              onRemove={() => onChange(ids.filter((id) => id !== option.id))}
            />
          ))}
          <OptionPickerPopover
            options={cell.options}
            selectedIds={ids}
            multi
            onPick={(id) => onChange(ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id])}
            onCreate={onCreateOption}
          >
            <button
              type="button"
              aria-label={MESSAGES.PROP_OPTION_PLACEHOLDER}
              className="inline-flex h-[22px] items-center gap-1 rounded-full px-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              {selected.length === 0 && <span>{MESSAGES.INFO_EMPTY_VALUE}</span>}
            </button>
          </OptionPickerPopover>
        </div>
      );
    }
    default:
      return <span className="px-1 text-foreground/90">{cell.value || "—"}</span>;
  }
};

// Theme tokens used by BlockSuite's own tag palette; defined on :root by the
// globally imported @toeverything/theme css.
const OPTION_COLOR_TOKENS = [
  "var(--affine-v2-chip-label-red)",
  "var(--affine-v2-chip-label-orange)",
  "var(--affine-v2-chip-label-yellow)",
  "var(--affine-v2-chip-label-green)",
  "var(--affine-v2-chip-label-blue)",
  "var(--affine-v2-chip-label-purple)",
];

export const DatabaseBacklinkSection: React.FC<DatabaseBacklinkRef & { defaultOpen?: boolean }> = ({
  databaseDocId,
  databaseId,
  databaseRowId,
  defaultOpen = true,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const rev = useBacklinkRev();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (blockSuiteEditorService.isNoteDocLoaded(databaseDocId)) return;
    let cancelled = false;
    noteService
      .getNote(databaseDocId)
      .then((n) => {
        if (!cancelled) blockSuiteEditorService.openNoteDoc(databaseDocId, n?.content ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) bumpBacklinkRev();
      });
    return () => {
      cancelled = true;
    };
  }, [databaseDocId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: rev intentionally retriggers after in-place cell edits
  const data = useMemo(() => {
    try {
      const store = blockSuiteEditorService.getDocStoreForPeek(databaseDocId);
      if (!store) return null;
      const block = store.getBlock(databaseId);
      const dbModel = block?.model;
      if (dbModel?.flavour !== "affine:database") return null;
      const dbBlockModel = dbModel as unknown as DatabaseBlockModel;

      const ds = new DatabaseBlockDataSource(dbBlockModel);
      const cells: BacklinkCell[] = [];
      for (const propertyId of ds.properties$.value) {
        const type = ds.propertyTypeGet(propertyId) ?? "";
        if (type === "title") continue;
        const raw = ds.cellValueGet(databaseRowId, propertyId);
        let options: BacklinkOption[] = [];
        if (type === "select" || type === "multi-select") {
          const data = ds.propertyDataGet(propertyId) as { options?: unknown } | undefined;
          options = Array.isArray(data?.options)
            ? (data.options as BacklinkOption[]).filter(
                (o): o is BacklinkOption =>
                  o != null && typeof o.id === "string" && typeof o.value === "string",
              )
            : [];
        }
        cells.push({
          propertyId,
          name: ds.propertyNameGet(propertyId),
          type,
          value: formatCell(raw, type),
          raw,
          options,
        });
      }

      cells.sort((a, b) => {
        if (a.type === "date" && b.type !== "date") return -1;
        if (b.type === "date" && a.type !== "date") return 1;
        return 0;
      });
      return { cells, ds };
    } catch {
      return null;
    }
  }, [databaseDocId, databaseId, databaseRowId, rev]);

  const runSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    // Only flush when an edit actually happened - sections remount on note
    // switches and a no-op save would re-encrypt identical content, bump
    // updatedAt, and drop the backlink scan cache for nothing.
    if (!dirtyRef.current) return;
    try {
      if (!blockSuiteEditorService.isNoteDocLoaded(databaseDocId)) return;
      const store = blockSuiteEditorService.getDocStoreForPeek(databaseDocId);
      if (!store) return;
      const snapshot = packBlockSuiteContent(encodeDocSnapshot(store.spaceDoc));
      void useNoteStore
        .getState()
        .updateNote(databaseDocId, { content: snapshot })
        .then(
          () => {
            dirtyRef.current = false;
          },
          () => {},
        );
    } catch {
      void 0;
    }
  }, [databaseDocId]);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(runSave, 500);
  }, [runSave]);

  useEffect(() => {
    return () => {
      runSave();
    };
  }, [runSave]);

  const writeCell = useCallback(
    (cell: BacklinkCell, next: unknown) => {
      if (!data) return;
      try {
        data.ds.cellValueChange(databaseRowId, cell.propertyId, next);
        bumpBacklinkRev();
        scheduleSave();
      } catch (err) {
        Logger.error("[cove-backlink] cell write failed", err);
      }
    },
    [data, databaseRowId, scheduleSave],
  );

  const createOption = useCallback(
    (cell: BacklinkCell, name: string) => {
      if (!data) return;
      try {
        const id = crypto.randomUUID();
        const color = OPTION_COLOR_TOKENS[cell.options.length % OPTION_COLOR_TOKENS.length] ?? "";
        const columnData = data.ds.propertyDataGet(cell.propertyId) as
          | { options?: unknown }
          | undefined;
        const options = Array.isArray(columnData?.options)
          ? (columnData.options as BacklinkOption[])
          : [];
        data.ds.propertyDataSet(cell.propertyId, {
          ...columnData,
          options: [...options, { id, value: name, color }],
        });
        if (cell.type === "multi-select") {
          const ids = Array.isArray(cell.raw)
            ? cell.raw.filter((v): v is string => typeof v === "string")
            : [];
          data.ds.cellValueChange(databaseRowId, cell.propertyId, [...ids, id]);
        } else {
          data.ds.cellValueChange(databaseRowId, cell.propertyId, id);
        }
        bumpBacklinkRev();
        scheduleSave();
      } catch (err) {
        Logger.error("[cove-backlink] option create failed", err);
      }
    },
    [data, databaseRowId, scheduleSave],
  );

  if (!data) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-[30px] w-full items-center justify-between rounded p-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>Calendar Properties</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform duration-200", !open && "-rotate-90")}
        />
      </button>
      <div className="h-px w-full bg-border" aria-hidden="true" />

      {open && (
        <div className="mt-2 space-y-1 pb-2">
          {data.cells.length === 0 && (
            <div className="p-1 text-sm text-muted-foreground/70">Empty</div>
          )}
          {data.cells.map((cell) => (
            <InfoRow key={cell.propertyId} icon={typeIcon(cell.type)} label={cell.name}>
              <BacklinkCellEditor
                cell={cell}
                onChange={(next) => writeCell(cell, next)}
                onCreateOption={(name) => createOption(cell, name)}
              />
            </InfoRow>
          ))}
          <div className="px-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-muted-foreground"
              onClick={() => {
                if (useNoteStore.getState().notes.some((n) => n.id === databaseDocId)) {
                  useNoteStore.getState().setActiveNoteId(databaseDocId);
                }
              }}
            >
              <ListTodo className="h-3.5 w-3.5" aria-hidden="true" />
              Open Calendar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseBacklinkSection;
