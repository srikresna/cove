import { CalendarDays, Check, ChevronDown, Hash, Plus, Tags, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { PropertyCalendar } from "../../components/ui/PropertyCalendar";
import { MESSAGES } from "../../constants/messages";
import { propertyService } from "../../di/container";
import {
  FILTER_OPERATORS,
  type FilterRule,
  filterKindForType,
  isRuleComplete,
} from "../../domain/filters/FilterRule";
import type { PropertyDefinition } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";

const makeRuleId = () => crypto.randomUUID();

const controlBase =
  "flex h-8 items-center gap-1 rounded-md border border-border bg-card px-2 text-[13px] leading-4 text-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function opLabel(kind: FilterRule["kind"], op: string): string {
  return FILTER_OPERATORS[kind].find((o) => o.value === op)?.label ?? op;
}

/** Summary of chosen multi-values: first name + overflow count. */
function namesSummary(
  chosen: string[],
  resolve: (id: string) => { name: string } | undefined,
): { first: string | null; rest: number } {
  const names = chosen.map((id) => resolve(id)?.name).filter((n): n is string => Boolean(n));
  return { first: names[0] ?? null, rest: Math.max(0, names.length - 1) };
}

const RuleRow: React.FC<{
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
  const incomplete = needsValue && !isRuleComplete(rule);

  const numberValue = rule.kind === "number" ? rule.value : undefined;
  const dateValue = rule.kind === "date" ? rule.value : undefined;
  const boolValue =
    rule.kind === "checkbox" || rule.kind === "journal" || rule.kind === "template"
      ? rule.value
      : undefined;

  const optionDef = rule.kind === "select" || rule.kind === "multiSelect" ? def : undefined;
  const optionIds = optionDef ? (rule as { optionIds: string[] }).optionIds : [];
  const options = optionsSummaryOf(optionIds, optionDef);
  const tagPick = rule.kind === "tags" ? rule.tagIds : [];
  const tagNames = namesSummary(tagPick, (id) => tags.find((t) => t.id === id));

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 rounded-md border bg-card px-2 py-1.5",
        incomplete && "opacity-60",
      )}
      title={incomplete ? MESSAGES.FILTER_INCOMPLETE_HINT : undefined}
    >
      <span className="min-w-20 shrink-0 truncate text-[13px] font-medium leading-4 text-foreground">
        {ruleName}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={cn(controlBase, "shrink-0 text-muted-foreground")}>
            {opLabel(rule.kind, currentOp)}
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
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
          placeholder={MESSAGES.FILTER_VALUE_PLACEHOLDER}
          className="h-8 w-36 rounded-md border border-border bg-card px-2 text-[13px] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="h-8 w-24 rounded-md border border-border bg-card px-2 text-[13px] leading-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      )}
      {needsValue && rule.kind === "date" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn(controlBase, "w-32 justify-start")}>
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {dateValue != null
                ? new Date(dateValue).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : MESSAGES.FILTER_PICK_DATE}
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
            <button type="button" className={cn(controlBase, "w-32 justify-start")}>
              {boolValue === true ? MESSAGES.FILTER_IS_CHECKED : MESSAGES.FILTER_IS_UNCHECKED}
              <ChevronDown className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuItem onSelect={() => onUpdate({ value: true } as Partial<FilterRule>)}>
              <Check className={cn(boolValue !== true && "invisible")} aria-hidden="true" />
              {MESSAGES.FILTER_IS_CHECKED}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onUpdate({ value: false } as Partial<FilterRule>)}>
              <Check className={cn(boolValue !== false && "invisible")} aria-hidden="true" />
              {MESSAGES.FILTER_IS_UNCHECKED}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {optionDef && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn(controlBase, "min-w-24 max-w-48 justify-start")}>
              {options.first ? (
                <span className="truncate">
                  {options.first}
                  {options.rest > 0 && (
                    <span className="text-muted-foreground"> +{options.rest}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">{MESSAGES.FILTER_PICK_OPTIONS}</span>
              )}
              <ChevronDown className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            {optionDef.options.map((option) => {
              const selected = optionIds.includes(option.id);
              return (
                <DropdownMenuItem
                  key={option.id}
                  onSelect={() => {
                    onUpdate({
                      optionIds: selected
                        ? optionIds.filter((i) => i !== option.id)
                        : [...optionIds, option.id],
                    } as Partial<FilterRule>);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                  <span className="truncate">{option.name}</span>
                  <Check className={cn("ml-auto", !selected && "invisible")} aria-hidden="true" />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {rule.kind === "tags" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className={cn(controlBase, "min-w-24 max-w-48 justify-start")}>
              <Tags className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {tagNames.first ? (
                <span className="truncate">
                  {tagNames.first}
                  {tagNames.rest > 0 && (
                    <span className="text-muted-foreground"> +{tagNames.rest}</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">{MESSAGES.FILTER_PICK_TAGS}</span>
              )}
              <ChevronDown className="ml-auto h-3.5 w-3.5" aria-hidden="true" />
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
                  <Check className={cn("ml-auto", !selected && "invisible")} aria-hidden="true" />
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {incomplete && (
        <span className="shrink-0 text-[11px] leading-4 text-muted-foreground">
          {MESSAGES.FILTER_INCOMPLETE_HINT}
        </span>
      )}

      <button
        type="button"
        aria-label="Remove rule"
        onClick={onRemove}
        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};

function optionsSummaryOf(
  chosen: string[],
  def: PropertyDefinition | undefined,
): { first: string | null; rest: number } {
  return namesSummary(chosen, (id) => def?.options.find((o) => o.id === id));
}

/**
 * The rule editor inside the Library filter area and the collection editor
 * — one full-width row per rule at the app's control scale. Save/Cancel
 * live in the surrounding surface; this bar only composes and edits rules.
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
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      {draftRules.map((rule) => (
        <RuleRow
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
              "flex h-8 w-fit items-center gap-1.5 rounded-md border border-dashed px-2.5 text-[13px] leading-4 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              draftRules.length > 0 && "border-transparent",
            )}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {MESSAGES.VIEW_ADD_RULE}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {filterableDefs.map((def) => {
            const kind = filterKindForType(def.type);
            if (!kind) return null;
            return (
              <DropdownMenuItem key={def.id} onSelect={() => handleAdd(kind, def.id)}>
                <Hash className="text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{def.name}</span>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => handleAdd("tags")}>
            <Tags className="text-muted-foreground" aria-hidden="true" />
            {MESSAGES.TAGS_HEADER}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAdd("journal")}>
            <CalendarDays className="text-muted-foreground" aria-hidden="true" />
            Journal
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handleAdd("template")}>
            <Check className="text-muted-foreground" aria-hidden="true" />
            Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
