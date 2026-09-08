import { X } from "lucide-react";
import type React from "react";
import { cn } from "../../lib/utils";

export const TagChip: React.FC<{
  name: string;
  color: string;
  size?: "md" | "sm";
  onRemove?: () => void;
  onClick?: () => void;
  title?: string;
  className?: string;
}> = ({ name, color, size = "md", onRemove, onClick, title, className }) => {
  const interactive = onClick !== undefined;
  const chip = (
    <>
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className={cn("min-w-0 truncate leading-4", size === "md" ? "max-w-40" : "max-w-28")}>
        {name}
      </span>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove tag ${name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </>
  );

  const base = cn(
    "inline-flex items-center gap-1 rounded-full border border-border bg-card text-foreground",
    size === "md" ? "h-6 px-2 text-[13px]" : "h-5 px-1.5 text-[11px]",
    interactive &&
      "cursor-pointer transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className,
  );

  if (interactive) {
    return (
      <button type="button" onClick={onClick} title={title ?? name} className={base}>
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className={cn("min-w-0 truncate leading-4", size === "md" ? "max-w-40" : "max-w-28")}>
          {name}
        </span>
      </button>
    );
  }
  return (
    <span title={title ?? name} className={base}>
      {chip}
    </span>
  );
};
