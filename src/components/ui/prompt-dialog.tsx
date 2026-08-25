import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog";
import { Input } from "./input";

/**
 * AFFI NE PromptModal pattern: the canonical window.prompt replacement for
 * naming flows (save-as-collection, rename). Confirm is disabled while the
 * required input is empty; Enter commits, Escape/outside cancels.
 */
export const PromptDialog: React.FC<{
  open: boolean;
  title: string;
  label: string;
  placeholder?: string;
  description?: string;
  confirmLabel: string;
  initialValue?: string;
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
      <DialogContent className="sm:max-w-[480px]" hideClose>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}

        <div className="flex flex-col gap-2 pt-1">
          <label
            className="text-sm leading-[22px] text-muted-foreground"
            htmlFor="prompt-dialog-input"
          >
            {label}
          </label>
          <Input
            id="prompt-dialog-input"
            autoFocus
            value={value}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && trimmed) {
                e.preventDefault();
                onConfirm(trimmed);
              }
            }}
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            {MESSAGES.CANCEL}
          </Button>
          <Button disabled={!trimmed} onClick={() => onConfirm(trimmed)}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
