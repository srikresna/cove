import type { LucideIcon } from "lucide-react";
import type React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { cn } from "../../lib/utils";

export interface SegmentedIconItem<T extends string> {
  value: T;
  label: string;
  icon: LucideIcon;
}

const segmentId = (value: string): string => `cove-segment-${value}`;

/**
 * A joined pill of icon segments — the AFFiNE-style segmented control used
 * by the doc-mode switch and the right-bar tab strip. Buttons size to a
 * 40px bar; the active segment lifts onto the card surface.
 *
 * `toggle` models a mutually exclusive mode switch (role=group,
 * aria-pressed). `tabs` models one-selection-of-many panel content
 * (role=tablist/tab, aria-selected, roving arrow keys with automatic
 * activation).
 */
export function SegmentedIconGroup<T extends string>({
  items,
  value,
  onChange,
  className,
  variant = "toggle",
  "aria-label": ariaLabel,
}: {
  items: ReadonlyArray<SegmentedIconItem<T>>;
  value: T;
  onChange: (next: T) => void;
  className?: string;
  variant?: "toggle" | "tabs";
  "aria-label"?: string;
}): React.ReactNode {
  const isTabs = variant === "tabs";
  // Roving focus with automatic activation: arrows select as they move,
  // the standard compact tab-strip behavior.
  const moveFocus = (fromValue: T, delta: number) => {
    const count = items.length;
    const index = items.findIndex((i) => i.value === fromValue);
    const item = items[(index + delta + count) % count];
    if (!item) return;
    onChange(item.value);
    document.getElementById(segmentId(item.value))?.focus();
  };

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label is valid on both group and tablist; the rule cannot evaluate the conditional role
    <div
      role={isTabs ? "tablist" : "group"}
      aria-label={ariaLabel}
      className={cn(
        "flex flex-shrink-0 items-center gap-0.5 rounded-lg border bg-muted/60 p-0.5",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <Tooltip key={item.value}>
            <TooltipTrigger asChild>
              <button
                {...(isTabs
                  ? {
                      role: "tab",
                      id: segmentId(item.value),
                      "aria-selected": active,
                      tabIndex: active ? 0 : -1,
                    }
                  : { "aria-pressed": active })}
                type="button"
                aria-label={item.label}
                onClick={() => onChange(item.value)}
                onKeyDown={(e) => {
                  if (!isTabs) return;
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    moveFocus(item.value, 1);
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    moveFocus(item.value, -1);
                  }
                }}
                className={cn(
                  "flex h-6 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
