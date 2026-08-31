import { KeyRound } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
            <DialogTitle>{MESSAGES.CHANGE_PASS_TITLE}</DialogTitle>
          </div>
          <DialogDescription>{MESSAGES.CHANGE_PASS_DESC}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="change-pass-current">{MESSAGES.VAULT_CURRENT_PASSPHRASE_LABEL}</Label>
            <Input
              id="change-pass-current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="change-pass-next">{MESSAGES.VAULT_NEW_PASSPHRASE_LABEL}</Label>
            <Input
              id="change-pass-next"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="change-pass-confirm">{MESSAGES.VAULT_CONFIRM_LABEL}</Label>
            <Input
              id="change-pass-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={busy || current.length === 0 || next.length === 0}
          >
            {busy ? "…" : MESSAGES.CHANGE_PASS_BUTTON}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
