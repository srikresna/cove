import type React from "react";
import { PropertyCheckbox } from "../../../components/ui/PropertyCheckbox";
import { MESSAGES } from "../../../constants/messages";
import type { Note } from "../../../domain/note/Note";
import { cn } from "../../../lib/utils";
import { noteActions } from "../../../store/noteActions";

/** A small fixed-width segmented control. */
const SegmentedValue: React.FC<{
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}> = ({ options, value, onChange, ariaLabel }) => (
  <div
    className="inline-flex items-center gap-1 rounded-lg bg-muted/60 p-0.5"
    style={{ width: 194 }}
    role="radiogroup"
    aria-label={ariaLabel}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-5 min-w-0 flex-1 rounded-[6px] px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span className="truncate">{option.label}</span>
        </button>
      );
    })}
  </div>
);

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
