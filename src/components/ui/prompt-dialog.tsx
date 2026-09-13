import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";

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
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (trimmed && !busy) onConfirm(trimmed);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="max-w-sm" hideClose>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            {label && <Label htmlFor="prompt-dialog-input">{label}</Label>}
            <Input
              id="prompt-dialog-input"
              autoFocus
              value={value}
              placeholder={placeholder}
              aria-invalid={Boolean(error)}
              onChange={(e) => setValue(e.target.value)}
            />
            {error && <p className="text-[13px] text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={onCancel}>
              {MESSAGES.CANCEL}
            </Button>
            <Button type="submit" disabled={!trimmed || busy}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
