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
  ChevronDown,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { propertyService } from "../../di/container";
import type { PropertyDefinition, PropertyVisibility } from "../../domain/property/Property";
import {
  CREATABLE_PROPERTY_TYPES,
  isSystemPropertyId,
  JOURNAL_PROPERTY_ID,
  PROPERTY_VISIBILITY,
} from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { notifyError } from "../../store/notify";
import { usePropertyStore } from "../../store/usePropertyStore";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { PROPERTY_ICONS, PROPERTY_TYPE_META, resolvePropertyIcon } from "./PropertyValueEditors";

const VISIBILITY_LABEL: Record<PropertyVisibility, string> = {
  "always-show": MESSAGES.PROP_VIS_ALWAYS_SHOW,
  "hide-when-empty": MESSAGES.PROP_VIS_HIDE_WHEN_EMPTY,
  "always-hide": MESSAGES.PROP_VIS_ALWAYS_HIDE,
};

interface ManagerRowProps {
  def: PropertyDefinition;
  icon: React.ReactNode;
  renaming: boolean;
  onStartRename: (id: string) => void;
  onCommitRename: (def: PropertyDefinition, name: string) => void;
  onCancelRename: () => void;
  onVisibility: (def: PropertyDefinition, show: PropertyVisibility) => void;
  onIcon: (def: PropertyDefinition, icon: string | null) => void;
  onDelete: (def: PropertyDefinition) => void;
  onReorder: (id: string, targetId: string, position: "before" | "after") => void;
}

const ManagerRow: React.FC<ManagerRowProps> = ({
  def,
  icon,
  renaming,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onVisibility,
  onIcon,
  onDelete,
  onReorder,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const cancelRenameRef = useRef(false);
  const suppressTriggerFocusRef = useRef(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const isSystem = isSystemPropertyId(def.id);

  useEffect(() => {
    if (renaming) renameInputRef.current?.focus();
  }, [renaming]);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;
    return draggable({
      element,
      dragHandle: handleRef.current ?? undefined,
      getInitialData: () => ({ propertyId: def.id, from: "property-manager" }),
    });
  }, [def.id]);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;
    return dropTargetForElements({
      element,
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
        source.data.from === "property-manager" &&
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
    <span className="truncate">{def.name}</span>
  );

  return (
    <div
      ref={rowRef}
      className="group/mrow relative flex items-center gap-1.5 rounded-md px-1 py-1"
    >
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
      <button
        type="button"
        ref={handleRef}
        aria-label={MESSAGES.PROP_DRAG_LABEL}
        title={MESSAGES.PROP_DRAG_LABEL}
        className="flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-hover/mrow:opacity-100"
      >
        <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span aria-hidden="true" className="shrink-0 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-sm text-foreground">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${def.name}: ${MESSAGES.PROP_VISIBILITY_LABEL}`}
            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/mrow:opacity-100"
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
  );
};

/**
 * AFFiNE-style workspace property manager for the right bar: reorder and
 * configure every property definition, and add new ones from the type list.
 * Definitions are workspace-wide, so changes apply to every note.
 */
export const PropertyManagerPanel: React.FC<{
  typeMeta: Record<string, { label: string; icon: React.ReactNode }>;
}> = ({ typeMeta }) => {
  const [definitions, setDefinitions] = useState<PropertyDefinition[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingDef, setDeletingDef] = useState<PropertyDefinition | null>(null);
  const [listOpen, setListOpen] = useState(true);
  const [addOpen, setAddOpen] = useState(true);
  const propertyVersion = usePropertyStore((s) => s.version);
  const bumpProperties = usePropertyStore((s) => s.refresh);

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  const reload = useCallback(() => {
    propertyService.listDefinitions().then(setDefinitions).catch(notifyError);
  }, [propertyVersion]);

  useEffect(() => {
    reload();
  }, [reload]);

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
      propertyService.reorderDefinition(id, targetId, position).catch((err) => {
        notifyError(err);
        reload();
      });
    },
    [reload],
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

  const addProperty = (type: string) => {
    const meta = typeMeta[type];
    if (!meta) return;
    const nameExists = definitions.some((d) => d.name === meta.label);
    const allNames = definitions
      .map((d) => d.name)
      .filter((n): n is string => n !== null && n !== undefined);
    const name = nameExists ? generateSequencedName(meta.label, allNames) : meta.label;
    propertyService
      .createDefinition(name, type as Parameters<typeof propertyService.createDefinition>[1])
      .then(() => bumpProperties())
      .catch(notifyError);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col px-2 pt-2">
      <button
        type="button"
        onClick={() => setListOpen((prev) => !prev)}
        aria-expanded={listOpen}
        className="flex h-[30px] w-full items-center justify-between rounded p-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{MESSAGES.PROPERTIES}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform duration-200", !listOpen && "-rotate-90")}
        />
      </button>

      {listOpen && (
        <div className="space-y-0.5 pb-2">
          {definitions.length === 0 && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">{MESSAGES.INFO_EMPTY_VALUE}</p>
          )}
          {definitions.map((def) => (
            <ManagerRow
              key={def.id}
              def={def}
              icon={resolvePropertyIcon(def)}
              renaming={renamingId === def.id}
              onStartRename={setRenamingId}
              onCommitRename={commitRename}
              onCancelRename={() => setRenamingId(null)}
              onVisibility={handleVisibility}
              onIcon={handleIcon}
              onDelete={setDeletingDef}
              onReorder={handleReorder}
            />
          ))}
        </div>
      )}

      <div className="h-px w-full bg-border" aria-hidden="true" />

      <button
        type="button"
        onClick={() => setAddOpen((prev) => !prev)}
        aria-expanded={addOpen}
        className="mt-2 flex h-[30px] w-full items-center justify-between rounded p-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span>{MESSAGES.PROP_ADD}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn("h-4 w-4 transition-transform duration-200", !addOpen && "-rotate-90")}
        />
      </button>

      {addOpen && (
        <div className="space-y-0.5 pb-3">
          {CREATABLE_PROPERTY_TYPES.map((type) => {
            const meta = typeMeta[type];
            if (!meta) return null;
            return (
              <button
                key={type}
                type="button"
                onClick={() => addProperty(type)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-muted-foreground"
              >
                {meta.icon}
                <span className="truncate">{meta.label}</span>
                <Plus
                  className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/60"
                  aria-hidden="true"
                />
              </button>
            );
          })}
          <p className="flex items-center gap-1.5 px-2 pt-1 text-[11px] text-muted-foreground/70">
            <EyeOff className="h-3 w-3 shrink-0" aria-hidden="true" />
            {MESSAGES.PROP_MANAGER_HINT}
          </p>
        </div>
      )}

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
    </div>
  );
};

/** "Text" -> "Text 2" -> "Text 3" ... following the Info panel's add flow. */
function generateSequencedName(base: string, existing: string[]): string {
  let index = 2;
  let candidate = `${base} ${index}`;
  while (existing.includes(candidate)) {
    index += 1;
    candidate = `${base} ${index}`;
  }
  return candidate;
}
