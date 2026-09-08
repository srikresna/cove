import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./dialog";
import { Input } from "./input";

export const PromptDialog: React.FC<{
  open: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  description?: string;
  confirmLabel: string;
  initialValue?: string;
  error?: string | null;
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
