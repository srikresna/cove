import * as Dialog from "@radix-ui/react-dialog";
import { KeyRound, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useVaultStore } from "../../store/useVaultStore";

interface ChangePassphraseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangePassphraseDialog: React.FC<ChangePassphraseDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const changePassphrase = useVaultStore((s) => s.changePassphrase);
  const pushToast = useNotificationStore((s) => s.pushToast);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError(MESSAGES.VAULT_SET_MISMATCH);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await changePassphrase(current, next);
      pushToast({ kind: "success", title: MESSAGES.CHANGE_PASS_SUCCESS_TITLE });
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change passphrase.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "w-full rounded-[12px] border-[1.5px] border-charcoal bg-dew-drop px-4 py-2.5 text-sm font-semibold text-cocoa-ink outline-none focus:border-marker-orange";
  const label = "mb-1 block text-[10px] font-bold uppercase tracking-wider text-marker-orange";

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-cream-paper rounded-[16px] border-[1.5px] border-charcoal shadow-card-subtle p-6 space-y-4 outline-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-marker-orange" aria-hidden="true" />
              <Dialog.Title className="text-lg font-extrabold text-cocoa-ink">
                {MESSAGES.CHANGE_PASS_TITLE}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={MESSAGES.CANCEL}
                className="p-1.5 rounded-[12px] text-charcoal hover:bg-dew-drop outline-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-xs leading-relaxed text-slate-500">
            {MESSAGES.CHANGE_PASS_DESC}
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className={label}>{MESSAGES.VAULT_CURRENT_PASSPHRASE_LABEL}</span>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                className={field}
              />
            </label>
            <label className="block">
              <span className={label}>{MESSAGES.VAULT_NEW_PASSPHRASE_LABEL}</span>
              <input
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
                className={field}
              />
            </label>
            <label className="block">
              <span className={label}>{MESSAGES.VAULT_CONFIRM_LABEL}</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={field}
              />
            </label>

            {error && (
              <p role="alert" className="text-xs font-semibold text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || current.length === 0 || next.length === 0}
              className="w-full rounded-[20px] border-[1.5px] border-charcoal bg-cream-paper py-2.5 text-xs font-bold text-cocoa-ink shadow-paper-lift transition-transform hover:scale-105 disabled:opacity-50"
            >
              {busy ? "…" : MESSAGES.CHANGE_PASS_BUTTON}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
