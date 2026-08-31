import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Check, GripVertical, Pencil, Trash2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MESSAGES } from "../../../constants/messages";
import type { PropertyDefinition, PropertyVisibility } from "../../../domain/property/Property";
import {
  isSystemPropertyId,
  JOURNAL_PROPERTY_ID,
  PROPERTY_VISIBILITY,
} from "../../../domain/property/Property";
import { cn } from "../../../lib/utils";
import { InfoRow } from "../NoteInfoPanel";
import { PROPERTY_ICONS, PROPERTY_TYPE_META, resolvePropertyIcon } from "../PropertyValueEditors";

const VISIBILITY_LABEL: Record<PropertyVisibility, string> = {
  "always-show": MESSAGES.PROP_VIS_ALWAYS_SHOW,
  "hide-when-empty": MESSAGES.PROP_VIS_HIDE_WHEN_EMPTY,
  "always-hide": MESSAGES.PROP_VIS_ALWAYS_HIDE,
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

export const PropertyRow: React.FC<PropertyRowProps> = ({
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
      {/* A hover-revealed grip on the row's outer left edge, consuming no
          layout space. */}
      <button
        type="button"
        ref={handleRef}
        aria-label={MESSAGES.PROP_DRAG_LABEL}
        title={MESSAGES.PROP_DRAG_LABEL}
        className="absolute -left-4 top-[15px] z-10 flex h-4 w-4 -translate-y-1/2 cursor-grab items-center justify-center rounded text-muted-foreground/70 opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 active:cursor-grabbing group-hover/prop:opacity-100"
      >
        <GripVertical className="h-3 w-3" aria-hidden="true" />
      </button>
      <InfoRow
        icon={resolvePropertyIcon(def)}
        label={label}
        flush={
          (def.id !== JOURNAL_PROPERTY_ID &&
            (def.type === "text" ||
              def.type === "number" ||
              def.type === "person" ||
              def.type === "url")) ||
          def.id === "system:doc-mode" ||
          def.id === "system:page-width" ||
          def.id === "system:edgeless-theme"
        }
        noHover={
          def.id === "system:doc-mode" ||
          def.id === "system:page-width" ||
          def.id === "system:edgeless-theme"
        }
      >
        {children}
      </InfoRow>
      {/* The menu lives on an invisible layer above the name cell (clicking
          the name opens it) without stealing value width. */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${def.name}: ${MESSAGES.PROP_VISIBILITY_LABEL}`}
            className="absolute left-0 top-0 h-[30px] w-[160px] rounded opacity-0 hover:bg-accent/50 group-hover/prop:opacity-100"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
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
          {(isSystem && def.id !== JOURNAL_PROPERTY_ID && def.id !== "system:template"
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
