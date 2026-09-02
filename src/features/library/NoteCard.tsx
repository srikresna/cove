import { FileText, MoreHorizontal, Star } from "lucide-react";
import type React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import { cn } from "../../lib/utils";
import { resolvePropertyIcon } from "../editor/PropertyValueEditors";
import { NoteMenuEntries, stackValueText } from "../sidebar/NoteItem";
import { TagChip } from "../tags/TagChip";

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  /** The optional event carries ctrl/meta/shift for Library multi-select. */
  onSelect: (id: string, event?: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  /** Stack chips shown in the card footer (already filtered by visibility). */
  stackRows: Array<{ def: PropertyDefinition; value: PropertyValue }>;
  /** Tag chips after the stack chips (Library display option). */
  tagChips?: Array<{ name: string; color: string }>;
  /** Masonry cards size to content; grid cards keep a uniform min-height. */
  variant: "grid" | "masonry";
}

const relativeDay = (ts: number): string => {
  const now = new Date();
  const then = new Date(ts);
  const days = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()) /
      86400000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

/**
 * A rounded-12 padded card with icon + title header, hover-revealed quick
 * actions, meta line and property stack chips. Grid keeps cards uniform;
 * masonry lets content set the height.
 */
export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isActive,
  onSelect,
  onTogglePin,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  stackRows,
  tagChips = [],
  variant,
}) => {
  const chips = stackRows
    .map((row) => ({ ...row, text: stackValueText(row.def, row.value) }))
    .filter((row): row is { def: PropertyDefinition; value: PropertyValue; text: string } =>
      Boolean(row.text),
    )
    .slice(0, 3);

  return (
    // biome-ignore lint/a11y/useSemanticElements: card body must be a div (block children inside a button are invalid HTML); keyboard access stays via role+tabIndex
    <div
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
        "group/card flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-4 text-left outline-none transition-[box-shadow,border-color] focus-visible:ring-2 focus-visible:ring-ring",
        variant === "masonry" && "mb-6 break-inside-avoid",
        // Cards render outside the virtualizer; skip offscreen painting cost.
        "[content-visibility:auto] [contain-intrinsic-size:auto_240px]",
        isActive
          ? "border-primary/40 shadow-[0_0_0_1px_var(--ring),0_4px_6px_rgba(0,0,0,0.1)]"
          : "hover:border-foreground/20 hover:shadow-[0_4px_6px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center text-2xl"
          aria-hidden="true"
        >
          {note.icon || <FileText className="h-5 w-5 text-muted-foreground" />}
        </span>
        <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-foreground">
          {note.title || MESSAGES.UNTITLED_NOTE}
        </span>
        <button
          type="button"
          aria-label={note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(note.id);
          }}
          className={cn(
            "shrink-0 rounded-md p-1 text-muted-foreground transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            note.isFavorite ? "text-warm opacity-100" : "opacity-0 group-hover/card:opacity-100",
          )}
        >
          <Star className={cn("h-4 w-4", note.isFavorite && "fill-current")} aria-hidden="true" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Note options: ${note.title || MESSAGES.UNTITLED_NOTE}`}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover/card:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <NoteMenuEntries
              note={note}
              onTogglePin={onTogglePin}
              onToggleFavorite={onToggleFavorite}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              Item={DropdownMenuItem}
              Separator={DropdownMenuSeparator}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 text-xs leading-5 text-muted-foreground">
        {relativeDay(note.updatedAt)}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((row) => (
            <span
              key={row.def.id}
              className="inline-flex h-6 min-w-12 max-w-32 items-center gap-1 rounded-full border bg-card px-2 text-xs text-foreground"
              title={`${row.def.name}: ${row.text}`}
            >
              <span
                aria-hidden="true"
                className="shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5 [&_svg]:text-muted-foreground"
              >
                {resolvePropertyIcon(row.def)}
              </span>
              <span className="truncate">{row.text}</span>
            </span>
          ))}
        </div>
      )}

      {tagChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tagChips.slice(0, 3).map((chip) => (
            <TagChip key={chip.name} name={chip.name} color={chip.color} />
          ))}
          {tagChips.length > 3 && (
            <span className="text-xs text-muted-foreground/60">+{tagChips.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};
