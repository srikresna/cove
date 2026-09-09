import type React from "react";
import { PropertyCheckbox } from "../../../components/ui/PropertyCheckbox";
import { MESSAGES } from "../../../constants/messages";
import type { Note } from "../../../domain/note/Note";
import { cn } from "../../../lib/utils";
import { noteActions } from "../../../store/noteActions";

const SegmentedValue: React.FC<{
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => {
  const activeIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  return (
    <div
      className="relative inline-flex items-center gap-1 rounded-lg bg-muted/60 p-0.5"
      style={{ width: 194 }}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0.5 left-0.5 rounded-[6px] bg-background shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - ${(0.25 + (options.length - 1) * 0.25).toFixed(2)}rem) / ${options.length})`,
          transform: `translateX(calc(${activeIndex} * (100% + 0.25rem)))`,
        }}
      />
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative h-5 min-w-0 flex-1 rounded-[6px] px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const DOC_MODE_OPTIONS = [
  { value: "page", label: "Page" },
  { value: "edgeless", label: "Edgeless" },
] as const;

const PAGE_WIDTH_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "fullWidth", label: "Full width" },
] as const;

const EDGELESS_THEME_OPTIONS = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

export const DocModeValue: React.FC<{ note: Note }> = ({ note }) => {
  const updateNote = noteActions.updateNote;
  return (
    <SegmentedValue
      options={DOC_MODE_OPTIONS.map((o) => ({ ...o }))}
      value={note.docMode ?? "page"}
      onChange={(next) =>
        void updateNote(note.id, { docMode: next === "edgeless" ? "edgeless" : "page" })
      }
      ariaLabel="Doc mode"
    />
  );
};

export const PageWidthValue: React.FC<{ note: Note }> = ({ note }) => {
  const updateNote = noteActions.updateNote;
  return (
    <SegmentedValue
      options={PAGE_WIDTH_OPTIONS.map((o) => ({ ...o }))}
      value={note.pageWidth ?? "standard"}
      onChange={(next) =>
        void updateNote(note.id, { pageWidth: next === "fullWidth" ? "fullWidth" : "standard" })
      }
      ariaLabel="Page width"
    />
  );
};

export const EdgelessThemeValue: React.FC<{ note: Note }> = ({ note }) => {
  const updateNote = noteActions.updateNote;
  return (
    <SegmentedValue
      options={EDGELESS_THEME_OPTIONS.map((o) => ({ ...o }))}
      value={note.edgelessTheme ?? "system"}
      onChange={(next) =>
        void updateNote(note.id, {
          edgelessTheme: next === "light" || next === "dark" ? next : "system",
        })
      }
      ariaLabel="Edgeless theme"
    />
  );
};

export const TemplateValue: React.FC<{ note: Note }> = ({ note }) => {
  const updateNote = noteActions.updateNote;
  return (
    <PropertyCheckbox
      checked={note.isTemplate === true}
      onChange={(next) => void updateNote(note.id, { isTemplate: next })}
      ariaLabel={MESSAGES.TEMPLATE_TOGGLE}
      className="w-full py-[2px]"
    />
  );
};
