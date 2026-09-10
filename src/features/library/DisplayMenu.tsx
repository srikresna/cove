import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  Clock,
  EyeOff,
  GripVertical,
  Layers,
  Settings2,
} from "lucide-react";
import type React from "react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MESSAGES } from "../../constants/messages";
import type { PropertyDefinition } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import type { LibrarySort } from "./LibraryNoteList";

export type GroupBy = "none" | "tags" | "created" | "updated" | { defId: string };

export const isGroupByDef = (value: GroupBy): value is { defId: string } =>
  typeof value === "object";

export interface LibraryDisplayPrefs {
  groupBy: GroupBy;
  hiddenProps: string[];
  showIcon: boolean;
  showBody: boolean;
}

interface DisplayMenuProps {
  prefs: LibraryDisplayPrefs;
  onChange: (next: Partial<LibraryDisplayPrefs>) => void;
  orderBy: LibrarySort;
  onOrderByChange: (next: LibrarySort) => void;
  defs: PropertyDefinition[];
  viewMode: "list" | "grid" | "masonry";
}

const ORDER_ITEMS: Array<{ value: LibrarySort; label: string; icon: React.ReactNode }> = [
  {
    value: "custom",
    label: "Custom",
    icon: <GripVertical className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "updated-desc",
    label: MESSAGES.LIBRARY_SORT_UPDATED,
    icon: <Clock className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "updated-asc",
    label: MESSAGES.LIBRARY_SORT_UPDATED,
    icon: <Clock className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "created-desc",
    label: MESSAGES.LIBRARY_SORT_CREATED,
    icon: <Clock className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "created-asc",
    label: MESSAGES.LIBRARY_SORT_CREATED,
    icon: <Clock className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "title-asc",
    label: MESSAGES.LIBRARY_SORT_TITLE,
    icon: <ArrowUpAZ className="h-4 w-4" aria-hidden="true" />,
  },
  {
    value: "title-desc",
    label: MESSAGES.LIBRARY_SORT_TITLE,
    icon: <ArrowDownAZ className="h-4 w-4" aria-hidden="true" />,
  },
];

export const DisplayMenu: React.FC<DisplayMenuProps> = ({
  prefs,
  onChange,
  orderBy,
  onOrderByChange,
  defs,
  viewMode,
}) => {
  const groupLabel = (group: GroupBy): string => {
    if (group === "none") return MESSAGES.LIBRARY_GROUP_NONE;
    if (group === "tags") return MESSAGES.TAGS_HEADER;
    if (group === "created") return MESSAGES.LIBRARY_SORT_CREATED;
    if (group === "updated") return MESSAGES.LIBRARY_SORT_UPDATED;
    return defs.find((d) => d.id === group.defId)?.name ?? "?";
  };
  const orderLabel = (sort: LibrarySort): string => {
    const item = ORDER_ITEMS.find((o) => o.value === sort);
    if (sort === "custom") return item?.label ?? "Custom";
    const asc = sort.endsWith("asc");
    return `${item?.label ?? ""} · ${asc ? MESSAGES.LIBRARY_SORT_ASC : MESSAGES.LIBRARY_SORT_DESC}`;
  };

  const toggleVisible = (id: string) => {
    onChange({
      hiddenProps: prefs.hiddenProps.includes(id)
        ? prefs.hiddenProps.filter((v) => v !== id)
        : [...prefs.hiddenProps, id],
    });
  };

  const chipDefs = defs;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" className="h-7 px-3 text-xs font-medium">
          <Settings2 className="h-4 w-4" aria-hidden="true" />
          {MESSAGES.LIBRARY_DISPLAY}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-2">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1">{MESSAGES.LIBRARY_GROUPING}</span>
            <span className="truncate text-xs text-muted-foreground">
              {groupLabel(prefs.groupBy)}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-[320px] overflow-y-auto">
            {(
              [
                ["tags", MESSAGES.TAGS_HEADER],
                ["created", MESSAGES.LIBRARY_SORT_CREATED],
                ["updated", MESSAGES.LIBRARY_SORT_UPDATED],
              ] as const
            ).map(([value, label]) => (
              <DropdownMenuItem key={value} onSelect={() => onChange({ groupBy: value })}>
                <span className="flex-1">{label}</span>
                {prefs.groupBy === value && (
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
            {chipDefs.length > 0 && <DropdownMenuSeparator />}
            {chipDefs.map((def) => (
              <DropdownMenuItem
                key={def.id}
                onSelect={() => onChange({ groupBy: { defId: def.id } })}
              >
                <span className="flex-1 truncate">{def.name}</span>
                {isGroupByDef(prefs.groupBy) && prefs.groupBy.defId === def.id && (
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange({ groupBy: "none" })}>
              <span className="flex-1">{MESSAGES.LIBRARY_GROUP_NONE}</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="flex-1">{MESSAGES.LIBRARY_ORDERING}</span>
            <span className="truncate text-xs text-muted-foreground">{orderLabel(orderBy)}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ORDER_ITEMS.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => onOrderByChange(option.value)}>
                {option.icon}
                <span className="flex-1 truncate">
                  {option.value === "custom"
                    ? option.label
                    : `${option.label} · ${
                        option.value.endsWith("asc")
                          ? MESSAGES.LIBRARY_SORT_ASC
                          : MESSAGES.LIBRARY_SORT_DESC
                      }`}
                </span>
                {orderBy === option.value && (
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>{MESSAGES.LIBRARY_DISPLAY_PROPERTIES}</DropdownMenuLabel>
        <div className="flex flex-wrap gap-1 px-1 pb-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleVisible("tags");
            }}
            className={cn(
              "rounded-lg px-2 py-1 text-xs transition-colors",
              !prefs.hiddenProps.includes("tags")
                ? "bg-primary/10 text-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {MESSAGES.TAGS_HEADER}
          </button>
          {chipDefs.map((def) => (
            <button
              key={def.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisible(def.id);
              }}
              className={cn(
                "max-w-32 truncate rounded-lg px-2 py-1 text-xs transition-colors",
                !prefs.hiddenProps.includes(def.id)
                  ? "bg-primary/10 text-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {def.name}
            </button>
          ))}
          {chipDefs.length === 0 && (
            <span className="flex items-center gap-1 px-1 py-1 text-xs text-muted-foreground/70">
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              No properties yet
            </span>
          )}
        </div>

        {viewMode === "list" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{MESSAGES.LIBRARY_LIST_OPTIONS}</DropdownMenuLabel>
            <div className="flex flex-wrap gap-1 px-1 pb-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ showIcon: !prefs.showIcon });
                }}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs transition-colors",
                  prefs.showIcon
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {MESSAGES.LIBRARY_SHOW_ICON}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ showBody: !prefs.showBody });
                }}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs transition-colors",
                  prefs.showBody
                    ? "bg-primary/10 text-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {MESSAGES.LIBRARY_SHOW_BODY}
              </button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
