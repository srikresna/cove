import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { cn } from "../../lib/utils";

/**
 * A collapsible sidebar section: a switch-role header row (chevron + label +
 * optional count) with an isolated action slot, and unmount-when-collapsed
 * content. Open/closed persists per storage key.
 */
export const CollapsibleSection: React.FC<{
  storageKey: string;
  label: string;
  count?: number;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ storageKey, label, count, action, defaultOpen = true, className, children }) => {
  const [isOpen, setIsOpen] = useState(() =>
    localStorage.getItem(storageKey) === null
      ? defaultOpen
      : localStorage.getItem(storageKey) !== "false",
  );

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(storageKey, String(next));
  };

  return (
    <div className={cn("space-y-1 pb-2", className)}>
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={isOpen}
          onClick={toggle}
          className="flex min-w-0 flex-1 items-center gap-1 rounded px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate leading-4">{label}</span>
          {count !== undefined && <span className="font-mono leading-4">({count})</span>}
        </button>
        {action != null && (
          // biome-ignore lint/a11y/noStaticElementInteractions: swallows the row click so the inner action button handles it
          <div
            className="flex shrink-0 items-center"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            {action}
          </div>
        )}
      </div>

      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
};
