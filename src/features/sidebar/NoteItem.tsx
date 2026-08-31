import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { motion } from "framer-motion";
import { Copy, FileText, GripVertical, MoreHorizontal, Pin, Star, Trash2 } from "lucide-react";
import React, { useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { stackValueText } from "../../domain/property/format";
import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { resolvePropertyIcon } from "../editor/PropertyValueEditors";

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  /** Library selection mode: the row toggles selection instead of opening. */
  selectionMode?: boolean;
  isSelected?: boolean;
  /** Show the drag handle (Library list + custom sort only). */
  showDragHandle?: boolean;
  onReorder?: (id: string, targetId: string, position: "before" | "after") => void;
  /** The optional event carries ctrl/meta/shift for Library multi-select. */
  onSelect: (id: string, event?: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  /** Stack rows under the title. */
  stackRows?: Array<{ def: PropertyDefinition; value: PropertyValue }>;
  /** Tag chips after the stacks (Library display option). */
  tagChips?: Array<{ name: string; color: string }>;
  /** Show the note's icon/emoji (Library list display option). */
  showIcon?: boolean;
}

const updatedTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

export const NoteMenuEntries: React.FC<{
  note: Note;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  Item: typeof DropdownMenuItem | typeof ContextMenuItem;
  Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator;
}> = ({ note, onTogglePin, onToggleFavorite, onDuplicate, onDelete, Item, Separator }) => (
  <>
    <Item onSelect={() => onTogglePin(note.id)}>
      <Pin className={cn(note.isPinned && "text-primary")} aria-hidden="true" />
      <span>{note.isPinned ? MESSAGES.UNPIN_NOTE : MESSAGES.PIN_NOTE}</span>
    </Item>
    <Item onSelect={() => onToggleFavorite(note.id)}>
      <Star className={cn(note.isFavorite && "text-warm")} aria-hidden="true" />
      <span>{note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}</span>
    </Item>
    <Item onSelect={() => onDuplicate(note.id)}>
      <Copy aria-hidden="true" />
      <span>{MESSAGES.DUPLICATE_NOTE}</span>
    </Item>
    <Separator />
    <Item onSelect={() => onDelete(note.id)} className="text-destructive focus:text-destructive">
      <Trash2 aria-hidden="true" />
      <span>{MESSAGES.MOVE_TO_TRASH}</span>
    </Item>
  </>
);

/** Stack value formatter for note rows and cards (compact, no editors). */
export { stackValueText };

export const NoteItem: React.FC<NoteItemProps> = React.memo(
  ({
    note,
    isActive,
    selectionMode = false,
    isSelected = false,
    showDragHandle = false,
    onReorder,
    onSelect,
    onTogglePin,
    onToggleFavorite,
    onDuplicate,
    onDelete,
    stackRows = [],
    tagChips = [],
    showIcon = true,
  }) => {
    // Drag-reorder (Library list + custom sort): the row is both the drag
    // source (via the hover grip) and a top/bottom-edge drop target, the
    // NotePropertiesRows pattern.
    const rowRef = useRef<HTMLDivElement | null>(null);
    const gripRef = useRef<HTMLButtonElement | null>(null);
    const [closestEdge, setClosestEdge] = React.useState<"top" | "bottom" | null>(null);
    const edgeOf = (edge: Edge | null): "top" | "bottom" | null =>
      edge === "top" || edge === "bottom" ? edge : null;

    React.useEffect(() => {
      const grip = gripRef.current;
      if (!grip || !showDragHandle) return;
      return draggable({
        element: grip,
        dragHandle: grip,
        getInitialData: () => ({ noteId: note.id, from: "library-list" }),
      });
    }, [showDragHandle, note.id]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: edgeOf is a stable module-level helper
    React.useEffect(() => {
      const row = rowRef.current;
      if (!row || !showDragHandle) return;
      return dropTargetForElements({
        element: row,
        canDrop: ({ source }) => source.data.from === "library-list",
        getIsSticky: () => true,
        getData: ({ input, element }) =>
          attachClosestEdge({}, { input, element, allowedEdges: ["top", "bottom"] }),
        onDragEnter: ({ self }) => setClosestEdge(edgeOf(extractClosestEdge(self.data))),
        onDrag: ({ self }) => setClosestEdge(edgeOf(extractClosestEdge(self.data))),
        onDragLeave: () => setClosestEdge(null),
        onDrop: ({ source, self }) => {
          setClosestEdge(null);
          const draggedId = String(source.data.noteId ?? "");
          const edge = edgeOf(extractClosestEdge(self.data));
          if (draggedId && draggedId !== note.id && edge) {
            onReorder?.(draggedId, note.id, edge === "bottom" ? "after" : "before");
          }
        },
      });
    }, [showDragHandle, note.id, onReorder]);

    const menuHandlers = { note, onTogglePin, onToggleFavorite, onDuplicate, onDelete };
    const visibleStacks = stackRows
      .map((row) => ({ ...row, text: stackValueText(row.def, row.value) }))
      .filter((row): row is { def: PropertyDefinition; value: PropertyValue; text: string } =>
        Boolean(row.text),
      )
      .slice(0, 3);
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            ref={rowRef}
            layout
            role="button"
            tabIndex={0}
            aria-label={`Note: ${note.title || MESSAGES.UNTITLED_NOTE}`}
            onClick={(e) => onSelect(note.id, e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(note.id, e);
              }
            }}
            className={cn(
              "group relative flex w-full cursor-pointer items-center justify-between rounded-md border px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-border bg-card shadow-sm"
                : "border-transparent hover:bg-accent/50",
              isSelected && "border-primary/60 bg-primary/5",
            )}
          >
            {showDragHandle && (
              <button
                ref={gripRef}
                type="button"
                aria-label={MESSAGES.PROP_DRAG_LABEL}
                tabIndex={-1}
                className="absolute -left-3.5 top-1/2 hidden -translate-y-1/2 cursor-grab rounded p-0.5 text-muted-foreground/60 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 md:block"
              >
                <GripVertical className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
            {closestEdge && (
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute left-0 right-0 z-10 h-0.5 bg-primary",
                  closestEdge === "top" ? "-top-0.5" : "-bottom-0.5",
                )}
              />
            )}
            {selectionMode && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 bg-card text-transparent",
                )}
              >
                ✓
              </span>
            )}
            <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
              {showIcon && (
                <span
                  className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center text-lg"
                  aria-hidden="true"
                >
                  {note.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
                </span>
              )}
              <div className="min-w-0 truncate">
                <div className="truncate text-[13px] font-medium text-foreground">
                  {note.title || MESSAGES.UNTITLED_NOTE}
                </div>
                <div className="truncate font-mono text-[10px] text-muted-foreground">
                  {note.updatedAt ? updatedTimeFormatter.format(note.updatedAt) : "Just now"}
                </div>
                {visibleStacks.length > 0 && (
                  <div className="mt-0.5 space-y-px">
                    {visibleStacks.map((row) => (
                      <div
                        key={row.def.id}
                        className="flex items-center gap-1.5 truncate text-[11px] leading-4 text-muted-foreground"
                      >
                        <span aria-hidden="true" className="shrink-0 [&_svg]:h-3 [&_svg]:w-3">
                          {resolvePropertyIcon(row.def)}
                        </span>
                        <span className="shrink-0 text-muted-foreground/70">{row.def.name}</span>
                        <span className="truncate text-foreground/80">{row.text}</span>
                      </div>
                    ))}
                    {stackRows.length > 3 && (
                      <div className="text-[10px] text-muted-foreground/60">
                        +{stackRows.length - 3}
                      </div>
                    )}
                  </div>
                )}
                {tagChips.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tagChips.slice(0, 3).map((chip) => (
                      <span
                        key={chip.name}
                        className="inline-flex h-[18px] max-w-28 items-center gap-1 rounded-full border bg-card px-1.5 text-[10px] text-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: chip.color }}
                        />
                        <span className="truncate">{chip.name}</span>
                      </span>
                    ))}
                    {tagChips.length > 3 && (
                      <span className="text-[10px] text-muted-foreground/60">
                        +{tagChips.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Note options: ${note.title || MESSAGES.UNTITLED_NOTE}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                <NoteMenuEntries
                  {...menuHandlers}
                  Item={DropdownMenuItem}
                  Separator={DropdownMenuSeparator}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent onClick={(e) => e.stopPropagation()}>
          <NoteMenuEntries
            {...menuHandlers}
            Item={ContextMenuItem}
            Separator={ContextMenuSeparator}
          />
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);
