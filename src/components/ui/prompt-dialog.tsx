import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./dialog";
import { Input } from "./input";

/**
 * The canonical window.prompt replacement for naming flows (save-as-
 * collection, rename). Confirm is disabled while the required input is
 * empty; Enter commits, Escape/outside cancels. The label row is optional
 * (the title plus placeholder usually carry the labeling); `error` renders
 * inline instead of the caller closing and toasting.
 */
export const PromptDialog: React.FC<{
  open: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  description?: string;
  confirmLabel: string;
  initialValue?: string;
  /** Shown inline under the input; the caller keeps the dialog open. */
  error?: string | null;
  /** Disables confirm while an async save is in flight (no double submit). */
  busy?: boolean;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}> = ({
  open,
  title,
  label,
  placeholder,
  description,
  confirmLabel,
  initialValue,
  error,
  busy,
  onConfirm,
  onCancel,
}) => {
  const [value, setValue] = useState(initialValue ?? "");

  // Reset whenever the dialog opens so stale text never leaks between uses.
  useEffect(() => {
    if (open) setValue(initialValue ?? "");
  }, [open, initialValue]);

  const trimmed = value.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-sm" hideClose>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}

        <div className="flex flex-col gap-2 pt-1">
          {label && (
            <label
              className="text-sm leading-[22px] text-muted-foreground"
              htmlFor="prompt-dialog-input"
            >
              {label}
            </label>
          )}
          <Input
            id="prompt-dialog-input"
            autoFocus
            value={value}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && trimmed && !busy) {
                e.preventDefault();
                onConfirm(trimmed);
              }
            }}
          />
          {error && <p className="text-[13px] text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            {MESSAGES.CANCEL}
          </Button>
          <Button disabled={!trimmed || busy} onClick={() => onConfirm(trimmed)}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
