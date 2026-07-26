import * as Dialog from "@radix-ui/react-dialog";
import type React from "react";
import { MESSAGES } from "../../constants/messages";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) => (
  <Dialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
      <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-cream-paper rounded-[16px] border-[1.5px] border-charcoal shadow-card-subtle p-6 space-y-4 outline-none">
        <Dialog.Title className="text-lg font-extrabold text-cocoa-ink">{title}</Dialog.Title>
        <Dialog.Description className="text-xs leading-relaxed text-slate-500">
          {description}
        </Dialog.Description>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-[20px] text-xs font-bold text-charcoal hover:bg-dew-drop disabled:opacity-50"
          >
            {MESSAGES.CANCEL}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-5 py-2 rounded-[20px] border-[1.5px] border-charcoal text-xs font-bold shadow-paper-lift hover:scale-105 transition-transform disabled:opacity-50 ${
              danger ? "bg-red-50 text-red-700" : "bg-cream-paper text-cocoa-ink"
            }`}
          >
            {busy ? "…" : confirmLabel}
          </button>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
