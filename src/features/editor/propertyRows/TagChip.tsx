import { X } from "lucide-react";
import type React from "react";
import type { Tag } from "../../../domain/tag/Tag";

export const TagChip: React.FC<{ tag: Tag; onRemove?: () => void }> = ({ tag, onRemove }) => (
  <span className="group/tag inline-flex h-[22px] max-w-32 items-center gap-1 rounded-[10px] border bg-card px-2 text-sm text-foreground">
    <span
      aria-hidden="true"
      className="h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: tag.color }}
    />
    <span className="truncate">{tag.name}</span>
    {onRemove && (
      <button
        type="button"
        aria-label={`Remove tag ${tag.name}`}
        onClick={onRemove}
        className="shrink-0 rounded-full p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/tag:opacity-100"
      >
        <X className="h-2.5 w-2.5" aria-hidden="true" />
      </button>
    )}
  </span>
);
