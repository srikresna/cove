import { Plus, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { MESSAGES } from "../../constants/messages";
import { propertyService } from "../../di/container";
import type { FilterRule } from "../../domain/filters/FilterRule";
import { FILTER_OPERATORS, filterKindForType } from "../../domain/filters/FilterRule";
import type { PropertyDefinition } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PropertyCalendar } from "../ui/PropertyCalendar";

const makeRuleId = () => crypto.randomUUID();

function opLabel(kind: FilterRule["kind"], op: string): string {
  return FILTER_OPERATORS[kind].find((o) => o.value === op)?.label ?? op;
}

const RuleChip: React.FC<{
  rule: FilterRule;
  propertyDefs: PropertyDefinition[];
  onUpdate: (patch: Partial<FilterRule>) => void;
  onRemove: () => void;
}> = ({ rule, propertyDefs, onUpdate, onRemove }) => {
  const tags = useTagStore((s) => s.tags);
  const def = propertyDefs.find((d) => d.id === (rule as { propertyId?: string }).propertyId);
  const ruleName =
    rule.kind === "tags"
      ? MESSAGES.TAGS_HEADER
      : rule.kind === "journal"
        ? "Journal"
        : rule.kind === "template"
          ? "Template"
          : (def?.name ?? "?");
  const ops = FILTER_OPERATORS[rule.kind];
  const currentOp = (rule as { op: string }).op;
  const needsValue = !currentOp.startsWith("is-empty") && !currentOp.startsWith("is-not-empty");

  const numberValue = rule.kind === "number" ? rule.value : undefined;
  const dateValue = rule.kind === "date" ? rule.value : undefined;
  const boolValue =
    rule.kind === "checkbox" || rule.kind === "journal" || rule.kind === "template"
      ? rule.value
      : undefined;

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-md border bg-card px-1.5 py-1 text-xs">
      <span className="shrink-0 font-medium text-foreground">{ruleName}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="shrink-0 rounded px-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {opLabel(rule.kind, currentOp)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {ops.map((op) => (
            <DropdownMenuItem
              key={op.value}
              onSelect={() => onUpdate({ op: op.value } as Partial<FilterRule>)}
            >
              {op.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {needsValue && rule.kind === "text" && (
        <input
          type="text"
          defaultValue={rule.value ?? ""}
          onBlur={(e) => onUpdate({ value: e.target.value } as Partial<FilterRule>)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="text"
          className="h-5 w-20 rounded border border-transparent bg-transparent px-1 outline-none hover:border-border focus-visible:border-border"
        />
      )}
      {needsValue && rule.kind === "number" && (
        <input
          type="number"
          inputMode="decimal"
          defaultValue={numberValue ?? ""}
          onBlur={(e) => {
            const raw = e.target.value.trim();
            // Blurring an untouched input must leave the rule valueless
            // (Number("") would coerce it to 0 and start filtering).
            onUpdate({
              value: raw !== "" && Number.isFinite(Number(raw)) ? Number(raw) : undefined,
            } as Partial<FilterRule>);
          }}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          placeholder="0"
          className="h-5 w-16 rounded border border-transparent bg-transparent px-1 outline-none hover:border-border focus-visible:border-border"
        />
      )}
      {needsValue && rule.kind === "date" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {dateValue != null
                ? new Date(dateValue).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : MESSAGES.INFO_EMPTY_VALUE}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-auto p-2">
            <PropertyCalendar
              value={dateValue ?? null}
              onChange={(ts) => onUpdate({ value: ts } as Partial<FilterRule>)}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {(rule.kind === "checkbox" || rule.kind === "journal" || rule.kind === "template") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {boolValue === true ? "✓" : "✗"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-24">
            <DropdownMenuItem onSelect={() => onUpdate({ value: true } as Partial<FilterRule>)}>
              ✓ true
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdate({ value: false } as Partial<FilterRule>)}>
              ✗ false
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {(rule.kind === "select" || rule.kind === "multiSelect") && def && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {(rule as { optionIds: string[] }).optionIds.length > 0
                ? `${(rule as { optionIds: string[] }).optionIds.length} opts`
                : MESSAGES.INFO_EMPTY_VALUE}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {def.options.map((option) => {
              const selected = (rule as { optionIds: string[] }).optionIds.includes(option.id);
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => {
                    const ids = (rule as { optionIds: string[] }).optionIds;
                    onUpdate({
                      optionIds: selected
                        ? ids.filter((i) => i !== option.id)
                        : [...ids, option.id],
                    } as Partial<FilterRule>);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="truncate">{option.name}</span>
                  {selected && <span className="ml-auto text-muted-foreground">✓</span>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {rule.kind === "tags" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="shrink-0 rounded px-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {rule.tagIds.length > 0 ? `${rule.tagIds.length}` : MESSAGES.INFO_EMPTY_VALUE}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {tags.map((tag) => {
              const selected = rule.tagIds.includes(tag.id);
              return (
                <DropdownMenuItem
                  key={tag.id}
                  onSelect={() =>
                    onUpdate({
                      tagIds: selected
                        ? rule.tagIds.filter((i) => i !== tag.id)
                        : [...rule.tagIds, tag.id],
                    } as Partial<FilterRule>)
                  }
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="truncate">{tag.name}</span>
                  {selected && <span className="ml-auto text-muted-foreground">✓</span>}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <button
        type="button"
        aria-label="Remove rule"
        onClick={onRemove}
        className="ml-auto shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
};

/**
 * The rule-chip editor inside the Library filter area. Save/Cancel live in
 * the surrounding area (LibraryPage) — this bar only composes and edits rules.
 */
export const FilterBar: React.FC<{
  /** Controlled mode (collection editor): edit an explicit rules array. */
  rules?: FilterRule[];
  onChange?: (next: FilterRule[]) => void;
}> = ({ rules, onChange }) => {
  // Uncontrolled mode edits the view-store drafts (Library filter area).
  const storeRules = useViewStore((s) => s.draftRules);
  const addDraftRule = useViewStore((s) => s.addDraftRule);
  const updateDraftRule = useViewStore((s) => s.updateDraftRule);
  const removeDraftRule = useViewStore((s) => s.removeDraftRule);
  const propertyVersion = usePropertyStore((s) => s.version);
  const [defs, setDefs] = useState<PropertyDefinition[]>([]);

  const controlled = rules !== undefined && onChange !== undefined;
  const draftRules = controlled ? rules : storeRules;

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    propertyService
      .listDefinitions()
      .then(setDefs)
      .catch(() => setDefs([]));
  }, [propertyVersion]);

  const filterableDefs = defs.filter(
    (d) => d.show !== "always-hide" && d.id !== "system:tags" && filterKindForType(d.type) !== null,
  );

  const addRule = (rule: FilterRule) => {
    if (controlled) onChange([...rules, rule]);
    else addDraftRule(rule);
  };
  const patchRule = (id: string, patch: Partial<FilterRule>) => {
    if (controlled) {
      onChange(rules.map((r) => (r.id === id ? ({ ...r, ...patch } as FilterRule) : r)));
    } else updateDraftRule(id, patch);
  };
  const dropRule = (id: string) => {
    if (controlled) onChange(rules.filter((r) => r.id !== id));
    else removeDraftRule(id);
  };

  const handleAdd = (kind: FilterRule["kind"], propertyId?: string) => {
    const base = { id: makeRuleId(), propertyId: propertyId ?? "" };
    switch (kind) {
      case "text":
        addRule({ ...base, kind: "text", op: "contains", value: "" });
        break;
      case "number":
        addRule({ ...base, kind: "number", op: "=", value: undefined });
        break;
      case "date":
        addRule({ ...base, kind: "date", op: "is", value: undefined });
        break;
      case "select":
        addRule({ ...base, kind: "select", op: "is", optionIds: [] });
        break;
      case "multiSelect":
        addRule({ ...base, kind: "multiSelect", op: "is", optionIds: [] });
        break;
      case "checkbox":
        addRule({ ...base, kind: "checkbox", op: "is", value: true });
        break;
      case "tags":
        addRule({ id: makeRuleId(), kind: "tags", op: "has-any-of", tagIds: [] });
        break;
      case "journal":
        addRule({ id: makeRuleId(), kind: "journal", op: "is", value: true });
        break;
      case "template":
        addRule({ id: makeRuleId(), kind: "template", op: "is", value: false });
        break;
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
      {draftRules.map((rule) => (
        <RuleChip
          key={rule.id}
          rule={rule}
          propertyDefs={filterableDefs}
          onUpdate={(patch) => patchRule(rule.id, patch)}
          onRemove={() => dropRule(rule.id)}
        />
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={MESSAGES.VIEW_ADD_RULE}
            className={cn(
              "flex h-7 items-center gap-1 rounded-md border px-2 text-xs text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              draftRules.length === 0 && "border-dashed",
            )}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {MESSAGES.VIEW_ADD_RULE}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          {filterableDefs.map((def) => {
            const kind = filterKindForType(def.type);
            if (!kind) return null;
            return (
              <DropdownMenuItem key={def.id} onSelect={() => handleAdd(kind, def.id)}>
                <span className="truncate">{def.name}</span>
                <span className="ml-auto text-[10px] uppercase text-muted-foreground">
                  {def.type}
                </span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{MESSAGES.VIEW_SPECIAL}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => handleAdd("tags")}>
            {MESSAGES.TAGS_HEADER}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAdd("journal")}>Journal</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAdd("template")}>Template</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
