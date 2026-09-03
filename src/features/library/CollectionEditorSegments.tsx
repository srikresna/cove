import type React from "react";
import { cn } from "../../lib/utils";

/** Text segmented control for the collection editor's left pane switch,
 *  with the roving-tabindex tabs keyboard contract. */
export const TextSegmentedControl: React.FC<{
  value: string;
  onChange: (next: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}> = ({ value, onChange, options }) => {
  const moveFocus = (fromIndex: number, delta: number) => {
    const count = options.length;
    const option = options[(fromIndex + delta + count) % count];
    if (!option) return;
    onChange(option.value);
    document.getElementById(`cove-segment-${option.value}`)?.focus();
  };

  return (
    <div className="inline-flex w-fit rounded-md bg-muted p-0.5" role="tablist">
      {options.map((option, index) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            id={`cove-segment-${option.value}`}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                moveFocus(index, 1);
              } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                moveFocus(index, -1);
              }
            }}
            className={cn(
              "h-7 rounded-md px-3 text-[13px] font-medium leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
